require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const app = express();

//  set up, public files, view engine, session etc.
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// importing and using the home and blog routes
const homeAndBlogRoutes = require("./routes/homeAndBlogRoutes");
app.use(homeAndBlogRoutes);

// importing and using the ToxBlock routes
const toxblockRoutes = require("./routes/toxblockRoutes");
app.use(toxblockRoutes);

// start the app
const PORT = process.env.PORT || 8081
app.listen(PORT, function () { console.log(`Server started on port ${PORT}`) });