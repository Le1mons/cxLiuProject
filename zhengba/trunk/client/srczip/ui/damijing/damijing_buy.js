/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //大秘境-购买
    var ID = 'damijing_buy';

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

            me.ui.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = G.frame.damijing.DATA.trader[G.frame.damijing.DATA.trader.length - 1];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('tishi_1.json', function (view) {
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
            var layout = me.view.ui.finds("ico_tx");

            me.view.nodes.btn_qx.click(function () {
                me.remove();
            });

            me.view.nodes.btn_qd.click(function (sender) {
                me.ajax("watcher_useitem", [2, G.frame.damijing.DATA.trader.length - 1], function (str, data) {
                    if(data.s == 1) {
                        G.removeNewIco(G.frame.damijing.ui.finds("btn_mjsd"));
                        G.frame.jiangli.once("hide", function () {
                            me.remove();
                            G.frame.damijing.DATA.trader = data.d.trader;
                            me.isBuy = true;
                            if(cc.isNode(G.frame.damijing.dijing)) {
                                G.frame.damijing.nodes.btn_dj.hide();
                                G.frame.damijing.setDiJingAni();
                            }
                        }).data({
                            prize: data.d.prize
                        }).show();
                    }
                })
            });

            var item = G.class.sitem(me.DATA.item);
            item.setPosition(layout.width / 2, layout.height / 2);
            layout.addChild(item);

            G.frame.iteminfo.showItemInfo(item);

            me.view.nodes.bg_di.finds("txt_sz").setString(X.fmtValue(me.DATA.need[0].n));
            me.view.finds("bg_di$_0").finds("txt_sz").setString(X.fmtValue(me.DATA.need[0].n * (me.DATA.sale / 10)));

            me.view.finds("ico_zs").loadTexture(G.class.getItemIco(me.DATA.need[0].t), 1);
            me.view.finds("ico_zs1").loadTexture(G.class.getItemIco(me.DATA.need[0].t), 1);

            me.view.nodes.text_zk.setString(me.DATA.sale + L("sale"));
        },
    });
    G.frame[ID] = new fun('ui_tip_tishi.json', ID);
})();