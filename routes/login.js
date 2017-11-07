var express = require('express');
var router = express.Router();
var database = require('../database');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcrypt');


passport.use(new LocalStrategy(

	function(username, password, done) {

		database.db.query(`
			SELECT User.UserID,Password,Salt,GROUP_CONCAT(UserPermissions.Permission SEPARATOR ',') as Permission FROM User
			LEFT JOIN UserPermissions ON User.UserID=UserPermissions.UserID
			WHERE Email=?
			GROUP BY User.UserID
			`,[username],function(error,results,fields){
			
			if(error)
			{
				return done(null,false);
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

							var permissionSplit = [];
							if(results[0].Permission)
							{
								permissionSplit = results[0].Permission.split(",").map(Number);//takes the sql and returns a split string that is also cast as an int
							}

							var user = {
								id:results[0].UserID,
								permission:permissionSplit
							};
							return done(null,user);
						}
						else{
							console.log("Error haasdfssword!");
							return done(null,false);
						}
					}
				});
			}
		});
 	}
));

passport.serializeUser(function(user, done) {
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
	passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login/?error=1'})
);

router.post('/create',function(req,res,next){

});


module.exports = router;
