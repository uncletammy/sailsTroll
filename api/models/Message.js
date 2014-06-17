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

      console.log('Attempting to Associate userMentions:',longEnoughUserMentions);

      message_usermentions__user_mentionedin.createEach(allMentions).exec(saveResults);

  },
  doGrams: function(messageID,maybeCreate){
      // Get the name of all grams that exist in the database.
      // Create all grams that dont exist yet and add them to 
      // the memory store.  For those that do exist, create new
      // entries in the join table.

      // TODO: Add n-value attribute to grams in order to reduce search time.
      // Also add source: "stack" so we can add other sources later. 
      var idsOfGramsToAssociate = [];
/*
      var existingGrams = _.pluck(Gram.memoryStore,'name');
      var justAssociate = _.unique(_.intersection(existingGrams,maybeCreate));

      // Grab IDs of grams that already exist.
      _.each(justAssociate,function(oneGramName){
          idsOfGramsToAssociate.push(_.find(Gram.memoryStore,{name:oneGramName}).id)
      })

      var createTheseNewGrams = _.unique(_.difference(maybeCreate,existingGrams));
*/
      var justAssociate = [];
      var createTheseNewGrams = [];

      _.each(maybeCreate,function(thisGram){
          var getGram = Gram.memoryStore[thisGram];
          if (getGram){
              console.log('Found gram:',thisGram,':',getGram)
              justAssociate.push(getGram)
          } else {
              console.log('Couldnt find:',thisGram)              
              createTheseNewGrams.push(thisGram)
          }

      });


      var resultsOfAssociationCreates = function(err,results){
          if (err){
              console.log('Error Associating Grams',err,'\n\n');
              return err
          }
          console.log('Gram Associations Created:',_.pluck(results,'id'))
          return true
      };

      var doAssociationCreates = function(){
          var mappedAssociations = _.map(_.unique(idsOfGramsToAssociate),function(oneGramID){
              var anItem = {
                  "gram_inmessage" : oneGramID,
                  "message_grams" : messageID
              };
              return anItem;
          });

          console.log('Doing Gram Associations for',mappedAssociations.length)

          gram_inmessage__message_grams.createEach(mappedAssociations).exec(resultsOfAssociationCreates)
      };

      var createResults = function(err,results){
          if (err){
              console.log('Error Creating New Grams:',err,'\n\n');
              return doAssociationCreates()
          }
          // Push newly created grams onto memory store
          // _.each(results,Gram.memoryStore.push);
          _.each(results,function(oneGram){
              Gram.memoryStore[oneGram.name] = oneGram.id;
              idsOfGramsToAssociate.push(oneGram.id);
              return
          });

          console.log('Created New Grams:',_.pluck(results,'name'))
          // var idsOfGramsToAssociate = idsOfGramsToAssociate.concat(_.pluck(results,'id'));

          if (justAssociate.length){
            console.log('Now making associations for',justAssociate.length,'grams')
            return doAssociationCreates()
          }
      };

      var newGramsMapped = _.map(createTheseNewGrams,function(oneGramName){
          var anItem = {
              "name" : oneGramName
          };
          return anItem;
      });

          idsOfGramsToAssociate = idsOfGramsToAssociate.concat(idsOfGramsToAssociate);
      
      if (newGramsMapped.length){
          console.log('About to create',newGramsMapped.length);
          Gram.createEach(newGramsMapped).exec(createResults);
      } else if (justAssociate.length){
          console.log('Couldnt find new grams but found',justAssociate.length,'old ones.  Now associating.');
          doAssociationCreates();
      } else {
        return console.log('There are no grams to create.  This should never be the case.')
      }


  },
  doLinks: function(messageID,messageSender,maybeCreate){

        var existingLinks = _.pluck(Link.memoryStore,'linktext');
        var idsOfLinksToAssociate = [];

        var doAssociationCreates = function(){
            var links_postedBy = [];
            var links_postedIn = [];

            var associationsCreated = function(err,newlyCreatedAssociations){
                if (err){
                    return console.log('There was an error creating your link associations:',err)
                }
                return console.log('You just created',newlyCreatedAssociations.length,'new associations');

            };

            var gotLinksByUser = function(err,alreadyPostedByUser){
                if (err){
                    console.log('Error Getting Links by User:',err,'\n\n');
                    return
                };

                if (alreadyPostedByUser.length){
                    var returnedWithoutIDs = _.map(alreadyPostedByUser,function(o){delete o.id; return o});
                    console.log(messageSender,'already posted',returnedWithoutIDs.length,'of the',links_postedBy.length,'links');
                    links_postedBy = _.without(links_postedBy,returnedWithoutIDs);                  
                }
                console.log('Associating user',messageSender,'with this message');
                link_postedby__user_links.create(links_postedBy).exec(associationsCreated);
            };

            _.each(idsOfLinksToAssociate,function(oneLinkID){

                var onePostedBy = {
                  "link_postedby" : oneLinkID,
                  "user_links" : messageSender
                };
                links_postedBy.push(onePostedBy);

                var onePostedIn = {
                  "link_postedin" : oneLinkID,
                  "message_links" : messageID
                };
                links_postedIn.push(onePostedIn);
                return;
            });

            if (justAssociate.length){
                console.log('Since',messageSender,'is posting links that already exist, we much check to see that they havnt already posted them')
                console.log('postedIn:',links_postedIn);
                link_postedby__user_links.find({or:links_postedBy}).exec(gotLinksByUser)
                console.log('Associating links with this message');
                link_postedin__message_links.create(links_postedIn).exec(associationsCreated);
            } else {
                console.log('Since all these links are new.  Lets just create the associations!');
                console.log('postedIn:',links_postedIn);
                link_postedby__user_links.create(links_postedBy).exec(associationsCreated);
                link_postedin__message_links.create(links_postedIn).exec(associationsCreated);

            }

        };

        var createResults = function(err,results){
            if (err){
                console.log('Error Creating New Links:',err,'\n\n');
                // even though we couldnt create the new links.  We might still have existing links
                // that need to be associated with this message
                if (justAssociate.length)
                    return doAssociationCreates()
                else
                    return;
            }
            // Push newly created links onto memory store
            // _.each(results,Link.memoryStore.push);
            _.each(results,function(oneLink){
                Link.memoryStore[oneLink.name] = oneLink.id;
                idsOfLinksToAssociate.push(oneLink.id);
                return
            });

            console.log('Created New Links:',_.pluck(results,'linktext'))
            // var idsOfLinksToAssociate = idsOfLinksToAssociate.concat(_.pluck(results,'id'));

            return doAssociationCreates()
        };

        var mapTheseLinks = function(arrayOfLinktexts){
            return _.map(arrayOfLinktexts,function(oneLink){
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
            })
        };

      var justAssociate = _.unique(_.intersection(existingLinks,maybeCreate));

      // Grab IDs of links that already exist.
      _.each(justAssociate,function(oneLinktext){
          idsOfLinksToAssociate.push(_.find(Link.memoryStore,{linktext:oneLinktext}).id)
      });

      var createTheseNewLinks = mapTheseLinks(_.unique(_.difference(maybeCreate,existingLinks)));

      console.log('Creating links:',createTheseNewLinks,'\n','and old links with id',idsOfLinksToAssociate)

      if (createTheseNewLinks.length){
          console.log('About to create',createTheseNewLinks.length,'new links',createTheseNewLinks);
          Link.createEach(createTheseNewLinks).exec(createResults);
      } else if (justAssociate.length){
          console.log('No New Links.  About to do associations for',idsOfLinksToAssociate.length,'old ones')
          doAssociationCreates();
      } else {
        return console.log('There are no links to create.  This should never be the case.')
      }

  },
  beforeCreate: function (values, callback) {

      var lcnick = values.sender.toLowerCase().replace(/[\W_]/ig,'')
      var matchChannel = _.find(Channel.memoryStore,{name:values.channel});

      var nowExit = function(err,userVals){
            if (err) {
              User.memoryStore = _.without(User.memoryStore,lcnick);
              return console.log('Error Creating user!');
            }
            values.sender = lcnick;
            return callback();
        };

      var validateUser = function(){
          var doesUserExist = (User.memoryStore.indexOf(lcnick)>-1);
          if (doesUserExist){
            console.log(lcnick,'Exists!')
            values.sender = lcnick;
            return callback()
          } else {
            User.memoryStore.push(lcnick);
            User.create({nick:values.sender,lcnick:lcnick}).exec(nowExit)
          }
      };

      var afterChannelCreate = function(err,channelVals){
            if (err) {
              console.log('Error Creating channel!');
              return;
            };
            console.log('Channel',channelVals,'created!')
            Channel.memoryStore.push(channelVals);
            values.channel = channelVals.id;
            return validateUser();
        };

      if (matchChannel){
          values.channel = matchChannel.id;
          console.log('Found channel',values.channel)
          validateUser()
      } else {
          Channel.create({name:values.channel}).exec(afterChannelCreate)
      }
      
  },
  afterCreate: function(values,exitAfterCreate){
      var startTime = new Date();

      var logTime = function(){
        var endTime = new Date();
        var totalTime = (endTime-startTime)/1000;
        console.log('Message',values.id,'took',totalTime,'seconds to create');
      }
      // Associations Needed
      //   message.grams - message:grams
      //   links.postedby - link:user (sender)
      //   message.links - message:links
      //   message.usermentions - message:user
      console.log('entered afterCreate')
      exitAfterCreate();
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

      Message.doGrams(oneMessage.id,maybeCreateGrams);

      var maybeCreateLinks = _.unique(oneMessage.text.match(/(https{0,1}:\/\/[:?=#&!.\w\d\/_-]+)/ig));

      if (maybeCreateLinks.length)
          Message.doLinks(oneMessage.id,oneMessage.sender,maybeCreateLinks);


      var maybeCreateUserMentions = _.intersection(User.memoryStore,allMessageWords);

      if (maybeCreateUserMentions.length){
          console.log('Found users called',maybeCreateUserMentions,'among a list of',User.memoryStore.length)
          Message.doUserMentions(oneMessage.id,maybeCreateUserMentions);
      } else {
          console.log('Couldnt find users called',allMessageWords,'among a list of',User.memoryStore.length)
      }

      logTime();

      // if (values.id){
      //     console.log('Now Deleting message with id:',values.id)
      //     Message.destroy(values.id).exec(console.log);
      // }

      // return exitAfterCreate();

  }

};
