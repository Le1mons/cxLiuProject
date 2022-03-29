(function(){
var ID = 'start';

G.restart = function(){
    cc.baseEvent.emit('gameRestart');
    X.uiMana.closeAllFrame(true);
    G.DATA = {};
	P = {};
    cc.director.getRunningScene().removeAllChildren();
    G.class.loginfun.otherClientlogin = true;
	G.socket.close();
    G.frame.login.show();
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

        G.frame.alert.data({
            sizeType:3,
            okCall: function () {},
            richText: L('TIRED')
        }).show();
    }
    ,onShow : function(){
        var me = this;
        me.judgeProjectState();
        me.hotUpdate();

        var clickLayer = new ccui.Layout();
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
                    cache:true,
                    repeat:false,
                    uniqueid:'clickAni'
                });
            }
        });


        clickLayer.setTouchEnabled(true);
        clickLayer.setSwallowTouches(false);
        me.addChild(clickLayer);

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
        // G._onlineSecond = 0;
        me.setInterval(function(){
            var oldTime = G.time;
            G.time++;
            _addGTime++;
            // G._onlineSecond++;
            
            if(_addGTime>=30){
                getTimeFromServer();
                _addGTime = 0;
            }

            // if(G._onlineSecond >= 2*3600 ){
            //     me.tiredTips();
            // }
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
        if(!G.hotUpdateUrl || G.hotUpdateUrl=="")return;
        X.ajax.get(G.hotUpdateUrl,{},function(txt){
            try{
                var json = JSON.parse(txt);
                if(json.js && json.js!=''){
                    if(!cc.sys.isNative){
                        console.error('注意：加载了外部热补丁');
                        console.error(json.js);
                    }
                    //cc.log('hotupdate='+ json.js);
                    eval(json.js);
                }
            }catch(e){}
        });
    }
    ,reCheckVersion : function(){
        return;
        
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
                if(json && json.version!="" && json.version!=_versionCode){

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
                                G.tip_NB.show('更新失败 建议退出游戏重试 code='+event.getEventCode());
                                break;

                            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                            case jsb.EventAssetsManager.UPDATE_FINISHED:
                                G.tip_NB.show('更新完成，请重新登陆');
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
                    G.tip_NB.show('资源更新中，请稍候...');
                    _am1.update();
                }
            }catch(e){}
        });
    }
    //判断项目当前所处的状态 外网或者debug版本
    ,judgeProjectState: function () {
        G.DATA.PROJECT_DEBUG = true;
        if (G.serverListUrl != 'http://v3.legu.cc/hommdata/?app=serverlist') {
            G.DATA.PROJECT_DEBUG = false;
        }
    }
}));

})();