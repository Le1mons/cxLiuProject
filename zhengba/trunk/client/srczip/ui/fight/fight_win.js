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
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.finds('bg_zhandou_sl').setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isTouch) return;
                    me.remove();
                    G.frame.fight.remove();
                    G.event.emit("showPackage");
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
                if(!me.isTouch) return;
                me.remove();
                G.frame.fight.remove();
                G.event.emit("showPackage");
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
                                    });
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

            me.nodes.btn_fxlx.click(function () {
                me.fenxiang.show();
                me.fenxiang.action.play("in", false);
            });
        },
        setTimeClick: function() {
            var me = this;
            var time = 3;


            function f() {
                if(time <= 0) return me.nodes.btn_next2.triggerTouch(ccui.Widget.TOUCH_ENDED);

                me.nodes.txt_sjsz.setString(X.STR(L("XMHZDKS"), time));

                me.ui.setTimeout(function () {
                    time --;
                    f();
                }, 1000);
            }
            f();
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            new X.bView('ui_top3.json', function(view) {
                // me.ui.removeAllChildren();
                me.fenxiang = view;
                me.fenxiang.hide();
                me.ui.addChild(view);
                G.frame.fight_fail.setFenXiang.call(me, view);
            }, {action: true});
        },
        onAniShow: function () {
            var me = this;

            me.action.play("wait", true);
        },
        onShow: function () {
            var me = this;

            X.showMvp(me, G.frame.fight.DATA);
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

            if(G.frame.meirishilian.isShow){
                if (G.frame.meirishilian.nodes.text_sycs.getString() > 0) {
                    me.nodes.panel_btn.show();
                    me.nodes.btn_confirm2.show();
                } else {
                    var frame = G.frame.meirishilian;
                    var need = G.class.meirishilian.getCon().buyneed[frame.DATA.buynum + 1][0].n;
                    if(frame.DATA.maxnum - frame.DATA.buynum > 0) {
                        me.nodes.panel_btn.show();
                        me.nodes.btn_confirm2.show();
                        me.nodes.panel_zsyyc.show();
                        me.nodes.next_sl.setString(need);
                        me.nodes.btn_next3.click(function () {
                            if(P.gud.rmbmoney < need) return G.tip_NB.show(L("ZSBZ"));
                            me.ajax("mrsl_buynum", [frame.type], function (str, data) {
                                if(data.s == 1) {
                                    frame.DATA.buynum ++;
                                    me.nodes.btn_next2.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                }
                            })
                        });
                    }
                }
            }
            me.DATA = G.frame.fight.data() || G.frame.fight.DATA ||me.data();
            me.setContents();
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show");
                me.event.emit("shizijun");
            }, 100);

            me.ui.setTimeout(function () {
                me.isTouch = true;
            },250);

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

                me.setTimeClick();
            }
            if(me.DATA.pvType == "pvghz") {
                me.nodes.list_fs.show();
                me.nodes.txt_prefix.setString(L("JF"));
                me.nodes.txt_number.setString("+" + me.DATA.jifen);
                me.nodes.txt_prefix.x = 34;
                me.nodes.txt_number.x = 215;
            }
            if(me.DATA.pvType == "fbzc") {
                me.setFBZC();
            }
            if(G.frame.fight.DATA && G.frame.fight.DATA.pvType == "pvdafashita") {
                me.nodes.txt_sjsz.show();
            } else {
                me.nodes.txt_sjsz.hide();
            }

            if (me.DATA.pvType == 'sddl') {
                me.nodes.panel_btn.show();
                me.nodes.btn_confirm2.show();
                me.setSDDL();
            }
            if (me.DATA.pvType == 'pvwjzz') {
                me.setWJZZ();
            }
            if (me.DATA.pvType == 'pvfriend') {
                me.nodes.btn_fxlx.show();
            }
            if(me.DATA.pvType == 'jdsd'){//决斗盛典
                me.setJDSD();
            }
            if (me.DATA.pvType == 'lht') {//炼魂塔
                me.setLHT();
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
        },
        setFBZC: function () {
            var me = this;
            me.nodes.damijing.show();
            me.nodes.damijing.finds("ico_dao").loadTexture("img/fengbao/xiaofangzi_" + me.DATA.tower + ".png");
            var txt = new ccui.Text(L("CGZLYS"), G.defaultFNT, 20);
            txt.setAnchorPoint(0.5, 0.5);
            txt.setPosition(me.nodes.damijing.finds("ico_dao").width / 2, -37);
            txt.setTextColor(cc.color(G.gc.COLOR[4]));
            me.nodes.damijing.finds("ico_dao").addChild(txt);
        },
        setSDDL: function () {
            var me = this;

            me.nodes.btn_next2.click(function () {
                G.DATA.noClick = true;
                me.ajax("dungeon_fight", [me.DATA.idx, me.DATA.hereList], function (str, d) {
                    if (d.s == 1) {
                        d.d.fightres['pvType'] = 'sddl';
                        d.d.fightres.prize = d.d.prize;
                        d.d.fightres.map = me.DATA.map;
                        d.d.fightres.idx = me.DATA.idx;
                        d.d.fightres.hereList = me.DATA.hereList;
                        G.frame.fight.demo(d.d.fightres);
                        me.remove();

                        G.frame.shendian_sddl.getData(function () {
                            G.frame.shendian_sddl.setContents();
                        });
                        G.hongdian.getData("fashita", 1, function () {
                            G.frame.julongshendian.checkRedPoint();
                            G.frame.shendian_sddl.checkRedPoint();
                        });
                        G.DATA.noClick = false;
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            });
        },
        setWJZZ: function () {
            var me = this;

            new X.bView("ui_wujunzhizhan_js.json", function (view) {
                me.nodes.panel_nr.addChild(view);
                X.render({
                    text_mz: L("RYLJ"),
                    text_wz: "+" + G.frame.wujunzhizhan.DATA.data.num,
                    panel_tx: function (node) {

                    }
                }, view.nodes);
            }, {action: true});
        },
        setJDSD:function () {
            var me = this;
            me.nodes.juedoushenggli.show();
            for(var i = 0; i < me.DATA.headdata.length; i++){
                var str = '';
                var name = me.DATA.headdata[i].name;
                if(me.DATA.winside == i){//赢了
                    var jifenstr = X.STR(L('JUEDOUSHENGDIAN24'),(me.DATA.jifeninfo[i]+1));
                }else {
                    var jifenstr = X.STR(L('JUEDOUSHENGDIAN25'),(me.DATA.jifeninfo[i]-1));
                }
                str += name + '<br>' + jifenstr;
                var rh = X.setRichText({
                    parent:me.nodes['pan_xx' + (i+1)],
                    str:str,
                    anchor: {x: 0, y: 0.5},
                    pos: {x: 0, y: me.nodes['pan_xx' + (i+1)].height / 2},
                    color:"#fff8e1",
                    outline:"#000000",
                    size:22
                })
            }

            var prize = [];
            for(var k in me.DATA.prize){
                if(k == P.gud.uid){
                    for(var j = 0; j < me.DATA.prize[k].length; j++){
                        prize = prize.concat(me.DATA.prize[k][j]);
                    }
                }
            }

            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(150,30));
            layout.setAnchorPoint(0,0);
            me.ui.addChild(layout);
            me.nodes.pan_xx3.removeAllChildren();
            var inter = 50;
            var starx = (me.nodes.pan_xx3.width - inter*(prize.length-1)-layout.width*prize.length)/2;
            for(var i = 0; i < prize.length; i++){
                var ico = layout.clone();
                var img = new ccui.ImageView(G.class.getItemIco(prize[i].t),1);
                var num = "+" + prize[i].n;
                if(prize[i].t == '2088' && G.frame.juedoushengdian_main.DATA.myinfo.tq){
                    var str = X.STR(L('JUEDOUSHENGDIAN29'), num);
                }else {
                    var str = X.STR(L('JUEDOUSHENGDIAN28'), num);
                }
                var rh = X.setRichText({
                    parent:ico,
                    str:str,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ico.width / 2, y: ico.height / 2},
                    color:"#FFE8C0",
                    size:22,
                    outline:"#000000",
                    node:img
                });
                ico.setPosition(cc.p(starx+(inter + layout.width)*i,0));
                me.nodes.pan_xx3.addChild(ico);
            }
        },
        setLHT: function () {
            var me = this;
            var cond = G.frame.lianhunta_gk.DATA[me.DATA.id].starcond;
            var starData = G.frame.lianhunta.DATA.layerstar[me.DATA.id] || [];

            me.nodes.panel_lht.show();
            me.nodes.btn_qd.click(function () {
                return me.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });

            cc.each(cond, function (conf, id) {
                var list = me.nodes.list_tj.clone();
                var parent = me.nodes['panel_tj' + id];
                var isFinish = X.inArray(starData, id);

                X.autoInitUI(list);
                X.render({
                    text_tj: L("cond") + id,
                    ico_xx: function (node) {
                        var imgPath = 'img_xx2';
                        if (isFinish) {
                            imgPath = 'img_xx';
                        }
                        node.setBackGroundImage('img/lianhunta/' + imgPath + '.png', 1);
                    },
                    text_tgtj: G.frame.lianhunta_gk.getCondShow(conf)
                }, list.nodes);
                list.show();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
            });
        }
    });

    G.frame[ID] = new fun('zhandoushengli.json', ID);
})();