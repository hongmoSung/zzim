var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cron = require('./cron');
var db = require('./ourDb.js');
var tr = require('./track.js');
var CryptoJS = require("crypto-js");
var cart = require('./cart');
var setCookies = require('./setUserCookies');
var  fs = require("fs");
var user = require('./user.js');
require('date-utils');
process.setMaxListeners(100);

/*
var options = {
    key: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/zzim-node.zz.am_20170907M39K.key.pem'),
    cert: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/zzim-node.zz.am_20170907M39K.crt.pem'),
    ca: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/RootChain/ca-bundle.pem')
};
*/
// var options = {
//     key: fs.readFileSync('./comodo/zzim-node.zz.am_20170907M39K.key.pem'),
//     cert: fs.readFileSync('./comodo/zzim-node.zz.am_20170907M39K.crt.pem'),
//     ca: fs.readFileSync('./comodo/RootChain/ca-bundle.pem')
// };
//
// var https = require('https');
// https.createServer(options,app).listen(3003,function () {
//     console.log("3003 running");
//     cron.batch();
// })


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/track", function(req, res) {
    var url = req.body.url;
    tr.chase(url, function(result) {
        res.send(result);
    });
});

app.post('/cart', function (request, response) {
    var email = request.body.email;
    cart.cartCrawling(email, function (result) {
        console.log(result);
        response.status(200).json(result);
    });
});
app.post('/checkEmail',function(request,response){
    var loginData = {
        email :  request.body.email,
        website : request.body.website,
        websiteId : request.body.websiteId,
        websitePw : request.body.websitePw
    }
    console.log("/checkEmail::",loginData);
    setCookies.setWebsiteCookies(loginData,function(result){
        console.log("result:::",result);
        response.status(200).json({"result":result});
    })
});
app.post("/addDB", function(req, res) {
  var data = {
    'pName': req.body.pName,
    'notifyPrice': req.body.notifyPrice,
    'crawlingUrl': req.body.crawlingUrl,
    'email': req.body.email
  }
  tr.startTracking(data, function(result) {
      res.send(result);
  });
});

app.post("/reSearch", function(req, res) {
  var data = {
    'title': req.body.reSearchTitle,
    'url': req.body.url
  }
  tr.reSearch(data, function(result) {
    res.send(result);
  });
});

app.post("/login", function(req, res) {
  var data = {
    'inputEmail': req.body.email,
    'inputPW': req.body.password,
  }
  user.login(data, function(result) {
    res.send(result);
  });
});

app.listen(3003, function(req, res) {
    console.log('connected 3003 server');
    cron.batch();
});
/*
*/
