//
/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-扫荡
    var ID = 'shiyuanzhanchang_sd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = me.DATA.conf;
            me.nodes.panel_wp1.removeAllChildren();
            me.nodes.panel_wp2.removeAllChildren();
            var wid1 = G.class.sitem(conf.shoudong[0]);
            wid1.setPosition(me.nodes.panel_wp1.width/2,me.nodes.panel_wp1.height/2);
            G.frame.iteminfo.showItemInfo(wid1);
            me.nodes.panel_wp1.addChild(wid1);

            var wid2 = G.class.sitem(conf.saodang[0]);
            wid2.setPosition(me.nodes.panel_wp2.width/2,me.nodes.panel_wp2.height/2);
            G.frame.iteminfo.showItemInfo(wid2);
            me.nodes.panel_wp2.addChild(wid2);
            me.nodes.btn_h.click(function () {
                me.DATA.callback && me.DATA.callback(0);
                me.remove();
            });

            me.nodes.btn_lan.click(function () {
                me.DATA.callback && me.DATA.callback(1);
                me.remove();
            });
        },
    });
    G.frame[ID] = new fun('shiyuan_tk12.json', ID);
})();