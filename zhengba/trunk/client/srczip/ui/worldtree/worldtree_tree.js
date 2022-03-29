/**
 * Created by wfq on 2018/6/8.
 */
(function () {
    //世界树-世界树
    G.class.worldtree_tree = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('shijieshu_sjs.json');
            G.frame.worldtree.tree = me;
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_shufaj.click(function () {
                if(!me.curType) return;

                G.frame.worldtree_prize.data(me.curType).show();
            });

            me.nodes.panel_sjs_dizuo.click(function () {
                if(!me.curType) return;

                G.frame.worldtree_prize.data(me.curType).show();
            });

            for (var i = 1; i < 6; i ++) {
                var btn = me.nodes["panel_sjs_" + i];

                btn.setTouchEnabled(true);
                btn.click(function (sender) {
                    me.changeAni(sender);
                })
            }

            me.ui.finds("Text_20").setString(1);

            var mask = me.mask = new ccui.Layout;
            mask.setContentSize(cc.director.getWinSize());
            mask.setTouchEnabled(true);
            me.ui.addChild(mask);
            mask.zIndex = 101;
            mask.hide();
            
            me.nodes.btn_gs.click(function () {
                me.ajax("worldtree_call", [me.curType], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "zhzs_zhaohuan",
                            data:{
                                zhaohuan_zhenying:me.curType,
                                consume:[{a:"item",t:2011,n:1}],
                                get:data.d.prize,
                            }
                        });
                        try {
                            G.event.emit("leguXevent", {
                                type: 'track',
                                event: 'summon',
                                data: {
                                    summon_genre: '召唤之书',
                                    summon_type: 1,
                                    summon_cost_num: 1,
                                    summon_cost_type: 'item',
                                    item_list: X.arrPirze(data.d.prize),
                                }
                            });
                        } catch (e) {
                            cc.error(e);
                        }

                        me.mask.show();
                        if(me.noAni) {
                            G.frame.jiangli.data({
                                prize:[].concat(data.d.prize),
                                tree: true
                            }).show();
                            G.frame.worldtree.setBaseInfo();
                            me.mask.hide();
                            me.noAni = false;
                        } else {
                            me.curAni.playWithCallback("fanye", false, function () {
                                G.frame.jiangli.data({
                                    prize:[].concat(data.d.prize),
                                    tree: true
                                }).show();
                                G.frame.worldtree.setBaseInfo();
                                me.mask.hide();
                                me.curAni.play("zhankaixunhuan", true);
                            })
                        }

                    }else {
                        me.mask.hide();
                        me.noAni = false;
                    }
                })
            }, 1000);
        },
        changeAni: function(sender) {
            var me = this;
            var target = me.nodes.panel_sjs_dizuo;

            if(!sender.ani) return;

            me.mask.show();

            if(me.aniNode) {
                me.aniNode.removeFromParent();
            }

            me.aniNode = sender.aniNode;
            sender.ani.playWithCallback("yidong", false, function () {
                sender.ani.play("zhankaixunhuan", true);
                me.curType = sender.type;
                me.curAni = sender.ani;

                if(me.lastNode) {
                    me.addAni(me.lastNode.getParent(), me.lastNode, function (node, action) {
                        me.lastNode.aniNode = node;
                        me.lastNode.ani = action;

                        me.lastNode = sender;
                        me.lastNode.ani = undefined;
                        me.mask.hide();
                    })
                } else {
                    me.lastNode = sender;
                    me.lastNode.ani = undefined;
                    me.mask.hide();
                }
            });
            sender.aniNode.runAction(cc.moveTo(0.5, target.getPosition()));
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();

            G.class.ani.show({
                json: "ani_yingxionghuijuan_bg",
                addTo: me.ui,
                x: me.ui.width / 2,
                y: me.ui.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node) {
                    node.zIndex = -1;
                }
            });

            for (var i = 1; i < 6; i ++) {
                me.nodes["panel_sjs_" + i].zIndex = 99;
            }

            me.nodes.btn_gs.zIndex = 100;
            me.nodes.btn_shufaj.zIndex = 9999;

            me.aniType = {
                1: "siwang",
                2: "aoshu",
                3: "xieneng",
                4: "ziran",
                5: "guangan"
            }
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.mask.show();
            
            for (var i = 1; i < 6; i ++) {
                var lay = me.nodes["panel_sjs_" + i];
                var idx = i;

                (function (lay, index) {
                    lay.type = index;
                    me.addAni(lay.getParent(), lay, function (node, action) {
                        lay.aniNode = node;
                        lay.ani = action;
                    }, false);
                })(lay, idx);
            }

            me.ui.setTimeout(function () {
                me.nodes.panel_sjs_1.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }, 500);
        },
        addAni: function(parent, lay, callback, isOpen) {
            var me = this;

            G.class.ani.show({
                json: "ani_yingxionghuijuan_" + me.aniType[lay.type],
                addTo: parent,
                x: lay.x,
                y: lay.y,
                cache: true,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play(isOpen ? "zhankaixunhuan" : "xunhuan", true);

                    callback && callback(node, action);
                }
            })
        }
    });

})();