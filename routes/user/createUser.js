var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var authentication = require('../../lib/authentication');




var createPage = function(req,res,next)
{
	renderCreateUserPage(res,'New User');
};

var createUser = function(req,res,next)
{
	isValidParameters(req,function(error){

		if(error.length > 0)//user entered in invalid stuff, rerender page with the error and there original entries
		{
			renderCreateUserPage(res,'New User',error,req.body);
		}
		else//parameter check ok, check if email is already taken
		{
			isEmailInUse(req.body.email,function(error){
				if(error.length > 0)
				{
					renderCreateUserPage(res,'New User',error,req.body);
				}
				else
				{
					//passed all checks, create new user
					createNewUser(req,function(error){
						if(error.length > 0)
						{
							renderCreateUserPage(res,'New User',error,req.body);			
						}
						else
						{
							res.redirect('../login');
						}
					});
				}
			});
		}
	});
};


var renderCreateUserPage = function(res,title,error,prefill)
{
	res.render('./user/createUser', { title: title,error:error,prefill:prefill});
}

//check account parameter validity
var isValidParameters = function(req,response)
{
	var error = [];
	if(req.body.fname.length < 2)
	{
		error.push("Need first name");
	}
	else if(req.body.fname.length > 15)
	{
		error.push("First name too long");
	}

	if(req.body.lname.length < 2)
	{
		error.push("Need last name");
	}
	else if(req.body.lname.length > 25)
	{
		error.push("Last name too long");
	}

	if(!validator.isEmail(req.body.email))
	{
		error.push("Invalid email");
	}

	if(req.body.password.length < 8)
	{
		error.push("Password too short");
	}
	else if(req.body.lname.length > 50)
	{
		error.push("Password too long");
	}

	response(error);
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

module.exports.createPage = createPage;
module.exports.createUser = createUser;
