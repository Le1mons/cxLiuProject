var AssetsManager;
(function(){
    AssetsManager = cc.Scene.extend({
        _failCount : 0,
        _am:null,
        _progress:null,
        _percent:0,
        _percentByFile:0,

        run:function(){
            var me = this;
				
            if (!cc.sys.isNative) {
                this.loadGame();
                return;
            }

            var storagePath  = me.storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");
            jsb.fileUtils.addSearchPath(storagePath);

            cc.loader.resPath = "res";
            var node = ccs.CSLoader.createNode('loading.csb');
            this.ui = node;
            this.addChild(this.ui);
            ccui.helper.doLayout(this.ui);

            var text = ccui.helper.seekWidgetByName(this.ui,'txt_loading_jdt$'),
                jdt = ccui.helper.seekWidgetByName(this.ui,'img_loading_jdt$');
			var bgimg = ccui.helper.seekWidgetByName(this.ui,'bg_denglu$');
            text.setString('正在检查资源版本...');
			bgimg.setBackGroundImage('img/bg/bg_denglu.jpg', 0);

            //清空临时文件
            var projectTemp  = storagePath+'project.manifest.temp.tmp';
            if(jsb.fileUtils.isFileExist(projectTemp)){
                jsb.fileUtils.removeFile(projectTemp);
            }

            var versionTemp  = storagePath+'version.manifest.temp.tmp';
            if(jsb.fileUtils.isFileExist(versionTemp)){
                jsb.fileUtils.removeFile(versionTemp);
            }

            this._am = new jsb.AssetsManager("res/_project.manifest", storagePath);
            this._am.retain();

            if (!this._am.getLocalManifest().isLoaded()){
                cc.log("Fail to update assets, step skipped.");
                this.loadGame();
            }else{
                var listener = new jsb.EventListenerAssetsManager(this._am, function(event) {
                    cc.log('event.getEventCode='+event.getEventCode());

                    switch (event.getEventCode()){
                        //event.getAssetId() event.getMessage()
                        case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                            //有新版本
                            me.needUpdate && me.needUpdate();
                            break;
                        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST://本地文件有问题
                        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST://下载外网manifest错误
                        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST://解析外网manifest错误
                        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE://已经是最新版
                        case jsb.EventAssetsManager.UPDATE_FINISHED://更新完成
                        case jsb.EventAssetsManager.ERROR_UPDATING://更新错误
                        case jsb.EventAssetsManager.ERROR_DECOMPRESS://解压错误
                            me.loadGame();
                            break;
                        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                            me._percent = event.getPercent();
                            me._percentByFile = event.getPercentByFile();
                            if(me._percent*1>0){
                                jdt.setPercent(parseInt(me._percent));
                                text.setString('正在更新资源('+ parseInt(me._percent) +'%)');
                            }
                            break;
                        case jsb.EventAssetsManager.UPDATE_FAILED:
                            me._failCount++;
                            if (me._failCount < 5){
                                me._am.downloadFailedAssets();//重试
                            }else{
                                me._failCount=0;
                                me.loadGame();
                            }
                            break;
                        default:
                            break;
                    }
                });
                cc.eventManager.addListener(listener, 1);
                this._am.update();
                cc.director.runScene(this);
            }
        },
        needUpdate : function(){
            var me = this;
			return;
            if(!me._hasTips){
                me._hasTips = true;
                me._am.update();
                //me.alert();
            }
        },
        loadGame:function(){
            var me = this;
            cc.loader.loadJs(["src/game.min.js"], function(err){
                C.init();
                C.WS = C.D.getWinSize();
                cc.director.runScene(GameScene);
            });
        },
        onExit:function(){
            this._am.release();
            this._super();
        }
    });
})();