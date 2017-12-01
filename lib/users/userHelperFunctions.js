var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var authentication = require('../authentication');





var fetchAllConsumers = function(){
	return new Promise((resolve,reject) =>{

		database.db.query(
			`SELECT FName, LName, Email, Phone,UCI,UserID
			FROM Consumers
			WHERE Role!=9`
			,function(error,results,fields){
			
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
};

var fetchConsumer = function(consumerID){
	return new Promise((resolve,reject) =>{

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
				Role,
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
			FROM Consumers
			LEFT JOIN Address ON Consumers.Address=Address.AddressID
			LEFT JOIN Address as Alt ON Consumers.AltAddress=Alt.AddressID
			WHERE UserID=? AND Role!=9`
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
};

var fetchUser = function(userID){
	return new Promise((resolve,reject) =>{

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
			Role,
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
			,[userID],function(error,results,fields){
			
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
};


var fetchUserCounts = function(){
	return new Promise((resolve,reject) =>{

		database.db.query(
			`SELECT UserRoles.RoleName, COUNT(*) as Count
				FROM User
				LEFT JOIN UserRoles ON User.Role=UserRoles.RoleID OR User.SubRole=UserRoles.RoleID
				WHERE User.Role !=9
				GROUP BY UserRoles.RoleName`
			,function(error,results,fields){
			
			if(error)
			{
				reject(error,null);
			}
			else
			{
				//return the object in a nice format
				var returnObject = results.map(function(x){
					return {RoleName: x.RoleName, Count: x.Count};
				});

				resolve(results);
			}
		});
	});
};

module.exports.fetchAllConsumers = fetchAllConsumers;
module.exports.fetchUserCounts = fetchUserCounts;
module.exports.fetchUser = fetchUser;
module.exports.fetchConsumer = fetchConsumer;