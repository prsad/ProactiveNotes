# ProactiveNotes
This application takes in meeting notes with some specific annotation to denote Action Items, Actors( people who own the AIs) and due dates if any. The application parses these notes and splices the notes to aggregate AIs per Actor. Each Actor can register themselves, to see the AIs on their queue and receive any updaate as and when a new note is uploaded. 

A sample of such meeting notes is 
> <dl> #meeting Sync up 12 Dec 2016 </dl>
> <dl> #AI @Alice check with PDIT on  due 12/19 </dl>
> <dl> @Bob to reset all lab machine by 12/15 #AI </dl>
> <dl> #AI @Bob follow up with Claire on JIRA updates </dl>
> <dl> #AI Derek to send email to team due 12/16 </dl>

An actor can register themselves to get AIs in their queue and any newly added AIs by registering themselves to server using url:
<dl>"http://server-name:server-port/?actor=actor-name" </dl>
For example: http://104.198.19.99:8080/?actor=Bob

## TODOs
* Ability to mark an AI closed/done/resolved
* Ability to have interested people watching specific AIs
* Prettier and more user friendly interface
* Reminder notifications

## Under the covers
* The server is in node.js and used etcd as a key value store, and to provide notifcations to specific watches set of some keys.
* The Application is deployed to GCP 
* Uses Google Container Engine and is deployed as a multi-container Pod deployment exposed via an LB to the external world. 
* In a future version we could consider Pod with one container each.
