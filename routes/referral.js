var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../database');

var authentication = require('../lib/authentication');

var phone = require('phone');

var pagePermission = 2;


//show all referral route
router.get('/',authentication.hasPermission(pagePermission),function(req,res,next){
	getAllReferrals(function(err,response){
		if(err){
			res.send("Error fetching referrals! " + err);
		}
		else
		{
			res.render('./referral/referral',{title: 'Referrals',referrals:response});
		}
	});
});

//single referral route
router.get('/:referralID',authentication.hasPermission(pagePermission),function(req,res,next){

	//get all the information about the referral, then call the view function to mark it as read in the database if it is unread
	getAllSingleReferralInfo(req.params.referralID,function(err,response){

		referralViewed(response,function(err,doesntmatter){
			res.render('./referral/singleReferral',{title: 'Single Referral',referralObject:response});	//render the page regardless of the result of referral
		});
		
	});
});

router.post('/:referralID',authentication.hasPermission(pagePermission),function(req,res,next){

	if(req.body.action)
	{
		updateReferralStatus(req,function(err,results){
			res.redirect('./' + req.params.referralID);
		});
	}
	else
	{
		res.redirect('./' + req.params.referralID);
	}

});


//gets all referrals in the database
var getAllReferrals = function(callback)
{
	var finalResult = {};

	database.db.query(
		`SELECT
			*,
			(SELECT CONCAT(FName," ",LName) FROM User WHERE User.UserID=Referral.Submitter) as SubmitterName,
			Referral.DateAdded as ReferralDate,
			(SELECT Email FROM User WHERE User.UserID=Referral.Submitter) as SubmitterEmail,
			(SELECT Phone FROM User WHERE User.UserID=Referral.Submitter) as SubmitterPhone
		FROM Referral INNER JOIN User ON Referral.Client=User.UserID
		ORDER BY ReferralID DESC`
		,function(error,results,fields){
		
		if(error)
		{
			callback(error,null);
		}
		else
		{
			var returnObject = {};
			returnObject.allReferrals = results;
			callback(null,returnObject);
		}
	});
}

//gets all the information about a single referral, including all people and addresses
var getAllSingleReferralInfo = function(referralID,callback)
{
	var finalResult = {};

	getSingleReferral(referralID,function(err,response){
		if(err)
		{
			callback(err,null);
		}
		else
		{
			finalResult.referral = response;
			Promise.all([getPerson(finalResult,'client'),getPerson(finalResult,'worker'),getPerson(finalResult,'family'),getPerson(finalResult,'submitter')]).then(function(results){

				finalResult.client = results[0];
				finalResult.worker = results[1];
				finalResult.family = results[2];
				finalResult.submitter = results[3];

				callback(null,finalResult);
			})
			.catch(function(err){
				console.log("all promise error: " + err);
				callback(err,null);
			});
		}
	});

	
}

//gets the info from 1 referral
var getSingleReferral = function(referralID,callback)
{
	database.db.query(
		`SELECT *
		FROM Referral
		WHERE ReferralID=?`
		,[referralID],function(error,results,fields){
		
		if(error)
		{
			callback(error,null);
		}
		else if(results == null || results.length <= 0)
		{
			callback("no referral found",null);
		}
		else
		{
			callback(null,results[0]);
		}
	});
}

var referralViewed = function(referral,callback)
{
	if(referral)
	{
		if(referral.referral.Status == 'unread')
		{
			database.db.query(
				`UPDATE Referral
				 SET Status='read'
				WHERE ReferralID=?`
				,[referral.referral.ReferralID],function(error,results,fields){
				
				if(error)
				{
					console.log("Error viewing referral: " + error)
					callback(error,null);
				}
				else{
					callback(null,null);
				}
			});
		}
		else
		{
			callback(null,null);
		}
	}
	else
	{
		callback("No referral",null);
	}
}

//takes in a referral object and the type of person needed
//returns the person and any address associated with them
var getPerson = function(finalResult,typeOfPersonToGet){
	return new Promise((resolve,reject) =>{

		var personID = 0;
		if(typeOfPersonToGet == 'worker')
		{
			personID = finalResult.referral.Worker;
		}
		else if(typeOfPersonToGet == 'submitter')
		{
			personID = finalResult.referral.Submitter;
		}
		else if(typeOfPersonToGet == 'client')
		{
			personID = finalResult.referral.Client;
		}
		else if(typeOfPersonToGet == 'family')
		{
			personID = finalResult.referral.Family;
		}

		database.db.query(
			`SELECT
			UserID,
			FName,
			LName,
			Phone,
			AltPhone,
			Email,
			UCI,
			Birthday,
			Relationship,
			Diagnosis,
			Language,
			Address.AddressID as AddressID,
			Address.Street as Street,
			Address.Street2 as Street2,
			Address.City as City,
			Address.State as State,
			Address.ZIP as ZIP,
			Alt.AddressID as AltAddressID,
			Alt.Street as AltStreet,
			Alt.Street2 as AltStreet2,
			Alt.City as AltCity,
			Alt.State as AltState,
			Alt.ZIP as AltZIP

			FROM User
			LEFT JOIN Address ON User.Address=Address.AddressID
			LEFT JOIN Address as Alt ON User.AltAddress=Alt.AddressID
			WHERE UserID=?`
			,[personID],function(error,results,fields){
			
			if(error)
			{
				reject(err);
			}
			else if(results)
			{
				resolve(results[0]);
			}
		});
	});
};


var updateReferralStatus = function(req,callback){

	var newValue = '';
	if(req.body.action == 'Completed')
	{
		newValue = 'completed';
	}
	else if(req.body.action == 'Read')
	{
		newValue = 'read';
	}
	else if(req.body.action == 'In-Progress')
	{
		newValue = 'in-progress';
	}

	if(newValue)
	{
		database.db.query(
			`UPDATE Referral
				SET Status=?
				WHERE ReferralID=?`
			,[newValue,req.params.referralID],function(error,results,fields){
			
			if(error)
			{
				console.log("error updating referral status: " + err);
				callback(null,null);
			}
			else if(results)
			{
				callback(null,null);
			}
		});
	}
};

module.exports = router;
