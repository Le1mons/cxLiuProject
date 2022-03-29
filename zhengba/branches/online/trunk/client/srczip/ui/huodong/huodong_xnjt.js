/**
 * Created by LYF on 2019-01-25
 */
(function () {
    //新年积天

    G.frame.chongzhi.on("hide", function () {
        if(G.frame.huodong.xnjt) {
            G.frame.huodong.xnjt.refreshPanel();
        }
    });

    G.class.huodong_xnjt = X.bView.extend({
        ctor: function (data) {
            var me = this;
            G.frame.huodong.xnjt = me;
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
                    node.setBackGroundImage('img/event/img_event_banner19.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
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
                    rh.text(X.STR(me._data.intr, me.DATA.info.val));
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
                txt_count: L("CHONGZHI"),
                txt_time: function (node) {
                    if(me._data.etime - G.time > 24 * 3600 * 2) {
                        me.nodes.txt_count.hide();
                        node.setString(X.moment(me._data.etime - G.time));
                    }else {
                        X.timeout(node, me._data.etime, function () {
                            me.timeout = true;
                        })
                    }
                },
            },me.nodes);
            X.setRichText({
                str: X.STR(L("JRLC"), me.DATA.myinfo.num),
                parent: me.nodes.txt_jrlc,
                color: "#ffffff",
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: me.nodes.txt_jrlc.height / 2},
                size: 20,
                outline: "#000000"
            });
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "4105a"},
            });
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);


            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(me.DATA.info.arr);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(me.DATA.info.arr);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);

            var etime = me._data.etime || 0;
            G.removeNewIco(ui.nodes.btn);
            if (G.time < etime) {
                if (me.DATA.myinfo.val >= data.val){
                    if (X.inArray(me.DATA.myinfo.gotarr, data.val)) {
                        ui.nodes.btn_txt.setString(L('YLQ'));
                        ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                        ui.nodes.btn.setEnableState(false);
                        G.removeNewIco(ui.nodes.btn);
                    } else {
                        ui.nodes.btn_txt.setString(L('LQ'));
                        ui.nodes.btn.setEnableState(true);
                        ui.nodes.btn_txt.setTextColor(cc.color("#2f5719"));
                        G.setNewIcoImg(ui.nodes.btn, .9);
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
                        me.ajax('huodong_use', [me._data.hdid,1,data.val], function (str, dd) {
                            if (dd.s == 1){
                                G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                me.refreshPanel();
                                ui.nodes.btn_txt.setString(L('YLQ'));
                                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                ui.nodes.btn.setEnableState(false);
                                G.removeNewIco(ui.nodes.btn);
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
                    var txt = new ccui.Text(X.STR(me._data.data.show, data.val) + X.STR('({1}/{2})',me.DATA.myinfo.val, data.val), G.defaultFNT, 22);
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
    });

})();
