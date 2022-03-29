/**
 * Created by lsm on 2018/6/25.
 */
(function () {
    //跑马灯

    G.class.paomadeng = X.bView.extend({
        ctor: function(){
            var me = this;
            me._super("flashy.json", null);
            me.preLoadRes = ['public2.plist','public2.png'];
            G.view.paomadeng = me;
        },
        onShow: function () {
            this.fillSize();
        },
        onRemove: function () {
            if(G.frame.chat && G.frame.chat.timer){
                delete G.frame.chat.timer;
            }
        },
        onOpen : function(){
            var me = this;
            me.initUI();
        },
        initUI: function () {
            var me = this;
            me.ui_paomadeng = me.nodes.txt_flashy;
            me.ui_background = me.ui.finds('wz_bg_flashy');
            G.event.emit("paomadengOver");
        },
        scrollMessage: function (d) {
            if(!cc.isNode(G.view.toper)){
                new G.class.paomadeng();
                cc.director.getRunningScene().addChild(G.view.paomadeng, 999);
            }
            this._allMessage = [].concat(this._allMessage || [],d);

            if (!this._showMessageRunning){
                this._scrollMessage();
                // var img = new ccui.ImageView('img/public/bg_paomadeng.png',1)
                // img.setAnchorPoint(0,1);
                // img.setPosition(-35,this.ui_background.height-6);
                // this.ui_background.removeAllChildren();
                // this.ui_background.addChild(img);
            }
        },
        _scrollMessage: function () {
            var me = this;
            var w = 640;
            if (!this._allMessage || this._allMessage.length == 0 || !cc.isNode(me.ui_background) ) {
                return;
            }else{
                me.ui_background.show();
            }
            this._lastOne = false;
            this._showMessageRunning = true;

            var msg = this._allMessage.shift();
            var item = G.frame.liaotian.createItem(msg);
            var width = item.getContentSize().width;
            me.ui_paomadeng.addChild(item);
            item.setPositionX(w);
            item.setPositionY(-20);
            item.runActions([
                cc.moveTo((width + w / 2) / 100, cc.p(w / 2 - width, -20)),
                cc.callFunc (function () {
                me._lastOne = true;
                me._scrollMessage();
                }),
                cc.moveTo((w / 2 + 10) / 100, cc.p(-width - 50, -20)),
                cc.callFunc (function () {
                    if (me._lastOne){
                        me.ui_background.hide();
                        me.ui_paomadeng.removeAllChildren();
                        delete me._showMessageRunning;
                        delete me._lastOne;
                        G.view.paomadeng.removeFromParent(true);
                        delete G.view.paomadeng;
                    }
                }
            )]);
        },
        onAniShow:function() {
            var me = this;

        }
    });
})();