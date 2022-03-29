/**
 * Created by wfq on 2018/6/22.
 */
(function() {
    //fight_win_battle
    var ID = 'jumpfight_win';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;

            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        initUi: function() {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function(sender, type) {
                // if (type == ccui.Widget.TOUCH_ENDED) {
                //     me.remove();
                //     G.frame.fight.remove();
                // }
            });
            cc.isNode(me.ui.nodes.btn_confirm) && me.ui.nodes.btn_confirm.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.DATA.endcallback && me.DATA.endcallback();
                    me.remove();
                    G.frame.fight.remove();
                }
            });
            //cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
            //    if (type == ccui.Widget.TOUCH_ENDED) {
            //        G.frame.fight_datacompare.data(me.data().fightData.fightres).show();
            //    }
            //});
            //服务端判断跳过战斗时，为减少带宽消耗，不再传此数据
            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.hide();

            me.ui.finds('bg_zhandou_sl').setTouchEnabled(true);
        },
        bindBtn: function() {
            var me = this;
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
            me.action.play("wait", true);
        },
        onShow: function() {
            var me = this;

            cc.isNode(me.nodes.btn_confirm) && me.nodes.btn_confirm.hide();

            me.DATA = me.data();
            X.showMvp(me, me.DATA.fightData.fightres);
            X.audio.playEffect("sound/battlewin.mp3");
            var win = me.ui.finds("top_sl");
            win.removeAllChildren();

            if(me.DATA.pvType == "pvwz"){
                // me.nodes.btn.hide();
                // me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushengli/bg_zhandou_sl.png", 1);
                G.class.ani.show({
                    json: "ani_zhandoushengli",
                    addTo: win,
                    x: win.width / 2,
                    y: win.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onload: function(node, action) {
                        node.finds("zi1").setSpriteFrame("img/public/zhandoujieshu.png");
                    },
                    onend: function(node, action) {
                        action.play("changtai", true);
                    }
                });
            }else{
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
            }

            new X.bView('ui_jiesuan.json', function(view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);
                me.setContents();
                me.setFlop();
                me.ui.setTimeout(function () {
                    me.event.emit('in_over');
                    me.emit("show")
                }, 1000);
            });
        },
        onHide: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;

            var panel = me._view;
            var layLeft = panel.nodes.panel_rw;
            var layRight = panel.nodes.panel_rw1;

            var fightData = me.data().fightData;

            var my;
            var he;
            var winSide;
            var head = fightData.fightres.headdata;
            for (var i = 0; i < head.length; i ++) {
                if(head[i].uid == P.gud.uid) {
                    my = i;
                } else {
                    he = i;
                }
            }

            function f(my, data) {
                if(cc.isArray(data)) {
                    var num = 0;
                    for (var i in data) {
                        if(my == 0) {
                            if(data[i].winside == 0) num ++;
                        } else {
                            if(data[i].winside != 0) num ++;
                        }
                    }
                    if(num == 2) winSide = my;
                    else winSide = he;
                } else {
                    if(my == 0) {
                        if(data.winside == 0) winSide = my;
                        else winSide = he;
                    } else {
                        if(data.winside != 0) winSide = my;
                        else winSide = he;
                    }
                }
            }
            f(my, fightData.fightres || fightData);

            setItem(layLeft, 0);
            setItem(layRight, 1);
            me.setGjjjc(layLeft,layRight);

            function setItem(ui, idx) {
                X.autoInitUI(ui);

                var headData = head[idx];
                var jifenchange = fightData.jifenchange;

                X.render({
                    text_mz: function(node){
                        node.setString((headData && headData.name) || P.gud.name);
                        X.enableOutline(node, '#66370e', 1);
                    },
                    panel_tx: function(node) {
                        node.removeAllChildren();
                        var wid = G.class.shead(headData || P.gud);
                        wid.setPosition(cc.p(node.width / 2, node.height / 2));
                        node.addChild(wid);
                    },
                    panel_df: function(node) {
                        if(!jifenchange){
                            return;
                        }
                        node.removeAllChildren();

                        var jifen, add;
                        if(jifenchange.win_uid) {
                            if(headData.uid == jifenchange.win_uid) {
                                add = jifenchange.add;
                            } else {
                                add = jifenchange.reduce;
                            }
                        } else {
                            add = idx == winSide ? jifenchange.add : jifenchange.reduce;
                        }

                        jifen = idx == 0 ? jifenchange.jifen : jifenchange.rivaljifen;

                        if(me.DATA.pvType == 'pvwzdld'){
                            jifen = jifenchange.jifen;
                            add = idx == 0? jifenchange.add : 0;
                        }

                        var str = X.STR('<font size=20>{1}</font>(<font color={3}>{2}</font>)',jifen,add, G.gc.COLOR[add >= 0 ? 'n34' : 'n36']);
                        var rh = new X.bRichText({
                            size: 20,
                            maxWidth: node.width,
                            lineHeight: 32,
                            color: G.gc.COLOR.n5,
                            eachText: function (node) {
                                X.enableOutline(node,'#000000',1);
                            },
                            family: G.defaultFNT
                        });
                        rh.text(str);
                        rh.setPosition(cc.p(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2));
                        node.addChild(rh);
                    }

                }, ui.nodes);
            }


            //比分  待完成
            panel.nodes.text_bf.setString(fightData.bifen ? '' : '');
        },

        setGjjjc:function(left,right){
            var me = this;
            me.ui.nodes.mask.setTouchEnabled(false);
            if (me.DATA.pvType == 'pvgjjjc' || me.DATA.pvType == 'pvwz' || me.DATA.pvType == 'pvwzdld') {
                left.nodes.panel_df.hide();
                right.nodes.panel_df.hide();
                left.finds('text_df').hide();
                right.finds('text_df').hide();
                // me.ui.nodes.btn_confirm.hide();
                me.ui.nodes.btn_next.show();
                if(me.DATA.pvType == 'pvwz') {
                    left.finds('text_df').show();
                    right.finds('text_df').show();

                    var leftFen = 0;
                    var rightFen = 0;

                    for (var i = 0; i < me.DATA.session + 1; i ++) {
                        if(me.DATA.fightData[i].winside == 0) leftFen ++;
                        else rightFen ++;
                    }

                    left.finds('text_df').setFontSize(20);
                    right.finds('text_df').setFontSize(20);
                    left.finds('text_df').setString(leftFen + L("SHENG"));
                    right.finds('text_df').setString(rightFen + L("SHENG"));

                    var whoWin = me.DATA.fightData[me.DATA.session].winside;
                    winNode = whoWin ? right.finds("panel_tx$") : left.finds("panel_tx$");

                    var img = new ccui.ImageView("img/zhandou/img_sljb.png", 1);
                    img.setAnchorPoint(1, 0);
                    img.setPosition(56, 46);
                    winNode.addChild(img);
                }
            } else {
                left.nodes.panel_df.show();
                right.nodes.panel_df.show();
                left.finds('text_df').show();
                right.finds('text_df').show();
                // me.ui.nodes.btn_confirm.show();
                me.once('in_over', function () {
                    me.ui.nodes.btn_confirm.show();
                });
                me.ui.nodes.btn_next.hide();
                me.ui.nodes.mask.setTouchEnabled(true);
                me.event.emit('loadedRes');
            }
            if(me.DATA.session == me.DATA.fightlength - 1){
                me.ui.nodes.btn_next.hide();
                // me.ui.nodes.btn_confirm.show();
                me.once('in_over', function () {
                    me.ui.nodes.btn_confirm.show();
                });
                me.event.emit('loadedRes');
                if(me.DATA.pvType == 'pvwzdld'){
                    left.nodes.panel_df.show();
                    right.nodes.panel_df.hide();
                    left.finds('text_df').show();
                    right.finds('text_df').hide();
                }else{
                    left.nodes.panel_df.show();
                    right.nodes.panel_df.show();
                    left.finds('text_df').show();
                    right.finds('text_df').show();
                }
            }else{
                me.ui.nodes.btn_next.touch(function(sender,type){
                    if(type == ccui.Widget.TOUCH_ENDED){
                        me.DATA.callback(me.DATA.session += 1);
                    }
                });
            }
        },
        setFlop: function () {
            var me = this;

            if(me.DATA.flop) {
                me._view.nodes.panel_ico.setBackGroundImage(G.class.getItemIco(me.DATA.flop[0].t), 1);
                me._view.nodes.txt_ico.setString(me.DATA.flop[0].n);
                me.ui.finds("bg_zhandou_sl").height = 290;
                me.nodes.btn_confirm.y = 0;
            }
        }
    });

    G.frame[ID] = new fun('zhandoushengli.json', ID);
})();
