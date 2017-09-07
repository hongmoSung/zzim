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
/*
var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'hobby',
    password : 'password',
    database : 'hobby',
    debug : false
});
*/
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

// 트렉킹 테이블 조회ghdah30
function selectTracking(pNo, callback) {
  //console.log('selectTracking 호출됨');
  //console.log('pNo...........................', pNo);
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('select pName, pLowest, email, tr.pNo, notifyPrice from tbl_product pd join tbl_tracking tr on pd.pNo = tr.pNo where tr.pNo = ? and tr.notifyPrice >= pd.pLowest',
                          [pNo], function(err, rows, fields) {
      conn.release();
      if(rows.length > 0) {
        //console.log('pNo[%s] 가 일치하는 상품 찾음.', pNo);
        callback(null, rows);
      } else {
        var err = {};
        //console.log('pNo[%s] 번호 제품을 tracking 하는 사람이 없습니다.', pNo);
        callback(err, null);
      }
    });
  });
}

// 상품 업데이트
function updateProduct(product, callback) {
  //console.log('updateProduct 호출됨');
  //console.log('product:::::::::::::', product);

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
    var exec = conn.query('update tbl_product set pLowest = ?, pUrl = ? where pNo = ?;', [product.pLowest, product.pUrl, product.pNo], function(err, result) {
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
// 상품 조회
function selectToken(data, callback) {
  //console.log('selectToken 호출됨');
  //console.log('data --------------------------', data);
  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    //console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    var columns = ['pNo'];
    var tableName = 'tbl_product';
    var sql = "select token from tbl_token where email in (";

    for(var i = 0; i < data.length; i++){
        sql += "'" + data[i].email + "'";

        if(data.length-1 == i){
            sql += ')';
            break;
        }
        sql += ",";
    }
    var exec = conn.query(sql, function(err, rows, fields) {
        console.log('sql ////////////////////////', sql);
        conn.release();
        if(rows.length > 0){
          //console.log('성공성공성공성공성공성공성공성공성공성공성공성공성공성공성공성공');
          callback(null, rows);
            // rows.forEach(function (row, i) {
            //     //console.log('성공 row////////////////////', row);
            // });
        } else {
          console.log('일치하는 토큰을 찾지 못함');
          //result = {"productChk": "fail"};
          callback(err, null);
        }
    });
  });
}
// 상품 조회
function selectProduct(pName, callback) {
  console.log('selectProduct 호출됨');

  pool.getConnection(function(err, conn) {
    if(err) {
      conn.release();
      return;
    }
    console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    var columns = ['pNo'];
    var tableName = 'tbl_product';

    var exec = conn.query('select ?? from ?? where pName = ?',
                          [columns, tableName, pName], function(err, rows, fields) {
      conn.release();
      console.log('실행 대상 SQL : ' + exec.sql);

      if(rows.length > 0) {
        console.log('pName[%s] 가 일치하는 상품 찾음.', pName);
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
      //console.log('selectAllProduct rows ::::::::::::::::::::::::::', rows);
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
          ////////////////////////////////////////////////////////////////////////////////////////
          tr.cronCrawling(a[i].crawlingUrl, function(err, product) {
            //console.log('@@@@@@@@@@@@@@@@@',  product);
            product.pNo = a[i].pNo;
            //console.log('가져온 가격 ::::::::::::', product.pLowest);
            //console.log('가져온 url ::::::::::::', product.pUrl);
            newPrice = product.pLowest;
            newPurl = product.pUrl;
            pNo = a[i].pNo;

            addHistory(product, function(err, result) {
            //console.log('addHistory::::::::::::::::::::::::', result.affectedRows);
            if(result.affectedRows == 1) {
              //console.log(a[i].pName);
              if(a[i].pLowest != product.pLowest) {
                //console.log('가격변동이 없음', product.pNo);
                //console.log('product :::::: ', product);
              } else {
                //updateProduct(newPrice, newPurl, pNo, function(err, result) {
                updateProduct(product, function(err, result) {
                  //console.log('result:::::::::::::::::::::', result);
                  if(result) {
                    //console.log('가격 수정 성공', product.pNo);
                    //console.log('집어 넣은 가격', product.pLowest);
                    //console.log('이전의 갸격', a[i].pLowest);
                    //console.log(result);
                    ////////////////////////////////////
                    //  newPrice oldPrice
                    if(product.pLowest == a[i].pLowest) {
                      //console.log('반대의경우');
                      //console.log('알람을 주기위해 selectTracking::::::::::::::::::::::::', product.pNo);
                      //console.log('--------------------------------------------------------------------------');
                      selectTracking(product.pNo, function(err, rows, fields) {
                        if(rows) {
                          var data = rows;
                          //console.log('data ::::::::::::::', data);
                          selectToken(rows, function(err, rows) {
                            if(rows) {
                              console.log('rows', rows);
                            }
                          });
                        } else {
                          //console.log('tracking없는거');
                          callback(err, null);
                        }
                      });
                    }
                    ////////////////////////////////////

                    callback(null, result);
                    //console.log('알람을 안주는 경우...');
                  } else {
                    console.log('updateProduct err');
                    callback(err, null);
                  }
                });
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

module.exports.addProduct = addProduct;
module.exports.addTracking = addTracking;
module.exports.checkTracking = checkTracking;
module.exports.selectUser = selectUser;
module.exports.selectAllProduct = selectAllProduct;
module.exports.selectProduct = selectProduct;
