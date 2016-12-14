var duplexEmitter = require('duplex-emitter');
var reconnect = require('reconnect');

var result = document.getElementById('result');

var stream = reconnect(function(stream) {
  console.log('connected');
 
  var server = duplexEmitter(stream);
 
  var interval = setInterval(function() {
    server.emit('ping', Date.now());
  }, 1000);
 
  server.on('pong', function(timestamp) {
    result.appendChild(document.createTextNode('got pong from server. ping time is ' +
        (Date.now() - timestamp) + ' ms\n'));
    console.log('got pong from server. ping time is ' + 
     (Date.now() - timestamp) + ' ms');
  });
 
  stream.once('end', function() {
    clearInterval(interval);
  });
}).connect('/websocket');
