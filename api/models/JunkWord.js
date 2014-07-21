/**
* JunkWord.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		word: {
			type: 'STRING',
			unique: true
		}
	},
	afterCreate: function(values,callback){
		JunkWord.memoryStore.push(values.word);
		console.log('added',values.word,'to JunkWord memoryStore');
		return callback()
	},
	memoryStore: []
};
