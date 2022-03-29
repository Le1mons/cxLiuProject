/**
 * Created by LYF on 2018-12-26
 */
(function(){
    // 英雄信息-雕文
    G.class.yingxiong_dw = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('yingxiong_dw.json');
            G.frame.yingxiong_xxxx.dw = me;
        },
        refreshPanel: function(isAni){
            var me = this;

            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;

            me.setContents(isAni);
        },
        bindBTN:function() {
            var me = this;

            me.nodes.btn_sm.click(function () {
                G.frame.help.data({
                    intr:L("TS24")
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
        },
        onShow : function(){
            var me = this;

            me.refreshPanel();
            me.nodes.panel_dh.setTouchEnabled(false);
            G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
                if(G.frame.yingxiong_xxxx.getCurType() == me._type){
                    me.refreshPanel(true);
                }else{
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onNodeShow : function(){
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }

            G.frame.yingxiong_xxxx.changeToperAttr({
                attr2:{a:'item',t:'2004'}
            });
        },
        onRemove: function () {
            var me = this;
        },
        setLay: function (isAni, lay, i) {
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];
            if (lay.children.length == 0) {
                var list = lay.list = me.nodes.panel_list.clone();
                X.autoInitUI(list);
                list.show();
                list.setPosition(lay.width / 2, lay.height / 2);
                list.nodes.panel_dw.setTouchEnabled(false);
                list.nodes.panel_dw_dh.setTouchEnabled(false);
                lay.setTouchEnabled(true);
                lay.addChild(list);
            }
            lay.isHave = false;
            lay.idx = i;
            lay.star = i + 10;
            X.render({
                panel_dw: function (node) {
                    node.removeAllChildren();

                    if(data.glyph && data.glyph[i]) {
                        var wid = G.class.sglyph(G.frame.beibao.DATA.glyph.list[data.glyph[i].gid], true);
                        wid.setAnchorPoint(0.5, 0.5);
                        wid.setPosition(node.width / 2, node.height / 2);
                        wid.kuang.hide();
                        node.addChild(wid);
                        lay.isHave = true;
                        lay.data = data.glyph[i].gid;
                        if(isAni) {
                            if(wid.data.color == 5) {
                                G.class.ani.show({
                                    json: "ani_diaowen_chuandai",
                                    addTo: node,
                                    x: node.width / 2,
                                    y: node.height / 2,
                                    cache: true,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node, action) {
                                        action.playWithCallback("in", false, function () {
                                            action.play("xunhuan", true);
                                        })
                                    }
                                })
                            } else {
                                G.class.ani.show({
                                    json: "ani_diaowen_chuandai",
                                    addTo: node,
                                    x: node.width / 2,
                                    y: node.height / 2,
                                    cache: true,
                                    repeat: false,
                                    autoRemove: true,
                                    onload: function (node, action) {
                                        action.play("in", false);
                                    }
                                });
                            }
                        } else {
                            if(wid.data.color == 5) {
                                G.class.ani.show({
                                    json: "ani_diaowen_chuandai",
                                    addTo: node,
                                    x: node.width / 2,
                                    y: node.height / 2,
                                    cache: true,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node, action) {
                                        action.play("xunhuan", true);
                                    }
                                });
                            }
                        }
                    } else {
                        if(G.frame.diaowen.getGlyphArr().length > 0) {
                            var img = new ccui.ImageView("img/public/img_jia.png", 1);
                            img.setAnchorPoint(0.5, 0.5);
                            img.setPosition(node.width / 2, node.height / 2);
                            node.addChild(img);
                            img.runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
                        }
                    }
                },
                img_suo: function (node) {
                    node.setVisible(data.star < lay.star);
                }
            }, lay.list.nodes);

            lay.click(function (sender) {
                if (data.star < sender.star) {
                    return G.tip_NB.show(X.STR(L("XXKF"), sender.star));
                }
                me.checkState(sender);
            });
        },
        setContents:function(isAni) {
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];

            me.nodes.panel_dw1.setVisible(data.star < 14);
            me.nodes.panel_dw2.setVisible(data.star > 13);
            for (var i = 1; i < 6; i ++) {
                var lay1 = me.nodes["panel_dw1_" + i];
                var lay2 = me.nodes["panel_dw2_" + i];
                lay1 && me.setLay(isAni, lay1, i);
                lay2 && me.setLay(isAni, lay2, i);
            }
        },
        checkState: function (sender) {
            var me = this;
            me.curIndex = sender.idx;
            me.curDwId = sender.data;

            if(sender.isHave) {
                G.frame.diaowen_sx.data(sender.data).show();
            } else {
                G.frame.diaowen_dwxz.data({
                    state: "xiangqian"
                }).show();
            }
        }
    });

})();