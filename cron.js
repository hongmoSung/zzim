var cron = require('node-cron');
var db = require('./ourDb.js');
require('date-utils');
var cart = require('./service/cartService');
var track = require('./service/trackService.js');

console.log('batch start time', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
var batch = function () {
    track.trackScheduling();
    cron.schedule('0 */2 * * *', function () {
        console.log('~~~~~~~~~~~~~~~track.trackScheduling()~~~~~~~~~~~~~~~~', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
        track.trackScheduling();
    });

    cron.schedule('30 */2 * * *', function () {
        console.log('~~~~~~~~~~~~~~~cart.setCookiesForScheduling()~~~~~~~~~~~~~~~~', new Date().toFormat('YYYY-MM-DD HH24:MI:SS'));
        cart.setCookiesForScheduling();
    });

}

module.exports.batch = batch;
