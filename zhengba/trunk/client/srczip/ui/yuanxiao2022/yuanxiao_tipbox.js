/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //使用道具宝箱
    var ID = 'yuanxiao_tipbox';

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
                        if (me.num < me.maxnum) {
                            me.num++;
                            me.initUI();
                        }
                    })
                },
                // btn_jian10: function (node) {
                //     node.click(function (sender) {
                //         // if (me.num - 10 > 0) {
                //         //     me.num -= 10;
                //         me.num = me.num - 10 > 0 ? me.num - 10 : 1;
                //         me.initUI();
                //         // }
                //     })
                // },
                // btn_jia10: function (node) {
                //     node.click(function (sender) {
                //         // if (me.num + 10 <= me.maxnum) {
                //         //     me.num += 10;
                //         me.num = me.num + 10 > me.maxnum ? me.maxnum : me.num + 10;
                //         me.initUI();
                //         // }
                //     })
                // },
                btn_3: function (node) {
                    node.setTouchEnabled(true);
                    node.click(function () {
                        if(!me.selectId) return G.tip_NB.show(L("QXZYGDJ"));
                        var index;
                        for (var i in me.conf.arg) {
                            if(me.selectId == me.conf.arg[i].t) {
                                index = i;
                                break;
                            }
                        }
                        G.ajax.send('item_use', [me.conf.itemid, me.num,index], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                if (d.d.prize) {
                                    G.frame.jiangli.data({
                                        prize: d.d.prize
                                    }).show();
                                    me.remove();
                                    G.frame.yuanxiao2022.showIteminfo();
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
            me.maxnum = G.class.getOwnNum(me.conf.itemid, 'item');
            me.num = me.maxnum;
            me.bindBtn();
            me.type = 'bag';
        },
        onAniShow: function () {
            var me = this;
        },
        initUI: function () {
            var me = this;
            me.nodes.textfield_5.setString(me.num);
            me.nodes.textfield_5.setTouchEnabled(false);
            me.nodes.textfield_5.setTextHorizontalAlignment(1);
            me.nodes.panel_bx.removeAllChildren();
            var wid = G.class.sitem(me.DATA);
            wid.setPosition(me.nodes.panel_bx.width/2,me.nodes.panel_bx.height/2);
            me.nodes.panel_bx.addChild(wid);
            setTextWithColor(me.nodes.txt_bx,me.conf.name,G.gc.COLOR[me.conf.color || 0]);
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.setContents();
            me.initUI();
            me.nodes.panel_bg.setTouchEnabled(true);
        },
        setContents: function () {
            var me = this;

            me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, cc.size(this.nodes.list.width + 5, this.nodes.list.height), null, 1, 0);
                table.setData(me.conf.arg);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.conf.arg);
                me.table.reloadDataWithScroll(false);
            }
            me.nodes.btn_3.setTitleText(L("KAIQI"));
        },
        setItem: function (ui, data) {
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            ui.nodes.panel_wp.removeAllChildren();
            var item = G.class.sitem(data);
            ui.nodes.panel_wp.addChild(item);
            item.setPosition(ui.nodes.panel_wp.width / 2, ui.nodes.panel_wp.height / 2);
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            setTextWithColor(ui.nodes.txt_ms,item.conf.name,G.gc.COLOR[item.conf.color || 0]);
            if(me.selectId == data.t) {
                item.setGou(true);
            } else {
                item.setGou(false);
            }
            item.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(me.selectId == sender.data.t) return G.frame.iteminfo.data(sender).show();
                    if(cc.isNode(me.item)) {
                        me.item.setGou(false);
                    }
                    sender.setGou(true);
                    me.itemData = data;
                    me.item = sender;
                    me.selectId = sender.data.t;
                }
            });

        }
    });
    G.frame[ID] = new fun('yuanxiao_tk1.json', ID);
})();