var express = require('express');
var router = express.Router();
var database = require('../database');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(

	function(username, password, done) {

		console.log("Passport check: " + username + " Password: " + password);


		database.db.query('SELECT UserID,Password FROM Users WHERE Email=?',[username],function(error,results,fields){
			
			console.log(results);

			if(error)
			{
				return done("Unknown Error Occured");
			}
			else if(results == null || results.length < 1)
			{
				return done(null,false);
			}
			else
			{
				if(results[0].Password == password)
				{
					var user = {id:results[0].UserID};
					return done(null,user);
				}
				else{
					return done(null,false);
				}
			}
		});


    // User.findOne({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
 	}
));

passport.serializeUser(function(user, done) {
	console.log("serializing: " + user.id);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null,id);
});



router.get('/', function(req, res, next) {

	console.log("user: " + req.user);

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


module.exports = router;
