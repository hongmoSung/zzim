const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const cheerio = require('cheerio');
var request = require('request');
require('date-utils');
var db = require('./ourDb.js');

function getSiteUrl(data, callback) {
    var driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(data.url);
    driver.findElement(By.css('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)')).click()
        .then(function () {
            driver.getAllWindowHandles().then(function (allWindows) {
                driver.switchTo().window(allWindows[allWindows.length - 1])
            });
            driver.sleep(3500);
            return driver.getCurrentUrl();
        })
        .then(function (currentUrl) {
            var cmpnyUrl = currentUrl.substr(0, currentUrl.indexOf('?'));
            var pUrl = cmpnyUrl + '?nProdCode=' + data.pcode;
            var data2 = {
                'cmpnyc': data.cmpnyc,
                'cmpnyUrl': cmpnyUrl
            }
            db.addSite(data2, function (err, result) {
                if (result) {
                    console.log('insert addSite 성공.....');
                    callback(null, pUrl);
                }else{
                    callback("err");
                }
            });
        });
}

function updateProductFromSelenium(data, callback) {
    console.log("data::::",data);
    var driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(data.pUrl)
    .then(function () {
      driver.sleep(3500);
      return driver.getCurrentUrl();
    })
    .then(function (currentUrl) {
      var cmpnyUrl = currentUrl.substr(0, currentUrl.indexOf('?'));
      var pUrl = cmpnyUrl + '?nProdCode=' + data.pcode;
      var data2 = {
        'cmpnyc': data.cmpnyc,
        'cmpnyUrl': cmpnyUrl
      }
      data.pUrl = pUrl;
      db.addSite(data2, function (err, result) {
        if(err) {
          callback(err);
        } else {
          if (result) {
            console.log('insert addSite 성공.....');
            db.updateProduct(data, function(err, result) {
              if(err) {
                console.log('updateProduct err');
                callback(err)
              } else {
                if(result) {
                  console.log('updateProductFromSelenium 성공');
                  callback(null, result);
                }
              }
            });
          }else{
            // callback("err");
          }
        }
      });
    });
}

module.exports.getSiteUrl = getSiteUrl;
module.exports.updateProductFromSelenium = updateProductFromSelenium;
