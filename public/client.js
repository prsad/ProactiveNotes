//define required dependencies
var duplexEmitter = require('duplex-emitter');
var reconnect = require('reconnect');

//get hold of html "result" element
//it will be used to push data to html page
var result = document.getElementById('result');

//create a reconnectine stream
var stream = reconnect(function(stream) {
  console.log('connected');

  //create a duplex event emitter to server
  var server = duplexEmitter(stream);

  //get hold of actor name passed in query string and pass it down to server
  var actorName =  getParameterByName('actor');
  if(!actorName){
    console.log("Actor name not found in query string");
    actorName = 'kshitiz';
  }
  server.emit('actor', actorName);

  //whenever a new AI is notified, display it in html page
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
}).connect('/websocket');

//function to retrieve query param from url
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