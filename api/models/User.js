/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  // migrate:'drop',
  migrate:'safe',
  autoPK: false,
  autoCreatedAt: false,
  autoUpdatedAt: true,

  attributes: {
    nick:'STRING',
    lcnick:{
      type: 'STRING',
      primaryKey: true,
      unique: true
    },
  	messages:{
  		collection: 'message',
  		via: 'sender',
    //   dominant:false
  	},
    links:{
      collection: 'link',
      via: 'postedby',
      dominant:false
    },
    mentionedin:{
      collection: 'message',
      via: 'usermentions',
      dominant:false
    }

  },
  nameStore:[],
  beforeCreate: function(vals,callback){
    if (User.nameStore.indexOf(vals.lcnick)>-1){
      // console.log(vals.lcnick,'doesnt need to be created')
      return;
    } else {
      // console.log(vals.lcnick,'needs to be created.')    
      return callback();
    }

  },
  afterCreate: function(vals,callback){
    if (User.nameStore.indexOf(vals.lcnick)>-1){
      console.log(vals.lcnick,'was double created.  Destroying new guy')
      User.destroy({id:vals.id}).exec(console.log)
    } else {
      User.nameStore.push(vals.lcnick)
      // console.log('User',vals.lcnick,'created!\nCurrent Users:',User.nameStore)
      return callback()
    }

  }
};

