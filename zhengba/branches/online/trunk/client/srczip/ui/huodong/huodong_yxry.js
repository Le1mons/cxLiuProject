/**
 * Created by LYF on 2018/11/29.
 */
(function () {
    //英雄荣耀
    G.class.huodong_yxry = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super('event_scrollview.json');
        },
        bindBtn:function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
        },
        onShow : function(){
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            X.viewCache.getView("event_list4.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
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
                    node.setBackGroundImage("img/event/img_event_banner18.png");
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
            }, me.nodes);

            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: me._data.model},
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
            var me = this;
            X.autoInitUI(ui);

            if (me.DATA.myinfo.val[data.id] && me.DATA.myinfo.val[data.id] >= data.val ) {
                if (X.inArray(me.DATA.myinfo.gotarr[data.id], data.val)) {
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
            } else {
                G.removeNewIco(ui.nodes.btn);
                ui.nodes.btn_txt.setString(L('LQ'));
                ui.nodes.btn.setEnableState(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }

            X.render({
                btn: function (node) {
                    node.idx = idx;
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    node.click(function(sender, type) {
                        me.ajax('huodong_use', [me._data.hdid, 1, sender.idx], function(str, dd) {
                            if (dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                ui.nodes.btn_txt.setString(L('YLQ'));
                                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                ui.nodes.btn.setEnableState(false);
                                G.removeNewIco(ui.nodes.btn);
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                                me.refreshPanel();
                            }
                        }, true);
                    })
                },
                ico_item: function (node) {
                    X.alignItems(node, data.p, "left", {
                        touch: true,
                    });
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("YXRY"), G.class.tongyu.getHerosByID(data.id)[data.val < 6 ? 0 : 1].name, data.val), G.defaultFNT, 22);
                    txt.setTextColor(cc.color(me.DATA.myinfo.val[data.id] && me.DATA.myinfo.val[data.id] >= data.val ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2);
                    node.addChild(txt);
                },
            }, ui.nodes);
        },
        refreshPanel: function () {
            var me = this;

            G.frame.huodong.getData(me._data.hdid, function (data) {
                me.DATA = data;
                me.setContents();
            });
        },
    });

})();