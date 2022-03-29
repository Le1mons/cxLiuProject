/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'newchapter';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.fucuan.setTouchEnabled(false);
            me.nodes.xuanzhong.click(function () {
                if(!X.cacheByUid("newchapter") || !X.cacheByUid("newchapter").state){
                    var data = {};
                    data.time = X.timetostr(G.time,"y-m-d");
                    data.state = 1;
                    X.cacheByUid("newchapter", data);
                    me.nodes.fucuan.selected = true;
                }else {
                    var data = {};
                    data.time = X.timetostr(G.time,"y-m-d");
                    data.state = 0;
                    X.cacheByUid("newchapter", data);
                    me.nodes.fucuan.selected = false;
                }
            });
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            me.nodes.panel.removeBackGroundImage();
            me.nodes.panel.setBackGroundImage('img/zhangjie/' + me.DATA.bg + ".png",0);
            me.ui.finds('wenzishuoming').setString(me.DATA.intr);
        },
    });
    G.frame[ID] = new fun('zhangjie.json', ID);
})();