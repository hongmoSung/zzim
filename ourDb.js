var mysql = require('mysql');
var tr = require('./track.js');
var request = require('request');

var pool = mysql.createPool({
connectionLimit : 10,
host : '192.168.0.11',
user : 'server',
password : 'password',
database : 'server',
debug : false
});

// 상품 추가
function addProduct(data, callback) {
  //console.log('addProduct 호출됨');
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    var exec = conn.query('insert into tbl_product set ?', data, function(err, result) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(err) {
        console.log('SQL 실행 시 오류 발생함.');
        console.dir(err);
        callback(err, null);
        return;
      }
      result.data = data;
      callback(null, result);
    });
  });
}

// 상품 history 추가
function addHistory(product, callback) {
  //console.log('addHistory 호출됨');
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var data = {
      pNo: product.pNo,
      currPrice: product.pLowest
    }
    var exec = conn.query('insert into tbl_price_history set ?', data, function(err, result) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);
      //console.log('@@@@@@@@@@@@@@@@@@@@@@ result @@@@@@@@@@@@@@@@@@@@@@ ', result);
      if(err) {
        console.log('SQL 실행 시 오류 발생함.');
        console.dir(err);
        callback(err, null);
        return;
      } else {
        result.data = data;
        callback(null, result);
      }
    });
  });
}

// 트레킹 추가
function addTracking(email, pNo, notifyPrice, callback) {
  //console.log('addTracking 호출됨');
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var data = {
                  email: email,
                  pNo: pNo,
                  notifyPrice: notifyPrice
                };

    var exec = conn.query('insert into tbl_tracking set ?', data, function(err, result) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(err) {
        console.log('SQL 실행 시 오류 발생함.');
        console.dir(err);
        callback(err, null);
        return;
      }
      result.data = data;
      callback(null, result);
    });
  });
}
// 트레킹 체크
function checkTracking(email, pNo, callback) {
  //console.log('checkTracking 호출됨');

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('select * from  tbl_tracking where email =  ? and pNo = ?', [email, pNo], function(err, rows) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(rows.length > 0) {
        console.log('일치하는 상품 찾음.');
        rows.forEach(function (row, i) {
          callback(null, rows);
      	});
      } else {
        console.log('일치하는 제품을 찾지 못함');
        callback(err, null);
      }
    });
  });
}
// 트렉킹 테이블 조회
/*
function selectTracking(pNo, callback) {
  //console.log('selectTracking 호출됨');

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('select * from tbl_tracking where pNo = ?',
                           [pNo], function(err, rows, fields) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);
      if(rows.length > 0) {
        //console.log('pNo[%s] 가 일치하는 상품 찾음.', pNo);
        callback(null, rows);
      } else {
        var err = {};
        console.log('pNo[%s] 번호 제품을 tracking 하는 사람이 없습니다.', pNo);
        callback(err, null);
      }
    });
  });
}
*/
// 트렉킹 테이블 조회
function selectTracking(pNo, callback) {
  //console.log('selectTracking 호출됨');

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('select pName, pLowest, email, tr.pNo, notifyPrice from tbl_product pd join tbl_tracking tr on pd.pNo = tr.pNo where tr.pNo = ? and tr.notifyPrice >= pd.pLowest',
                          [pNo], function(err, rows, fields) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      //var columns = ['pName', 'pLowest', 'email', 'tr.pNo', 'notifyPrice'];
      //var tableName = 'tbl_product pd join tbl_tracking tr';
      //var exec = conn.query('select ?? from ?? on pd.? = tr.?',
      //                      [columns, tableName, pNo, pNo], function(err, rows, fields) {


      if(rows.length > 0) {
        console.log('pNo[%s] 가 일치하는 상품 찾음.', pNo);
        callback(null, rows);
      } else {
        var err = {};
        console.log('pNo[%s] 번호 제품을 tracking 하는 사람이 없습니다.', pNo);
        callback(err, null);
      }
    });
  });
}

// 상품 업데이트
function updateProduct(newPrice, newPurl, pNo, callback) {
  //console.log('updateProduct 호출됨');

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('update tbl_product set pLowest = ?, pUrl = ? where pNo = ?;', [newPrice, newPurl, pNo], function(err, result) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(err) {
        console.log('SQL 실행 시 오류 발생함.');
        console.dir(err);
        callback(err, null);
        return;
      } else {
        callback(null, result);
      }
    });
  });
}

// 회원 로그인
function selectUser(email, callback) {
  //console.log('selectUser 호출됨');
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('select email, AES_DECRYPT(UNHEX(password), "aes") as password from tbl_user where email = ?',
                          [email], function(err, rows, fields) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(rows.length > 0) {
        console.log('email [%s] 과 일치하는 사용자 찾음.', email);
        rows.forEach(function (row, i) {
          result = {
                      "email": row.email,
                      "password": row.password,
                      "loginChk": "success"
                    };
          //console.log("db에서의 result", result);
          callback(null, rows);
      	});
      } else {
        console.log('일치하는 사용자를 찾지 못함');
        callback(err, null);
      }
    });
  });
}

// 전체 상품 조회
function selectAllProduct(callback) {
  //console.log('selectProduct 호출됨');
  var newPrice = '';
  var oldPrice = '';
  var newPurl = '';
  var pNo = '';
  var pName = '';
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var columns = ['pNo', 'pLowest', 'crawlingUrl', 'pName'];
    var tableName = 'tbl_product';

    var exec = conn.query('select ?? from ??',
                          [columns, tableName], function(err, rows, fields) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);
      var a = [];
      if(rows.length > 0) {
        //console.log('tbl_product 조회 성공...');
        rows.forEach(function (row, i) {
          a[i] = row;
          //console.log(a[i].crawlingUrl);
          //console.log('테이블안의 가격 :::::::::: ', a[i].pLowest);
          //
          oldPrice = a[i].pLowest;
          pName = a[i].pName;
          //
          tr.cronCrawling(a[i].crawlingUrl, function(err, product) {
            //console.log('@@@@@@@@@@@@@@@@@',  product);
            product.pNo = a[i].pNo;
            //console.log('가져온 가격 ::::::::::::', product.pLowest);
            //console.log('가져온 url ::::::::::::', product.pUrl);
            newPrice = product.pLowest;
            newPurl = product.pUrl;
            pNo = a[i].pNo;
            addHistory(product, function(err, result) {
              //console.log(result);
              if(result) {
                //console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ insert history success $$$$$$$$$$$$$$$$$$$$$$$$$$$');
                if(newPrice != oldPrice) {
                  //console.log('가격 변동으로 인해 수정합니다.');
                  updateProduct(newPrice, newPurl, pNo, function(err, result) {
                    if(result) {
                      //console.log('가격 수정 성공');
                      ////////////////////////////////////
                      if(newPrice < oldPrice) {
                        selectTracking(pNo, function(err, rows) {
                          if(err) {
                            console.log('selectTracking err');
                            callback(err, null);
                          } else {
                            var sql = "select token from tbl_token where email in (";
                            
                            for(var i = 0; i < rows.length; i++){
                                if(row.notifyPrice >= newPrice) {
                                    
                                }
                                sql += "'" + row[i].email + "'"
                                if(rows.length == i){
                                    sql += ')';
                                    break;
                                }
                                sql += ",";
                            }
                            /*  
                            rows.forEach(function(row, i) {
                              //console.log('조회된 트레킹테이블 뒤지는중....');
                              //console.log('notifyPrice ================= ', row.notifyPrice);
                              //console.log('pNo ================= ', row.pNo);
                              //console.log('email ================= ', row.email);
                              if(row.notifyPrice >= newPrice) {
//                                console.log('notifyPrice ====================== ', row.notifyPrice);
//                                console.log('email ================= ', row.email);
//                                console.log('pNo ================= ', row.pNo);
//                                console.log('pName ================== ', row.pName);
                                
                                  
                                callback(null, result);
                              } else {
                                //console.log('고객이 원하는 가격에 달성못함......');
                                callback(null, result);
                              }
                            });
                            */
                            console.log(sql); // 일단 test!!!!!
                              
                              
                      //////토큰 가져오기//////////////////////////////////////////////////////////////        
                            pool.getConnection(function(err, conn) {
                            if(err) {
                              conn.release();
                              return;
                            }
                            
                            var tokenArr = [];
                            var exec = conn.query(sql, function(err, results, fields) {
                                        conn.release();
                                        
                                        results.forEach(function(result))
                                
                                        sendNotification()
                                        });
                            });
                            
                            
                      /////////////////////////////////////////////////////////////////////////////        
                          }
                        });
                      }
                      callback(null, result);
                    } else {
                      console.log('updateProduct err');
                      callback(err, null);
                    }
                  });
                } else {
                  //console.log('가격변동이 없습니다.');
                  callback(null, result);
                }
              } else {
                console.log('addHistory err');
                callback(err, null);
              }
            });
          });
      	});
      } else {
        console.log('selectAllProduct err');
        callback(err, null);
      }
    });
  });
}


function sendNotification(pName, emails){
    var headers = {
        'Authorization': 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
    }

    var body = {
      "notification": {
        "title": "zzim알림",
        "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
        "icon": "firebase-logo.png",
        "click_action": "http://localhost:8880"
      },
      "registration_ids": emails
    }


    var options = {
        url: 'http://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: true,
        body: body
    }

    request(options, function (err, res, body) {
      if (err) {
        console.error('FCM메세지 보내기 오류::::: ', err);
        throw err;
      }

      console.log('headers: ', res.headers)
      console.log('statusCode: ', res.statusCode)
      console.log('body: ', body)
    })
    
}

module.exports.addProduct = addProduct;
module.exports.addTracking = addTracking;
module.exports.checkTracking = checkTracking;
module.exports.selectUser = selectUser;
module.exports.selectAllProduct = selectAllProduct;
