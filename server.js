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
require('date-utils');
process.setMaxListeners(100);

/*var options = {
    key: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/zzim-node.zz.am_20170907M39K.key.pem'),
    cert: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/zzim-node.zz.am_20170907M39K.crt.pem'),
    ca: fs.readFileSync('C:/Users/SB/Desktop/zzim-node.zz.am_20170907M39K/RootChain/ca-bundle.pem')
};*/

var options = {
    key: fs.readFileSync('./comodo/zzim-node.zz.am_20170907M39K.key.pem'),
    cert: fs.readFileSync('./comodo/zzim-node.zz.am_20170907M39K.crt.pem'),
    ca: fs.readFileSync('./comodo/RootChain/ca-bundle.pem')
};

var https = require('https');
https.createServer(options,app).listen(3003,function () {
    console.log("3003 running");
    cron.batch();
})

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
  //console.log('addDB');
  var pName = req.body.pName;
  var notifyPrice = req.body.notifyPrice;
  var crawlingUrl = req.body.crawlingUrl;
  var email = req.body.email;

  db.selectProduct(pName, function(err, rows) {
    if(rows) {
      // 조회된 상품이 있는경우
      var pNo = rows[0].pNo;
      // console.log('이미 등록된 상품');
      // tracking 추가
      db.checkTracking(email, pNo, function(err, rows) {
        if(rows) {
          // console.log('이미 트렉킹중인 제품');
          res.send({
          result: false,
          msg: "이미 트렉킹중인 제품"
          });
        } else {
          // console.log('트레킹중이 아닌제품');
          db.addTracking(email, pNo, notifyPrice, function(err, result) {
            if(err) {
              res.send({
                result: false,
                msg: "트렉킹 실패"
              });
              return;
            }

            if(result) {
              // console.log('트렉킹 성공');
              res.send({
                result: true,
                msg: "트렉킹 성공"
              });
            } else {
              // console.log('트렉킹 실패');
              res.send({
                result: false,
                msg: "트렉킹 실패"
              });
            }
          });
        }
      });
    } else {
      tr.track(crawlingUrl, function(err, result) {
        var data = result;
        console.log('data .................', data);
        db.addProduct(data, function(err, result) {
          if(err) {
            console.log('addProduct err');
          }
          if(result) {
            db.selectProduct(pName, function(err, rows) {
              var pNo = rows[0].pNo;
              if(rows) {
                db.addTracking(email, pNo, notifyPrice, function(err, result) {
                  if(err) {throw err}
                  if(result) {
                    // console.log('트렉킹 성공');
                    res.send({
                    result: true,
                    msg: "트렉킹 성공"
                    });
                  } else {
                    // console.log('트렉킹 실패');
                    res.send({
                    result: false,
                    msg: "트렉킹 실패"
                    });
                  }
                });
              }
            });
          } else {
            // console.log("등록 실패");
            res.send({
            result: false,
            msg: "트렉킹 실패"
            });
          }
        });
      });
    }
  });
});

app.post("/reSearch", function(req, res) {
  var reSearchTitle = req.body.reSearchTitle;
  var url = req.body.url;
  tr.reSearch(reSearchTitle, url, function(result) {
    // console.log('result ::::::::'. result);
    res.send(result);
  });
});

app.post("/login", function(req, res) {
  var inputEmail = req.body.email;
  var inputPW = req.body.password;
  db.selectUser(inputEmail, function(err, rows) {
    if(err) {throw err;}
    if(rows) {
      var email = rows[0].email;
      var password = rows[0].password;
      var result = (inputPW == password.toString());
      if(result) {
        res.send({
          result:true,
          msg: email + '님 로그인 되었습니다.',
          email: email
        });
      } else {
        res.send({
          result: false,
          msg: 'password를 확인해 주세요'
        });
      }
      /*
      */
    } else {
      res.send({
        result: false,
        msg: '등록되지 않은 email 입니다.'
      });
    }
  });
});

/*app.listen(3003, function(req, res) {
    console.log('connected 3003 server');
    cron.batch();
});*/
