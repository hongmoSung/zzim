const async = require('async');
const cheerio = require('cheerio');
const request = require('request');
var qs = require("querystring");
var iconv = require('iconv-lite');
var db = require('../ourDb.js');
var notification = require('./notificationService.js');
require('date-utils');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;

function search(url, func) {
    var $;
    var task;
    task = [
        function (callback) {
            var option = {
                method: "GET",
                url: url,
                headers: {"User-Agent": "Mozilla/5.0"},
                encoding: null
            };
            request(option, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var title
                    if (url.indexOf('gmarket') != -1) {
                        $ = cheerio.load(body);
                        title = $('#itemcase_basic > h1').text();
                    }
                    if (url.indexOf('11st') != -1) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        $ = cheerio.load(body);
                        title = $("div.prdc_heading_v2 div.heading h2").text();
                    }
                    if (url.indexOf('interpark') != -1) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'UTF-8').toString();
                        $ = cheerio.load(body);
                        title = $("meta[property='og:title']").attr('content');
                        //console.log(title);
                    }
                    if (url.indexOf('auction') != -1) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        $ = cheerio.load(body);
                        title = $('#frmMain > h1').text();
                    }
                    callback(null, null, title);
                } else {
                    callback(null, err , null);
                }
            });
        },
        function (err, title, callback) {
            if (err) {
                callback(null, err , null);
            } else {
                var form = {
                    "q": 'site:danawa.com 가격비교 ' + title
                };
                var formData = qs.stringify(form);
                var googleSearchUrl = "https://www.google.co.kr/search?" + formData;
                var option = {
                    method: "GET",
                    url: googleSearchUrl,
                    headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                    encoding: null
                };
                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'utf-8').toString();
                        $ = cheerio.load(body);
                        var url = $('cite._Rm').html();
                        url += '';
                        //console.log('url :::::::::::::::::::::::: ', url);
                        if (url.indexOf('prod') == -1) {
                            console.log('구글 검색 결과가 없습니다.......................');
                            callback(null, null, null);
                        } else {
                            url = "http://" + url;
                            callback(null, null, url);
                        }
                    } else {
                        callback(null, err , null);
                    }
                });
            }
        },
        function (err, url, callback) {
            if (err) {
                callback(err);
            } else {
                var option = {
                    method: "GET",
                    url: url,
                    headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                    encoding: null
                };
                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        $ = cheerio.load(body);

                        var img = $('#img_areas > a > img').attr('src');
                        var itemName = $('p.goods_title').text().trim();
                        var itemPrice = $('.big_price').text().trim();
                        img = img.replace("http://","https://");
                        var item = {
                            'err': false,
                            'picUrl': img,
                            'pName': itemName,
                            'crawlingUrl': url,
                            'pLowest': itemPrice
                        };

                        callback(null, item);
                    } else {
                        callback(err);
                    }
                });
            }
        }
    ];
    async.waterfall(task, function (err, result) {
        if (err) {
            console.log('search err');
            func(null);
        } else {
            func(result);
        }
    });
};

//재검색
function reSearch(pName, func) {
    var $;
    var task;
    var url = '';
    task = [
        function (callback) {
            var form = {
                "q": 'site:danawa.com 가격비교 ' + pName
            };
            var formData = qs.stringify(form);
            var googleSearchUrl = "https://www.google.co.kr/search?" + formData;
            var option = {
                method: "GET",
                url: googleSearchUrl,
                headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                encoding: null
            };
            request(option, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var strContents = new Buffer(body);
                    body = iconv.decode(strContents, 'utf-8').toString();
                    $ = cheerio.load(body);
                    url = $('cite._Rm').html();
                    if(url == null){
                        callback(null, err);
                    }
                    else if (url.indexOf('prod') == -1) {
                        callback(null, err);
                    } else {
                        url = "http://" + url;
                        if (url.indexOf('prod') != -1) {
                            callback(null, null);
                        } else {
                            callback(null, err);
                        }
                    }
                } else {
                    callback(null, err);
                }
            });
        },
        function (err, callback) {
            if (err) {
                callback(err);
            } else {
                var option = {
                    method: "GET",
                    url: url,
                    headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                    encoding: null
                };
                request(option, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var strContents = new Buffer(body);
                        body = iconv.decode(strContents, 'EUC-KR').toString();
                        $ = cheerio.load(body);

                        var img = $('#img_areas > a > img').attr('src');
                        img = img.replace("http://","https://");
                        var itemName = $('p.goods_title').text().trim();
                        var itemPrice = $('.big_price').text().trim();
                        var item = {
                            'err': false,
                            'picUrl': img,
                            'pName': itemName,
                            'crawlingUrl': url,
                            'pLowest': itemPrice
                        };
                        callback(null, item);
                    } else {
                        callback(err);
                    }
                });
            }
        }
    ];
    async.waterfall(task, function (err, result) {
        if (err) {
            func(err);
        } else {
            func(null, result);
        }
    });
}

//cron crawling
function crawlingForScheduling(url, callback) {
    var option = {
        method: "GET",
        url: url,
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
        encoding: null
    };
    request(option, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            var strContents = new Buffer(body);
            body = iconv.decode(strContents, 'EUC-KR').toString();
            $ = cheerio.load(body);

            var pLowest = $('div.goods_detail_area > div.goods_buy_line > a > span.big_price').text().trim().replace(/,/gi, '');
            var pName = $('p.goods_title').text().trim();
            var pUrl = $('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)').attr('href');
            var picUrl = $('#img_areas > a > img').attr('src');
            picUrl = picUrl.replace("http://","https://");
            var crawlingUrl = url;

            var mainSite = {
                'gmarket': 'EE715',
                '11st': 'TH201',
                'auction': 'EE715',
                'tmon': 'TN920',
                '위메프': 'TN729',
            }
            var cmpnyc = '';
            var link_pcode = '';
            // 회사 코드
            cmpnyc = pUrl.substr(pUrl.indexOf('cmpnyc') + 'cmpnyc'.length + 1, 5);
            //console.log('cmpnyc :::::::::::::::::::::::::::: ', cmpnyc);

            var b = pUrl.substr(pUrl.indexOf('link_pcode') + 'link_pcode'.length + 1).split('&');
            link_pcode = b[0];
            //console.log('link_pcode::::::::::::::::::::::::::::::::::', link_pcode);
            var c = pUrl.substr(pUrl.indexOf('pcode') + 'pcode'.length + 1).split('&');
            pcode = c[0];

            switch (cmpnyc) {
                case 'EE128':
                    //console.log('gmarket::::::::::::::');
                    pUrl = 'http://item.gmarket.co.kr/DetailView/Item.asp?goodscode=' + link_pcode;
                    break;
                case 'TH201':
                    //console.log('11st::::::::::::::');
                    pUrl = 'http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=' + link_pcode;
                    break;
                case 'EE715':
                    //console.log('auction::::::::::::::');
                    pUrl = 'http://itempage3.auction.co.kr/DetailView.aspx?ItemNo=' + link_pcode;
                    break;
                case 'TN920':
                    //console.log('tmon::::::::::::::');
                    pUrl = 'http://www.ticketmonster.co.kr/deal/' + link_pcode;
                    break;
                case 'TN729':
                    //console.log('위메프::::::::::::::');
                    if (link_pcode.indexOf('_') != -1) {
                        var we = link_pcode.split('_');
                        link_pcode = we[1];
                    }
                    pUrl = 'http://www.wemakeprice.com/deal/adeal/' + link_pcode;
                    break;
                case 'ED910':
                    //console.log('인터파크::::::::::::::');
                    pUrl = 'http://shopping.interpark.com/product/productInfo.do?prdNo=' + link_pcode;
                    break;
                case 'err':
                    pUrl = link_pcode;
                    break;
                default:

            }
            var product = {
                'pName': pName,
                'pUrl': pUrl,
                'pLowest': pLowest,
                'picUrl': picUrl,
                'crawlingUrl': crawlingUrl,
                'cmpnyc': cmpnyc,
                'link_pcode': link_pcode,
                'pcode': pcode
            }
            callback(null, product);

        } else {
            callback(err, null);
        }
    });
};

//startTrack
function startTracking(data, func) {
    var pName = data.pName;
    var notifyPrice = data.notifyPrice;
    var crawlingUrl = data.crawlingUrl;
    var email = data.email;
    var pLowest = data.pLowest;

    var msg = {
        'result': true,
        'msg': '등록되었습니다.'
    };

    db.selectProduct(pName, function (err, rows) {
        if (err) {
            func(msg);
        } else {
            // 조회된 상품이 있는경우
            if (rows) {
                var pNo = rows[0].pNo;
                db.checkTracking(email, pNo, function (err, rows) {
                    if (err) {
                        func(msg);
                    } else {
                        if (rows) {
                            msg.result = false;
                            msg.msg = "이미 트렉킹중인 제품"
                            func(msg);
                        } else {
                            db.addTracking(email, pNo, notifyPrice, function (err, result) {
                                if (err) {
                                    msg.result = false;
                                    msg.msg = "유효하지 않는 email입니다. email을 재설정 해주세요"
                                    func(msg);
                                } else {
                                    if (result) {
                                        ///
                                        msg.result = true;
                                        msg.msg = "트렉킹 성공";
                                        func(msg);
                                    } else {
                                        msg.result = false;
                                        msg.msg = "트렉킹 실패";
                                        func(msg);
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                func(msg);
                track(data.crawlingUrl, function (err, result) {
                    if (err) {
                        // func(msg);
                    } else {
                        var data = result;
                        db.addProduct(data, function (err, result) {
                            if (err) {
                                console.log('addProduct err');
                                // func(msg);
                            } else {
                                if (result) {
                                    db.selectProduct(pName, function (err, rows) {
                                        if (err) {
                                            // func(msg);
                                        } else {
                                            var pNo = rows[0].pNo;
                                            if (rows) {
                                                db.addTracking(email, pNo, notifyPrice, function (err, result) {
                                                    if (err) {
                                                        msg.result = false;
                                                        msg.msg = "유효하지 않는 email입니다. email을 재설정 해주세요"
                                                        console.log('유효하지 않는 email입니다. email을 재설정 해주세요');
                                                        // func(msg);
                                                    } else {
                                                        if (result) {
                                                            //
                                                            var product = {
                                                                'pNo': pNo,
                                                                'pLowest': pLowest
                                                            }
                                                            db.addHistory(product, function (err, result) {
                                                                if (err) {
                                                                    console.log('addHistory err');
                                                                    // func(result);
                                                                } else {
                                                                    if (result) {
                                                                        msg.result = true;
                                                                        msg.msg = "트렉킹 성공";
                                                                        console.log('add history success');
                                                                        // func(msg);
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            // func(msg);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

function track(url, callback) {
    var product = {};
    var pcode = '';
    var cmpnyc = '';
    var cmpnyUrl = '';
    var link_pcode = '';
    var task = [
        function (callback) {
            var option = {
                method: "GET",
                url: url,
                headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                encoding: null
            };
            request(option, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var strContents = new Buffer(body);
                    body = iconv.decode(strContents, 'EUC-KR').toString();
                    $ = cheerio.load(body);

                    var pLowest = $('div.goods_detail_area > div.goods_buy_line > a > span.big_price').text().trim().replace(/,/gi, '');
                    var pName = $('p.goods_title').text().trim();
                    var pUrl = $('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)').attr('href');
                    var picUrl = $('#img_areas > a > img').attr('src');
                    picUrl = picUrl.replace("http://","https://");
                    var crawlingUrl = url;
                    console.log('url :::::::::::::::', pUrl);
                    cmpnyc = pUrl.substr(pUrl.indexOf('cmpnyc') + 'cmpnyc'.length + 1, 5);

                    var b = pUrl.substr(pUrl.indexOf('link_pcode') + 'link_pcode'.length + 1).split('&');
                    link_pcode = b[0];
                    console.log('첫번째 link_pcode::::::::::::::::::::::', b[0]);
                    console.log('첫번째2 link_pcode::::::::::::::::::::::', link_pcode);
                    var c = pUrl.substr(pUrl.indexOf('pcode') + 'pcode'.length + 1).split('&');
                    pcode = c[0];

                    var flag = false;

                    product = {
                        'pName': pName,
                        'pUrl': pUrl,
                        'pLowest': pLowest,
                        'picUrl': picUrl,
                        'crawlingUrl': crawlingUrl
                    }

                    switch (cmpnyc) {
                        case 'EE128':
                            product.pUrl = 'item.gmarket.co.kr/DetailView/Item.asp?goodscode=' + link_pcode;
                            flag = true;
                            break;
                        case 'TH201':
                            product.pUrl = 'http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=' + link_pcode;
                            flag = true;
                            break;
                        case 'EE715':
                            product.pUrl = 'http://itempage3.auction.co.kr/DetailView.aspx?ItemNo=' + link_pcode;
                            flag = true;
                            break;
                        case 'TN920':
                            product.pUrl = 'http://www.ticketmonster.co.kr/deal/' + link_pcode;
                            flag = true;
                            break;
                        case 'TN729':
                            if (link_pcode.indexOf('_') != -1) {
                                var we = link_pcode.split('_');
                                link_pcode = we[1];
                            }
                            product.pUrl = 'http://www.wemakeprice.com/deal/adeal/' + link_pcode;
                            flag = true;
                            break;
                        case 'ED910':
                            product.pUrl = 'http://shopping.interpark.com/product/productInfo.do?prdNo=' + link_pcode;
                            flag = true;
                            break;
                        default:
                    }
                    callback(null, null, cmpnyc, flag)
                } else {
                    callback(null, err);
                }
            });

        },
        function (err, cmpnyc, flag, callback) {
            if (err) {
                callback(err);
            } else {
                if (!flag) {
                    db.selectSite(cmpnyc, function (err, rows) {
                        if (rows) {
                            cmpnyUrl = rows[0].cmpnyUrl;
                            if (link_pcode != '') {
                                product.pUrl = cmpnyUrl + '?pd_no=' + link_pcode;
                            } else {
                                product.pUrl = cmpnyUrl + '?nProdCode=' + pcode;
                            }
                            callback(null, product);
                        } else {
                            var data = {
                                'url': url,
                                'pcode': pcode,
                                'cmpnyc': cmpnyc,
                                'link_pcode': link_pcode
                            }
                            console.log('selenium 실행');
                            getSiteUrlAtStartTracking(data, function (err, result) {
                                if (err) {
                                    console.log("getSiteUrlAtStartTracking :: error");
                                    callback(err);
                                } else {
                                    product.pUrl = result;
                                    callback(null, product);
                                }
                            });
                        }
                    });
                } else {
                    callback(null, product);
                }

            }

        }
    ];
    async.waterfall(task, function (err, product) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, product);
        }
    });
}

function trackScheduling() {
    var a = [];
    db.selectAllProduct(function (err, rows) {
        if (err) {
            console.log('selectAllProduct err::::::::::::::');
        } else {
            if (rows) {
                if (rows.length > 0) {
                    console.log('totalProduct ::::::::::::::', rows.length);
                    rows.forEach(function (row, i) {
                        a[i] = row;
                        crawlingForScheduling(a[i].crawlingUrl, function (err, product) {
                            if (err) {
                                console.log('crawlingForScheduling err::::::::::::::', a[i].pNo);
                            } else {
                                product.pNo = a[i].pNo;
                                db.addHistory(product, function (err, result) {
                                    if (err) {
                                        console.log('addHistory err::::::::::::::');
                                    } else {
                                        // msg = '스케쥴링 성공';
                                        if (a[i].pLowest != product.pLowest) {
                                            var cmpnyc = product.cmpnyc;
                                            if (cmpnyc == 'EE128' || cmpnyc == 'TH201' || cmpnyc == 'EE715' || cmpnyc == 'TN920' || cmpnyc == 'TN729' || cmpnyc == 'ED910') {
                                                console.log('대기업 가격변동,,,, :::::::  ', product.pNo);
                                                updateProductAtScheduling(product);
                                            } else {
                                                db.selectSite(cmpnyc, function (err, rows) {
                                                    console.log('가격변동 중 selenium 대상이 아닌것,,,, :::::::  ', product.pNo);
                                                    if (err) {
                                                        console.log('selectSite err::::::::::::::::::::::', cmpnyc);
                                                    } else {
                                                        if (rows) {
                                                            console.log('rows::::', rows);
                                                            rows.forEach(function (row, i) {
                                                                product.pUrl = row.cmpnyUrl + '?nProdCode=' + product.pcode;
                                                            });
                                                            updateProductAtScheduling(product);
                                                        } else {
                                                            console.log('selenium 대상,,,, :::::::  ', product.pNo);
                                                            getSiteUrlAtTrackScheduling(product, function (err, result) {
                                                                if (err) {
                                                                    console.log('getSiteUrlAtTrackScheduling err');
                                                                } else {
                                                                    if (result) {
                                                                        console.log(result);
                                                                        console.log('getSiteUrlAtTrackScheduling success');
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                });
                                            }
                                        } else {
                                            //console.log('가격변동 없음', product.pNo);
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

function updateProductAtScheduling(product) {
    db.updateProduct(product, function (err, result) {
        if (err) {
            console.log('updateProduct err');
        } else {
            if (result) {
                db.selectTracking(product.pNo, function (err, rows, fields) {
                    if (err) {
                        console.log('selectTracking err');
                    } else {
                        if (rows) {
                            var data = rows;
                            db.selectToken(rows, function (err, rows) {
                                if (err) {
                                    console.log('selectToken err');
                                } else {
                                    var tokenArrWeb = [];
                                    var tokenArrAndroid = [];
                                    if (rows) {
                                        console.log('가격변동...', rows);
                                        // callback(null, rows);
                                        rows.forEach(function (row, i) {
                                            notification.sendEmail(product, row.email, row.notifyPrice);

                                            switch (row.device) {
                                                case 1:
                                                    tokenArrWeb.push(row.token);
                                                    break;
                                                case 2:
                                                    tokenArrAndroid.push(row.token);
                                                    break;
                                                default:
                                            }
                                        });
                                    } else {
                                        console.log('selectToken 없음');
                                    }
                                    notification.sendNotificationWeb(product.pName, product.pNo, tokenArrWeb);
                                    notification.sendNotificationAndroid(product.pName, product.pNo, tokenArrAndroid);
                                }
                            });
                        } else {
                            console.log('가격변동 상품중에 알림가격을 만족하는 상품이 없습니다. 상품코드 ::: ', product.pNo);
                        }
                    }
                });
            }
        }
    });
}

function getSiteUrlAtStartTracking(data, callback) {

    var driver = new webdriver.Builder().forBrowser('chrome').build();

    driver.then(function () {
        driver.get(data.url).then(function(){
            driver.findElement(By.css('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)')).then(function (el) {
                el.click();
                driver.getAllWindowHandles().then(function(allWindows){
                    driver.switchTo().window(allWindows[allWindows.length - 1]);
                    driver.sleep(3500);
                    return driver.getCurrentUrl();
                },function(err){
                    console.log(err);
                    driver.quit();
                })
                    .then(function (currentUrl) {
                        var cmpnyUrl = currentUrl.substr(0, currentUrl.indexOf('?'));
                        // var pUrl = '';
                        // var pUrl = cmpnyUrl + '?nProdCode=' + data.pcode;
                        // var pUrl = cmpnyUrl + '?pd_no=' + data.pcode;

                        if (data.link_pcode != -1) {
                            console.log('link_pcode가 있습니다.');
                        } else {
                            console.log('link_pcode가 없습니다.');
                        }

                        if (currentUrl.indexOf('pd_no') != -1) {
                            console.log('pd_no');
                            var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                            var pd_no = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                            data.pUrl = cmpnyUrl + '?pd_no=' + pd_no;
                        } else if (currentUrl.indexOf('pcode') != -1) {
                            console.log('pcode');
                            var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                            var pcode = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                            data.pUrl = cmpnyUrl + '?pcode=' + pcode;
                        } else if (currentUrl.indexOf('nProdCode') != -1) {
                            console.log('nProdCode');
                            var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                            var nProdCode = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                            data.pUrl = cmpnyUrl + '?nProdCode=' + nProdCode;
                        }
                        var site = {
                            'cmpnyc': data.cmpnyc,
                            'cmpnyUrl': cmpnyUrl
                        }
                        db.addSite(site, function (err, result) {
                            if (err) {
                                console.log('insert addSite err::::::::::::::');
                                callback("err");
                            } else {
                                if (result) {
                                    console.log('insert addSite 성공.....', data);
                                    callback(null, data.pUrl);
                                } else {
                                    callback("err");
                                }
                            }
                        });
                    });
                driver.quit();
            },function(err){
                console.log(err);
                driver.quit();
            });
        },function(err){
            console.log(err);
            driver.quit();
        });
    }, function (err) {
        console.log("err - getSiteUrlAtStartTracking::::::::::::::");
        driver.quit();
        callback("err");
    });

}

function getSiteUrlAtTrackScheduling(data, callback) {
    var driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.then(function () {
        driver.get(data.pUrl)
            .then(function () {
                driver.sleep(3500);
                return driver.getCurrentUrl();
            },function(err){
                console.log(err);
                driver.quit();
            })
            .then(function (currentUrl) {
                if (data.link_pcode != -1) {
                    console.log('link_pcode가 있습니다.');
                } else {
                    console.log('link_pcode가 없습니다.');
                }

                if (currentUrl.indexOf('pd_no') != -1) {
                    console.log('pd_no');
                    var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                    var pd_no = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                    data.pUrl = cmpnyUrl + '?pd_no=' + pd_no;
                } else if (currentUrl.indexOf('pcode') != -1) {
                    console.log('pcode');
                    var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                    var pcode = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                    data.pUrl = cmpnyUrl + '?pcode=' + pcode;
                } else if (currentUrl.indexOf('nProdCode') != -1) {
                    console.log('nProdCode');
                    var d = currentUrl.substr(currentUrl.indexOf('?') + 1, currentUrl.length).split('&');
                    var nProdCode = d[0].substr(d[0].indexOf('=') + 1, d[0].length);
                    data.pUrl = cmpnyUrl + '?nProdCode=' + nProdCode;
                }
                var site = {
                    'cmpnyc': data.cmpnyc,
                    'cmpnyUrl': cmpnyUrl
                }
                db.addSite(site, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        console.log('insert addSite 성공.....');
                        db.updateProduct(data, function (err, result) {
                            if (err) {
                                console.log('updateProduct err');
                                callback(err)
                            } else {
                                if (result) {
                                    console.log('getSiteUrlAtTrackScheduling 성공');
                                    callback(null, result);
                                }
                            }
                        });
                    }
                });
                driver.quit();
            },function(err){
                console.log(err);
                driver.quit();
            });
    }, function (err) {
        console.log(err);
        driver.quit();
        callback("err");
    });

}

module.exports.getSiteUrlAtStartTracking = getSiteUrlAtStartTracking;
module.exports.getSiteUrlAtTrackScheduling = getSiteUrlAtTrackScheduling;
module.exports.search = search;
module.exports.track = track;
module.exports.reSearch = reSearch;
module.exports.crawlingForScheduling = crawlingForScheduling;
module.exports.startTracking = startTracking;
module.exports.trackScheduling = trackScheduling;
