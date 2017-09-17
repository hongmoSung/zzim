const async = require('async');
const cheerio = require('cheerio');
const request = require('request');
var qs = require("querystring");
var iconv = require('iconv-lite');
var db = require('./ourDb.js');
var selenium = require('./selenium.js');
require('date-utils');

function chase(url, func) {
    var $;
    var startTime = new Date().getTime();
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
                    callback(null, title);
                }
            });
        },
        function (title, callback) {
            var form = {
                "q": 'site:danawa.com 가격비교 ' + title
            };
            var formData = qs.stringify(form);
            var googleSearchUrl = "https://www.google.co.kr/search?" + formData;
            //console.log('googleSearchUrl:::::::::::: ' + googleSearchUrl);
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
                        callback(null, 'err');
                    } else {
                        url = "http://" + url;
                        callback(null, url);
                    }
                }
            });
        },
        function (url, callback) {
            if (url == 'err') {
                console.log('에러 처리 ..................');
                var item = {
                    'err': true
                };
                callback(null, item);
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
                        var item = {
                            'err': false,
                            'picUrl': img,
                            'pName': itemName,
                            'crawlingUrl': url,
                            'pLowest': itemPrice
                        };
                        callback(null, item);

                    }
                });
            }
        }
    ];
    async.waterfall(task, function (err, result) {
        if (err)
            console.log('err');
        else {
            func(result);
        }
    });
};

//재검색
function reSearch(data, func) {
    var $;
    // var startTime = new Date().getTime();
    var task;
    task = [
        function (callback) {
            var option = {
                method: "GET",
                url: data.url,
                headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                encoding: null
            };
            request(option, function (err, res, body) {
                var strContents = new Buffer(body);
                body = iconv.decode(strContents, 'utf-8').toString();
                $ = cheerio.load(body);
                var form = {
                    "q": 'site:danawa.com 가격비교 ' + data.title
                };
                var formData = qs.stringify(form);
                var googleSearchUrl = "https://www.google.co.kr/search?" + formData;
                // console.log('googleSearchUrl:::::::::::: ' + googleSearchUrl);
                var option = {
                    method: "GET",
                    url: googleSearchUrl,
                    headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
                    encoding: null
                };
                request(option, function (err, res, body) {
                    var strContents = new Buffer(body);
                    body = iconv.decode(strContents, 'utf-8').toString();
                    $ = cheerio.load(body);
                    var url = $('cite._Rm').html();
                    // console.log('url :::::::::::::::::::::::: ', url);
                    if (url.indexOf('prod') == -1) {
                        // console.log('구글 검색 결과가ㅣ 없습니다.......................');
                        callback(null, 'err');
                    } else {
                        url = "http://" + url;
                        //console.log('url :::::::::::::::::::::::: ', url);
                        if (url.indexOf('prod') != -1) {
                            // console.log('내가 원하는 주소.....');
                            callback(null, url);
                        } else {
                            // console.log('내가 원하지 않는 주소.....');
                            callback(null, 'err2');
                        }
                    }
                });
            });
        },
        function (url, callback) {
            // console.log('url ::::::::::::::', url);
            if (url == 'err' || url == 'err2') {
                // console.log('에러 처리 ..................');
                var item = {
                    'err': true
                };
                callback(null, item);
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
                        var item = {
                            'err': false,
                            'picUrl': img,
                            'pName': itemName,
                            'crawlingUrl': url,
                            'pLowest': itemPrice
                        };
                        console.log(item);
                        callback(null, item);
                    } else {
                      callback(err, null);
                    }
                });

            }
        }
    ];
    async.waterfall(task, function (err, result) {
        if (err) {
          func(result);
          console.log('err');
        } else {
          console.log('not err');
          func(result);
        }
    });
}

//cron crawling
function cronCrawling(url, callback) {
    // console.log('cronCrawling url :::::::', url);
    var option = {
        method: "GET",
        url: url,
        headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
        encoding: null
    };
    request(option, function (err, res, body) {
        if (err || typeof body != 'object') {
            console.log('cronCrawling err....');
            callback(err, null);
        } else {
          var strContents = new Buffer(body);
          body = iconv.decode(strContents, 'EUC-KR').toString();
          $ = cheerio.load(body);

          var pLowest = $('div.goods_detail_area > div.goods_buy_line > a > span.big_price').text().trim().replace(/,/gi, '');
          var pName = $('p.goods_title').text().trim();
          var pUrl = $('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)').attr('href');
          var picUrl = $('#img_areas > a > img').attr('src');
          var crawlingUrl = url;

          var mainSite = {
            'gmarket': 'EE715',
            '11st': 'TH201',
            'auction': 'EE715',
            'tmon': 'TN920',
            '위메프': 'TN729',
          }
          /*
          pLowest = pLowest.trim().replace(',', '');
          console.log(':::::::::::::::', pLowest);
          */
          var cmpnyc = '';
          var link_pcode = '';
          if (typeof pUrl == 'undefined' || typeof pUrl == 'err') {
            cmpnyc = 'err';
            link_pcode = 'err';
            pLowest = -1;
          }
          else {

            // 회사 코드
            cmpnyc = pUrl.substr(pUrl.indexOf('cmpnyc') + 'cmpnyc'.length + 1, 5);
            //console.log('cmpnyc :::::::::::::::::::::::::::: ', cmpnyc);

            var b = pUrl.substr(pUrl.indexOf('link_pcode') + 'link_pcode'.length + 1).split('&');
            link_pcode = b[0];
            //console.log('link_pcode::::::::::::::::::::::::::::::::::', link_pcode);
            var c = pUrl.substr(pUrl.indexOf('pcode') + 'pcode'.length + 1).split('&');
            pcode = c[0];
          }

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
            if(link_pcode.indexOf('_') != -1) {
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
        }

    });
};

//startTrack
function startTracking(data, func) {

  var pName = data.pName;
  var notifyPrice = data.notifyPrice;
  var crawlingUrl = data.crawlingUrl;
  var email = data.email;

  var result = {
                  'result': false,
                  'msg': '트렉킹 실패'
                };

  db.selectProduct(pName, function(err, rows) {
    if(err) {
      func(result);
    } else {
      // 조회된 상품이 있는경우
      if(rows) {
        var pNo = rows[0].pNo;
        db.checkTracking(email, pNo, function(err, rows) {
          if(err) {
            func(result);
          } else {
            if(rows) {
              result.result = false;
              result.msg = "이미 트렉킹중인 제품"
              func(result);
            } else {
              db.addTracking(email, pNo, notifyPrice, function(err, result) {
                if(err) {
                  func(result);
                } else {
                  if(result) {
                    result.result = true;
                    result.msg = "트렉킹 성공";
                  } else {
                    result.result = false;
                    result.msg = "트렉킹 실패";
                  }
                  func(result);
                }
              });
            }
          }
        });
      } else {
        track(crawlingUrl, function(err, result) {
          if(err) {
            func(result);
          } else {
            var data = result;
            db.addProduct(data, function(err, result) {
              if(err) {
                console.log('addProduct err');
                func(result);
              } else {
                if(result) {
                  db.selectProduct(pName, function(err, rows) {
                    if(err) {
                      // callback(err);
                      func(result);
                    } else {
                      var pNo = rows[0].pNo;
                      if(rows) {
                        db.addTracking(email, pNo, notifyPrice, function(err, result) {
                          if(err) {throw err}
                          if(result) {
                            result.result = true;
                            result.msg = "트렉킹 성공";
                            func(result);
                          } else {
                            result.result = false;
                            result.msg = "트렉킹 성공";
                            func(result);
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

// function track(url, callback) {
//     var product = {};
//     var pcode = '';
//     var cmpnyc = '';
//     var cmpnyUrl = '';
//     var task = [
//         function (callback) {
//             var option = {
//                 method: "GET",
//                 url: url,
//                 headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"},
//                 encoding: null
//             };
//             request(option, function (err, res, body) {
//                 var strContents = new Buffer(body);
//                 body = iconv.decode(strContents, 'EUC-KR').toString();
//                 $ = cheerio.load(body);
//
//                 var pLowest = $('div.goods_detail_area > div.goods_buy_line > a > span.big_price').text().trim().replace(/,/gi, '');
//                 var pName = $('p.goods_title').text().trim();
//                 var pUrl = $('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)').attr('href');
//                 var picUrl = $('#img_areas > a > img').attr('src');
//                 var crawlingUrl = url;
//
//                 cmpnyc = pUrl.substr(pUrl.indexOf('cmpnyc') + 'cmpnyc'.length + 1, 5);
//
//                 var b = pUrl.substr(pUrl.indexOf('link_pcode') + 'link_pcode'.length + 1).split('&');
//                 var link_pcode = b[0];
//                 var c = pUrl.substr(pUrl.indexOf('pcode') + 'pcode'.length + 1).split('&');
//                 pcode = c[0];
//
//                 var flag = false;
//
//                 product = {
//                     'pName': pName,
//                     'pUrl': pUrl,
//                     'pLowest': pLowest,
//                     'picUrl': picUrl,
//                     'crawlingUrl': crawlingUrl
//                 }
//
//                 switch (cmpnyc) {
//                     case 'EE128':
//                         product.pUrl = 'item.gmarket.co.kr/DetailView/Item.asp?goodscode=' + link_pcode;
//                         flag = true;
//                         break;
//                     case 'TH201':
//                         product.pUrl = 'http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=' + link_pcode;
//                         flag = true;
//                         break;
//                     case 'EE715':
//                         product.pUrl = 'http://itempage3.auction.co.kr/DetailView.aspx?ItemNo=' + link_pcode;
//                         flag = true;
//                         break;
//                     case 'TN920':
//                         product.pUrl = 'http://www.ticketmonster.co.kr/deal/' + link_pcode;
//                         flag = true;
//                         break;
//                     case 'TN729':
//                         if (link_pcode.indexOf('_') != -1) {
//                             var we = link_pcode.split('_');
//                             link_pcode = we[1];
//                         }
//                         product.pUrl = 'http://www.wemakeprice.com/deal/adeal/' + link_pcode;
//                         flag = true;
//                         break;
//                     case 'ED910':
//                         product.pUrl = 'http://shopping.interpark.com/product/productInfo.do?prdNo=' + link_pcode;
//                         flag = true;
//                         break;
//                     default:
//                 }
//                 callback(null, cmpnyc, flag)
//             });
//
//         },
//         function (cmpnyc, flag, callback) {
//             if (!flag) {
//                 db.selectSite(cmpnyc, function (err, rows) {
//                     if (rows) {
//                         cmpnyUrl = rows[0].cmpnyUrl;
//                         product.pUrl = cmpnyUrl + '?nProdCode=' + pcode;
//                         console.log('pUrl ************************ ', product.pUrl);
//                         flag = true;
//                         callback(null, flag);
//                     } else {
//                         var data = {
//                             'url': url,
//                             'pcode': pcode,
//                             'cmpnyc': cmpnyc
//                         }
//                         selenium.getSiteUrl(data, function (err, result) {
//                             if (err) {
//                                 console.log("seleninum.getStieUrl :: error");
//                                 callback("err");
//                             } else {
//                                 // console.log('result::::::::::::::', result);
//                                 product.pUrl = result;
//                                 callback(null);
//                             }
//                         });
//                     }
//                 });
//             } else {
//                 console.log("seleinum 실행 안돼시발");
//                 callback(null);
//             }
//
//         }
//     ];
//     async.waterfall(task, function (err) {
//         if (err) {
//             console.log('err');
//             callback(err, null);
//         } else {
//             callback(null, product);
//         }
//     });
// }



module.exports.chase = chase;
// module.exports.track = track;
module.exports.reSearch = reSearch;
module.exports.cronCrawling = cronCrawling;
module.exports.startTracking = startTracking;
