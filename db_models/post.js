const mongoose = require("mongoose");

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

const Post = mongoose.model("Post", postSchema);

module.exports = Post;