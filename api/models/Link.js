/**
* Link.js
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
		postedin:{
			collection: 'message',
			via: 'links',
			dominant:true
		},
		postedby:{
			collection: 'user',
			via: 'links',
			dominant:true
		},
		domain: 'STRING',
		linktext: {
			primaryKey:true,
			type:'STRING'
		}
	}
};

// links:{
// 	collection: 'link',
// 	via: 'poster'
// }
