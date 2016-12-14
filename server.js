var duplexEmitter = require('duplex-emitter');
var shoe = require('shoe');
var express = require('express')
var app = express()
var Etcd = require('node-etcd');
var etcd = new Etcd("127.0.0.1:2379");
const uuidV4 = require('uuid/v4');

var sock = shoe(function (stream) {
    var client = duplexEmitter(stream);
    var watcher;
    var streamActorName;

    client.on('actor', function (actorName) {
        streamActorName = actorName;
        console.log('Listening for AIs for actor ' + actorName);
        etcd.get("/actors/" + actorName, { recursive: true }, callbackGet);
        watcher = etcd.watcher("/actors/" + actorName, null, {recursive: true});
        watcher.on("change", callback);
    });

    function callbackGet(err, res) {
        res.node.nodes.forEach(function (item) {
            console.log("Sending AI", item.value);
            client.emit("newAI", item.value);
        });
    }

    function callback(err, res) {
        console.log("Received AI : " + err.node.value);
        client.emit("newAI", err.node.value);
    }

    stream.on('end', function () {
        if (watcher) {
            console.log("Stopping watch for actor " + streamActorName);
            watcher.stop();
        }
    });

    stream.on('close', function () {
        if (watcher) {
            console.log("Stopping watch for actor " + streamActorName);
            watcher.stop();
        }
    });

});


app.post('/upload', function (req, res) {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var result = parseAI(body)
        saveMinutes(result, body);
        res.end(JSON.stringify(result));
    });
});

var ecstatic = require('ecstatic')({root: __dirname + '/browser', handleError: false});
app.use(ecstatic);

var server = require('http').createServer(app);
server.listen(8080, function () {
    console.log('Server listening');
});

sock.install(server, '/websocket')

function parseAI(body) {
    var lines = body.split("\n");
    var meeting = {};
    var arr = [];
    var meetDes = '';
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.startsWith("#meeting")) {
            meetDes = line.substring(9, line.length);
            continue;
        }
        if (line.startsWith("#AI") || line.endsWith("#AI")) {
            if (line.indexOf("@") != -1) {
                var actor = '';
                var description = '';
                var dueDate = ''
                var tokens = line.split(" ");
                var userFound = false;
                var dueFound = false;
                ;
                for (var x = 0; x < tokens.length; x++) {
                    var token = tokens[x];
                    if (token == "#AI") {
                        continue;
                    }
                    if (token.startsWith("@")) {
                        actor = token.substring(1);
                        userFound = true;
                        continue;
                    }
                    if (token == "due" || token == "by") {
                        dueFound = true;
                        continue;
                    }
                    if (userFound && !dueFound) {
                        description += token;
                        description += " ";
                        continue;
                    }
                    dueDate = token;
                }
                var record = {"actor": actor, "description": description, "duedate": parseDate(dueDate)}
                arr.push(record);
            }
            meeting.AIs = arr;
        }
    }
    return meeting;
}

function parseDate(input) {
    var tokens = '';
    var delemitter = '/';
    var dateString = '';
    var dueDate = '';
    if (input.indexOf("-") != -1) {
        delemitter = "-";
    }
    tokens = input.split(delemitter);
    var today = new Date();
    if (tokens.length < 3) {
        dateString = today.getFullYear() + delemitter + input + ' 23:12:00';
        //dueDate = new Date(today.getFullYear(), tokens[0]-1, tokens[1], '23:12:00');
        dueDate = new Date(Date.parse(dateString))

    }
    if (dueDate < today) {
        dueDate.setFullYear(today.getFullYear() + 1)
    }
    return dueDate;
}


function saveMinutes(input, body) {
    var meeting = input;
    var meetingUUID = uuidV4();
    etcd.set('/meetings/' + meetingUUID, body);
    meeting.AIs.forEach(function (item) {
        var aiUUID = uuidV4();
        item.meetingId = meetingUUID;
        item.id = aiUUID;
        etcd.set('/actors/' + item.actor + "/" + aiUUID, JSON.stringify(item));
        console.log(aiUUID + " added");
    })

}