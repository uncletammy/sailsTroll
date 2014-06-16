/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 */

module.exports.models = {
	// migrate:'drop',
	migrate:'safe',
	syncable:false,

  // Your app's default connection.
  // i.e. the name of one of your app's connections (see `config/connections.js`)
  //
  // (defaults to localDiskDb)
  // connection: 'someMongodbServer'
  connection: 'someMongodbServer'

};
