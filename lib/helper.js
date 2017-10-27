
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

var howManyYears = function (dt2, dt1) 
{
	var diff =(dt2.getTime() - dt1.getTime()) / 1000;
	diff /= (60 * 60 * 24);
	return Math.abs(Math.round(diff/365.25));
}

module.exports.prettyPhone = prettyPhone;
module.exports.howManyYears = howManyYears;