/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-胜利
    var ID = 'fight_win';

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

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                    G.frame.fight.remove();
                }
            });

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(G.frame.damijing.isShow) {
                        G.frame.fight_datacompare.data(G.frame.fight.DATA || me.data() || (me.data() && me.data().fightres) || me.DATA).show();
                    } else {
                        G.frame.fight_datacompare.data(G.frame.fight.DATA || (me.data() && me.data().fightres) || me.data() || me.DATA).show();
                    }

                }
            });

            me.nodes.btn_confirm2.click(function (sender, type) {
                me.remove();
                if(G.frame.fight.isShow) {
                    G.frame.fight.remove();
                }
            });

            me.nodes.btn_next2.click(function (sender, type) {
                if(me.DATA.type1) {
                    switch (me.DATA.type1){
                        case "pvshilian":
                            G.frame.fight.remove();
                            G.ajax.send("mrsl_fight", [me.DATA.type, me.DATA.nandu, me.DATA.data, me.DATA.npc], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    X.cacheByUid('fight_ready', me.DATA.data);
                                    G.frame.fight.data({
                                        prize: d.d.prize,
                                        pvType: "pvshilian",
                                        type1: me.DATA.type1,
                                        nandu: me.DATA.nandu,
                                        data: me.DATA.data,
                                        npc: me.DATA.npc,
                                        type: me.DATA.type
                                    }).once('show', function () {
                                        me.remove();
                                    }).demo(d.d.fightres);
                                    if (!d.d.fightres.winside) {
                                        G.frame.meirishilian.nodes.text_sycs.setString(d.d.lessnum);
                                    }
                                    G.hongdian.getData("mrsl", 1, function () {
                                        G.frame.meirishilian.checkRedPoint();
                                    })
                                }
                            });
                            break;
                        default:
                            break;
                    }
                }else {
                    if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                        me.isNoFstAni = true;
                        me.remove();
                        G.frame.dafashita.fightCall();
                    }
                }
            }, 1000);
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

            cc.isNode(me.nodes.btn_confirm2) && me.nodes.btn_confirm2.hide();
            var win = me.ui.finds("top_sl");
            X.audio.playEffect("sound/battlewin.mp3");
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
                    cc.isNode(me.nodes.btn_confirm2) && me.nodes.btn_confirm2.show();
                }
            });

            if(G.frame.meirishilian.isShow && G.frame.meirishilian.nodes.text_sycs.getString() > 0){
                me.nodes.panel_btn.show();
                me.nodes.btn_confirm2.show();
            }
            me.DATA = G.frame.fight.data() || G.frame.fight.DATA ||me.data();
            me.setContents();
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show");
                me.event.emit("shizijun");
            }, 100);

            me.ui.setTimeout(function () {
                G.guidevent.emit('fightWin_showOver');
            }, 1000);
            if(me.DATA.pvType == "damijing") {
                me.setDMJ();
            }
            if(G.frame.dafashita.isShow  
                && G.frame.dafashita.DATA.layernum % 10 != 0 
                && G.frame.dafashita.DATA.layernum + 1 <= X.keysOfObject(G.class.dafashita.get()).length
                && !G.frame.dafashita_jxtg.isShow) {
                me.nodes.panel_btn.show();
                me.nodes.btn_confirm2.show();
            }
            if(me.DATA.pvType == "pvghz") {
                me.nodes.list_fs.show();
                me.nodes.txt_prefix.setString(L("JF"));
                me.nodes.txt_number.setString("+" + me.DATA.jifen);
                me.nodes.txt_prefix.x = 34;
                me.nodes.txt_number.x = 215;
            }
        },
        onHide: function () {
            var me = this;
            me.emit("hide");
            if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                if(!me.isNoFstAni) {
                    G.frame.dafashita.playLevelAni();
                }else {
                    G.frame.dafashita.refreshPanel();
                }
            }
        },
        setContents: function () {
            var me = this;
            var prize = me.data() && me.data().prize;
			if(!prize && me.DATA && me.DATA.prize)prize=me.DATA.prize;
			
			if(!prize)return;

            X.lengthChangeByPanel(prize, me.nodes.panel_ico, me.nodes.listview_ico, {
                touch: true
            });
        },
        setDMJ: function () {
            var me = this;
            me.nodes.damijing.show();
            for(var i in me.DATA.pv) {
                var layout = me.nodes["mingji_rw" + i];
                var wid = G.class.shero(me.DATA.pv[i]);
                wid.setAnchorPoint(0.5, 0.5);
                wid.setPosition(layout.width / 2, layout.height / 2);
                i == 1 ? wid.setEnabled(me.DATA.winside ? false : true) : wid.setEnabled(me.DATA.winside ? true : false);
                layout.addChild(wid);
            }
        }

    });

    G.frame[ID] = new fun('zhandoushengli.json', ID);
})();