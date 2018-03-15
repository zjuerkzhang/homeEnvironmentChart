var express = require('express');
var router = express.Router();
var redis = require("redis");
var _ = require("underscore");

/* GET home page. */
router.get('/', function(req, res, next) {
  var monthes = {};
  var client = redis.createClient();

  res.setHeader('Content-Type', 'application/json');
  client.on("error", function (err) {
    console.log("Fetch monthes: Error " + err);
    res.send(JSON.stringify(monthes));
    return;
  });

  client.on("ready", function(result) {
    console.log("Fetch monthes: Redis ready");
    client.keys("humidity:*", function(err, keys) {
        if (err) {
            console.log("Fetch monthes: Error " + err);
        }
        else {
          monthes = keys.map(function(key) {
            var date_array = key.split(':')[1].split('-');
            return date_array[0] + '-' + date_array[1];
          });
          monthes = _.uniq(monthes);
        }
        client.quit();
        res.send(JSON.stringify(monthes));
    });
  });
});

module.exports = router;
