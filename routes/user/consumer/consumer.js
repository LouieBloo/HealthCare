var express = require('express');
var router = express.Router();
var validator = require('validator');
var fs = require('fs');
var mkdirp = require('mkdirp');

const fileUpload = require('express-fileupload');

var database = require('../../../database');
var configFile = require('../../../config.js');

var userHelperFunctions = require('../../../lib/users/userHelperFunctions');


var viewSingleConsumer = function(req,res,next)
{
	Promise.all([

		userHelperFunctions.fetchConsumer(req.params.consumerID),
		fetchConsumerNotes(req.params.consumerID),
		fetchConsumerFiles(req.params.consumerID),
		fetchConsumerPayer(req.params.consumerID)

		]).then(function(results){


			res.render('./user/consumer/consumer', {
				title: "Consumer " + req.params.consumerID,
				data:results[0][0],
				notes:results[1],
				files:results[2],
				payer:results[3][0]
			});

	})
	.catch(function(err){
		console.log("view single consumer promise error: " + err);
		res.send("Error: " + err);
	});
};


var postSingleConsumer = function(req,res,next)
{
	console.log(req.body);
	console.log(req.files);

	if(req.files && req.files.fileUpload)
	{
		console.log("files!!");
		mkdirp(configFile.fileUploadFolder+"/user/" + req.params.consumerID + "/files/",function(err){
			console.log("mkdirp: " + err);
			if(err)
			{
				res.send("Error uploading file: " + err);
			}
			else
			{
				req.files.fileUpload.mv(configFile.fileUploadFolder+"/user/" + req.params.consumerID + "/files/" + req.files.fileUpload.name ,function(err){
					console.log("file uploaded: " + err);
					res.send("Error: " + err);
				});
			}
		});
	}
	else if(req.body)
	{
		console.log("body");
		if(req.body.newNote)
		{
			insertNewNote(req.params.consumerID,req.user.id,req.body.newNote).then(function(){
				viewSingleConsumer(req,res,next);
			}).catch(function(err){
				console.log("Error inserting note: " + err);
			});

		}
	}
	else
	{
		viewSingleConsumer(req,res,next);
	}
}

var insertNewNote = function(consumerID,authorID,note)
{
	return new Promise((resolve,reject) =>{

		database.db.query(
			`INSERT INTO ConsumerNotes (Note,ConsumerID,AuthorID) Values (?,?,?)`
			,[note,consumerID,authorID],function(error,results,fields){
			
			if(error)
			{
				reject(error);
			}
			else
			{
				resolve();
			}
		});
	});
}

var fetchConsumerNotes = function(consumerID)
{
	return new Promise((resolve,reject) =>{

		database.db.query(
			`SELECT 
				NoteID,
				Note,
				ConsumerID,
				AuthorID,
				DateModified,
				CONCAT(User.FName," ", User.LName) as AuthorName,
				User.UserID
				FROM ConsumerNotes
	            LEFT JOIN User ON ConsumerNotes.AuthorID=User.UserID
				WHERE ConsumerID=?`
			,[consumerID],function(error,results,fields){
			
			if(error)
			{
				reject(error);
			}
			else
			{
				resolve(results);
			}
		});
	});	
}

//gets all files found in /user/id folder
var fetchConsumerFiles = function(consumerID){
	return new Promise((resolve,reject) =>{

		fs.readdir(configFile.fileUploadFolder+"/user/" + consumerID + "/files",(err,files)=>{

			if(err)
			{
				console.log("Error getting consumer files: " + err);
				resolve(null);
			}
			else
			{
				resolve(files);
			}
		});
		
	});
};

//
var fetchConsumerPayer = function(consumerID)
{
	return new Promise((resolve,reject) =>{

		database.db.query(
			`SELECT
				User.FName,
				User.LName,
				User.UserID, User.Phone,
				User.Email,
				User.Role,
				User.SubRole
			FROM User
			INNER JOIN
				ConsumerDetails ON User.UserID = ConsumerDetails.PayerID
			WHERE
				ConsumerDetails.ConsumerID=?`
			,[consumerID],function(error,results,fields){
			
			if(error)
			{
				reject(error);
			}
			else
			{
				resolve(results);
			}
		});
	});	
}

module.exports.viewSingleConsumer = viewSingleConsumer;
module.exports.postSingleConsumer = postSingleConsumer;
