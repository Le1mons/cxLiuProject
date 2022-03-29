/**
 * Created by lsm on 2018/6/28.
 */
(function () {
    //战斗-胜利
    var ID = 'fight_win_friendboss';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id);
        },
        initUi: function () {
            var me = this;

            me.ui.finds('bg_zhandou_sl').setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // me.remove();
                    // G.frame.fight.remove();
                }
            });

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
            }, 1000);

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_datacompare.data(G.frame.fight.DATA).show();
                }
            });
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

            cc.isNode(me.nodes.btn_confirm) && me.nodes.btn_confirm.hide();
            X.audio.playEffect("sound/battlewin.mp3");
            var win = me.ui.finds("top_sl");
            win.removeAllChildren();
            G.class.ani.show({
                json: "ani_zhandoushengli",
                addTo: win,
                x: win.width / 2,
                y: win.height / 2,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {

                },
                onend: function (node, action) {
                    action.play("changtai", true);

                }
            });

            me.DATA = G.frame.fight.data();
            me.setContents();
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show")
            }, 500);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var conf = {
                0:'jifen',
                1:'dps'
            };
            //me.ui.finds('img_zhandou_sb2').hide();
            // if (G.frame.friend.DATA.tiliinfo.num > 0) {
            //     me.nodes.panel_btn.show();
            // } else {
                
            // }
            me.nodes.panel_btn.hide();
            me.once('in_over', function () {
                me.ui.nodes.btn_confirm.show();
            });
            for(var i = 0;i<2; i++){
                var list = me.nodes.list_fs.clone();
                X.autoInitUI(list);
                list.nodes.txt_prefix.setString(L(conf[i]));
                list.nodes.txt_number.setString(me.DATA[conf[i]]);
                list.nodes.txt_prefix.setTextColor(cc.color('#fdd464'));
                list.nodes.txt_number.setTextColor(cc.color('#f6ebcd'));
                X.enableOutline(list.nodes.txt_prefix,'#2a1cof');
                X.enableOutline(list.nodes.txt_number,'#2a1cof');
                list.setAnchorPoint(0,0);
                list.setPosition((me.nodes.panel_nr.width - list.width) / 2 + 25,i*list.height + 30);
                list.show();
                me.nodes.panel_nr.addChild(list);
            }
        }
    });

    G.frame[ID] = new fun('zhandoushengli.json', ID);
})();