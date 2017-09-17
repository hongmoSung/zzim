var request = require('request');


function sendNotificationWeb(pName, pNo, token){
    var body = {
      "notification": {
        "title": "zzim알림",
        "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
        "icon": "firebase-logo.png",
        /*"click_action": "http://localhost:8880/trackingBoard/trackingList#" + pNo*/
        "click_action": "https://zzim.zz.am/trackingBoard/trackingList#" + pNo
      },
      "registration_ids": token
    }

    sendRequest(body);
}

function sendNotificationAndroid(pName, pNo, token){
    var body = {
      "notification": {
        "title": "zzim알림",
        "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
        "icon": "firebase-logo.png",
        /*"click_action": "http://localhost:8880"*/
        "click_action": "https://zzim.zz.am"
      },
      "data":{
        "pNo":pNo,
        "msg":pName + "의 가격이 희망가격 아래로 떨어졌습니다."
      },
      "registration_ids": token
    }

    sendRequest(body);
}





function sendRequest(body) {
    var headers = {
        'Authorization': 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
    }

    var options = {
        url: 'http://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: true,
        body: body
    }
    request(options, function (err, res, body) {
      if (err) {
        console.error('FCM메세지 보내기 오류::::: ', err);
        throw err;
      } else {

      }
      //console.log('headers: ', res.headers)
      //console.log('statusCode: ', res.statusCode)
      //console.log('body: ', body)
    });
}

//sendNotification('테스트', ["evFrmw__jlA:APA91bFpb9Ft3fsoeepy1LcljgaZpk3ESF-W5fowVOKOb-IpWOrvt_bgR76b_lXCLE6SGdKbvwXP2Dbnts93SsM8rHAxN_WHDEAGJDbOX6Ty8rvVFm1h5r4GTZVOG9XW80MwDBldiolR"]);
module.exports.sendNotificationWeb = sendNotificationWeb;
module.exports.sendNotificationAndroid = sendNotificationAndroid;
