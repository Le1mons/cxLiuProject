/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-时间说明点
    var ID = 'shiyuanzhanchang_sjsm';

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
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.eventconf =  me.DATA.conf;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var sjid = me.sjid = G.gc.syzcmapinfo[G.DATA.shiyuanzhanchang.layer].jiemiid;
            var json = {
                '1':'shiyuan_jm_tk4_nr4.json',//截断情报
                '2':'shiyuan_jm_tk4_nr3.json',//运送物资
                '3':'shiyuan_jm_tk4_nr2.json',//磁石共振
                '4':'shiyuan_jm_tk4_nr1.json',//现场重现
            };
            new X.bView(json[sjid], function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var title = {
                '1':'wz_jdqb.png',//截断情报
                '2':'wz_yswz.png',//运送物资
                '3':'wz_shgz.png',//磁石共振
                '4':'wz_zzlz.png',//现场重现
            };
            me.nodes.panel_tittle.setBackGroundImage('img/shiyuanzhanchang/'+title[me.sjid],1);
            me._view.nodes.txt_ms.setString(L('syzc_tip'+me.sjid));
        },
    });
    G.frame[ID] = new fun('shiyuan_jm_tk4.json', ID);
})();