var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../database');

var authentication = require('../lib/authentication');

var phone = require('phone');


//show all referral route
router.get('/',authentication.hasPermission(10),function(req,res,next){
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
router.get('/:referralID',authentication.hasPermission(10),function(req,res,next){

	getAllSingleReferralInfo(req.params.referralID,function(err,response){
		
		res.render('./referral/singleReferral',{title: 'Single Referral',referralObject:response});
	});
});



//gets all referrals in the database
var getAllReferrals = function(callback)
{
	var finalResult = {};

	database.db.query(
		`SELECT
			*,
			(SELECT CONCAT(FName," ",LName) FROM ReferralPerson WHERE ReferralPerson.PersonID=Referral.Submitter) as SubmitterName,
			Referral.DateAdded as ReferralDate,
			(SELECT Email FROM ReferralPerson WHERE ReferralPerson.PersonID=Referral.Submitter) as SubmitterEmail,
			(SELECT Phone FROM ReferralPerson WHERE ReferralPerson.PersonID=Referral.Submitter) as SubmitterPhone
		FROM Referral INNER JOIN ReferralPerson ON Referral.Client=ReferralPerson.PersonID
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
		else
		{
			callback(null,results[0]);
		}
	});
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
			PersonID,
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
			Address.Street as Street,
			Address.Street2 as Street2,
			Address.City as City,
			Address.State as State,
			Address.ZIP as ZIP,
			Alt.AddressID as AltID,
			Alt.Street as AltStreet,
			Alt.Street2 as AltStreet2,
			Alt.City as AltCity,
			Alt.State as AltState,
			Alt.ZIP as AltZIP

			FROM ReferralPerson
			LEFT JOIN Address ON ReferralPerson.Address=Address.AddressID
			LEFT JOIN Address as Alt ON ReferralPerson.AltAddress=Alt.AddressID
			WHERE PersonID=?`
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

module.exports = router;
