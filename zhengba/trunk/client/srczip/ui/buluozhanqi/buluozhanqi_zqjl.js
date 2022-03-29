/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //战旗奖励
    G.class.buluozhanqi_zqjl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("buluozhanqi_zqjl.json", null, {action: true});
        },
        initUI: function() {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview1);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_gmdj.click(function () {

                G.frame.buluozhanqi_buylv.data({
                    lv: me.DATA.lv,
                    prize: me.DATA.prize
                }).show();
            });

            me.nodes.btn_sc.click(function () {

                // G.frame.shop.data({type: 10, name: "zqsd"}).show();
                G.frame.shopmain.data('10').show();
            });

            me.nodes.btn_djjj.click(function () {

                if(me.nodes.panel_qieh1.visible) {
                    me.nodes.panel_qieh1.setVisible(false);
                    me.nodes.panel_qieh2.setVisible(true);
                } else {
                    me.nodes.panel_qieh1.setVisible(true);
                    me.nodes.panel_qieh2.setVisible(false);
                }
            });

            me.nodes.btn_yjlq.click(function () {

                me.ajax("flag_getprize", [0, 1], function (str, data) {

                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();

                        me.getData(function () {

                            me.setTable();
                        });

                        G.hongdian.getData("flag", 1, function () {
                            G.frame.buluozhanqi.checkRedPoint();
                        });
                    }
                });
            });

            me.nodes.btn_czzh.click(function () {

                if (G.DATA.blzq_lv >= 80 && me.DATA.cd <= 30) {

                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {

                            me.ajax("flag_recast", [], function (str, data) {
                                if (data.s == 1) {
                                    me.getData(function () {
                                        me.setContents();
                                        G.hongdian.getData("flag", 1, function () {
                                            G.frame.buluozhanqi.checkRedPoint();
                                        });
                                    });
                                }
                            });
                        },
                        richText: L('CZZQ'),
                        sizeType:3
                    }).show();
                } else {
                    G.frame.alert.data({
                        okCall: null,
                        richText: L('ZQCZNEED'),
                        sizeType:3
                    }).show();
                }
            });

            me.nodes.btn_198jj.click(function () {

                G.event.once('paysuccess', function(arg) {
                    if (!arg || !arg.success) return;
                    me.nodes.panel_qieh1.setVisible(true);
                    me.nodes.panel_qieh2.setVisible(false);

                    G.frame.jiangli.data({
                        prize: G.gc.flag.base.flagprize,
                    }).once("hide", function () {
                        me.nodes.btn_djjj.removeAllChildren();
                        G.class.ani.show({
                            json: "ani_zhanqi_jjjs",
                            addTo: me.nodes.btn_djjj,
                            x: 71,
                            y: me.nodes.btn_djjj.height / 2,
                            onend: function () {
                                G.class.ani.show({
                                    json: "ani_zhanqi_guangmu",
                                    addTo: me.nodes.panel_jsdh,
                                    x: 287,
                                    y: me.nodes.panel_jsdh.height / 2,
                                    onload: function (node) {
                                        node.setScaleY(me.nodes.panel_jsdh.height / 538);
                                    },
                                    onkey: function (node, action, event) {
                                        if(event == "xiaoshi") {
                                            me.DATA.jinjie = 1;
                                            me.setTable();
                                        }
                                    },
                                    onend: function () {
                                        me.zqAni.playWithCallback("out", false, function () {
                                            me.zqNode.removeFromParent();
                                            me.getData(function () {
                                                me.setUpLvInfo();
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }).show();
                });
                G.event.emit('doSDKPay', {
                    pid: me.DATA.paycon.proid,
                    logicProid: me.DATA.paycon.proid,
                    money: me.DATA.paycon.unitPrice,
                });
            }, 3000);
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.initUI();
        },
        onShow: function () {
            var me = this;

            me.getData(function () {

                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.frame.buluozhanqi.getInfo(function (data) {
                me.DATA = data;
                me.DATA.receive = me.DATA.receive || {};
                me.DATA.receive.base = me.DATA.receive.base || [];
                me.DATA.receive.jinjie = me.DATA.receive.jinjie || [];

                callback && callback();
            });
        },
        setContents: function () {
            var me = this;

            me.setTable();
            me.setEndTime();
            me.setUpLvInfo();
            me.addAni();
        },
        setEndTime: function() {
            var me = this;

            if (me.DATA.cd <= 1) {
                X.timeout(me.nodes.txt_hdsj, me.DATA.endtime, function () {
                    X.uiMana.closeAllFrame();
                });
            } else {
                me.nodes.txt_hdsj.setString(me.DATA.cd + L("TIAN"));
            }
        },
        setUpLvInfo: function () {
            var me = this;

            X.render({
                txt_djs: me.DATA.lv,
                txt_jdtsz: function (node) {
                    var maxLv = Object.keys(G.gc.flag.base.exp).length;
                    var nextLv = me.DATA.lv + 1 > maxLv ? maxLv : me.DATA.lv + 1;

                    node.setString(me.DATA.exp + "/" + G.gc.flag.base.exp[nextLv]);

                    me.nodes.img_jdt.setPercent(me.DATA.exp / G.gc.flag.base.exp[nextLv] * 100);

                    if (me.DATA.lv + 1 > maxLv) me.nodes.btn_gmdj.setEnableState(false);
                },
                btn_djjj: function (node) {
                    node.setVisible(me.DATA.jinjie ? false : true);
                }
            }, me.nodes);
        },
        getIdx: function() {
            var me = this;
            var index = 0;
            var data = me.DATA.prize;
            var keys = Object.keys(data);
            
            for (var i = 0; i < keys.length; i ++) {
                var needLv = keys[i];
                var info = data[keys[i]];

                if((me.DATA.lv >= needLv * 1 && (!X.inArray(me.DATA.receive.base, needLv)
                    || (me.DATA.jinjie && !X.inArray(me.DATA.receive.jinjie, needLv))))
                    || me.DATA.lv + 1 == needLv * 1) {
                    index = i;
                    return index;
                }
            }

            return index;
        },
        setTable: function () {
            var me = this;
            var data = Object.keys(me.DATA.prize);
            data.pop();

            me.curMaxNum = undefined;

            if(!me.table) {
                me.table = new X.TableView(me.nodes.scrollview1, me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
                me.table._table.scrollToCell(me.getIdx());
                me.table._table.tableView.setBounceable(false);
                me.addScrollViewEventListener(me.table._table.tableView);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var me = this;
            var conf = me.DATA.prize[data];

            ui.index = data;
            X.render({
                fnt_z: data,
                panel_wp2: function (node) {
                    node.removeAllChildren();
                    if(!conf.base[0]) return;

                    var item = G.class.sitem(conf.base[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);

                    if(X.inArray(me.DATA.receive.base, data)) {
                        var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                        ylq.setAnchorPoint(0.5, 0.5);
                        ylq.setPosition(node.width / 2, node.height / 2);
                        ylq.zIndex = 999999;
                        node.addChild(ylq);
                    }
                },
                panel_wp1: function (node) {
                    X.alignItems(node, conf.jinjie, "left", {
                        touch: true,
                        mapItem: function (item) {
                            if(!me.DATA.jinjie) item.setHighLight && item.setHighLight(false);
                            if(X.inArray(me.DATA.receive.jinjie, data)) {
                                var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                                ylq.setAnchorPoint(0.5, 0.5);
                                ylq.setPosition(item.width / 2, item.height / 2);
                                ylq.zIndex = 999999;
                                item.addChild(ylq);
                            }
                        }
                    });
                },
                img_received: function (node) {
                    if ((X.inArray(me.DATA.receive.base, data) && !me.DATA.jinjie)
                        || (X.inArray(me.DATA.receive.base, data) && X.inArray(me.DATA.receive.jinjie, data))) node.show();
                    else node.hide();
                },
                img_wjh: function (node) {
                    if (me.DATA.jinjie) node.hide();
                    else node.show();
                },
                btn_receive: function (node) {
                    if (data * 1 > me.DATA.lv) node.show();
                    else node.hide();

                    node.click(function () {
                        G.frame.buluozhanqi.topMenu.changeMenu(2);
                    });
                },
                btn_lq: function (node) {
                    if(data * 1 <= me.DATA.lv && (((!X.inArray(me.DATA.receive.base, data) && !me.DATA.jinjie))
                        ||((!X.inArray(me.DATA.receive.jinjie, data) && me.DATA.jinjie)))) {

                        node.show();

                        if (conf.base[0]) {
                            G.setNewIcoImg(node, .9);
                        } else {
                            G.removeNewIco(node);
                        }
                    } else {
                        node.hide();
                        G.removeNewIco(node);
                    }

                    node.click(function () {

                        me.ajax("flag_getprize", [data * 1, 0], function (str, dd) {
                            if (dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: dd.d.prize
                                }).show();

                                me.getData(function () {
                                    me.setTable();
                                });

                                G.hongdian.getData("flag", 1, function () {
                                    G.frame.buluozhanqi.checkRedPoint();
                                });
                            }
                        });
                    });
                }
            }, ui.nodes);

        },
        addScrollViewEventListener: function (scrollView) {
            var me = this;
            
            scrollView.update = function (dt) {
                var arr = [];
                var children = me.table.getAllChildren();

                for (var i in children) arr.push(children[i].index * 1);
                arr.sort(function (a, b) {
                    return a > b ? -1 : 1;
                });

                var maxNum = arr[0];
                if(me.curMaxNum != (parseInt(maxNum / 10) + 1) * 10) {
                    me.curMaxNum = (parseInt(maxNum / 10) + 1) * 10;
                    me.setItem(me.nodes.list_bd, me.curMaxNum);
                }
            };
            scrollView.scheduleUpdate();
        },
        addAni: function () {
            var me = this;

            if(!me.DATA.jinjie) {
                G.class.ani.show({
                    json: "ani_zhanqi_baoxiang",
                    addTo: me.nodes.panel_js1,
                    x: 118,
                    y: 66,
                    repeat: true,
                    autoRemove: false
                });

                G.class.ani.show({
                    json: "ani_zhanqi_baoxiang",
                    addTo: me.nodes.panel_js2,
                    x: 118,
                    y: 66,
                    repeat: true,
                    autoRemove: false
                });

                G.class.ani.show({
                    json: "ani_zhanqi_jiesuo",
                    addTo: me.nodes.panel_zqzq,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setScale(2);
                        action.play("changtai", true);
                        me.zqNode = node;
                        me.zqAni = action;
                    }
                });

                G.class.ani.show({
                    json: "ani_zhanqi_anniutishi",
                    addTo: me.nodes.btn_djjj,
                    x: me.nodes.btn_djjj.width / 2,
                    y: me.nodes.btn_djjj.height / 2,
                    repeat: true,
                    autoRemove: false
                });

                G.class.ani.show({
                    json: "ani_zhanqi_txk",
                    addTo: me.nodes.panel_dh,
                    x: me.nodes.panel_dh.width / 2,
                    y: me.nodes.panel_dh.height / 2,
                    repeat: true,
                    autoRemove: false
                });
            }
        }
    });
})();