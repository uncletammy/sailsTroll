/**
* gram.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var natural = require('natural');
var async = require('async');

module.exports = {
	// migrate:'alter',
	migrate:'safe',
	autoPK: true,
	autoCreatedAt: false,
	autoUpdatedAt: false,
	
	attributes: {
		name: {
			type: 'STRING',
			// primaryKey: true,
			unique: true
		},
        inmessage: {
            collection: 'message',
            via: 'grams',
            dominant:true
        }
	}
};

