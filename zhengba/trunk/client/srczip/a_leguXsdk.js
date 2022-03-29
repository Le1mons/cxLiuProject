//==============================
//TA系统数据上报sdk，每个项目这里需要修改
leguX={};
//==============================
leguX.shortName = {
    "#ip" : "a01",
    "#country" : "a02",
    "#country_code" : "a03",
    "#province" : "a04",
    "#city" : "a05",
    "#os_version" : "a06",
    "#manufacturer" : "a07",
    "#os" : "a08",
    "#device_id" : "a09",
    "#screen_height" : "a10",
    "#screen_width" : "a11",
    "#device_model" : "a12",
    "#app_version" : "a13",
    "#bundle_id" : "a14",
    "#lib" : "a15",
    "#lib_version" : "a16",
    "#network_type":"a17",
    "#carrier":"a18",
    "#duration":"a21",
    "#zone_offset":"a37",
    "#app_id":"b01",
    "#user_id":"x01",
    "#account_id":"x02",
    "#distinct_id":"x03",
    "#event_name":"x04",
    "#event_time":"b06",
    "#app_id":"b01",
    "#server_time":"x05",
};

(function () {
    //MD5库
    function md5(string) {
        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        string = Utf8Encode(string);
        x = ConvertToWordArray(string);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }
        var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
        return temp.toUpperCase();
    }
    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }
    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }
    function H(x, y, z) {
        return (x ^ y ^ z);
    }
    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }
    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    function Utf8Encode(string) {
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    leguX.md5 = md5;
})();

(function(){
    //AJAX库
    var ajax = {
        /*
         o = {
         type : GET|POST,
         url : url,
         data : {k:v}
         callback : function(text){

         },
         error : function(readyState,status){

         }
         }
         */
        request : function(o){
            var xhr = new XMLHttpRequest();
            var _type  = o.type||'POST';
            var _form = [],_formText=null;
            if(o.data){
                for(var k in o.data){
                    _form.push(k + '='+ encodeURIComponent(o.data[k]));
                }
                _formText = _form.join('&');
                if(_type=='GET'){
                    o.url += (o.url.indexOf('?')==-1?'?':'&') + _formText;
                    _formText=null;
                }
            }
            xhr.open(_type, o.url,true);
            xhr.timeout = 5000;
            xhr.ontimeout = function(){
                o.error && o.error({"reason":"timeout"});
            };
            xhr.onerror = function(){
                o.error && o.error({"reason":"onerror"});
            };
            xhr.onreadystatechange = function() {
                if(xhr.readyState==4) {
                    if (xhr.status == 200) {
                        o.callback && o.callback(xhr.responseText);
                    }else{
                        //o.error && o.error({"reason":"status_is_not_200"});
                    }
                }
            }
            if(_type=='POST'){
                if (o.headType == "json") {
                    xhr.setRequestHeader("Content-type", "application/json");
                    _formText = o.data;
                } else {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }
            }
            if(_formText==null){
                xhr.send();
            }else{
                xhr.send(_formText);
            }
        }
        ,get : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'GET',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        }
        ,post : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'POST',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        },
        postJSON : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'POST',
                headType:'json',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        },
    };
    leguX.ajax = ajax;
})();

var TA;
(function(){
    function _mylog(type,str){
        if(console && console[type]){
            console[type]("LEGUX:"+str);
        }else if(typeof(cc) == 'object'){
            cc[type]("LEGUX:"+ str);
        }
    }
    function randomString(e) {
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
            a = t.length,
            n = "";
        for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }

    //将src对象上的属性copy到des对象上，默认不覆盖des对象原有属性，mixer为function可以选择属性的覆盖方式
    function mixin(des, src, mixer) {
        mixer = mixer || function(d, s){
            if(typeof d === 'undefined'){
                return s;
            }
        };
        if(mixer == true){
            mixer = function(d, s){return s};
        }
        for (var i in src) {
            var v = mixer(des[i], src[i], i, des, src);
            if(typeof v !== 'undefined'){
                des[i] = v;
            }
        }
        return des;
    }

    leguX.log = function(str){
        return _mylog('log',str);
    };
    leguX.error = function(str){
        return _mylog('error',str);
    };
    //============
    leguX.TA = function(config){
        var me = this;
        this.config = config;
        this._superProperties = {};
        this.resetSuperProperties();
        this._sendQueue = [];
        this._senedTimer = null;

        //唯一编号
        var distinct_id = cc.sys.localStorage.getItem('TA_distinct_id');
        if(!distinct_id){
            distinct_id = (new Date().getTime())+"_"+randomString(8);
            cc.sys.localStorage.setItem('TA_distinct_id',distinct_id);
        }

        this._systemProperties = {
            '#app_id': this.config.APPID,
            '#distinct_id' : distinct_id,
            '#account_id' : (P &&P.gud) ? P.gud.uid : '',

            //设备厂商
            '#manufacturer' : jsbHelper.callNative(null,null,{
                act:'getManufacturer'
            })||"",
            //获取设备型号
            '#model' : jsbHelper.callNative(null,null,{
                act:'getModel'
            })||"",
            //获取运营商
            '#carrier' : jsbHelper.callNative(null,null,{
                act:'getCarrier'
            })||"",
            //获取网络类型
            '#network_type' : jsbHelper.callNative(null,null,{
                act:'getNetwork'
            })||"",
            //获取系统版本
            '#os_version' : jsbHelper.callNative(null,null,{
                act:'getOSVersion'
            })||"",
            //获取App版本
            '#app_version' : jsbHelper.callNative(null,null,{
                act:'getAppVersion'
            })||"",
            //游戏资源版本
            '#game_version' : G.VERSION+"."+G.VERSIONCODE,

            //获取App名称
            '#app_name' : jsbHelper.callNative(null,null,{
                act:'getAppName'
            })||"",

            //getBundleId
            '#bundle_id' : jsbHelper.callNative(null,null,{
                act:'getBundleId'
            })||"",

            '#os' : cc.sys.os,
            '#screen_width' : cc.view.getFrameSize().width,
            '#screen_height' : cc.view.getFrameSize().height,
        };
        this._timeEventData = {};

        if(this._senedTimer){
            clearInterval(this._senedTimer);
            this._senedTimer = null;
        }
        this._senedTimer = setInterval(function(){
            try{
                me._sender();
            }catch(e){
                cc.error(e);
            }
        },5000);
    };
    leguX.TA.prototype = {
        //发送器，根据发送成功和失败的状态，延迟一定时间后从队列里发送，避免同时N个发送阻塞掉游戏本身的逻辑
        //注意：这里有个合批发送的逻辑，会把N条记录一次性post
        _sender : function(){
            var me = this;
            if(this._sendQueue.length > 0){
                //合批数据，整合预设字典后一次性上传
                var _queues = this._sendQueue.splice(0,20);
                var postData = {
                    "public" : me._shortName(me._systemProperties),
                    "data":[]
                };
                for(var i=0;i<_queues.length;i++){
                    postData.data.push(
                        JSON.parse(_queues[i].json)
                    );
                }

                leguX.ajax.postJSON(leguX.config.DEBUG ? leguX.config.SERVER_URL_TEST : leguX.config.SERVER_URL, JSON.stringify(postData), function(over){
                    leguX.log('发送成功');
                }, function (why) {
                    for(var i=0;i<_queues.length;i++){
                        var _queue = _queues.shift();
                        if(!_queue)continue;
                        //发送失败
                        leguX.error('发送失败，重试次数：'+ _queue._retry +" "+ _queue.json);
                        if(_queue._retry < 50){
                            _queue._retry++;
                            me._sendQueue.push(_queue); //加到队尾等待重试
                        }else{
                            leguX.error('达到重试次数上限，已抛弃：'+ _queue._retry +" "+ _queue.json);
                        }
                    }
                });
            }
        },
        //根据配置表，将json数据进行短名压缩
        _shortName : function(data){
            var _res = {};
            for(var k in data){
                if(leguX.shortName[k]){
                    _res[ leguX.shortName[k] ] = data[k];
                }else{
                    _res[ k ] = data[k];
                }
            }
            return _res;
        },
        //增加到发送队列
        _add2Send : function(data){
            //leguX.log('加入到发送队列=>'+JSON.stringify(data));
            this._sendQueue.push({
                json: JSON.stringify(this._shortName(data)),
                _ctime : new Date().getTime(),
                _retry : 0
            });

            //防止内存溢出
            if(this._sendQueue.length > 1000){
                this._sendQueue.shift();
            }
        },
        //混合共用属性
        _mixData : function(data,type){
            var _sendata = {};
            //cc.mixin(_sendata,this._systemProperties);
            if(data.properties){
                _sendata.properties = {};

                //user里，只有user_set合并共有属性
                if( data['#type'] == 'user'){
                    if(data['#event_name']=='set'){
                        cc.mixin(_sendata.properties,this._superProperties,true);
                    }
                }else{
                    cc.mixin(_sendata.properties,this._superProperties,true);
                }
                cc.mixin(_sendata.properties,data.properties,true);
            }

            cc.mixin(_sendata,data);

            if(type && this._timeEventData[type]){
                _sendata['#duration'] = new Date().getTime() - this._timeEventData[type];
                delete this._timeEventData[type];
            }
            _sendata['#time'] = isNaN(G.time)==false?G.time:parseInt(new Date().getTime()/1000);
            _sendata.sign = this._makesign(_sendata);
            return _sendata;
        },
        //根据data计算签名
        _makesign : function(data){
            var key1 = Object.keys(data);
            var key2 = [];
            if(data.properties){
                key2 = Object.keys(data.properties);
            }
            key1.sort();
            key2.sort();

            var str = [];
            for(var i=0;i<key1.length;i++){
                if(key1[i]=='properties')continue;
                str.push( key1[i] + '=' + data[key1[i]] );
            }
            for(var i=0;i<key2.length;i++){
                str.push( key2[i] + '=' + data.properties[key2[i]] );
            }
            //console.log('xxxxx',key1,key2,str.join('&'));
            return leguX.md5(str.join('&') + leguX.config.APPKEY).toLowerCase();
        },
        /*
        * 对于一些重要的属性，譬如用户的会员等级、来源渠道等，这些属性需要设置在每个事件中，此时您可以将这些属性设置为公共事件属性。
        * 公共事件属性指的就是每个事件都会带有的属性，您可以调用 setSuperProperties 来设置公共事件属性，我们推荐您在发送事件前，
        * 先设置公共事件属性。
        * */
        resetSuperProperties : function(){
            this._superProperties = {
                'channel' : G.CHANNEL?G.CHANNEL:(jsbHelper.callNative(null,null,{
                    act:'getChannel'
                })||""),
                'binduid' : (P &&P.gud) ? P.gud.binduid : '',
                'owner_name' : G.owner?G.owner:(jsbHelper.callNative(null,null,{
                    act:'getExtra',
                    key :'owner'
                })||""),
                //设备唯一标识
                'device_id' : cc.sys.os == cc.sys.OS_ANDROID ? (jsbHelper.callNative(null,null,{
                                                                    act:'getNativeId'
                                                                })||"") 
                                                             : (jsbHelper.callNative(null,null,{
                                                                    act:'getNativeIdTmp'
                                                                })||"") ,
            };
        },
        //设置全局属性
        superProperties : function(data){
            if(data == null){
                return this._superProperties;
            }
            if(typeof(data) != 'object'){
                leguX.error('superProperties参数必须是json字典类型');
                return;
            }
            mixin(this._superProperties||{},data,true);
            leguX.log('superProperties设置为'+ JSON.stringify(this._superProperties));
        },
        /*
         设置访客 ID（可选）
        * */
        identify : function(cont){
            if(cont == null){
                return (this._systemProperties['#distinct_id'] || "");
            }else{
                this._systemProperties['#distinct_id'] = cont;
                leguX.log('identify设置为'+ cont);
            }
        },
        /*
         设置账号 ID
         * */
        login : function(cont){
            if(cont == null){
                return (this._systemProperties['#account_id'] || "");
            }else{
                this._systemProperties['#account_id'] = cont;
                leguX.log('login设置为'+ cont);
            }
        },
        /*
        * 可以调用 timeEvent 来开始计时，配置您想要计时的事件名称，当您上传该事件时，计时将会结束，并且 SDK 将会自动在该事件的事件属性中加入 #duration 属性来表示记录的时长，单位为秒
        * // 开始计时，记录的事件为'Purchase'
         TA.timeEvent("Purchase");
         // 其他代码
         // 上传事件，计时结束，'Purchase'这一事件中将会带有表示事件时长的属性"#duration"
         TA.track("Purchase", { Item: "商品A", ItemNum: 1, Cost: 100 });
        * */
        timeEvent : function(type){
            this._timeEventData[type] = new Date().getTime();
        },
        /*
         发送事件
         * */
        track : function(type,data){
            if(!type){
                leguX.error('track方法type参数必填');
                return;
            }
            if(data && typeof(data) != 'object'){
                leguX.error('track方法data参数必须是json字典类型');
                return;
            }
            var _sendata = this._mixData({
                '#type':'track',
                '#event_name':type,
                properties:data
            },type);
            leguX.log('track=>' + type + " data=>"+JSON.stringify(_sendata));
            this._add2Send(_sendata);
        },

        user : function(type,data){
            var _types = [
                'set','setOnce','add','unset','append','del'
            ];
            if( (','+ _types.join(',') + ',').indexOf(','+ type +',') == -1 ){
                leguX.error('user方法type参数必须是以下可选项：'+ _types.join(','));
                return;
            }
            if(!data || typeof(data) != 'object'){
                leguX.error('user_set方法data参数必须是json字典类型');
                return;
            }
            var _sendata = this._mixData({
                '#type':'user',
                "#event_name":type,
                properties:data
            });
            leguX.log('user data=>'+JSON.stringify(_sendata));
            this._add2Send(_sendata);
        }
    };

    //base/bscene中触发
    //本文件不是在在game.min.js的最后，需要等所有代码执行后，再开始初始化
    setTimeout(function(){
        TA = new leguX.TA(leguX.config);
    },0);
    //G.win.start.event.once('willShow',function(){
    //    TA = new leguX.TA(leguX.config);
    //});
})();