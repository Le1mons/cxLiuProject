/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd_dh';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.img_banner.setBackGroundImage('img/wuyipaidui/img_banner02.png', 1);
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;

            me.setTable();
            me.showAttr();
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.wyhd.duihuan;
            var data = [];
            cc.each(conf, function (obj, id) {
                var _obj = JSON.parse(JSON.stringify(obj));
                _obj.id = id;
                _obj.buyNum = G.frame.wyhd.DATA.myinfo.duihuan[_obj.id] || 0;
                _obj.buyMax = _obj.buyNum >= _obj.maxnum;
                data.push(_obj);
            });
            data.sort(function (a, b) {
                if (a.buyMax != b.buyMax) {
                    return a.buyMax < b.buyMax ? -1 : 1;
                } else {
                    return Number(a.id) < Number(b.id) ? -1 : 1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao2, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        showAttr: function () {
            var me = this;
            var need = G.gc.wyhd.duihuan[1].need[0];

            var node = new ccui.ImageView(G.class.getItemIco(need.t), 1);
            node.scale = .8;
            var rh = X.setRichText({
                str: X.STR(L("YYXG"), "<font node=1></font><font color=#2eb31b>" + X.fmtValue(G.class.getOwnNum(need.t, need.a)) + "</font>"),
                parent: me.nodes.panel_sl,
                node: node,
                color: '#804326',
                size: 20
            });
            rh.x = 0;
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                item1: function (node) {
                    var item = G.class.sitem(data.need[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                item2: function (node) {
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                txt: function (node) {
                    node.setTextColor(cc.color('#804326'));
                    node.setString(X.STR(L("DOUBLE12"), data.maxnum - data.buyNum));
                },
                btn: function (node) {
                    node.setEnableState(!data.buyMax);
                    node.click(function () {
                        G.frame.buying.data({
                            num: 1,
                            item: data.prize,
                            need: data.need,
                            maxNum: data.maxnum - data.buyNum,
                            callback: function (num) {
                                me.ajax('labour_duihuan', [data.id, num], function (str, _data) {
                                    if (_data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        if (!G.frame.wyhd.DATA.myinfo.duihuan[data.id]) {
                                            G.frame.wyhd.DATA.myinfo.duihuan[data.id] = 0;
                                        }
                                        G.frame.wyhd.DATA.myinfo.duihuan[data.id] += num;
                                        me.setTable();
                                        me.showAttr();
                                    }
                                });
                            }
                        }).show();
                    });
                },
                btn_txt: function (node) {
                    node.setTextColor(cc.color(data.buyMax ? '#6c6c6c' : '#7b531a'));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wuyipaidui_tk1.json', ID);
})();