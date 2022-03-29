(function () {

    G.event.on('otherClientlogin', function () {
        G.class.loginfun.otherClientlogin = true;
        G.tip_NB.show('您的账号已在其他地方登陆');
        cc.director.getRunningScene().setTimeout(function () {
            delete G.class.loginfun.otherClientlogin;
            G.restart();
        }, 1000);
    });

    G.class.loginfun = {
        connSocket: function (callback) {
            var s = G._SOCKET.split(':');
            G.socket.onopen = function () {
                callback && callback();
            };
            G.socket.conn(s[0], s[1]);
        },
        bindSocket: function (u, t, k) {
            var me = this;
            if (cc.sys.isObjectValid(G.socket.ws) && G.socket.ws.readyState == WebSocket.OPEN) {
                return;
            }
            me.connSocket(function () {
                G.socket.send('binduid', [u, t, k]);
            });
            G.socket.onclose = function () {
                cc.log('G.socket.onclose..');
                if (!me.otherClientlogin) {
                    C.D.getRunningScene().setTimeout(function () {
                        me.bindSocket(u, t, k);
                    }, 3000);
                }
            };
        },
        loginToLogic: function (u, t, k, sid, callback) {
            var me = this;

            G.event.emit('loginToLogic', {});

            if (me._loginTimer) {
                C.D.getRunningScene().clearTimeout(me._loginTimer);
                delete me._loginTimer;
            }
            G.win.start.getTimeFromServer();

            var extra = {};
            if (G.CHANNEL && G.CHANNEL != "") extra['ext_channel'] = G.CHANNEL;
            if (G.loginData && G.loginData['myu'] != "") extra['ext_mybinduid'] = G.loginData['myu'];
            if (G.channelId && G.channelId != "") extra['ext_channelId'] = G.channelId;
            if (G.owner && G.owner != "") extra['ext_owner'] = G.owner;
            if (G._SERVERNAME && G._SERVERNAME != "") extra['ext_servername'] = G._SERVERNAME;
            if (window['TA'] && TA.identify && TA.identify()!="") extra['ext_device_id'] = TA.identify();

            //开发板sid   28700
            G.ajax.send('user_login', [u, t, k, sid, extra], {
                "succ": function (d) { // G._SERVERID
                    if (!d) return;
                    var data = JSON.parse(d);
                    if (data.s === -3) {
                        //这个逻辑不会进入了，默认会给玩家指定 temp_xxxx 的名字
                        G._SID = data.d.sid;

                        //G.frame.create.data({u:u,t:t,k:k,callback:callback}).show();
                        // G.ajax.send('user_register',[u,t,k,callback],function(data) {
                        //     if (!data) return;
                        //     var data = X.toJSON(data);
                        //     if (data.s === 1) {
                        //         G.OPENTIME = data.d.opentime;
                        //         me.remove();
                        //         G.class.loginfun.toMain(u,t,k,data.d,callback);
                        //         G.event.emit('dologin',{});
                        //         G.event.emit('createrole',{});
                        //         G.push.regInit();
                        //
                        //         G.loginAllData = data.d;
                        //     }
                        // },true);
                        G.frame.login_zc.data({ u: u, t: t, k: k, callback: callback }).show();



                    } else if (data.s === 1) {
                        G._SID = data.d.sid;
                        G.OPENTIME = data.d.opentime;
                        G.SIDLIST = data.d.sidlist;//用来判断别人和自己是不是在同一区服下
                        if (data.d.tm && !G.TOPMESSAGE) {
                            G.TOPMESSAGE = { "m": data.d.tm, "c": 0 };
                        }
                        if(cc.sys.os == cc.sys.OS_ANDROID && cc.director.setUid) {
                            cc.director.setUid(P.gud.uid);
                        }
                        var plat = "";
                        if (cc.sys.os == cc.sys.OS_IOS) {
                            plat = "ios";
                        }else if (cc.sys.os == cc.sys.OS_ANDROID) {
                            plat = "android";
                        }
                        G.class.player.init(data.d);
                        G.sdkEvent = new X.leguBigDataSDK({
                            appid: 'legu_zhengba',
                            project: 'zhengba',
                            secret: "legu",

                            event_act: "",
                            _game_user_id: "",
                            _game_role_id: P.gud.uid,
                            _channel_name: G.CHANNEL,
                            _channel_uid: P.gud.binduid,
                            _district_service_id: G._SERVERID,
                            _owner_name:G.owner,

                            user_name: P.gud.name,
                            role_create_time: P.gud.ctime,
                            role_level: P.gud.lv,
                            role_exp : P.gud.exp,
                            role_stage : P.gud.mapid,
                            role_vip : P.gud.vip,
                            role_diamonds : P.gud.rmbmoney,
                            role_yxb : P.gud.jinbi,

                            _screen_width: cc.director.getWinSize().width,
                            _screen_height: cc.director.getWinSize().height,
                            _platform: plat,
                            _ip: G.nativeIp,
                            _location: G.nativePos ? JSON.parse(G.nativePos) : "",
                            _device_id: G.nativeId,
                            _manufacturer: G.nativeManufacturer,
                            _model: G.nativeModel,
                            _carrier: G.nativeCarrier,
                            _network: G.nativeNetwork,
                            _os_version: G.nativeOSVersion,
                            _app_version: G.nativeAppVersion,
                            _app_name: G.nativeAppName
                        });
                        //如果是新玩家，则上传数据，用于控制负载均衡
                        var isNewPlayer = data.d.isNewPlayer;
                        if (isNewPlayer) {
                            //上传新玩家数据便于统计数量
                            var _upurl = "http://zhengbaapi.legu.cc/api/?app=usercount&act=add&sid=" + data.d.gud.sid + "&uid=" + data.d.gud.uid;
                            X.ajax.get(_upurl, {}, function (_upv) {
                                cc.log('_upres', _upv);
                            });
                            cc.log('_upurl', _upurl);

                            G.event.emit("sdkevent", {
                                event: "set",
                                type:'user',
                                data:{
                                    cell_phone_number:G.PHONENUM || '',//手机号
                                    channel_id:G.CHANNEL || '',//渠道号
                                    role_mailbox:G.EMAIL || '',//邮箱
                                    role_account:'',//角色账号
                                    role_create_time:P.gud.ctime,//角色创建时间
                                    service_id:G._SERVERID || '',//服务器ID
                                    role_number:0,//角色序号
                                    role_type:0,//角色职业
                                    role_sex:P.gud.sex,//角色性别
                                    role_race:0,//角色种族
                                    role_camp:0,//角色阵营
                                    user_name:P.gud.name,
                                    guser_id:P.gud.uid,//角色ID
                                }
                            });
                            G.event.emit("leguXevent", {
                              type: 'track',
                              event: 'create_account',
                              data: {
                                  
                              }
                            });
                        }
                        G.event.emit("sdkevent", {
                            event: "loginGame"
                        });
                        me.toMain(u, t, k, data.d, callback);
                        G.loginAllData = data.d;
                        G.event.emit('dologin', {});
                        G.event.emit('createrole',{});
                    }
                }, "error": function () {
                    me._loginTimer = C.D.getRunningScene().setTimeout(function () {
                        me.loginToLogic(u, t, k, sid, callback);
                    }, 3000);
                }
            }, true);
        },
        toMain: function (u, t, k, data, callback) {
            var me = this;
            X.cacheByUid("tqlb_login_redPoint", 0);
            me.bindSocket(P.gud.uid, t, k);
            callback && callback();
            G.frame.preload.show('loadbaseData', function () {
                // G.frame.fight.once('show',function(){
                // G.frame.fight.visible(false);

                // G.frame.world.once('show',function(){
                //     G.frame.world.visible(false);
                // }).show();

                // G.frame.main.show();

                if (!cc.isNode(G.view.mainView)) {
                    if(P.gud && P.gud.lv==1 && P.gud.exp==0 && !X.inArray(G.gc.noShowTdGame, G.CHANNEL)){
                        !X.cacheByUid("jumXYX") && !P.gud.init;
                    }
                    new G.class.mainView();
                    cc.director.getRunningScene().addChild(G.view.mainView);
                    X.cacheByUid('firstLogincjhd',0);//每次登陆清空新年红包弹出
                } else {
                    G.view.mainView.setTimeout(function () {
                        G.event.emit('mainViewShow');
                    }, 10);
                    //每次上线清空玩家龙舟红点助威鼓;
                    X.cacheByUid('firstLoginLongzhouHd',0);
                    X.cacheByUid('firstLogincjhd',0);//每次登陆清空新年红包弹出
                }
                G.view.mainView.show();
                G.frame.preload.remove();


            });
        },
        willLogin: function (data, callback) {
            G.loginData = data;
            if (data.userStatus != 1) {
                G.tip_NB.show("您的账号已被锁定");
                return;
            }

            if (!G.frame.login.lastSvr) {
                G.tip_NB.show("正在加载区服列表 请稍候");
                G.frame.login.getSvrList();
                return;
            }

            // if(G.time < G.frame.login.lastSvr.starttime){
            //     //没有开放的区
            //     if(data.specialUser!=1){
            //         G.tip_NB.show("该区暂未开放 请稍候再试");
            //         return;
            //     }
            // }
            this.doLogin(data.u, data.t, data.k, G.frame.login.lastSvr.sid, callback);
        },
        doLogin: function (u, t, k, sid, callback) {
            X.cache('_loginU_', u);
            X.cache('_loginT_', t);
            X.cache('_loginK_', k);
            X.cache('_loginSID_', sid);
            G._onlineSecond = 0;
            this.loginToLogic(u, t, k, sid, callback);
        },
        reDoLogin: function (callback) {
            // X.hideAllFrame({except:"fight,world,main,paomadeng"});
            this.doLogin(X.cache('_loginU_'), X.cache('_loginT_'), X.cache('_loginK_'), X.cache('_loginSID_'), callback);
        }
    };

})();