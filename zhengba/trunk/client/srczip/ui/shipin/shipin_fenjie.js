/**
 * Created by LYF on 2019/5/20.
 */
(function () {
    //饰品-分解
    var ID = 'shipin_fenjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_title.setString(L("ZHUANGBEI_TYPE_5") + L("FJ"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView("ui_fjwp.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.view.nodes.btn_fj.click(function () {

                me.ajax("shipin_fenjie", [me.data().data.spid], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: G.gc.shipin[me.data().data.spid].fjprize
                        }).show();
                        me.remove();
                        G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                    }
                });
            });

            X.alignCenter(me.view.nodes.panel_txt, G.gc.shipin[me.data().data.spid].fjprize, {
                touch: true,
                scale: .8
            });
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();