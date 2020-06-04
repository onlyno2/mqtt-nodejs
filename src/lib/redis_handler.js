const redis = require("redis");
const MessageForwarder = require("./message_forwarder.js");

const redisSettings = {
  port: 6379,
  host: "redis"
};
const redisClient = redis.createClient(redisSettings.port, redisSettings.host);

var RedisHandler = {};

RedisHandler.storeMessage = function(package, client) {
  let data = {
    payload: JSON.parse(package.payload.toString()),
    client_id: client.id
  };

  redisClient.set(
    package.topic + "_" + package.messageId,
    JSON.stringify(data)
  );
};

var messageList = [];
RedisHandler.getMessage = function(chanel) {
  redisClient.keys(chanel + "_*", function(err, keys) {
    if (err) {
      console.log(err);
      return;
    } else {
      let counter = keys.length;
      keys.forEach(function(key) {
        redisClient.get(key, function(err, value) {
          if (value) {
            messageList.push(JSON.parse(value));
            redisClient.del(key);
            counter--;
            if (counter == 0) {
              MessageForwarder["forward"]("/api/store_data", messageList);
              messageList.length = 0;
            }
          }
        });
      });
    }
  });
};

module.exports = RedisHandler;
