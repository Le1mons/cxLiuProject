/**
 * Created by on 2020-xx-xx.
 */
(function () {
    //
    var ID = 'csdh';
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

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.text_zdjl.setString(L("DHJL"));
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me._data = me.data()._data;
        },
        onShow: function () {
            var me = this;

            new X.bView("event_chuanqiduihuan_chuanqiduihuan.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.setContents();
                cc.enableScrollBar(view.nodes.listview);
                cc.enableScrollBar(view.nodes.scrollview);
            });
        },
        setContents: function () {
            var me = this;

            me.showItemNum();
            me.setTable();
        },
        showItemNum: function () {
            var me = this;

            X.render({
                zs10: function (node) {
                    node.setBackGroundImage(G.class.getItemIco(me._data.data.showitem.t), 1);
                },
                fnt_player: G.class.getOwnNum(me._data.data.showitem.t, me._data.data.showitem.a)
            }, me.view.nodes);
        },
        setTable: function () {
            var me = this;
            var data = me.data().DATA.info.duihuan;

            if (!me.table) {
                me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, index) {
            var me = this;
            var itemArr = [].concat(data.need, data.p);

            function f(node, prize) {
                node.show();
                if (!prize) return node.removeAllChildren();
                var item = G.class.sitem(prize);
                item.setPosition(node.width / 2, node.height / 2);
                node.removeAllChildren();
                node.addChild(item);
                G.frame.iteminfo.showItemInfo(item);
            }
            var useNum = me.data().DATA.myinfo.gotarr[index] || 0;
            X.autoInitUI(ui);
            X.render({
                panel_tx1: function (node) {
                    f(node, itemArr[0]);
                },
                panel_tx2: function (node) {
                    f(node, itemArr[1]);
                },
                panel_tx3: function (node) {
                    f(node, itemArr[2]);
                },
                fuhao1: function (node) {
                    node.show();
                    node.setBackGroundImage('img/event/img_event_' + (data.need.length > 1 ? 'plus' : 'equal') + '.png',1);
                },
                fuhao2: function (node) {
                    node.setVisible(itemArr.length > 2);
                    node.setBackGroundImage('img/event/img_event_equal.png',1);
                },
                shengyu_wz: function (node) {
                    var rh = X.setRichText({
                        str: L("residue") + "：" + (data.buynum - useNum),
                        parent: node,
                    });
                    rh.setPosition(node.width - rh.trueWidth(), node.height / 2 - rh.trueHeight() / 2);
                },
                btn_yici: function (node) {
                    node.setEnableState(data.buynum - useNum > 0);
                    node.click(function () {
                        function buy (num) {
                            me.ajax("huodong_use", [me._data.hdid, 1, index, num], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    me.showItemNum();
                                    if (!me.data().DATA.myinfo.gotarr[index]) me.data().DATA.myinfo.gotarr[index] = 0;
                                    me.data().DATA.myinfo.gotarr[index] += num;
                                    me.setTable();
                                }
                            });
                        }
                        G.frame.buying.data({
                            num: 1,
                            item: data.p,
                            need: data.need,
                            maxNum: data.buynum - useNum,
                            callback: function (num) {
                                buy(num);
                            }
                        }).show();
                    });
                },
                txt_szq: function (node) {
                    node.setString(L("DUIHUAN"));
                    node.setTextColor(cc.color(data.buynum - useNum > 0 ? G.gc.COLOR.n13 : G.gc.COLOR.n15));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();