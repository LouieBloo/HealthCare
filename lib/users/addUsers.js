var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var authentication = require('../authentication');





var addConsumerFromReferral = function(userID,callback){

	database.db.query(
			`UPDATE User
				SET Role=8
				WHERE UserID=?`
			,[userID],function(error,results,fields){
			
			if(error)
			{
				callback(error,null);
			}
			else
			{
				callback(null,results);
			}
		});
};


module.exports.addConsumerFromReferral = addConsumerFromReferral;