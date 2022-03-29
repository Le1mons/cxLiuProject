/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'usebox_new';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.panel_wpxq.setVisible(me.DATA.tid != undefined);
            me.nodes.btn.setVisible(me.DATA.tid == undefined);
            me.nodes.panel_top.setTouchEnabled(true);
            me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn.click(function () {
                if(!me.selectId) return G.tip_NB.show(L("QXZYGDJ"));
                G.frame.iteminfo.data(me.item).show();
            });
            me.nodes.btn_xq.click(function () {
                me.nodes.btn.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
            me.nodes.btn_qd1.click(function () {
                if(!me.selectId) return G.tip_NB.show(L("QXZYGDJ"));
                G.frame.buying.data({
                    num: 1,
                    item: [].concat(me.itemData),
                    need: [1],
                    maxNum: me.DATA.num,
                    btnTxt: L("QD"),
                    hideNeedNode: true,
                    callback: function (num) {
                        me.ajax('item_use', [me.DATA.itemid, num, me.groupIndex, me.index], function(str, dd) {
                            if (dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: dd.d.prize
                                }).show();
                                me.remove();
                                G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                            }
                        }, true);
                    }
                }).show();
            });

            for (var index = 0; index < me.CONF.arg.length; index ++) {
                var btn = me.nodes.list_btn.clone();
                X.autoInitUI(btn);
                X.render({
                    btn_qy1: function (node) {
                        node.setTouchEnabled(false);
                    },
                    txt_anwz: me.CONF.arg[index].name
                }, btn.nodes);
                btn.show();
                btn.index = index;
                btn.setTouchEnabled(true);
                me.nodes.listview.pushBackCustomItem(btn);
            }
            X.radio(me.nodes.listview.children, function (sender) {
                me.groupIndex = sender.index;
                me.selectId = undefined;
                me.index = undefined;
                me.item = undefined;
                me.setTable();
            }, {
                callback1: function (sender) {
                    sender.nodes.btn_qy1.setBright(false);
                    sender.nodes.txt_anwz.setTextColor(cc.color("#e8fdff"));
                    X.enableOutline(sender.nodes.txt_anwz, "#34221d", 2);
                },
                callback2: function (sender) {
                    sender.nodes.btn_qy1.setBright(true);
                    sender.nodes.txt_anwz.setTextColor(cc.color("#af9e89"));
                    X.enableOutline(sender.nodes.txt_anwz, "#34221d", 2);
                }
            });
            me.nodes.listview.children[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().data;
            me.CONF = me.data().conf;
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.render({
                text_name: function (node) {
                    setTextWithColor(node, me.CONF.name, G.gc.COLOR[me.CONF.color]);
                },
                panel_1: function (node) {
                    var item = G.class.sitem(me.DATA);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                }
            }, me.nodes);
        },
        setTable: function () {
            var me = this;
            me.nodes.list.hide();
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                }, cc.size(me.nodes.list.width + 5, me.nodes.list.height));
                me.table.setData(me.CONF.arg[me.groupIndex].prize);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.CONF.arg[me.groupIndex].prize);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data, pos) {
            var me = this;
            var item = G.class.sitem(data);
            ui.setName('item_' + data.t);
            item.show();
            item.setGou(me.index == pos);
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.setGou(false);
            if(me.selectId == data.t){
                item.setGou(true);
            }
            ui.item = item;
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (me.selectId == sender.data.t) return;
                    if (me.table._table.getItemByName('item_' + me.selectId) && cc.isNode(me.table._table.getItemByName('item_' + me.selectId)[0]) && cc.isNode(me.table._table.getItemByName('item_' + me.selectId)[0].item)) {
                        me.table._table.getItemByName('item_' + me.selectId)[0].item.setGou(false);
                    }
                    sender.setGou(true);
                    me.itemData = data;
                    me.item = sender;
                    me.selectId = sender.data.t;
                    me.index = pos;
                }
            });


            X.autoInitUI(ui);
            X.render({
                text_wp_name: function (node) {
                    node.setString(item.conf.name);
                    node.setTextColor(cc.color("#d4c59f"))
                },
                panel_wp: function (node) {
                    node.setTouchEnabled(false);
                    node.removeAllChildren();
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('ui_top_zxx.json', ID);
})();