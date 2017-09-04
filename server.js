var express = require('express');
var app = express();
var qs = require('queryString');
var bodyParser = require('body-parser');
//var expressSession = require('express-session');
//const cheerio = require('cheerio');
//var request = require('request');
//
//var selenium = require('./selenium.js');
// crawling
//var cw = require('./crawling.js');

// 데이터 베이스
var db = require('./ourDb.js');
// 트렉킹
var tr = require('./track.js');
// 크론
var cron = require('node-cron');
//
require('date-utils');

console.log('server 실행시간', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));

cron.schedule('0 */1 * * *', function(){
  console.log('~~~~~~~~~~~~~~~ running cron.schedule every second ~~~~~~~~~~~~~~~~', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
  db.selectAllProduct(function(err, result) {
    if(err) {
      console.log('xxxxxxxxxxxxxxxxxxxxxxxxx실패xxxxxxxxxxxxxxxxxxxxxxxxx');
    }else {
      console.log('#########################성공#########################');
    }
  });
});

//jade 설정
//app.locals.pretty = true;
//app.set('view engine', 'jade');
//app.set('views', 'views');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  console.log('server start');
})

app.post("/track", function(req, res) {
  var url = req.body.url;
  tr.chase(url, function(result) {
    res.send(result);
  });
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
  console.log("*********** login **********");
  var email = req.body.email;
  var password = req.body.password;
  db.selectUser(email, password, function(err, rows) {
    if(err) {throw err;}
    //console.log(rows);
    if(rows) {
      var email = rows[0].email;
      //console.log('server에서 받은 email ::: ', email);
      res.send({
                  result:true,
                  msg: email + '님 로그인 되었습니다.',
                  email: email
                });
    } else {
      res.send({
        result: false,
        msg: 'email 또는 password를 확인해 주세요'
      });
    }
  });
});

app.listen(3003, function(req, res) {
    console.log('connected 3003 server');
});
