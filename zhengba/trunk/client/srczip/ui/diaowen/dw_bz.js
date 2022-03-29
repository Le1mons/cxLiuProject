/**
 * Created by LYF on 2019/7/25.
 */
(function () {
    //英雄备注
    var ID = 'dw_bz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            X.editbox.create(me.nodes.text_2);
            me.nodes.text_1.setString(L("DWBZ"));
            me.ui.finds("text_1$_0").setString(L("DWBZSM"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_qw.click(function () {

                var str = me.nodes.text_2.getString();
                var str1 = matching_utf8(str);

                if (str.length > 0 && str1.length < 1 && str != ' ') return G.tip_NB.show(L("BZNAME_dw"));

                X.cacheByUid("dw_remarks" + me.data(), str1);
                G.tip_NB.show(L("SHEZHI") + L("SUCCESS"));
                me.remove();
            });

            cc.isNode(me.nodes.mask) && me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            me.nodes.panel_bg.setPosition(cc.director.getWinSize().width / 2, cc.director.getWinSize().height / 2);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var dwTid = me.data();

            me.nodes.text_2.setString(X.cacheByUid("dw_remarks" + dwTid) || "");
            me.nodes.text_2.setTextHorizontalAlignment(1);
            me.nodes.text_2.setTextVerticalAlignment(1);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_yxbz.json', ID);
})();