
/**
 * Module dependencies.
 */



var url = require('url'),

http = require('http'),

qs = require('querystring');

var Etcd = require('node-etcd');
const uuidV4 = require('uuid-v4');
var etcd = new Etcd("127.0.0.1:2379");
/*var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/meeting_notes';*/

http.createServer(function (req, res) {
    if(req.method=='POST' && req.url.indexOf("/upload")!=-1) {
            var body='';
            req.on('data', function (data) {
                body +=data;
            });
            req.on('end',function(){
            	var result = parseAI(body)
            	saveMinutes(result);
            	res.end(JSON.stringify(result));
            });
    }
    else if(req.method=='GET') {
    	res.end(JSON.stringify(readAllAI()));
    }

}).listen(8080);

function parseAI(body) {
	var lines = body.split("\n");
	var meeting={};
	var arr = [];
	var meetDes = '';
	for(var i=0; i< lines.length; i++) {
		var line = lines[i];
		if(line.startsWith("#meeting")){
			meetDes = line.substring(9, line.length);
			continue;
		}
		if(line.startsWith("#AI") || line.endsWith("#AI")) {
			if(line.indexOf("@")!=-1){
			    var actor='';
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
						actor=token;
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
		    	var record = {"actor" : actor, "description"  : description, "duedate" : parseDate(dueDate)}
		    	arr.push(record);
			}
			meeting.id = "Meeting-" + Math.floor(1000 + Math.random() * 9000)
			meeting.date = "";
			meeting.description = meetDes;
			meeting.AIs = arr;
		}
	}
	return meeting;	
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


function saveMinutes(input) {
	var meeting = input;
	etcd.set('/meetings/'+meeting.id+'/', {"date": meeting.date, "description": meeting.description})
	meeting.AIs.forEach(function (item) {
	    var uuid = uuidV4();
	    item.meetingId = meeting.id;
	    etcd.set('/actors/'+item.actor+"/"+uuid, JSON.stringify(item));
	    console.log('uuid'  + " added");
	})
	
}

/*function findMeetingDate(meeting) {
	var meetingDate ='';
	var tokens = meeting.split(" ");
	for (var i=0; i< tokens.length; i++) {
		var token = tokens[i];
		var date, month, year ='';
		var dateFound, monthFound = false;
		if(token.indexOf("/")!=-1 || token.indexOf("-")!=-1){
			meetingDate = parseDate(token);
			if(meetingDate instanceof Date) {
				return meetingDate;
			}
			if(token > 0 && token <13) {
				date = token;
				dateFound = true;
				continue;
			}
			for(var k=0; k < months.length; k++){
				if(month[k].startsWith(token)){
					month = k + 1;
					monthFound = true;
					break;
				}
			}
			
			
		}
	}
}/*



/*function insertAItoDB(list) {
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
}*/