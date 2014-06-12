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
  // migrate:'drop',
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
  counter:0,
  currentTimeout:null,
  lastTime: new Date(),
  beforeCreate: function (values, callback) {

      // Check to see if this is an old message being migrated.
      // If so, make sure the createdAt date reflects when the 
      // message was originally created. 
// console.log('looking for',values)

      if (values.channel !== '5398d161bc9477dd23c6ae5e'){
      //   Channel.findOne({name:values.channel}).exec(function(err,gotChannel){
      //       if (err) console.log('There is no channel called',values.channel);
        
      // })
        // console.log('unknown channel:',values)
      } else {

        if (values.date){
          // console.log('Message is old')
          values.createdAt = new Date(values.date);
          delete values.date;
        }
        var originalNick = values.sender;
        var lcnick = values.sender.toLowerCase().replace(/[\W_]/ig,'');
        values.sender = lcnick;
        // console.log('Trying User create!')
        // values.channel = gotChannel.id;
        callback()
        User.create({nick:originalNick,lcnick:lcnick}).exec(function(err,done){
            if (err) return console.log('Error Creating/finding user:',sender);
            // console.log('user Create is done',done);
        })
        
      }
// 5398d161bc9477dd23c6ae5e

  },
  afterCreate: function(values,exitAfterCreate){
      var emergencyTimeout = function(){
          var messageValues = values;
          var exitCB = exitAfterCreate;
          console.log('There was an error when trying to save message:',messageValues.id);
          console.log('We are returning as if its business as usual\n\n',messageValues,'\n\n');
          return exitCB();
      }

      Message.currentTimeout = setTimeout(emergencyTimeout,1000*60)

      console.log('STARTING NEW MESSAGE:',values.id,'\n');
  Message.counter++;
  if ((Message.counter/50).toString().indexOf('.')<0){

    var rightNow = new Date();
    var lastTime = Message.lastTime;
    var subtractDates = Number((lastTime-rightNow))*(-1/1000);
    console.log(Message.counter,'of 50772 - ',subtractDates,'second block');
    Message.lastTime = rightNow;
  }
        // Match Links and save them  in Links model if they
        // dont already exist.  Either way, associate them
        // with this record.
        var doLinks = function(linksFound,message,cb){

            var linksToAssociate = [];
            var doneWithLinks = cb;

            var createNewLinks = function(linksThatNeedCreation,newLinkCallback){
              // console.log('Attempting to create links:',linksThatNeedCreation)
                Link.create(linksThatNeedCreation)/*.populate('postedin').populate('postedby')*/.exec(function(err,newLinks){
                  if (err) console.log('There was an error creating new links:',err);
                  linksToAssociate = linksToAssociate.concat(newLinks);
                  return newLinkCallback();
                })
            };

            Link.find({ linktext : _.unique(linksFound)}).exec(function(err,allLinksInMessage){
                if (err) return console.log('There was an error retrieving old links:',err);

                var existingLinksReturned = allLinksInMessage;

                // var existingLinksThatOnlyNeedAssociation = _.intersection(linkTextArray,linksFound);
                var createTheseLinks = _.difference(linksFound,_.pluck(allLinksInMessage,'linktext'));

                var linksThatNeedCreation = _.unique(_.map(createTheseLinks,function(oneLink){
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
                }));

                // console.log('These links need Creation:',createTheseLinks,'\nNow Mapped:',linksThatNeedCreation)

                createNewLinks(linksThatNeedCreation,function(){

                    // console.log('Doing associations for',linksToAssociate.length,'links');
                    linksToAssociate.forEach(function(oneLink,index){
                        var thisSender = message.sender;
                        var thisMessageID = message.id;
                        var saveLinkAssociations = function(e,s){
                            if (e) console.log('Couldnt save link association for',oneLink.linktext,'to message',thisMessageID);
                            // console.log('Link Association succesfull:',s)
                            if (index === linksToAssociate.length-1){
                              // console.log('Done making final link association');
                              return doneWithLinks();
                            } else {
                              return true;
                            }
                      };

                        // console.log('associating link',oneLink.linktext)
                        oneLink.postedin.add(thisMessageID);
                        oneLink.postedby.add(thisSender);
                        oneLink.save(saveLinkAssociations);
                    })
                })
            })
        };

        var doUserMentions = function(filteredMentions,message,mentionCallback){
                var processMention = function(oneMention,index){
                    var thisMessage = message;
                    // console.log('message passed:',message)
                    // console.log('mentioning',oneMention,'in',thisMessage.id);
                    thisMessage.usermentions.add(oneMention);
                    if (index === filteredMentions.length-1){
                      // console.log('Done making final userMention association');

                      thisMessage.save(function(e,msgSaveVals){
                        if (e) console.log('Error saving useMentions:',e);
                          // console.log('Saved message with associations!',msgSaveVals)
                          return mentionCallback();
                      })
                    }
                };

            filteredMentions.forEach(processMention);
  
        };

        var doGrams = function(arrayOfArrays,messageID,afterGramCB){
            var preUpdateGramStorage = [];

            var filterTheseArrays = function(someArrays){
                var filteredArrays = _.map(someArrays,function(oneGramArray){
              // console.log('Array',oneGramArray,'has length',oneGramArray.length)
                    var joinedValue = oneGramArray.join('');
                    if (joinedValue.length > 0){
                      // console.log('Filtering array:',oneGramArray,'to',joinedValue)
                      return joinedValue;
                    }
                });
                return filteredArrays;
            }

            var joinedGrams = filterTheseArrays(arrayOfArrays);
            Gram.find({name:joinedGrams}).exec(function(err,allGrams){
                if (err) return console.log('Error getting existing grams',err);

                var existingGrams = _.pluck(allGrams,'name');


                var updateTheseGrams = _.unique(_.intersection(existingGrams,joinedGrams));
                var gramsForCreation = _.unique(_.difference(joinedGrams,existingGrams));
                
              // console.log('\n\n\n','Creating Grams:',gramsForCreation,'\n\n','and updating these:',updateTheseGrams,'\n\n\n')
                var createTheseGrams = _.map(gramsForCreation,function(gramNeedName){
                  // console.log('typeof',typeof gramNeedName,':',gramNeedName);
                    var joinGramBySpace = _.flatten(gramNeedName).join('');
                    return {name:joinGramBySpace}
                });

                var grabGramsThatNeedUpdating = _.where(allGrams,function(singleGram){
                    var isItIn = updateTheseGrams.indexOf(singleGram.name)>=0;
                    // console.log('Is',singleGram.name,'in',updateTheseGrams,'?',isItIn,'!')
                    return isItIn;
                });

                preUpdateGramStorage = preUpdateGramStorage.concat(grabGramsThatNeedUpdating);

                //console.log('These Grams needed updating:',grabGramsThatNeedUpdating)

                var associateAllGrams = function(doneAssociatingGrams){


                    var gramsToAssociate = _.unique(preUpdateGramStorage);
// console.log('All Grams to associate!',gramsToAssociate)
                    gramsToAssociate.forEach(function(oneGram,index){
                        var thisMessageID = messageID;
                        var saveGramAssociation = function(e,s){
                            if (e) console.log('Couldnt save gram association for',oneGram.name,'with messageID',thisMessageID);
                            // console.log('Gram Association succesfull:',s)
                            if (index === gramsToAssociate.length-1){
                              // console.log('Done making final ngram association');
                              return doneAssociatingGrams();
                            }
                        };
                        // console.log('associating gram',oneGram.name,'with message',thisMessageID,'gram type:',typeof oneGram.name)
                        oneGram.inmessage.add(thisMessageID);
                        oneGram.save(saveGramAssociation);
                    });

                    // return cb(associationResults);
                };

                if (createTheseGrams.length){              
                    Gram.create(createTheseGrams).exec(function(err,newGrams){
                        if (err) return console.log('Error Creating new grams:',err);

                        // console.log(newGrams.length,'were sucesfully created!')
                        preUpdateGramStorage = preUpdateGramStorage.concat(newGrams);

                        // Do Ngram associations then return
                        return associateAllGrams(afterGramCB);
                    })
                } else {
                    return associateAllGrams(afterGramCB);
                }
            })
        };

        Message.findOne(values.id).exec(function afterMessageGrab(e,message){

                // console.log('Just looked up message',message.id,'\n\n')

                // Make n-grams to make message searches easy
                var getMessageWords = message.text.toLowerCase().replace(/[^\w ]/ig,'').replace(/ {2,}/,'').split(' ');
                var allMessageWords = _.unique(_.filter(getMessageWords,function(thisWord){
                    if (thisWord.length>1);// Is this smart?  Only time will tell.
                        return thisWord
                }));

                var showString = allMessageWords.join(' ')
                // console.log('String to split:',showString);

                var NGrams = natural.NGrams;
                var unoGrams = NGrams.ngrams(allMessageWords, 1);
                var biGrams = NGrams.bigrams(allMessageWords);
                var triGrams = NGrams.trigrams(allMessageWords);

                var processTheseGrams = _.unique(biGrams.concat(unoGrams,triGrams));

                // If there are no gramable words in the message to process, exit.  We're done!
                if (allMessageWords.length){
                    doGrams(processTheseGrams,message.id,function afterGramCB(){

                        var linksFound = _.unique(values.text.match(/(https{0,1}:\/\/[:?=#!.\w\d\/_-]+)/ig));

                        // Return all users who's name is a word in the message
                        var allMentionedUsers = _.intersection(allMessageWords,User.nameStore);

                        var filteredMentions = allMentionedUsers;
                        // console.log('Users mentioned:',filteredMentions,'from a total of',User.nameStore.length)

                        if (linksFound.length && filteredMentions.length){
                            // console.log('Both Links and Usermentions found');
                            doUserMentions(filteredMentions,message,function(){
                                doLinks(linksFound,message,function(){
                                    // console.log('\n',' -- DONE WITH MESSAGE',message.id,'. Found Mentions and Links','\n')
                                    clearTimeout(Message.currentTimeout);
                                    return exitAfterCreate()
                                })
                            })
                        } else if (linksFound.length){
                          // console.log('No Users Mentioned. Adding links then exiting');
                          // exitAfterCreate();
                          doLinks(linksFound,message,function(){
                             console.log('\n',' -- DONE WITH MESSAGE',message.id,'. Found Links','\n')
                              clearTimeout(Message.currentTimeout);
                              return exitAfterCreate()
                          })
                        } else if (filteredMentions.length){
                          // console.log('No Links Found.   Adding userMentions then exiting');                      
                          doUserMentions(filteredMentions,message,function(){
                             console.log('\n',' -- DONE WITH MESSAGE',message.id,'. Found Mentions','\n')
                            clearTimeout(Message.currentTimeout);
                            return exitAfterCreate()
                          })
                        } else {
                          console.log('\n',' -- DONE WITH MESSAGE',message.id,'. Found no mentions or links','\n')
                          clearTimeout(Message.currentTimeout);
                          return exitAfterCreate();
                        }
                    });

                } else {
                  console.log('\n',' -- DONE WITH MESSAGE',message.id,'. No words in message','\n');
                  clearTimeout(Message.currentTimeout);
                  return exitAfterCreate();
                }
        })

  }

};
    // Remove punctuation from message text then split it up by word.
    // Save words that match the name of a user as userMentions. 

    // Compose nGrams from node-natural. Associate with this record
    // those ngrams which arent already.

// User.find().populate('messages').exec(function(e,u){var cound=0;u.forEach(function(u2,i){cound+=u2.messages.length;if(i===u.length-1)console.log('There are a total of',cound,'associated messages')})})