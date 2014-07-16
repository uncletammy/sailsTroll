var local = require('./local.js');

// var onIRCJoin = function(from, to, message){

// 	console.log('')

// };

var speakBot = function(sayToRoom,thingToSay){
	console.log('sailsTroll has been commanded to say',thingToSay,'in room',sayToRoom)
	sails.hooks.irchook.bots.sailsTroll.say(sayToRoom,thingToSay);
};


var doLogin = function(){
	sails.hooks.irchook.bots.sailsTroll.ctcp('NickServ','privmsg','identify '+local.irc.password);
}

var onIRCMessage = function(from, to, message){

	var getMessageWords = message.toLowerCase().replace(/[^\w ]/ig,'').replace(/ {2,}/,'').split(' ');


	if (from.toLowerCase() !== 'sailstroll' && getMessageWords[0] !== 'sailstroll'){
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
	}

	if (getMessageWords[0] === 'sailstroll' && getMessageWords[1] === 'search'){

		var speakURLResults = function(err,urlOfResults){
			if (err){
				return speakBot(to,'Sorry'+from+'. me got big error:'+err);
			}

			return speakBot(to,from+', try this: '+'http://sailstroll-20102.onmodulus.net/search/results/'+urlOfResults);

		}

		getMessageWords.shift();
		getMessageWords.shift();
		Search.doSearch(getMessageWords.join(' '),speakURLResults,true)

	}


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
			registered:doLogin
		}
	} 
};

