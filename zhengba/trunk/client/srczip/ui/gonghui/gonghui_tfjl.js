/**
 * Created by wfq on 2018/6/27.
 */
(function () {
    //公会-讨伐奖励
    var ID = 'gonghui_tfjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            // me._view.nodes.txt_title.setString(L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('gonghui_top_jsjl.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.initUi();
                me.bindBtn();

                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var listview = panel.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            var conf = G.gc.ghrw.base.fubenprize;
            var prize = conf.pmprize;

            for (var i = 0; i < prize.length + 1; i++) {
                var list = panel.nodes.list.clone();
                list.idx = i;
                me.setItem(list);
                listview.pushBackCustomItem(list);
                list.show();
            }
        },
        setItem: function (ui) {
            var me = this;

            var panel = me._view;

            X.autoInitUI(ui);
            X.render({
                txt_list: function (node) {
                    node.setString(ui.idx ? L('JISHA') + L('JIANGLI') : L('PER_FIGHT') + L('JIANGLI'));
                    // if (ui.idx == 1) {
                    //     ui.idx.y = 100;
                    // }
                    if (ui.idx > 1) {
                        node.hide();
                    }
                },
                panel_item: function (node) {
                    node.removeAllChildren();
                    node.setTouchEnabled(false);

                    var item;
                    if (ui.idx == 0) {
                        item = panel.nodes.list_item.clone();
                        me.setItem2(item);
                        item.setPosition(cc.p(node.width / 2,0));
                        node.addChild(item);
                        item.show();
                    } else {
                        var conf = G.gc.ghrw.base.fubenprize;
                        var prize = conf.pmprize;

                        var p = prize[ui.idx - 1];
                        item = panel.nodes.list_item.clone();
                        item.data = p;
                        me.setItem3(item);
                        item.setPosition(cc.p(node.width / 2,ui.idx > 1 ? 90 + (ui.height - 25) * (ui.idx - 2) : 0));
                        node.addChild(item);
                        item.show();

                        // var sumHeight = 0;
                        // for (var i = 0; i < prize.length; i++) {
                        //     sumHeight += panel.nodes.list_item.height + 10;
                        // }
                        // aaa = ui;
                        // node.height = sumHeight;
                        // ccui.helper.doLayout(node);

                        // node.height += sumHeight;
                        // ccui.helper.doLayout(node);
                        // ui.height += sumHeight;
                        // ccui.helper.doLayout(ui);

                        // for (var i = 0; i < prize.length; i++) {
                        //     var p = prize[i];
                        //     item = panel.nodes.list_item.clone();
                        //     item.data = p;
                        //     me.setItem3(item);
                        //     item.setPosition(cc.p(node.width / 2,0 - item.height - (item.height + 10) * i));
                        //     node.addChild(item);
                        //     item.show();
                        // }

                    }
                }
            },ui.nodes);
        },
        setItem2: function (ui) {
            var me = this;

            var conf = G.gc.ghrw.base.fubenprize;
            ui.setTouchEnabled(false);
            X.autoInitUI(ui);
            X.render({
                txt_rank: function (node) {
                    node.hide();
                },
                panel_flag: function (node) {
                    node.hide();
                },
                reward_item: function (node) {
                    node.x = 0;

                    node.removeAllChildren();
                    var prize = conf.fightprize;
                    X.alignItems(node,prize,'left',{
                        touch:true,
                        interval:15
                    });
                }
            },ui.nodes);
        },
        setItem3: function (ui) {
            var me = this;

            var prize = ui.data;
            ui.setTouchEnabled(false);
            X.autoInitUI(ui);
            X.render({
                txt_rank: function (node) {
                    node.hide();
                    var str = '';
                    var pm = prize[0];
                    if (pm[0] > 3) {
                        if (pm[0] == pm[1]) {
                            str = pm[0];
                        } else {
                            str = pm[0] + '-' + pm[1];
                        }
                        node.setString(str);
                        node.show();
                    }
                },
                panel_flag: function (node) {
                    node.hide();

                    var pm = prize[0];
                    if (pm[0] <= 3) {
                        node.setBackGroundImage('img/public/img_paihangbang_' + pm[0] + '.png',1);
                        node.show();
                    }
                },
                reward_item: function (node) {
                    node.removeAllChildren();

                    X.alignItems(node,prize[1],'left',{
                        touch:true,
                        interval:15
                    });
                }
            },ui.nodes);

        },
    });

    G.frame[ID] = new fun('ui_top6.json', ID);
})();