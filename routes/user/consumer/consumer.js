var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../../database');


var userHelperFunctions = require('../../../lib/users/userHelperFunctions');



var viewSingleConsumer = function(req,res,next)
{
	

	res.render('./user/consumer/consumer', { title: "Consumer " + req.params.consumerID});
};





module.exports.viewSingleConsumer = viewSingleConsumer;
