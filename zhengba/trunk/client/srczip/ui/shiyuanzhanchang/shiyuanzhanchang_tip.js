//
/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-选择层数
    var ID = 'shiyuanzhanchang_tip';

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
            new X.bView('shiyuan_tishi.json', function (view) {
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
            me.nodes.txt_title.setString(me.data().title);
            me.view.nodes.text_ts.setString(me.data().intr);
        },
    });
    G.frame[ID] = new fun('ui_tip12.json', ID);
})();