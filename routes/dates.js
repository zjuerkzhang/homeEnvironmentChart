var express = require('express');
var router = express.Router();
var redis = require("redis");

/* GET home page. */
router.get('/', function(req, res, next) {
  var dates = {};
  var client = redis.createClient();

  res.setHeader('Content-Type', 'application/json');
  client.on("error", function (err) {
    console.log("Fetch dates: Error " + err);
    res.send(JSON.stringify(dates));
    return;
  });

  client.on("ready", function(result) {
    console.log("Fetch dates: Redis ready");
    client.keys("humidity:*", function(err, keys) {
        if (err) {
            console.log("Fetch dates: Error " + err);
        }
        else {
          dates = keys.map(function(key) {
            return key.split(':')[1];
          });
        }
        client.quit();
        res.send(JSON.stringify(dates));
    });
  });
});

module.exports = router;
