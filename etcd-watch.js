/**
 * Created by KSSAXENA on 12/14/16.
 */
var Etcd = require('node-etcd');
var etcd = new Etcd("127.0.0.1:2379");
var watcher = etcd.watcher("/actors/kshitiz", null, {recursive: true});
//watcher.on("change", console.log);
watcher.on("change", callback);
function callback(err, res) {
    console.log(err.node);
//    parseJson(err.node.value);
    //console.log("Return: ", res);
}