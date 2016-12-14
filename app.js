
/**
 * Module dependencies.
 */

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = require('url'),

http = require('http'),

qs = require('querystring');

var url = 'mongodb://localhost:27017/meeting_notes';

http.createServer(function (req, res) {
    if(req.method=='POST') {
            var body='';
            req.on('data', function (data) {
                body +=data;
            });
            req.on('end',function(){
            	var result = parseAI(body)
            	insertAItoDB(result);
            	res.end(JSON.stringify(result));
            });
    }
    else if(req.method=='GET') {
    	res.end(JSON.stringify(readAllAI()));
    }

}).listen(8080);

function parseAI(body) {
	var lines = body.split("\n");
	var arr = [];
	var meeting = '';
	for(var i=0; i< lines.length; i++) {
		var line = lines[i];
		if(line.startsWith("#meeting")){
			meeting = line.substring(9, line.length);
			continue;
		}
		if(line.startsWith("#AI") || line.endsWith("#AI")) {
			if(line.indexOf("@")!=-1){
			    var user='';
				var description = '';
				var dueDate =''
		    	var tokens = line.split(" ");
				var userFound = false;
				var dueFound = false;;
				for (var x=0; x < tokens.length; x++) {
					var token = tokens[x];
					if(token == "#AI") {
						continue;
					}
					if(token.startsWith("@")) {
						user=token;
						userFound = true;
						continue;
					}
					if(token == "due" || token == "by") {
						dueFound = true;
						continue;
					}
					if(userFound && !dueFound) {
						description += token; 
						description +=" ";
						continue;
					}
					dueDate = token;
				}
		    	var record = {"user" : user, "meeting" : meeting, "description" : description, "duedate" : parseDate(dueDate)}
		    	arr.push(record);
			}
		}
	}
	return arr;	
}

function parseDate(input) {
	var tokens = '';
	var delemitter='/';
	var dateString = '';
	var dueDate='';
    if(input.indexOf("-")!=-1){
		delemitter = "-";
	}
	tokens = input.split(delemitter);
	var today =  new Date();
	if(tokens.length < 3) {
		dateString = today.getFullYear()+delemitter+input+' 23:12:00';
		//dueDate = new Date(today.getFullYear(), tokens[0]-1, tokens[1], '23:12:00');
		dueDate = new Date(Date.parse(dateString))
		
	}
	if(dueDate < today) {
		dueDate.setFullYear(today.getFullYear() + 1)
	}
	return dueDate;
}

function insertAItoDB(list) {
	MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  db.collection('action_items').insert(list, function(err, result) {
			   assert.equal(err, null);
			   console.log("Inserted a document into the notes collection.");
		       db.close();
		  });

	});
}

function readAllAI() {
	var allAI=[];
	MongoClient.connect(url, function(err, db) {
		  assert.equal(null, err);
		  var cursor = db.collection('action_items').find({});
		  cursor.each(function(err, doc) {
		      if (doc != null) {
		    	  allAI.push(doc);
		      } else {
		    	  db.close();
		      }
		   });
	});
	return allAI;
}