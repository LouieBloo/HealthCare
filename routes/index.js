var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("user: " + req.user);
	res.render('index', { title: 'Dirt Services' });
  //res.render('index', { title: 'Express' });

});

/* GET home page. */
router.post('/', function(req, res, next) {

  res.render('index', { title: 'Post express' });
  
});

module.exports = router;
