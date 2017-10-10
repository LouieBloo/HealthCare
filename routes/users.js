var express = require('express');
var router = express.Router();

var authentication = require('../authentication/authentication');

/* GET users listing. */
// router.get('/tits', function(req, res, next) {


//   res.send('respond with a resource you morgan');


// });



var func1 = function(req,res,next)
{
	console.log("func 1! " + req.params.userID);

	var database = require('../database');
	if(req.params.userID == 5)
	{
		next('route');

	}
	else
	{
		authentication.testFunction();

		next();	
	}

	
}

var func2 = function(req,res)
{
	console.log("func 2! " + functionMiddle(5,4));


	res.send("Done!");
}

var functionMiddle = function(x,y)
{
	return x+y;
}

var func3 = function(req,res,next)
{
	console.log("func 3!!");
	res.end();
}

router.get('/:userID',[func1,func2]);

router.get('/:userID',[func3]);

module.exports = router;
