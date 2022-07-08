const { SerialPort } = require('serialport')
const port = new SerialPort({
  path: 'COM5',
  baudRate: 115200,
  autoOpen: false,
})

var command;
var Status
var ScreenID;
var ControID;

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message)
  }

  // Because there's no callback to write, write errors will be emitted on the port:
  console.log("port opened");
  switch_to_screen(0);
})

// The open event is always emitted
port.on('open', function() {
  // open logic
  console.log("port on-open");  
})

// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Data:', data)
  parse_command(data);
})

function parse_command(data){
  if (   data[0]!=0xEE
      || data[1]!=0xB1
      || data[data.length-4]!=0xFF
      || data[data.length-3]!=0xFC
      || data[data.length-2]!=0xFF
      || data[data.length-1]!=0xFF
     ){
    console.log("invalid data"); 
    return;
  }
  Status=data[2];
  ScreenID=data[3]*256+data[4];
  
  switch (Status){
    case 0x01: // current scrren id
      console.log("Switched to Screen:", ScreenID);
      process_screen(ScreenID);
      break;
    case 0x11: // button status
      ControID=data[5]*256+data[6];
      console.log("Screen/Button control/status:", ScreenID, ControID, data[data.length-5]);
      break;
    case 0x43: // 計時結束
      ControID=data[5]*256+data[6];
      console.log("screenId/controlId timer 計時結束:", ScreenID, ControID);
      switch_to_screen(4);
      break;
    default:
      console.log("unknown status");
  }
}

function process_screen(id){
  if (id==3){
    console.log("set timer");
    cmd_set_timer();
    console.log("start timer");
    cmd_start_timer();
  }
}

function switch_to_screen(id){
  var data= new Uint8Array(9);
  
  data[0]=0xEE;  data[1]=0xB1;  // command header
  data[2]=0x00;                 // switch screen  command
  data[3]=0x00;  data[4]=id;    // target screen number
  data[5]=0xFF;  data[6]=0xFC;  data[7]=0xFF;  data[8]=0xFF; // command header
  
  port.write(data)  
}

function cmd_set_timer(){
  var data= new Uint8Array(15);
  
  data[0]=0xEE;  data[1]=0xB1;  // command header
  data[2]=0x40;                 // set timer
  data[3]=0x00;  data[4]=0x03;  // target screen 
  data[5]=0x00;  data[6]=0x01;  // target controller
  data[7]=0x00;  data[8]=0x00;  // timer time higher 16bits
  data[9]=0x00;  data[10]=0x1F; // timer time lowwe 16bits
  data[11]=0xFF;  data[12]=0xFC;  data[13]=0xFF;  data[14]=0xFF; // command header
  
  port.write(data)   
}

function cmd_start_timer(){
  var data= new Uint8Array(11);
  
  data[0]=0xEE;  data[1]=0xB1;  // command header
  data[2]=0x41;                 // set timer
  data[3]=0x00;  data[4]=0x03;  // target screen 
  data[5]=0x00;  data[6]=0x01;  // target controller
  data[7]=0xFF;  data[8]=0xFC;  data[9]=0xFF;  data[10]=0xFF; // command header
  
  port.write(data)   
}

//在 screen0 按下 button1，串口屏會送出以下
//Data: <Buffer ee b1 11 00 00 00 01 10 00 01 ff fc ff ff> 
//              ee b1 11    表示 button 狀態
//              00 00 00 01 表示 screen0+button1
//              10          表示後續為回應資料
//              00 01       表示 button 為按下狀態

//Data: <Buffer ee b1 01 00 01 ff fc ff ff>
//              ee b1 01    表示切換 screen
//              00 01       表示切換到 screen1

//Data: <Buffer ee b1 11 00 00 00 01 10 00 00 ff fc ff ff>
//              ee b1 11    表示 button 狀態
//              00 00 00 01 表示 screen0+button1
//              10          表示後續為回應資料
//              00 00       表示 button 為談起狀態

//發送命令，設置 30 秒，倒計 timer 到 screen3 timerid1
//EE B1 40 00 03 00 01 00 00 00 1E FF FC FF FF 

//發送命令，啟動 screen3 timerid1 timer
//EE B1 41 00 03 00 01 FF FC FF FF

//計時結束，串口屏會送出
//Data: <Buffer EE B1 43 00 03 00 01 17 FF FC FF FF>