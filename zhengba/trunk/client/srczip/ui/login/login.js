(function () {
    var ID = 'login';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['fuwuqi.plist', 'fuwuqi.png'];
            me._super(json, id,{action:true});
        },
        setNewServerData: function (data) {
            var me = this;

            var obj = {};
            // obj = cc.mixin(obj, data, true);
            // var len = obj.order.length;

            var obj = {data:{}, order:[]};
            var len = 0;

            var ext_server_data = G.class.getConf('extservers').server;
            for (var i = 0; i < ext_server_data.length; i++) {
                var eData = {};
                eData = cc.mixin(eData, ext_server_data[i], true);
                eData['idx'] = len + i + 1;
                eData['sid'] = 's' + eData['idx'];
                obj.data[eData.sid] = eData;
                obj.order.push(eData.sid);
            }

            me.allServers = obj;
            return obj;
        },
        showUI: function (action) {
            var me = this;
            me.ui.nodes.txt_ver.show();
            me.ui.nodes.text_bb.show();
            me.ui.nodes.txt_ghzh.show();
            me.ui.nodes.btn_dl.show();
            me.ui.nodes.bg_qufu.show();
        },
        getSvrList: function () {
            var me = this, url = G.serverListUrl;
            X.ajax.get(url, {}, function (txt) {
                cc.log('getSvrList=' + txt);
                G.SERVERLIST = JSON.parse(txt);
                if (G.serverListUrl == 'http://v3.legu.cc/hommdata/?app=serverlist') {
                    G.SERVERLIST = me.setNewServerData(G.SERVERLIST);
                }
                // if (G.SERVERLIST.now){
                //     G.time = G.SERVERLIST.now;
                //     var time_gap = G.time - G.SERVERLIST.data[0].starttime;
                //     var day_gap = Math.floor(time_gap/86400);
                //     if(day_gap < 3){
                //         me.nodes.txt_zt.setString(L('TUIJIAN'));
                //     }else if(day_gap < 7){
                //         me.nodes.txt_zt.setString(L('serverState2'));
                //     }
                // }

                if (me.lastSvr) {
                    //如果有上次登陆数据，则更新区名ip等数据
                    if (G.SERVERLIST.data[me.lastSvr.sid]) {
                        //这个sid还存在的话
                        me.changeServer(me.lastSvr.sid);
                    } else {
                        //sid在列表里已经不存在了
                        var firstSid = G.SERVERLIST.order[0];
                        me.changeServer(firstSid);
                    }
                } else {
                    //设置第一个区默认选择
                    var firstSid = G.SERVERLIST.order[0];
                    //2018-12-6：从未进入过某个区的话，会进入这个逻辑，这里增加逻辑，通过svrgroup来判断和实现负载均衡
                    var _svrData = G.SERVERLIST.data[firstSid];

                    if(_svrData.svrgroup !=null && _svrData.svrgroup!=""){
                        //如果有组，则从组别中选人数最少的服务器进入
                        me._svrGroup = _svrData.svrgroup;
                        //遍历记录，找到group相同的区服
                        var _sameGroupSids = [];
                        for(var _o=0;_o<G.SERVERLIST.order.length;_o++){
                            var __sid = G.SERVERLIST.order[_o];
                            if( G.SERVERLIST.data[__sid] && G.SERVERLIST.data[__sid].svrgroup == me._svrGroup){
                                _sameGroupSids.push({"sid":__sid,"usernum": G.SERVERLIST.data[__sid].un || 0 });
                            }
                        }

                        if(_sameGroupSids.length>0){
                            //按usernum从小到达排序
                            _sameGroupSids.sort(function (a, b) {
                                return a.usernum < b.usernum ? -1 : 1;
                            });
                            var _minNum = _sameGroupSids[0].usernum; //人数最少的区

                            //如果某个区的人数和最小的相差100以内的话，都可以参与随机选择
                            var _canChoose = [];
                            cc.each(_sameGroupSids,function(__sinfo){
                                if( Math.abs(__sinfo.usernum-_minNum) < 100 ){
                                    _canChoose.push( __sinfo.sid );
                                }
                            });

                            if(_canChoose.length>0){
                                firstSid = X.arrayRand(_canChoose);
                            }
                        }
                    }

                    me.changeServer(firstSid);
                }
            }, function () {
                if(cc.isNode(me.ui)){
                    me.ui.setTimeout(function () {
                        me.getSvrList();
                    }, 1500);
                }
            });
        },

        //___getSvrList: function () {
        //    var me = this;
        //
        //    G.SERVERLIST = {"data":{},"order":[]};
        //    G.SERVERLIST = me.setNewServerData(G.SERVERLIST);
        //    if (G.SERVERLIST.now) G.time = G.SERVERLIST.now;
        //
        //    G.frame.gonggao.checkShow();
        //    if (me.lastSvr) {
        //        //如果有上次登陆数据，则更新区名ip等数据
        //        if (G.SERVERLIST.data[me.lastSvr.sid]) {
        //            //这个sid还存在的话
        //            me.changeServer(me.lastSvr.sid);
        //        } else {
        //            //sid在列表里已经不存在了
        //            var firstSid = G.SERVERLIST.order[0];
        //            me.changeServer(firstSid);
        //        }
        //    } else {
        //        //设置第一个区默认选择
        //        var firstSid = G.SERVERLIST.order[0];
        //        me.changeServer(firstSid);
        //    }
        //},

        getLastServer: function (dl) {
            var me = this;
            var lastSvr = X.cache('_lastServer_');
            var lastAllSvr = X.cache('_lastAllServer_');

            if(!lastSvr && !lastAllSvr){
                //是第一次启动游戏
                me._firstRunGame = true;
            }
            if(!dl){
                if (lastAllSvr && lastAllSvr[0] != "") {
                    me.lastSvr = JSON.parse(lastAllSvr);
                    me.setServerData(me.lastSvr[0], dl);
                }
            }else{
                if (lastSvr && lastSvr[0] != "") {
                    me.lastSvr = JSON.parse(lastSvr);
                    me.setServerData(me.lastSvr, dl);
                }
            }

            if (lastAllSvr && lastAllSvr != "") {
                me.lastAllSvr = JSON.parse(lastAllSvr);
            }
        },
        changeServer : function(sid){
            var me = this;
            var data = G.SERVERLIST.data[sid];
            me.changeServerByData(data);
        },
        changeServerByData : function(data){
            var me = this;
            me.setServerData(data);
        },
        fmtServerNameByData : function(data){
            var me = this;
            var _name = data.name+"";
            if(data.svrgroup && me._svrGroup && data.svrgroup == me._svrGroup){
                var _nameSplit = _name.split(' ');
                _name = _nameSplit[ _nameSplit.length -1 ];
            }
            return _name;
        },
        setServerData: function (data,dl) {
            var me = this;

            cc.log('setServerData', data);
            me.lastSvr = data;
            cc.isNode(me.ui) && me.ui.nodes.txt_fwq.setString(me.fmtServerNameByData(data));
            // me.ui.nodes.txt_fwq.setTextColor(cc.color(G.gc.COLOR.n4));
            G._SERVERNAME = data.name;
            G._SERVERID = data.sid;
            me.curServData = data;
            if(!dl){
                var c = {
                    0:'img/fuwuqi/img_fuwuqi_zt1.png',
                    1:'img/fuwuqi/img_fuwuqi_zt1.png',
                    2:'img/fuwuqi/img_fuwuqi_zt1.png',
                    3:'img/fuwuqi/img_fuwuqi_zt3.png',
                };
                if(data.s < 4){
                    me.ui.nodes.img_zt.setBackGroundImage(c[data.s], 1);
                }else{
                    me.ui.nodes.img_zt.removeBackGroundImage();
                }
            }

            X.cache('_lastServer_', JSON.stringify(data));
            // me.setAllServCache(data);

            G._SOCKET = data.ips;
            G._API = 'http://' + X.arrayRand(data.ipw);

            //G._API = 'http://homm1.legu.cc:6288';
            //G._SOCKET = 'homm1.legu.cc:6287';
            cc.log('setAPI=' + G._API);
            cc.log('setSocket=' + G._SOCKET);
            G.event.emit('setServerData', data);
        },
        setAllServCache: function (data) {
            var me = this;
            if (!data) return;

            cc.log('setAllServCache=' + JSON.stringify(data));
            var arr;
            if (!X.cache('_lastAllServer_')) {
                arr = [].concat(data);
            } else {
                arr = JSON.parse(X.cache('_lastAllServer_'));
                var idx = X.arrayFind(arr, data.sid, 'sid');
                if (idx == -1) {
                    arr.unshift(data);
                } else {
                    if (idx > 0) {
                        arr.splice(idx, 1);
                        arr.unshift(data);
                    }
                }
            }
            me.lastAllSvr1 = arr;
            cc.log('lastAllSvr=' + JSON.stringify(arr));
            X.cache('_lastAllServer_', JSON.stringify(arr));
        },
        sdkInit: function () {
            if (X.cache("ystishi") == 1) {
                jsbHelper.callNative(null,null,{
                    act: 'sdkInit'
                });
            }
        },
        initYsxy:function(){
            var me = this;
            X.ajax.get(X.STR("https://gamemana.legu.cc/index.php?g=admin&m=data&a=privacy_policy&game=zhengba&channel={1}",G.CHANNEL),{},function(txt) {
                var d = X.toJSON(txt);
                me.ysxydata = d;
                if(me.ysxydata.length > 0){
                    if(d.length == 1){
                        me.nodes.panel_yszc.show();
                        me.nodes.panel_yszc1.hide();
                    }else{
                        me.nodes.panel_yszc.hide();
                        me.nodes.panel_yszc1.show();
                    }
                    me.nodes.txt_2.touch(function () {
                        X.ajax.get(me.ysxydata[0].url,{},function(txt2) {
                            G.frame.login_tishi.data({str:txt2,openbtns:me.ysxydata[0].is_need}).show();
                        });
                    });
                    me.nodes.txt2_2.touch(function () {
                        X.ajax.get(me.ysxydata[0].url,{},function(txt2) {
                            G.frame.login_tishi.data({str:txt2,openbtns:me.ysxydata[0].is_need}).show();
                        });
                    });
                    me.nodes.txt2_3.touch(function () {
                        X.ajax.get(me.ysxydata[1].url,{},function(txt2) {
                            G.frame.login_tishi.data({str:txt2,openbtns:me.ysxydata[1].is_need}).show();
                        });
                    });
                    if(me.ysxydata[0].is_first_popup && X.cache("ystishi") != 1){
                        me.ui.setTimeout(function () {
                            me.ui.nodes.txt2_2.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        }, 500);
                    }
                    if(me.ysxydata[0].is_logout){
                        G.frame.setting.is_logout = true;
                    }
                }else{
                    me.nodes.panel_yszc.hide();
                    me.nodes.panel_yszc1.hide();
                }
            });

        },
        onOpen: function () {
            var me = this;

            me._firstRunGame = false; //是否第一次安装
            me._svrGroup = null; //最新的组别标识

            //X.audio.setMusicVolume((X.cache('music') || 50) / 100);
            //X.audio.setEffectsVolume((X.cache('effect') || 50) / 100);
            me.ui.nodes.panel_yszc.setVisible(cc.sys.os == cc.sys.OS_ANDROID && (G.owner == 'blyinghe' || G.owner == 'qilin' || G.owner == 'qlbl' || G.owner == 'jundao' || G.owner == 'jundaobl' || G.owner == 'miquwan3'));
            me.ui.nodes.btn_fxk.setSelected(X.cache("ystishi") == 1);
            me.ui.nodes.btn_fxk.addEventListener(function (sender, type) {
                switch (type) {
                    case ccui.CheckBox.EVENT_UNSELECTED:
                        sender.setSelected(false);
                        X.cache("ystishi", 0);
                        break;
                    case ccui.CheckBox.EVENT_SELECTED:
                        sender.setSelected(true);
                        X.cache("ystishi", 1);
                        me.sdkInit();
                        break;
                }
            });
            me.ui.nodes.btn_fxk1.setSelected(X.cache("ystishi") == 1);
            me.ui.nodes.btn_fxk1.addEventListener(function (sender, type) {
                switch (type) {
                    case ccui.CheckBox.EVENT_UNSELECTED:
                        sender.setSelected(false);
                        X.cache("ystishi", 0);
                        break;
                    case ccui.CheckBox.EVENT_SELECTED:
                        sender.setSelected(true);
                        X.cache("ystishi", 1);
                        me.sdkInit();
                        break;
                }
            });
            me.sdkInit();
            me.initYsxy();
            me.ui.nodes.bg_denglu_qf.setTouchEnabled(true);
            me.ui.nodes.bg_denglu_qf.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (!G.SERVERLIST) {
                        G.tip_NB.show(L('loadingSvrlist'));
                    } else {
                        G.frame.xuanfu.show();
                    }
                }
            });

            me.ui.nodes.btn_gg.click(function () {
                me.ui.nodes.btn_gg.setTouchEnabled(false);
                G.frame.gonggao.data({
                    title: L("GG"),
                    okCall: function () {
                        me.ui.nodes.btn_gg.setTouchEnabled(true);
                        G.frame.gonggao.remove();
                    },
                    richText: L("ZWNR"),
                    autoRemove: true,
                }).show();
            });

            me.ui.nodes.btn_xiufu.click(function(){
                G.frame.alert.data({
                    cancelCall:null,
                    autoClose:false,
                    okCall: function () {
                        me.clearHotUpdate();
                    },
                    sizeType:3,
                    richText:L('REDOWNLOAD')
                }).show();
            });

            me.onInit();
            me.initYsxy();
            G.event.on('loginToLogic', function () {
                me.setAllServCache(me.curServData);
            });

            G.win.start.reCheckVersion();
            var login = function (name, password) {
                if (name.length == 0) {
                    G.tip_NB.show(L('QSRYXYHM'));
                    return;
                }
                var _sid = G.frame.login.lastSvr.sid;
                if(isNaN(_sid))_sid=0;
                G.class.loginfun.doLogin(name, X.time(), '7dd395bfc1c214b9cf64ae50d13bd7ea',_sid, function () {
                    X.cache('name', name);
                    X.cache('password', password);
                    me.remove();
                });
            };

            if ('keyboard' in cc.sys.capabilities) {
                cc.eventManager.addListener({
                    event: cc.EventListener.KEYBOARD,
                    onKeyPressed: function (key, event) {
                        // console.log('key down======', key);
                    },
                    onKeyReleased: function (key, event) {
                        console.log('key up======', key);
                        if (key == '13') {  //enter键
                            if (!G._API) {
                                G.tip_NB.show(L('choosesvrfirst'));
                                return;
                            }
                            me.getLastServer();
                            var name = X.cache('name');
                            var password = X.cache('password');
                            if (!name) {
                                G.frame.login_tk.show();
                            } else {
                                (me._loginLogic || login)(name, password);
                            }
                        }
                    }
                }, me.ui);
            } else {
                console.log('keyboard not support======', 1);
            }
        },
        onInit: function () {
            var me = this;
            me._onInit();
        },
        _onInit: function () {
            //便于diff中复写
            var me = this;
            // var mask_dl = me.ui.finds('mask_dl');
            //me.ui.nodes.text_bb.setString(X.cache('name') || '');

            var login = function (name, password) {
                if (name.length == 0) {
                    G.tip_NB.show(L('QSRYXYHM'));
                    return;
                }
                var _sid = G.frame.login.lastSvr.sid;
                if(isNaN(_sid))_sid=0;
                G.class.loginfun.doLogin(name, X.time(), '7dd395bfc1c214b9cf64ae50d13bd7ea',_sid, function () {
                    X.cache('name', name);
                    X.cache('password', password);
                    me.remove();
                });
            };
            me.ui.nodes.btn_dl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(cc.sys.os == cc.sys.OS_ANDROID && (G.owner == 'blyinghe' || G.owner == 'qilin' || G.owner == 'qlbl' || G.owner == 'jundao' || G.owner == 'miquwan3')){
                        if(X.cache('ystishi') == 0) return G.tip_NB.show(L("YUEDUGOUXUAN"));
                    }
                    sender.setTouchEnabled(false);
                    me.ui.setTimeout(function () {
                        sender.setTouchEnabled(true);
                    }, 3000);
                    //这里的整个方法会在diff中被复写，不要做必要逻辑
                    if (!G._API) {
                        G.tip_NB.show(L('choosesvrfirst'));
                        return;
                    }
                    me.getLastServer(true);
                    var name = X.cache('name');
                    var password = X.cache('password');
                    if (!name) {
                        G.frame.login_tk.show();
                    } else {
                        (me._loginLogic || login)(name, password);
                    }
                }
            });

            me.ui.nodes.btn_ghzh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.login_tk.show();
                }
            });

            me.ui.nodes.txt_2.touch(function () {
                G.frame.login_tishi.show();
            })
        },
        //重置本地的热更新版本文件，并重新检测
        clearHotUpdate : function(){
            var storagePath  = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            cc.log('clearHotUpdate storagePath = ',storagePath);
            var _vm  = storagePath+'version.manifest';
            if(jsb.fileUtils.isFileExist(_vm)){
                jsb.fileUtils.removeFile(_vm);
            }
            var _pm  = storagePath+'project.manifest';
            if(jsb.fileUtils.isFileExist(_pm)){
                jsb.fileUtils.removeFile(_pm);
            }
            var _vm2  = storagePath+'project.manifest.temp.tmp';
            if(jsb.fileUtils.isFileExist(_vm2)){
                jsb.fileUtils.removeFile(_vm2);
            }

            G.frame.alert.data({
                autoClose:false,
                okCall: function () {
                    cc.game.restart();
                },
                sizeType:3,
                richText:'本地补丁文件已清空，请重启游戏'
            }).show();

        },
        onShow: function () {
            var me = this;
			delete G.class.loginfun.otherClientlogin;
            var btn_hh = me.ui.nodes.bg_denglu_qf;
            var btn_gg = me.ui.nodes.btn_gg;
            var ghzh = me.ui.nodes.btn_ghzh;
			if(G.gameName&&G.gameName!="fangzhi"){
				me.ui.finds('Text_1').hide();
			}
			if(G.owner&&G.owner!=='dev'){
                ghzh.hide();
            }
            var btn_dl = me.ui.nodes.btn_dl;
			if (G.serverListUrl == "http://v3.legu.cc/hommdata/?app=serverlist") {
			    G.__quanfugonggaoShowed = true;
            }
            if(cc.sys.os == cc.sys.OS_ANDROID && cc.director.setGameVersion) {
                cc.director.setGameVersion(G.VERSIONCODE);
            }
            if(!G.__quanfugonggaoShowed && !cc.GLOBALTISHEN){
                var lay = me.zhezhao = new ccui.Layout();
                lay.zIndex = 999;
                lay.setContentSize(10000,10000);
                lay.setTouchEnabled(true);
                lay.setName("zhezhao");
                cc.director.getRunningScene().addChild(lay);
            }
            var bg = me.ui.nodes.bg_denglu;
            bg.removeBackGroundImage();

            // G.class.ani.show({
            //     json:'beijing',
            //     addTo:bg,
            //     x:bg.width/2,
            //     y:bg.height/2,
            //     repeat:true,
            //     autoRemove:false,
            //     onload: function(node, action){
            //         X.forEachChild(node,function(node){
            //             var _action = node.getActionByTag(node.getTag());
            //             if(_action)_action.gotoFrameAndPlay(0,true);
            //         });
            //         G.class.ani.show({
            //             json: "ani_denglu",
            //             addTo: node.finds("niutourongqil_2"),
            //             x: 0,
            //             y: 0,
            //             repeat: true,
            //             autoRemove: false,
            //         });
			//
			//
			//
            //     }
            // });
            X.setHeroModel({
                parent: bg,
                data: {},
                model: 'denglu_xin',
                callback: function (node) {
                    node.runAni(0, "animation", true);
                }
            });

            //20190926时更新了登陆动画，为了让所有包都看到动画，需要隐藏LOGO
            //me.ui.finds('logo') && me.ui.finds('logo').hide();
            ////20190926时更新了登陆动画，IOS由读取 img_dltht 这张蒙层图，修改为 img_dltht_20190926
            //如果后续的IOS包需要在提审时候替换登陆图的话，需要覆盖 img_dltht_20190926
            //20191210时为了兼容android能换登录图，去掉ios的判断
            if (cc.sys.isNative) {
                var gamelogo1 = new cc.Sprite('img/bg/img_dltht_20190926.png');
                gamelogo1.x = bg.width/2;
                gamelogo1.y = bg.height/2;
                gamelogo1.zIndex = 2;
                gamelogo1.setAnchorPoint(cc.p(0.5,0.5));
                bg.addChild(gamelogo1);
            }

            X.audio.playMusic('sound/denglu.mp3', true);
            var _music = X.cache('music');
            if(_music==null|| isNaN(_music) || _music==""){
                _music=20;
            }else{
                _music = _music*1;
            }
            X.audio.setMusicVolume(_music / 100);

            var _effect = X.cache('effect');
            if(_effect==null|| isNaN(_effect) || _effect==""){
                _effect=60;
            }else{
                _effect = _effect*1;
            }
            X.audio.setEffectsVolume(_effect / 100);

            if (X.cache('_lastServer_')) {
                var s = JSON.parse(X.cache('_lastServer_'));
                if (cc.isArray(s)) {
                    X.cache('_lastServer_', '');
                }
            }
            me.getLastServer();
            me.getSvrList();

            me.loadPreRes();
            me.emit('loginAniOvered');

			if(G.gameLogo&&G.gameLogo!=""){
				me.ui.finds('logo').setBackGroundImage(G.gameLogo,0);
                me.ui.finds('logo').scale = 0.5;  //外网的包，logo都是比较大的，为了兼容外网包，这里对自定义过的logo缩放，以后新打的包，也维持logo尺寸和原来的需求一样大，代码里会统一缩小
			}else{
				me.ui.finds('logo').setBackGroundImage('img/logo.png',0);
			}


            if(G.TiShening == 'fangzhizhengba1107'){
                me.ui.finds('logo').setBackGroundImage('img/logo_buluoshilian.png',0);
                me.ui.finds('logo').scale = 0.5;
            }

            if (G.CHANNEL == "fzyztios_lg" && G.owner == 'leguios') {
                me.ui.finds('logo').setBackGroundImage("img/logo_ios.png");
                me.ui.finds('logo').scale = 0.22;
            }

            me.ui.setTimeout(function () {
                cc.log('me.lastSvr===',me.lastSvr);
				if(me.lastSvr.sid == '14560'){
					G.appleDad = true;
				}
                if(me.lastSvr && (me.lastSvr.sid == '70' || me.lastSvr.sid == '4950' || me.lastSvr.sid == '14560') ){
					me.ui.nodes.btn_gg.hide();
                    me.ui.nodes.btn_xiufu.hide();
					return; //提审服不弹公告
				}
                if((me.ysxydata && me.ysxydata.length > 0 && me.ysxydata[0].is_first_popup) && X.cache("ystishi") != 1){

                }else{
                    G.frame.gonggao.data({
                        okCall: function () {
                            G.frame.gonggao.remove();
                        }
                    }).checkShow(function () {

                    });
                }
            },1000);
            me.ui.setTimeout(function(){
                cc.isNode(me.zhezhao) && me.zhezhao.removeFromParent();
            },3000);

            G.VERSION && G.VERSIONCODE && me.ui.finds('txt_bb').setString(G.VERSION+'.'+G.VERSIONCODE);

            if(G.banhaoText && G.banhaoText != ""){
                me.ui.finds("Text_1").setString(G.banhaoText);
                me.ui.finds("Text_1").setFontSize(13);
            }

            cc.log('cc.GLOBALTISHEN===',cc.GLOBALTISHEN);

            if(G.tiShenIng) {
                me.nodes.btn_gg.hide();
            }
            if(cc.GLOBALTISHEN){
                //如果是特殊的提审服，则不显示登陆界面，直接进游戏
                //me.ui.hide();
                G.event.once('setServerData', function(){
                    me.ui.nodes.btn_dl.triggerTouch(ccui.Widget.TOUCH_ENDED);
                });
            }
            if (G.CHANNEL == 'jqblzh123appstore') {
                me.ui.finds('logo').scale = 0.40;
            }
            if (G.CHANNEL == 'bl_huawei') {
                me.ui.finds('logo').scale = 1;
            }

        },
        onRemove: function () {
            var me = this;
        },
        loadPreRes: function () {
            var me = this;

            X.loadPlist([
                'public.png','public.plist','public_ico.png','public_ico.plist','title_wz.plist','title_wz.png',
                'tujing.plist', 'tujing.png','public2.png','public2.plist',
                "plist_qizhi.png","plist_qizhi.plist","public3.png","public3.plist"
            ]);
        }
    });

    G.frame[ID] = new fun('denglu.json', ID);
    G.previewSkillAni = function (name, repeat) {
        var me = G.frame.login;
        if (!me._previewSkillAniMask) {
            me._previewSkillAniMask = new ccui.Layout();
            me._previewSkillAniMask.setContentSize(C.WS);
            me._previewSkillAniMask.setTouchEnabled(true);
            me._previewSkillAniMask.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            me._previewSkillAniMask.setBackGroundColor(cc.color('#000000'));
            me.ui.addChild(me._previewSkillAniMask);
        }
        me._previewSkillAniMask.removeAllChildren(true);
        me._previewSkillAniMask.show();
        G.class.ani.show({
            json: name,
            addTo: me._previewSkillAniMask,
            x: me._previewSkillAniMask.width / 2,
            y: me._previewSkillAniMask.height / 2,
            repeat: repeat,
            autoRemove: !repeat,
            cache: false,
            onend: function (node, action) {
                if (!repeat) {
                    me._previewSkillAniMask.hide();
                    node.removeFromParent(true);
                }
            }
        });
    }
})();
