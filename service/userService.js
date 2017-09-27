var db = require('../DB.js');

function login(data, func) {
    var inputEmail = data.inputEmail;
    var inputPW = data.inputPW;
    db.selectUser(inputEmail, function (err, rows) {
        var msg = '등록되지 않은 email 입니다.';
        var flag = false;
        if (rows) {
            var pwCk = (inputPW == rows.password.toString());
            if (pwCk) {
                msg = rows.email + '님 로그인 되었습니다.';
                flag = true;
            } else {
                msg = 'password를 확인해 주세요';
            }
        }
        var result = {
            'msg': msg,
            'flag': flag
        }
        func(result);
    });
}


module.exports.login = login;
