'use strict';

var os = require('os');


const express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//test
var fs = require('fs')
//소켓세팅
app.set('port', (process.env.PORT || 3000));
//맨처음에 서버 연결하면 몇번포트에 서버 연결되어있는지 ㅇㅇ
http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  //안드로이드 서버에 로그보내는 부분임


  socket.on('message', function(message) {
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);  
});

  socket.on('create or join', function(room) {

    var numClients = io.sockets.sockets.length;      

    if (numClients%2 === 1) {
      socket.join(room);
      socket.emit('created', room, socket.id);

    } else if (numClients%2 === 0) {
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max 5 clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
     
});

});
