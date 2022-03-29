/**
 * Created by
 */
(function () {
    //
    var ID = 'lianhunta_select';
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
            me.DATA = me.data();
            me.selectIndex = me.DATA.selectIndex;

            me.nodes.btn_h.click(function () {
                if(me.lastNode){
                    if(me.lastNode.conf.usetype == 9){
                        G.frame.usebox.data(me.lastNode.conf).show();
                    }else if(me.lastNode.conf.usetype == 15){
                        G.frame.usebox_new.data(me.lastNode).show();
                    } else {
                        G.frame.iteminfo.data(me.lastNode).show();
                    }
                }else {
                    G.tip_NB.show(L("QXZYGMBJL"));
                }
            });

            me.nodes.btn_l.click(function () {
                if(me.lastNode){
                    if (G.frame.lianhunta.DATA.pool[me.lastNode.data.index] >= me.lastNode.data.num) {
                        return G.tip_NB.show(L("SLBZ"));
                    }
                    if (G.frame.lianhunta.DATA.fashita < me.lastNode.data.needNum) {
                        return G.tip_NB.show(L("lht_prizeLock"));
                    }
                    me.ajax('lianhunta_selectprize', [me.DATA.index, me.lastNode.data.index], function (str, data) {
                        if (data.s == 1) {
                            G.frame.lianhunta.getData(function () {
                                me.DATA.callback && me.DATA.callback();
                                me.remove();
                            });
                        }
                    });
                }else {
                    G.tip_NB.show(L("QXZYGMBJL"));
                }
            });

            me.nodes.listview.setItemsMargin(10);
        },
        onShow: function () {
            var me = this;

            me.showListView();
        },
        showListView: function () {
            var me = this;
            var arr = [];
            var obj = {};
            var data = JSON.parse(JSON.stringify(G.gc.lhtcom.prizepool));
            cc.each(data, function (_d, index) {
                _d.index = index;
                _d.needNum = _d.cond[0] || 0;
                cc.mixin(_d, _d.prize[0], true);
                if (!obj[_d.needNum]){
                    obj[_d.needNum] = {prize: []};
                    if (_d.needNum != 0) {
                        obj[_d.needNum].str = X.STR(L("lht_poolNeed"), _d.needNum);
                    }
                }
                obj[_d.needNum].prize.push(_d);
            });

            cc.each(obj, function (_obj) {
                if (_obj.str) arr.push(_obj.str);
                var prizeArr = [];
                cc.each(_obj.prize, function (prize) {
                    prizeArr.push(prize);
                    if (prizeArr.length == 4) {
                        arr.push(prizeArr);
                        prizeArr = [];
                    }
                });
                if (prizeArr.length > 0) arr.push(prizeArr);
            });

            cc.each(arr, function (item) {
                if (item instanceof Array) {
                    me.nodes.listview.pushBackCustomItem(me.setItem(item));
                } else {
                    var str = me.setStr(item);
                    me.nodes.listview.pushBackCustomItem(str);
                    str.children[0].x = -63;
                }
            });
        },
        setItem: function (prize) {
            var me = this;
            var list = me.nodes.panel_list.clone();
            list.show();
            X.alignItems(list.finds('panel_wp$'), prize, 'left', {
                mapItem: function (node) {
                    node.y = 63;
                    if (me.DATA.selectIndex == node.data.index) {
                        node.setGou(true);
                        me.lastNode = node;
                    }
                    node.title.y = -35;
                    //node.title.setTextColor(cc.color('#ffffff'));
                    node.title.setString('');
                    var txt = new ccui.Text(X.STR(L("DOUBLE12"), node.data.num - (G.frame.lianhunta.DATA.pool[node.data.index] || 0)), G.defaultFNT, 19);
                    txt.setAnchorPoint(0.5, 0.5);
                    txt.setPosition(node.title.width / 2, node.title.height / 2 + 5);
                    node.title.addChild(txt);
                    X.enableOutline(txt, '#000000', 2);
                    node.setTouchEnabled(true);
                    node.noMove(function () {
                        if (me.selectIndex == node.data.index) return;
                        node.setGou(true);
                        me.selectIndex = node.data.index;
                        if (me.lastNode) {
                            me.lastNode.setGou(false);
                        }
                        me.lastNode = node;
                    });
                }
            });
            return list;
        },
        setStr: function (str) {
            var me = this;
            var list = me.nodes.panel_diwz.clone();
            list.children[0].setString(str);
            X.enableOutline(list.children[0], '#000000', 2);
            return list;
        }
    });
    G.frame[ID] = new fun('lianhunta_tk2.json', ID);
})();