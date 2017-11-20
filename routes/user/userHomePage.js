var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var authentication = require('../../lib/authentication');

var userHelperFunctions = require('../../lib/users/userHelperFunctions');



var homePageRoute = function(req,res,next)
{


	Promise.all([userHelperFunctions.fetchAllConsumers(),userHelperFunctions.fetchUserCounts()]).then(function(results){

		consumers = results[0];
		userCounts = results[1];

		res.render('./user/user', { title: "Users",consumers:consumers,userCounts:userCounts});
	})
	.catch(function(err){
		console.log("Error in homePageRoute Promise: " + err);
		res.send("contact luke! error: " + err);
	});
	
};





module.exports.homePageRoute = homePageRoute;
