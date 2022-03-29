/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-羊皮纸
    var ID = 'shiyuanzhanchang_ypz';

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
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.panel_ui.setTouchEnabled(false);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.eventconf =  me.DATA.conf;
            me.eventdata = me.DATA.eventdata;
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
            me.nodes.panel_xz.setBackGroundImage('img/bg/bg_sy'+me.eventdata.graph+'.png',0);
            me.nodes.panel_sz.setBackGroundImage('img/bg/wz_sy'+me.eventdata.order+'.png',0);
        },
    });
    G.frame[ID] = new fun('shiyuan_jm_tk1.json', ID);
})();