/**
 * Created by lsm on 2018/9/26.
 */
(function () {
    //域外争霸排行榜-排行榜
    var ID = 'yuwaizhengba_zbphb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_zdjl.setString(L("KFZ_ZB_PHB"));
            // me.ui.finds("text_zdjl").setString(L("PHB"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
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
            var view = new G.class.yuwaizhengba_phphb('zhengba');
            me.nodes.panel_nr.addChild(view);
        },
        onHide: function () {
            var me = this;
        }

    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();