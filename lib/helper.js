
//outputs a number in (xxx) xxx-xxxx format
var prettyPhone = function(number)
{
	if(number.length >= 10)
	{
		return "(" + number.slice(-10,-7) + ") " + number.slice(-7,-4) + "-" + number.slice(-4); 
	}
	else
	{
		return number;;
	}
}

module.exports.prettyPhone = prettyPhone;