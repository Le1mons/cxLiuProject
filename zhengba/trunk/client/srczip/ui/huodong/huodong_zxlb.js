/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //自选礼包
    G.class.huodong_zxlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_sirendingzhi.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();

            me.nodes.txt_count.setString(L("JLJS"));
            X.timeout(me.nodes.txt_time, me._data.etime, null, null, {
                showDay: true
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("huodong_open", [me._data.hdid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(me.DATA.info.arr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.DATA.info.arr);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, index) {
            var me = this;
            var buyNum = me.DATA.myinfo.gotarr[index] || 0;
            var select = me.DATA.myinfo.val[index] || {};

            function f(idx) {
                G.frame.zxlb_select.data({
                    choose: data.choose,
                    select: select,
                    idx: idx,
                    callback: function (select) {
                        me.ajax("huodong_use", [me._data.hdid, 1, index, select], function (str, data) {
                            if (data.s == 1) {
                                me.refreshPanel();
                            }
                        });
                    }
                }).show();
            }

            X.autoInitUI(ui);
            X.render({
                wz_sm: function (node) {
                    node.setString(parseInt(data.price / 100) + L("YUAN") + L("ZXLB"));
                    X.enableOutline(node,"#790000");
                },
                hd_jf: function (node) {
                    node.setString(X.STR(L("XGXC"), data.num) + "(" + buyNum + "/" + data.num + ")");
                },
                btn_txt1:function(node){
                    node.setString(parseInt(data.price / 100) + L("YUAN"));
                    node.setTextColor(cc.color(buyNum < data.num ? G.gc.COLOR.n13:G.gc.COLOR.n15));
                } ,
                btn: function (node) {
                    node.setEnableState(buyNum < data.num);
                    node.click(function () {
                        if (Object.keys(select).length < Object.keys(data.choose).length) return f(0);
                        if (data.price == 0) {
                            me.ajax("huodong_use", [me._data.hdid, 2, index], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    me.refreshPanel();
                                    if(me._data.isqingdian){
                                        G.hongdian.getData("qingdian", 1, function () {
                                            G.frame.zhounianqing_main.checkRedPoint();
                                        });
                                    }else {
                                        G.hongdian.getData("huodong", 1, function () {
                                            G.frame.huodong.checkRedPoint();
                                        });
                                    }
                                }
                            });
                        } else {
                            var prize = [];
                            for (var idx in select) {
                                prize.push(data.choose[idx][select[idx]]);
                            }
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: [].concat(data.prize, prize)
                                }).show();
                                me.refreshPanel();
                            });
                            G.event.emit('doSDKPay', {
                                pid:data.proid,
                                logicProid: data.proid,
                                money: data.price,
                            });
                        }
                    });
                },
                ico_item1: function (node) {
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    item.setScale(0.68);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                }
            }, ui.nodes);
            for (var idx = 0; idx < 3; idx ++) {
                (function (parent, idx) {
                    parent.removeAllChildren();
                    if (data.choose[idx] != undefined) {
                        var list = me.nodes.panel_list.finds("ico_list$").clone();
                        X.autoInitUI(list);
                        list.nodes.brn_gh = list.finds("brn_gh");
                        X.render({
                            ico: function (node) {
                                node.removeBackGroundImage();
                                if (select[idx] != undefined) {
                                    var item = G.class.sitem(data.choose[idx][select[idx]]);
                                    item.setPosition(node.width / 2, node.height / 2);
                                    G.frame.iteminfo.showItemInfo(item);
                                    node.addChild(item);
                                    item.setSwallowTouches(true);
                                }else {
                                    node.setBackGroundImage('img/public/ico/ico_bg0.png', 1)
                                }
                                node.click(function () {
                                    f(idx);
                                });
                            },
                            jia: function (node) {
                                node.setVisible(select[idx] == undefined);
                                node.setTouchEnabled(true);
                                node.click(function () {
                                    f(idx);
                                });
                            },
                            brn_gh: function (node) {
                                node.setVisible(select[idx] != undefined);
                                node.ifnum = buyNum < data.num;//是否还有次数
                                node.click(function (sender) {
                                    if(!sender.ifnum) return G.tip_NB.show(L('CSBZ'));
                                    f(idx);
                                });
                            }
                        }, list.nodes);
                        list.show();
                        list.setPosition(parent.width / 2, parent.height / 2);
                        parent.addChild(list);
                    }
                })(ui.nodes["ico_item" + (idx + 2)], idx);
            }
        }
    });
})();
