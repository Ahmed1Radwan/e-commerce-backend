var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

// extra packages
const mongoSanitize = require('express-mongo-sanitize');
const fileUpload = require('express-fileupload');

// middleware
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var productRouter = require('./routes/products');
var reviewRouter = require('./routes/reviews');
var orderRouter = require('./routes/orders');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.set('trust proxy', 1); // to push out api into heroku 
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
}));
app.use(helmet());
app.use(cors({  // to make credentials work must add it true and set the origin that accept the credentials also in the client side make credentials true in request
  credentials: true,
  origin: 'http://localhost:3001',
}));
app.use(xss());
app.use(mongoSanitize());
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
