(function (globalG) {
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

    // var obj = {
    //     appid: "",//legu
    //     project: "",//项目名字
    //     type: "",//操作类型 user track event log error
    //     event: "",//事件名 set set_once increment append
    //     event_act: "",//事件操作类型
    //     sign: "",//签名
    //     timestamp: "",//时间戳
    //     props: {
    //         _event_time: G.time,//事件的触发时间 秒时间戳
    //         _device_id: "",//设备唯一id
    //         _channel_name: "",//渠道id 渠道名字
    //         _channel_uid: "",//渠道用户唯一id
    //         _district_service_id: "",//区服id s10
    //         _game_user_id: "",//游戏用户id 用于多角色
    //         _game_role_id: "",//游戏角色id
    //         _ip: "",//提交的时候客户端ip
    //         location: "", //位置信息 经纬度 待定
    //             ...//user data
    //     }
    // };

    X.leguBigDataSDK = function (args) {
        args = args || {};

        cc.mixin(this, args);
        this.errorArr = [];
        if(globalG.isWaiWang){
             // 生产服务器地址
            // this.url = "http://39.100.80.205:8080/v2";
            this.url = "http://bigdataapi.legu.cc:8080/v2";
        }else {
            // 开发环境服务器地址
            this.url = "http://10.0.0.7:8081/v2";
        }


    };

    X.leguBigDataSDK.prototype = {
        initData: function (data, data1) {
            var obj = {
                appid: this.appid,
                project: this.project,
                event_act: this.event_act,
                props: {
                    _device_id: this._device_id,//设备编号
                    _channel_name: this._channel_name,//渠道编号
                    _channel_uid: this._channel_uid,//角色在渠道的唯一标示
                    _district_server_id: this._district_server_id,//区服id
                    _owner_name: this._owner_name,//owner
                    _game_user_id: this._game_user_id,//空
                    _game_role_id: P.gud.uid,
                    _ip: this._ip,
                    _ipv6: this._ipv6,
                    location: this._location,//物理位置
                    _screen_width: cc.director.getWinSize().width,//屏幕宽度
                    _screen_height: cc.director.getWinSize().height,//屏幕高度
                    _platform: this._platform,//操作平台
                    _manufacturer: this._manufacturer,//设备名称
                    _model: this._model,//设备型号
                    _carrier: this._carrier,//网络运营商
                    _network: this._network,//2G 3G 4G 5G wifi
                    _os_version: this._os_version,//操作系统版本
                    _app_version: this._app_version,//app版本
                    _app_name: this._app_name,//app名称
                    user_name: P.gud.name,//角色名
                    role_create_time: P.gud.ctime,//角色创建时间
                    role_level: P.gud.lv,//角色等级
                    role_exp : P.gud.exp,//角色当前经验
                    role_stage : P.gud.mapid,//主线关卡
                    role_vip : P.gud.vip,//角色vip等级
                    role_diamonds : P.gud.rmbmoney,//角色当前rmb货币
                    role_yxb : P.gud.jinbi,//角色当前游戏货币
                }
            };

            data && cc.mixin(obj, data);
            data1 && cc.mixin(obj.props, data1);
            return obj;
        },
        getSign: function (data) {
            cc.log(JSON.stringify(data.props));
            // return md5(this.appid + this.project + data.type + data.event +
            //     this.event_act + data.timestamp + JSON.stringify(data.props) + this.secret);

            cc.log('legu_big_data_props',JSON.stringify(data.props));
            // sign_str = this.appid + this.project + data.type + data.event + this.event_act + data.timestamp + JSON.stringify(data.props) + this.secret;
            sign_str = this.appid + this.project + data.type + data.event + this.event_act + data.timestamp + this.secret;
            md5_str = md5(sign_str);
            cc.log('legu_big_data_sign_str', sign_str);
            cc.log('legu_big_data_md5_str', md5_str);

            return md5_str.toLowerCase();

        },
        send: function (url,data,isCache) {
            var me = this;
            if (!data.timestamp) data.timestamp = parseInt(new Date().getTime() / 1000);
            data.props._event_time = parseInt(new Date().getTime() / 1000);
            data.sign = this.getSign(data);


            cc.log(data);
            X.ajax.postJSON(url, data, function(over){
                cc.log('statisticsSDK ========================= ', over);

                if (isCache) {
                    me.errorArr.shift();
                    me.resend();
                }
            }, function () {
                //发送失败
                if (!isCache) {
                    var obj = {url: url, data: data};
                    me.errorArr.push(obj);
                }
                me.resend();
            });
        },
        resend: function () {
            var me = this;
            cc.director.getRunningScene().setTimeout(function () {
                var cache = me.errorArr;
                if (cache.length < 1) return cc.log('event cache is null');

                var sendCache = cache[0];
                me.send(sendCache.url, sendCache.data, true);
            }, 1000 * 60);
        },
        userSend: function (data) {
            var url = this.url + '/game/user';
            var DATA = this.initData({
                type: 'user',
                event: data.event
            }, data.data);

            this.send(url, DATA);
        },
        eventSend: function (data) {
            var url = this.url + '/game/event';
            var DATA = this.initData({
                type: 'event',
                event: data.event
            }, data.data);

            this.send(url, DATA);
        }
    };
})(G);