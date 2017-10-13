var express = require('express');
var router = express.Router();
var database = require('../database');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcrypt');


passport.use(new LocalStrategy(

	function(username, password, done) {


		database.db.query('SELECT UserID,Password,Permission,Salt FROM Users WHERE Email=?',[username],function(error,results,fields){
			
			console.log(results);

			if(error)
			{
				return done("Unknown Error Occured");
			}
			else if(results == null || results.length != 1)
			{
				return done(null,false);
			}
			else
			{
				bcrypt.hash(password,results[0].Salt,function(err,hash){
					if(err)
					{
						console.log("Error hashing login password!");
						return done(null,false);
					}
					else
					{
						if(results[0].Password == hash)
						{
							var user = {
								id:results[0].UserID,
								permission:results[0].Permission
							};
							return done(null,user);
						}
						else{
							return done(null,false);
						}
					}
				});
			}
		});
 	}
));

passport.serializeUser(function(user, done) {
	console.log("serializing: " + user.id);
 	done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null,id);
});



router.get('/', function(req, res, next) {

	var err = req.query.error;
	if(err == '1')
	{
		err = "Invalid Email or Password";
	}

	res.render('./login/login', { title: 'Login',error:err});

});


router.post('/',
	passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login?error=1'})
);

router.post('/create',function(req,res,next){

});


module.exports = router;
