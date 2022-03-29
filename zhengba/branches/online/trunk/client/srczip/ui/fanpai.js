/**
 * Created by wfq on 2018/6/23.
 */
(function () {
    //翻牌
    var ID = 'fanpai';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f6";
            me._super(json, id);
        },
        initUi: function () {
            var me = this;

            me.ui.zIndex = 1000;
        },
        bindBtn: function () {
            var me = this;

            // me.nodes.btn_qr2.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         me.remove();
            //     }
            // });

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (!me.isCard) {
                        // G.tip_NB.show(L('PLEASE_OPEN_CARD'));
                    } else {
                        me.remove();
                    }
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

            // me.nodes.btn_qr2.hide();
            me.DATA = me.data();

            // me.DATA = {
            //     prize:[{a:'item',t:25075,n:1}],
            //     show:[{a:'item',t:25075,n:1},{a:'item',t:25075,n:1}],
            // };
            // me.DATA.show.push(me.DATA.prize[0]);

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },

        setContents: function () {
            var me = this;

            var item = me.ui.finds('panel_fanpai');

            me.cards = [];
            me.act_node = [];

            var panel = me.ui;
            for (var i = 0; i < 3; i++) {
                var lay = panel.nodes['panel_' + (i + 1)];
                lay.removeAllChildren();

                var itemClone = item.clone();
                itemClone.setPosition(cc.p(lay.width / 2,lay.height / 2));
                itemClone.idx = i;
                me.setItem(itemClone);
                lay.addChild(itemClone);
                itemClone.show();
                me.cards.push(itemClone);
            }
        },
        setItem: function (ui,data) {
            var me = this;

            X.autoInitUI(ui);
            var imgWh = ui.nodes.img_wh;
            // var imgfp = ui.finds('bg_fp');
            var lay = ui.nodes.panel_item;
            imgWh.hide();
            // imgfp.hide();
            lay.removeAllChildren();
            lay.show();
            G.class.ani.show({
                json: "ani_fanpaidonghua",
                addTo: ui,
                x: ui.width/2 - 5,
                y: ui.height/2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    me.act_node.push(action);
                    action.playWithCallback("animation0", false, function () {
                        action.play("in", true);
                        imgWh.show();
                        // imgfp.show();
                    })
                }
            });


            ui.setTouchEnabled(true);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // me.nodes.btn_qr2.show();
                    if(me.isAni) return;
                    me.isAni = true;
                    X.audio.playEffect("sound/fanpaijiangli.mp3");
                    if (!sender.isOpen) {
                        sender.isOpen = true;
                        // me.fan(sender,me.DATA.show[sender.idx], sender.idx);
                        me.fan(sender, me.DATA.prize[0], sender.idx);
                        me.isCard = true;
                        me.act_node[sender.idx].playWithCallback('out',false, function(){
                            for (var i = 0; i < me.cards.length; i++) {
                                var card = me.cards[i];
                                card.isOpen = true;
                                if (card.idx != sender.idx) {
                                    (function (c,idx) {
                                            if (!cc.sys.isObjectValid(c)) return;
                                            me.act_node[c.idx].opacity = 0;
                                            var num = idx;
                                            if(idx > sender.idx){
                                                num = idx - 1;
                                            }
                                            me.fan(c,me.DATA.show[num]);
                                            me.cards[idx].finds('img_mcbg$').show();
                                            me.cards[idx].finds('img_mcbg$').zIndex = 10;
                                            me.cards[idx].finds('img_mcbg$').setScale(0.72);
                                            me.ui.setTimeout(function () {
                                            me.act_node[c.idx].playWithCallback("out", false, function () {
                                            })
                                        },0.2);
                                    })(card,i);
                                }
                            }
                        });
                    }
                }
            });
        },
        fan: function (card,d) {
            var me = this;

            var action1 = cc.scaleTo(.1,1.5,1);
            var action2 = cc.fadeOut(0.5);


            var imgWh = card.nodes.img_wh;
            imgWh.runActions([
                action1,
                cc.callFunc(function () {
                    var lay = card.nodes.panel_item;
                    var wid = G.class.sitem(d);
                    wid.setPosition(cc.p(lay.width / 2,lay.height / 2));
                    lay.addChild(wid);
                    G.frame.iteminfo.showItemInfo(wid);
                }),
                action2,
                cc.callFunc(function () {
                    imgWh.hide();
                    me.isAni = false
                })
            ]);
        },
    });

    G.frame[ID] = new fun('ui_zdjl.json', ID);
})();
