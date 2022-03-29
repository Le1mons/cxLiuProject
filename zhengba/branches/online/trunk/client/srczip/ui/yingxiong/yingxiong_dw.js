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
        setContents:function(isAni) {
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];

            for (var i = 1; i < 4; i ++) {
                var lay = me.nodes["panel_dw" + i];
                var suo = me.nodes["img_suo" + i];
                lay.isHave = false;
                lay.removeAllChildren();
                lay.idx = i;
                if(data.star >= i + 10) {
                    suo.hide();
                    lay.setTouchEnabled(true);
                    if(data.glyph && data.glyph[i]) {
                        var wid = G.class.sglyph(G.frame.beibao.DATA.glyph.list[data.glyph[i].gid], true);
                        wid.setAnchorPoint(0.5, 0.5);
                        wid.setPosition(lay.width / 2, lay.height / 2);
                        lay.addChild(wid);
                        lay.isHave = true;
                        lay.data = data.glyph[i].gid;
                        if(isAni) {
                            if(wid.data.color == 5) {
                                G.class.ani.show({
                                    json: "ani_diaowen_chuandai",
                                    addTo: lay,
                                    x: lay.width / 2,
                                    y: lay.height / 2,
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
                                    addTo: lay,
                                    x: lay.width / 2,
                                    y: lay.height / 2,
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
                                    addTo: lay,
                                    x: lay.width / 2,
                                    y: lay.height / 2,
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
                            img.setPosition(lay.width / 2, lay.height / 2);
                            lay.addChild(img);
                            img.runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
                        }
                    }
                    lay.click(function (sender) {
                        me.checkState(sender);
                    });
                } else {
                    suo.show();
                    lay.click(function (sender) {
                        G.tip_NB.show(L("ZWJS"));
                    });
                }
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