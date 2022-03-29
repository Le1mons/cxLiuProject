/**
 * Created by LYF on 2019/5/20.
 */
(function () {
    //饰品-突破
    var ID = 'shipin_tupo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        showTable: function () {
            var me = this;

            if (!me.panelScrollview) {
                me.panelScrollview = new G.class.shipin_up('shipin');
                me.ui.nodes.panel_nr1.removeAllChildren();
                me.ui.nodes.panel_nr1.addChild(me.panelScrollview);
            } else {
                me.panelScrollview.refreshPanel();
            }

        },
        showBottom: function () {
            var me = this;

            if (!me.panelBottom) {
                me.panelBottom = new G.class.shipin_down('shipin');
                me.ui.nodes.panel_nr2.removeAllChildren();
                me.ui.nodes.panel_nr2.addChild(me.panelBottom);
            } else {
                me.panelBottom.refreshPanel();
            }

        },
        setContents: function () {
            var me = this;

            me.showTable();
            me.showBottom();
        },
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();