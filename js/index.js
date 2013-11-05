/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var RecvArray = new Array(4098);
//¸÷ÏîÎªstring
var PollTimer;
var Recv_length;
var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		socketconnect();
	}
	// Update DOM on a Received Event
};
var socketconnect = function() {
	console.log('socket init^^^^^^^^^^^^^^^^^^^^');
	document.getElementById("connect_flag").innerText = "connecting...";
	var successback = function() {
		document.getElementById("connect_flag").innerText = "connect";
		PollTimer = self.setInterval("socketpoll()", 1000);
	};
	var errorback = function(msg) {
		document.getElementById("connect_flag").innerText = "error";
	};
	chrome.socket.socket_connect(successback, errorback);

};
var socketclose = function() {
	var successback = function() {
		document.getElementById("connect_flag").innerText = "disconnect";
		window.clearInterval(PollTimer);
	};
	chrome.socket.socket_close(successback);
};
var buttonsend = function() {
	console.log('socket send^^^^^^^^^^^^^^^^^^^^');
	var msg = document.getElementsByName("msg_send")[0].value;
	socketsend(msg);
};
var socketsend = function(message) {
	document.getElementById("send_flag").innerText = "sending...";
	var successback = function() {
		document.getElementById("send_flag").innerText = "success";
	};
	var errorback = function(msg) {
		document.getElementById("send_flag").innerText = "error";
	};
	chrome.socket.socket_send(successback, errorback, message);
};
var socketpoll = function() {
	var success = function(message) {
		var strmsg = StrToBytes(message, RecvArray);

		var t = new Date().format("yyyy-MM-dd hh:mm:ss");
		$("#msg_recv").css("height", "300px");
		$("#msg_recv").append(t + "  " + message + "\r\n");
		$("#msg_recv").append(t + "  " + strmsg + "\r\n");
		var scrollTop = $("#msg_recv")[0].scrollHeight;
		$("#msg_recv").scrollTop(scrollTop);
	};
	chrome.socket.socket_poll(success);
};
Date.prototype.format = function(format)//author: meizz
{
	var o = {
		"M+" : this.getMonth() + 1, //month
		"d+" : this.getDate(), //day
		"h+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if (/(y+)/.test(format))
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
	if (new RegExp("(" + k + ")").test(format))
		format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	return format;
};

var StrToBytes = function(msg, curArray) {
	var recv_msg = msg;
	var strmsg = '';
	var recvlength = recv_msg.length;
	for (var i = 0, j = 0; i <= recvlength - 2; i = i + 2, j++) {
		curArray[j] = recv_msg.substring(i, i + 2);
		strmsg += curArray[j] + " ";
	};
	return strmsg;
};
var handletest = function() {
	var testmsg = "7F06BE010684F03F03";
	console.log(testmsg);
	var test = StrToBytes(testmsg, RecvArray);
	Recv_length = testmsg.length / 2;
	recv_handle();
};

function onFileSystemSuccess(fileSystem) {
	fileSystem.root.getFile("readme.txt", {
		create : true,
		exclusive : false
	}, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
	fileEntry.file(gotFile, fail);
}

function fail(evt) {
	console.log(evt.target.error);
}

function gotFile(file) {
	readDataUrl(file);
	readAsText(file);
}

function readDataUrl(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		console.log("Read as data URL");
		console.log(evt.target.result);
	};
	reader.readAsDataURL(file);
}

function readAsText(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		console.log("Read as text");
		var sss = evt.target.result;
		console.log(sss);
	};
	reader.readAsText(file);
}

var filetest = function() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
};

