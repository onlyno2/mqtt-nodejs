require("dotenv").config();
const mosca = require("mosca");
const axios = require("axios");
var mongodb = require("mongodb").MongoClient;

const baseUri = process.env.BASE_URI || "localhost:8000";
const moscaSettings = {
  port: 1883,
  http: {
    port: 18833,
    bundle: true,
    static: "./",
  }
};

const mongoOptions = {
  host: `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  db: process.env.MONGO_DATABASE,
  auth: `${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}`,
};

var server = new mosca.Server(moscaSettings);

mongodb.connect(
  `mongodb://${mongoOptions.auth}@${mongoOptions.host}/${mongoOptions.db}`,
  function (err, mongoClient) {
    if (err) {
      console.log("no connect created", err);
    } else {
      console.log("connnection created");
      global.mongoConnection = mongoClient.db("mongo");
    }
  }
);

server.on("clientConnected", function (client) {
  console.log(`Client connected`, client.id);
});

server.on("published", function (package, client) {
  if (client) {
    const topic = package.topic.split("/");
    topicBaseCallback[topic.pop()](package, client, topic);
  }
});

server.on("clientDisconnected", function (client) {
  if(client.id === 'dashboard')
    return;
  let data = {
    status: false
  }
  axios.patch(`${baseUri}/api/devices/${client.id}/status`, data).then((res) => {
    console.log('ok');
  }).catch(err => {
    console.log('error');
  })
});

server.on("ready", function () {
  console.log("MQTT server running");
});

var topicBaseCallback = [];

topicBaseCallback["sensorData"] = function (package, client, topic) {
  let collection = mongoConnection.collection("sensor_data");
  let date = new Date();
  let data = JSON.parse(package.payload);
  data.time = date.getMinutes();
  date = date.setMinutes(0, 0, 0);
  collection.updateOne(
    { deviceId: client.id, date: date },
    {
      $push: { values: data },
      $inc: { nsamples: 1 },
    },
    { upsert: true }
  );
};

topicBaseCallback["deviceConnect"] = function (package, client, topic) {
  let data = JSON.parse(package.payload);
  data.id = client.id;
  axios.post(`${baseUri}/api/devices`, data).then(() => {
    console.log("authenticated client " + client.id);
  }).catch((err) => {
    console.log("authenticate failed closing connection with " + client.id);
    client.close();
  });
};
