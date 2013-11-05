var HexL2Str = function(buffer, len) {
	var ReturnStr = "";
	for (var i = 0; i < len; i++) {
		var str = buffer[i].toString(16);
		if (str.length % 2 == 1) {
			str = "0" + str;
		}
		ReturnStr += str;
	}
	return ReturnStr;
};
var IntToHex = function(int, len) {
	var hex = int.toString(16);
	var hexlen = hex.length;
	while (hexlen < len) {
		hex = "0" + hex;
		hexlen = hexlen + 1;
	}
	return hex;
}; 
var StringByteTurnOver = function(strInput){
	var curlen = strInput.length;
	var strOut = "";
	if(curlen > 0)
	{
		if(curlen%2 == 1)
		{
			strInput = "0" + strInput;
			curlen++;
		}
		for(var i = curlen -2;i>=0;i-=2)
		{
			strOut += strInput.substring(i,i+2);
		}
	}
	return strOut;
};
