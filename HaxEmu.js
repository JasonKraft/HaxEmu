var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	options = {
		"port" : 3000
	},
	players = [];
server.listen(options.port);
io.set('log level', 1);
app.configure(function(){
  app.use(express.static(__dirname + '/'));
});

// app.get('/', function (request, response) {
// 	response.sendfile('index.html');
// });

io.sockets.on('connection', function (socket) {
	console.log("connnect");
	var player = {id: "player" + players.length, xPos : 50, yPos : 50, kicking: false};
	players.push(player);
	socket.player = players[players.indexOf(player)];
	socket.broadcast.emit('addplayer', players[players.indexOf(player)]);
	for(var i = 0; i < players.length; i++)
	{
		socket.emit('addplayer', players[i]);
	}

	socket.on('disconnect', function () {
		console.log("disconnect");
		delete players[players.indexOf(socket.player)];
		io.sockets.emit('delplayer', socket.player);
	});
	// socket.emit("pong",{txt:"Connected to server"});
	socket.on('ping', function (data) {
		//console.log('Ping request: ' + data);
		socket.emit("pong",data);
	});

	function movement () {
		var p = socket.player;
		if (movedata[87]) {
			socket.player.yPos -= 1;
			players[players.indexOf(p)] = socket.player;
		}
		if (movedata[65]) {
			socket.player.xPos -= 1;
			players[players.indexOf(p)] = socket.player;
		}
		if (movedata[83]) {
			socket.player.yPos += 1;
			players[players.indexOf(p)] = socket.player;
		}
		if (movedata[68]) {
			socket.player.xPos += 1;
			players[players.indexOf(p)] = socket.player;
		}

		io.sockets.emit('moveclient', {oldp: p, newp: players[players.indexOf(socket.player)]});
	};
	//var moveinterval = setInterval(movement({87: false, 65:false, 83: false, 68: false}), 10);
	var moveinterval;

	socket.on('move', function (data) {
		switch (data.dir) {
			case 'up':
				var p = socket.player;
				socket.player.yPos -= 10;
				players[players.indexOf(p)] = socket.player;
				io.sockets.emit('moveclient', {oldp: p, newp: players[players.indexOf(p)]});
				break;
			case 'left':
				var p = socket.player;
				socket.player.xPos -= 10;
				players[players.indexOf(p)] = socket.player;
				socket.emit('moveclient', {oldp: p, newp: players[players.indexOf(p)]});
				break;
			case 'down':
				var p = socket.player;
				socket.player.yPos += 10;
				players[players.indexOf(p)] = socket.player;
				socket.emit('moveclient', {oldp: p, newp: players[players.indexOf(p)]});
				break;
			case 'right':
				var p = socket.player;
				socket.player.xPos += 10;
				players[players.indexOf(p)] = socket.player;
				socket.emit('moveclient', {oldp: p, newp: players[players.indexOf(p)]});
				break;
		}
	});
	var movedata;
	socket.on('updatemovement', function (data) {
		//clearInterval(moveinterval);
		movedata = data;
		//moveinterval = setInterval(movement, 10);
		movement();
		//setInterval(movement, 10);
	});
});

console.log('Express server listenting on port ' + options.port);