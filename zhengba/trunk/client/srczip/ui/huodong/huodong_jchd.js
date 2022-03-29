/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //竞猜活动
    G.class.huodong_jchd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setBanner();
            cc.enableScrollBar(me.nodes.scrollview);
            X.viewCache.getView("event_list6.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        refreshView: function() {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel: function () {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.setContents();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function (data) {
            //     me.DATA = data;
            //     me.setContents();
            // });
        },
        setContents: function () {
            var me = this;

            me.setTable();
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage("img/event/img_event_banner22.png");
                },
                panel_title: function(node) {
                    var rh = new X.bRichText({
                        size:22,
                        maxWidth:node.width + 60,
                        lineHeight:24,
                        family:G.defaultFNT,
                        color:G.gc.COLOR.n5,
                        eachText: function (node) {
                            X.enableOutline(node,'#000000');
                        },
                    });
                    rh.text(me._data.intr);
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
                txt_time: function (node) {
                    me.nodes.txt_count.setString(L("JCJSSJ"));
                    if(me._data.rtime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me._data.rtime - G.time));
                    }else {
                        if(me._data.rtime < G.time) {
                            me.nodes.txt_count.setString(L("LJJSSJ"));
                            me.isLQ = true;
                            X.timeout(node, me._data.etime, function () {
                                me.nodes.txt_count.setString(L("YJS"));
                            });
                        }else {
                            X.timeout(node, me._data.rtime, function () {
                                me.nodes.txt_count.setString(L("LJJSSJ"));
                                me.isLQ = true;
                                me.refreshPanel();
                                X.timeout(node, me._data.etime, function () {
                                    me.nodes.txt_count.setString(L("YJS"));
                                });
                            });
                        }
                    }
                }
            }, me.nodes);

            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "4505a"},
            });
        },
        setTable: function () {
            var me = this;
            var data = me.DATA.info.arr;

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] + pos[1]);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, idx) {
            X.autoInitUI(ui);
            var me = this;

            X.render({
                btn: function (node) {
                    node.idx = idx;
                    node.click(function(sender) {
                        me.ajax('huodong_use', [me._data.hdid, me.isLQ ? 2 : 1, sender.idx], function(str, dd) {
                            if (dd.s == 1) {
                                if(me.isLQ) {
                                    G.frame.jiangli.data({
                                        prize: data.p
                                    }).show();
                                }
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
                        }, true);
                    })
                },
                ico_item: function (node) {
                    X.alignItems(node, data.p, "left", {
                        touch: true,
                    });
                },
                txt_title: function(node) {
                    X.setRichText({
                        str: data.title,
                        parent: node,
                        anchor: {x: 0, y: 0.5},
                        pos: {x: 0, y: node.height / 2},
                        size: 20
                    });
                },
                txt: function(node) {
                    if(!me.isLQ) {
                        var img = new ccui.ImageView(G.class.getItemIco("rmbmoney"), 1);
                        img.setScale(.8);
                        X.setRichText({
                            str: "<font node=1></font>" + data.guessneed,
                            parent: node,
                            anchor: {x: 0.5, y: 0.5},
                            pos: {x: node.width / 2, y: node.height / 2 - 10},
                            size: 20,
                            node: img,
                        });
                    } else {
                        node.removeAllChildren();
                    }
                },
                btn_txt: me.isLQ ? L("LQ") : L("YZ"),
            }, ui.nodes);

            G.removeNewIco(ui.nodes.btn);
            if(!me.isLQ) {
                if(me.DATA.myinfo.val == -1) {
                    ui.nodes.btn_txt.setTextColor(cc.color("#7b531a"));
                    ui.nodes.btn.setEnableState(true);
                } else {
                    ui.nodes.btn.setEnableState(false);
                    ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                    if(idx == me.DATA.myinfo.val) {
                        ui.nodes.btn_txt.setString(L("YYZ"));
                    }
                }
            } else {
                if(me.DATA.myinfo.val == idx && me.DATA.info.win == idx) {
                    if(me.DATA.myinfo.gotarr.length < 1) {
                        ui.nodes.btn_txt.setTextColor(cc.color("#7b531a"));
                        ui.nodes.btn.setEnableState(true);
                        G.setNewIcoImg(ui.nodes.btn, .95);
                    } else {
                        ui.nodes.btn.setEnableState(false);
                        ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                        ui.nodes.btn_txt.setString(L("YLQ"));
                    }
                } else {
                    ui.nodes.btn.setEnableState(false);
                    ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                }
            }
        }
    });
})();