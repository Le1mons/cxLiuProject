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
                me.ui.setTimeout(function () {
                    me.getSvrList();
                }, 1500);
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
        onOpen: function () {
            var me = this;

            me._firstRunGame = false; //是否第一次安装
            me._svrGroup = null; //最新的组别标识

            //X.audio.setMusicVolume((X.cache('music') || 50) / 100);
            //X.audio.setEffectsVolume((X.cache('effect') || 50) / 100);

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

            me.onInit();

            G.event.on('loginToLogic', function () {
                me.setAllServCache(me.curServData);
            });

            //G.win.start.reCheckVersion();
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


        },
        onShow: function () {
            var me = this;

			delete G.class.loginfun.otherClientlogin;

            var btn_hh = me.ui.nodes.bg_denglu_qf;
            var btn_gg = me.ui.nodes.btn_gg;
            var ghzh = me.ui.nodes.btn_ghzh;
			//me.ui.nodes.mask.setBackGroundImage('img/bg.png',0);
			if(G.gameName&&G.gameName!="fangzhi"){
				me.ui.finds('Text_1').hide();
			}

			if(G.owner&&G.owner!=='dev'){
				ghzh.hide();
			}
            var btn_dl = me.ui.nodes.btn_dl;
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
			
			/*
            if(G.gameName=='fangzhifengbao') {
                X.spine.show({
                    json: "spine/denglu_shui.json",
                    addTo: bg,
                    x: bg.width / 2,
                    y: bg.height / 2,
                    z: 0,
                    cache: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.stopAllAni();
                        node.setTimeScale(1);
                        node.opacity = 255;
                        node.runAni(0, "animation", true);
                    }
                });
            } else {
				*/
                X.spine.show({
                    json: "spine/denglu_xinnian.json",
                    addTo: bg,
                    x: bg.width / 2,
                    y: bg.height / 2,
                    z: 0,
                    cache: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.stopAllAni();
                        node.setTimeScale(1);
                        node.opacity = 255;
                        node.runAni(0, "animation", true);
                    }
                });
            //}

            X.audio.playMusic('sound/denglu.mp3', true);
            //初始化声音和音效的音量
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
			}else{
				me.ui.finds('logo').setBackGroundImage('img/logo.png',0);
			}


            //IOS已经过审了的包，需要换LOGO，为了避免logo热更覆盖到其他游戏，单独重置该包
            if(G.TiShening == 'fangzhizhengba1107'){
                me.ui.finds('logo').setBackGroundImage('img/logo_buluoshilian.png',0);
                //me.ui.finds('mask$').setBackGroundImage('_nopic_.png',0);
                //me.ui.finds('panel_dltm').setBackGroundImage('_nopic_.png',0);
            }
			
			/*
            if(G.TiShening == 'chuangtayinngxiong1211'){
                me.ui.finds('logo').hide();//setBackGroundImage('img/logo_chuangta.png',0);
                me.ui.finds('mask$').setBackGroundImage('img/bg/bg_ctyx.jpg',0);
                me.ui.finds('panel_dltm').setBackGroundImage('img/bg/bg_ctyx.jpg',0);
            }
			*/

            me.ui.setTimeout(function () {
                cc.log('me.lastSvr===',me.lastSvr);
                if(me.lastSvr && me.lastSvr.sid == '70')return; //提审服不弹公告
                G.frame.gonggao.data({
                    okCall: function () {
                        G.frame.gonggao.remove();
                    }
                }).checkShow(function(){
                    cc.isNode(me.zhezhao) && me.zhezhao.removeFromParent();
                });
            },1000);
            me.ui.setTimeout(function(){
                !G.frame.gonggao.isShow && cc.isNode(me.zhezhao) && me.zhezhao.removeFromParent();
            },3000);

            G.VERSION && G.VERSIONCODE && me.ui.finds('txt_bb').setString(G.VERSION+'.'+G.VERSIONCODE);

            if(G.banHaoText && G.banHaoText != ""){
                me.ui.finds("Text_1").setString(G.banHaoText);
            }

            cc.log('cc.GLOBALTISHEN===',cc.GLOBALTISHEN);
            if(cc.GLOBALTISHEN){
                //如果是特殊的提审服，则不显示登陆界面，直接进游戏
                //me.ui.hide();
                G.event.once('setServerData', function(){
                    me.ui.nodes.btn_dl.triggerTouch(ccui.Widget.TOUCH_ENDED);
                });
            }
        },
        onRemove: function () {
            var me = this;
        },
        loadPreRes: function () {
            var me = this;

            X.loadPlist([
                'public.png','public.plist','public_ico.png','public_ico.plist','title_wz.plist','title_wz.png',
                'zhenfa.plist', 'zhenfa.png', 'tujing.plist', 'tujing.png','public2.png','public2.plist',
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
