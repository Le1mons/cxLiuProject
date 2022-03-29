/**
 * Created by LYF on 2018-11-8
 */
(function () {
    //累积豪礼
    G.class.huodong_lchl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json");
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
                    node.setBackGroundImage('img/event/img_event_banner17.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
                },
                // txt_count: L("CHONGZHI"),
                txt_time: function (node) {
                    if(me._data.rtime - G.time > 24 * 3600 * 2) {
                        me.nodes.txt_count.setString(L("HDLJSJ"));
                        node.setString(X.moment(me._data.rtime - G.time));
                    }else {
                        if(me._data.rtime < G.time) {
                            me.nodes.txt_count.setString(L("LJJSSJ"));
                            X.timeout(node, me._data.etime, function () {
                                node.setString(L("YJS"));
                            })
                        }else {
                            me.nodes.txt_count.setString(L("HDLJSJ"));
                            X.timeout(node, me._data.rtime, function () {
                                me.nodes.txt_count.setString(L("LJJSSJ"));
                                G.frame.huodong.getData(me._data.hdid, function (data) {
                                    me.DATA = data;
                                    me.setTable();
                                });
                                X.timeout(node, me._data.etime, function () {
                                    node.setString(L("YJS"));
                                })
                            })
                        }
                    }
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
            },me.nodes);
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "4505a"},
            });
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]+pos[1]);
            }, null, null, 1, 3);
            table.setData(me.DATA.info.arr);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data, idx) {
            var me = this;
            X.autoInitUI(ui);

            var etime = me._data.etime || 0;
            me.btn = ui.nodes.btn;
            me.btntxt = ui.nodes.btn_txt;
            if (G.time < etime) {
                if (me.DATA.myinfo.val >= data.val){
                    if (X.inArray(me.DATA.myinfo.gotarr, data.val)) {
                        ui.nodes.btn_txt.setString(L('YLQ'));
                        ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                        ui.nodes.btn.setEnableState(false);
                        G.removeNewIco(ui.nodes.btn);
                    } else {
                        ui.nodes.btn_txt.setString(L('LQ'));
                        if(G.time > me._data.rtime) {
                            if(me.DATA.myinfo.recidx == idx) {
                                ui.nodes.btn.setEnableState(true);
                                G.setNewIcoImg(ui.nodes.btn, .9);
                                ui.nodes.btn_txt.setTextColor(cc.color("#2f5719"));
                            }else {
                                ui.nodes.btn.setEnableState(false);
                                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                            }
                        }else {
                            ui.nodes.btn.setEnableState(false);
                            ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                        }
                    }
                }else{
                    ui.nodes.btn_txt.setString(L('LQ'));
                    ui.nodes.btn.setEnableState(false);
                    ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                }
            } else {
                ui.nodes.btn_txt.setString(L('LQ'));
                ui.nodes.btn.setEnableState(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }

            X.render({
                btn: function (node) {
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    node.click(function (sender, type) {
                        me.ajax('huodong_use', [me._data.hdid,1,idx], function (str, dd) {
                            if (dd.s == 1){
                                G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                changeData(dd.d.myinfo,me.DATA.myinfo);
                                // me.refreshPanel();
                                ui.nodes.btn_txt.setString(L('YLQ'));
                                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                ui.nodes.btn.setEnableState(false);
                                G.removeNewIco(ui.nodes.btn);
                                G.event.emit('hdchange',me._data.hdid);
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            }
                        },true);
                    })
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.p, 0, {
                        touch: true,
                        callback: function () {
                        }
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(me.DATA.info.show,data.val) + X.STR('({1}/{2})',me.DATA.myinfo.val,data.val), G.defaultFNT, 22);
                    txt.setTextColor(cc.color(me.DATA.myinfo.val >= data.val ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2);
                    node.addChild(txt);
                },
            }, ui.nodes);
            ui.show();
        },
        refreshPanel: function () {
            var me = this;

            G.frame.huodong.getData(me._data.hdid, function (data) {
                me.DATA = data;
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

            X.viewCache.getView("event_list4.json", function (node) {
                me.list = node.nodes.panel_list;

                me.refreshPanel();
            });
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        onRemove: function () {
            var me = this;
        },
    })
})();
