var express = require('express');
var router = express.Router();
var database = require('../database');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcrypt');


passport.use(new LocalStrategy(

	function(username, password, done) {

		database.db.query(`
			SELECT User.UserID,Password,Salt,GROUP_CONCAT(PermissionGroups.PermissionArray SEPARATOR ',') as Permission, User.PermissionExceptions FROM User
			LEFT JOIN UserPermissions ON User.UserID=UserPermissions.UserID
			LEFT JOIN PermissionGroups ON UserPermissions.Group=PermissionGroups.GroupID
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

							var permissionSplit = [];//results to be put into the passport user object
							if(results[0].PermissionExceptions)//if the user has exceptions, add it to the permission groups
							{
								results[0].Permission += "," + results[0].PermissionExceptions;
							}
							if(results[0].Permission)
							{
								var permissions = results[0].Permission.replace(/[^0-9,]/g,"");//remove everything but numbers and ,
								permissionSplit = permissions.split(",").map(Number);//takes the results and turn them into ints
							}

							var user = {
								id:results[0].UserID,
								permission:permissionSplit
							};
							return done(null,user);//goes to passport and sets the cookie
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
