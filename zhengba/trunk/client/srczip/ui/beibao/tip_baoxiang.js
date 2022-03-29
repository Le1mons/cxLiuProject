/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //使用道具宝箱
    var ID = 'tip_baoxiang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            var maxnum = G.class.getOwnNum(me.conf.itemid, 'item');
            X.render({
                btn_1: function (node) {
                    node.click(function (sender) {
                        if (me.num > 1) {
                            me.num--;
                            me.initUI();
                        }
                    })
                },
                btn_2: function (node) {
                    node.click(function (sender) {
                        if (me.num < maxnum) {
                            me.num++;
                            me.initUI();
                        }
                    })
                },
                btn_jian10: function (node) {
                    node.click(function (sender) {
                        // if (me.num - 10 > 0) {
                        //     me.num -= 10;
                        me.num = me.num - 10 > 0 ? me.num - 10 : 1;
                        me.initUI();
                        // }
                    })
                },
                btn_jia10: function (node) {
                    node.click(function (sender) {
                        // if (me.num + 10 <= maxnum) {
                        //     me.num += 10;
                        me.num = me.num + 10 > maxnum ? maxnum : me.num + 10;
                        me.initUI();
                        // }
                    })
                },
                btn_qr: function (node) {
                    if (me.data().xianshi) {
                        node.hide();
                    }
                    node.setTouchEnabled(true);
                    node.click(function () {
                        G.ajax.send('item_use', [me.conf.itemid, me.num], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                if (d.d.prize) {
                                    G.frame.jiangli.data({
                                        prize: d.d.prize
                                    }).show();
                                    me.remove();
                                    G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                }
                            }
                        }, true);
                    });
                },
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().item;
            me.conf = G.gc.item[me.DATA.itemid || me.DATA.t];
            me.num = 1;
            me.bindBtn();
            me.type = me.data().type;
        },
        onAniShow: function () {
            var me = this;
        },
        initUI: function () {
            var me = this;
            me.nodes.txt_sr.setString(me.num);

            me.nodes.btn_1.setVisible(me.type == 'bag');
            me.nodes.btn_2.setVisible(me.type == 'bag');
            me.nodes.btn_jian10.setVisible(me.type == 'bag');
            me.nodes.btn_jia10.setVisible(me.type == 'bag');
            me.nodes.txt_sr.setVisible(me.type == 'bag');
            me.ui.finds('image_1').setVisible(me.type == 'bag');
        },
        getdiaoluo: function () {
            var me = this;
            me.diaoluo = [];
            for (var i = 0; i < me.conf.dlp.length; i++) {
                me.diaoluo = me.diaoluo.concat(G.gc.diaoluo[me.conf.dlp[i]]);
            }
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.finds('txt_sr$_0').setString(me.conf.name)
            me.setContents();
            me.initUI();
            
            me.nodes.panel_bg.setTouchEnabled(true);
        },
        setContents: function () {
            var me = this;
            me.getdiaoluo();

            me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_wp, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, cc.size(this.nodes.list_wp.width + 5, this.nodes.list_wp.height), null, 1, 0);
                table.setData(me.diaoluo);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.diaoluo);
                me.table.reloadDataWithScroll(false);
            }
            me.nodes.txt_qr.setString(L("KAIQI"));
        },
        setItem: function (ui, data) {
            var me = this;
            ui.show();
            // var data = me.diaoluo[id]
            ui.removeAllChildren();
            var item = G.class.sitem(data);
            // item.setScale(0.8);
            ui.addChild(item);
            item.setPosition(ui.width / 2, ui.height / 2);

            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            G.frame.iteminfo.showItemInfo(item);
            // item.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_NOMOVE) {
            //         me.nodes.txt_name.setString(sender.conf.name);
            //         me.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[sender.conf.color]));
            //     }
            // });
        }
    });
    G.frame[ID] = new fun('tip_baoxiang.json', ID);
})();