const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');

// Used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

// for storing the session information into the database
const MongoStore = require('connect-mongodb-session')(session);

// SASS
const sassMiddleware = require('node-sass-middleware');

app.use(sassMiddleware({
    src: '/assets/scss',    // from where to pickup the scss files to convert to css
    dest: '/assets/css',    // where to put the css files
    debug: true,
    outputStyle: 'extended',    // single line or multiple line ?
    prefix: '/css' // where should the server lookout for css files
}));

app.use(express.urlencoded());

app.use(cookieParser());

// Defining that in which folder the app should look for the static files
app.use(express.static('./assets'));

// Layout defines where is the variable part on the website situated
app.use(expressLayouts);

// Extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// We want to use ejs as our view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// mongo store is used to store the session cookie in the db
// this middleware takes the session cookie and encrypts it
app.use(
    session({
    name: 'codeial',
    secret: 'something',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 100,
    },
    store: new MongoStore({
            mongooseConnection: db,
            autoRemove: 'disabled',        
        }),
        function(err){
            console.log(err || 'connect - mongodb setup ok');
        }
    })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// Use express router for all the calls to the links of the website
app.use('/', require('./routes'));

app.listen(port, function(err){
    if (err)
    {
        console.log(`Error in running the server: ${err}`);
    }   

    console.log(`Server is running on port: ${port}`);
});