/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //战魂领进阶
    var ID = 'zhanhunlin_tk1';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_qd.click(function () {
                G.event.once('paysuccess', function (txt) {
                    try {
                        G.ajax.send("herotheme_flagallprize", [], function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                G.frame.yxzt_zhl.view.DATA = data.d.myinfo;
                                G.frame.yxzt_zhl.view.setContents();
                                G.frame.yxzt_zhl.view.initUi();
                                me.remove();
                                G.hongdian.getData('herotheme', 1, function () {
                                    G.frame.yingxiongzhuti.checkRedPoint();
                                    G.frame.yxzt_zhl.checkRedPoint();
                                });
                            }
                        });
                    } catch (e) { }
                });
                G.event.emit('doSDKPay', {
                    pid: me.conf.flagpayinfo.proid,
                    logicProid: me.conf.flagpayinfo.proid,
                    money: me.conf.flagpayinfo.money,
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.nodes.txt_qd.setString(X.STR(L('DOUBLE9'), me.conf.flagpayinfo.money / 100));
        },
        setContents: function () {
            var me = this;
            var prize1 = [];
            var prize2 = [];
            for (var k in me.conf.flagprize) {
                prize1.push(me.conf.flagprize[k].payprize[0]);
                prize2.push(me.conf.flagprize[k].payprize[1]);
            }

            var prize = prize1.concat(prize2);
            var data = X.mergeItem(prize);
            me.nodes.listview.removeAllChildren();
            for (var i = 0; i < data.length; i++) {
                var list = me.nodes.panel_4.clone();
                me.setItem(list, data[i]);
                me.nodes.listview.addChild(list);
            };
        },
        setItem: function (ui, data) {
            var me = this;
            // X.autoInitUI(ui);
            // var item = G.class.sitem(data, true);
            // ui.removeAllChildren();
            // item.setPosition(cc.p(50,50));
            // ui.addChild(item);
            X.alignItems(ui, [data], 'left', {
                touch: true,
                // scale: 0.8,
            });
        },
    });
    G.frame[ID] = new fun('zhanhunlin_tk1.json', ID);
})();