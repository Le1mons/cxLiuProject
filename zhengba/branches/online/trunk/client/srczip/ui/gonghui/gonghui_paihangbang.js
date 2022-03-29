/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-排行榜
    var ID = 'gonghui_paihangbang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_zdjl.setString(L("GHPHB"));
            setPanelTitle(me.ui.finds('text_zdjl'), L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = new G.class.gonghui_ghph('phb');
            me.nodes.panel_nr.removeAllChildren();
            me.nodes.panel_nr.addChild(panel);
            panel.show();
        },
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();