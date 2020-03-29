require('dotenv').config();
const mosca = require("mosca");

const RedisHandler = require("./src/lib/redis_handler.js");

var moscaSettings = {
  port: 18833
};

var server = new mosca.Server(moscaSettings);

server.on("clientConnected", function(client) {
  console.log(`Client connected`, client.id);
});

server.on("published", function(package, client) {
  if (client) {
    RedisHandler["storeMessage"](package, client);
  }
});

server.on("ready", function() {
  console.log("MQTT server running");
});

setInterval(() => getAllMessage(), 4000);

function getAllMessage() {
  RedisHandler["getMessage"]("MyTopic");
}
