(function(){
    function chr(code){
        return String.fromCharCode(code);
    }
    var CHR1 = chr(1),CHR2 = chr(2),CHR3 = chr(3),CHR4 = chr(4);
    var sendIndex = 65;
    var errTimes = 0;

    function checkErrTimes(){
        cc.log('network error times='+ errTimes );
        if(errTimes>=30){
            G.event.emit('ajaxMaxError');
            errTimes = 0;
        }
    }
    G.class.sends = function (code, args, callback,showLoading,extData) {//防止某些手机由于参数太多get不到数据 拆开多次发送 常见于传三队阵容18个tid的现象
        this.args = args;
        this.code = code;
        this.showLoading = showLoading;
        this.callback = callback;
        this.sendDataArr = JSON.parse(JSON.stringify(extData.dataArr));
        this.argsIndex = extData.index;
        this.send();
    };
    G.class.sends.prototype.send = function () {
        var me = this;
        me.args[me.argsIndex] = me.sendDataArr.shift();
        G.ajax.send(me.code, [].concat(me.args, me.sendDataArr.length == 0), function (str, data) {
            if (data.s == 1) {
                if (me.sendDataArr.length < 1) {
                    if (cc.isFunction(me.callback)) {
                        me.callback && me.callback(str, data);
                    } else {
                        me.callback.succ && me.callback.succ(str, data);
                    }
                } else {
                    me.send();
                }
            }
        }, me.showLoading);
    };

    G.ajax = {
        event : cc.EventEmitter.create(),
        send: function (code, args, callback,showLoading,extData) {
            var me = this;
            if (extData && extData.dataArr) {
                return new G.class.sends(code, args, callback,showLoading,extData);
            }
            cc.log(L('network_api'),code,args);

            if (code == null) {
                cc.log(L('network_noapi'));
                return;
            }

            if(typeof(args)=='function'){
                callback =  args;
                showLoading = callback;
                args = null;
            }else{
                args = [].concat(args);
            }
            
            var _key = CHR4;
            if (callback) {
                sendIndex++;
                if (sendIndex >= 90)sendIndex = 65;
                _key = chr(sendIndex);
            }
            var _data = this.fmtData(code, args,_key);
            
            if(showLoading && G.frame.loading && cc.sys.isNative)G.frame.loading.show();
            X.ajax.get(G._API,_data,function(txt){

                if(txt.indexOf('~serverError~')!=-1){
					if(cc.sys.os==cc.sys.OS_WINDOWS){
				 		cc.log( txt );
					}
					txt="err";
				}

                cc.log('ajax recive',txt);

                if(showLoading && G.frame.loading)G.frame.loading.remove();

                if(txt=='err'){
                    if(typeof(callback)=='object'){
                        callback.error && callback.error();
                    }
                    return;
                }

                try{
                    var d = JSON.parse(txt);
                    if(d && d.s=='-1'){
                        G.event.emit('offline');
                        return;
                    }
                }catch(e){}

                errTimes = 0;
				
                me.s2c(txt,function(svrCode,svrArgs){
                    // cc.log('ajax s2c',svrCode,svrArgs);
                    if(cc.sys.os == cc.sys.OS_WINDOWS && cc.sys.isNative){
                        console.log(svrArgs);
                    }else if (cc.sys.DESKTOP_BROWSER==cc.sys.platform) {
                        var arg = args != null && args.length > 0 && (args && args[0] != null) ? args : L('wu');
                        var getStr = '=====' + L('api') + '：' + code + ',' + L('args') + '：' + JSON.stringify(arg) +'=======';
                        getStr = '%c' + getStr;
                        console.groupCollapsed(getStr,'color:blue');
                        try {
                            console.info(JSON.parse(svrArgs));
                            // console.dir(svrArgs);
                        } catch (e) {
                            console.log(L('ERROR') + '======', e);
                        }
                        console.groupEnd();
                    }

                    if(svrCode!=""){
                        var __data = extData?extData[svrCode]:null;
                        var changeArr = ["itemchange","attrchange","equipchange","herochange",'glyphchange','wuhunchange'];
                        if(X.inArray(changeArr,svrCode)){
                            var formInfo = [code];
                            for(var i = 0; i < args.length; i++){
                                formInfo.push(args[i]);
                            }
                        }
                        G.event.emit(svrCode.toString(),svrArgs,__data,formInfo);
                    }else{
                        try{
                            var d = JSON.parse(svrArgs);
                            if(d.errmsg)G.tip_NB.show(d.errmsg);
                            if(d.tips)G.tip_NB.show(d.tips);

                            if(d && d.s*1<0){
                                //负数统一由外部处理
                                G.event.emit('puberror',d);
                            }else{
                            	//广播新手指引需要的事件
								G.guidevent && G.guidevent.emit('ajax_'+code);
                                G.event.emit('sendApi', {
                                    api: code,
                                    args: args,
                                    d: JSON.parse(svrArgs)
                                });
                            }
                        }catch(e){}
                        
                        if(typeof(callback)=='function'){
                            callback && callback(svrArgs,d);
                        }else if(typeof(callback)=='object'){
                            callback.succ && callback.succ(svrArgs, d);
                        }
                    }
                });
            },function(readyState,status){
                errTimes++;
                checkErrTimes();
                if(showLoading && G.frame.loading)G.frame.loading.remove();
                if(typeof(callback)=='object'){
                    callback.error && callback.error();
                }
            });
        },
        //服务器数据拆包粘包 socket协议也使用该方法解包
        s2c : function (s,callFun){
            var me = this;
            me._socketLeftString = me._socketLeftString || "";
            if(me._socketLeftString!=''){
                s = me._socketLeftString + s;
            }
            if(s.length<3){
                me._socketLeftString = s;
                return;
            }
            if (s.substring(0,1)==CHR1){
                var _endChrIndex = s.indexOf(CHR2);
                if (_endChrIndex==-1){
                    me._socketLeftString = s;
                    return;
                }
                
                if (s.indexOf(CHR4)==-1){
                    me._socketLeftString = "";
                    return;
                }
                
                var _dataMain = s.substring(1,_endChrIndex),
                _dataArr = _dataMain.split(CHR4);
                
                var _code = _dataArr[0],
                    _data = _dataArr[1];
                    
                me._socketLeftString = '';
                callFun && callFun(_code, _data);
                
                if(_endChrIndex+1 != s.length){
                    var _leftData = s.substring(_endChrIndex+1,s.length);
                    me.s2c(_leftData,callFun);
                }
            }else{
                cc.log('[G.ajax.s2c] substring(0,1)!=CHR1');
                me._socketLeftString = ''   ;
            }
        },
        fmtData : function(code,args,_key){
            if(args!=null && 'string'!=typeof(args) && 'number'!=typeof(args)){
                args =  JSON.stringify(args);
            }
            args = args||"";

            if(args){
                args = args+"";
                var _addKey = X.rand(2,9);
                var neWargs = (_addKey * 78) + String.fromCharCode(8);
                var newV = [];
                var ov = X.base64.encode(args);
                for (var i = 0; i < ov.length; i += _addKey * 1) {
                    var _x = ov.substr(i, _addKey * 1);
                    newV.unshift(_x);
                }
                neWargs += newV.join('');
            }else{
                neWargs = args;
            }


            var data = {a:code.toString(),s:G._SID||"",k:_key};
            if(args)data.d = neWargs;
            data.tm = G.time*1000+ X.rand(111,999);
            data.sign = X.MD5(data.a+""+data.s+""+data.k+""+data.d + "" + data.tm +"BBe6O82s4gSU");
            return data;
        },
        ajaxWithNode : function(code, args, callbackDict,showLoading,emitData,needUI){
            var me = this;
            var succCall,errCall,responseCall;
            if(typeof(callbackDict)=='function'){
                succCall = callbackDict;
            }else if(typeof(callbackDict)=='object'){
                responseCall = callbackDict.data;
                succCall = callbackDict.ui;
                errCall = callbackDict.error;
            }
            me.send(code, args, {"succ":function(str,json){
                responseCall && responseCall(str,json);
                if(cc.isNode(needUI)){
                    succCall && succCall(str,json);
                }
            },"error":function(){
                errCall && errCall();
            }},showLoading,emitData);
        }
    };
    G.ajax.event.setMaxListeners(200);
    
    
    X._socket = cc.Class.extend({
        ctor : function(){
            this.event = cc.EventEmitter.create();
            this.event.setMaxListeners(200);
        },
        clearTimer : function(){
            /*var me = this;
             cc.log('clearTimer');
             if(me._timeoutTimer){
             C.D.getRunningScene().clearTimeout(me._timeoutTimer);
             delete me._timeoutTimer;
             }*/
        },
        conn : function(ip,port){
            var me = this;
            me._socketLeftString = "";

            me.ip = ip;
            me.port = port;
            me.timeout = 10000;
            me.ws = new WebSocket('ws://'+ me.ip +':'+ me.port);

            //超时处理
            /*me._timeoutTimer = C.D.getRunningScene().setTimeout(function(){
             me.ws.close();
             me.conn(me.ip,me.port);
             },me.timeout);*/

            me.ws.onopen = function(evt){
                me.clearTimer();
                me.onopen && me.onopen(evt);
                me.event.emit('open', evt);
            };

            me.ws.onerror = function(evt){
                me.clearTimer();
                me.onerror && me.onerror(evt);
                me.event.emit('err', evt);
            };
            me.ws.onconnecting = function(v){
                me.onconnecting && me.onconnecting(evt);
                me.event.emit('connecting',null);
            };
            me.ws.onclose = function(evt){
                errTimes++;
                checkErrTimes();

                me.clearTimer();
                me.onclose && me.onclose(evt);
                me.event.emit('close', evt);
                G.event.emit('socketClose');
            };
            me.ws.onmessage = function(d){
                me.onMessage(d.data);
            };
            return me.ws;
        },
        send: function (code, args) {
            var me = this;
            if(code==null){
                cc.log('[G.socket.send] error, code or args must not null');
                return;
            }
            if(!cc.sys.isObjectValid(me.ws)){
                cc.log('[G.socket.send] error, ws is null');
                return;
            }
            if(me.ws.readyState!=WebSocket.OPEN){
                cc.log('[G.socket.send] _socket is null');
                return;
            }

            var _data = me.fmtData(code,args||"");
            cc.log('SOCKET发送：'+_data);
            me.ws.send(_data);
        },
        onMessage : function(d){
            var me = this;
            G.ajax.s2c.call(me,d,function(code,args){
                cc.log('onMessagePacked',code,args);
                code = code.toString();
                if(code=='paysuccess'){
                    G.event.emit(code,JSON.parse(args),"fromsocket");
                    G.event.emit("pay_event",JSON.parse(args),"fromsocket");//打点用充值成功事件
                    //
                    try{
                        console.log("paysuccess send sdk-====");
                        jsbHelper.callNative(null,null,{
                            act:'paysuccess',
                            cpTradeNo : G.ORDERID || "",
                            lgTotalFee : G.ORDERMONEY || ""
                        });
                    }catch(e){}
                    if (cc.sys.os == cc.sys.OS_IOS) {
                        var params = JSON.parse(args);
                        if(params['orderid'].substr(0, 3) == "GM_"){
                            cc.log('GM_Order');
                        }else{
                            jsbHelper.callNative(null,null,{
                                act:'pysuccess',
                                data :params
                            });
                        }
                    }
                }else{
                    G.event.emit(code,args,"fromsocket");
                }
            });
        },
        close : function(){
            if(cc.sys.isObjectValid(this.ws))this.ws.close();
        },
        //格式化发送给服务器的数据
        fmtData : function(code,args){
            if('string'!=typeof(args) && 'number'!=typeof(args)){
                args =  JSON.stringify(args);
            }
            return CHR1 + (code.toString()) + CHR4 + args + CHR2;
        }
    });

    G.socket = new X._socket();
    
})();