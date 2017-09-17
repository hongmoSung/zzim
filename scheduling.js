var db = require('./ourDb.js');
const async = require('async');
var tr = require('./track.js');
var fire = require('./fcm.js');
var selenium = require('./selenium.js');

function scheduling() {
    var a = [];
    db.selectAllProduct(function(err, rows) {
      if(err) {
        return msg = 'selectAllProduct err';
        console.log('selectAllProduct err');
      } else {
        if(rows) {
          if(rows.length > 0) {
            console.log('totalProduct ::::::::::::::', rows.length);
            rows.forEach(function (row, i) {
              a[i] = row;
              tr.cronCrawling(a[i].crawlingUrl, function(err, product) {
                if(err) {
                  // msg = 'cronCrawling err :::::::::::::::::::: ', a[i].pNo;
                  console.log('cronCrawling err ::::::::::::::::::::', a[i].pNo);
                } else {
                  product.pNo = a[i].pNo;
                  db.addHistory(product, function(err, result) {
                    if(err) {
                      // return msg = 'addHistory err';
                      // msg = '스케쥴링 실패';
                      console.log('addHistory err');
                    } else {
                      // msg = '스케쥴링 성공';
                      if(a[i].pLowest != product.pLowest) {
                        var cmpnyc = product.cmpnyc;
                        if(cmpnyc == 'EE128' || cmpnyc == 'TH201' || cmpnyc == 'EE715' || cmpnyc == 'TN920' || cmpnyc == 'TN729' || cmpnyc == 'ED910') {
                          console.log('대기업 가격변동,,,, :::::::  ', product.pNo);
                          subScheduling(product);
                        } else {
                          db.selectSite(cmpnyc, function(err, rows) {
                            console.log('가격변동 중 selenium 대상이 아닌것,,,, :::::::  ',product.pNo);
                            if(err) {
                              console.log('selectSite err::::::::::::::::::::::', cmpnyc);
                              // return msg = 'selectSite err',
                            } else {
                              if(rows) {
                                console.log('rows::::', rows);
                                rows.forEach(function (row, i) {
                                  product.pUrl = row.cmpnyUrl + '?nProdCode=' + product.pcode;
                                });
                                subScheduling(product);
                              } else {
                                console.log('selenium 대상,,,, :::::::  ',product.pNo);
                                selenium.updateProductFromSelenium(product, function(err, result) {
                                  if(err) {
                                    // msg = 'updateProductFromSelenium err';
                                    console.log('updateProductFromSelenium err');
                                  } else {
                                    if(result) {
                                      console.log(result);
                                      // msg = 'updateProductFromSelenium success';
                                      console.log('updateProductFromSelenium success');
                                    }
                                  }
                                })
                              }
                            }
                          });
                        }
                      } else {
                        // console.log('가격변동 없음', product.pNo);
                        // msg = '스케쥴링 성공'
                      }
                    }
                  });
                }
              });
            });
          }
        } else {
          // msg = '상품이 존재하지 않습니다.';
        }
      }
    });
}

function subScheduling(product) {
  db.updateProduct(product, function(err, result) {
    if(err) {
      console.log('updateProduct err');
    } else {
      // callback(err);
      if(result) {
        db.selectTracking(product.pNo, function(err, rows, fields) {
          if(err) {
            console.log('selectTracking err');
            // callback(err);
          } else {
            if(rows) {
              var data = rows;
              db.selectToken(rows, function(err, rows) {
                if(err) {
                  console.log('selectToken err');
                  // callback(err);
                } else {
                  var tokenArrWeb = [];
                  var tokenArrAndroid = [];
                  if(rows) {
                    console.log('가격변동...', rows);
                    // callback(null, rows);
                    rows.forEach(function (row, i) {
                      switch (row.device) {
                        case 1: tokenArrWeb.push(row.token);
                        break;
                        case 2: tokenArrAndroid.push(row.token);
                        break;
                        default:
                      }
                    });
                  } else {
                    // msg = 'selectToken 없음';
                    console.log('selectToken 없음');
                    // callback(err);
                  }
                  fire.sendNotificationWeb(product.pName, product.pNo, tokenArrWeb);
                  fire.sendNotificationAndroid(product.pName, product.pNo, tokenArr);
                }
              });
            } else {
              console.log('가격변동 상품중에 알림가격을 만족하는 상품이 없습니다. 상품코드 ::: ', product.pNo);
              // callback(null);
            }
          }
        });
      }
    }
  });
}




module.exports.scheduling = scheduling;
