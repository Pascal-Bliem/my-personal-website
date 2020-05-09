require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");

const app = express();

//  set up, public files, view engine, session etc.
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());

// connect to MongoDB Atlas
const dbConnection = process.env.DBCONNECTION
mongoose.connect(dbConnection, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// create a user schema and model with passport-local-mongoose plugin for user authentication
const userSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    roles: [String],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create a blog post schema and model
const postSchema = mongoose.Schema({
    title: String,
    title_lower: String,
    subTitle: String,
    titleImage: String,
    author: String,
    datePublished: Date,
    tags: [String],
    content: String
})

const Post = mongoose.model("Post",postSchema);


// HOME route
app.get("/", (req, res) => {
    res.render("index", {pageTitle: "Pascal Bliem"});
})

// routes for the blog page with default and admin view
app.get("/blog", (req, res) => {
    if(req.isAuthenticated() && req.user.roles.includes("admin")) {
        res.render("blog_admin", {pageTitle: "Blog Admin"});
    }
    else {
        res.render("blog", {pageTitle: "Blog"});
    }
});

// routes for the compose page is only accessible if user is authenticated and admin
app.route("/blog/compose")
.get((req, res) => {
    if(req.isAuthenticated() && req.user.roles.includes("admin")) {
        res.render("compose", {pageTitle: "Compose", currDate: new Date().toISOString().slice(0, 10) });
    }
    else {
        res.render("login", {pageTitle: "Log in"});
    }
    // res.render("compose", {pageTitle: "Compose", currDate: new Date().toISOString().slice(0, 10) });
})
.post((req, res) => {
    // create a new post object and save it to the data base
    // if saving successful, redirect to the post page
    const post = Post({
        title: req.body.postTitle,
        title_lower: _.lowerCase(req.body.postTitle),
        subTitle: req.body.postSubTitle,
        titleImage: req.body.postTitleImage,
        author: req.user.username,
        datePublished: req.body.postDatePublished,
        tags: req.body.postTags.split(" "),
        content: req.body.postContent
    });

    post.save(err => {
        if (err) {
          console.log(err);
          res.send("Oops something went wrong when saving the post :(");
        } else {
          res.redirect(`/blog/${_.lowerCase(req.body.postTitle)}`);
        }
    });
});

// getting the blog post form the corresponding route parameters
app.get("/blog/:postName", function(req, res){
    const requestedTitle = _.lowerCase(req.params.postName);
    
    Post.findOne({title_lower: requestedTitle}, (err, foundPost) => {
      if (err) {
        console.log(err);
        res.send("Oops something went wrong when querying the data base :(");
      } 
      else if (!foundPost){
        res.send("No post with the requested title found :(");
      } 
      else  {
        res.render("post", {
          pageTitle: foundPost.title,  
          title: foundPost.title,
          content: foundPost.content,
          subTitle: foundPost.subTitle,
          titleImage: foundPost.titleImage,
          author: foundPost.author,
          datePublished: foundPost.datePublished,
          tags: foundPost.tags
        });
      }
    })
  });

// registering users (should normally not be accessible as long as I am the only user of the blog)
// app.route("/register")
// .get((req, res) => {
//     res.render("register", {pageTitle: "Register"});
// })
// .post((req, res) => {
//     User.register({username: req.body.username, email: req.body.email, roles: ["user"]}, req.body.password, (err, user) => {
//         if(err) {
//             console.log(err);
//             res.redirect("/register");
//         } else {
//           passport.authenticate('local')(req, res, function() {
//               console.log("Registration successful");
//               res.redirect("/blog");
//           }); 
//         }
//     })
// });

// user login
app.route("/login")
.get((req, res) => {
    res.render("login", {pageTitle: "Log in"});
})
.post((req, res) => {
    const user = User({
        username: req.body.username,
        password: req.body.password
       });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/blog");
            });
        }
    })
});






// start the app
app.listen(3000, function() {console.log("Server started on port 3000")});