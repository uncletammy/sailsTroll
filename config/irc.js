var _ = require('lodash');

// var processMessages = _.each(messages, function(oneMessage){
// 	var userID = oneMessage.sender;

// 	var getSender = _.find(users,{id:userID});

// 	// get links in message text
// 	var linksFound = oneMessage.text.match(/(https{0,1}:\/\/[:?=#!.\w\d\/_-]+)/ig)
// 	var mappedLinks = _.map(linksFound,function(oneLink){
// 		var ensureUniqueLink = _.find(linksToSave,{linktext:oneLink})
// 		// check that we havnt already pushed the link to our array.  If so, just add
// 		// add the relevent info to it.  Otherwise, parse it and push it to our array
// 		if (ensureUniqueLink){
// 			// console.log(oneLink,'has already been posted by',ensureUniqueLink.postedby);
// 			linksToSave = _.without(linksToSave,ensureUniqueLink);
// 			modifiedLink = ensureUniqueLink;
// 			modifiedLink.postedby.push(getSender.lcnick);
// 			modifiedLink.postedby = _.unique(modifiedLink.postedby);
// 			modifiedLink.postedin.push(oneMessage['_id']['$oid']);
// 		} else {
// 			var indexOfLinkStart = oneLink.indexOf('://');
// 			// Chop off protocol and split at '/'
// 			var splitLinkPath = oneLink.split(/https{0,1}:\/\//i)[1].split('/');
// 			if (splitLinkPath.length)
// 				getLinkDomain = splitLinkPath[0];
// 			else
// 				getLinkDomain = splitLinkPath.join('');

// 			// console.log('Link Domain:',getLinkDomain)
// 			var modifiedLink = {
// 				linktext:oneLink,
// 				domain:getLinkDomain,
// 				postedby:[getSender.lcnick],
// 				postedin:[oneMessage['_id']['$oid']]
// 			};			
// 		}
// 		return modifiedLink
// 	})


// 	linksToSave = linksToSave.concat(mappedLinks);
// 	// Get other users mentioned in message text
// 	var getMessageWords = _.unique(oneMessage.text.toLowerCase().replace(/[^\w ]/ig,'').split(' '));
// 	var userMentions = _.intersection(getMessageWords,_.pluck(users,'lcnick'));
// 	var filterMentions = _.filter(userMentions,function(thisMention){
// 		return thisMention.length >= 4
// 	})
// 	oneMessage.usermentions = filterMentions;
// 	oneMessage.sender = getSender.lcnick;

// 	return oneMessage
// });

  	// text: 'STRING',
  	// // No two users will post the exact same message (with the same IDs)
  	// sender:{
  	// 	model: 'user'
  	// },
   //  channel: {
   //    model: 'channel'
   //  },
   //  links:{
   //    collection: 'link',
   //    via: 'postedin',
   //    dominant:false
   //  },
   //  usermentions:{
   //    collection: 'user',
   //    via: 'mentionedin',
   //    dominant:true
   //  }





var onIRCMessage = function(from, to, message){

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

	// console.log('Sails is undefined:',_.isUndefined(sails))
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

