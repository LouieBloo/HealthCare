


var loggedInWhiteList = ['login'];

//checks if the user is logged in, if not redirect to login
var isLoggedIn = function(req, res, next){

	var parsedUrl = req.url.split('/');
	if(loggedInWhiteList.includes(parsedUrl[1]))
	{
		next();
	}
	else if(req.user)
	{
		next();
	}
	else{
		res.redirect('/login');
	}
}

//checks if user has permission to view page, if not, redirect to home page
var hasPermission = function(permissionID){
	return function(req,res,next){
		if(req.user)
		{
			if(req.user.permission.includes(permissionID))
			{
				return next();
			}
			else if(req.user.permission.includes(1))//1 is admin
			{
				return next();
			}
		}

		res.redirect('/');
	}
}


exports.isLoggedIn = isLoggedIn;
exports.hasPermission = hasPermission;