/**
 * Created by lsm on 2018/6/28.
 */
(function() {
    //战斗-失败
    var ID = 'fight_fail_friendboss';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        initUi: function() {
            var me = this;
        },
        bindBtn: function() {
            var me = this;

            // cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function(sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         me.remove();
            //         G.frame.fight.remove();
            //     }
            // });

            cc.isNode(me.ui.nodes.btn_confirm) && me.ui.nodes.btn_confirm.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.DATA.endcallback && me.DATA.endcallback();
                    me.remove();
                    G.frame.fight.remove();
                }
            });

            cc.isNode(me.ui.nodes.btn_confirm2) && me.ui.nodes.btn_confirm2.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.DATA.endcallback && me.DATA.endcallback();
                    me.remove();
                    G.frame.fight.remove();
                }
            });
            
            cc.isNode(me.ui.nodes.btn_next2) && me.ui.nodes.btn_next2.click(function(sender, type) {
                me.DATA.callback && me.DATA.callback();
                me.nodes.btn.hide();
            }, 1000);

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_datacompare.data(G.frame.fight.DATA).show();
                }
            });

            me.nodes.btn.click(function () {
                G.frame.woyaobianqiang.show();
                G.frame.fight.remove();
                me.remove();
            })
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushengli/bg_zhandou_sl.png", 1);
            me.nodes.panel_mvp.finds("Image_1").loadTexture("img/zhandou/img_zhandou_tmd2.png", 1);
        },
        onAniShow: function() {
            var me = this;
            me.action.play("wait", true);
        },
        onShow: function() {
            var me = this;
            me.DATA = G.frame.fight.data();
            cc.isNode(me.nodes.btn_confirm) && me.nodes.btn_confirm.hide();
            X.showMvp(me, G.frame.fight.DATA);
            me.ui.nodes.btn.hide();
            me.ui.nodes.btn_next2.setAnchorPoint(1,0);
            me.ui.nodes.btn_confirm2.setAnchorPoint(0,0);
            me.ui.nodes.btn_next2.setPositionY(0);
            me.ui.nodes.btn_confirm2.setPositionY(0);

            X.audio.playEffect("sound/battlewin.mp3");
            var lose = me.ui.finds("top_sb");
            lose.removeAllChildren();

            me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushengli/bg_zhandou_sl.png", 1);
            G.class.ani.show({
                json: "ani_zhandoushengli",
                addTo: lose,
                x: lose.width / 2,
                y: lose.height / 2,
                repeat: false,
                autoRemove: false,
                onload: function(node, action) {
                    node.finds("zi1").setSpriteFrame("img/public/zhandoujieshu.png");
                },
                onend: function(node, action) {
                    action.play("changtai", true);
                }
            });

            me.setContents();
            me.ui.setTimeout(function () {

                me.emit("show");
                me.event.emit('in_over');
            }, 500);
        },
        onHide: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;
            var conf = {
                0: 'jifen',
                1: 'dps'
            };
            me.ui.finds('img_zhandou_sb2').hide();
            if (G.frame.gonghui_tanbao.DATA.myinfo.tiliinfo.num >= 1) {
                me.once('in_over', function () {
                    me.nodes.panel_btn.show();
                });
            } else {
                me.once('in_over', function () {
                    me.nodes.panel_btn.hide();
                    me.ui.nodes.btn_confirm.show();
                });
            }
            me.nodes.panel_nr.removeAllChildren();
            for (var i = 0; i < 2; i++) {
                var list = me.nodes.list_fs.clone();
                X.autoInitUI(list);
                list.nodes.txt_prefix.setString(L(conf[i]));
                list.nodes.txt_number.setString(X.fmtValue(me.DATA[conf[i]]));
                list.nodes.txt_prefix.setTextColor(cc.color('#fdd464'));
                list.nodes.txt_number.setTextColor(cc.color('#f6ebcd'));
                X.enableOutline(list.nodes.txt_prefix, '#2a1cof');
                X.enableOutline(list.nodes.txt_number, '#2a1cof');
                list.setAnchorPoint(0, 0);
                list.setPosition((me.nodes.panel_nr.width - list.width) / 2 + 25, i * list.height + 30);
                list.show();
                me.nodes.panel_nr.addChild(list);
            }
        },

    });

    G.frame[ID] = new fun('zhandoushibai.json', ID);
})();