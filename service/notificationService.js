var nodemailer = require('nodemailer');
var numeral = require('numeral');
var sender = 'zzim_admin < asj473@hanmail.net >';
var mailTitle = 'ZZIM 알림 메일입니다.';
var request = require('request');

function sendEmail(data, email, notifyPrice) {
    console.log("이메일,알림가격:",email,notifyPrice);
    var pName = data.pName;
    var pLowest = numeral(data.pLowest).format('0,0');
    var pNo = data.pNo;
    var pUrl = data.pUrl;
    var pic = data.picUrl;
    var noPrice = numeral(notifyPrice).format('0,0');
    var html = "<div class='col-sm-5' style='width:50%; border:1px solid black;'>"
        + "  <div style='text-align:center; font-family:Bookman Old Style; border-bottom:1px solid black;'>"
        + "     <a href='http://localhost:8010' style='text-decoration:none; color:black;'>"
        + "       <h1 style='font-weight:bold;'>ZZIM</h1>"
        + "     </a>"
        + "  </div>"
        + "  <div class='modal-header' style='text-align:center;'>"
        + "     </a>"
        + "  </div>"
        + "  <div class='modal-body' style='text-align:center; border-bottom:1px solid black;'>"
        + "     <table style='margin-left:50px;'>"
        + "       <tr>"
        + "         <td rowspan='3'><img src='" + pic + "' /></td>"
        + "         <td colspan='3' style='text-align:center; height:50px;'><a href='" + pUrl + "' style='text-decoration:none; color:black;'><h2 style='font-weight:200; margin-left: 40px;'>" + pName + "</h2></td>"
        + "       </tr>"
        + "       <tr>"
        + "         <td colspan='3' style='text-align:center; float:right;'><h3 style='color:#FC0105;'> 현재 가격 : " + pLowest + "원 </h3></td>"
        + "       </tr>"
        + "       <tr>"
        + "         <td colspan='3' style='text-align:center; float:right;'><h3 style='color:#0800FC;'> 희망 가격 : " + noPrice + "원 </h3></td>"
        + "       </tr>"
        + "     </table>"
        + "  </div>"
        + "  <div class='modal-footer' style='text-align:center;'>"
        + "    <span>" + email + "님이 zzim한 제품의 가격이 희망가로 떨어졌습니다.<br>"
        + "    <a href='http://localhost:8010/trackingBoard/trackingList#" + pNo + "'>여기</a>를 눌러 확인해 주세요<span><br>"
        + "     본 메일은 회신되지 않으므로 문의사항은 <a href='http://localhost:8010/board/list'>고객센터</a>를 이용해 주세요."
        + "  </div>"
        + "</div>";

    var mailOptions = {
        from: sender,
        to: email,
        subject: mailTitle,
        html: html
    };

    var transporter = nodemailer.createTransport({
        service: 'daum',
        host: 'smtp.daum.net',
        port: 465,
        secure: true,
        auth: {
            user: "asj473@hanmail.net",
            pass: "bitbit11"
        }
    });
    transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log('failed... => ' + err);
        } else {
            console.log('succeed... => ' + res);
        }
        transporter.close();
    });
}


function sendNotificationWeb(pName, pNo, token) {
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

function sendNotificationAndroid(pName, pNo, token) {
    var body = {
        "notification": {
            "title": "zzim알림",
            "body": pName + "의 가격이 희망가격 아래로 떨어졌습니다.",
            "icon": "firebase-logo.png",
            /*"click_action": "http://localhost:8880"*/
            "click_action": "https://zzim.zz.am"
        },
        "data": {
            "pNo": pNo,
            "msg": pName + "의 가격이 희망가격 아래로 떨어졌습니다."
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
module.exports.sendEmail = sendEmail;
