






var _= require('lodash');

module.exports = {


};



/*
var async = require('async');


module.exports = {
	getTime: function(){
			var t=new Date;
			return t.getTime();
	},
	irc: function(ircMessage,cb){
		var finalCallback = cb;

		var getMessageArray = storeData.stripAndCut(ircMessage.message);

		
		var startTime = storeData.getTime();

		var storeCB = function storeCB(numberSaved){
			var saveST = startTime;
			var getEndTime = storeData.getTime();
			var logProcessingTime = getEndTime - saveST;

			var finalCallback = cb;


			console.log(numberSaved+' IRC nGrams saved. Total Time:'+logProcessingTime+'ms');
			return finalCallback();
		};


		storeData.nGramIt(getMessageArray,'irc',ircMessage.id,storeCB);
	//	return cb(); // Return early so server doesnt get hung up while processing
	},
	tweet: function(tweet,cb){
		console.log('Got new tweet with type '+typeof tweet);

		var nGramTweeter = storeData.stripAndCut(tweet.user_name);
		var nGramTweet = storeData.stripAndCut(storeData.removeCodeTags(tweet.text));

		var gramItAll = nGramTweeter.concat(nGramTweet);

		storeData.nGramIt(gramItAll,'twitter',tweet.id,function runFinalCallback(){
			console.log('Done adding twitter nGrams.  Now exiting service.');
			return cb();
		});
	},
	stackMessage: function stackMessage(question,cb){

		var title = question.title;
		var nGramTitle = storeData.stripAndCut(title);
		var nGramBody = storeData.stripAndCut(storeData.removeCodeTags(question.body));

		var theAnswers = '';
		if (question.answers){
			question.answers.forEach(function(val,index){
				theAnswers += val.body;
				theAnswers += val.title;
			});
		}
		var nGramAnswers = storeData.stripAndCut(storeData.removeCodeTags(theAnswers));

		var gramItAll = nGramAnswers.concat(nGramTitle,nGramBody);

		storeData.nGramIt(gramItAll,'stack',question.id,function runFinalCallback(){
			console.log('Done adding stack nGrams.  Now exiting service.');
			return cb();
		});

	},
	removeCodeTags: function removeCodeTags(somestring){
			return somestring.replace(/<code>[^]+?<\/code>/g,'');
	},
	stripAndCut:  function stripAndCut(message){


		// Strip message of punctuation and split at the spaces.  
		// Return an array of words in the message.

		var getMessage = message.replace(/[.!,](\S{1,}?)/g,' $1');
		getMessage = getMessage.replace(/[^a-zA-Z0-9 ]+/g, '').split(' ');

		var saveThese = [];

		getMessage.forEach(function formatWords(v,i){
			if (v){
				thisWord = v.toLowerCase();
				saveThese.push(thisWord);
//				console.log('Word '+i+': |'+thisWord+'|');
			} else {
		//					console.log('Discarded word '+i+' because it was blank')
			}
		});
		return saveThese;
	},
	savePhrases: function savePhrases(phraseArray,messageSource,msgID){
		var nGramRecord = {
			n:phraseArray.length,
			source:messageSource,
			frequency:1,
			words:phraseArray,
			inMsgID:[msgID]
		}

		// Currently "source" is overwritten on find.  Make source an array?

		Phrases.findOrCreate({n:phraseArray.length,words:[phraseArray]},nGramRecord).exec(function createFindCB(err,thisRecord){
			if (err) {
				console.log('Error:'+JSON.stringify(err))
			} else {
				var gotPhrase = thisRecord;

				var arraysID = gotPhrase.inMsgID;
				if (arraysID.indexOf(msgID) < 0)
					arraysID.push(msgID);

				var gotPhraseUpdates = {
					frequency:arraysID.length,
					inMsgID:arraysID
				};
				Phrases.update(gotPhrase.id,gotPhraseUpdates).exec(function updatedPhrase(err,data){});
			}
	});

	// 	Phrases.find({words:[phraseArray],source:messageSource}).exec(function findExistingRecords(err,records){

	// 		function showSaveStatus(err,data){
	// 			if (err)
	// 				console.log('There was an error adding the nGram:'+err);
	// 		}

	// 		if (err){
	// 			return new Error(err);
	// 		} else {

	// 			if (records.length){
	// //				console.log(phraseArray+' matched '+records.length+' records.');
	// 				var gotPhrase = records.pop();

	// 				var arraysID = gotPhrase.inMsgID;
	// 				if (arraysID.indexOf(msgID) < 0)
	// 					arraysID.push(msgID);
	// 				else
	// 		//			console.log(phraseArray+' occurs in this message more than once.');

	// //						console.log('Array of IDs has type '+typeof arraysID+' and contains:'+arraysID);
	// 				var gotPhraseUpdates = {
	// 					frequency:arraysID.length,
	// 					inMsgID:arraysID
	// 				};

	// //						console.log('Updating Phrase number '+gotPhrase.id+' with new attributes:\n'+JSON.stringify(gotPhraseUpdates));
	// 				Phrases.update(gotPhrase.id,gotPhraseUpdates).exec(function updatedPhrase(err,data){
	// //							console.log('Err:'+JSON.stringify(err)+'  Data:'+JSON.stringify(data));
	// //					console.log('Updated The Phrase');
	// 				});

	// 			} else {
	// 	//			console.log('Creating new NGram record');
	// 				Phrases.create(nGramRecord).exec(showSaveStatus);
	// 			}
	// 		}

	// 	});
	},
	getNgrams: function(searchArray){
			// var natural = require('natural');
			// var NGrams = natural.NGrams;

			// var returnThese = [];
			// if (searchArray.length >= 3){
			// 	returnThese.concat(NGrams.trigrams(searchArray));
			// } else if (searchArray.length === 2){
			// 	returnThese.concat(NGrams.bigrams(searchArray));
			// } else if (searchArray.length === 1){
			// 	returnThese.concat(NGrams.ngrams(searchArray, 1));
			// }

			// return returnThese;

			var natural = require('natural');
			var NGrams = natural.NGrams;
			var unoGrams = NGrams.ngrams(searchArray, 1);
			var biGrams = NGrams.bigrams(searchArray);
			var triGrams = NGrams.trigrams(searchArray);

			return biGrams.concat(unoGrams,triGrams);

	},
	nGramIt: function nGramIt(messageArray, messageSource, messageID, finalCallback){
			
			// Take array of message words, run it through natural.nGrams creating an array of bigrams and an array of trigrams.
			// Combine those two arrays into 'allGrams' then send each one to savePhrases. Call cb() that exits beforeCreate when done.

			var natural = require('natural');
			var NGrams = natural.NGrams;
			var unoGrams = NGrams.ngrams(messageArray, 1);
			var biGrams = NGrams.bigrams(messageArray);
			var triGrams = NGrams.trigrams(messageArray);

			var allGrams = biGrams.concat(unoGrams,triGrams);


			var saveAllNGrams = function(gramValue,cb){
			//	console.log('Saving NGRAM '+gramValue);
				storeData.savePhrases(gramValue,messageSource,messageID);
				return cb();
			};


			var runCB = function(err){

				var runThisThing = finalCallback;
				var ngramLength = allGrams.length;

				if (err)
					console.log('There was an error:'+err);
				else
		//			console.log('Everything worked properly!')

					return runThisThing(ngramLength);
			}


			async.each(allGrams,saveAllNGrams,runCB);

			// allGrams.forEach(saveAllNGrams,function(err){
			// 	if (err)
			// 		console.log('There was an error:'+err);
			// 	else
			// 		console.log('Everything worked properly!')
			// })


			// console.log('Executing final callback');
			// return finalCallback();

		}

};


//		console.log('Here are the vals\n\n'+JSON.stringify(values));


*/