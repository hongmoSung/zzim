var cron = require('node-cron');
var db = require('./ourDb.js');
require('date-utils');
var setCookies = require('./setUserCookies');
var sc = require('./scheduling.js');

console.log('batch start time', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
var batch = function(){

    cron.schedule('* * * * *', function(){
        console.log('~~~~~~~~~~~~~~~ running cron.schedule every hour ~~~~~~~~~~~~~~~~', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
        // db.selectAllProduct(function(err, result) {
        // });
        sc.scheduling(function(result) {
          console.log(result);
        });
    });

    cron.schedule('*/20 * * * * *', function(){
        setCookies.setUserCookies();
    });

}

module.exports.batch = batch;
