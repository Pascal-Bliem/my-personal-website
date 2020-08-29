
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// create a user schema and model with passport-local-mongoose plugin for user authentication
const userSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    roles: [String],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;