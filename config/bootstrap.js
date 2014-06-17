

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



  // Maybe use .stream() for large collection so memory use isnt so high during lift?


  User.find().exec(function(e,allUsers){
      if (e)
          return console.log('Error Pushing Existing Users to memory:',e);
      for (var user in allUsers)
          User.memoryStore.push(allUsers[user].lcnick)
  });

  Channel.find().exec(function(e,allChannels){
      if (e)
          return console.log('Error Pushing Existing Channels to memory:',e);
      for (var channel in allChannels)
          Channel.memoryStore.push(allChannels[channel])
  });
  
  Gram.find().exec(function(e,allGrams){
      if (e)
          return console.log('Error Pushing Existing Grams to memory store:',e);
      for (var gram in allGrams)
          Gram.memoryStore.push(allGrams[gram])
  });

 Link.find().exec(function(e,allLinks){
      if (e)
          return console.log('Error Pushing Existing Links to memory store:',e);
      for (var link in allLinks)
          Link.memoryStore.push(allLinks[link])
  });

  cb();


};
