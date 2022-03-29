/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //战魂领等级购买
    var ID = 'zhanhunlin_tk2';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.herotheme;
            me.lv = 1;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.nodes.txt_qr.setString(L('GOUMAI'));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            var maxlv = X.keysOfObject(me.conf.flagprize).length;
            X.render({
                btn_1: function (node) {
                    node.click(function (sender) {
                        if (me.lv > 1) {
                            me.lv--;
                            me.setContents();
                        }
                    })
                },
                btn_2: function (node) {
                    node.click(function (sender) {
                        if (me.lv + me.DATA < maxlv) {
                            me.lv++;
                            me.setContents();
                        }
                    })
                },
                btn_jian10: function (node) {
                    node.click(function (sender) {
                        if (me.lv - 10 > 0) {
                            me.lv -= 10;
                            me.setContents();
                        }
                    })
                },
                btn_jia10: function (node) {
                    node.click(function (sender) {
                        if (me.lv + me.DATA + 10 <= maxlv) {
                            me.lv += 10;
                            me.setContents();
                        }
                    })
                },
                btn_qr: function (node) {
                    node.click(function (sender) {
                        G.ajax.send("herotheme_buyflaglv", [me.lv], function (str, data) {
                            if (data.s == 1) {
                                G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                G.frame.yxzt_zhl.view.setContents()
                                G.hongdian.getData('herotheme',1,function () {
                                    G.frame.yingxiongzhuti.checkRedPoint();
                                    G.frame.yxzt_zhl.checkRedPoint();
                                });
                                me.remove();
                            }
                        });
                    })
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            var prize1 = [];
            var prize2 = [];
            for (var i = me.DATA; i <= me.DATA + me.lv; i++) {
                var conf = me.conf.flagprize[i];
                prize1.push(conf.freeprize[0]);
                prize2.push(conf.payprize[0]);
            }
            var prize = prize1.concat(prize2);
            var data = X.mergeItem(prize);
            me.nodes.listview.removeAllChildren();
            for (var i = 0; i < data.length; i++) {
                var list = me.nodes.list_wp.clone();
                me.setItem(list, data[i]);
                me.nodes.listview.addChild(list);
            };
            X.render({
                textfield_5: function (node) {
                    node.setString(me.lv);
                },
                panel_hbrq: function (node) {
                    node.removeAllChildren();
                    var prize = me.conf.buyexpneed[0];
                    var img = new ccui.ImageView(G.class.getItemIco(prize.t), 1);
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('yxzt4'), prize.n * me.lv),
                        color: "#ffffff",
                        node: img
                    });
                },
            }, me.nodes);
        },
        setItem: function (ui, data) {
            var me = this;
            // X.autoInitUI(ui);
            // var item = G.class.sitem(data, true);
            // ui.removeAllChildren();
            // item.setPosition(cc.p(50, 50));
            // ui.addChild(item);
            X.alignItems(ui, [data], 'left', {
                touch: true,
                // scale: 0.8,
            });
        },
    });
    G.frame[ID] = new fun('zhanhunlin_tk2.json', ID);
})();