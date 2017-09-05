var cron = require('node-cron');
var db = require('./ourDb.js');
require('date-utils');

var setCookies = require('./setUserCookies');

console.log('server 실행시간', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
var batch = function(){

    cron.schedule('* * * * *', function(){
        console.log('~~~~~~~~~~~~~~~ running cron.schedule every second ~~~~~~~~~~~~~~~~', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
        db.selectAllProduct(function(err, result) {
            if(err) {
                console.log('xxxxxxxxxxxxxxxxxxxxxxxxx실패xxxxxxxxxxxxxxxxxxxxxxxxx');
            } else {
                console.log('#########################성공#########################');
            }
        });
    });

    cron.schedule('0 */1 * * *', function(){
        setCookies.setUserCookies();
    });
}

module.exports.batch = batch;