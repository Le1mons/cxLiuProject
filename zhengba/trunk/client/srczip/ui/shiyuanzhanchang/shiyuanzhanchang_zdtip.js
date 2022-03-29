//
/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-开启战斗提示zd
    var ID = 'shiyuanzhanchang_zdtip';

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
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            new X.bView('shiyuan_tishi1.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                me.setContents();
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.nodes.txt_title.setString('提示');
            me.view.nodes.text_ts.setString(L('syzc_28'));
            me.view.nodes.btn_qx.click(function (sender,type) {
               me.data().cancelCall &&  me.data().cancelCall();
               me.remove();
            });
            me.view.nodes.btn_qd.click(function (sender,type) {
                me.data().okCall &&  me.data().okCall();
                me.remove();
            });
        },
    });
    G.frame[ID] = new fun('ui_tip13.json', ID);
})();