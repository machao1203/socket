/*

 */
var Send_HEAD = "7F";
var Send_LEN;
var Send_CTR;
var Send_MMADR;
var Send_ADDR;
var Send_SER;
var Send_DI;
var Send_DATA;
var Send_FCS;
var Controller_ID = "FFFFFFFFFFFFFFFFFFFFFFFF";
var Device_ID     = "011250086000113240112630";
var sendmsg  ;
var VoiceAlarm = function() {

	Send_CTR   = "D5";
	Send_MMADR = "E7";
	Send_ADDR  = Controller_ID + Device_ID;
	Send_SER   = "01";
	Send_DI    = "B8";
	Send_DATA  = "40FF";
	sendmsg = Send_CTR + Send_MMADR + Send_ADDR + Send_SER + Send_DI + Send_DATA;
	var length = sendmsg.length/2;
	Send_LEN = (0xFF - (length + 1)).toString(16);
	sendmsg = Send_HEAD + Send_LEN + sendmsg;
	sendmsg = (sendmsg + CalculateCrc16(sendmsg).toString(16)).toUpperCase();
	console.log('VoiceAlarm^^^^^^^^^^^^^^^^^^^^' + sendmsg);
	socketsend(sendmsg);
};
var LightAlarm = function() {

	Send_CTR   = "D5";
	Send_MMADR = "E7";
	Send_ADDR  = Controller_ID + Device_ID;
	Send_SER   = "01";
	Send_DI    = "B8";
	Send_DATA  = "80FF";
	sendmsg = Send_CTR + Send_MMADR + Send_ADDR + Send_SER + Send_DI + Send_DATA;
	var length = sendmsg.length/2;
	Send_LEN = (0xFF - (length + 1)).toString(16);
	sendmsg = Send_HEAD + Send_LEN + sendmsg;
	sendmsg = (sendmsg + CalculateCrc16(sendmsg).toString(16)).toUpperCase();
	console.log('VoiceAlarm^^^^^^^^^^^^^^^^^^^^' + sendmsg);
	socketsend(sendmsg);
};
var VoiceLightAlarm = function() {

	Send_CTR   = "D5";
	Send_MMADR = "E7";
	Send_ADDR  = Controller_ID + Device_ID;
	Send_SER   = "01";
	Send_DI    = "B8";
	Send_DATA  = "C0FF";
	sendmsg = Send_CTR + Send_MMADR + Send_ADDR + Send_SER + Send_DI + Send_DATA;
	var length = sendmsg.length/2;
	Send_LEN = (0xFF - (length + 1)).toString(16);
	sendmsg = Send_HEAD + Send_LEN + sendmsg;
	sendmsg = (sendmsg + CalculateCrc16(sendmsg).toString(16)).toUpperCase();
	console.log('VoiceAlarm^^^^^^^^^^^^^^^^^^^^' + sendmsg);
	socketsend(sendmsg);
};
var AlarmStop = function() {

	Send_CTR   = "D5";
	Send_MMADR = "E7";
	Send_ADDR  = Controller_ID + Device_ID;
	Send_SER   = "01";
	Send_DI    = "B8";
	Send_DATA  = "00FF";
	sendmsg = Send_CTR + Send_MMADR + Send_ADDR + Send_SER + Send_DI + Send_DATA;
	var length = sendmsg.length/2;
	Send_LEN = (0xFF - (length + 1)).toString(16);
	sendmsg = Send_HEAD + Send_LEN + sendmsg;
	sendmsg = (sendmsg + CalculateCrc16(sendmsg).toString(16)).toUpperCase();
	console.log('VoiceAlarm^^^^^^^^^^^^^^^^^^^^' + sendmsg);
	socketsend(sendmsg);
};


