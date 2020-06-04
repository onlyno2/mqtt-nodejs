const axios = require("axios");

const baseUri = process.env.BASE_URI || "localhost:8000";
const httpOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

const authCredentials = {
  name: process.env.NAME,
  password: process.env.PASSWORD
}

var MessageForwarder = {};

MessageForwarder.forward = function (uri, message) {
  let data = JSON.stringify({
    resources: message,
    auth: authCredentials
  });
  axios
    .post(baseUri + uri, data, httpOptions)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (err) {
      console.log(err);
    });
};

MessageForwarder.postDeviceId = function (uri, message) {
  let data = JSON.stringify({
    device_id: message,
    auth: authCredentials
  });
  axios
    .post(baseUri + uri, data, httpOptions)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (err) {
      console.log(err);
    });
};

module.exports = MessageForwarder;
