var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cron = require('./cron');
var db = require('./ourDb.js');
var tr = require('./track.js');
var CryptoJS = require("crypto-js");
var cart = require('./cart');
var setCookies = require('./setUserCookies');

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
    console.log("/cart :: email ::",email);
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
    console.log(loginData);
    setCookies.setWebsiteCookies(loginData,function(result){
        console.log("result:::",result);
        response.status(200).json({"result":result});
    })
});
app.post("/addDB", function(req, res) {
  //console.log("************* addTracking server *************");
  var pName = req.body.pName;
  var notifyPrice = req.body.notifyPrice;
  var crawlingUrl = req.body.crawlingUrl;
  var email = req.body.email;
  /*
  var pUrl = req.body.pUrl;
  var pLowest = req.body.pLowest;
  var picUrl = req.body.picUrl;
  var email = req.body.email;
  */
  db.selectProduct(pName, function(err, rows) {
    if(rows) {
      // 조회된 상품이 있는경우
      var pNo = rows[0].pNo;
      console.log('이미 등록된 상품');
      // tracking 추가
      db.checkTracking(email, pNo, function(err, rows) {
        if(rows) {
          console.log('이미 트렉킹중인 제품');
          res.send({
          result: false,
          msg: "이미 트렉킹중인 제품"
          });
        } else {
          console.log('트레킹중이 아닌제품');
          db.addTracking(email, pNo, notifyPrice, function(err, result) {
            if(err) {
              res.send({
                result: false,
                msg: "트렉킹 실패"
              });
              return;
            }

            if(result) {
              console.log('트렉킹 성공');
              res.send({
                result: true,
                msg: "트렉킹 성공"
              });
            } else {
              console.log('트렉킹 실패');
              res.send({
                result: false,
                msg: "트렉킹 실패"
              });
            }
          });
        }
      });
    } else {
      // 조회된 상품이 없는경우
      console.log('조회된 상품이 없습니다.');
      tr.track(crawlingUrl, function(err, result) {
        var data = result;
        db.addProduct(data, function(err, result) {
          if(err) {throw err;}
          if(result) {
            console.log("상품등록 성공");
            db.selectProduct(pName, function(err, rows) {
              var pNo = rows[0].pNo;
              if(rows) {
                db.addTracking(email, pNo, notifyPrice, function(err, result) {
                  if(err) {throw err}
                  if(result) {
                    console.log('트렉킹 성공');
                    res.send({
                    result: true,
                    msg: "트렉킹 성공"
                    });
                  } else {
                    console.log('트렉킹 실패');
                    res.send({
                    result: false,
                    msg: "트렉킹 실패"
                    });
                  }
                });
              }
            });
          } else {
            console.log("등록 실패");
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
  console.log('reSearch 서버......');
  var reSearchTitle = req.body.reSearchTitle;
  var url = req.body.url;
  console.log('server에서의 reSearchTitle ::::', reSearchTitle);
  tr.reSearch(reSearchTitle, url, function(result) {
    console.log('result ::::::::::::::', result);
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
      //console.log('::::::::::::::::::::::::::::', password.toString());
      var result = (inputPW == password.toString());
      //console.log('result::::::::::::::::::::::::::::', result);
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

app.listen(3003, function(req, res) {
    console.log('connected 3003 server');
    cron.batch();
});
