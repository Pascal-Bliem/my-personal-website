const express = require("express");
const { Router } = require("express");
const router = express.Router();
const passport = require("passport");
const _ = require("lodash");
const marked = require("marked");
const db = require("../db_models");

// HOME route (if no data base error, send blog post for the post carousel)
router.get("/", (req, res) => {
    db.Post.find({}).sort({ datePublished: -1 }).exec((err, foundPosts) => {
        if (err) {
            console.log(err);
            res.render("index", { pageTitle: "Pascal Bliem", carouselPosts: false });
        } else {
            res.render("index", { pageTitle: "Pascal Bliem", carouselPosts: foundPosts });
        }
    })
});

// this function find posts according to a search condition 
// and renders them on the blog summary page, also checks
// if user is authenticated as admin
function renderPosts(condition, req, res) {
    db.Post.find(condition).sort({ datePublished: -1 }).exec((err, foundPosts) => {
        if (err) {
            console.log(err);
            res.send("Ooops something went wrong when looking for posts :(")
        } else {
            let isAdmin = false;
            if (req.isAuthenticated() && req.user.roles.includes("admin")) {
                isAdmin = true;
            }
            res.render("blog", { pageTitle: "Pascal's Blog", isAdmin: isAdmin, foundPosts: foundPosts, marked: marked });
        }
    })
};

// routes for the blog page, potentially filtered for keywords
// the admin vies is handled in renderPosts()
router.route("/blog")
    .get((req, res) => {
        renderPosts({}, req, res);
    })
    .post((req, res) => {
        renderPosts({ tags: req.body.keywords[0] }, req, res);
    });

// routes for the compose page is only accessible if user is authenticated and admin
router.route("/compose")
    .get((req, res) => {
        if (req.isAuthenticated() && req.user.roles.includes("admin")) {
            res.render("compose", { pageTitle: "Compose", currDate: new Date().toISOString().slice(0, 10) });
        }
        else {
            res.render("login", { pageTitle: "Log in" });
        }
        // res.render("compose", {pageTitle: "Compose", currDate: new Date().toISOString().slice(0, 10) });
    })
    .post((req, res) => {
        // create a new post object and save it to the data base
        // if saving successful, redirect to the post page
        const post = db.Post({
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

router.get("/blog/:postName", function (req, res) {
    const requestedTitle = _.lowerCase(req.params.postName);

    db.Post.findOne({ title_lower: requestedTitle }, (err, foundPost) => {
        if (err) {
            console.log(err);
            res.send("Oops something went wrong when querying the data base :(");
        }
        else if (!foundPost) {
            res.send("No post with the requested title found :(");
        }
        else {

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
router.post("/edit/:postName", function (req, res) {
    const requestedTitle = _.lowerCase(req.params.postName);

    db.Post.findOne({ title_lower: requestedTitle }, (err, foundPost) => {
        if (err) {
            console.log(err);
            res.send("Oops something went wrong when querying the data base :(");
        }
        else if (!foundPost) {
            res.send("No post with the requested title found :(");
        }
        else {

            if (req.isAuthenticated() && req.user.roles.includes("admin")) {
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
                res.render("login", { pageTitle: "Log in" });
            }
        }
    })
});

// looks up a post and updates it with the body parameters from the post request form
router.post("/update", (req, res) => {

    if (req.isAuthenticated() && req.user.roles.includes("admin")) {
        const requestedTitle = req.body.postTitleLower;

        db.Post.findOneAndUpdate(
            { title_lower: requestedTitle },
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
            { useFindAndModify: false },
            (err, postBeforeUpdate) => {
                if (err) {
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
router.post("/delete", (req, res) => {

    if (req.isAuthenticated() && req.user.roles.includes("admin")) {
        const requestedTitle = req.body.postTitleLower;

        db.Post.findOneAndDelete(
            { title_lower: requestedTitle },
            (err, deletedPost) => {
                if (err) {
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
// router.route("/register")
// .get((req, res) => {
//     res.render("register", {pageTitle: "Register"});
// })
// .post((req, res) => {
//     db.User.register({username: req.body.username, email: req.body.email, roles: ["user"]}, req.body.password, (err, user) => {
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
router.route("/login")
    .get((req, res) => {
        res.render("login", { pageTitle: "Log in" });
    })
    .post((req, res) => {
        const user = db.User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/blog");
                });
            }
        })
    });

module.exports = router;