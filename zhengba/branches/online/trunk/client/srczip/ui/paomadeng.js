
(function () {
    //跑马灯
    var ID = 'paomadeng';

    var fun = X.bUi.extend({
        ctor: function(json,id){
            this.preLoadRes = ['public2.plist','public2.png'];
            this._super(json,id);
            this.modalFrame = true;
        },
        onShow: function () {
            this.fillSize();
        },
        onRemove: function () {
        },
        onOpen : function(){
            var me = this;
            me.initUI();
            me.goToTop();
        },
        initUI: function () {
            var me = this;
            me.ui_paomadeng = me.ui.finds('paomadeng');
            me.ui_background = me.ui_paomadeng.finds('tu');
            G.event.emit("paomadengOver");

        },
        scrollMessage: function (d) {
            if(!G.frame.paomadeng.isShow){
                G.frame.paomadeng.show();
            }
            this._allMessage = [].concat(this._allMessage || [],d);

            if (!this._showMessageRunning){
                this._scrollMessage();
                var img = new ccui.ImageView('img/public/bg_paomadeng.png',1)
                img.setAnchorPoint(0,1);
                img.setPosition(-35,this.ui_background.height-6);
                this.ui_background.removeAllChildren();
                this.ui_background.addChild(img);
            }
        },
        _scrollMessage: function () {
            var me = this;
            var w = 640;
            if (!this._allMessage || this._allMessage.length == 0) {
                return;
            }else{
                me.ui_paomadeng.show();
            }
            this._lastOne = false;
            this._showMessageRunning = true;

            var msg = this._allMessage.shift();
            var item = G.frame.liaotian.createItem(msg);
            var width = item.getContentSize().width;
            //me.ui_paomadeng.find('wz').addChild(item);
            me.ui_paomadeng.getChildren()[1].addChild(item);
            item.setPositionX(w);

            item.runActions([
                cc.moveTo((width + w/2)/100,cc.p(w/2 - width,0)),
                cc.callFunc (function () {
                me._lastOne = true;
                me._scrollMessage();
                }),
                cc.moveTo((w/2 + 10)/100,cc.p(-width - 50,0)),
                cc.callFunc (function () {
                    if (me._lastOne){
                        me.ui_paomadeng.hide();
                        //me.ui_paomadeng.find('wz').removeAllChildren();
                        me.ui_paomadeng.getChildren()[1].removeAllChildren();
                        delete me._showMessageRunning;
                        delete me._lastOne;
                    }
                }
            )]);

            // item.moveTo((width + w/2)/100,cc.p(w/2 - width,0)).then(function () {
            //     me._lastOne = true;
            //     me._scrollMessage();
            // }).moveTo((w/2 + 10)/100,cc.p(-width - 50,0)).then(function () {
            //     if (me._lastOne){
            //         me.ui_paomadeng.hide();
            //         //me.ui_paomadeng.find('wz').removeAllChildren();
            //         me.ui_paomadeng.getChildren()[1].removeAllChildren();
            //         delete me._showMessageRunning;
            //         delete me._lastOne;
            //     }
            // }).run();
        },
        onAniShow:function() {
            var me = this;

        }
    });

    G.frame[ID] = new fun('paomadeng.json', ID);
})();