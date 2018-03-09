var express = require('express');
var router = express.Router();
var redis = require("redis");

/* GET users listing. */
router.get('/', function(req, res, next) {
  var ret_data = {};
  var date = req.query.date;

  res.setHeader('Content-Type', 'application/json');
  var client = redis.createClient();
  client.on("error", function (err) {
    console.log("Fetch env date: Error " + err);
    res.send(JSON.stringify(ret_data));
    return;
  });

  client.on("ready", function(result) {
    console.log("Fetch env date: Redis ready");
    client.hgetall("humidity:" + date, function(err, obj) {
        if (err) {
            console.log("Fetch humidity data: Error " + err);
            client.quit();
            res.send(JSON.stringify(ret_data));
        }
        else {
            ret_data.humidity = obj;
            client.hgetall("temperature:" + date, function(err, obj) {
                if (err) {
                    console.log("Fetch temperature data: Error " + err);
                }
                else {
                    ret_data.temperature = obj;
                }
                client.quit();
                res.send(JSON.stringify(ret_data));
            });
        }
    });

  });
});

module.exports = router;