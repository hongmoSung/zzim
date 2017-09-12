const async = require('async');
const cheerio = require('cheerio');
const request = require('request');
var qs = require("querystring");
var client = require('cheerio-httpcli');
var iconv = require('iconv-lite');


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
            var param = {};
            client.fetch(googleSearchUrl, param, function (err, $, res) {
                var url = $('cite._Rm').html();
                //console.log('url :::::::::::::::::::::::: ', url);
                if(url == null || 'undefined') {
                  console.log('구글 검색 결과가ㅣ 없습니다.......................');
                  callback(null, 'err');
                } else {
                  url = "http://"+url;
                  callback(null, url);
                }
            });
        },
        function (url, callback) {
            client.fetch(url, {}, function (err, $, res) {
              if(url == 'err') {
                console.log('에러 처리 ..................');
                var item = {
                  'err' : true
                };
                callback(null,item);
              } else {
                var img = $('#img_areas > a > img').attr('src');
                var itemName = $('p.goods_title').text().trim();
                var itemPrice = $('.big_price').text().trim();
                var item = {
                  'err' : false,
                  'picUrl' : img,
                  'pName' : itemName,
                  'crawlingUrl': url,
                  'pLowest': itemPrice
                };
                callback(null,item);
              }
            });
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

function track(url, callback) {
  var option = {
      method: "GET",
      url: url,
      headers: {"User-Agent": "Mozilla/5.0"},
      encoding: null
  };
  request(option, function (err, res, body) {
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
                      '인터파크': 'ED910'
                    }
    /*
    pLowest = pLowest.trim().replace(',', '');
    console.log(':::::::::::::::', pLowest);
    */

    // 회사 코드
    var cmpnyc = pUrl.substr(pUrl.indexOf('cmpnyc') + 'cmpnyc'.length + 1, 5);
    //console.log('cmpnyc :::::::::::::::::::::::::::: ', cmpnyc);

    var b = pUrl.substr(pUrl.indexOf('link_pcode') + 'link_pcode'.length + 1).split('&');
    var link_pcode = b[0];
    //console.log('link_pcode::::::::::::::::::::::::::::::::::', link_pcode);

    switch (cmpnyc) {
      case 'EE128':
        //console.log('gmarket::::::::::::::');
        pUrl = 'item.gmarket.co.kr/DetailView/Item.asp?goodscode=' + link_pcode;
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
        pUrl = 'http://www.wemakeprice.com/deal/adeal/' + link_pcode;
        break;
      case 'ED910':
        //console.log('인터파크::::::::::::::');
        pUrl = 'http://shopping.interpark.com/product/productInfo.do?prdNo=' + link_pcode;
        break;
      default:

    }
    var product = {
      'pName': pName,
      'pUrl': pUrl,
      'pLowest': pLowest,
      'picUrl': picUrl,
      'crawlingUrl': crawlingUrl
    }
    callback(null, product);
  });
};


//재검색
function reSearch (title, url, func) {
  var $;
  var startTime = new Date().getTime();
  var task;
  task = [
    function(callback) {
      var option = {
          method: "GET",
          url: url,
          headers: {"User-Agent": "Mozilla/5.0"},
          encoding: null
      };
      request(option, function (err, res, body) {
          $ = cheerio.load(body);
          var form = {
            "q": 'site:danawa.com 가격비교 ' + title
          };
          var formData = qs.stringify(form);
          var googleSearchUrl = "https://www.google.co.kr/search?" + formData;
            console.log('googleSearchUrl:::::::::::: ' + googleSearchUrl);
          var param = {};
          client.fetch(googleSearchUrl, param, function (err, $, res) {
            var url = $('cite._Rm').html();
            //console.log('url :::::::::::::::::::::::: ', url);
            if(url == null) {
              console.log('구글 검색 결과가ㅣ 없습니다.......................');
              callback(null, 'err');
            } else {
              url = "http://"+url;
              console.log('url :::::::::::::::::::::::: ', url);
              if(url.indexOf('prod') != -1) {
                console.log('내가 원하는 주소.....');
                callback(null, url);
              } else {
                console.log('재입력조차 유효하지 않는 상품명...');
                callback(null, 'err2');
              }
            }
          });
      });
    },
    function (url, callback) {
        client.fetch(url, {}, function (err, $, res) {
          //console.log('$$$$$$$$$', $); 11
          if(url == 'err2') {
            console.log('재입력 에러 처리 ..................');
            var item = {
              'err' : true
            };
            callback(null,item);
          }
          else if(url == 'err') {
            console.log('에러 처리 ..................');
            var item = {
              'err' : true
            };
            callback(null,item);
          } else {
            var img = $('#img_areas > a > img').attr('src');
            var itemName = $('p.goods_title').text().trim();
            var itemPrice = $('.big_price').text().trim();
            var item = {
              'err' : false,
              'picUrl' : img,
              'pName' : itemName,
              'crawlingUrl': url,
              'pLowest' : itemPrice
            };
            callback(null,item);
          }
        });
    }
  ];
  async.waterfall(task, function (err, result) {
      if (err)
          console.log('err');
      else {
          func(result);
      }
  });
}

//cron crawling
function cronCrawling(url, callback) {
  var option = {
      method: "GET",
      url: url,
      headers: {"User-Agent": "Mozilla/5.0"},
      encoding: null
  };
  request(option, function (err, res, body) {
    if(err) {
      console.log('cronCrawling err....');
      callback(err, null);
    }

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
    if(typeof pUrl == 'undefined' || typeof pUrl == 'err') {
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
    }

    switch (cmpnyc) {
      case 'EE128':
        //console.log('gmarket::::::::::::::');
        pUrl = 'item.gmarket.co.kr/DetailView/Item.asp?goodscode=' + link_pcode;
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
      'crawlingUrl': crawlingUrl
    }
    callback(null, product);
  });
};

module.exports.chase = chase;
module.exports.track = track;
module.exports.reSearch = reSearch;
module.exports.cronCrawling = cronCrawling;
