var duplexEmitter = require('duplex-emitter');
var shoe = require('shoe');

var sock = shoe(function (stream) {
    var client = duplexEmitter(stream);
    var Etcd = require('node-etcd');
    var etcd = new Etcd("127.0.0.1:2379");
    var watcher;
    var streamActorName;

    client.on('actor', function (actorName) {
        streamActorName = actorName;
        console.log('Listening for AIs for actor ' + actorName);
        watcher = etcd.watcher("/actors/" + actorName, null, {recursive: true});
        watcher.on("change", callback);
    });

    function callback(err, res) {
        console.log("Received AI : " + err.node.value);
        client.emit("newAI", err.node.value);
    }

    stream.on('end', function() {
        if(watcher) {
            console.log("Stopping watch for actor " + streamActorName);
            watcher.stop();
        }
    });

    stream.on('close', function() {
        if(watcher) {
            console.log("Stopping watch for actor " + streamActorName);
            watcher.stop();
        }
    });

});

var ecstatic = require('ecstatic')(__dirname + '/browser');
var server = require('http').createServer(ecstatic);

server.listen(8080, function () {
    console.log('Server listening');
});

sock.install(server, '/websocket')