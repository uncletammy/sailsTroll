// var _ = require('lodash');

// var onIRCJoin = function(from, to, message){

// 	console.log('')

// };


var onIRCMessage = function(from, to, message){


	// TODO: lookup both 'sender' and 'channel' on their in-memory stores
	// and change the field before it is sent out.

	var messageToSave = {
		sender: from,
		channel: to,
		text: message,
		createdAt: new Date()
	}

	Message.create(messageToSave).exec(function(e,m){
		if (e) return console.log('Oh dear god, no!',e);
		console.log('Create callback fired and',m.id,'saved')
	})

/*
	var theMessage = message.toLowerCase().replace(/[:,!]/g,' ');

	function doesContain(aString){
		if (theMessage.indexOf(aString) >= 0)
			return true;
		else
			return false;
	}

	if (doesContain('sailstroll help') === true){

		var terms = theMessage.split('sailstroll help')[1];
		var searchFor = storeData.getNgrams(storeData.stripAndCut(terms));

		var relevantMessages = {stack:[],irc:[],twitter:[]};

	 	searchFor.forEach(function(v){
	 		function addAsRelevant(err,found){
	 			if (found){
	 				found.forEach(function(v2){relevantMessages[v2.source].push(v2.inMsgID)});
	 			}
	 		}
	 		Phrases.find({words:v}).exec(addAsRelevant);

	 	});

	}
*/
	// S_adapters.speak({
	// 			botName:'sailsTroll',
	// 			channel:'#sailsjs',
	// 			message:'I found these relevant:'+JSON.stringify(relevantMessages)
	// 		},console.log);
};

module.exports.irc = {
	"sailsTroll": {
		events:{
			error:console.log,
			// join:console.log,
			// part:console.log,
			message:onIRCMessage,
			// say:console.log,
			registered:console.log
		}
	} 
};

