/**
 * Created by LYF on 2018-12-28
 */
(function () {
    var ID = "diaowenduihuan";

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            if(G.frame.diaowen_tisheng.dw.DATA < 100) {
                me.nodes.btn_lq.setTouchEnabled(false);
                me.nodes.btn_lq.setBright(false);
                me.nodes.txt_lq.setTextColor(cc.color("#6c6c6c"));
            }

            me.nodes.btn_lq.click(function () {

                me.ajax("glyph_getrefineprize", [], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.remove();
                        G.hongdian.getData("glyph", 1, function () {
                            G.frame.duanzaofang.checkRedPoint();
                            G.frame.diaowen_tisheng.dw.checkRedPoint();
                        });
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindUI();

            var wid = G.class.sitem({a: "item", t: 1009, n: 0});
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(me.nodes.panel_wpjl.width / 2, me.nodes.panel_wpjl.height / 2)
            G.frame.iteminfo.showItemInfo(wid);
            me.nodes.panel_wpjl.addChild(wid);
        },
        onRemove: function () {
            var me = this;

            G.frame.diaowen_tisheng.dw.setJDT();
        }
    });

    G.frame[ID] = new fun('diaowen_top4.json', ID);
})();