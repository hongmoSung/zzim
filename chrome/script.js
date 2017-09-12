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
        console.log("chrome storage email == ", data.email);
        if(typeof email == 'undefined') {
          alert('로그인이 필요합니다.');
          $('#loginDiv').css('display', 'block');
        } else {
          $.ajax({
            type: 'post',
            headers: {"Content-Type": "application/json; charset=UTF-8",
            "X-HTTP-Method-Override": "POST" },
            url: 'https://zzim-node.zz.am:3003/track',
            data: JSON.stringify({
              url : tab.url
            }),
            datatype: 'text'
          })
          .done(function(result) {
            if(result.err) {
              //alert('조회 실패!');
              $('#reSearchDiv').css('display', 'block');
            } else {
              //alert('조회성공!');
              var p = result;
              console.log("info ::: ", p);

              // 성공시에 url 폼 숨기기
              $("#urlDiv").css("display", "none");
              html = "";
              html += '<div class="image-tile outer-title text-center">';
              html += "   <img class='product-thumb' src='" + p.picUrl +"' height='140px;'/>";
              html += '   <div class="title">';
              html += '     <h5 class="title">' + p.pName + '</h5>';
              html += '     <h6 class="title"> 현재 가격: ' + p.pLowest + ' 원</h6>';
              html += '   </div>';
              html += '   <form class="text-left" onsubmit="return false;">';
              //html += '   <div class = "rangeslider rangeslider--horizontal">';
              html += '     <input id="range" type="range" data-rangeslider >';
              // html += '   </div>';
              html += '     <h5 class="title text-center" id="priceInfo" class="mb0"></h5>';
              html += '     <input class="mb0" type="text" id="notifyPrice" name="notifyPrice" placeholder="알림가격">';
              html += '     <input class="mb0" type="hidden" id="crawlingUrl" name="crawlingUrl" value="' + p.crawlingUrl + '">';
              html += '     <button type="button" class="btn btn-lg btn-filled" id="trackBtn">Start tracking!!</button>';
              // html += '     <input type="submit" class="hollow" id="trackBtn" value="Start tracking!!" />';
              html += '   </form>';
              //html += '     <button type="button" class="btn btn-lg btn-filled" id="goToLogin">아이디 재설정</button>';
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
    });

  })();

function setting(pLowest) {
  var $document = $(document);
  var selector = '[data-rangeslider]';
  var $element = $(selector);
  // For ie8 support
  var textContent = ('textContent' in document) ? 'textContent' : 'innerText';
  // Example functionality to demonstrate a value feedback

  function valueOutput(element) {
      var value = element.value;
      var percent = value / (element.step);
      //var output = element.parentNode.getElementsByTagName('output')[0] || element.parentNode.parentNode.getElementsByTagName('output')[0];
      //var output = element.parentNode.getElementById('priceInfo')[0] || element.parentNode.parentNode.getElementById('priceInfo')[0];
      $('#priceInfo').text(percent + '%' + '   -' + (pLowest - value));
      //output[textContent] = percent + '%' + '   -' + (pLowest - value);
      if(percent <= 50) {
          $('#priceInfo').css('color', 'red');
      } else {
        $('#priceInfo').css('color', 'black');
      }
      $('input[name="notifyPrice"]').val(value);
  }
  $document.on('input', 'input[type="range"], ' + selector, function(e) {
      valueOutput(e.target);
  });

  $("#productInfo").on("keyup", "input[name='notifyPrice']", function() {
      var notifyPrice = $('input[name="notifyPrice"]').val();
      var percent = parseInt(notifyPrice / pLowest * 100);
      if(isNaN(notifyPrice)){
          alert("알림가격은 숫자만 입력 가능합니다.");
          $('input[name="notifyPrice"]').val('');
          return;
      };

      if(parseInt(notifyPrice) >= parseInt(pLowest)) {
        notifyPrice = pLowest;
        console.log('here');
        $('.rangeslider__handle').attr('style', 'left:' + 230 +'px;');
        $('.rangeslider__fill').attr('style', 'width:' + 240 + 'px;');
        $('#priceInfo').text(100 + '%' + '   -' + 0);
        $('input[name="notifyPrice"]').val(pLowest);
      } else {
        console.log('here2');
        var a = notifyPrice/ pLowest * 230;
        var b = notifyPrice/ pLowest * 240;
        console.dir($('.rangeslider__handle'));
        $('#priceInfo').text(percent + '%' + '   -' + (pLowest - notifyPrice));
        $('.rangeslider__handle').attr('style', 'left:' + a +'px;');
        $('.rangeslider__fill').attr('style', 'width:' + b + 'px;');
      }
      if(percent <= 50) {
          $('#priceInfo').css('color', 'red');
      } else {
        $('#priceInfo').css('color', 'black');
      }
  });
  // Basic rangeslider initialization
  $element.rangeslider({
      // Deactivate the feature detection
      polyfill: false,
      // Callback function
      onInit: function() {
          valueOutput(this.$element[0]);
      },
      // Callback function
      onSlide: function(position, value) {
          // console.log('onSlide');
          // console.log('position: ' + position, 'value: ' + value);
      },
      // Callback function
      onSlideEnd: function(position, value) {
           console.log('onSlideEnd');
           console.log('position: ' + position, 'value: ' + value);
      }
  });
}
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
      url: "https://zzim-node.zz.am:3003/reSearch",
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
    alert("알림가격을 입력해주세요");
    return;
  }

  if(isNaN(notifyPrice)){
      alert("알림가격은 숫자만 입력 가능합니다.");
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

  if(email == "") {
    alert("email 을 입력 해주세요");
    return;
  }
  if(password == "") {
    alert("password 를 입력 해주세요");
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
    alert(result.msg);
    console.log(result);
  });
  return false;
});
$("#loginDiv").css("display", "none");

// 아이디 재설정
$('#productInfo').on("click", "#goToLogin", function() {
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
