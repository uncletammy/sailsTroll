/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var _ = require('lodash');
var natural = require('natural');
var async = require('async');


module.exports = {
  // migrate:'alter',
  migrate:'safe',
  autoPK: true,
  autoCreatedAt: false,
  autoUpdatedAt: true,

  attributes: {
    text: 'STRING',
    // No two users will post the exact same message (with the same IDs)
    sender:{
      model: 'user'
    },
    channel: {
      model: 'channel'
    },
    links:{
      collection: 'link',
      via: 'postedin',
      dominant:false
    },
    usermentions:{
      collection: 'user',
      via: 'mentionedin',
      dominant:true
    },
    grams:{
      collection: 'gram',
      via: 'inmessage',
      dominant:false
    },
    createdAt: 'DATE'
  },
  doUserMentions: function(messageID,maybeCreate){

      var longEnoughUserMentions = _.filter(maybeCreate,function(oneUser){
        if (oneUser.length>2)
          return oneUser
      });

      var allMentions = [];

      var saveResults = function(err,results){
          if (err){
              return console.log('Error Associating Users:',err,'\n\n');
          }
          console.log('UserMention Success:',longEnoughUserMentions)
          return;
      };

      _.each(longEnoughUserMentions,function(oneUserName){
              var anObject = {
                  "message_usermentions" : messageID,
                  "user_mentionedin" : oneUserName
              };

              allMentions.push(anObject);
      })

      console.log('Attempting to associate:',allMentions);

      // message_usermentions__user_mentionedin.findOrCreateEach(longEnoughUserMentions).exec(saveResults);

  },
  doGrams: function(messageID,maybeCreate){
      // Get the name of all grams that exist in the database.
      // Create all grams that dont exist yet and add them to 
      // the memory store.  For those that do exist, create new
      // entries in the join table.

      var existingGrams = _.pluck(Gram.memoryStore,'name');
      var idsOfGramsToAssociate = [];

      var justAssociate = _.unique(_.intersection(existingGrams,maybeCreate));

      // Grab IDs of grams that already exist.
      _.each(justAssociate,function(oneGramName){
          idsOfGramsToAssociate.push(_.find(Gram.memoryStore,{name:oneGramName}).id)
      })

      var createTheseNewGrams = _.unique(_.difference(maybeCreate,existingGrams));

      var doAssociationCreates = function(){

      }

      var createResults = function(err,results){
          if (err){
              return console.log('Error Creating New Grams:',err,'\n\n');
          }
          console.log('Created New Grams:',createTheseNewGrams)
          return;
      };

      //Map new grams

      Gram.createEach(createTheseNewGrams).exec(createResults);


  },
  doLinks: function(messageID,messageSender,maybeCreate){
        var mappedLinks = _.map(uniqueLinks,function(oneLink){
            var indexOfLinkStart = oneLink.indexOf('://');
            // Chop off protocol and split at '/'
            var splitLinkPath = oneLink.split(/https{0,1}:\/\//i)[1].split('/');
            if (splitLinkPath.length)
                getLinkDomain = splitLinkPath[0];
            else
                getLinkDomain = splitLinkPath.join('');

            // console.log('Link Domain:',getLinkDomain)
            var modifiedLink = {
                linktext:oneLink,
                domain:getLinkDomain
            };      
            return modifiedLink
        });
  },
  beforeCreate: function (values, callback) {

      var lcnick = values.sender.toLowerCase().replace(/[\W_]/ig,'')
      var nowExit = function(err,userVals){
            if (err) {
              console.log('Error Creating user!')
              User.nameStore = _.without(User.nameStore,lcnick);
            }
            values.sender = lcnick;
            return callback();
        };

      // TODO: create Channel.idStore and have bootstrap load all the channels
      // into it on lift.  Maybe switch to sails-memory in the future?

      var doesUserExist = (User.nameStore.indexOf(lcnick)>-1);
      if (doesUserExist){
        console.log(lcnick,'Exists!')
        values.sender = lcnick;
        return callback()
      } else {
        User.nameStore.push(lcnick);
        User.create({nick:values.sender,lcnick:lcnick}).exec(nowExit)
      }
  },
  afterCreate: function(values,exitAfterCreate){

      // Associations Needed
      //   message.grams - message:grams
      //   links.postedby - link:user (sender)
      //   message.links - message:links
      //   message.usermentions - message:user

      var oneMessage = values;
      var NGrams = natural.NGrams;

      var getMessageWords = oneMessage.text.toLowerCase().replace(/[^\w ]/ig,'').replace(/ {2,}/,'').split(' ');
      var allMessageWords = _.unique(_.filter(getMessageWords,function(thisWord){
          if (thisWord.length>1);// Is this smart?  Only time will tell.
              return thisWord
      }));

      var unoGrams = NGrams.ngrams(allMessageWords, 1);
      var biGrams = NGrams.bigrams(allMessageWords);
      var triGrams = NGrams.trigrams(allMessageWords);

      var processTheseGrams = biGrams.concat(unoGrams,triGrams);

      var maybeCreateGrams = _.map(processTheseGrams,function(oneGramArray){
          var joinedValue = oneGramArray.join('');
          if (joinedValue.length > 0){
            return joinedValue
          }
      });

      doGrams(oneMessage.id,maybeCreateGrams);

      var maybeCreateLinks = _.unique(oneMessage.text.match(/(https{0,1}:\/\/[:?=#&!.\w\d\/_-]+)/ig));

      if (maybeCreateLinks.length)
          doLinks(oneMessage.id,oneMessage.sender,maybeCreateLinks);

      var maybeCreateUserMentions = _.intersection(_.pluck(User.nameStore,'lcnick'),getMessageWords);

      if (maybeCreateUserMentions.length)
          doUserMentions(oneMessage.id,maybeCreateUserMentions);

      return exitAfterCreate();

  }

};
