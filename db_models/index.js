const mongoose = require("mongoose");

// connect to MongoDB Atlas
const dbConnection = process.env.DBCONNECTION
mongoose.connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// allow mongoose to use the .then() promise syntax
mongoose.Promise = Promise;

// export the Todo model
module.exports.User = require("./user");
module.exports.Post = require("./post");