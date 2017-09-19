var email;
chrome.tabs.getSelected(null, function (tab) {
    console.log('tab:::::::::::::::', tab.url);
    (function () {
        chrome.storage.sync.get(function (data) {
            gEmail = data.email;
            console.log("chrome storage email == ", gEmail);
            if (typeof gEmail == 'undefined' || gEmail == "" || gEmail == null) {
                $.ajax({
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                        "X-HTTP-Method-Override": "POST"
                    },
                    // url: 'https://zzim-node.zz.am:3003/user/loginCheck'
                    url: 'http://localhost:9080/user/loginCheck'
                }).done(function (result) {
                    console.log("aaaa");
                    console.log(result);
                    if (result == "") {
                        alert('로그인이 필요합니다.');
                        console.log("크롬 x --> 세션 x --> 로그인 ");
                        $('#loginDiv').css('display', 'block');
                    } else {
                        chrome.storage.sync.set({email: result.email});
                        console.log("크롬 x --> 세션 o --> 트랙ㄱㄱ");
                        startTrack();
                    }
                })
            } else {
                console.log("크롬 o --> 트랙ㄱㄱ");
                startTrack();
            }
        });

    })();

    function startTrack() {
        $.ajax({
            type: 'post',
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "X-HTTP-Method-Override": "POST"
            },
            // url: "https://zzim-node.zz.am:3003/track",
            url: "http://localhost:3003/track",
            data: JSON.stringify({
                url: tab.url
            }),
            datatype: 'text'
        }).done(function (result) {
            if (result.err || result.picUrl == '') {
                $('#reSearchDiv').css('display', 'block');
            } else {
                var p = result;
                console.log("info ::: ", p);

                $("#reSearchDiv").css("display", "none");
                html = "";
                html += '<div class="image-tile outer-title text-center">';
                html += "   <img src='" + p.picUrl + "' height='140px;'/>";
                html += '   <div class="title">';
                html += '     <h5 class="title">' + p.pName + '</h5>';
                if (p.pLowest == '') {
                    html += '     <h3 class="title">판매가 종료된 상품입니다.</h6>';
                } else {
                    html += '     <h6 class="title"> 현재 가격: <span id="pLowest">' + p.pLowest + '</span> 원</h6>';
                    html += '     <input id="range" type="range" data-rangeslider >';
                }
                html += '   </div>';
                html += '   <form class="text-left">';
                html += '     <h5 class="title text-center" id="priceInfo" class="mb0"></h5>';
                if (p.pLowest != '') {
                    html += '     <input class="mb0" type="text" id="notifyPrice" name="notifyPrice" placeholder="알림가격">';
                }
                html += '     <input class="mb0" type="hidden" id="crawlingUrl" name="crawlingUrl" value="' + p.crawlingUrl + '">';
                html += '     <button type="button" class="btn btn-lg btn-filled" id="trackBtn">Start tracking!!</button>';
                html += '   </form>';
                html += '     <a id = "goToLogin" href="#">아이디 재설정</a>';
                html += '</div>';
                $("#productInfo").html(html);
                $("#productInfo").css("display", "block");
                var rangeVar = p.pLowest.trim().replace(/,/gi, '');
                $('input[type="range"]').attr('max', rangeVar);
                $('input[type="range"]').attr('min', 0);
                $('input[type="range"]').attr('value', rangeVar);
                $('input[type="range"]').attr('step', rangeVar / 100);
                setting(rangeVar);

            }
        });
    }

    function setting(pLowest) {
        var $document = $(document);
        var selector = '[data-rangeslider]';
        var $element = $(selector);
        var textContent = ('textContent' in document) ? 'textContent' : 'innerText';

        function valueOutput(element) {
            var value = parseInt(element.value);
            var percent = parseInt(value / (element.step));
            $('#priceInfo').text(percent + '%' + '   -' + parseInt(pLowest - value));
            if (percent <= 50) {
                $('#priceInfo').css('color', 'red');
            } else {
                $('#priceInfo').css('color', 'black');
            }
            $('input[name="notifyPrice"]').val(value);
        }

        $document.on('input', 'input[type="range"], ' + selector, function (e) {
            valueOutput(e.target);
        });

        $("#productInfo").on("keyup", "input[name='notifyPrice']", function () {
            var notifyPrice = $('input[name="notifyPrice"]').val();
            var percent = parseInt(notifyPrice / pLowest * 100);
            if (isNaN(notifyPrice)) {
                alert("알림가격은 숫자만 입력 가능합니다.");
                $('input[name="notifyPrice"]').val('');
                return;
            }

            if (parseInt(notifyPrice) >= parseInt(pLowest)) {
                notifyPrice = pLowest;
                console.log('here');
                $('.rangeslider__handle').attr('style', 'left:' + 230 + 'px;');
                $('.rangeslider__fill').attr('style', 'width:' + 240 + 'px;');
                $('#priceInfo').text(100 + '%' + '   -' + 0);
                $('input[name="notifyPrice"]').val(pLowest);
            } else {
                console.log('here2');
                var a = notifyPrice / pLowest * 230;
                var b = notifyPrice / pLowest * 240;
                console.dir($('.rangeslider__handle'));
                $('#priceInfo').text(percent + '%' + '   -' + (pLowest - notifyPrice));
                $('.rangeslider__handle').attr('style', 'left:' + a + 'px;');
                $('.rangeslider__fill').attr('style', 'width:' + b + 'px;');
            }
            if (percent <= 50) {
                $('#priceInfo').css('color', 'red');
            } else {
                $('#priceInfo').css('color', 'black');
            }
        });
        $element.rangeslider({
            polyfill: false,
            onInit: function () {
                valueOutput(this.$element[0]);
            },
            onSlide: function (position, value) {
            },
            onSlideEnd: function (position, value) {
            }
        });
    }

    $('button[name="reSearchBtn"]').click(function () {
        var reSearchTitle = $('input[name="reSrachTitle"]').val();
        if (reSearchTitle == '') {
            alert('제목을 입력해주세요');
            return;
        }

        $.ajax({
            type: 'post',
            headers: {
                "Content-Type": "application/json",
                "X-HTTP-Method-Override": "POST"
            },
            // url: "https://zzim-node.zz.am:3003/reSearch",
            url: "http://localhost:3003/reSearch",
            data: JSON.stringify({
                reSearchTitle: reSearchTitle,
                url: tab.url
            }),
            datatype: "text"
        })
            .done(function (result) {
                if (result.err || result.picUrl == '') {
                    alert('재조회 실패!');
                    $('#reSearchDiv').css('display', 'block');
                } else {
                    alert('조회성공!');
                    var p = result;
                    $("#reSearchDiv").css("display", "none");
                    html = "";
                    html += '<div class="image-tile outer-title text-center">';
                    html += "   <img src='" + p.picUrl + "' height='140px;'/>";
                    html += '   <div class="title">';
                    html += '     <h5 class="title">' + p.pName + '</h5>';
                    if (p.pLowest == '') {
                        html += '     <h3 class="title">판매가 종료된 상품입니다.</h6>';
                    } else {
                        html += '     <h6 class="title"> 현재 가격: <span id="pLowest">' + p.pLowest + '</span> 원</h6>';
                        html += '     <input id="range" type="range" data-rangeslider >';
                    }
                    html += '   </div>';
                    html += '   <form class="text-left">';
                    html += '     <h5 class="title text-center" id="priceInfo" class="mb0"></h5>';
                    if (p.pLowest != '') {
                        html += '     <input class="mb0" type="text" id="notifyPrice" name="notifyPrice" placeholder="알림가격">';
                    }
                    html += '     <input class="mb0" type="hidden" id="crawlingUrl" name="crawlingUrl" value="' + p.crawlingUrl + '">';
                    html += '     <button type="button" class="btn btn-lg btn-filled" id="trackBtn">Start tracking!!</button>';
                    html += '   </form>';
                    html += '</div>';
                    $("#productInfo").html(html);
                    $("#productInfo").css("display", "block");
                    var rangeVar = p.pLowest.trim().replace(/,/gi, '');
                    $('input[type="range"]').attr('max', rangeVar);
                    $('input[type="range"]').attr('min', 0);
                    $('input[type="range"]').attr('value', rangeVar);
                    $('input[type="range"]').attr('step', rangeVar / 100);
                    setting(rangeVar);
                }
            });
    });

});

$('#productInfo').on("click", "#trackBtn", function () {
    var pName = $('h5[class="title"]').text();
    var notifyPrice = $("#notifyPrice").val();
    var crawlingUrl = $("#crawlingUrl").val();
    var pLowest = $('span#pLowest').text().trim().replace(/,/gi, '');

    if (notifyPrice == "") {
        alert("알림가격을 입력해주세요");
        return;
    }

    if (isNaN(notifyPrice)) {
        alert("알림가격은 숫자만 입력 가능합니다.");
        return;
    }
    ;

    var p = {
        'pName': pName,
        'notifyPrice': notifyPrice,
        'crawlingUrl': crawlingUrl,
        'email': gEmail,
        'pLowest': pLowest
    }

    $.ajax({
        type: 'post',
        headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST"
        },
        // url: "https://zzim-node.zz.am:3003/addDB",
        url: "http://localhost:3003/addDB",
        data: JSON.stringify(p),
        datatype: "text"
    })
        .done(function (result) {
            alert(result.msg);
            if (result.result) {
                $("#notifyPrice").val('');
                $("#crawlingUrl").val('');
            }
        });
    return false;
});

// 로그인
$("button[name='loginBtn']").click(function () {
    var email = $("input[name='email']").val();
    var password = $("input[name='password']").val();

    if (email == "") {
        alert("email 을 입력 해주세요");
        return;
    }
    if (password == "") {
        alert("password 를 입력 해주세요");
        return;
    }

    $.ajax({
        type: 'post',
        headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST"
        },
        // url: "https://zzim-node.zz.am:3003/login",
        url: "http://localhost:3003/login",
        data: JSON.stringify({
            email: email,
            password: password
        }),
        datatype: "text"
    })
        .done(function (result) {
            console.log(result);
            if (result.flag == true) {
                gEmail = email;
                chrome.storage.sync.set({email: email});
                $("#urlDiv").css("display", "block");
                $("#productInfo").css("display", "block");
                $("#loginDiv").css("display", "none");
            }
            alert(result.msg);
        });
    return false;
});
$("#loginDiv").css("display", "none");

// 아이디 재설정
$('#productInfo').on("click", "#goToLogin", function () {
    $("#urlDiv").css("display", "none");
    $("#productInfo").css("display", "none");
    $("#loginDiv").css("display", "block");
});

$(document).ajaxStart(function () {
    $("body").waitMe({
        effect: 'win8',
        text: '기다려',
        bg: 'rgba(255,255,255,0.7)',
        color: '#000',
        source: 'img.svg'
    });
})
    .ajaxStop(function () {
        $("body").waitMe("hide");
    });
