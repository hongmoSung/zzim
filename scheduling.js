var db = require('./ourDb.js');
const async = require('async');
var tr = require('./track.js');
var fire = require('./fcm.js');
var selenium = require('./selenium.js');

var msg = '에러를 발견하지 못함..';
function scheduling(func) {
    var a = [];
    db.selectAllProduct(function(err, rows) {
      if(err) {return msg = 'selectAllProduct err';}
      if(rows) {
        if(rows.length > 0) {
          rows.forEach(function (row, i) {
            a[i] = row;
            tr.cronCrawling(a[i].crawlingUrl, function(err, product) {
            // tr.track(a[i].crawlingUrl, function(err, product) {
              // console.log('크롤링후의 상품 url', product.pUrl);
              // console.log('크롤링후의 상품 cmpnyc', product.cmpnyc);
              if(err) {
                msg = 'cronCrawling err :::::::::::::::::::: ', a[i].pNo;
              } else {

                product.pNo = a[i].pNo;
                db.addHistory(product, function(err, result) {
                  if(err) {
                    return msg = 'addHistory err';
                  } else {
                    if(a[i].pLowest != product.pLowest) {
                      console.log('가격변동', product.pNo);
                      ////////////////////////////////////////////////
                      var cmpnyc = product.cmpnyc;
                      if(cmpnyc == 'EE128' || cmpnyc == 'TH201' || cmpnyc == 'EE715' || cmpnyc == 'TN920' || cmpnyc == 'TN729' || cmpnyc == 'ED910') {
                        console.log('대기업 가격변동,,,, :::::::  ', product.pNo);
                        subScheduling(product, function(err, result) {
                          if(err) {} else {
                            msg = '스케쥴링 성공';
                          }
                        });
                      } else {
                        db.selectSite(cmpnyc, function(err, rows) {
                          if(err) {msg = 'selectSite err'}
                          if(rows) {
                            // console.log('회사 로우', rows);
                            // console.log('selenium 대상이 아닌것들,,,,', a[i].pNo);
                            rows.forEach(function (row, i) {
                              // console.log('selenium 대상이 아닌것들,,,, :::::::  ', row.cmpnyUrl + '?nProdCode=' + product.pcode);
                              console.log('selenium 대상이 아닌것,,,, :::::::  ',product.pNo);
                              product.pUrl = row.cmpnyUrl + '?nProdCode=' + product.pcode;
                          	});
                            console.log('가격변동', product.pNo);
                            subScheduling(product, function(err, result) {
                              if(err) {} else {
                                msg = '스케쥴링 성공';
                              }
                            });
                          } else {
                            console.log('selenium 대상,,,, :::::::  ',product.pNo);
                            // console.log('selenium 대상들,,,,', a[i].pNo);
                            // console.log('selenium 대상들,,,,', a[i].pUrl);
                            selenium.updateProductFromSelenium(product, function(err, result) {
                              console.log(result);
                            })
                          }
                        });
                      }
                      ///////////////////////////////////////////////
                    } else {
                      console.log('가격변동 없음', product.pNo);
                    }
                  }
                });
              }
            });
        	});
        }
      } else {
        msg = '상품이 존재하지 않습니다.';
      }
    });
    func(msg);
}

function subScheduling(product, callback) {
  db.updateProduct(product, function(err, result) {
    if(err) {msg = 'updateProduct err'; callback(err);}
    if(result) {
      db.selectTracking(product.pNo, function(err, rows, fields) {
        if(err) {
          msg = 'selectTracking err';
        }
        if(rows) {
          var data = rows;
          db.selectToken(rows, function(err, rows) {
            if(err) {msg = 'selectToken err';}
            var tokenArrWeb = [];
            var tokenArrAndroid = [];
            if(rows) {
              console.log('가격변동...', rows);
              // rows.forEach(function (row, i) {
              //   switch (row.device) {
              //     case 1: tokenArrWeb.push(row.token);
              //     break;
              //     case 2: tokenArrAndroid.push(row.token);
              //     break;
              //     default:
              //   }
              // });
            } else {
              msg = 'selectToken 없음';
            }
            // fire.sendNotificationWeb(product.pName, product.pNo, tokenArrWeb);
            // fire.sendNotificationAndroid(product.pName, product.pNo, tokenArr);
          });
        } else {
          console.log('가격변동 상품중에 알림가격을 만족하는 상품이 없습니다. 상품코드 ::: ', product.pNo);
          callback(null);
        }
      });
    }
  });
}




module.exports.scheduling = scheduling;
