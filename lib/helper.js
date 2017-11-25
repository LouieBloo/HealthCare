var fs = require('fs');


//outputs a number in (xxx) xxx-xxxx format
var prettyPhone = function(number)
{
	if(number && number.length >= 10)
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

var move = function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

module.exports.prettyPhone = prettyPhone;
module.exports.howManyYears = howManyYears;
module.exports.move = move;