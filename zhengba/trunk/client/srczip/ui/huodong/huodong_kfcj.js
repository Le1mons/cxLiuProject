/**
 * Created by LYF on 2018/9/12.
 */
(function () {
    //开服冲级
    G.class.huodong_kfcj = X.bView.extend({
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
                    node.setBackGroundImage('img/event/img_event_banner12.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
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
            cc.enableScrollBar(scrollview);

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]+pos[1]);
                }, null, null, 1, 3);
                table.setData(me.DATA.info.arr);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(me.DATA.info.arr);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, data, idx) {
            var me = this;
            X.autoInitUI(ui);

            var etime = me._data.etime || 0;
            if (G.time < etime) {
                if (P.gud.lv >= data.val && data.buynum > 0){
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
                    G.removeNewIco(ui.nodes.btn);
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
                                if(me._data.isqingdian){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                                me.refreshPanel();
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
                    var txt = new ccui.Text(X.STR(me._data.data.show,data.val) + X.STR('({1}/{2})',P.gud.lv,data.val), G.defaultFNT, 22);
                    txt.setTextColor(cc.color(P.gud.lv >= data.val ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2);
                    node.addChild(txt);
                },
                txt1: function (node) {
                    node.setString(X.STR(L("HSXF"), data.buynum));
                }
            }, ui.nodes);
            ui.show();
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