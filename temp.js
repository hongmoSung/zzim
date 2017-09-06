var request = require('request');


function sendNotification(pName, emails){
    var headers = {
        'Authorization': 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
    }

    var body = {
      "notification": {
        "title": "zzim알림",
        "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
        "icon": "firebase-logo.png",
        "click_action": "http://localhost:8880"
      },
      "registration_ids": emails
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
      }

      console.log('headers: ', res.headers)
      console.log('statusCode: ', res.statusCode)
      console.log('body: ', body)
    })
    
}


sendNotification('테스트', ["evFrmw__jlA:APA91bFpb9Ft3fsoeepy1LcljgaZpk3ESF-W5fowVOKOb-IpWOrvt_bgR76b_lXCLE6SGdKbvwXP2Dbnts93SsM8rHAxN_WHDEAGJDbOX6Ty8rvVFm1h5r4GTZVOG9XW80MwDBldiolR"]);




//var postData = {
//  "notification": {
//    "title": "zzim알림",
//    "body": "'??'상품의 가격이 희망가격 아래로 떨어졌습니다.",
//    "icon": "firebase-logo.png",
//    "click_action": "http://localhost:8880"
//  },
//  "to": "evFrmw__jlA:APA91bFpb9Ft3fsoeepy1LcljgaZpk3ESF-W5fowVOKOb-IpWOrvt_bgR76b_lXCLE6SGdKbvwXP2Dbnts93SsM8rHAxN_WHDEAGJDbOX6Ty8rvVFm1h5r4GTZVOG9XW80MwDBldiolR"
//}
//
////var url = 'http://fcm.googleapis.com/fcm/send'
//var options = {
//  //Host: 'fcm.googleapis.com',
//  //Authorization: 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
//  //'Content-Type': 'application/json',
//  body: postData,
//  json: true,
//  url: 'http://fcm.googleapis.com/fcm/send',
//  headers:{
//            Host: 'fcm.googleapis.com',
//            Authorization: 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
//            //'Content-Type': 'application/json'
//        }
//}
//
//request(options, function (err, res, body) {
//  if (err) {N
//    console.error('error posting json: ', err)
//    throw err
//  }
//  var headers = res.headers
//  var statusCode = res.statusCode
//  console.log('headers: ', headers)
//  console.log('statusCode: ', statusCode)
//  console.log('body: ', body)
//})


//request({
//    method: 'POST',
//    uri: 'http://fcm.googleapis.com/fcm/send',
//    headers: {
//            'Host': 'fcm.googleapis.com',
//            'Authorization': 'key=AAAA3MZfvK4:APA91bFWnEWq94oT5PslAx2JzJisiLTfzKVjiD4gHPjHVClNmrPj8hH7YGxBKNZ3gkLROwRoXTyVcMUyA0VVfccC8QYZdeAJx8PVkVBVmKNIcNuFOqcrj9boSKzpfZFOOqm68RfDj-56',
//            'Content-Type': 'application/json'
//        }
//  },
//  function (error, response, body) {
//    if (error) {
//      return console.error('upload failed:', error);
//    }
//    console.log('Upload successful!  Server responded with:', body);
//  })




//request.post(
//    'http://www.yoursite.com/formpage',
//    { json: { key: 'value' } },
//    function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            console.log(body)
//        }
//    }
//);