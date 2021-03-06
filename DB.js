var mysql = require('mysql');
var tr = require('./service/trackService.js');

// var pool = mysql.createPool({
//     connectionLimit: 500,
//     host: 'localhost', port: 3306,
//     user: 'hobby',
//     password: 'password',
//     database: 'hobby',
//     debug: false
// });

var pool = mysql.createPool({
    connectionLimit: 500,
    host: 'localhost', port: 3306,
    user: 'sb',
    password: 'sb',
    database: 'web',
    debug: false
});


// site 추가
function addSite(data, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        conn.query('insert into tbl_site set ?', data, function (err, result) {
            conn.release();
            if (err) {
                console.error(err);
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    });
}

// 상품 추가
function addProduct(data, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('insert into tbl_product set ?', data, function (err, result) {
            conn.release();
            if (err) {
                console.dir(err);
                callback(err, null);
            } else {
                result.data = data;
                callback(null, result);
            }
        });
    });
}

// 상품 history 추가
function addHistory(product, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var data = {
            pNo: product.pNo,
            currPrice: product.pLowest
        }
        var exec = conn.query('insert into tbl_price_history set ?', data, function (err, result) {
            conn.release();
            if (err) {
                console.dir(err);
                callback(err, null);
            } else {
                result.data = data;
                callback(null, result);
            }
        });
    });
}

// 트레킹 추가
function addTracking(email, pNo, notifyPrice, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var data = {
            email: email,
            pNo: pNo,
            notifyPrice: notifyPrice
        };

        var exec = conn.query('insert into tbl_tracking set ?', data, function (err, result) {
            conn.release();
            if (err) {
                console.dir(err);
                callback(err, null);
            } else {
              if(result) {
                result.data = data;
                callback(null, result);
              } else {
                callback(null, null);
              }
            }
        });
    });
}

// 트레킹 체크
function checkTracking(email, pNo, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('select * from  tbl_tracking where email =  ? and pNo = ?', [email, pNo], function (err, rows) {
            conn.release();
            if (err) {
                console.error(err);
                callback(err, null);
            } else {
                if (rows.length > 0) {
                    rows.forEach(function (row, i) {
                        callback(null, rows);
                    });
                } else {
                    callback(null, null);
                }
            }
        });
    });
}

// 트렉킹 테이블 조회
function selectTracking(pNo, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('select pName, pLowest, email, tr.pNo, notifyPrice from tbl_product pd join tbl_tracking tr on pd.pNo = tr.pNo where tr.pNo = ? and tr.notifyPrice >= pd.pLowest', [pNo], function (err, rows, fields) {
            conn.release();
            if (err) {
                var err = {};
                callback(err, null);
            } else {
                if (rows.length > 0) {
                    callback(null, rows);
                } else {
                  callback(null, null);
                }
            }
        });
    });
}

// 사이트 테이블 조회
function selectSite(cmpnyc, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('select cmpnyc, cmpnyUrl from tbl_site where cmpnyc = ?', [cmpnyc], function (err, rows, fields) {
            conn.release();
            if (err) {
                callback(err, null);
            } else {
                if (rows.length > 0) {
                    callback(null, rows);
                } else {
                    var err = {};
                    callback(null, null);
                }
            }
        });
    });
}

// 상품 업데이트
function updateProduct(product, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('update tbl_product set pLowest = ?, pUrl = ? where pNo = ?;', [product.pLowest, product.pUrl, product.pNo], function (err, result) {
            conn.release();
            if (err) {
                console.dir(err);
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    });
}

// 회원 로그인
function selectUser(email, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var exec = conn.query('select email, AES_DECRYPT(UNHEX(password), "aes") as password from tbl_user where email = ?', [email], function (err, rows, fields) {
            conn.release();
            if (err) {
                callback(null, result);
            } else {
                if (rows.length > 0) {
                    rows.forEach(function (row, i) {
                        result = {
                            "email": row.email,
                            "password": row.password,
                            "loginChk": "success"
                        };
                        callback(null, result);
                    });
                } else {
                    callback(null, null);
                }
            }
        });
    });
}

// 상품 조회
function selectToken(data, pNo, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var columns = ['pNo'];
        var tableName = 'tbl_product';
        var sql = "select token.* , tracking.* from tbl_token token, tbl_tracking tracking where tracking.email = token.email and pNo = ? and token.email in (";

        for (var i = 0; i < data.length; i++) {
            sql += "'" + data[i].email + "'";
            if (data.length - 1 == i) {
                sql += ')';
                break;
            }
            sql += ",";
        }
        var exec = conn.query(sql,[pNo], function (err, rows, fields) {
            conn.release();
            if (err) {
                callback(err, null);
            } else {
                if (rows.length > 0) {
                    callback(null, rows);
                } else {
                    callback(null, null);
                }
            }
        });
    });
}

// 상품 조회
function selectProduct(pName, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            return;
        }
        var columns = ['pNo'];
        var tableName = 'tbl_product';
        var exec = conn.query('select ?? from ?? where pName = ?',
            [columns, tableName, pName], function (err, rows, fields) {
                conn.release();
                if (err) {
                    callback(err, null);
                } else {
                    if (rows.length > 0) {
                        rows.forEach(function (row, i) {
                            callback(null, rows);
                        });
                    } else {
                        callback(null, null);
                    }
                }
            });
    });
}

// 전체 상품 조회
function selectAllProduct(callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var columns = ['pNo', 'pLowest', 'crawlingUrl', 'pName', 'pUrl'];
        var tableName = 'tbl_product';
        var exec = conn.query('select ?? from ??', [columns, tableName], function (err, rows, fields) {
            conn.release();
            if (err) {
                callback(err, null);
            } else {
                if (rows.length > 0) {
                    callback(null, rows);
                } else {
                    callback(null, null);
                }
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
module.exports.selectSite = selectSite;
module.exports.addSite = addSite;
module.exports.addHistory = addHistory;
module.exports.updateProduct = updateProduct;
module.exports.selectTracking = selectTracking;
module.exports.selectToken = selectToken;
module.exports.pool = pool;
