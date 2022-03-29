/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //月礼包
    G.class.huodong_monthPrize = X.bView.extend({
        extConf: {

        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_scrollview.json");
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
            me.type = "month";
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("event_list1.json", function (node) {
                me.list = node.nodes.panel_list;

                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("weekmonthlibao_open", [me.type], function (d) {
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

            me.setBanner();
            me.setTable();
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner3.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
                    node.removeAllChildren();
                    var txt_djs = new ccui.Text("", G.defaultFNT, 20);
                    var txt = new ccui.Text(L("HCZ"), G.defaultFNT, 20);
                    txt_djs.setTextColor(cc.color("#2bdf02"));
                    txt.setTextColor(cc.color("#ffffff"));
                    X.enableOutline(txt_djs, "#000000", 2);
                    X.enableOutline(txt, "#000000", 2);
                    txt_djs.setAnchorPoint(1, 0.5);
                    txt.setAnchorPoint(0, 0.5);
                    txt_djs.setPosition(node.width / 2, node.height / 2);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt_djs);
                    node.addChild(txt);
                    if(me.DATA.et - G.time > 24 * 3600) {
                        txt_djs.setString(X.moment(me.DATA.et - G.time));
                        txt.hide();
                    }else {
                        X.timeout(txt_djs, me.DATA.et, function () {
                            me.refreshPanel();
                        });
                    }
                }
            },me.nodes);
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "4504a"},
            });
        },
        setTable: function () {
            var me = this;
            var conf = G.class.getConf("weekmonth")[me.type];
            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);

            var arr = [];
            var data = me.DATA.itemdict;
            var keys = X.keysOfObject(data);
            for(var i = 0; i < keys.length; i ++){
                data[keys[i]].pid = keys[i];
                data[keys[i]].conf = conf.itemdict[keys[i]];
                arr.push(data[keys[i]]);
            }
            arr.sort(function (a, b) {
                return a.conf.rmbmoney < b.conf.rmbmoney ? -1 : 1;
            });

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(arr);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                btn: function (node) {
                    node.setBright(data.num < 1 ? false : true);
                    node.setTouchEnabled(data.num < 1 ? false : true);
                    node.click(function (sender, type) {
                        G.event.once('paysuccess', function() {
                            G.frame.jiangli.data({
                                prize: data.conf.p
                            }).show();
                            G.frame.huodong.updateTop();
                            me.refreshPanel();
                        });
                        G.event.emit('doSDKPay', {
							pid:data.pid,
                            logicProid: data.pid,
                            money: data.conf.rmbmoney,
                        });
                    }, 1000)
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.conf.p, "left", {
                        touch: true,
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("XGX"), data.num), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0.5,0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt);
                },
                btn_txt: function (node) {
                    node.setString(data.conf.rmbmoney / 100 + L("YUAN"));
                    if(data.num < 1){
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else{
                        node.setTextColor(cc.color("#7b531a"))
                    }
                },
                img_zk: function (node) {
                    if(data.conf.sale) {
                        node.show();
                        node.children[0].setString(data.conf.sale + L("sale"));
                        X.enableOutline(node.children[0], "#008000", 2);
                    } else {
                        node.hide()
                    }
                }
            }, ui.nodes);
            ui.show();
        }
    })
})();
