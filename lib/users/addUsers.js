var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');
var mkdirp = require('mkdirp');
var authentication = require('../authentication');

var configFile = require('../../config.js');
var helper = require('../helper.js');


var addConsumerFromReferral = function(userID,referralID,callback){

	new Promise(function(resolve,reject){//set the role of the consumer

		database.db.query(
			`UPDATE User
				SET Role=8
				WHERE UserID=?`
			,[userID],function(error,results,fields){
			
			if(error)
			{
				reject(err);
			}
			else
			{
				resolve();
			}
		});
		
	})
	.then(function(){//move all files from the referral this consumer came from
		return new Promise(function(resolve,reject){

			mkdirp(configFile.fileUploadFolder + "/user/" + userID + "/files",function(err){
				//console.log("mkdirp: " + err);
				if(err)
				{
					reject(err);
				}
				else
				{
					helper.move(configFile.fileUploadFolder + "/referral/" +referralID, configFile.fileUploadFolder + "/user/" + userID + "/files",function(result){
						if(result)
						{
							reject(result);
						}
						else
						{
							resolve();	
						}
					});
				}
			});
			
		});
	})
	.then(function(){
		callback(null,null);
	})
	.catch(function(err){
		console.log("Error in adding new consumer: " + err);
		callback(err,null);
	});

};



module.exports.addConsumerFromReferral = addConsumerFromReferral;