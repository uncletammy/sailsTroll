/**
* Bot.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	// migrate:'drop',
	migrate:'safe',
	autoPK: false,
	autoCreatedAt: true,
	autoUpdatedAt: true,

	attributes: {
		name: {
			type: 'STRING',
			primaryKey: true
		},
		host: 'STRING',
		description: 'STRING',
		autoconnect: 'BOOLEAN',
        channels: {
            collection: 'channel',
            via: 'bots',
            dominant:true
        }
	}
};

