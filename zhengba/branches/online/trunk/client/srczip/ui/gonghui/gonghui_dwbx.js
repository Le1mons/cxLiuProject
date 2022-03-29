/**
 * Created by LYF on 2018/12/5.
 */
(function () {
    //公会-段位宝箱
    var ID = 'gonghui_dwbx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("GHSJDWJL"))
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView("gonghui_ghzf_dwbx.json", function (node) {
                me.view = node;
                me.nodes.panel_nr.addChild(node);
                me.setContents();
            });
        },
        getData: function(callback) {
            var me = this;

            me.ajax("ghcompeting_openprize", [me.type], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("gonghui", 1, function () {
                if(G.frame.gonghui_ghz.isShow) {
                    G.frame.gonghui_ghz.checkRedPoint();
                }
                if(G.frame.gonghui_zhengfeng.isShow) {
                    G.frame.gonghui_zhengfeng.checkRedPoint();
                }
            });
        },
        setContents: function () {
            var me = this;

            me.dw = G.frame.gonghui_zhengfeng.DATA.segmentdata.topsegment || G.frame.gonghui_zhengfeng.DATA.segmentdata.segment;
            me.view.nodes.txt_dw.setString(L("GHZ_DW" + me.dw));

            me.view.nodes.list.hide();
            cc.enableScrollBar(me.view.nodes.scrollview);

            me.data = [];
            for (var i = 0; i < G.frame.gonghui_main.DATA.ghdata.maxusernum; i ++) {
                me.data.push(i);
            }

            X.radio([me.view.nodes.page1, me.view.nodes.page2, me.view.nodes.page3], function (sedner) {
                var type = {
                    page1$: 2,
                    page2$: 3,
                    page3$: 4,
                };
                me.changeType(type[sedner.getName()]);
            });
            me.view.nodes.page1.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function (type) {
            var me = this;

            me.type = type;
            me.getData(function () {
                me.setTable(true);
            })
        },
        setTable: function (bool) {
            var me = this;

            bool = bool || false;

            if(!me.table) {
                var table = me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.panel_list, 3, function (ui, data, pos) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(me.data);
                table.reloadDataWithScroll(bool);
            } else {
                me.table.setData(me.data);
                me.table.reloadDataWithScroll(bool);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.nodes.panel_bx.removeBackGroundImage();
            ui.nodes.panel_wp.removeAllChildren();
            ui.nodes.panel_wp.setTouchEnabled(false);
            ui.nodes.txt_name.setString("");

            if(me.dw >= me.type) {
                if(me.DATA.prizedata && me.DATA.prizedata[data]) {
                    ui.nodes.panel_bx.setTouchEnabled(false);
                    var item = G.class.sitem(me.DATA.prizedata[data].prize[0]);
                    item.setAnchorPoint(0.5, 0.5);
                    item.setPosition(ui.nodes.panel_wp.width / 2, ui.nodes.panel_wp.height / 2);
                    if(me.DATA.prizedata[data].prize[0].t == "2003" && me.DATA.prizedata[data].prize[0].n >= 1000) {
                        G.class.ani.show({
                            json: "ani_wupingkuang",
                            addTo: item,
                            x: 50,
                            y: 50,
                            repeat: true,
                            autoRemove: false,
                        });
                    }
                    G.frame.iteminfo.showItemInfo(item);
                    ui.nodes.panel_wp.addChild(item);
                    ui.nodes.txt_name.setString(me.DATA.prizedata[data].headdata.name);
                    if(P.gud.uid == me.DATA.prizedata[data].headdata.uid) {
                        ui.nodes.txt_name.setTextColor(cc.color("#25891c"));
                    } else {
                        ui.nodes.txt_name.setTextColor(cc.color("#804326"));
                    }
                    ui.nodes.img_dwbxdi.show();
                } else {
                    ui.nodes.img_dwbxdi.hide();
                    ui.nodes.panel_bx.setTouchEnabled(true);
                    ui.nodes.panel_bx.setSwallowTouches(false);
                    ui.nodes.panel_bx.setBackGroundImage("img/gonghui/img_dwbx" + (me.type - 1) + ".png", 1);
                    ui.nodes.panel_bx.idx = data;
                    ui.nodes.panel_bx.touch(function (sender, type) {
                        if(type == ccui.Widget.TOUCH_NOMOVE) {
                            me.view.nodes.panel_mask.show();
                            me.ajax("ghcompeting_recsegmentprize", [me.type, sender.idx], function (str, data) {
                                if(data.s == 1) {
                                    ui.nodes.panel_bx.removeBackGroundImage();
                                    G.class.ani.show({
                                        json: "ani_gonghuizhenfen_baoxiang",
                                        addTo: ui.nodes.panel_bx,
                                        x: ui.nodes.panel_bx.width / 2,
                                        y: ui.nodes.panel_bx.height / 2,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function (node, action) {
                                            action.play("bx" + (me.type - 1), false);
                                        },
                                        onend: function () {
                                            G.frame.jiangli.data({
                                                prize: data.d.prize
                                            }).show();
                                            if(data.d.prize[0].t == "2003") {
                                                G.view.toper.updateAttr();
                                            }
                                            me.getData(function () {
                                                me.setTable();
                                                me.view.nodes.panel_mask.hide();
                                            });
                                        }
                                    });
                                } else {
                                    me.getData(function () {
                                        me.setTable();
                                        me.view.nodes.panel_mask.hide();
                                    });
                                }
                            })
                        }
                    })
                }
            } else {
                ui.nodes.img_dwbxdi.hide();
                ui.nodes.panel_bx.setBackGroundImage("img/gonghui/img_dwbx_suo" + (me.type - 1) + ".png", 1);
                ui.nodes.panel_bx.setTouchEnabled(true);
                ui.nodes.panel_bx.setSwallowTouches(false);
                ui.nodes.panel_bx.touch(function (sender, type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE) {
                        G.tip_NB.show(L("WDDDW"));
                    }
                })
            }

            ui.show();
        }
    });
    G.frame[ID] = new fun('gonghui_tip2.json', ID);
})();