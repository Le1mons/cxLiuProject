/**
 * Created by
 */
(function () {
    //传说大厅
    var ID = 'csdt_tk1';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.num = 1;
            me.pid = X.keysOfObject(G.gc.csdt.itemdz)[0];
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            X.render({
                btn_1: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            if (me.num > 1) {
                                me.num--;
                                me.nodes.text_2.setString(me.num);
                            }
                        }
                    });
                },
                btn_2: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            var need = G.gc.csdt.itemdz[me.pid].itemneed;
                            if (me.num < Math.floor(G.class.getOwnNum(need[0].t, "item") / need[0].n)) {
                                me.num++;
                                me.nodes.text_2.setString(me.num);
                            }
                        }
                    });
                },
                btn_3: function (node) {
                    node.click(function () {
                        var need = G.gc.csdt.itemdz[me.pid].itemneed;
                        if (need[0].n > G.class.getOwnNum(need[0].t, "item")) return G.tip_NB.show(L('csdt5'));
                        var prize = [{ "a": "item", "t": need[0].t, "n": me.num * need[0].n }];
                        G.frame.csdt_csdh.initUi(prize);
                        G.frame.csdt_csdh.num = me.num;
                        me.remove();
                        G.frame.csdt_tk2.show();
                    });
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            var need = G.gc.csdt.itemdz[me.pid].itemneed;
            var item = G.gc.item[need[0].t];
            X.render({
                text_1: function (node) {
                    node.setString(item.name);
                },
                panel_1: function (node) {
                    X.alignItems(node, need, 'center', {
                        touch: true,
                    });
                },
                text_2: function (node) {
                    node.setString(me.num);
                },
            }, me.nodes);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('csdt_tk1.json', ID);
})();