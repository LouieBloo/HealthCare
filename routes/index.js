var express = require('express');
var router = express.Router();


var authentication = require('../lib/authentication');



var renderHomePage = function(req,res,next){
	res.render('index', { title: 'Dirt Services'});
}

// router.get('/', function(req, res, next) {
// 	//console.log("user: " + req.user.id + " " + req.user.permission);

// 	console.log('within get!');
// 	res.render('index', { title: 'Dirt Services' });
//   //res.render('index', { title: 'Express' });

// }]);

router.get('/',renderHomePage);

module.exports = router;
