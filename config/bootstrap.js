
var _ = require('lodash');
var later = require('later');
var lookOut = require('look-out');
var twilioCreds = require('../config/local.js').twilio;

var checkWebsiteStatus = function(){

  var contactNumbers = ['5129444222','5129131386'];

  var returnLookoutOptions = function(onePhoneNumber){
    return {
      // url: 'ass_on_fire://butthead-12970.onmodulus.net',
      url: 'http://www.sailsjs.org',
      phoneNumber: onePhoneNumber,
      twilioCredentials: twilioCreds
    }
  };

  _.each(contactNumbers,function(oneContactNumber){
      require('node-machine')
      .build(lookOut)
      .configure(returnLookoutOptions(oneContactNumber))
      .exec(function showResults(err,success){
          if (err)
            return console.log('Error Checking Site:',err);
          else
            return console.log('Success Checking Site:',success);
        });
  })


};


/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://links.sailsjs.org/docs/config/bootstrap
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  checkWebsiteStatus();
  var textSched = later.parse.text('every 10 min');

  var timer = later.setInterval(checkWebsiteStatus, textSched);


  // Maybe use .stream() for large collection so memory use isnt so high during lift?


  User.find().exec(function(e,allUsers){
      if (e)
          return console.log('Error Pushing Existing Users to memory:',e);
      for (var user in allUsers)
          User.memoryStore.push(allUsers[user].lcnick);

      sails.hooks.irchook.bots.sailsTroll.connect();
  });

  Channel.find().exec(function(e,allChannels){
      if (e)
          return console.log('Error Pushing Existing Channels to memory:',e);
      for (var channel in allChannels)
          Channel.memoryStore.push(allChannels[channel])
  });
  
  // var s=require('stream').Writable();s._write=function(data,enc,cb){console.log(data.length);return cb()};
  // Gram.stream({}).pipe(s);

  // Gram.find().exec(function(e,allGrams){
  //     if (e)
  //         return console.log('Error Pushing Existing Grams to memory store:',e);
  //     // for (var gram in allGrams)
  //     //     Gram.memoryStore.push(allGrams[gram])
  //         _.each(allGrams,function(oneGram){
  //             Gram.memoryStore[oneGram.name] = oneGram.id
  //             return;            
  //         })
  //         console.log('Finished loading stuff into memory.  sailsTroll connecting now...')
  //         
  // });

 Link.find().exec(function(e,allLinks){
      if (e)
          return console.log('Error Pushing Existing Links to memory store:',e);
      for (var link in allLinks)
          Link.memoryStore.push(allLinks[link])
  });

 JunkWord.find().exec(function(e,allJunkWords){
      if (e)
          return console.log('Error Pushing Existing JunkWords to memory store:',e);
      for (var word in allJunkWords)
          JunkWord.memoryStore.push(allJunkWords[word].word)
  });

// JunkWord.memoryStore
  cb();


};
