var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var mySqlSessionStore = require('express-mysql-session')(session);



var index = require('./routes/index');
var users = require('./routes/user/user');
var login = require('./routes/login');
var referral = require('./routes/referral');

var config = require('./config');
var database = require('./database');
var authentication = require('./lib/authentication');

var helper = require('./lib/helper');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//mysql session setup
const cookieOptions = {
    checkExpirationInterval: 1000 * 60 * 15,// 15 min // How frequently expired sessions will be cleared; milliseconds.
    expiration: 1000 * 60 * 60 * 24,// 1 week // The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};
const sessionStore = new mySqlSessionStore(cookieOptions,database.db);

//session setup with mysql store
app.use(session({
	secret: 'popsicle',
	store:sessionStore,
	saveUninitialized:false,
	resave:false
}));

//passport
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


//config file
app.locals.configFile = config;
app.locals.helper = helper;



//routing



app.use(express.static(__dirname + '/public'));

//sets the user object into the res variable to be used in all ejs files
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

app.use('/', [authentication.isLoggedIn,index]);
app.use('/users', users);

app.use('/login', login);

app.use('/referral',referral)	;


app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/login');
});








// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
