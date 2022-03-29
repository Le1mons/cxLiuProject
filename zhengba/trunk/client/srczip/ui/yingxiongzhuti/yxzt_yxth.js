/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //英雄兑换
    var ID = 'yxzt_yxth';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
            });
            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
            });
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        G.frame.yingxiongzhuti.checkRedPoint();
                        me.remove();
                    });
                },
                txt_th: function (node) {
                    var num = G.class.getOwnNum('5100', 'item');
                    var str1 = X.STR(L('yrhd_tip10'), num);
                    var rh = new X.bRichText({
                        size: 18,
                        maxWidth: node.width,
                        lineHeight: 24,
                        family: G.defaultFNT,
                        color: '#fef7e0',
                        eachText: function (node1) {
                            X.enableOutline(node1, "#311e00", 2);
                        }
                    });
                    rh.text(str1);
                    rh.setAnchorPoint(0.5, 0.5);
                    rh.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(rh);
                }
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            X.cacheByUid('duihuan_byday', 1);
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.updateAttr();
            me.bindBtn();
            var data = X.keysOfObject(me.conf.duihuan);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, id) {
            var me = this;
            var data = me.conf.duihuan[id];
            var maxnum = data.maxnum - (me.DATA.duihuan[id] || 0);
            X.autoInitUI(ui);
            X.render({
                panel_wp2: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: 0.8,
                    });
                },
                panel_wp1: function (node) {
                    X.alignItems(node, data.need, 'left', {
                        touch: true,
                        scale: 0.8,
                    });
                },
                txt_cs: function (node) {
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('yxzt3'), maxnum),
                        color: "#ffffff",
                        size: 20,
                        outline: "#000000"
                    });
                },
                btn_ks: function (node) {
                    node.id = id;
                    node.maxnum = maxnum;
                    if (maxnum <= 0) {
                        node.setBright(false);
                        node.setTouchEnabled(false);
                        ui.nodes.txt_ks.setString(L("yxzt22"));
                    } else {
                        node.setBright(true);
                        node.setTouchEnabled(true);
                        ui.nodes.txt_ks.setString(L("yxzt28"));
                    }
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            if (sender.maxnum == 1) {
                                G.ajax.send("herotheme_duihuan", [sender.id], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.once('close', function () {
                                            me.bindBtn();
                                            G.hongdian.getData('herotheme');
                                            G.frame.yingxiongzhuti.checkRedPoint();
                                        }).data({
                                            prize: data.d.prize
                                        }).show();
                                        me.DATA = data.d.myinfo;
                                        G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                        me.setContents();
                                    }
                                });
                            } else if (sender.maxnum > 1) {
                                G.frame.yxzt_th_tk.data({
                                    id: sender.id,
                                    num: sender.maxnum,
                                    conf: G.gc.herotheme,
                                    type: "yxzt",
                                }).show();
                            }
                        }
                    });
                },
            }, ui.nodes);
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('zhanhunlin_th2.json', ID);
})();