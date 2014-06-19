/**
 * BotController
 *
 * @description :: Server-side logic for managing bots
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var local = require('../../config/local.js');
var crypto = require('crypto');
var sexySecret = local.irc.githubSecret;
module.exports = {
	report: function(req,res){

		var getHeader = req.get('X-Hub-Signature');
		var postIt = function(){
			try {
				var commitInfo = req.param('head_commit');
				var committer = commitInfo.committer.username;
				var message = commitInfo.message;
				var repoName = req.param('repository').name;
				var branch = req.param('ref').split('/');
				branch = branch.pop();

				var speakToRoom = committer+' just pushed to the '+branch+' branch of '+repoName+': '+message

				console.log(speakToRoom);

				sails.hooks.irchook.bots.sailsTroll.say('#sailsjs',speakToRoom)

			} catch (nope){
				console.log('Something went wrong',nope)
			}
		};

		if (getHeader){
			var hash = 'sha1='+crypto.createHmac('sha1', sexySecret).update(JSON.stringify(req.body)).digest('hex');
			if (hash === getHeader){
				console.log(getHeader,' === ',hash)

				res.ok(true);
				return postIt()
			} else {
				console.log(getHeader,' !== ',hash)
				console.log('Request Body might have been effed with');
				return res.forbidden('almost but not quite')
			}

		} else {
			console.log('Missing headers.  Are you even trying?')
			return res.forbidden('nope')
		}



	}
};

