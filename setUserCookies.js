var con = require("./db.js").con;
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const async = require('async');
var startTime
var setUserCookies = function () {
    startTime = new Date().getTime();
    var sql = "select email from tbl_user ";
    con.query(sql, function (err, rows, fields) {
        rows.forEach(function (row, i) {
            console.log("email : ", row.email);
            setCookies(row.email);
        })
    })
}

var setCookies = function (email) {
    var sql = "select * from tbl_logindata where email = ?";
    var websiteList = {};
    var task = [
        function (callback) {
            con.query(sql, [email], function (err, rows, fields) {
                rows.forEach(function (row, i) {
                    websiteList[row.website] = row;
                });
                callback(null);
            });

        }
    ];
    var task2 = [
        function (callback) {
            if (websiteList.hasOwnProperty('11st')) {
                var elevenCookies = "";
                const driver = new webdriver.Builder().forBrowser('chrome').build();
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
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = '11st'";
                    con.query(sql,[elevenCookies,email],function(err,rows,fields){
                        if(err) console.log("err");
                        else callback(null,"update 11st cookies");
                    });
                })
                driver.quit();
            }else{
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('auction')) {
                var auctionCookies = "" ;
                const driver = new webdriver.Builder().forBrowser('chrome').build();
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
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'auction'";
                    con.query(sql,[auctionCookies,email],function(err,rows,fields){
                        if(err) console.log("err");
                        else callback(null,"update auction cookies");
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
                const driver = new webdriver.Builder().forBrowser('chrome').build();
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
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'interpark'";
                    con.query(sql,[interparkCookies,email],function(err,rows,fields){
                        if(err) console.log("err");
                        else callback(null,"update interpark cookies");
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
                const driver = new webdriver.Builder().forBrowser('chrome').build();
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
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'gmarket'";
                    con.query(sql,[gmarketCookies,email],function(err,rows,fields){
                        if(err) console.log("err");
                        else callback(null,"update gmarket cookies");
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
    var task3 = [
        function(callback) {
            const driver = new webdriver.Builder().forBrowser('chrome').build();
            driver.manage().timeouts().implicitlyWait(3000);
            driver.then(function () {
                switch (loginData.website) {
                    case 'gmarket':
                        driver.get('https://signinssl.gmarket.co.kr/login/login?prmtdisp=Y&url=http://escrow.gmarket.co.kr/ko/cart');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('pwd')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#mem_login > div.login-input > div.btn-login > a > input[type="image"]')).click();
                        break;
                    case '11st':
                        driver.get('https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&xfrom=');
                        driver.findElement(By.id('loginName')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('passWord')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#memLogin > div.save_idW > input')).click();
                        break;
                    case 'interpark':
                        driver.get('http://www.interpark.com/order/cartlist.do?_method=cartList&logintgt=cart&wid1=kang&wid2=cartlist&wid3=02');
                        driver.switchTo().frame('subIframe');
                        driver.findElement(By.id('memId')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('pwdObj')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#login_type1 > table > tbody > tr:nth-child(1) > td:nth-child(2) > img')).click();
                        break;
                    case 'auction':
                        driver.get('https://memberssl.auction.co.kr/authenticate/?url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('password')).sendKeys(loginData.websitePw);
                        driver.findElement(By.id('Image1')).click();
                        break;
                }
            });
            driver.then(function () {
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
            });
            driver.quit();

        }, function (loginData, webCookies,callback) {
            var sql = "insert into tbl_loginData (email, website, websiteId, websitePw) values (?,?,?,?)";
            con.query(sql, [loginData.email, loginData.website, loginData.websiteId, loginData.websitePw], function (err, result) {
                if (err) {
                    console.log("insert logindata err");
                    next = false;
                    callback(null,null,null);
                } else {
                    console.log("insert done");
                    callback(null, loginData, webCookies);
                }
            });
        },
        function(loginData,webCookies,callback){
            console.log(next);
            if (next) {
                var sql = "update tbl_logindata set cookies = ? where email = ? and website = ?";
                con.query(sql, [webCookies, loginData.email, loginData.website], function (err, rows, fields) {
                    if (err) {
                        console.log("update cookies err");
                        callback(err);
                    }
                    else callback(null);
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

module.exports.setWebsiteCookies = setWebsiteCookies;
module.exports.setUserCookies = setUserCookies;