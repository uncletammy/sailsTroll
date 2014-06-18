/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');

module.exports = {
	renderResults: function(req,res){
		var idOfSearch = req.param('searchid');

		console.log('rendering search results for',idOfSearch);

		var returnResults = function(err,theJson){
			if (err){
				return console.log('Error rendering saved search:',err)
			}
			return res.json(theJson.results);
		}

		Search.findOne(idOfSearch).exec(returnResults);

	},
	go: function(req,res){
		var searchString = req.param('query');
		console.log('Querying for',searchString);
		if (!searchString){
			return res.json('no query given')
		}

		var returnURL = function(err,searchModelId){
			if (err){
				return res.json('Error:',err)
			}

			console.log('Returning results to client!')
			res.json(searchModelId);
		}

		Search.doSearch(searchString,returnURL,false);

	}
};

