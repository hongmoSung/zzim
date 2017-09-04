// 크롬확장의 기능 중에 tabs과 관련된 기능 중
// 컨텐트 페이지를 대상으로 코드를 실행해 주세요
/*
chrome.tabs.executeScript({
code:`window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;`
}, function(result) {
  console.log('result !!!', result[0]);
  var newUrl = result[0];
});
*/
var email;
// 확장 실행시 바로 실행되는 함수
chrome.tabs.getSelected(null, function(tab){
  console.log('tab:::::::::::::::', tab.url);
  (function() {
    //console.log("즉시실행함수");
    chrome.storage.sync.get(function(data) {
        email = data.email;
        console.log("chrome storage email = ", data.email);
        if(typeof email == 'undefined') {
          alert('로그인이 필요합니다.');
          $('#loginDiv').css('display', 'block');
        } else {
          $.ajax({
            type: 'post',
            headers: {"Content-Type": "application/json; charset=UTF-8",
            "X-HTTP-Method-Override": "POST" },
            url: 'http://localhost:3003/track',
            data: JSON.stringify({
              url : tab.url
            }),
            datatype: 'text'
          })
          .done(function(result) {
            if(result.err) {
              alert('조회 실패!');
              $('#reSearchDiv').css('display', 'block');
            } else {
              alert('조회성공!');

              var p = result;
              console.log("info ::: ", p);

              // 성공시에 url 폼 숨기기
              $("#urlDiv").css("display", "none");
              html = "";
              html += '<div class="image-tile outer-title text-center">';
              html += "   <img src='" + p.picUrl +"' height='140px;'/>";
              html += '   <div class="title">';
              html += '     <h5 class="title">' + p.pName + '</h5>';
              html += '     <h6 class="title"> 현재 가격: ' + p.pLowest + ' 원</h6>';
              html += '   </div>';
              html += '   <form class="text-left">';
              html += '     <input class="mb0" type="text" id="notifyPrice" name="notifyPrice" placeholder="알림가격">';
              html += '     <input class="mb0" type="hidden" id="crawlingUrl" name="crawlingUrl" value="' + p.crawlingUrl + '">';
              //html += '     <input class="hollow" type="submit" onsubmit="return false;" value="Start tracking!!">';
              //html += '     <button id="trackBtn" class="btn btn-lg btn-filled" type="button">Start tracking!!</button>';
              html += '     <button type="button" class="btn btn-lg btn-filled" id="trackBtn">Start tracking!!</button>';
              html += '   </form>';
              html += '</div>';
              $("#productInfo").html(html);
              $("#productInfo").css("display", "block");
            }
          });
        }
    });

  })();

  $('button[name="reSearchBtn"]').click(function() {
    //console.log('재검색....');
    var reSearchTitle = $('input[name="reSrachTitle"]').val();
    console.log(reSearchTitle);
    if(reSearchTitle == '') {
      alert('제목을 입력해주세요');
      return;
    }

    $.ajax({
      type: 'post',
      headers: {"Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST" },
      url: "http://localhost:3003/reSearch",
      data: JSON.stringify({
        reSearchTitle : reSearchTitle,
        url : tab.url
      }),
      datatype: "text"
    })
    .done(function(result) {
      if(result.err) {
        alert('재조회 실패!');
        $('#reSearchDiv').css('display', 'block');
      } else {
        alert('조회성공!');
        var p = result;
        //console.log("info ::: ", p); 상품정보...
        // 성공시에 url 폼 숨기기
        $("#reSearchDiv").css("display", "none");
        html = "";
        html += '<div class="image-tile outer-title text-center">';
        html += "   <img src='" + p.picUrl +"' height='140px;'/>";
        html += '   <div class="title">';
        html += '     <h5 class="title">' + p.pName + '</h5>';
        html += '     <h6 class="title"> 현재 가격: ' + p.pLowest + ' 원</h6>';
        html += '   </div>';
        html += '   <form class="text-left">';
        html += '     <input class="mb0" type="text" id="notifyPrice" name="notifyPrice" placeholder="알림가격">';
        html += '     <input class="mb0" type="hidden" id="crawlingUrl" name="crawlingUrl" value="' + p.crawlingUrl + '">';
        //html += '     <input class="hollow" type="submit" onsubmit="return false;" value="Start tracking!!">';
        //html += '     <button id="trackBtn" class="btn btn-lg btn-filled" type="button">Start tracking!!</button>';
        html += '     <button type="button" class="btn btn-lg btn-filled" id="trackBtn">Start tracking!!</button>';
        html += '   </form>';
        html += '</div>';
        $("#productInfo").html(html);
        $("#productInfo").css("display", "block");
      }
    });
  });

});

// tracking
$('#productInfo').on("click", "#trackBtn", function() {
  var pName = $('h5[class="title"]').text();
  var notifyPrice = $("#notifyPrice").val();
  var crawlingUrl = $("#crawlingUrl").val();

  if(notifyPrice == "") {
    swal("알림가격을 입력해주세요");
    return;
  }

  if(isNaN(notifyPrice)){
      swal("알림가격은 숫자만 입력 가능합니다.");
      return;
  };

  var p = {
    'pName': pName,
    'notifyPrice': notifyPrice,
    'crawlingUrl': crawlingUrl,
    'email': email
  }

  $.ajax({
            type: 'post',
            headers: {"Content-Type": "application/json",
                  "X-HTTP-Method-Override": "POST" },
            url: "http://localhost:3003/addDB",
            data: JSON.stringify(p),
            datatype: "text"
          })
          .done(function(result) {
            alert(result.msg);
            if(result.result) {
              $("#notifyPrice").val('');
              $("#crawlingUrl").val('');
            }
          });
  return false;
});

// 로그인
$("button[name='loginBtn']").click(function() {
  var email = $("input[name='email']").val();
  var password = $("input[name='password']").val();

  if(email == "" || password == "") {
    swal("email 또는 password 를 확인해주세요");
    return;
  }

  $.ajax({
    type: 'post',
    headers: {"Content-Type": "application/json",
          "X-HTTP-Method-Override": "POST" },
    url: "http://localhost:3003/login",
    data: JSON.stringify({
                            email: email,
                            password: password
                          }),
    datatype: "text"
  })
  .done(function(result) {

    if(result.result == true) {
      //alert(result.msg);
      chrome.storage.sync.set({email: email});
      $("#urlDiv").css("display", "block");
      $("#loginDiv").css("display", "none");
    }
    swal(result.msg);
    console.log(result);
  });
  return false;
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
