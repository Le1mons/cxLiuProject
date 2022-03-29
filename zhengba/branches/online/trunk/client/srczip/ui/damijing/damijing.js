/**
 * Created by LYF on 2018/10/21.
 */
(function () {
    //大秘境
    var ID = 'damijing';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS18")
                }).show();
            });

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });

            me.ui.finds("btn_jl").click(function () {
                G.frame.damijing_jlyl.show();
            });

            me.ui.finds("btn_phb").click(function () {
                G.frame.damijing_phb.show();
            });

            me.ui.finds("btn_mjsd").click(function () {
                if (!me.DATA.trader){
                    G.tip_NB.show(L('ZWSP'));
                    return;
                }
                me.nodes.btn_dj.hide();
                if(me.dijing) me.setDiJingAni();
                G.frame.damijing_shop.show();
            });

            me.ui.finds("img_di").setTouchEnabled(true);
            me.ui.finds("img_di").click(function () {

                if(!X.cacheByUid("dmj_jumpFight")) {
                    X.cacheByUid("dmj_jumpFight", 1);
                    me.ui.finds("ico_gou").show();
                }else {
                    X.cacheByUid("dmj_jumpFight", 0);
                    me.ui.finds("ico_gou").hide();
                }
            });

            G.class.ani.show({
                json: "ani_mijing_kaizhan",
                addTo: me.ui.finds("btn_an"),
                x: me.ui.finds("btn_an").width / 2,
                y: me.ui.finds("btn_an").height / 2,
                repeat: true,
                autoRemove: false,
                onend: function (node) {
                    me.ui.finds("btn_an").ani = node;
                }
            });

            if(X.cacheByUid("dmj_jumpFight")) {
                me.ui.finds("ico_gou").show();
            }else {
                me.ui.finds("ico_gou").hide();
            }

            me.ui.finds("btn_an").click(function (sender) {
                if(me.isAllDead) {
                    G.tip_NB.show(L("ALL_HERO_DEAD"));
                    return;
                }
                me.ajax("watcher_fight", [me.curIdx], function (str, data) {
                    if(data.s == 1) {
                        sender.hide();
                        data.d.fightres.pvType = "damijing";
                        var obj = {
                            1: me.DATA.herolist[me.curIdx][0],
                            2: me.DATA.npc.headdata
                        };
                        data.d.fightres.pv = obj;
                        if(X.cacheByUid("dmj_jumpFight")){
                            if(data.d.fightres.winside) {
                                G.frame.fight_fail.data(data.d.fightres).show();
                            }else {
                                G.frame.fight_win.data(data.d.fightres).show();
                            }
                        }else {
                            G.frame.fight.demo(data.d.fightres);
                        }
                        me.DATA = data.d.data;

                        if(!data.d.fightres.winside) {
                            var winPrize = data.d.winprize;
                            var layout = me.ui.finds("panel_ui");
                            var target = me.ui.finds("js_you");
                            me.ui.finds("ico_qizi").hide();
                            target.hide();
                            me.setLevelInfo();
                            if(me.DATA.layer <= X.keysOfObject(G.class.getConf("watcher")).length) {
                                me.setWinAni(winPrize, layout, target);
                            }
                        }else {
                            me.ui.finds("ico_qizi").show();
                            me.ui.finds("btn_an").show();
                        }
                        me.setEnemy();
                        me.setHeroList();
                        me.setButtonState();
                        G.hongdian.getData("watcher", 1, function () {
                            me.checkRedPoint(true);
                        })
                    }
                })
            }, 500);

            me.nodes.panel_rw.setTouchEnabled(true);
            me.nodes.panel_rw.click(function() {
                if(!me.nodes.panel_rw.getChildren()[0]) return;
                me.nodes.panel_rw.getChildren()[0].runAni(0, "atk", false);
                me.nodes.panel_rw.getChildren()[0].addAni(0, "wait", true, 0);
            });

            me.nodes.panel_rw2.setTouchEnabled(true);
            me.nodes.panel_rw2.click(function (sender) {
                G.frame.damijing_drxx.data(me.DATA.npc).show();
            });

            var obj = {
                "bg_ax": 1,
                "bg_sd": 2,
                "bg_fy": 3
            };
            for(var i in obj) {
                var btn = me.ui.finds(i);
                btn.idx = obj[i];
                (function (btn) {
                    btn.setTouchEnabled(true);
                    btn.touch(function (sender, type) {
                        if(type == ccui.Widget.TOUCH_BEGAN) {
                            G.frame.damijing_ysxq.data(sender.idx).show();
                        }else if(type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_NOMOVE || type == ccui.Widget.TOUCH_CANCELED) {
                            sender.setTimeout(function () {
                                if(G.frame.damijing_ysxq.isShow) {
                                    G.frame.damijing_ysxq.remove();
                                }
                            }, 100);
                        }
                    })
                })(btn)
            }

            me.nodes.btn_dj.click(function (sender) {
                if(!me.dijing) return;
                sender.hide();
                me.setDiJingAni(true);
            })

        },
        setDiJingAni: function(isAni) {
            var me = this;

            G.class.ani.show({
                json: "ani_mijing_dijing",
                addTo: me.ui.finds("panel_ui"),
                x: me.ui.finds("js_you").x,
                y: me.ui.finds("js_you").y + 100,
                repeat: false,
                autoRemove: true,
                onend: function () {
                    me.playAni(function () {
                        me.ui.finds("js_you").show();
                        me.ui.finds("ico_qizi").show();
                        me.ui.finds("btn_an").show();
                    });
                }
            });

            G.setNewIcoImg(me.ui.finds("btn_mjsd"));
            G.class.ani.show({
                json: "ani_mijing_guangxiao",
                addTo: me.ui.finds("btn_mjsd"),
                x: me.ui.finds("btn_mjsd").width / 2,
                y: me.ui.finds("btn_mjsd").height / 2,
                repeat: false,
                autoRemove: true
            });

            me.dijing.runAction(cc.sequence(cc.spawn(cc.fadeOut(0.5), cc.scaleTo(0.5, 0.1, 0.1), cc.moveBy(0.5, 0, 100)), cc.callFunc(()=>{
                me.dijing.removeFromParent();
                me.dijing = undefined;
            })));
            if(cc.isNode(me.touchLayout)) me.touchLayout.hide();
        },
        setWinAni: function(winPrize, layout1, target) {
            var me = this;

            function f() {
                var endPos;
                var data = winPrize.val[0];
                var startPos = cc.p(target.x, target.y + 90);

                var layout = new ccui.Layout;
                layout.setContentSize(cc.size(20, 20));
                layout.setAnchorPoint(0.5, 0.5);
                layout.setPosition(startPos);

                layout1.addChild(layout);

                if(winPrize.key == "mixture") {
                    endPos = layout1.convertToNodeSpace(me.ui.finds("Image_1").convertToWorldSpace(
                        me.nodes["txt_sl" + data.id].getParent().getPosition()));

                }else {
                    var chr;
                    var children = me.ui.finds("lview").children;
                    for (var i in children) {
                        if(children[i].idx == data.id) {
                            chr = children[i];
                            break;
                        }
                    }
                    if(chr) {
                        endPos = layout1.convertToNodeSpace(me.ui.finds("lview").convertToWorldSpace(
                            chr.getPosition()
                        ))
                    }
                }

                G.class.ani.show({
                    json: "ani_tuoweilizi",
                    addTo: layout,
                    x: layout.width / 2,
                    y: layout.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.getChildren()[0].getChildren()[0].getChildren()[0].positionType = 0;
                        G.class.ani.show({
                            json: winPrize.key == "mixture" ? "ani_ico_ys" + data.id : "ani_ico_wu" + data.id,
                            addTo: layout,
                            x: layout.width / 2,
                            y: layout.height / 2,
                            repeat: true,
                            autoRemove: false,
                            onload: function () {
								layout.runActions([
									cc.moveTo(0.1, endPos),
									cc.callFunc(function(){
										G.class.ani.show({
											json: "ani_mijing_guangxiao",
											addTo: layout1,
											x: endPos.x,
											y: endPos.y,
											repeat: false,
											autoRemove: true,
											onend: function () {
												me.setMedicinal();
												me.setBuff();

												me.playAni(function () {
													target.show();
													me.ui.finds("ico_qizi").show();
													me.ui.finds("btn_an").show();
												})
											}
										});
									}),
									cc.removeSelf()
								]);
                            }
                        });
                    }
                });
            }

            G.frame.fight_win.once("hide", function () {
                switch (winPrize.key) {
                    case "box":
                        me.zz.show();
                        X.spine.show({
                            json: 'spine/' + 'xiangzi' + '.json',
                            addTo: layout1,
                            cache: true,
                            x: target.x - 60,
                            y: target.y,
                            z: 0,
                            autoRemove: false,
                            onload: function (node) {
                                node.stopAllAni();
                                node.setTimeScale(1);
                                node.opacity = 255;
                                node.setScale(1);
                                node.runAni(0, "baoxiang_daiji", false);
                                node.setCompleteListener(function () {
                                    G.frame.jiangli.once("hide", function () {
                                        node.removeFromParent();
                                        me.playAni(function () {
                                            target.show();
                                            me.ui.finds("ico_qizi").show();
                                            me.ui.finds("btn_an").show();
                                            me.zz.hide();
                                        });
                                    }).data({
                                        prize: winPrize.val
                                    }).show();
                                })
                            }
                        });
                        break;
                    case "trader":
                        me.playAni(function () {
                            X.spine.show({
                                json: 'spine/' + 'dijing' + '.json',
                                addTo: layout1,
                                cache: true,
                                x: target.x,
                                y: target.y,
                                z: 0,
                                autoRemove: false,
                                onload: function (node) {
                                    node.stopAllAni();
                                    node.setTimeScale(1);
                                    node.opacity = 255;
                                    node.setScale(1);
                                    node.runAni(0, "dj", true);

                                    me.dijing = node;
                                    me.nodes.btn_dj.show();

                                    if(me.touchLayout) {
                                        me.touchLayout.show();
                                    }else {
                                        var touchLayout = me.touchLayout = me.ui.finds("js_you").clone();
                                        touchLayout.removeAllChildren();
                                        touchLayout.setTouchEnabled(true);
                                        touchLayout.show();
                                        touchLayout.click(function () {
                                            G.frame.damijing_buy.show();
                                        });
                                        touchLayout.setName("shopBtn");
                                        touchLayout.zIndex = 40;
                                        layout1.addChild(touchLayout);
                                    }
                                }
                            });
                        });
                        break;
                    case "flop":
                        G.class.ani.show({
                            json: "ani_fanpai",
                            addTo: layout1,
                            x: target.x + 20,
                            y: target.y + 150,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                action.playWithCallback("chuxian", false, function () {
                                    action.play("animation0", true);
                                    G.frame.damijing_flop.once("hide", function () {
                                        me.card.removeFromParent();
                                        me.ui.finds("ico_qizi").show();
                                        me.ui.finds("btn_an").show();
                                        target.show();
                                    }).data(winPrize.val).show();
                                });
                                me.card = node;
                            }
                        });
                        break;
                    default:
                        G.class.ani.show({
                            json: "ani_mijing_taizi",
                            addTo: layout1,
                            x: target.x + 20,
                            y: target.y,
                            repeat: false,
                            autoRemove: true,
                            onload: function (node) {
                                node.setName("taizi");
                            }
                        });
                        G.class.ani.show({
                            json: "ani_mijing_shanguang",
                            addTo: layout1,
                            x: target.x,
                            y: target.y + 90,
                            repeat: false,
                            autoRemove: true,
                            onkey: function (node, action, event) {
                                if(event == "chuxian") {
                                    if(layout1.getChildByName("taizi")) layout1.getChildByName("taizi").removeFromParent();
                                    f();
                                }
                            }
                        });
                        break;
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();

            cc.enableScrollBar(me.ui.finds("lstView"));
            me.ui.finds("lstView").setTouchEnabled(false);
            me.nodes.list.hide();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback, err) {
            var me = this;

            G.ajax.send('watcher_open', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    if(me.DATA.prize) {
                        me.event.once("show", function () {
                            G.class.ani.show({
                                json: "ani_mijing_saodang",
                                addTo: me.ui,
                                x: me.ui.width / 2,
                                y: me.ui.height / 2,
                                repeat: false,
                                autoRemove: true,
                                onend: function () {
                                    if(me.DATA.prize.length > 0) {
                                        G.frame.jiangli.data({
                                            prize: me.DATA.prize,
                                            sd: true
                                        }).show();
                                    }
                                }
                            });
                        })
                    }
                    me.data(true).show();
                }else if(d.s == -2) {
                    me.once("show", function () {
                        G.frame.damijing_setDef.show();
                    }).show();

                }
            }, true);
        },
        checkShow: function() {
            var me = this;

            me.getData(function () {
                me.show()
            }, function () {
                G.frame.damijing_setDef.show();
            })
        },
        onShow: function () {
            var me = this;
            me.event.emit("show");
            if(!me.data()) return;

            var zz = me.zz = me.nodes.mask;
            zz.hide();
            zz.zIndex = 9999999;

            me.ui.finds("panel_1").show();
            me.nodes.jdt_hp_d2.hide();
            me.setContents();
            me.event.emit("show");
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setLevelInfo();
            me.setHeroList();
            me.setButtonState();
            me.setBuff();
            me.setEnemy(true);
            me.setMedicinal();
            me.setCloseTime();
            G.hongdian.getData("watcher", 1, function () {
                me.checkRedPoint();
            })
        },
        checkRedPoint: function(is) {
            var me = this;
            var data = G.DATA.hongdian.watcher;
            var obj = {
                "target": "btn_jl",
                "trader": "btn_mjsd"
            };

            for(var i in data) {
                if(i == "trader") continue;
                if(data[i] > 0) {
                    G.setNewIcoImg(me.ui.finds(obj[i]));
                }else {
                    G.removeNewIco(me.ui.finds(obj[i]));
                }
            }
        },
        setButtonState: function() {
            var me = this;
            var isAllDead = true;
            var num = me.DATA.herolist.length;
            var keys = X.keysOfObject(me.DATA.status);

            if(keys.length < num) {
                isAllDead = false;
            }else {
                for (var i in me.DATA.status) {
                    if(me.DATA.status[i].hp > 0) {
                        isAllDead = false;
                        break;
                    }
                }
                if(isAllDead) {
                    me.ui.finds("btn_an").setBright(false);
                    me.isAllDead = true;
                }else {
                    me.ui.finds("btn_an").setBright(true);
                    me.isAllDead = false;
                }
            }

            if(me.isAllDead || me.DATA.layer > X.keysOfObject(G.class.getConf("watcher")).length) {
                me.ui.finds("js_you").hide();
                me.ui.finds("js_zuo").hide();
                me.ui.finds("ico_qizi").hide();

                me.nodes.img_rw.setBackGroundImage("img/mijing/" + (me.isAllDead ? "img_tz2" : "img_tz") + ".png", 1);
            }
        },
        setLevelInfo: function() {
            var me = this;
            var txt_gk = me.ui.finds("txt_gk");
            var level = me.DATA.layer;
            if(me.DATA.layer > X.keysOfObject(G.class.getConf("watcher")).length) {
                level = X.keysOfObject(G.class.getConf("watcher")).length;
            }
            var str = X.STR(G.class.watchercom.getTitle(parseInt((level - 1) / 100)), level);

            var rh = new X.bRichText({
                size: 24,
                maxWidth: txt_gk.width,
                lineHeight: 32,
                color: "#ffefe7",
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(txt_gk.width / 2, txt_gk.height / 2);
            txt_gk.removeAllChildren();
            txt_gk.addChild(rh);
        },
        setCloseTime: function() {
            var me = this;
            var txt_time = me.ui.finds("txt_shijian");

            var str = L("JSDJS") + " <font node=1></font>";
            var txt = new ccui.Text("", G.defaultFNT, 20);
            txt.setTextColor(cc.color("#30ff01"));
            X.enableOutline(txt, "#000000", 2);
            X.timeout(txt, me.DATA.rebirthtime, function () {
                X.uiMana.closeAllFrame();
            });

            var rh = new X.bRichText({
                size: 20,
                maxWidth: txt_time.width,
                lineHeight: 32,
                color: "#ffefe7",
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str, [txt]);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(txt_time.width / 2, txt_time.height / 2);
            txt_time.addChild(rh);
        },
        setHeroList: function() {
            var me = this;
            var data = me.DATA.herolist;
            var listView = me.ui.finds("lstView");
            var deadArr = [];
            var isAllDead = true;

            listView.removeAllChildren();

            for (var i = 0; i < data.length; i ++) {
                if(me.DATA.status && me.DATA.status[i] && me.DATA.status[i].hp <= 0) {
                    deadArr.push("dead");
                }else {
                    deadArr.push("live");
                }
            }
            for (var i = 0; i < deadArr.length; i ++) {
                if(deadArr[i] == "live") {
                    isAllDead = false;
                    break;
                }
            }
            me.deadArr = deadArr;
            if(isAllDead) me.ui.finds("js_zuo").hide();

            for(var i = 0; i < data.length; i ++) {
                var info = data[i][0];
                var wid = G.class.shero(info);
                wid.idx = i;
                wid.setScale(.8);
                wid.setName("wid" + i);
                if(deadArr[i] == "dead") {
                    wid.setEnabled(false);
                    wid.dead = true;
                }
                me.setHeroTouch(wid);
                listView.pushBackCustomItem(wid);
            }
            me.setState();
            if(!me.curIdx) {
                for(var i = 0; i < deadArr.length; i ++) {
                    if(deadArr[i] == "live") {
                        listView.children[i].triggerTouch(ccui.Widget.TOUCH_ENDED);
                        break;
                    }
                }
            }
            else {
                if(deadArr[me.curIdx] == "dead") {
                    for(var i = 0; i < deadArr.length; i ++) {
                        if(deadArr[i] == "live") {
                            listView.children[i].triggerTouch(ccui.Widget.TOUCH_ENDED);
                            break;
                        }
                    }
                }else {
                    listView.children[me.curIdx].triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
            }
        },
        setState: function() {
            var me = this;
            var listView = me.ui.finds("lstView");

            for(var i = 0; i < listView.children.length; i ++) {
                var chr = listView.children[i];
                var hp = (me.DATA.status && me.DATA.status[i] && me.DATA.status[i].hp && me.DATA.status[i].maxhp) ? me.DATA.status[i].hp / me.DATA.status[i].maxhp * 100 : 100;
                var nuqi = (me.DATA.status && me.DATA.status[i] && me.DATA.status[i].nuqi) ? me.DATA.status[i].nuqi : 50;
                chr.setNQ(nuqi, chr.dead ? false : true);
                chr.setHP(hp, chr.dead ? false : true);
            }
        },
        setHeroTouch: function(node) {
            var me = this;
            var listView = me.ui.finds("lstView");

            node.setTouchEnabled(node.dead ? false : true);
            node.click(function (sender) {
                node.setGou(true);
                me.setHero(node.idx);
                for(var i = 0; i < listView.children.length; i ++) {
                    var chr = listView.children[i];
                    if(chr.idx != sender.idx) chr.setGou(false);
                }
            })
        },
        setHero: function(idx) {
            var me = this;

            function f(idx) {
                var data = me.DATA.herolist[idx][0];
                var hp = (me.DATA.status && me.DATA.status[me.curIdx] && me.DATA.status[me.curIdx].hp && me.DATA.status[me.curIdx].maxhp) ? me.DATA.status[me.curIdx].hp / me.DATA.status[me.curIdx].maxhp * 100 : 100;
                var nuqi = (me.DATA.status && me.DATA.status[me.curIdx]) ? ((me.DATA.status[me.curIdx].nuqi || me.DATA.status[me.curIdx].nuqi == 0) ? me.DATA.status[me.curIdx].nuqi : 50) : 50;

                me.nodes.list_gw.show();
                me.nodes.jdt_hp.setPercent(hp);
                me.nodes.jdt_sp.setPercent(nuqi);
                me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + ((data.zhongzu * 1) + 1) + '_s.png', 1);

                if(hp < 20) {
                    G.class.ani.show({
                        json: "ani_mijing_xuetiao",
                        addTo: me.nodes.jdt_hp,
                        x: 33,
                        y: me.nodes.jdt_hp.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node) {
                            node.setName("xuetiao")
                        }
                    })
                }
                else {
                    while (me.nodes.jdt_hp.getChildByName("xuetiao")) {
                        me.nodes.jdt_hp.getChildByName("xuetiao").removeFromParent();
                    }
                }

                if(me.curModleIdx == idx) return;
                if(!me.curModleIdx && me.curModleIdx != 0) {
                    X.setHeroModel({
                        parent: me.nodes.panel_rw,
                        data: data,
                        scaleNum: .9
                    });
                }else {
                    me.nodes.list_gw.runAction(cc.moveBy(0.2, cc.p(-250, 0)));
                    me.nodes.panel_rw.children[0].runAction(cc.sequence(cc.moveBy(0.2, cc.p(-250, 0)), cc.callFunc(()=>{
                        me.nodes.panel_rw.removeAllChildren();
                        me.nodes.panel_rw.hide();
                        X.setHeroModel({
                            parent: me.nodes.panel_rw,
                            data: data,
                            callback: function (node) {
                                me.nodes.list_gw.runAction(cc.moveBy(0.2, cc.p(250, 0)));
                                node.x -= 250;
                                node.parent.show();
                                node.runAction(cc.moveBy(0.2, cc.p(250, 0)));
                            },
                            scaleNum: .9
                        });
                    })))
                }
                me.curModleIdx = idx;
            }

            me.curIdx = idx;
            f(idx);
        },
        setMedicinal: function () {
            var me = this;
            var arr = [];
            var conf = G.class.watchercom.getMedicine();
            me.ui.finds("lview").removeAllChildren();

            for(var i in conf) {
                var medicine = G.class.medicine(i, me.DATA.supply && me.DATA.supply[i] || 0, function (node) {
                    if(me.deadArr[me.curIdx] == "dead" || me.isAllDead) {
                        G.tip_NB.show(L("ALL_HERO_DEAD"));
                        return;
                    }
                    if(node.idx * 1 > 3) {
                        if(cc.isNode(me.dijing)) {
                            return;
                        }
                        me.zz.show();
                        me.ajax("watcher_useitem", [node.idx * 1 - 1, node.idx], function (str, data) {
                            if(data.s == 1) {
                                G.tip_NB.show(L("SYCG"));
                                if(node.idx == 5) {
                                    for (var i in data.d) {
                                        me.DATA[i] = data.d[i];
                                    }
                                    me.zz.hide();
                                    G.frame.damijing_buy.show();
                                    me.setMedicinal();
                                }else {
                                    for (var i in data.d.data) {
                                        me.DATA[i] = data.d.data[i];
                                    }
                                    G.class.ani.show({
                                        json: "ani_mijing_dushashouwei",
                                        addTo: me.ui.finds("js_you"),
                                        x: me.ui.finds("js_you").width / 2,
                                        y: me.ui.finds("js_you").height / 2,
                                        repeat: false,
                                        autoRemove: true,
                                        onkey: function (node, action, event) {
                                            if(event == "xiaoshi") {
                                                me.zz.hide();
                                                var winPrize = data.d.winprize;
                                                var layout = me.ui.finds("panel_ui");
                                                var target = me.ui.finds("js_you");
                                                target.hide();
                                                me.ui.finds("ico_qizi").hide();
                                                me.setLevelInfo();
                                                if(me.DATA.layer <= X.keysOfObject(G.class.getConf("watcher")).length) {
                                                    me.setWinAni(winPrize, layout, target);
                                                }
                                                me.setEnemy();
                                                me.setHeroList();
                                                me.setButtonState();
                                                G.hongdian.getData("watcher", 1, function () {
                                                    me.checkRedPoint(true);
                                                });
                                                G.frame.fight_win.emit("hide");
                                                me.setMedicinal();
                                            }
                                        }
                                    });
                                }
                            }
                        })
                    } else {
                        me.ajax("watcher_useitem", [1, node.idx, me.curIdx], function (str, data) {
                            if(data.s == 1) {
                                G.tip_NB.show(L("SYCG"));
                                me.DATA.supply = data.d.supply;
                                me.DATA.status = data.d.status;
                                me.setMedicinal();
                                G.class.ani.show({
                                    json: "ani_mijing_huifu",
                                    addTo: me.ui.finds("js_zuo"),
                                    x: me.ui.finds("js_zuo").width / 2,
                                    y: 10,
                                    repeat: false,
                                    autoRemove: true,
                                    onend: function (node) {
                                        me.setState();
                                        me.setHero(me.curIdx);
                                    }
                                });
                            }
                        })
                    }
                });
                arr.push(medicine);
            }
            X.center(arr, me.ui.finds("lview"));
        },
        setBuff: function () {
            var me = this;

            for(var i = 0; i < G.class.watchercom.getMixtureBuyId().length; i ++) {
                var num = me.DATA.mixture && me.DATA.mixture[i + 1] || 0;
                var conf = G.class.watchercom.getMixtureBuyId(i);
                var keys = X.keysOfObject(conf.buff);
                var text = me.nodes["txt_sl" + (i + 1)];

                text.setString(L(keys[0]) + "+" +conf.buff[keys[0]] * num / 10 + "%");
                text.setTextColor(cc.color(num == 0 ? "#ffffff" : (num >= conf.limit ? "#e85911" : "#30ff01")));
            }
        },
        setEnemy: function (first) {
            var me = this;

            if(me.DATA.layer > X.keysOfObject(G.class.getConf("watcher")).length || me.isAllDead) return;

            if(first) {
                me.playAni(function () {
                    me.addEnemy()
                })
            }else {
                me.addEnemy();
            }
        },
        addEnemy: function() {
            var me = this;

            var hp = me.DATA.npc.fightless ? (me.DATA.npc.fightless.hp / me.DATA.npc.fightless.maxhp * 100) : 100;
            var nuqi = me.DATA.npc.fightless ? (me.DATA.npc.fightless.nuqi || 50) : 50;

            me.nodes.list_gw2.show();
            me.nodes.jdt_hp2.setPercent(hp);
            me.nodes.jdt_sp2.setPercent(nuqi);
            me.nodes.panel_zz2.setBackGroundImage('img/public/ico/ico_zz' + ((me.DATA.npc.herolist[0].zhongzu * 1) + 1) + '_s.png', 1);

            if(hp < 20) {
                G.class.ani.show({
                    json: "ani_mijing_xuetiao",
                    addTo: me.nodes.jdt_hp2,
                    x: 33,
                    y: me.nodes.jdt_hp2.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setName("xuetiao")
                    }
                })
            }
            else {
                while (me.nodes.jdt_hp2.getChildByName("xuetiao")) {
                    me.nodes.jdt_hp2.getChildByName("xuetiao").removeFromParent();
                }
            }

            X.setHeroModel({
                parent: me.nodes.panel_rw2,
                data: me.DATA.npc.headdata,
                direction: -1
            })
        },
        playAni: function (callback) {
            var me = this;
            G.class.ani.show({
                json: "ani_tanxian_guaiwushuaxin",
                addTo: me.ui.finds("panel_ui"),
                x: me.ui.finds("js_you").x,
                y: me.ui.finds("js_you").y + 140,
                repeat: false,
                autoRemove: true,
                onkey: function (node, action, event) {
                    if(event == "chuxian") {
                        callback && callback();
                    }
                }
            })
        }
    });
    G.frame[ID] = new fun('mijing.json', ID);
})();