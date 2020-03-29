const axios = require("axios");

const baseUri = process.env.BASE_URI || "localhost:8000";
const httpOptions = {
  headers: {
    "Content-Type": "application/json"
  }
};

var MessageForwarder = {};

MessageForwarder.forward = function(uri, message) {
  let data = JSON.stringify({
    resources: message
  });
  console.log(data);
  axios
    .post(
      baseUri + uri,
      data,
      httpOptions
    )
    .then(function(response) {
      console.log(response.data);
    })
    .catch(function(err) {
      console.log(err);
    });
};

module.exports = MessageForwarder;
