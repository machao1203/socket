/* */
	/***************** 接受帧信息 *******************************/
	var curRecvSer;
	var Recv_HEAD;
	var Recv_LEN = new Array(2);
	var Recv_CTR = new Array(2);
	var Recv_MMADR = new Array(1);
	var Recv_MA = new Array(24);
	var Recv_SA = new Array(24);
	var Recv_SER = new Array(1);
	var Recv_DI = new Array(10);
	var Recv_DATA = new Array(256);
	var Recv_FCS = new Array(2);
	var Recv_LLC_CTR = new Array(2);
	var Recv_LLC_SA = new Array(24);
	var Recv_LLC_SER = new Array(1);
	var Recv_LLC_DI = new Array(10);
	var Recv_LLC_DATA = new Array(100);
	var Recv_LEN_length;
	var Recv_CTR_length;
	var Recv_MMADR_length;
	var Recv_MA_length;
	var Recv_SA_length;
	var Recv_DI_length;
	var Recv_DATA_length;
	var Recv_LLC_CTR_length;
	var Recv_LLC_SA_length;
	var Recv_LLC_DI_length;
	var Recv_LLC_DATA_length;
	var IsLLCDATA = false;
	var Recv_error = false;
	var IsExtend;
	/*******************************************************/
    var receive_length = 0; // 收到帧长(包括头和CRC)
    var Recv_length;
    var curFrmLen; //接收到的字节数
    var Rmsg,Rmsg_baowen;
//当前帧长度（去校验码和帧头）
var stTxRecv_pos = -1;
var precv = new Array(512);
var recv_handle = function() {
	var data;
	for (var i = 0;i < Recv_length;i++) {
		data = parseInt(RecvArray[i], 16);
		if (stTxRecv_pos === -1) {
			if (data === 0x7F) {
				stTxRecv_pos = 0;
				precv[0] = data;
				precv[1] = 0xFF;
				// 临时赋长度
				precv[2] = 0xFF;
				stTxRecv_recvPos = 1;
			}
		} else {
			precv[stTxRecv_recvPos] = data;
			if ((precv[1] & 0x80) === 0x80) {
				curFrmLen = precv[1] & 0x7F;
				curFrmLen += precv[2] * 0x80;
			} else {
				curFrmLen = precv[1] & 0x7F;
			}
			if ((curFrmLen + 2) === stTxRecv_recvPos) {
				if (!checkBufCrc16(precv, stTxRecv_recvPos + 1)) {
					stTxRecv_recvPos = 0;
					stTxRecv_pos = -1;
					console.log("crc error");
					return;
				}
				console.log("crc right");
				stTxRecv_recvPos = 0;
				stTxRecv_pos = -1;
				AfterNewFrameRecv();
			} else {
				stTxRecv_recvPos++;
			}
		}

	}
};
var AfterNewFrameRecv = function(){
	init_Recv();
	GetFrameInfoFromRecvBuffer(); // 根据接收帧内容获取各项信息
	show_recvMessage();
};
var init_Recv = function(){

		Recv_HEAD = 0;
		for (var i = 0; i < 2; i++) {
			Recv_LEN[i] = 0;
			Recv_FCS[i] = 0;
			Recv_CTR[i] = 0;
			Recv_LLC_CTR[i] = 0;
		}
		for (var i = 0; i < 10; i++) {
			Recv_LLC_DI[i] = 0;
			Recv_DI[i] = 0;
		}
		for (var i = 0; i < 24; i++) {
			Recv_MA[i] = 0;
			Recv_SA[i] = 0;
			Recv_LLC_SA[i] = 0;
		}
		for (var i = 0; i < 256; i++) {
			Recv_DATA[i] = 0;
		}
		for (var i = 0; i < 100; i++) {
			Recv_LLC_DATA[i] = 0;
		}
		Recv_MMADR[0] = 0;
		Recv_LEN_length = 0;
		Recv_CTR_length = 0;
		Recv_MMADR_length = 0;
		Recv_MA_length = 0;
		Recv_SA_length = 0;
		Recv_DI_length = 0;
		Recv_DATA_length = 0;
		next_flag = 0;
		Recv_error = false;
		IsPollRecvCmd = false;
		Recv_LLC_CTR_length = 0;
		Recv_LLC_SA_length = 0;
		Recv_LLC_DI_length = 0;
		Recv_LLC_DATA_length = 0;
		IsLLCDATA = false;
};
var GetFrameInfoFromRecvBuffer = function(){
	    var curBufferPos = 0;
		Recv_HEAD = precv[curBufferPos];
		curBufferPos++;
		// 获取数据帧长度信息及整帧数据长度
		curBufferPos = GetLengthInfoFromRecvBuffer(curBufferPos);
		// 获取数据帧CTR信息及MMADR、MA、SA信息
		curBufferPos = GetCTRInfoFromRecvBuffer(curBufferPos);
		// 帧序号
		Recv_SER[0] = precv[curBufferPos];
		curRecvSer = Recv_SER[0];
		curBufferPos++;
		// 根据DI获取DI长度信息
		curBufferPos = GetDIInfoFromRecvBuffer(curBufferPos);
		// 获取数据域长度及数据域内容
		curBufferPos = GetDATAInfoFromRecvBuffer(curBufferPos);
		// 帧校验码
		Recv_FCS[0] = precv[curBufferPos++];
		Recv_FCS[1] = precv[curBufferPos++];
		
		// 获取LLC命令中的数据格式
		GetLLCFrameDATAFromFrameDATA();
};
var GetLengthInfoFromRecvBuffer = function(curBufferPos){
	    var curBufferi;
		var curOffSetPos = 0;
		curBufferi = precv[curBufferPos + curOffSetPos];
		curOffSetPos++;
		if ((curBufferi & 0x80) != 0) {
			curOffSetPos++;
			IsExtend = true;
		}
		Recv_LEN_length = curOffSetPos;
		for (var i = 0; i < curOffSetPos; i++) {
			Recv_LEN[i] = precv[curBufferPos + i];
		}
		curBufferPos += curOffSetPos;

		// 确认接收帧长度
		if (IsExtend) {
			receive_length = Recv_LEN[0] & 0x7F;
			receive_length += Recv_LEN[1] * 0x7F;
			receive_length += 3; // CS长度(2个字节)+Head
		} else {
			receive_length = Recv_LEN[0] & 0x7F;
			receive_length += 3; // CS长度(2个字节)+Head
		}
		return curBufferPos;
};
var GetCTRInfoFromRecvBuffer = function(curBufferPos){
	    var curBufferi;
		var curOffSetPos = 0;
		var tempSANum = 0;
		do {
			curBufferi = precv[curBufferPos + curOffSetPos];
			curOffSetPos++;
		} while ((curBufferi & 0x80) == 0);
		// CTR长度确认
		Recv_CTR_length = curOffSetPos;
		for (var i = 0; i < curOffSetPos; i++) {
			Recv_CTR[i] = precv[curBufferPos + i];
		}
		curBufferPos += curOffSetPos;
		curBufferi = Recv_CTR[0];
		// 无扩展控制码标识 无主站地址
		if ((curBufferi & 0x80) != 0) {
			Recv_MA_length = 0;
		}
		// 有无多级地址扩展
		if ((Recv_CTR[0] & 0x20) != 0) {
			Recv_MMADR_length = 0;
			tempSANum = 1;
		} else {
			Recv_MMADR_length = 1;
			var curMMADR = precv[curBufferPos];
			curBufferPos++;
			Recv_MMADR[0] = curMMADR;
			var tempMMADRH = ((curMMADR & 0x70) / 0x10);
			var tempMMADRL = (curMMADR & 0x07);
			if (tempMMADRL >= tempMMADRH) {
				tempSANum = 0x07 - tempMMADRL + 1;
			} else {
				tempSANum = 1;
			}
		}
		// 根据地址方式及多级地址码获取SA长度
		Recv_SA_length = tempSANum
				* GetOneMAorSALen((Recv_CTR[0] & 0x07));
		if (Recv_CTR_length > 1) { // 主站地址长度
			curBufferi = Recv_CTR[1];
			Recv_MA_length = GetOneMAorSALen((curBufferi & 0x07));
		}
		// 主站地址
		if (Recv_MA_length > 0) {
			for (var i = 0; i < Recv_MA_length; i++) {
				curBufferi = precv[curBufferPos];
				curBufferPos++;
				Recv_MA[i] = curBufferi;
			}
		}
		// 从站地址
		if (Recv_SA_length > 0) {
			for (var i = 0; i < Recv_SA_length; i++) {
				if (curBufferPos < 100) {
					curBufferi = precv[curBufferPos];
					curBufferPos++;
					Recv_SA[i] = curBufferi;
				}
			}
		}
		// msg = "CTR/MMADR/MA/SA" + Recv_CTR_length + Recv_MMADR_length
		// + Recv_MA_length + Recv_SA_length;
		return curBufferPos;
};
var GetOneMAorSALen = function(curCTRAddrType) {
		// TODO Auto-generated method stub
		var curAddrLen;
		switch (curCTRAddrType) {
		case 0x07:
			curAddrLen = 0;
			break;
		case 0x06:
			curAddrLen = 1;
			break;
		case 0x05:
			curAddrLen = 12;
			break;
		case 0x03:
			curAddrLen = 2;
			break;
		case 0x02:
			curAddrLen = 4;
			break;
		case 0x01:
			curAddrLen = 6;
			break;
		case 0x00:
			curAddrLen = 8;
			break;
		default:
			curAddrLen = 0;
			break;
		}
		return curAddrLen;
};
	// 根据DI获取DI长度信息
var GetDIInfoFromRecvBuffer = function(curBufferPos) {
		// TODO Auto-generated method stub
		var curBufferi;
		var curOffSetPos = 0;
		var curDIDataLen;
		curBufferi = precv[curBufferPos + curOffSetPos];
		curOffSetPos++;
		IsExtend = false;
		if ((curBufferi & 0xC0) === 0xC0 ) {
			curBufferi = precv[curBufferPos + curOffSetPos];
			curOffSetPos++;
			switch (curBufferi & 0xF0) {

			case 0x60: // 读写UC CC 66 04
			case 0x70: // 读写UC CC 66 04
				curBufferi = precv[curBufferPos + curOffSetPos];
				curOffSetPos++;
				break;
			case 0x80:
				curBufferi = precv[curBufferPos + curOffSetPos];
				curOffSetPos++;
				curDIDataLen = curBufferi;
				if ((curDIDataLen & 0x80) != 0) {
					curBufferi = precv[curBufferPos + curOffSetPos];
					curOffSetPos++;
					curDIDataLen = curBufferi * 0x80 + curDIDataLen & 0x7F;
				}
				Recv_DATA_length = curDIDataLen;
				break;
			case 0x90:
				do {
					curBufferi = precv[curBufferPos + curOffSetPos];
					curOffSetPos++;
				} while ((curBufferi & 0x80) != 0);
				curBufferi = precv[curBufferPos + curOffSetPos];
				curOffSetPos++;
				curDIDataLen = curBufferi;
				if ((curDIDataLen & 0x80) != 0) {
					curBufferi = precv[curBufferPos + curOffSetPos];
					curOffSetPos++;
					curDIDataLen = curBufferi * 0x80 + curDIDataLen & 0x7F;
				}
				Recv_DATA_length = curDIDataLen;
				break;
			case 0xA0:
				curOffSetPos += 6; // 块数N、有效长度、字节数
				break;
			case 0xB0:
				do {
					curBufferi = precv[curBufferPos + curOffSetPos];
					curOffSetPos++;
				} while ((curBufferi & 0x80) != 0);
				curOffSetPos += 6; // 块数N、有效长度、字节数
				break;
			default:
				break;
			}
		}
		Recv_DI_length = curOffSetPos;
		for (var i = 0; i < Recv_DI_length; i++) {
			curBufferi = precv[curBufferPos + i];
			Recv_DI[i] = curBufferi;
		}
		curBufferPos += curOffSetPos;
		return curBufferPos;
	};
	// 获取数据域长度及数据域内容
	var GetDATAInfoFromRecvBuffer = function(curBufferPos) {
		// TODO Auto-generated method stub
		var curBufferi;
		Recv_DATA_length = receive_length - 1;// HEAD
		Recv_DATA_length -= Recv_LEN_length;
		Recv_DATA_length -= Recv_CTR_length;
		Recv_DATA_length -= Recv_MMADR_length;
		Recv_DATA_length -= Recv_MA_length;
		Recv_DATA_length -= Recv_SA_length;
		Recv_DATA_length -= 1; // SER
		Recv_DATA_length -= Recv_DI_length;
		Recv_DATA_length -= 2; // CS（2个字节）
		// 地址域
		if (Recv_DATA_length > 0) {
			for (var i = 0; i < Recv_DATA_length; i++) {
				curBufferi = precv[curBufferPos];
				curBufferPos++;
				Recv_DATA[i] = curBufferi;
			}
		}
		// msg = "DATA_length:" + Recv_DATA_length;
		// mConnectionHandler.show_message(msg);
		return curBufferPos;
	};
	var GetLLCFrameDATAFromFrameDATA = function() {
		// TODO Auto-generated method stub
		if (Recv_DI[0] == 0x3F) {
			/*if (curRecvSer == curSendSer) {
				IsRightPollSER = true;
			}*/
			if (Recv_DATA_length == 0) {
				IsPollRecvCmd = true;
			} else {
				if (Recv_DATA[0] == 0x24 && Recv_DATA[1] == 0x00) {
					IsLLCDATA = true;
					Recv_LLC_CTR[0] = Recv_DATA[2];
					Recv_LLC_SA_length = GetOneMAorSALen(Recv_LLC_CTR[0] & 0x07);
					for (var i = 0; i < Recv_LLC_SA_length; i++) {
						Recv_LLC_SA[i] = Recv_DATA[3 + i];
					}

					Recv_LLC_SER[0] = Recv_DATA[3 + Recv_LLC_SA_length];
					GetDIInfoFromRecvDATA(4 + Recv_LLC_SA_length);
					Recv_LLC_DATA_length = Recv_DATA_length - 4
							- Recv_LLC_SA_length - Recv_LLC_DI_length;
					for (var i = 0; i < Recv_LLC_DATA_length; i++) {
						Recv_LLC_DATA[i] = Recv_DATA[4 + Recv_LLC_SA_length
								+ Recv_LLC_DI_length + i];
					}
				} 
			}
		}
	};
	var GetDIInfoFromRecvDATA = function(curBufferPos) {
		// TODO Auto-generated method stub
		var curBufferi;
		var curOffSetPos = 0;
		var curDIDataLen;
		curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
		curOffSetPos++;
		IsExtend = false;
		if ((curBufferi & 0xC0) == 0xC0) {
			IsExtend = true;
		}
		if (IsExtend) {
			curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
			curOffSetPos++;
			switch (curBufferi & 0xF0) {

			case 0x60: // 读写UC CC 66 04
			case 0x70: // 读写UC CC 66 04
				curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
				curOffSetPos++;
				break;
			case 0x80:
				curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
				curOffSetPos++;
				curDIDataLen = curBufferi;
				if ((curDIDataLen & 0x80) != 0) {
					curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
					curOffSetPos++;
					curDIDataLen = curBufferi * 0x80 + curDIDataLen & 0x7F;
				}
				Recv_DATA_length = curDIDataLen;
				break;
			case 0x90:
				do {
					curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
					curOffSetPos++;
				} while ((curBufferi & 0x80) != 0);
				curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
				curOffSetPos++;
				curDIDataLen = curBufferi;
				if ((curDIDataLen & 0x80) != 0) {
					curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
					curOffSetPos++;
					curDIDataLen = curBufferi * 0x80 + curDIDataLen & 0x7F;
				}
				Recv_DATA_length = curDIDataLen;
				break;
			case 0xA0:
				curOffSetPos += 6; // 块数N、有效长度、字节数
				break;
			case 0xB0:
				do {
					curBufferi = Recv_DATA[curBufferPos + curOffSetPos];
					curOffSetPos++;
				} while ((curBufferi & 0x80) != 0);
				curOffSetPos += 6; // 块数N、有效长度、字节数
				break;
			default:
				break;
			}
		}
		Recv_LLC_DI_length = curOffSetPos;
		for (var i = 0; i < Recv_LLC_DI_length; i++) {
			Recv_LLC_DI[i] = Recv_DATA[curBufferPos + i];
		}
		return curBufferPos;
	};
	var show_recvMessage = function() {
		// TODO Auto-generated method stub

		var hex = (Recv_HEAD).toString(16);
		Rmsg = "帧头:" + hex.toUpperCase() + " ";
		Rmsg_baowen = hex.toUpperCase() + " ";
		Rmsg += "帧长:";
		for (var i = 0; i < Recv_LEN_length; i++) {
			hex = (Recv_LEN[i]).toString(16);
			if (hex.length == 1) {
				hex = "0" + hex;
			}
			Rmsg += hex.toUpperCase() + " ";
			Rmsg_baowen += hex.toUpperCase() + " ";
		}
		Rmsg += "控制码:";
		for (var i = 0; i < Recv_CTR_length; i++) {
			hex = (Recv_CTR[i] & 0xFF).toString(16);
			if (hex.length == 1) {
				hex = "0" + hex;
			}
			Rmsg += hex.toUpperCase() + " ";
			Rmsg_baowen += hex.toUpperCase() + " ";
		}
		if (Recv_MMADR_length > 0) {
			Rmsg += "多级扩展地址标识:";
			for (var i = 0; i < Recv_MMADR_length; i++) {
				hex = (Recv_MMADR[i] & 0xFF).toString(16);
				if (hex.length == 1) {
					hex = "0" + hex;
				}
				Rmsg += hex.toUpperCase() + " ";
				Rmsg_baowen += hex.toUpperCase() + " ";
			}
		}
		if (Recv_MA_length > 0) {
			Rmsg += "主站地址域:";
			for (var i = 0; i < Recv_MA_length; i++) {
				hex = (Recv_MA[i] & 0xFF).toString(16);
				if (hex.length == 1) {
					hex = "0" + hex;
				}
				Rmsg += hex.toUpperCase() + " ";
				Rmsg_baowen += hex.toUpperCase() + " ";
			}
		}
		if (Recv_SA_length > 0) {
			Rmsg += "从站地址域:";
			for (var i = 0; i < Recv_SA_length; i++) {
				hex = (Recv_SA[i] & 0xFF).toString(16);
				if (hex.length == 1) {
					hex = "0" + hex;
				}
				Rmsg += hex.toUpperCase() + " ";
				Rmsg_baowen += hex.toUpperCase() + " ";
			}
		}
		Rmsg += "帧序列号:";
		hex = (Recv_SER[0] & 0xFF).toString(16);
		if (hex.length == 1) {
			hex = "0" + hex;
		}
		Rmsg += hex.toUpperCase() + " ";
		Rmsg_baowen += hex.toUpperCase() + " ";
		Rmsg += "数据标识:";
		for (var i = 0; i < Recv_DI_length; i++) {
			hex = (Recv_DI[i] & 0xFF).toString(16);
			if (hex.length == 1) {
				hex = "0" + hex;
			}
			Rmsg += hex.toUpperCase() + " ";
			Rmsg_baowen += hex.toUpperCase() + " ";
		}
		if (Recv_DATA_length > 0) {
			Rmsg += "数据域:";
			for (var i = 0; i < Recv_DATA_length; i++) {
				hex = (Recv_DATA[i] & 0xFF).toString(16);
				if (hex.length == 1) {
					hex = "0" + hex;
				}
				Rmsg += hex.toUpperCase() + " ";
				Rmsg_baowen += hex.toUpperCase() + " ";

			}
		}
		Rmsg += "校验码:";
		for (var i = 0; i < 2; i++) {
			hex = (Recv_FCS[i] & 0xFF).toString(16);
			if (hex.length == 1) {
				hex = "0" + hex;
			}
			Rmsg += hex.toUpperCase() + " ";
			Rmsg_baowen += hex.toUpperCase() + " ";
		}
		
		var t = new Date().format("yyyy-MM-dd hh:mm:ss");
		$("#msg_recv").css("height","300px");
		$("#msg_recv").append(t + "  " + Rmsg + "\r\n" );  
        $("#msg_recv").append(t + "  " + Rmsg_baowen + "\r\n" ); 
        var scrollTop = $("#msg_recv")[0].scrollHeight;  
        $("#msg_recv").scrollTop(scrollTop); 
	};
