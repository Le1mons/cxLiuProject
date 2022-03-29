/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-共振成功or失败
    var ID = 'shiyuanzhanchang_gzjg';

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
            me.nodes.panel_ui.setTouchEnabled(false);
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.success = me.data();
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
            if (me.success){
                me.nodes.panel_cg.show();
                me.nodes.panel_sb.hide();
            }else {
                me.nodes.panel_sb.show();
                me.nodes.panel_cg.hide();
            }
        },
    });
    G.frame[ID] = new fun('shiyuan_jm_tk2.json', ID);
})();