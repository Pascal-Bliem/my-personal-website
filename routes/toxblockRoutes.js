const express = require("express");
const fetch = require("node-fetch");
const { Router } = require("express");
const router = express.Router();

// async posts input data to the single-prediction 
// ToxBlock REST API and returns the predictions as response
const postToToxBlockAPI = async (url, content, res) => {
    try {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body: JSON.stringify(content)
        })
            .then(res => res.json())
            .then(body => {
                res.send(body)
            });
    } catch (error) {
        console.log(error);
    }
}

// routes for the ToxBlock page, the POST
// posts input text to the ToxBlock REST API
router.route("/tox-block")
    .get((req, res) => {
        res.render("toxblock", { pageTitle: "ToxBlock" });
    })
    .post((req, res) => {
        postToToxBlockAPI("https://tox-block-api.herokuapp.com/v1/make_single_prediction",
            req.body,
            res);
    })

// this get will be requested when the ToxBlock (toxblock.ejs)
// page is loaded to asyncly check for the ToxBlock API health
const getHealthStatus = async (url, res) => {
    try {
        fetch(url, { method: "GET" })
            .then(res => res.text())
            .then(body => {
                res.send(body)
            });
    } catch (error) {
        console.log(error);
    }
}

// GET route to check for the API health
router.get("/toxblock-api-health", (req, res) => {
    getHealthStatus("https://tox-block-api.herokuapp.com/health", res);
})

module.exports = router;