var db = require('./ourDb.js');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const async = require('async');
require('events').EventEmitter.prototype._maxListeners = 100;


var startTime

var setUserCookies = function () {
    startTime = new Date().getTime();

    db.pool.getConnection(function(err, conn) {
        if(err) {
            conn.release();
            return;
        }
        var sql = "select email from tbl_user ";
        conn.query(sql, function (err, rows, fields) {
            rows.forEach(function (row, i) {
                console.log("email : ", row.email);
                setCookies(row.email);
            })
        });
    });

}

var setCookies = function (email) {

    var websiteList = {};
    var task = [
        function (callback) {

            db.pool.getConnection(function(err, conn) {
                if(err) {
                    conn.release();
                    return;
                }
                var sql = "select email, website, websiteId, AES_DECRYPT(UNHEX(websitePw), 'aes') as websitePw from tbl_logindata where email = ?";
                conn.query(sql, [email], function (err, rows, fields) {
                    rows.forEach(function (row, i) {
                        var pwBuffer = new Buffer(row.websitePw);
                        row.websitePw = pwBuffer.toString();
                        websiteList[row.website] = row;
                    });
                    console.log(email);
                    console.log(websiteList);
                    callback(null);
                });
            });
        }
    ];
    var task2 = [
        function (callback) {
            if (websiteList.hasOwnProperty('11st')) {
                var elevenCookies = "";
                const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                driver.manage().timeouts().implicitlyWait(3000);
                driver.get('https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&xfrom=');
                driver.findElement(By.id('loginName')).sendKeys(websiteList['11st'].websiteId);
                driver.findElement(By.id('passWord')).sendKeys(websiteList['11st'].websitePw);
                driver.findElement(By.css('#memLogin > div.save_idW > input')).click();
                driver.then(function () {
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {

                            if(cookies[i]['name'] == 'TMALL_AUTH'){
                                elevenCookies += "TMALL_AUTH="+cookies[i]['value'];
                            }

                        }
                    })
                });
                driver.then(function(){
                    db.pool.getConnection(function(err, conn) {
                        if(err) {
                            conn.release();
                            return;
                        }
                        var sql = "update tbl_logindata set cookies = ? where email = ? and website = '11st'";
                        conn.query(sql,[elevenCookies,email],function(err,rows,fields){
                            if(err) console.log("err");
                            else callback(null,"update 11st cookies");
                        });
                    });

                });
                driver.quit();
            }else{
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('auction')) {
                var auctionCookies = "" ;
                const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                driver.manage().timeouts().implicitlyWait(3000);
                driver.get('https://memberssl.auction.co.kr/authenticate/?url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab');
                driver.findElement(By.id('id')).sendKeys(websiteList['auction'].websiteId);
                driver.findElement(By.id('password')).sendKeys(websiteList['auction'].websitePw);
                driver.findElement(By.id('Image1')).click();
                driver.then(function () {
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {
                            if(i==0){
                                auctionCookies += cookies[i]['name']+'='+ cookies[i]['value'];
                            }else{
                                auctionCookies += ';'+cookies[i]['name']+'='+ cookies[i]['value'];
                            }
                        }
                    })
                });
                driver.then(function(){
                    db.pool.getConnection(function(err, conn) {
                        if(err) {
                            conn.release();
                            return;
                        }
                        var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'auction'";
                        conn.query(sql,[auctionCookies,email],function(err,rows,fields){
                            if(err) console.log("err");
                            else callback(null,"update auction cookies");
                        });
                    });

                });
                driver.quit();
            }else{
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('interpark')) {
                var interparkCookies = "" ;
                const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                driver.manage().timeouts().implicitlyWait(3000);
                driver.get('http://www.interpark.com/order/cartlist.do?_method=cartList&logintgt=cart&wid1=kang&wid2=cartlist&wid3=02');
                driver.switchTo().frame('subIframe');
                driver.findElement(By.id('memId')).sendKeys(websiteList['interpark'].websiteId);
                driver.findElement(By.id('pwdObj')).sendKeys(websiteList['interpark'].websitePw);
                driver.findElement(By.css('#login_type1 > table > tbody > tr:nth-child(1) > td:nth-child(2) > img')).click();
                driver.then(function () {
                    driver.sleep(500);
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {
                            if(i==0){
                                interparkCookies += cookies[i]['name']+'='+ cookies[i]['value'];
                            }else{
                                interparkCookies += ';'+cookies[i]['name']+'='+ cookies[i]['value'];
                            }
                        }
                    })
                });
                driver.then(function(){
                    db.pool.getConnection(function(err, conn) {
                        if(err) {
                            conn.release();
                            return;
                        }
                        var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'interpark'";
                        conn.query(sql,[interparkCookies,email],function(err,rows,fields){
                            if(err) console.log("err");
                            else callback(null,"update interpark cookies");
                        });
                    });

                });
                driver.quit();
            }else{
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('gmarket')) {
                var gmarketCookies = "" ;
                const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                driver.manage().timeouts().implicitlyWait(3000);
                driver.get('https://signinssl.gmarket.co.kr/login/login?prmtdisp=Y&url=http://escrow.gmarket.co.kr/ko/cart');
                driver.findElement(By.id('id')).sendKeys(websiteList['gmarket'].websiteId);
                driver.findElement(By.id('pwd')).sendKeys(websiteList['gmarket'].websitePw);
                driver.findElement(By.css('#mem_login > div.login-input > div.btn-login > a > input[type="image"]')).click();
                driver.then(function () {
                    driver.sleep(100);
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {
                            if(i==0){
                                gmarketCookies += cookies[i]['name']+'='+ cookies[i]['value'];
                            }else{
                                gmarketCookies += ';'+cookies[i]['name']+'='+ cookies[i]['value'];
                            }
                        }
                    })
                });
                driver.then(function(){
                    db.pool.getConnection(function(err, conn) {
                        if(err) {
                            conn.release();
                            return;
                        }
                        var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'gmarket'";
                        conn.query(sql,[gmarketCookies,email],function(err,rows,fields){
                            if(err) console.log("err");
                            else callback(null,"update gmarket cookies");
                        });
                    });

                });
                driver.quit();
            }else{
                callback(null);
            }
        }
    ];

    async.waterfall(task, function (err) {
        if (err) console.log("err");
        else {
            console.log("waterfall done");
            //console.log(websiteList);
            async.parallel(task2, function (err, result) {
                console.log(result);
                console.log("parallel done");
                console.log( new Date().getTime()-startTime);

            });
        }
    });

}

var setWebsiteCookies = function(loginData,CBfunc){
    var webCookies = "" ;
    var next = true;
    var loginNext = true;
    var task3 = [
        function(callback) {
            const driver = new webdriver.Builder().forBrowser('phantomjs').build();
            driver.manage().timeouts().implicitlyWait(3000);
            driver.then(function () {
                switch (loginData.website) {
                    case 'gmarket':
                        driver.get('https://signinssl.gmarket.co.kr/login/login?prmtdisp=Y&url=http://escrow.gmarket.co.kr/ko/cart');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('pwd')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#mem_login > div.login-input > div.btn-login > a > input[type="image"]')).click();
                        driver.getCurrentUrl().then(function(url){
                            if(url == "https://signinssl.gmarket.co.kr/LogIn/LogIn?member_type=MEM&failCheck=1&url=http://escrow.gmarket.co.kr/ko/cart"){
                                loginNext = false;
                            }
                        })
                        break;
                    case '11st':
                        driver.get('https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&xfrom=');
                        driver.findElement(By.id('loginName')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('passWord')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#memLogin > div.save_idW > input')).click();
                        driver.getCurrentUrl().then(function(url){
                            if(url == "https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&errorCode=001&age19="){
                                loginNext = false;
                            }
                        })
                        break;
                    case 'interpark':
                        driver.get('http://www.interpark.com/order/cartlist.do?_method=cartList&logintgt=cart&wid1=kang&wid2=cartlist&wid3=02');
                        var curr = driver.getCurrentUrl();
                        driver.switchTo().frame('subIframe');
                        driver.findElement(By.id('memId')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('pwdObj')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#login_type1 > table > tbody > tr:nth-child(1) > td:nth-child(2) > img')).click();
                        driver.findElement(By.css('span.cart')).getText().then(function(){
                            loginNext = true;
                        }).catch(function(ex){
                           loginNext = false;
                        });
                        break;
                    case 'auction':
                        driver.get('https://memberssl.auction.co.kr/authenticate/?url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('password')).sendKeys(loginData.websitePw);
                        driver.findElement(By.id('Image1')).click();
                        driver.getCurrentUrl().then(function(url){
                            if(url == "https://memberssl.auction.co.kr/Authenticate/default.aspx?return_value=-1&SELLER=&url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab&loginType=0&loginUIType="){
                                loginNext = false;
                            }
                        })
                        break;
                }
            });
            driver.then(function () {
                if(loginNext){
                    driver.sleep(500);
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {
                            if (i == 0) {
                                webCookies += cookies[i]['name'] + '=' + cookies[i]['value'];
                            } else {
                                webCookies += ';' + cookies[i]['name'] + '=' + cookies[i]['value'];
                            }
                        }
                        driver.then(function(){
                            callback(null,loginData,webCookies);
                        });
                    })
                }else{
                    callback("err");
                }

            });
            driver.quit();

        }, function (loginData, webCookies,callback) {
            pool.getConnection(function(err, conn) {
                    if(err) {
                        conn.release();
                        return;
                    }
                var sql = "insert into tbl_loginData (email, website, websiteId, websitePw) values (?,?,?,HEX(AES_ENCRYPT(?,'aes')))";
                con.query(sql, [loginData.email, loginData.website, loginData.websiteId, loginData.websitePw], function (err, result) {
                    if (err) {
                        console.log("insert logindata err");
                        console.log(err);
                        next = false;
                        callback(null,null,null);
                    } else {
                        console.log("insert done");
                        callback(null, loginData, webCookies);
                    }
                });
            });

        },
        function(loginData,webCookies,callback){
            console.log(next);
            if (next) {
                db.pool.getConnection(function(err, conn) {
                    if(err) {
                        conn.release();
                        return;
                    }
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = ?";
                    con.query(sql, [webCookies, loginData.email, loginData.website], function (err, rows, fields) {
                        if (err) {
                            console.log("update cookies err");
                            callback(err);
                        }
                        else callback(null);
                    });
                });

            }else{
                callback("err");
            }

        }
    ];
    async.waterfall(task3,function(err){
        if (err) {
            console.log("err");
            CBfunc("err");
        }
        else{
            CBfunc("success");
        }
    });
}
process.setMaxListeners(100);

module.exports.setWebsiteCookies = setWebsiteCookies;
module.exports.setUserCookies = setUserCookies;