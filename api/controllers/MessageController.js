/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getTranscript: function(req,res){
		var messageCreatedAt = req.param('message');

		var transcript = [];
		// is this a job for async.auto ?

		var returnTranscript = function(err,transcriptBottom){
			if (err){
				console.log('Error getting transcript bottom:',err);
				return res.json(err);
			}

			console.log('Got',transcriptBottom.length,'from bottom. Returning Results.');
			// console.log(JSON.stringify(transcriptBottom));

			// this should be a splice I tinks

			transcript = transcript.concat(transcriptBottom);
			// console.log('\n\n','Whole Transcript (',transcript.length,' results):',transcript)

			var ensureUniqueness = [];

			var uniqueTranscript = [];

			_.each(transcript,function(oneMessage){
					var uniquenessKey = oneMessage.sender+oneMessage.text;
					if (ensureUniqueness.indexOf(uniquenessKey) < 0){
						uniqueTranscript.push(oneMessage);
						ensureUniqueness.push(uniquenessKey);
					} else {
						console.log(uniquenessKey,'already found');
					}
			})

			// This will be a problem when messages dont have unique createdAt Dates (bad data import)
			return res.json({transcript: uniqueTranscript.reverse(),center:messageCreatedAt,type:"message"})

		};

		var getTranscriptBottom = function(err,transcriptTop){
			if (err){
				console.log('Error getting transcript top:',err);
			}

			console.log('Got',transcriptTop.length,'from top. Getting bottom.');

			console.log(JSON.stringify(transcriptTop));

			transcript = transcript.concat(transcriptTop.reverse());

			var findCriteria = {
				"createdAt": {
					">=": new Date(messageCreatedAt)
				}
			}

			Message.find(findCriteria).sort('createdAt ASC').limit(20).exec(returnTranscript)
		};

		var getTranscriptTop = function(messageID){

			var findCriteria = {
				"createdAt": {
					"<": new Date(messageCreatedAt)
				}
			}

			Message.find(findCriteria).sort('createdAt DESC').limit(20).exec(getTranscriptBottom)
		};


		console.log('Trying to get transcript section for',messageCreatedAt);

		return getTranscriptTop()
	},
	recentMessages: function(req,res){
		console.log('grabbing recent messages');

		var returnRecent = function(err,results){
			if (err){
				console.log('Error getting recent chat messages')
				return res.json('Error:'+err)
			}

			console.log('Got recent messages',JSON.stringify(results))
			return res.json(results)
		}

		Message.find({}).limit(10).sort('createdAt DESC').exec(returnRecent)

	}
};

