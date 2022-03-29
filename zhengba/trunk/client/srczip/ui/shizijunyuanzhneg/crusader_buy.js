/**
 * Created by LYF on 2018/11/21.
 */
(function () {
    //十字军-购买
    var ID = 'shizijun_buy';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_jnnr.setString(X.STR(L("DQZWSFGM"), me.conf.name, me.conf.need[0].n));

            var data = {a: "item", t: "crusader" + me.id, n: 1};
            var item = G.class.sitem(data);
            item.setAnchorPoint(0.5, 0.5);
            item.setPosition(me.nodes.panel_1.width / 2, me.nodes.panel_1.height / 2);
            G.frame.iteminfo.showItemInfo(item);
            me.nodes.panel_1.addChild(item);
        },
        bindBtn: function () {
            var me = this;

            if(cc.isNode(me.nodes.mask)) {
                me.nodes.mask.click(function () {
                    me.remove();
                })
            }

            me.nodes.btn_3.click(function () {

                me.ajax("shizijun_useitem", [me.id, me.tid], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "shizijun_useitem"
                        });
                        for (var i in data.d) {
                            G.frame.shizijunyuanzheng.DATA[i] = data.d[i];
                        }
                        me.remove();
                        G.tip_NB.show(L("SYCG"));
                        G.frame.shizijun_use.curId = undefined;
                        G.frame.shizijun_use.setHeroList();
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.id = me.data().id;
            me.tid = me.data().tid;
            me.conf = G.class.shizijunyuanzheng.getSupply()[me.id];

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
    });
    G.frame[ID] = new fun('yuanzheng_goumaibuji.json', ID);
})();