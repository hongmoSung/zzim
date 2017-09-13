const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
var chromedriver = require('chromedriver');
const driver = new webdriver.Builder().forBrowser('chrome').build();
const cheerio = require('cheerio');
var request = require('request');
require('date-utils');
var db = require('./ourDb.js');

function getSiteUrl(data, callback) {
  const By = webdriver.By;
  driver.get(data.url);
  driver.findElement(By.css('#block_top_blog > div.goods_top_area > div.goods_left_area > div.goods_detail_area > div.goods_buy_line > a:nth-child(2)')).click()
  .then(function() {
    driver.getAllWindowHandles().then(function(allWindows){
      // switch to the last tab
      driver.switchTo().window(allWindows[allWindows.length - 1])
    });
    driver.sleep(3500);
    return driver.getCurrentUrl();
  })
  .then(function(currentUrl) {
    var cmpnyUrl = currentUrl.substr(0, currentUrl.indexOf('?'));
    var pUrl = cmpnyUrl + '?nProdCode=' + data.pcode;
    var data2 = {
      'cmpnyc' : data.cmpnyc,
      'cmpnyUrl' : cmpnyUrl
    }
    db.addSite(data2, function(err, result) {
      if(result) {
        console.log('insert addSite 성공.....');
        callback(null, pUrl);
      }
    });
  });
}

module.exports.getSiteUrl = getSiteUrl;
