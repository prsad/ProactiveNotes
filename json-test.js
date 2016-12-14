/**
 * Created by KSSAXENA on 12/14/16.
 */
var str = '{\
    "id": "MM-1",\
    "date": "Dec 14 2016",\
    "description" : "Meeting minutes - clouse services",\
    "AIs": [\
    {\
        "actor": "kshitiz",\
        "duedate": "Dec 16, 2016",\
        "description": "Finalize backup and restore design",\
        "watcher": "prasad"\
    },\
    {\
        "actor": "niranjan",\
        "duedate": "Dec 16, 2016",\
        "description": "Finish poc implementation",\
        "watcher": "kshitiz,prasad"\
    },\
    {\
        "actor": "prasad",\
        "duedate": "Dec 16, 2016",\
        "description": "Get status on CaaS project"\
    }\
    ]\
}';
var Etcd = require('node-etcd');
const uuidV4 = require('uuid/v4');
var etcd = new Etcd("127.0.0.1:2379");
var obj = JSON.parse(str);
obj.AIs.forEach(function (item) {
    var uuid = uuidV4();
    etcd.set('/actors/'+item.actor+"/"+uuid, JSON.stringify(item));
    console.log(uuid  + " : \"" + JSON.stringify(item) + "\" added");
})
