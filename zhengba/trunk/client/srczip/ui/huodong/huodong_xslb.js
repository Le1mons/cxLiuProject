/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //月礼包
    G.class.huodong_xslb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_xinshoulibao.json");
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
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
            me.setBanner();
            // X.viewCache.getView("event_list1.json", function (node) {
            //     me.list = node.nodes.panel_list;
            //
            // });
        },
        onRemove: function () {
            var me = this;
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
        setBanner: function () {
            var me = this;

            X.render({
                txt_cs: function (node) {
                    if(me._data.etime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me._data.etime - G.time));
                    }else {
                        X.timeout(node, me._data.etime, function () {
                            me.timeout = true;
                        });
                    }
                },
            },me.nodes);
        },
        setTable: function () {
            var me = this;

            if(!me.table) {
                var scrollview = me.ui.finds('scrollview');
                cc.enableScrollBar(scrollview);
                var table = me.table = new X.TableView(scrollview, me.nodes.list1, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                }, null, null, 1, 3);
                table.setData(me.DATA.info.arr);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(me.DATA.info.arr);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, data, index) {
            var me = this;
            var num = me.DATA.myinfo.val[index].num;
            X.autoInitUI(ui);
            X.render({
                btn_gmtp: function (node) {
                    node.setBright(num < 1 ? false : true);
                    node.setTouchEnabled(num < 1 ? false : true);
                    node.data = data;
                    node.click(function (sender, type) {
                        if (sender.data.payinfo.unitprice == 0){
                            me.ajax("huodong_use",[me._data.hdid,1,0],function(str,data){
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize:sender.data.prize,
                                    }).show();
                                    G.frame.huodong.updateTop();
                                    me.refreshPanel();
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                            })
                        } else {
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: data.prize
                                }).show();
                                G.frame.huodong.updateTop();
                                me.refreshPanel();
                            });
                            G.event.emit('doSDKPay', {
                                pid:data.payinfo.proid,
                                logicProid: data.payinfo.proid,
                                money: data.payinfo.unitprice,
                            });
                        }
                    }, 1000)
                },
                panle_wupin: function (node) {
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                    })
                },
                txet_zhekou: X.STR(L("XGXC"), data.buymaxnum),
                txet_gmtp: function (node) {
                    node.setString(data.payinfo.showrmbmoney + L("YUAN"));
                    if(num < 1){
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else{
                        node.setTextColor(cc.color("#2f5719"))
                    }
                },
                img_zkbg: function (node) {
                    if(data.sale) {
                        node.show();
                    } else {
                        node.hide()
                    }
                },
                text_zk: function (node) {
                    if(data.sale) {
                        node.show();
                        node.setString(data.sale + L("sale"));
                        //X.enableOutline(node.children[0], "#008000", 2);
                    } else {
                        node.hide()
                    }
                },
                txet_sycs: data.yuanjia,
                img_title: function (node) {
                    node.setBackGroundImage('img/event/' + data.img + '.png', 1);
                }
            }, ui.nodes);
            ui.show();
        }
    })
})();
