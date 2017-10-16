var express = require('express');
var router = express.Router();
var validator = require('validator');
var database = require('../database');

var authentication = require('../lib/authentication');





router.get('/',authentication.hasPermission(10),function(req,res,next){

	res.send("yesh");

});

router.post('/create',authentication.hasPermission(10),function(req,res,next){

	
});


module.exports = router;
