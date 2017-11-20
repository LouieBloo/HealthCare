var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var createUser = require('./createUser');
var userHomePage = require('./userHomePage');
var consumer = require('./consumer/consumer');

var authentication = require('../../lib/authentication');


var homePagePermission = 4;
var createUserPermission = 3;
var viewConsumersPermission = 5;

//main home page route
router.get('/',authentication.hasPermission(homePagePermission),userHomePage.homePageRoute);



router.get('/create',authentication.hasPermission(createUserPermission),function(req,res,next){

	createUser.createPage(req,res,next);

});

router.post('/create',authentication.hasPermission(createUserPermission),function(req,res,next){

	createUser.createUser(req,res,next);

});

router.get('/consumer/:consumerID',authentication.hasPermission(viewConsumersPermission),consumer.viewSingleConsumer);



module.exports = router;
