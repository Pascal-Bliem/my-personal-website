
// template function for HTTP GET request
function httpGetRequest(url, callback) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

// template function for HTTP POST request with JSON data
function httpPostRequest(url, callback, body) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify(body));
}

// callback function receiving the health status form the ToxBlock REST API
// (which was called via the server to avoid CORS trouble) and updates the
// status display on the website accordingly
function checkHealthStatus(responseText) {
    const status = document.getElementById("toxblock-app-status");
    if (responseText === "ok") {
        status.innerText = "online"
        status.style.color = "#2ecc71"
    } else {
        status.innerText = "offline"
        status.style.color = "#e74c3c"
    }
}

// check if the ToxBlock API is online and healthy
httpGetRequest("/toxblock-api-health", checkHealthStatus);


// Everything below here is form validation for the input text
// and handling submission of the form 
const form = document.getElementById("toxblock-form");
const input = document.getElementById("toxblock-input");

// if validation error occurs, display it
function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = "toxblock-form-control error"
    const small = formControl.querySelector("small")
    small.innerText = message;
}

// if validation error was corrected, remove error display
function removeError(input) {
    const formControl = input.parentElement;
    formControl.className = "toxblock-form-control"
}

// validation function to check for empty string input
function noEmptyString(input) {
    if (input.value === "") {
        showError(input, "The input must not be empty.")
        return false;
    } else {
        return true;
    }
}

// validation function to check for string input 
// without latin letters using regex
function noLetters(input) {
    const regex = /[A-Za-z]*/;
    const matches = input.value.match(regex);

    if (matches[0] === "") {
        showError(input, "The input must contain latin letters.")
        return false;
    } else {
        return true;
    }

}

// callback function that receives the predictions returned by the POST 
// request to the ToxBlock REST API and updates the bars and
// bar number labels in the bar chart accordingly
function updateBarChart(responseText) {
    // predictions returned in request response
    const predictions = JSON.parse(responseText)["predictions"]
    const predKeys = ["toxic", "severe_toxic", "obscene", "insult", "threat", "identity_hate"]

    // bar elements
    const toxic = document.getElementById("toxic-bar");
    const severeToxic = document.getElementById("severe-toxic-bar");
    const obscene = document.getElementById("obscene-bar");
    const insult = document.getElementById("insult-bar");
    const threat = document.getElementById("threat-bar");
    const identityHate = document.getElementById("identity-hate-bar");

    const bars = [toxic, severeToxic, obscene, insult, threat, identityHate];

    // number label elements
    const toxicNum = document.getElementById("toxic-bar-number");
    const severeToxicNum = document.getElementById("severe-toxic-bar-number");
    const obsceneNum = document.getElementById("obscene-bar-number");
    const insultNum = document.getElementById("insult-bar-number");
    const threatNum = document.getElementById("threat-bar-number");
    const identityHateNum = document.getElementById("identity-hate-bar-number");

    const numbers = [toxicNum, severeToxicNum, obsceneNum, insultNum, threatNum, identityHateNum];

    // for all six categories, update the bar widths and number labels
    for (i = 0; i < 6; i++) {
        const newWidth = Math.round(predictions[predKeys[i]] * 100);
        bars[i].style.width = `${(newWidth) / 100 * 81 + 1}%`;
        numbers[i].innerText = `${newWidth}%`;
    }
}

// event listener that prevents default form submission,
// performs input data validation, and if input is correct,
// posts the input (via the server to avoid CORS issues) to
// the ToxBlock REST API
form.addEventListener("submit", event => {
    // form input validation
    event.preventDefault();
    const letters = noLetters(input);
    const empty = noEmptyString(input);

    // if input correct, POST to ToxBlock API
    if (empty && letters) {
        removeError(input);
        httpPostRequest("/tox-block", updateBarChart, { input_data: input.value })
    }
})
