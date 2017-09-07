var request = require('request');


function sendNotification(pName, token){
    var headers = {
        'Authorization': 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
    }
    console.log('알림성공1');
    var body = {
      "notification": {
        "title": "zzim알림",
        "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
        "icon": "firebase-logo.png",
        "click_action": "http://localhost:8880"
      },
      "registration_ids": token
    }

    console.log('알림성공2');
    var options = {
        url: 'http://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: true,
        body: body
    }
    console.log('알림성공3');
    request(options, function (err, res, body) {
      if (err) {
        console.error('FCM메세지 보내기 오류::::: ', err);
        throw err;
      } else {
        console.log('알림성공4');
      }
      //console.log('headers: ', res.headers)
      //console.log('statusCode: ', res.statusCode)
      //console.log('body: ', body)
    });

}


//sendNotification('테스트', ["evFrmw__jlA:APA91bFpb9Ft3fsoeepy1LcljgaZpk3ESF-W5fowVOKOb-IpWOrvt_bgR76b_lXCLE6SGdKbvwXP2Dbnts93SsM8rHAxN_WHDEAGJDbOX6Ty8rvVFm1h5r4GTZVOG9XW80MwDBldiolR"]);
module.exports.sendNotification = sendNotification;