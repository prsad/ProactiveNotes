var duplexEmitter = require('duplex-emitter');
var reconnect = require('reconnect');

var result = document.getElementById('result');

var stream = reconnect(function(stream) {
  console.log('connected');
 
  var server = duplexEmitter(stream);
 
  /*var interval = setInterval(function() {
    server.emit('ping', Date.now());
  }, 1000);*/

  var actorName =  getParameterByName('actor');
  if(!actorName){
    console.log("Actor name not found in query string");
    actorName = 'kshitiz';
  }
  server.emit('actor', actorName);

  server.on('newAI', function(data) {
    console.log('New AI from server : ' + data);
    var obj = JSON.parse(data);
    var details = obj.description + "\n";
    if(obj.duedate) {
      details = details + "Due by : " + obj.duedate + "\n";
    }
    if(obj.watcher) {
      details = details + "Watched by : " + obj.watcher + "\n";
    }
    details =  details + "------------------------------------\n";
    result.appendChild(document.createTextNode(details));
  });
 
  stream.once('end', function() {
    clearInterval(interval);
  });
}).connect('/websocket');

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}