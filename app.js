require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");
const marked = require("marked");

const app = express();

//  set up, public files, view engine, session etc.
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

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
    titleImageAlt: String,
    author: String,
    datePublished: Date,
    tags: [String],
    content: String
})

const Post = mongoose.model("Post",postSchema);

// HOME route (if no data base error, send blog post for the post carousel)
app.get("/", (req, res) => {
    Post.find({}).sort({datePublished: -1}).exec((err, foundPosts) => {
        if (err) {
            console.log(err);
            res.render("index", {pageTitle: "Pascal Bliem", carouselPosts: false});
        } else {
            res.render("index", {pageTitle: "Pascal Bliem", carouselPosts: foundPosts});
        }
    })
});

// this function find posts according to a search condition 
// and renders them on the blog summary page, also checks
// if user is authenticated as admin
function renderPosts(condition, req, res) {
    Post.find(condition).sort({datePublished: -1}).exec((err, foundPosts) => {
        if (err) {
            console.log(err);
            res.send("Ooops something went wrong when looking for posts :(")
        } else {
            let isAdmin = false;
            if(req.isAuthenticated() && req.user.roles.includes("admin")) {
                isAdmin = true;
            }
            res.render("blog", {pageTitle: "Pascal's Blog", isAdmin: isAdmin, foundPosts: foundPosts, marked: marked});
        }
    })
};

// routes for the blog page, potentially filtered for keywords
// the admin vies is handled in renderPosts()
app.route("/blog")
.get( (req, res) => {
    renderPosts({}, req, res);
})
.post( (req, res) => {
    renderPosts({tags: req.body.keywords[0]}, req, res);
});

// routes for the compose page is only accessible if user is authenticated and admin
app.route("/compose")
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
        titleImageAlt: req.body.postTitleImageAlt,
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
        
        // check if a user is logged in and if he's admin
        let isAdmin = false;
        if (req.user) {
            isAdmin = req.user.roles.includes("admin");
        } 

        res.render("post", {
          pageTitle: foundPost.title,  
          title: foundPost.title,
          title_lower: foundPost.title_lower,
          subTitle: foundPost.subTitle,
          titleImage: foundPost.titleImage,
          titleImageAlt: foundPost.titleImageAlt,
          author: foundPost.author,
          datePublished: foundPost.datePublished,
          tags: foundPost.tags,
          content: marked(foundPost.content), // convert from markdown to html
          isAdmin: isAdmin
        });
      }
    })
  });

// editing the blog post from corresponding route parameters
app.post("/edit/:postName", function(req, res){
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
        
        if(req.isAuthenticated() && req.user.roles.includes("admin")) {
            res.render("edit", {
                pageTitle: "Edit" + foundPost.title,  
                title: foundPost.title,
                title_lower: foundPost.title_lower,
                subTitle: foundPost.subTitle,
                titleImage: foundPost.titleImage,
                titleImageAlt: foundPost.titleImageAlt,
                author: foundPost.author,
                datePublished: new Date(foundPost.datePublished).toISOString().slice(0, 10),
                tags: foundPost.tags,
                content: foundPost.content,
              });
        }
        else {
            res.render("login", {pageTitle: "Log in"});
        }
      }
    })
});

// looks up a post and updates it with the body parameters from the post request form
app.post("/update", (req, res) => {
    
    if(req.isAuthenticated() && req.user.roles.includes("admin")) {
        const requestedTitle = req.body.postTitleLower;
        
        Post.findOneAndUpdate(
            {title_lower: requestedTitle},
            {
            title: req.body.postTitle,
            title_lower: _.lowerCase(req.body.postTitle),
            subTitle: req.body.postSubTitle,
            titleImage: req.body.postTitleImage,
            titleImageAlt: req.body.postTitleImageAlt,
            author: req.user.username,
            datePublished: req.body.postDatePublished,
            tags: req.body.postTags.split(" "),
            content: req.body.postContent
            },
            {useFindAndModify: false},
            (err, postBeforeUpdate) => {
                if (err){
                    console.log(err);
                    res.send("Oops something went wrong when trying to update the post :(");
                } else {
                    res.redirect(`/blog/${_.lowerCase(req.body.postTitle)}`);
                }
        }); 
    } else {
        res.redirect("/login");
    }
});    

// looks up a post and deletes it
app.post("/delete", (req, res) => {
    
    if(req.isAuthenticated() && req.user.roles.includes("admin")) {
        const requestedTitle = req.body.postTitleLower;
        
        Post.findOneAndDelete(
            {title_lower: requestedTitle},
            (err, deletedPost) => {
                if (err){
                    console.log(err);
                    res.send("Oops something went wrong when trying to delete the post :(");
                } else {
                    res.redirect(`/blog`);
                }
            }
        )
    } else {
        res.redirect("/login");
    }
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
const PORT = process.env.PORT || 8081
app.listen(PORT, function() {console.log(`Server started on port ${PORT}`)});