/**
* Search.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	migrate:'safe',
	autoPK: true,
	autoCreatedAt: true,
	autoUpdatedAt: true,
	attributes: {
		results: 'JSON'
	},
	doSearch: function(searchString,callback,saveResultsAsModel){
		// console.log('Now searching for',searchString)
		var getMessageWords = searchString.toLowerCase().replace(/[^\w ]/ig,'').replace(/ {2,}/,'').split(' ');
		// var allMessageWords = _.unique(_.filter(getMessageWords,function(thisWord){
		// 	if (thisWord.length>1);// Is this smart?  Only time will tell.
		// 		return thisWord
		// }));

		var allMessageWords = getMessageWords;

		// console.log('Now getting grams for',allMessageWords.length)
		// create ngrams but omit single word grams (for now)
		var maybeCreateGrams = Message.getGramsFromWordArray(allMessageWords,false);

		// var getGramIds = [];


		var getGramsThatExist = function(err,gramsFound){
			if (err) return callback(err);

			// console.log('Search Results:');

			var sortedGrams = _.sortBy(gramsFound,function(oneGramObject){
				var oneGramName = oneGramObject.name;
				// console.log(oneGramName,':',oneGramName.length)
				return oneGramName.length
			});

			// console.log('Gram Names In order of relevence:',_.pluck(sortedGrams,'name'));

			// There are some dublicate entries in the dataset so we have to ensure uniqueness by both text and id.
			var ensureUniqueness = {id:[],text:[]};

			var returnResults = _.map(sortedGrams.reverse(),function(oneResultsObject){
				var objectToReturn = {
					name: oneResultsObject.name,
					results: []
				};

				_.each(oneResultsObject.inmessage,function(oneResult){
					if (ensureUniqueness.id.indexOf(oneResult.id) < 0 && ensureUniqueness.text.indexOf(oneResult.text) < 0){
						ensureUniqueness.id.push(oneResult.id)
						ensureUniqueness.text.push(oneResult.text)
						objectToReturn.results.push(oneResult)
						// console.log('Pushing Msg - ',oneResult.text,'to',oneResultsObject.name,'results')
					} else {
						// console.log(oneResult.id,'has already been saved');
					}
				})
				return objectToReturn

			})



			// console.log('\n\n','Returning This:',returnResults)

			return callback(null,returnResults);

		};

		Gram.find({name:maybeCreateGrams}).populate('inmessage').exec(getGramsThatExist);

/*
		// _.each(maybeCreateGrams,function(thisGram){
		// 	var getGram = Gram.memoryStore[thisGram];
		// 	if (getGram){
		// 		getGramIds.push(getGram);
		// 	} else {
		// 		console.log('Couldnt find:',thisGram)
		// 	}
		// });

		var saveSearchResultsAsModel = function(err,savedResultsValues){
			if (err){
				console.log('error retrieving messages',err);
				return callback(err);
			}
			console.log('Search results saved:',savedResultsValues.id);
			return callback(null,savedResultsValues.id)

		};

		var respondWithMessages = function(err,messages){
			if (err){
				console.log('error retrieving messages',err);
				return callback(err);
			}

			console.log('Sending',messages.length,'messages in response');
			if (saveResultsAsModel)
				Search.create({results:JSON.stringify(_.cloneDeep(messages))}).exec(saveSearchResultsAsModel);
			else
				return callback(null,_.cloneDeep(messages));
		};

		var grabMessagesNow = function(err,jtVals){
			if (err){
				console.log('error',err);
				return callback(err)
			}
			// var getTheseMessages = _.unique(_.flatten(_.pluck(jtVals,'inmessage')));
			var getTheseMessages = _.unique(_.flatten(_.pluck(jtVals,'message_grams')));

			console.log('There are',getTheseMessages.length,'potentially relevent messages')

			Message.find(getTheseMessages).populate('sender').populate('links').populate('usermentions').exec(respondWithMessages)

		};
		console.log('Querying joinTable for',getGramIds)
		// Get all message ids associated with these grams from the join table
		// Gram.find(getGramIds).populate('inmessage').exec(grabMessagesNow);

		// gram_inmessage__message_grams.find({"gram_inmessage":{or:getGramIds}}).exec(grabMessagesNow);
		if (getGramIds.length){
			gram_inmessage__message_grams.find({"gram_inmessage":getGramIds}).exec(grabMessagesNow);
		} else {
			return callback('caint find nothin!')
		}
*/	}
};

