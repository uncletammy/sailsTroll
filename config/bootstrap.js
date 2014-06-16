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
/*  sails.models.user.find().exec(function(e,users){
  	if (e) return e;
  	var showCollection = [];
  	users.forEach(function(u,i){
  		delete u.createdAt;
  		delete u.updatedAt;
  		showCollection.push(u);
  		if (i === users.length-1){
  			console.log(showCollection)
  		}
  	})

  })
*/			

  User.find().exec(function(e,allUsers){
      if (e)
          return console.log('Error Pushing Existing Users to memory:',e);
      for (var user in allUsers)
          User.nameStore.push(allUsers[user].lcnick)
  });
  
  Gram.find().exec(function(e,allGrams){
      if (e)
          return console.log('Error Pushing Existing Grams to memory store:',e);
      for (var gram in allGrams)
          Gram.memoryStore.push(allGrams[gram])
  })

  cb();
};
