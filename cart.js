var db = require('./ourDb.js');
const async = require('async');
var iconv = require('iconv-lite');
const cheerio = require('cheerio');
const request = require('request');

function cartCrawling(email, func) {
    var startTime = new Date().getTime();
    var websiteList = {};

    var task = [
        function (callback) {
            var sql = "select * from tbl_logindata where email = ?";
            pool.getConnection(function(err, conn) {
                if(err) {
                    conn.release();
                    return;
                }
                conn.query(sql, [email], function (err, rows, fields) {
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
                        if($("tr.no_prd").length == 0){
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
            }else{
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
            }else{
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
            }else{
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
                                cLink = "http://item.gmarket.co.kr/Item?goodscode="+dataObj.cartItemList[i].ItemInfo.ItemNo;

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
                        }catch (e){
                            console.log("gmarket - get cart err");
                        }

                        var resultG = {};
                        resultG['gmarket'] = itemArr;
                        callback(null, resultG);
                    }
                });
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
                if (err) console.log(err);
                else func(result);
            });
        }
    });

}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

module.exports.cartCrawling = cartCrawling;
