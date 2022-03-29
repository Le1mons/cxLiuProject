/**
 * Created by LYF on 2018/11/21.
 */
(function () {
    //大秘境-翻牌
    var ID = 'damijing_flop';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.finds("wz!").setString(G.class.watchercom.getAllFlopNeed());
        },
        bindBtn: function () {
            var me = this;
            var btn = [];

            for (var i = 1; i < 6; i ++) {
                me.nodes["list" + i].idx = i - 1;
                btn.push(me.nodes["list" + i]);
                me.nodes["list" + i].setTouchEnabled(false);
            }
            for (var i = 0; i < btn.length; i ++) {
                var card = btn[i];
                (function (card) {
                    card.click(function (sender) {
                        me.flop(sender);
                    }, 1500);
                })(card)
            }
            me.btn = btn;

            me.ui.finds("btn2").click(function () {
                me.idx = 1;
                me.isBuy = true;
                me.ui.finds("zhuangtai1").hide();
                for (var i = 0; i < me.aniNode.length; i ++) {
                    (function (i) {
                        me.aniNode[i].finds("wupin").removeAllChildren();
                        me.aniArr[i].playWithCallback("zhuankai2", false, function () {
                            me.aniArr[i].play("animation0", true);
                            me.aniNode[i].runActions([
                                cc.moveTo(0.1, cc.p(me.ui.width / 2, me.ui.height / 2)),
                                cc.moveTo(0.1, cc.p(me.nodes["list" + (i + 1)].x, me.nodes["list" + (i + 1)].y))
                            ]);
                            me.ui.setTimeout(function () {
                                for (var i = 1; i < 6; i ++) {
                                    me.nodes["list" + i].setTouchEnabled(true);
                                }
                                me.ui.finds("zhuangtai2").show();
                            }, 1000)
                        })
                    })(i)
                }
            });

            me.ui.finds("btn1").click(function () {
                me.ajax("watcher_getflopprize", [1], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "watcher_getflopprize"
                        });
                        me.isBuy = true;
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.ui.finds("zhuangtai1").hide();
                        me.ui.finds("zhuangtai3").show();
                    }
                });
            }, 2500);

            me.nodes.mask.click(function () {
                if(!me.idx && !me.isBuy) {
                    return;
                }else if(me.idx == 1 && me.isBuy) {
                    G.tip_NB.show(L("BCMFQWCG"));
                    return;
                }
                me.remove();
            })
        },
        flop: function(sender) {
            var me = this;

            me.ajax("watcher_getflopprize", [0], function (str, data) {
                if(data.s == 1) {
                    G.event.emit("sdkevent", {
                        event: "watcher_getflopprize"
                    });
                    G.frame.jiangli.data({
                        prize: data.d.prize
                    }).show();
                    sender.isFlop = true;
                    sender.setTouchEnabled(false);
                    me.idx ++;
                    me.setState();
                    var item = G.class.sitem(data.d.prize[0]);
                    item.setAnchorPoint(0.5, 0.5);
                    item.setPosition(me.aniNode[sender.idx].finds("wupin").width / 2, me.aniNode[sender.idx].finds("wupin").height / 2);
                    me.aniNode[sender.idx].finds("wupin").addChild(item);
                    me.aniArr[sender.idx].playWithCallback("zhankai", false, function () {
                        me.aniArr[sender.idx].play("beimianxunhuan", true);
                    });
                }
            });
        },
        setState: function() {
            var me = this;
            me.ui.finds("zhuangtai2").hide();
            me.ui.finds("zhuangtai3").show();
            for (var i in me.btn) {
                if(me.btn[i].isFlop) {
                    me.btn[i].finds("zs_sz").hide();
                } else {
                    me.btn[i].finds("zs_sz").show();
                    me.btn[i].finds("sz_1").setString(G.class.watchercom.getFlopNeedById(me.idx));
                }
            }
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.aniArr = [];
            me.aniNode = [];
            me.setContents();
            me.ui.finds("zhuangtai1").hide();
        },
        onHide: function () {
            var me = this;

            me.emit("hide");
        },
        setContents: function () {
            var me = this;

            for (var i = 1; i < 6; i ++) {
                (function (i) {
                    G.class.ani.show({
                        json: "ani_fanpai",
                        addTo: me.ui,
                        x: me.ui.width / 2,
                        y: me.ui.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            me.aniArr.push(action);
                            me.aniNode.push(node);
                            var item = G.class.sitem(me.data()[i - 1].prize);
                            item.setAnchorPoint(0.5, 0.5);
                            item.setPosition(node.finds("wupin").width / 2, node.finds("wupin").height / 2);
                            node.finds("wupin").addChild(item);
                            node.setPosition(me.nodes["list" + i].getPosition());
                            action.play("beimianxunhuan", true);
                            me.ui.setTimeout(function () {
                                me.ui.finds("zhuangtai1").show();
                            }, 500);
                        }
                    })
                })(i);
            }
        }
    });
    G.frame[ID] = new fun('fanpai.json', ID);
})();