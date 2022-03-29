/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //使用道具宝箱
    var ID = 'usebox';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_yl.setString(L("XZHD"));

            if (!me.DATA.tid) {
                me.nodes.btn.hide();
                me.nodes.btn_xq.x = 300;
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn.click(function () {

                if(!me.selectId) return G.tip_NB.show(L("QXZYGDJ"));

                var index;
                for (var i in me.conf.arg) {
                    if(me.selectId == me.conf.arg[i].t) {
                        index = i;
                        break;
                    }
                }

                if (me.DATA.num == 1) {
                    G.frame.quedinghuode.data({
                        itemid: me.DATA.itemid,
                        index: index,
                        itemData: me.itemData
                    }).show();
                } else {
                    G.frame.buying.data({
                        num: 1,
                        item: [].concat(me.itemData),
                        need: [1],
                        maxNum: me.DATA.num,
                        btnTxt: L("QD"),
                        hideNeedNode: true,
                        callback: function (num) {
                            me.ajax('item_use', [me.DATA.itemid, num, index], function(str, dd) {
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
                }
            });

            me.nodes.btn_xq.click(function () {
                if(!me.selectId) return G.tip_NB.show(L("QXZYGDJ"));

                G.frame.iteminfo.data(me.item).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.item[me.DATA.itemid];
            me.nodes.txt_name.setString('');
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.nodes.list.hide();
            me.nodes.list.setTouchEnabled(false);
            cc.enableScrollBar(me.nodes.scrollview);

            me.setTable();
        },
        onHide: function () {
            var me = this;
        },
        setTable: function () {
            var me = this;

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(me.conf.arg);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            ui.removeAllChildren();
            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(item);

            if(me.selectId == data.t) {
                item.setGou(true);
            } else {
                item.setGou(false);
            }

            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(me.selectId == sender.data.t) return;
                    if(cc.isNode(me.item)) {
                        me.item.setGou(false);
                    }
                    sender.setGou(true);
                    me.itemData = data;
                    me.item = sender;
                    me.selectId = sender.data.t;
                    me.nodes.txt_name.setString(sender.conf.name);
                    me.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[sender.conf.color]));
                }
            });
        }
    });
    G.frame[ID] = new fun('ui_top_hd.json', ID);
})();