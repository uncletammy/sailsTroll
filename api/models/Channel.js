/**
* Channel.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	// migrate:'drop',
	migrate:'safe',
	autoPK: true,
	autoCreatedAt: false,
	autoUpdatedAt: false,
	
	attributes: {
		name: {
			type: 'STRING',
			unique: true
		},
        bots: {
            collection: 'bot',
            via: 'channels',
            dominant:false
        }
	}
};

