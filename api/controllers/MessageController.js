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

			// this should be a splice I tinks
			transcript = transcript.concat(transcriptBottom);

			// This will be a problem when messages dont have unique createdAt Dates (bad data import)
			return res.json({transcript: transcript,center:messageCreatedAt,type:"message"})

		};

		var getTranscriptBottom = function(err,transcriptTop){
			if (err){
				console.log('Error getting transcript top:',err);
			}

			console.log('Got',getTranscriptTop.length,'from top. Getting bottom.');

			console.log(getTranscriptTop);

			transcript = transcript.concat(transcriptTop);

			var findCriteria = {
				"createdAt": {
					">": new Date(messageCreatedAt)
				}
			}

			Message.find(findCriteria).sort('createdAt ASC').limit(20).exec(returnTranscript)


		};

		var getTranscriptTop = function(messageID){

			var findCriteria = {
				"createdAt": {
					"<=": new Date(messageCreatedAt)
				}
			}

			Message.find(findCriteria).sort('createdAt ASC').limit(20).exec(getTranscriptBottom)


		};


		console.log('Trying to get transcript section for',messageCreatedAt);

		return getTranscriptTop()
	}
};

