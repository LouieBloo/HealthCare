var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../database');

var authentication = require('../lib/authentication');





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

var quick = function(finalResult){
	return new Promise((resolve,reject) =>{
		finalResult.ass = "shaved";
		console.log("quick going");
		resolve();
	});
};


var getAllReferrals = function(callback)
{
	var finalResult = {};

	// Promise.all([quick(finalResult)]).then(function(){
	// 	console.log("Finished promises!");
	// 	console.log(finalResult);
	// })
	// .catch(function(err){
	// 	console.log("all promise error: " + err);
	// });
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


module.exports = router;
