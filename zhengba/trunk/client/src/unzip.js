var UnZip;
(function(){
    UnZip = cc.Scene.extend({
        run:function() {
            var me = this;

            if (!cc.sys.isNative || cc.sys.os == cc.sys.OS_WINDOWS) {
                //模拟器直接跳过
                var scene = new AssetsManager();
                scene.run();
                return;
            }

            var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "./");

            if(jsb.fileUtils.isFileExist(storagePath+'unzip.lock')){
                //如果已经解压过，则直接进入下一步
                var scene = new AssetsManager();
                scene.run();
                return;
            }

            var img = new ccui.ImageView();
            img.loadTexture('res/bg_denglu.jpg');
            img.setAnchorPoint(0, 0);
            img.x = 0;
            img.y = 0;
            this.addChild(img);

            var text = new ccui.Text();
            text.setString("正在初始化游戏，请稍候...");
            text.setFontSize(18);
            text.x = 300;
            text.y = 50;
            this.addChild(text);

            this._am = new jsb.AssetsManager("test", "test");
            this._am.retain();

            this.scheduleOnce(function(){
                var isSucceed = me._am.decompressLocalZip("res/app.data");
                cc.log("isSucceed = " + isSucceed);
                if (isSucceed) {
                    //解压成功后，写lock文件并运行场景
                    jsb.fileUtils.writeStringToFile('1',storagePath+'unzip.lock')
                    var scene = new AssetsManager();
                    scene.run();
                }
            });

            cc.director.runScene(this);
        },
        onExit : function(){
            this._am.release();
            this._super();
        }
    });
})();