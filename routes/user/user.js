var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../../database');
var bcrypt = require('bcrypt');

var createUser = require('./createUser');

var authentication = require('../../lib/authentication');



//authentication.hasPermission(10),

router.get('/',authentication.hasPermission(10),function(req,res,next){

	res.render('./user/user',{title:'users'});

});

router.get('/create',authentication.hasPermission(10),function(req,res,next){

	createUser.createPage(req,res,next);

});

router.post('/create',authentication.hasPermission(10),function(req,res,next){

	createUser.createUser(req,res,next);

});



module.exports = router;
