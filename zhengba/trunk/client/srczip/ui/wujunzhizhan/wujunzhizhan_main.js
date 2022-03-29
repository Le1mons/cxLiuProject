/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_main';

    var fun = X.bUi.extend({
        camp: {
            1: L("camp_gmyh"),
            2: L("camp_yslm"),
            3: L("camp_sgjy"),
            4: L("camp_wlbl"),
            5: L("camp_ayyh")
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.showToper();

            me.nodes.listview.setBounceEnabled(false);
            me.nodes.panel_2.finds("Image_2").setTouchEnabled(true);

            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview_lt);

            // G.class.ani.show({
            //     json: "gvg_bg_dh",
            //     addTo: me.nodes.panel_dh,
            //     repeat: true,
            //     autoRemove: false
            // });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS56")
                }).show();
            });
            me.nodes.btn_fszr.click(function () {
                G.frame.wujunzhizhan_def.show();
            });
            me.nodes.btn_jlyl.click(function () {
                G.frame.wujunzhizhan_jlyl.show();
            });
            me.nodes.btn_jtph.click(function () {
                G.frame.wujunzhizhan_jtpm.show();
            });
            me.nodes.btn_ljph.click(function () {
                G.frame.wujunzhizhan_ljpm.show();
            });
            me.nodes.btn_lt.click(function () {
                G.frame.chat.data({
                    type: 5
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            G.hongdian.getData("wjzz", 1, function () {
                G.frame.jingjichang.checkRedPoint();
            });
        },
        onShow: function () {
            var me = this;

            me.initCamp();
            me.setCampState();
            me.setTopInfo();
            me.showChat();
        },
        initCamp: function () {
            var me = this;
            var data = G.frame.wujunzhizhan.DATA;
            var faction = data.faction;

            me.campArr = [];
            for (var index = 0; index < faction.length; index ++) {
                (function (index) {
                    var campData = faction[index];
                    var cityPanel = me.nodes["panel_list" + campData.faction];
                    var cityUi = me.nodes.panel_1.clone();
                    X.autoInitUI(cityUi);
                    cityUi.nodes.img_wo.setVisible(campData.faction == data.data.faction);
                    cityUi.nodes.panel_dwz.setBackGroundImage("img/wujunzhizhan/img_wz" + campData.faction + ".png", 1);
                    cityUi.setPosition(0, 0);
                    cityUi.show();
                    cityPanel.removeAllChildren();
                    cityPanel.addChild(cityUi);
                    me.campArr.push(cityUi);
                    cityPanel._defaultScale = cityPanel.scale;
                    cityPanel.setTouchEnabled(true);
                    cityPanel.touch(function (sender, type) {
                        G.view.mainView._buildClickAni(sender, type);
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            if (campData.faction == data.data.faction) return G.tip_NB.show(L("NO_KILL_ME"));
                            if (G.time < X.getTodayZeroTime() + 8 * 3600) return G.tip_NB.show(L("WJZZ_XZ"));
                            if (G.time > X.getTodayZeroTime() + 22 * 3600) return G.tip_NB.show(L("JRDTZSJYJS"));
                            G.frame.wujunzhizhan_pk.data({
                                camp: campData.faction
                            }).show();
                        }
                    });
                    cityPanel.removeBackGroundImage();
                    G.class.ani.show({
                        json: "gvg_0" + {1: 1, 2: 4, 3: 3, 4: 5, 5: 2}[campData.faction] + "_dh",
                        addTo: cityUi.nodes.panel_jianzhu,
                        y: 0,
                        repeat: true,
                        autoRemove: false
                    });
                })(index);
            }
        },
        setCampState: function () {
            var me = this;
            var data = G.frame.wujunzhizhan.DATA;
            var faction = data.faction;

            for (var index = 0; index < me.campArr.length; index ++) {
                var cityUi = me.campArr[index];
                var campData = faction[index];
                X.render({
                    panel_wz: function (node) {
                        var str = campData.live >= 1 ? L("ZhuFang") + "：<font color=#ffffff>" + campData.live + "/" + campData.team + "</font>" :
                            L("SJSS") + "：<font color=#e34215>" + X.fmtValue(campData.num) + "</font>";
                        var rh = X.setRichText({
                            parent: node,
                            str: str,
                            color: "#fbe06b",
                            outline: "#492213",
                            size: 20
                        });
                        rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                    },
                    img_jdt1: function (node) {
                        if (campData.live <= 0) return node.hide();
                        else node.show();

                        node.setPercent(campData.live / campData.team * 100);
                    }
                }, cityUi.nodes);
            }
        },
        setTopInfo: function () {
            var me = this;
            var data = G.frame.wujunzhizhan.DATA.strongest;

            X.render({
                txt_name: data ? data.headdata.name : L("XWYD"),
                panel_wz_ljs: function (node) {
                    var str = "<font color=#E84004>" + (data ? data.num : 0) + "</font>" + L("LIANJI");
                    var rh = X.setRichText({
                        parent: node,
                        str: str,
                        color: "#DBAE4D"
                    });
                    rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                }
            }, me.nodes);
        },
        showChat: function () {
            if (!cc.isNode(this.ui)) return false;
            var me = this;
            var data = G.frame.chat.chatData[5] || [];

            if (!me.chatTable) {
                me.chatTable = new X.TableView(me.nodes.scrollview_lt, me.nodes.panel_wz, 1, function (ui, data) {
                    me.setChatItem(ui, data);
                }, null, null, 4, 10);
                me.chatTable.setData(data);
                me.chatTable.reloadDataWithScroll(true);
                me.chatTable.scrollToCell(data.length - 1);
            } else {
                me.chatTable.setData(data);
                me.chatTable.reloadDataWithScroll(false);
            }
        },
        setChatItem: function (ui, data) {
            X.autoInitUI(ui);
            X.render({
                panel_wz_lt: function (node) {
                    var str = data.name ? "<font color=#dcaf4e>" + data.name + ":</font>" + data.m
                        : L("system") + ":" + data.m;
                    var rh = X.setRichText({
                        str: str,
                        parent: node,
                        size: 17,
                        color: data.name ? "#d4c59f" : "#f94600",
                    });
                    rh.setPosition(5, node.height / 2 - rh.trueHeight() / 2);
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_jt.json', ID);
})();