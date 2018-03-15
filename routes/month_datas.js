var express = require('express');
var router = express.Router();
var redis = require("redis");
var _ = require("underscore");

/* GET users listing. */
router.get('/', function(req, res, next) {
  var ret_data = {};
  var month = req.query.month;

  res.setHeader('Content-Type', 'application/json');
  var client = redis.createClient();

  client.on("error", function (err) {
    console.log("Fetch env date: Error " + err);
    res.send(JSON.stringify(ret_data));
    return;
  });

  client.on("ready", function(result) {
    console.log("Fetch env date: Redis ready");
    client.keys("*:" + month + "*", function(err, keys) {
      if (err) {
        console.log("Fetch keys: Error " + err);
        client.quit();
        res.send(JSON.stringify(ret_data));
      }
      else {
        var humi_cmds = keys.filter(function(key) {
          return key.indexOf("humidity") >= 0;
        })
        .map(function(key) {
          return ["hgetall", key];
        });
        var temp_cmds = keys.filter(function(key) {
          return key.indexOf("temperature") >= 0;
        })
        .map(function(key) {
          return ["hgetall", key];
        });
        var cmds = humi_cmds.concat(temp_cmds);
        client.multi(cmds).exec(function(err, objs) {
          if (err) {
            console.log("Fetch humidity and temperature data: Error " + err);
            client.quit();
            res.send(JSON.stringify(ret_data));
          }
          else {
            ret_data = {humidity: [], temperature: []};
            objs.forEach(function(obj, index) {
              var data = {
                date: cmds[index][1].split(":")[1],
                low: _.min(_.values(obj)),
                high: _.max(_.values(obj))
              };
              if (index < humi_cmds.length) {
                ret_data.humidity.push(data);
              }
              else {
                ret_data.temperature.push(data);
              }
            });
            client.quit();
            res.send(JSON.stringify(ret_data));
          }
        });
      }
    });
  });
});

module.exports = router;