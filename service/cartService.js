var db = require('../ourDb.js');
const async = require('async');
var iconv = require('iconv-lite');
const cheerio = require('cheerio');
const request = require('request');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
require('events').EventEmitter.prototype._maxListeners = 100;


var startTime;

function cartCrawling(email, func) {
    var startTime = new Date().getTime();
    var websiteList = {};

    var task = [
        function (callback) {
            var sql = "select * from tbl_logindata where email = ?";

            db.pool.getConnection(function (err, conn) {
                if (err) {
                    conn.release();
                    return;
                }
                conn.query(sql, [email], function (err, rows, fields) {
                    conn.release();
                    rows.forEach(function (row, i) {
                        websiteList[row.website] = row;
                    });

                    callback(null);
                });
            });

        }
    ];

    var task2 = [
        function (callback) {
            if (websiteList.hasOwnProperty('11st')) {
                var cookies = websiteList['11st']['cookies'];
                var option = {
                    url: 'http://buy.11st.co.kr/cart/CartAction.tmall?method=getCartList',
                    headers: {
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
                    },
                    encoding: null
                };

                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var cName, cLink, cPic, cPrice, cCount, cDelivery;
                        var itemArr = [];
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        var $ = cheerio.load(body);
                        if ($("tr.no_prd").length == 0) {
                            var legnth = $('#cartTable_area > table > tbody > tr').length;
                            for (var i = 1; i <= legnth; i++) {
                                cName = trim($("#cartTable_area > table > tbody > tr:nth-child(" + i + ") > td.td_prdwrap > div > div.infoWrap > div.dp_title > label > a").text());
                                var href = $("#cartTable_area > table > tbody > tr:nth-child(" + i + ") > td.td_prdwrap > div > div.infoWrap > div.dp_title > label > a").attr("href");
                                console.log(href);
                                var startIndex = href.indexOf('http');
                                var endIndex = href.indexOf("^");
                                cLink = trim(href.substring(startIndex, endIndex));
                                cPic = trim($('#cartTable_area > table > tbody > tr:nth-child(' + i + ') > td.td_prdwrap > div > div.dp_photo > a > img').attr("src"));
                                var price = trim($('#cartTable_area > table > tbody > tr:nth-child(' + i + ') > td.rlt_price').text());
                                var endIndex = price.indexOf("원");
                                cPrice = trim(price.substring(0, endIndex));
                                cCount = trim($('#cartTable_area > table > tbody > tr:nth-child(' + i + ') > td:nth-child(3) > div > label > input').attr('value'));
                                cDelivery = trim($('#cartTable_area > table > tbody > tr:nth-child(' + i + ') > td:nth-child(7) > div > div > em').text());

                                var item = {
                                    cName: cName,
                                    cLink: cLink,
                                    cPic: cPic,
                                    cPrice: cPrice,
                                    cCount: cCount,
                                    cDelivery: cDelivery
                                };
                                itemArr.push(item);
                            }
                        }
                        var result11 = {};
                        result11['11st'] = itemArr;
                        callback(null, result11);
                    }
                });
            } else {
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('auction')) {
                var cookies = websiteList['auction']['cookies'];
                var option = {
                    url: 'http://buy.auction.co.kr/buy/A2014/Cart/Cart.aspx',
                    headers: {
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
                    },
                    encoding: null
                };

                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var cName, cLink, cPic, cPrice, cCount, cDelivery;
                        var itemArr = [];
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        var $ = cheerio.load(body);

                        var legnth = $('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr').length;
                        for (var i = 1; i <= legnth; i++) {

                            cName = trim($('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(2) > span').text());
                            cLink = trim("http://itempage3.auction.co.kr/DetailView.aspx?itemNo=" + $('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(2) > span > a').attr('name'));
                            cPic = trim($('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(1) > div > a > img').attr('src'));
                            cPrice = trim($('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(4) > strong > span ').text());
                            cCount = trim($('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(2) > ul > li > div > span.number > input').attr('value'));
                            cDelivery = trim($('#contents > div.order-tbl3 > table:nth-child(2) > tbody > tr:nth-child(' + i + ') > td:nth-child(6) > div.cost_info > span:first-child').text());


                            var item = {
                                cName: cName,
                                cLink: cLink,
                                cPic: cPic,
                                cPrice: cPrice,
                                cCount: cCount,
                                cDelivery: cDelivery
                            };
                            itemArr.push(item);
                        }
                        var resultA = {};
                        resultA['auction'] = itemArr;
                        callback(null, resultA);
                    }
                });
            } else {
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('interpark')) {
                var cookies = websiteList['interpark']['cookies'];
                var option = {
                    url: 'http://www.interpark.com/order/cartlist.do?_method=cartList',
                    headers: {
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
                    },
                    encoding: null
                };

                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var cName, cLink, cPic, cPrice, cCount, cDelivery;
                        var itemArr = [];
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        var $ = cheerio.load(body);

                        var el = $('tbody > tr > td.prd_title');
                        el.each(function () {
                            cName = $(this).find('table > tbody > tr > td > a').text();
                            cLink = $(this).find('table > tbody > tr > td > a').attr('href');
                            var parentEl = $(this).parent();
                            cPic = parentEl.find('td.prd_img > table > tbody > tr > td > a > img').attr('src');
                            cPrice = parentEl.find('td.prd_title + td + td > div > b').text();
                            cCount = parentEl.find('td.prd_title + td + td + td + td > table > tbody > tr > td > table > tbody > tr > td > input').val();
                            cDelivery = parentEl.find('td.prd_title + td +td +td +td +td +td > table > tbody > tr > td').text();

                            var item = {
                                cName: cName,
                                cLink: cLink,
                                cPic: cPic,
                                cPrice: cPrice,
                                cCount: cCount,
                                cDelivery: cDelivery
                            };
                            itemArr.push(item);
                        })

                        var resultInter = {};
                        resultInter['interpark'] = itemArr;
                        callback(null, resultInter);
                    }
                });
            } else {
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('gmarket')) {
                var cookies = websiteList['gmarket']['cookies'];
                var option = {
                    url: 'http://escrow.gmarket.co.kr/ko/cart',
                    headers: {
                        'Cookie': cookies,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
                    },
                    encoding: null
                };

                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var cName, cLink, cPic, cPrice, cCount, cDelivery;
                        var itemArr = [];
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'utf8').toString();
                        try {
                            var temp1 = body.split('JSON.parse(JSON.stringify(');
                            var strObj = temp1[1].split('))')[0];
                            var dataObj = JSON.parse(strObj);
                            //console.log(dataObj);
                            //console.log(dataObj.cartItemList.length);
                            //console.log(dataObj.cartItemList[0]);


                            for (var i = 0; i < dataObj.cartItemList.length; i++) {
                                cName = dataObj.cartItemList[i].ItemInfo.ItemName;
                                cPic = dataObj.cartItemList[i].ItemInfo.ItemImagePath;
                                cPrice = dataObj.cartItemList[i].ItemInfo.ItemOrderPrice;
                                cCount = dataObj.cartItemList[i].OrderQty;
                                cDelivery = dataObj.cartItemList[i].ShippingInfo.ShippingGroupText;
                                cLink = "http://item.gmarket.co.kr/Item?goodscode=" + dataObj.cartItemList[i].ItemInfo.ItemNo;

                                var item = {
                                    cName: cName,
                                    cLink: cLink,
                                    cPic: cPic,
                                    cPrice: cPrice,
                                    cCount: cCount,
                                    cDelivery: cDelivery
                                };
                                itemArr.push(item);
                            }
                        } catch (e) {
                            console.log("gmarket - get cart err");
                        }

                        var resultG = {};
                        resultG['gmarket'] = itemArr;
                        callback(null, resultG);
                    }
                });
            } else {
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
                if (err) console.log(err);
                else func(result);
            });
        }
    });

}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

var setCookiesForScheduling = function () {
    startTime = new Date().getTime();

    db.pool.getConnection(function (err, conn) {
        if (err) {
            return;
        }
        var sql = "select email from tbl_user ";
        conn.query(sql, function (err, rows, fields) {
            conn.release();
            if (err) {
                console.log("query : select email from tbl_user : err");
            } else {
                rows.forEach(function (row, i) {
                    //console.log("email : ", row.email);
                    executeFuncForScheduling(row.email);
                })
            }
        });
    });

}

var executeFuncForScheduling = function (email) {

    var websiteList = {};
    var task3 = [
        function (callback) {

            db.pool.getConnection(function (err, conn) {
                if (err) {
                    return;
                }
                var sql = "select email, website, websiteId, AES_DECRYPT(UNHEX(websitePw), 'aes') as websitePw from tbl_logindata where email = ?";
                conn.query(sql, [email], function (err, rows, fields) {
                    conn.release();
                    if (err) {
                        console.log("query : select email, website, websiteId, AES_DECRYPT(UNHEX(websitePw), 'aes') as websitePw from tbl_logindata where email = ? : err");
                    } else {
                        rows.forEach(function (row, i) {
                            var pwBuffer = new Buffer(row.websitePw);
                            row.websitePw = pwBuffer.toString();
                            websiteList[row.website] = row;
                        });
                        //console.log("websiteList : ",websiteList);
                        callback(null);
                    }
                });
            });
        }
    ];
    var task4 = [
        function (callback) {
            if (websiteList.hasOwnProperty('11st')) {
                var elevenCookies = "";
                try {
                    const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                    driver.then(function () {
                        driver.manage().timeouts().implicitlyWait(3000);
                        driver.get('https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&xfrom=');
                        driver.findElement(By.id('loginName')).sendKeys(websiteList['11st'].websiteId);
                        driver.findElement(By.id('passWord')).sendKeys(websiteList['11st'].websitePw);
                        driver.findElement(By.css('#memLogin > div.save_idW > input')).click();
                        driver.then(function () {
                            driver.manage().getCookies().then(function (cookies) {
                                for (var i in cookies) {
                                    if (cookies[i]['name'] == 'TMALL_AUTH') {
                                        elevenCookies += "TMALL_AUTH=" + cookies[i]['value'];
                                    }

                                }
                            })
                        });
                        driver.then(function () {
                            db.pool.getConnection(function (err, conn) {
                                if (err) {
                                    return;
                                }
                                var sql = "update tbl_logindata set cookies = ? where email = ? and website = '11st'";
                                conn.query(sql, [elevenCookies, email], function (err, rows, fields) {
                                    conn.release();
                                    if (err) console.log("sql : update tbl_logindata set cookies = ? where email = ? and website = '11st : err");
                                    else callback(null, "update 11st cookies");
                                });
                            });

                        });
                        driver.quit();
                    }, function (err) {
                        console.log("err - setCookiesForScheduling - 11st ::", err);
                        callback(null, "update 11st cookies Err!!");
                    });

                } catch (e) {
                    console.log("catch exception at task4 - 11st");
                    console.log(e);
                }


            } else {
                callback(null);
            }

        },
        function (callback) {
            if (websiteList.hasOwnProperty('auction')) {
                var auctionCookies = "";
                try {
                    const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                    driver.then(function () {
                        driver.manage().timeouts().implicitlyWait(3000);
                        driver.get('https://memberssl.auction.co.kr/authenticate/?url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab');
                        driver.findElement(By.id('id')).sendKeys(websiteList['auction'].websiteId);
                        driver.findElement(By.id('password')).sendKeys(websiteList['auction'].websitePw);
                        driver.findElement(By.id('Image1')).click();
                        driver.then(function () {
                            driver.manage().getCookies().then(function (cookies) {
                                for (var i in cookies) {
                                    if (i == 0) {
                                        auctionCookies += cookies[i]['name'] + '=' + cookies[i]['value'];
                                    } else {
                                        auctionCookies += ';' + cookies[i]['name'] + '=' + cookies[i]['value'];
                                    }
                                }
                            })
                        });
                        driver.then(function () {
                            db.pool.getConnection(function (err, conn) {
                                if (err) {
                                    return;
                                }
                                var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'auction'";
                                conn.query(sql, [auctionCookies, email], function (err, rows, fields) {
                                    conn.release();
                                    if (err) console.log("err");
                                    else callback(null, "update auction cookies");
                                });
                            });

                        });

                        driver.quit();
                    }, function (err) {
                        console.log("err - setCookiesForScheduling - auction ::", err);
                        callback(null, "update auction cookies Err!!");
                    });


                } catch (e) {
                    console.log("catch exception at task4 - auction");
                    console.log(e);
                }

            } else {
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('interpark')) {
                var interparkCookies = "";
                try {
                    const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                    driver.then(function () {
                        driver.manage().timeouts().implicitlyWait(3000);
                        driver.get('http://www.interpark.com/order/cartlist.do?_method=cartList&logintgt=cart&wid1=kang&wid2=cartlist&wid3=02');
                        driver.switchTo().frame('subIframe').then(function () {
                            driver.findElement(By.id('memId')).sendKeys(websiteList['interpark'].websiteId);
                            driver.findElement(By.id('pwdObj')).sendKeys(websiteList['interpark'].websitePw);
                            driver.findElement(By.css('#login_type1 > table > tbody > tr:nth-child(1) > td:nth-child(2) > img')).click();
                            driver.then(function () {
                                driver.sleep(500);
                                driver.manage().getCookies().then(function (cookies) {
                                    for (var i in cookies) {
                                        if (i == 0) {
                                            interparkCookies += cookies[i]['name'] + '=' + cookies[i]['value'];
                                        } else {
                                            interparkCookies += ';' + cookies[i]['name'] + '=' + cookies[i]['value'];
                                        }
                                    }
                                    driver.then(function () {
                                        db.pool.getConnection(function (err, conn) {
                                            if (err) {
                                                return;
                                            }
                                            var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'interpark'";
                                            conn.query(sql, [interparkCookies, email], function (err, rows, fields) {
                                                conn.release();
                                                if (err) console.log("err");
                                                else callback(null, "update interpark cookies");
                                            });
                                        });

                                    });
                                    driver.quit();
                                }, function (err) {
                                    console.log(err);
                                    console.log("err :: driver.getCookies()");
                                });
                            });
                        }, function (err) {
                            console.log(err);
                            console.log("switchTo Err");
                        });


                    }, function (err) {
                        console.log("err - setCookiesForScheduling - interpark ::", err);
                        callback(null, "update interpark cookies Err!!");
                    });


                } catch (e) {
                    console.log("catch exception at task4 - interpark");
                    console.log(e);
                }


            } else {
                callback(null);
            }
        },
        function (callback) {
            if (websiteList.hasOwnProperty('gmarket')) {
                var gmarketCookies = "";
                try {
                    const driver = new webdriver.Builder().forBrowser('phantomjs').build();
                    driver.then(function () {
                        driver.manage().timeouts().implicitlyWait(3000);
                        driver.get('https://signinssl.gmarket.co.kr/login/login?prmtdisp=Y&url=http://escrow.gmarket.co.kr/ko/cart');
                        driver.findElement(By.id('id')).sendKeys(websiteList['gmarket'].websiteId);
                        driver.findElement(By.id('pwd')).sendKeys(websiteList['gmarket'].websitePw);
                        driver.findElement(By.css('#mem_login > div.login-input > div.btn-login > a > input[type="image"]')).click();
                        driver.then(function () {
                            driver.sleep(100);
                            driver.manage().getCookies().then(function (cookies) {
                                for (var i in cookies) {
                                    if (i == 0) {
                                        gmarketCookies += cookies[i]['name'] + '=' + cookies[i]['value'];
                                    } else {
                                        gmarketCookies += ';' + cookies[i]['name'] + '=' + cookies[i]['value'];
                                    }
                                }
                            })
                        });
                        driver.then(function () {
                            db.pool.getConnection(function (err, conn) {
                                if (err) {
                                    return;
                                }
                                var sql = "update tbl_logindata set cookies = ? where email = ? and website = 'gmarket'";
                                conn.query(sql, [gmarketCookies, email], function (err, rows, fields) {
                                    conn.release();
                                    if (err) console.log("err");
                                    else callback(null, "update gmarket cookies");
                                });
                            });

                        });
                        driver.quit();
                    }, function (err) {
                        console.log("err - setCookiesForScheduling - gmarket ::", err);
                        callback(null, "update gmarket cookies Err!!");
                    });


                } catch (e) {
                    console.log("catch exception at task4 - gmarket");
                    console.log(e);
                }

            } else {
                callback(null);
            }
        }
    ];

    async.waterfall(task3, function (err) {
        if (err) console.log("err");
        else {
            //console.log("waterfall done");
            async.parallel(task4, function (err, result) {
                //console.log("result : ", result);
                //console.log("parallel done");
                //console.log(new Date().getTime() - startTime);

            });
        }
    });

}

var setCookiesAtAddLoginData = function (loginData, CBfunc) {
    var webCookies = "";
    var next = true;
    var loginNext = true;
    var task5 = [
        function (callback) {
            const driver = new webdriver.Builder().forBrowser('phantomjs').build();
            driver.manage().timeouts().implicitlyWait(3000);
            driver.then(function () {
                switch (loginData.website) {
                    case 'gmarket':
                        driver.get('https://signinssl.gmarket.co.kr/login/login?prmtdisp=Y&url=http://escrow.gmarket.co.kr/ko/cart');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('pwd')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#mem_login > div.login-input > div.btn-login > a > input[type="image"]')).click();
                        driver.getCurrentUrl().then(function (url) {
                            if (url == "https://signinssl.gmarket.co.kr/LogIn/LogIn?member_type=MEM&failCheck=1&url=http://escrow.gmarket.co.kr/ko/cart") {
                                loginNext = false;
                            }
                        })
                        break;
                    case '11st':
                        driver.get('https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&xfrom=');
                        driver.findElement(By.id('loginName')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('passWord')).sendKeys(loginData.websitePw);
                        driver.findElement(By.css('#memLogin > div.save_idW > input')).click();
                        driver.getCurrentUrl().then(function (url) {
                            if (url == "https://login.11st.co.kr/login/Login.tmall?returnURL=http%3A%2F%2Fbuy.11st.co.kr%2Fcart%2FCartAction.tmall%3Fmethod%3DgetCartList&errorCode=001&age19=") {
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
                        driver.findElement(By.css('span.cart')).getText().then(function () {
                            loginNext = true;
                        }).catch(function (ex) {
                            loginNext = false;
                        });
                        break;
                    case 'auction':
                        driver.get('https://memberssl.auction.co.kr/authenticate/?url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab');
                        driver.findElement(By.id('id')).sendKeys(loginData.websiteId);
                        driver.findElement(By.id('password')).sendKeys(loginData.websitePw);
                        driver.findElement(By.id('Image1')).click();
                        driver.getCurrentUrl().then(function (url) {
                            if (url == "https://memberssl.auction.co.kr/Authenticate/default.aspx?return_value=-1&SELLER=&url=http%3a%2f%2fbuy.auction.co.kr%2fbuy%2fA2014%2fCart%2fCart.aspx%3ffrm%3dhometab&loginType=0&loginUIType=") {
                                loginNext = false;
                            }
                        })
                        break;
                }
            }, function (err) {
                console.log("err - setWebsite - switch() : ", err);
            });

            driver.then(function () {
                if (loginNext) {
                    driver.sleep(500);
                    driver.manage().getCookies().then(function (cookies) {
                        for (var i in cookies) {
                            if (i == 0) {
                                webCookies += cookies[i]['name'] + '=' + cookies[i]['value'];
                            } else {
                                webCookies += ';' + cookies[i]['name'] + '=' + cookies[i]['value'];
                            }
                        }
                        driver.then(function () {
                            callback(null, loginData, webCookies);
                        });
                    })
                } else {
                    callback("err");
                }

            }, function (err) {
                console.log("err - setWebsite - getCookies : ", err);
            });
            driver.quit();

        }, function (loginData, webCookies, callback) {
            db.pool.getConnection(function (err, conn) {
                if (err) {
                    return;
                }
                var sql = "insert into tbl_loginData (email, website, websiteId, websitePw) values (?,?,?,HEX(AES_ENCRYPT(?,'aes')))";
                conn.query(sql, [loginData.email, loginData.website, loginData.websiteId, loginData.websitePw], function (err, result) {
                    conn.release();
                    if (err) {
                        console.log("insert logindata err");
                        console.log(err);
                        next = false;
                        callback(null, null, null);
                    } else {
                        console.log("insert done");
                        callback(null, loginData, webCookies);
                    }
                });
            });

        },
        function (loginData, webCookies, callback) {
            console.log(next);
            if (next) {
                db.pool.getConnection(function (err, conn) {
                    if (err) {
                        return;
                    }
                    var sql = "update tbl_logindata set cookies = ? where email = ? and website = ?";
                    conn.query(sql, [webCookies, loginData.email, loginData.website], function (err, rows, fields) {
                        conn.release();
                        if (err) {
                            console.log("update cookies err");
                            callback(err);
                        }
                        else callback(null);
                    });
                });

            } else {
                callback("err");
            }

        }
    ];
    async.waterfall(task5, function (err) {
        if (err) {
            console.log("err");
            CBfunc("err");
        }
        else {
            CBfunc("success");
        }
    });
}
process.setMaxListeners(100);

module.exports.setCookiesAtAddLoginData = setCookiesAtAddLoginData;
module.exports.setCookiesForScheduling = setCookiesForScheduling;
module.exports.cartCrawling = cartCrawling;
