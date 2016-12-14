/**
 * Created by KSSAXENA on 12/13/16.
 */
var Etcd = require('node-etcd');
var etcd = new Etcd("127.0.0.1:2379");
etcd.set("/minutes/key5", "value5");
var sleep = require('sleep');
sleep.sleep(10);
etcd.get("/minutes/key5", console.log);