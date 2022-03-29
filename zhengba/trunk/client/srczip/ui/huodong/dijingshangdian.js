/**
 * Created by LYF on 2019/9/20.
 */
(function () {
    //地精商店
    var ID = 'dijingshangdian';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            me.that = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();

            me.nodes.txet_kgjf.setString(G.class.getOwnNum('2052', 'item'));
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.that.DATA.info.arr;

            var showBuyNumTxt = function (txtNode, index) {
                var canBuyNum = data[index].num;
                var buyNum = me.that.DATA.myinfo.val[index] || 0;
                var rh = X.setRichText({
                    parent: txtNode,
                    str: canBuyNum > 0 ? X.STR(L('XGX'), canBuyNum - buyNum) : L("YJ"),
                    size: 18,
                    color: "#804326"
                });
                rh.setPosition(txtNode.width / 2 - rh.trueWidth() / 2, txtNode.height / 2 - rh.trueHeight() / 2)
            };

            for (var i = 0; i < data.length; i ++) {
                (function (index) {
                    var _list = me.nodes.panel_list.clone();
                    var conf = data[index];
                    var prize = [];
                    for (var i = 0; i < conf.need.length; i ++) {
                        prize.push(conf.need[i]);
                    }
                    for (var i = 0; i < conf.prize.length; i ++) {
                        prize.push(conf.prize[i]);
                    }

                    X.autoInitUI(_list);
                    X.render({
                        img_plus: function (node) {
                            if (conf.need.length < 2) {
                                node.loadTexture("img/event/img_event_equal.png", 1);
                            }
                        },
                        img_event_equal: function (node) {
                            if (prize.length < 3) node.hide();
                            else if (conf.need.length > 1) {
                                node.loadTexture("img/event/img_event_equal.png", 1);
                            }
                        },
                        item1: function (node) {
                            X.alignCenter(node, [].concat(prize[0]), {
                                touch: true
                            });
                        },
                        item2: function (node) {
                            X.alignCenter(node, [].concat(prize[1]), {
                                touch: true
                            });
                        },
                        item3: function (node) {
                            if (!prize[2]) return node.hide();
                            X.alignCenter(node, [].concat(prize[2]), {
                                touch: true
                            });
                        },
                        btn_txt:function (node) {
                            node.setString(L('DUIHUAN'));
                            node.setTextColor(cc.color(G.gc.COLOR.n12));
                        },
                        txt: function (node) {
                            showBuyNumTxt(node, index);
                        },
                        btn: function (node) {
                            node.click(function () {
                                if (data[index].num - (me.that.DATA.myinfo.val[index] || 0) <= 0) return G.tip_NB.show(L("DUIHUAN") + L('CSBZ'));

                                G.frame.buying.data({
                                    num: 1,
                                    item: conf.prize,
                                    need: conf.need,
                                    maxNum: data[index].num - (me.that.DATA.myinfo.val[index] || 0),
                                    callback: function (num) {
                                        me.that.angling(index, num, function () {
                                            showBuyNumTxt(_list.nodes.txt, index);
                                            me.nodes.txet_kgjf.setString(G.class.getOwnNum('2052', 'item'));
                                        });
                                    }
                                }).show();
                            });
                        }
                    }, _list.nodes);
                    _list.show();
                    me.nodes.listview.pushBackCustomItem(_list);
                })(i);
            }
        }
    });
    G.frame[ID] = new fun('ui_hjkg_sd.json', ID);
})();