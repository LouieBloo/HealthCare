


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
var hasPermission = function(minimumPermission,exceptions){
	return function(req,res,next){
		if(req.user)
		{
			if(req.user.permission >= minimumPermission)
			{
				return next();
			}
			else if(exceptions)
			{
				if(exceptions.includes(req.user.permission))
				{
					return next();
				}
			}
		}

		res.redirect('/');
	}
}


exports.isLoggedIn = isLoggedIn;
exports.hasPermission = hasPermission;