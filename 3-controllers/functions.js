// MM/DD/YYYY ==> YYYY-MM-DD
function convertDate(dateStr){ 
  var dateArr = dateStr.split("/");
  // Kendo UI Calendar 的日期是類似 2/9/2020，月和日不會補0
  //if (dateArr[0].length ==1) dateArr[0]= "0"+dateArr[0];
  //if (dateArr[1].length ==1) dateArr[1]= "0"+dateArr[1];
  return dateArr[2]+"-"+dateArr[0]+"-"+dateArr[1];
}

// 設定 $a enabled 或 disabled
function setEnabled($a, Enabled ){
  $a.each(function(i, a){          
    var en = a.onclick !== null;        
    if(en == Enabled)return;
    if(Enabled){
      a.onclick = $(a).data('orgClick');            
    }
    else
    {
      $(a).data('orgClick',a.onclick);
      a.onclick = null;
    }
  });
}

function 取得經緯度() {
  navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position.coords.latitude, position.coords.longitude);
    目前位置緯度 = Math.floor(position.coords.latitude * 10000) / 10000;
    目前位置經度 = Math.floor(position.coords.longitude * 10000) / 10000;
    $("#deleteMe").text("所在位置 緯度: " + String(目前位置緯度) + ", 經度: " + String(目前位置經度));
  });
}

// 計算 兩點 間的距離
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // meter
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}

function readCourses(){
  console.log("call API to Read Database");
  userName = decodeURI(displayName[1]);

  var checkDataReady = setInterval(function(){ 
    //console.log("aaa", allDataReady);
    if (allDataReady==4) {
      clearInterval(checkDataReady);
      //console.log("Data is ready", courseData);
      //alert("Data is ready");
      $.loading.end();
      notInCourse=[];
      inCourse=[];
      myHistory=[];     
      var attended=false;
      var isNow=false;
      var inHistory=false; 
      courseMember.forEach(function(course, index, array){  
        attended = false;        
        for (var i=1; i<course.length;i++) {
          if (course[i][3] == userId[1]) {              
            //console.log(course[0],userName, "已參加")
            attended = true;
          }
        };

        isNow = false;
        courseData.forEach(function(newCourse, index, array){
          if (newCourse[0]==course[0]) isNow = true; 
        });

        inHistory = false;
        courseHistory.forEach(function(oldCourse, index, array){
          if (oldCourse[0]==course[0]) inHistory = true; 
        });

        if (!attended && isNow)     notInCourse.push(course[0]);
        if (attended  && isNow)     inCourse.push(course[0]);        
        if (attended  && inHistory) myHistory.push(course[0]);
      });
      //addCourseCards();
    }
  }, 100);

  $.loading.start('讀取資料');
  allDataReady = 0;
  getDataByAPIs(checkDataReady);    

};

function getDataByAPIs(checkDataReady) {
  var request1, reuquest2, request3, request4;
  // call API:10 =========================================================================
  paramToSend = "?API=10";      
  request1 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request1.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request1.open('GET', apiSite +paramToSend, true);
  }

  request1.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:10 courseData 讀取失敗"; //故意測試錯誤
    if (responseMsg != "API:10 courseData 讀取失敗") {
      courseData = JSON.parse(this.response);
      //console.log(courseData);
      allDataReady++;
      request2.send();
    } else {
      clearInterval(checkDataReady); 
      //$.loading.end();
      alert("課程資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // Send request
  request1.send();
  // =====================================================================================      

  // call API:11 =========================================================================
  paramToSend = "?API=11";      
  request2= new XMLHttpRequest()
  if (useLocalAPIs) {
    request2.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request2.open('GET', apiSite +paramToSend, true);
  }

  request2.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:11 courseHistory 讀取失敗"; //故意測試錯誤        
    if (responseMsg != "API:11 courseHistory 讀取失敗") {
      courseHistory = JSON.parse(this.response);
      //console.log(courseHistory);
      allDataReady++;
      request3.send();          
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("課程歷史讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // =====================================================================================      
  
  // call API:12 =========================================================================
  paramToSend = "?API=12";      
  request3 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request3.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request3.open('GET', apiSite +paramToSend, true);
  }

  request3.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:12 courseMember 讀取失敗"; //故意測試錯誤         
    if (responseMsg != "API:12 courseMember 讀取失敗") {
      courseMember = JSON.parse(this.response);
      //console.log(courseMember);
      allDataReady++;
      request4.send();
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("課程報名資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // ===================================================================================== 
 
  // call API:13 =========================================================================
  paramToSend = "?API=13&"+"UserId="+userId[1];      
  request4 = new XMLHttpRequest()
  if (useLocalAPIs) {
    request4.open('GET', 'http://localhost:5000' + paramToSend, true);
  } else {
    request4.open('GET', apiSite +paramToSend, true);
  }

  request4.onload = function() {
    var responseMsg = this.response;

    //responseMsg="API:13 courseMember 讀取失敗"; //故意測試錯誤         
    if (responseMsg.substr(0,6) != "API:13") {
      userPhoneNumber = responseMsg;
      allDataReady++;         
    } else {
      clearInterval(checkDataReady);
      //$.loading.end();
      alert("客戶資料讀取失敗，請稍後再試，或洽櫃台人員");
    }

  }
  // =====================================================================================      
}

function 更新資料() {
  console.log("更新資料");
 
  註冊會員();
  console.log(已經是會員);

//  if (!已經是會員) {
//    loadCourses = true;
//    getCourseData(navDataSource);
//    取得量測記錄(measurementSource);      
//  }
  
  app.navigate('#:back');
}

// 非同步+await
function callAPI(param, loadingMessage) {
  return new Promise(function(resolve, reject) {       
    var request = new XMLHttpRequest();
    request.open('GET', apiSite +param, true);

    request.onload = function() {
      if (loadingMessage!="") $.loading.end();
      //console.log(this.response);

      resolve(this.response);
    }
    // Send API request 
    if (loadingMessage!="") $.loading.start(loadingMessage);

    request.send();    
  });
}

async function checkUserIdExist() {
  //Call API:00 檢查 userId 有沒有重複參加 */

  $.loading.start('檢查是否已填寫必要資料');
  paramToSend = "?API=14" + "&UserId=" + userId[1];
  var res = await callAPI(paramToSend, '檢查是否已填寫必要資料');
  //$.loading.end();
  
  if (res.substring(0,6) == "API:14") {
    alert("為了讓您更容易使用團體課程，挑戰賽及使用優惠券，請填寫必要資料");
    $("#formUserName").val(decodeURI(displayName[1]));
    $("#formUserName").attr("disabled", "disabled"); 
    $("#LINE頭像").attr("src", pictureUrl[1]);
    已經是會員 = false;
    
    // 2021-10-15 add
    // 讀取店面名稱和機器序號
    paramToSend = "?API=30" + "&CustomerId=啟德";
    var res = await callAPI(paramToSend, '讀取店面名稱');
    店面名稱 = JSON.parse(res);
    console.log(店面名稱);    
    // Append 店面名稱到個人資料中 預設常用健身房 選項
    for (var i=0; i< 店面名稱.length; i++){
      $("#預設常用健身房").append("<option value='"+店面名稱[i]+"'>"+店面名稱[i]+"</option>");
    } 
    
    $("#預設常用健身房").val(預設常用健身房); 

    paramToSend = "?API=31" + "&CustomerId=啟德&StoreId="+$("#預設常用健身房").val();      
    var res = await callAPI(paramToSend, '讀取店面名稱');
    var machineStatus = res.split(",");
    機器序號 = machineStatus[0];
    console.log(機器序號); 
    // 2021-10-15 add above
    
    app.navigate('#forms');
  } else {
    console.log("已經是會員");
    已經是會員 = true;
    
    userProfile = JSON.parse(res);
    //console.log(userProfile);

    $("#formUserName").val(userProfile[0]);
    $("#formUserGender").val(userProfile[1]);     
    $("#formUserBirth").val(userProfile[2]);
    $("#formUserPhone").val(userProfile[3]);
    $("#formUserID").val(userProfile[4]);
    $("#formUserAddr").val(userProfile[5]);
    $("#formUserHeight").val(userProfile[8]);
    $("#formUserWeight").val(userProfile[9]);    
    
    // formEmergencyContact 挪來用為 formUserEthnicity
    $("#formUserEthnicity").val(userProfile[10]);
    
    // formEmergencyPhone 挪來用為 常用預設健身房
    預設常用健身房 = (userProfile[11]=="undefined")? "開發 T99999999":userProfile[11];
    //$("#預設常用健身房").val(預設常用健身房);  
    
    $("#LINE頭像").attr("src", userProfile[7]);
    
    // 讀取店面名稱和機器序號
    paramToSend = "?API=30" + "&CustomerId=啟德";
    var res = await callAPI(paramToSend, '讀取店面名稱');
    店面名稱 = JSON.parse(res);
    console.log(店面名稱);

    // Append 店面名稱到個人資料中 預設常用健身房 選項
    for (var i=0; i< 店面名稱.length; i++){
      $("#預設常用健身房").append("<option value='"+店面名稱[i]+"'>"+店面名稱[i]+"</option>");
    } 
    
    $("#預設常用健身房").val(預設常用健身房); 

    paramToSend = "?API=31" + "&CustomerId=啟德&StoreId="+$("#預設常用健身房").val();      
    var res = await callAPI(paramToSend, '讀取店面名稱');
    var machineStatus = res.split(",");
    機器序號 = machineStatus[0];
    console.log(機器序號);    
    
    paramToSend = "?API=32" + "&UserId=" + $("#formUserPhone").val(); //userId[1];
    var res = await callAPI(paramToSend, '讀取量測記錄');
    //console.log(res);
    var 所有量測數據=JSON.parse(res);
    //console.log(所有量測數據);    
    
    var dataTemp=[];
    for (var i=0; i<所有量測數據.length; i++ ) {
      var 時間Date = new Date(所有量測數據[i].量測時間);
      var 時間Str  = 時間Date.toLocaleString();   
      console.log("時間Str", 時間Str);      
      var 卡片 = {
        "量測記錄時間": 時間Str, //所有量測數據[i].量測時間,              
        "綜合評價":    所有量測數據[i].HealthScore,
        "量測紀錄圖片": 所有量測數據[i].PicUrl,              
        "url": "2-views/量測報告.html?PicUrl="+所有量測數據[i].PicUrl,
        "section": "A"             
      };
      dataTemp.push(卡片); 
    }
    
    measurementSource.success(dataTemp);

    if (dataTemp.length==0) {
      $("#量測記錄title").text("尚無量測記錄");
    }else {
      $("#量測記錄title").text("量測記錄");
    }     
       
    refresh=true;
    measurementSource.read(); // 產生 sorting 
    $.loading.end();
    
//    loadCourses = true;
//    getCourseData(navDataSource);
//    取得量測記錄(measurementSource);    
  }
}

async function 註冊會員() {
  console.log("註冊會員");
  // 檢查資料格式     
  if (   $("#formUserName").val()        == ""
      || $("#formUserGender").val()       == ""
      || $("#formUserBirth").val()        == ""
      || $("#formUserPhone").val()        == ""
      || $("#formUserID").val()           == ""
      || $("#formUserHeight").val()       == ""
      || $("#formUserWeight").val()       == ""       
      || $("#formEmergencyContact").val() == ""
      || $("#formEmergencyPhone").val()   == ""          
     ) {
    alert("請填寫必填項目!");
    //return false;
  }

  var APIToCall = (已經是會員)?  "?API=02":"?API=01"
  paramToSend = APIToCall +
    "&Name="             + $("#formUserName").val() +
    "&Gender="           + $("#formUserGender").val() +     
    "&Birth="            + $("#formUserBirth").val() +
    "&Phone="            + $("#formUserPhone").val() +
    "&ID="               + $("#formUserID").val() +
    "&Address="          + $("#formUserAddr").val() +
    "&UserId="           + userId[1] +        
    "&PicURL="           + pictureUrl[1] +       
    "&Height="           + $("#formUserHeight").val()+
    "&Weight="           + $("#formUserWeight").val()+        
    "&EmergencyContact=" + $("#formUserEthnicity").val()+  // 挪來用為 Ethnicity
    "&EmergencyPhone="   + $("#預設常用健身房").val();       // 挪來用為 常用預設健身房     
  
  console.log(paramToSend); 

  var profile = "請確認會員資料:\n" +
    "    預設常用健身房: " + $("#預設常用健身房").val() + "\n" +      
    "    會員姓名: " + $("#formUserName").val() + "\n" +
    "    會員姓別: " + $("#formUserGender").val() + "\n" +
    "    會員生日: " + $("#formUserBirth").val() + "\n" +  
    "    區域: "    + $("#formUserEthnicity").val() + "\n" +        
    "    會員身高: " + $("#formUserHeight").val() + " cm" +"\n" +          
//    "    會員體重: " + $("#formUserWeight").val() + " kg" +"\n" +            
    "    會員電話: " + $("#formUserPhone").val() + "\n";
//    "    身分證號: " + $("#formUserID").val() + "\n" +
//    "    會員地址: " + $("#formUserAddr").val() + "\n" +
//    "    緊急聯絡人:" + $("#formEmergencyContact").val() + "\n" +       
//    "    緊急聯絡電話:" + $("#formEmergencyPhone").val();        

  if (confirm(profile)) {
// POST to write FTP
//    userName = decodeURI(displayName[1]);
//    var requestFTP = new XMLHttpRequest();   // new HttpRequest instance 
//    var theUrl1 = "https://ugym3dbiking.azurewebsites.net/api/Questionnaire?Code=debug123"
//    var theUrl2 = ""; // 預留給 GET 測試
//    requestFTP.open("POST", theUrl1);
//    requestFTP.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//
//    // need to handle the response better
//    requestFTP.onload = function() { console.log("aaa", this.response);}  
//
//    var ftpToWrite = {
//      "userId":    userId[1],
//      "nickName":  userName,
//      "gender":    ($("#formUserGender").val()=="女")? 0:1,
//      "birthYear": $("#formUserBirth").val().substring(0,4), //必須是數字。不然寫入會有錯誤
//      "weight":    $("#formUserWeight").val(),
//      "height":    $("#formUserHeight").val(),
//      "score1":    1,
//      "score2":    1,
//      "score3":    1          
//    }
//    console.log(JSON.stringify(ftpToWrite));
//    requestFTP.send(JSON.stringify(ftpToWrite));
// end write FTP

    // 寫入會員到 Direbase     
    var res = await callAPI(paramToSend, '寫入資料');

    if (res == "API:01 會員寫入成功" || res == "API:01 會員已存在" || "API:02 資料更新成功") {
      alert("資料更新成功，回到量測頁面");
      $("#預設常用健身房標籤").text("啟德 "+預設常用健身房); 
      $("#所在健身房說明").text("如果目前不在 "+預設常用健身房+ " ，請到個人資料(首頁右上角圖示)修改預設常用健身房，再回來測量。");
      checkUserIdExist();
      已經是會員 = true;
//      loadCourses = false;
      // 顯示團課表格
//      console.log("回到團課");
//      location.reload();
//      loadCourses = true;
//      getCourseData(navDataSource);

    } else {
      alert("資料新增失敗，請重試。若一直有問題，請洽管理員")
      $("#errorMessage").css("display", "block");
    }

  } else {
    console.log("Cancel");
  };
  
};

function checkInputParam() {
  console.log(inputParam);
  try {
    displayName = inputParam[0].split("=");
    userId = inputParam[1].split("=");
    pictureUrl = inputParam[2].split("=");
  } catch (e) {
    inputError = true;
  }

  console.log(displayName[1]);

  if (inputError) {
    alert("輸入參數錯誤");
    loadCourses = false;

    // 等 #mainDiv 顯示後，再 hide()
    setTimeout(function(){$("#mainDiv").hide();}, 500);

    $("#errorMessage").css("display", "block"); 
    return false;
  }
    return true;
}

function 切換量測頁面()
{
  console.log("切換量測頁面", this.selectedIndex);
  if(this.selectedIndex==0){
    $("#進行量測Div").show();
    $("#量測記錄Div").hide();
  } else {
    $("#進行量測Div").hide();
    $("#量測記錄Div").show();    
  }
}

function 送出量測要求() {
  console.log("送出量測要求");
  
  if (!已經是會員) {
    alert("為了更完整記錄您的量測資料，請先提寫資料，加入會員。謝謝!");
    app.navigate('#forms');
    return 1;
  }

  console.log("進行量測:"+"啟德"+預設常用健身房);
  app.navigate('2-views/進行量測.html');
}

function 顯示個人資料同意書() {
  console.log("顯示個人資料同意書");
  $("#formData").hide();
  $("#個人資料使用Div").hide();
  $("#個人資料同意書Div").show();
}

function 我知道了(){
  $("#formData").show();
  $("#個人資料使用Div").show();  
  $("#個人資料同意書Div").hide();      
}

function testaaa(){
  console.log("aaa");
}