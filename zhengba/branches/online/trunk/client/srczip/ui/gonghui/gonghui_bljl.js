/**
 * Created by LYF on 2018/10/18.
 */
(function () {
    //公会-补领奖励
    var ID = 'gonghui_bljl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_zs.setString(G.gc.gonghui_fuben.base.fuben[me.data()].blneed);

            X.alignItems(me.nodes.panel_nr, G.gc.gonghui_fuben.base.fuben[me.data()].blprize, "center", {
                touch: true
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_bl.click(function () {
                if(P.gud.rmbmoney < G.gc.gonghui_fuben.base.fuben[me.data()].blneed) return G.tip_NB.show(L("ZSBZWFBL"));

                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.ajax("gonghuifuben_bl", [me.data()], function (str, data) {
                            if(data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.frame.gonghui_fuben.refreshCurData();
                                me.remove();
                            }
                        });
                    },
                    richText: X.STR(L("HFZSBL"), G.gc.gonghui_fuben.base.fuben[me.data()].blneed),
                }).show();
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
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('gonghui_tip_bljl.json', ID);
})();