var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var validator = require('validator');

var phone = require('phone');

var authentication = require('../../lib/authentication');


var renderCreateUserPage = function(res,title,error,prefill)
{
	res.render('./user/create/createUser', { title: title,error:error,prefill:prefill});
}

//main route
var createUserHomePage = function(req,res,next)
{
	buildDefaultPrefill(req,function(err,results){
		renderCreateUserPage(res,'New User',null,results);
	});
	
};

//post route
var createUserPost = function(req,res,next)
{
	var addressID = null;
	var altAddressID = null;
	var userInformation;
	new Promise(function(resolve,reject){

		checkIfValidParameters(req,function(err,result){
			if(err)
			{
				renderCreateUserPage(res,'New User',null,result);
				reject();
			}
			else
			{
				userInformation = result;
				resolve();
			}

		});
		
	})
	.then(function(){//ADDRESS
		return new Promise(function(resolve,reject){

			var street2 = userInformation.Street2.value ? userInformation.Street2.value : null;
			
			database.db.query('INSERT INTO Address (Street,Street2,City,State,ZIP) VALUES (?,?,?,?,?)',[userInformation.Street.value,street2,userInformation.City.value,userInformation.State.value,userInformation.Zip.value],function(err,results){
				if(err){
					reject(err);
				}
				else
				{
					addressID = results.insertId;
					//resolve();
					res.send("ok");
				}
			});

		});
	})
	.then(function(){//consumer ALT ADDRESS
		return new Promise(function(resolve,reject){

			if(userInformation.AltStreet.value)//if there is a alt street address we assume there is a second address to insert
			{
				var street2 = userInformation.AltStreet2.value ? userInformation.AltStreet2.value : null;
				
				database.db.query('INSERT INTO Address (Street,Street2,City,State,ZIP) VALUES (?,?,?,?,?)',[userInformation.AltStreet.value,street2,userInformation.AltCity.value,userInformation.AltState.value,userInformation.AltZip.value],function(err,results){
					if(err){
						reject(err);
					}
					else
					{
						altAddressID = results.insertId;
						resolve();
					}
				});
			}
			else
			{
				resolve();
			}
		});
	})
	.then(function(){//insert the consumer into the db
		return new Promise(function(resolve,reject){
			
			var clientFName = userInformation.ClientFName.value;
			clientFName = clientFName.charAt(0).toUpperCase() + clientFName.slice(1);//capitalize first letter
			var clientLName = userInformation.ClientLName.value;
			clientLName = clientLName.charAt(0).toUpperCase() + clientLName.slice(1);

			var altPhone = userInformation.ClientAltPhone.value ? userInformation.ClientAltPhone.value : null;
			var language = userInformation.ClientLanguage.value ? userInformation.ClientLanguage.value : null;
			var diag = userInformation.ClientDiagnosis.value ? userInformation.ClientDiagnosis.value : null;

			
			switch(userInformation.ReferralType.value){
				case "EOR":
					referralTypeID = 1;
					break;
				case "PA":
					referralTypeID = 2;
					break;
				case "Respit":
					referralTypeID = 2;
					break;
			}


			var parameters = [clientFName,clientLName,userInformation.ClientEmail.value,phone(userInformation.ClientPhone.value)[0],phone(altPhone)[0],clientAddressID,clientAltAddressID,userInformation.ClientDOB.value,language,9,2];

			database.db.query('INSERT INTO User (FName,LName,Email,Phone,AltPhone,Address,AltAddress,Birthday,Language,Role,SubRole) VALUES (?,?,?,?,?,?,?,?,?,?,?)',parameters,function(err,results){

				if(err){
					reject(err);
				}
				else
				{
					//insert the consumer details
					clientID = results.insertId;
					var parameters = [clientID,userInformation.ClientUCI.value,diag,3,submitterPersonID,referralTypeID];
					database.db.query('INSERT INTO ConsumerDetails (ConsumerID,UCI,Diagnosis,Status,PayerID,Type) VALUES (?,?,?,?,?,?)',parameters,function(err,results){
						if(err){
							reject(err);
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
	.then(function(){//insert referral
		
	})
	.catch(function(err){
		console.log("caught error in promise: " + err);
	});
	
	// isValidParameters(req,function(error){

	// 	if(error.length > 0)//user entered in invalid stuff, rerender page with the error and there original entries
	// 	{
	// 		renderCreateUserPage(res,'New User',error,req.body);
	// 	}
	// 	else//parameter check ok, check if email is already taken
	// 	{
	// 		isEmailInUse(req.body.email,function(error){
	// 			if(error.length > 0)
	// 			{
	// 				renderCreateUserPage(res,'New User',error,req.body);
	// 			}
	// 			else
	// 			{
	// 				//passed all checks, create new user
	// 				createNewUser(req,function(error){
	// 					if(error.length > 0)
	// 					{
	// 						renderCreateUserPage(res,'New User',error,req.body);			
	// 					}
	// 					else
	// 					{
	// 						res.redirect('../login');
	// 					}
	// 				});
	// 			}
	// 		});
	// 	}
	// });
};





//validates the post parameters to see if they are valid
//returns the same object that buildDefaultPrefill did but with any errors attached
//is-invalid is bootstrap 4 form color
var checkIfValidParameters = function(req,callback)
{
	buildDefaultPrefill(req,function(err,response){

		var error = null;


		//IF WE WANT TO CHECK FIELDS DO IT HERE
		if(!req.body.FName)
		{
			response.FName.error = 'is-invalid';
			error = true;
		}
		if(!req.body.LName)
		{
			response.LName.error = 'is-invalid';
			error = true;
		}
		if(req.body.Email && !validator.isEmail(req.body.Email))
		{
			response.Email.error = 'is-invalid';
			error = true;
		}
		if(req.body.Phone && phone(req.body.Phone).length == 0)
		{
			response.Phone.error = 'is-invalid';
			error = true;
		}
		if(req.body.AltPhone)
		{
			if(phone(req.body.AltPhone).length == 0)
			{
				response.AltPhone.error = 'is-invalid';
				error = true;
			}
		}

		//consumer only
		if(req.body.UserType == 2)
		{
			if(!req.body.UCI)
			{
				response.UCI.error = 'is-invalid';
				error = true;
			}
		}
		// //address
		// if(!req.body.Street)
		// {
		// 	response.Street.error = 'is-invalid';
		// 	error = true;
		// }
		// if(!req.body.City)
		// {
		// 	response.City.error = 'is-invalid';
		// 	error = true;
		// }
		// if(!req.body.State)
		// {
		// 	response.State.error = 'is-invalid';
		// 	error = true;
		// }
		// if(!req.body.Zip)
		// {
		// 	response.Zip.error = 'is-invalid';
		// 	error = true;
		// }
		// //
		// if(!req.body.DOB)
		// {
		// 	response.DOB.error = 'is-invalid';
		// 	error = true;
		// }
		// if(!req.body.UCI)
		// {
		// 	response.UCI.error = 'is-invalid';
		// 	error = true;
		// }


		callback(error,response);

	});
};

var isEmailInUse = function(email,response)
{
	var errorToReturn = [];
	database.db.query('SELECT Email FROM User WHERE Email=?',[email],function(error,results,fields){
		
		if(error)
		{
			errorToReturn.push("Unknown Error Occured");
		}
		else if(results.length < 1)
		{
			//email doesnt exist, return no error
		}
		else
		{
			errorToReturn.push("Email already in use");
		}

		response(errorToReturn);
	});
};

//create new user in database.
//THIS FUNCTION ASSUMES ALL PARAMETERS AND ERROR CHECKING HAS BEEN DONE!
var createNewUser = function(req,response)
{
	var error =[];
	
	bcrypt.genSalt(10,function(err,salt){
		if(err){
			error.push(err);
			response(error);
		}
		else
		{
			bcrypt.hash(req.body.password,salt,function(err,hash){
				if(err){
					error.push(err);
					response(error);
				}
				else
				{
					var fname = req.body.fname.toLowerCase();
					fname = fname[0].toUpperCase() + fname.substr(1);
					var lname = req.body.lname.toLowerCase();
					lname = lname[0].toUpperCase() + lname.substr(1);

					//we have succesfully generated a hash of the users password and a unique salt
					database.db.query('INSERT INTO User (FName,LName,Email,Password,Salt) VALUES (?,?,?,?,?)',[fname,lname,req.body.email,hash,salt],function(err,results){
						response(error);
					}) ;
				}
			});
		}
	});
};

//buids the object that is used by referral.ejs to prefill the page with values. Default them
//all to whatever was in the request.
var buildDefaultPrefill = function(req,callback)
{
	var response = {};

	var userType = req.body.UserType != null ? req.body.UserType : 2;
	response.UserType = {value: userType,error: ''};

	response.FName = {value: req.body.FName,error: ''};
	response.LName = {value: req.body.LName,error: ''};
	response.Email = {value: req.body.Email,error: ''};
	response.Phone = {value: req.body.Phone,error: ''};
	response.AltPhone = {value: req.body.AltPhone,error: ''};
	//address
	response.Street = {value: req.body.Street,error: ''};
	response.Street2 = {value: req.body.Street2,error: ''};
	response.City = {value: req.body.City,error: ''};
	response.State = {value: req.body.State,error: ''};
	response.Zip = {value: req.body.Zip,error: ''};
	//alt address
	response.AltStreet = {value: req.body.AltStreet,error: ''};
	response.AltStreet2 = {value: req.body.AltStreet2,error: ''};
	response.AltCity = {value: req.body.AltCity,error: ''};
	response.AltState = {value: req.body.AltState,error: ''};
	response.AltZip = {value: req.body.AltZip,error: ''};
	//
	response.DOB = {value: req.body.DOB,error: ''};
	response.UCI = {value: req.body.UCI,error: ''};
	response.Language = {value: req.body.Language,error: ''};
	response.Diagnosis = {value: req.body.Diagnosis,error: ''};
	response.AdditionalInfo = {value: req.body.AdditionalInfo,error: ''};


	callback(null,response);
};

module.exports.createUserHomePage = createUserHomePage;
module.exports.createUserPost = createUserPost;
