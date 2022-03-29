/**
 * Created by LYF on 2019/10/28.
 */
(function () {
    //神宠水晶-特权
    var ID = 'scsj_tq';

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

            X.autoInitUI(me.nodes.panel_libao1);
            X.autoInitUI(me.nodes.panel_libao2);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.setView(me.nodes.panel_libao1, "chongwutequan", 'week');
            me.setView(me.nodes.panel_libao2, "superchongwutequan", 'month');
        },
        setView: function (panel, key, type) {
            var me = this;
            var conf = G.gc.chongzhihd[key];
            var buyType = G.frame.scsj.DATA.crystal.paytype;
            var isBuy = G.frame.scsj.DATA.crystal.pay && G.frame.scsj.DATA.crystal.pay > G.time;
            var isCanReceive = G.frame.scsj.DATA.receive;
            X.render({
                panel_wp: function (node) {
                    X.alignItems(node, conf.prize, "left", {
                        touch: true,
                        scale: .9
                    });
                },
                btn_gm: function (node) {
                    node.setVisible(!isBuy);
                    node.children[0].setString(conf.btnshow);
                    node.click(function () {
                        G.event.once('paysuccess', function(arg) {
                            G.frame.scsj.getData(0, function () {
                                me.once("willClose", function () {
                                    if (cc.isNode(G.frame.scsj.panel.lockAni)) {
                                        G.frame.scsj.panel.lockAni.ani.gotoFrameAndPlay(0);
                                    }
                                });
                                me.setContents();
                                G.frame.scsj.setTqTime();
                                G.frame.scsj.checkRedPoint();
                            });
                            arg && arg.success && G.frame.jiangli.data({
                                prize: conf.prize
                            }).show();
                            G.hongdian.getData("pet", 1);
                        });
                        G.event.emit('doSDKPay', {
                            pid: conf.chkkey,
                            logicProid: conf.chkkey,
                            money: conf.money
                        });
                    }, 1000);
                },
                btn_gs: function (node) {
                    var btnTxt = node.children[0];
                    if (isBuy && buyType == type) {
                        btnTxt.setString(!isCanReceive ? L("YLQ") : L("LQ"));
                        node.setEnableState(isCanReceive);
                        btnTxt.setTextColor(cc.color(G.gc.COLOR[!isCanReceive ? 'n15' : 'n102']));
                        if (isCanReceive) {
                            G.setNewIcoImg(node);
                            node.redPoint.setPosition(123, 51);
                        } else {
                            G.removeNewIco(node);
                        }
                        node.click(function () {
                            me.ajax("pet_tqprize", [], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    G.frame.scsj.getData(0, function () {
                                        me.setContents();
                                        G.frame.scsj.checkRedPoint();
                                    });
                                    G.hongdian.getData("pet", 1);
                                }
                            });
                        });
                    }
                },
                panel_jl: function (node) {
                    var prize = G.class.sitem(G.gc.petcom.base.tqprize[0]);
                    prize.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(prize);
                    G.frame.iteminfo.showItemInfo(prize);
                },
                img_bg1: function (node) {
                    if (isBuy && buyType == type) {
                        node.hide();
                    }
                },
                img_bg2: function (node) {
                    if (isBuy && buyType == type) {
                        node.show();
                    }
                }
            }, panel.nodes);
        }
    });

    G.frame[ID] = new fun('scsj_tqlb.json', ID);
})();