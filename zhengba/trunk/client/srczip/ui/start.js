(function(){
var ID = 'start';

G.restart = function(){
    cc.baseEvent.emit('gameRestart');
    X.uiMana.closeAllFrame(true, null, true);
    G.DATA = {};
	P = {};
    cc.director.getRunningScene().removeAllChildren();
    G.guidevent.removeAllListeners();
    //jsbHelper.event.removeAllListeners('cbLogin');
    G.win.start._addClickView();
    G.class.loginfun.otherClientlogin = true;
    G.socket.close();
    
    if(G.CHANNEL && G.CHANNEL == 'ayzh_yw') {
        setTimeout(function(){
            G.frame.login.show();
        },500);
    }else{
        G.frame.login.show();
    }

    if (G.clickView && G.clickView.timer) cc.clearTimer(G.clickView, G.clickView.timer);
    G.event.emit("sdkevent", {
        event: "quitGame"
    });
};


G.event.on('ajaxMaxError',function(){
    G.frame.alert.data({
        cancelCall: null,
        okCall: function () {
            G.restart();
        },
        richText: L('ajaxMaxError'),
        sizeType:3
    }).show();
});

X.checkSkinDueTime = function() {//限时皮肤计时删除
    if (G.DATA.skinRmoveTo) return;
    var allSkinData = G.DATA.skin.list;
    var skinIdArr = [];

    for (var i in allSkinData) {
        if (allSkinData[i].expire > 0) skinIdArr.push(allSkinData[i]);
    }

    skinIdArr.sort(function (a, b) {

        return a.expire < b.expire ? -1 : 1;
    });

    if (skinIdArr.length < 1) {
        if (G.clickView.timer) cc.clearTimer(G.clickView, G.clickView.timer);
    } else {
        G.DATA.skinRmoveTo = true;
        var skinTid = skinIdArr[0].tid;
        var toTime = skinIdArr[0].expire;
        var needTime = toTime - G.time;


        G.clickView.timer = G.clickView.setTimeout(function () {
            G.ajax.send("skin_remove", [skinTid], function (data) {
                if (!data) return;
                var data = JSON.parse(data);
                if (data.s == 1) {
                    G.DATA.skinRmoveTo = false;
                    X.checkSkinDueTime();
                }
            });
        }, needTime * 1000);
    }
};

G.win[ID] = GameScene = new (X.bScene.extend({
    ctor: function(){
        G.event.emit('cocosReady');
        this._super();
        //this.on('create',function(){
        //  alert('window.create')
        //})
        //
        //this.on('created',function(){
        //  alert('window.created')
        //})
        //
        //this.on('close',function(){
        //  /alert('window.close')
        //})
        
    }
    ,tiredTips : function(){
        var me = this;
        G._onlineSecond = 0;

        // G.frame.alert.data({
        //     sizeType:3,
        //     okCall: function () {
        //         if (!G.frame.login.isShow) {
        //             jsbHelper.callNative(null, null, {
        //                 act: 'logout'
        //             });
        //             G.restart();
        //         }
        //     },
        //     richText: L('TIRED')
        // }).show();
        if (!G.frame.login.isShow) {
            jsbHelper.callNative(null, null, {
                act: 'logout'
            });
            G.restart();
        }
        G.tip_NB.show('您被验证为未成年用户，已受到游戏防沉迷系统限制。');
    },
    _addClickView : function(){
        var me = this;
        var clickLayer = G.clickView = new ccui.Layout();
        clickLayer.setContentSize(cc.director.getWinSize());
        clickLayer.zIndex = 999999;
        var clickAni;
        clickLayer.touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_BEGAN){
                var pos = sender.getTouchBeganPosition();
                G.class.ani.show({
                    json:'ani_dianji',
                    x:pos.x,
                    y:pos.y,
                    addTo:sender,
                    repeat:false,
                    uniqueid:'clickAni',
                    cache: true
                });
            }
        });


        clickLayer.setTouchEnabled(true);
        clickLayer.setSwallowTouches(false);
        me.addChild(clickLayer);
    }
    ,onShow : function(){
        var me = this;
        me.judgeProjectState();
        me.hotUpdate();
        me._addClickView();

        //android监听返回键======
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyReleased: function(keyCode, event) {
                if (keyCode == cc.KEY.back) {
                    //if(!G.view.mainView.visible) {
                    //    X.uiMana.closeAllFrame();
                    //}else {
                        var now = X.time();
                        if(G.__SHOWTIME && now - G.__SHOWTIME < 2)return;
                        jsbHelper.callNative(null,null,{
                            act:'willExit'
                        });
                    //}
                }
            }
        }, me);
        jsbHelper.event.on('cbWillExit',function(data){
            G.frame.alert.data({
                sizeType:3,
                ok:{wz:L('BTN_CANCEL')},
                okCall:null,
                cancel:{wz:L('BTN_OK')},
                cancelCall:function() {
                    jsbHelper.callNative(null,null,{
                        act:'exit'
                    });
                },
                zIndex:100005,
                richText:L('EXITGAME')
            }).show();
        });
        //====End android监听返回键

        //进入后台
//      cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function(event){
//          G.__HIDETIME = X.time();
//          cc.log("GAMEHIDE="+G.__HIDETIME);
//      });
        //恢复显示
//      cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function(event){
//          var now = X.time();
//          G.__SHOWTIME = now;
//          cc.log("GAMESHOW="+G.__HIDETIME+""+now);
//          if(P.gud && G.__HIDETIME  && now - G.__HIDETIME > 30){
//              /*X.uiMana.closeAllFrame();
//              G.view.mainMenu.remove();
//              G.view.toper.remove();
//
//              G.frame.preload.show('reconn');
//              G.class.loginfun.reDoLogin(function(){
//                  getTimeFromServer();
//              });*/
//          }
//          delete G.__HIDETIME;
//      });

        
        if (globalWindow.setGlobalFont){
            setGlobalFont("Youyuan.TTF");
        }

        //G.frame.story.once('close',function(){
            G.frame.preload.show('loadres',function(){
                this.show('loadJSON',function(){
                    this.show('loadView',function(){
                        G.event.once('loginOver', function () {
                            /*
                            cc.loader.load(['public1.plist','public1.png','ico_tianfu.plist','ico_tianfu.png'],function (result, count, loadedCount) {
                                
                            },function(){
                                cc.spriteFrameCache.addSpriteFrames('public1.plist');
                                cc.spriteFrameCache.addSpriteFrames('ico_tianfu.plist');
                            });
                            */
                            // X.loadPlist([
                            //     'public.png','public.plist','public_ico.png','public_ico.plist','title_wz.plist','title_wz.png',
                            //     'zhenfa.plist', 'zhenfa.png', 'tujing.plist', 'tujing.png','public2.png','public2.plist',
                            // ]);
                        });

                        // cc.spriteFrameCache.addSpriteFrames('public_ico.plist');
                        G.frame.preload.remove();
                        G.frame.login.show();
                    });
                });
            });
        //}).show();

        //开始和服务器对时
        G.time = X.time();
        var funToEvent = {
            getMinutes:'minuteChange',
            getHours:'hourChange',
            getDate:'dayChange'
        };
        var _addGTime=0;
         G._onlineSecond = 0;
        me.setInterval(function(){
            var oldTime = G.time;
            G.time++;
            _addGTime++;
            G._onlineSecond++;
            
            if(_addGTime>=30){
                getTimeFromServer();
                _addGTime = 0;
            }

            if(G._onlineSecond >= 3600 && cc.sys.os == cc.sys.OS_ANDROID && !G.isRealName){//
                me.tiredTips();
            }
            // cc.log('onlineSecond=',G._onlineSecond);

            //广播-每秒
            // G.event.emit('timeChange', G.time);

            var oldDay = new Date(oldTime * 1000);
            var newDay = new Date(G.time * 1000);
            for(var k in funToEvent) {
                if (oldDay[k]() != newDay[k]()) {
                    try{
                        G.event.emit(funToEvent[k], {o:oldDay,n:newDay});
                    }catch(e){}
                }
            }
        },1000);

        function getTimeFromServer(){
            if(G._API && G.ajax){
                G.ajax.send('user_ping',[],function(data){
                    data = X.toJSON(data);
                    if (data.s == 1) {
                        G.time = data.d * 1;
                    }
                });
            }
            if(G._SOCKET && G.socket){
                G.socket.send('ping');
            }
        }
        getTimeFromServer();
        me.getTimeFromServer = getTimeFromServer;
    },
    hotUpdate : function(){
        var me = this;
        if(me._reHotUpTimer){
            cc.director.getRunningScene().clearTimeout(me._reHotUpTimer);
            delete me._reHotUpTimer;
        }
        if(!G.hotUpdateUrl || G.hotUpdateUrl=="")return;
        X.ajax.get(G.hotUpdateUrl,{},function(txt){
            try{
                var json = JSON.parse(txt);
                if(json.js && json.js!=''){
                    if(!cc.sys.isNative){
                        console.error('注意：加载了外部热补丁');
                        console.error(json.js);
                    }
                    eval(json.js);
                }
            }catch(e){
                me._reHotUpTimer = cc.director.getRunningScene().setTimeout(function(){
                    me.hotUpdate && me.hotUpdate();
                },5000);
            }
        },function(){
            me._reHotUpTimer = cc.director.getRunningScene().setTimeout(function(){
                me.hotUpdate && me.hotUpdate();
            },5000);
        });
    }
    ,reCheckVersion : function(){
        cc.log('reCheckVersion....');
        if(!cc.sys.isNative)return;
        if(cc.sys.os==cc.sys.OS_WINDOWS)return;

        //防止cocos版本检验机制出现未知异常导致拉不到热更包，在登陆界面的时候，再次校验版本号
        var storagePath  = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
        var _am = new jsb.AssetsManager("res/_project.manifest", storagePath);
        
        var _versionCode = G.VERSIONCODE;
        var versionFileUrl = _am.getLocalManifest().getVersionFileUrl();
        if(!versionFileUrl || versionFileUrl=="")return;
        versionFileUrl += '&act=recheckversion&clientver='+ _versionCode;  //前面需要补上前缀99
        cc.log('versionFileUrl',versionFileUrl);
        if(versionFileUrl.indexOf('10.0.0.5')!=-1)return;

        X.ajax.get(versionFileUrl,{},function(txt){
            try{
                cc.log('reCheckVersion return',txt);
                var json = JSON.parse(txt);
                if(json && json.version!="" && json.version*1 > _versionCode*1 + 10){ //如果线上版本号，比本地版本号>10个以上时，强制更新一次（预留10个版本号作为只更新资源，不提版本号的空间）

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

                    var _am1 = new jsb.AssetsManager("res/_project.manifest", storagePath);
                    _am1.retain();
                    var listener = new jsb.EventListenerAssetsManager(_am1, function(event) {

                        switch (event.getEventCode()){
                            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                                break;
                            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                            case jsb.EventAssetsManager.ERROR_UPDATING:
                            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                                G.tip_NB.show('更新失败 code='+event.getEventCode());
                                break;

                            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                            case jsb.EventAssetsManager.UPDATE_FINISHED:
                                G.tip_NB.show('更新完成，即将自动重启');
                                cc.director.getRunningScene().setTimeout(function(){
                                    cc.game.restart();
                                },1000);
                                break;

                            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                                break;
                            case jsb.EventAssetsManager.UPDATE_FAILED:
                                G.tip_NB.show('更新失败 '+event.getEventCode());
                                break;
                            default:
                                break;
                        }
                    });

                    cc.eventManager.addListener(listener, 1);
                    _am1.update();

                    var node = new ccui.Text();
                    node.setString('正在更新中，请稍候...');
                    node.boundingWidth = 640;
                    node.textAlign = cc.TEXT_ALIGNMENT_CENTER;
                    node.zIndex = 210000000;
                    node.color = cc.color('#ffffff');
                    node.y = 500;
                    node.x = 320;
                    node.fontSize = 35;
                    cc.sys.isObjectValid(G.frame.login.ui) && G.frame.login.ui.addChild(node);
                }
            }catch(e){}
        });
    }
    //判断项目当前所处的状态 外网或者debug版本
    ,judgeProjectState: function () {
        G.DATA.PROJECT_DEBUG = true;
        G.isWaiWang = false;
        if (G.serverListUrl != 'http://v3.legu.cc/hommdata/?app=serverlist') {
            G.DATA.PROJECT_DEBUG = false;
            G.isWaiWang = true;
        }
    }
}));

})();