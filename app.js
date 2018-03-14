let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let router = express.Router();
let fs = require('fs');
let keys = require('./config/keys');
var mongoose = require('mongoose');
let cors = require('cors');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
const passport = require('passport');
const expressValidator = require('express-validator');

let app = express();
app.use(expressValidator())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect(keys.mongodb.dbURI, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('connected to mongodb');
  }
});

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

let modelFiles = fs.readdirSync(__dirname + '/models');

modelFiles.forEach(function (file) {
  if (file.match(/\.js$/) !== null) {

    try{
      let modelName = file.replace('.js', '');
      modelName = require('./models/' + file);

    }catch(err){
      console.error('error requiring models',err);
    }

  }
});


app.use('/', router);
let files = fs.readdirSync(__dirname + '/routes');

files.forEach(function (file) {
  if (file.match(/\.js$/) !== null) {

    try{
      let name = file.replace('.js', '');
      name = require('./routes/' + file);

      router.use(name);
    }catch(err){
      console.error('error requiring routes',err);
    }

  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err)
  res.status(err.status || 500).send(err.stack);
});

module.exports = app;
