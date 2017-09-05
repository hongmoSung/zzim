var mysql = require('mysql');
var tr = require('./track.js');
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

// 상품 조회
function selectProduct(pName, callback) {
  //console.log('selectProduct 호출됨');
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var columns = ['pNo'];
    var tableName = 'tbl_product';

    var exec = conn.query('select ?? from ?? where pName = ?',
                          [columns, tableName, pName], function(err, rows, fields) {
      conn.release();
      //console.log('실행 대상 SQL : ' + exec.sql);

      if(rows.length > 0) {
        //console.log('pName[%s] 가 일치하는 상품 찾음.', pName);
        rows.forEach(function (row, i) {
          //result = {"pNo": row.pNo, "productChk": "success"};
          //console.log("db에서의 result", result);
          callback(null, rows);
      	});
      } else {
        console.log('일치하는 제품을 찾지 못함');
        //result = {"productChk": "fail"};
        callback(err, null);
      }
    });
  });
}

// 트렉킹 테이블 조회
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
        console.log('pNo[%s] 가 일치하는 상품 찾음.', pNo);
        callback(null, rows);
      } else {
        var err = {};
        console.log('일치하는 제품을 찾지 못함');
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
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var columns = ['pNo', 'pLowest', 'crawlingUrl'];
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
                            rows.forEach(function(row, i) {
                              //console.log('조회된 트레킹테이블 뒤지는중....');
                              //console.log('notifyPrice ================= ', row.notifyPrice);
                              //console.log('pNo ================= ', row.pNo);
                              //console.log('email ================= ', row.email);
                              if(row.notifyPrice >= newPrice) {
                                // 정욱이형 하세요.....
                                //console.log('고객이 원하는 가격에 달성했음......');
                                //console.log('정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....정욱이형 하세요.....');
                                callback(null, result);
                              } else {
                                //console.log('고객이 원하는 가격에 달성못함......');
                                callback(null, result);
                              }
                            });
                          }
                        });
                      }
                      ////////////////////////////////////
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


//module.exports.addMember = addMember;
module.exports.addProduct = addProduct;
module.exports.selectProduct = selectProduct;
module.exports.addTracking = addTracking;
module.exports.checkTracking = checkTracking;
module.exports.selectUser = selectUser;
module.exports.selectAllProduct = selectAllProduct;
