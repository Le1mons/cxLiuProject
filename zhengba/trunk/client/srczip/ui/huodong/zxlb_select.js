/**
 * Created by on 2020-xx-xx.
 */
(function () {
    //
    var ID = 'zxlb_select';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.panle_neirong.setTouchEnabled(false);
            me.nodes.panle_neirong.x = 0;
            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_zd.click(function () {
                if (me.DATA.select[me.idx] == undefined) return G.tip_NB.show(L("QXZYGDJ"));
                var atn = me.DATA.choose[me.idx][me.DATA.select[me.idx]];
                G.frame.iteminfo.data({
                    data: atn,
                    conf: G.class.getItem(atn.t, atn.a)
                }).show();
            });

            me.nodes.btn_xyg.click(function () {
                me.DATA.callback(me.DATA.select);
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.list_ico2.hide();
            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.finds("panel_zsy").setTouchEnabled(true);
            me.nodes.btn_xyg.children[0].setString(L("QD"));
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();
            me.DATA.select = JSON.parse(JSON.stringify(me.DATA.select));
            me.initTop();
            me.upItem();
        },
        upItem: function () {
            var me = this;

            cc.each(me.item, function (item, idx) {
                X.render({
                    ico: function (node) {
                        if (me.DATA.select[idx] != undefined) {
                            var item = G.class.sitem(me.DATA.choose[idx][me.DATA.select[idx]]);
                            item.setPosition(node.width / 2, node.height / 2);
                            node.removeAllChildren();
                            node.addChild(item);
                        }
                    },
                    jia: function (node) {
                        node.setVisible(me.DATA.select[idx] == undefined);
                    }
                }, item.nodes);
            });
        },
        initTop: function () {
            var me = this;
            me.item = {};
            me.showarr = [];
            for (var idx in me.DATA.choose) {
                var item = me.item[idx] = me.nodes.ico_list.clone();
                item.idx = idx;
                X.autoInitUI(item);
                // var parent = me.nodes["ico_" + (idx * 1 + 1)];
                // item.setPosition(0, parent.height / 2);
                // parent.addChild(item);
                item.show();
                item.nodes.ico.setTouchEnabled(false);
                item.setTouchEnabled(true);
                item.click(function (sender) {
                    me.idx = sender.idx;
                    me.setTable();
                });
                me.showarr.push(item);
            }
            X.center(me.showarr,me.nodes.panle_neirong);
            me.item[me.DATA.idx].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setTable: function () {
            var me = this;
            var data = me.DATA.choose[me.idx];
            cc.each(data, function (d, idx) {
                d.idx = idx;
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_ico2, 5, function (ui, data) {
                    me.setItem(ui, data);
                },null, null, 0, 6);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            ui.removeAllChildren();
            var me = this;
            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(item);
            item.setGou(me.DATA.select[me.idx] == data.idx);
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.noMove(function () {
                me.DATA.select[me.idx] = data.idx;
                me.setTable();
                me.upItem();
            });
        }
    });
    G.frame[ID] = new fun('sirendingzhi_tankuang.json', ID);
})();