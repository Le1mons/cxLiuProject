/**
 * Created by LYF on 2018/6/14.
 */
 (function () {
    //抽卡-获得英雄
    var ID = 'chouka_hdyx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ["ani_chouka_guangxiao.png", "ani_chouka_guangxiao.plist", "gongxihuode_ui_dh.png", "gongxihuode_ui_dh.plist"];
            me._super(json, id, {action: true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            
            me.nodes.btn_qd.click(function (sender, type) {
                me.remove();
                G.event.emit("showPackage");
            });

            var data = me.data().data;
            if(!data){
                me.nodes.btn_qd.setPositionX(me.ui.width/2 + me.nodes.btn_qd.width/2 + 5);
                return;
            }
            var choukatype = me.data().choukatype;
            var img = me.ui.finds("img_zs");
            var imgNum = me.ui.finds('text_zs$');
            var ci = me.ui.finds("text_sc");
            if(me.data().type % 2 == 0){
                ci.setString(L("SC"));
            }else{
                ci.setString(L("YC"));
            }

            //勇者招募
            if(choukatype == "zhaomu"){
                img.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                imgNum.setString(me.data().type == 1 ? data.need[0].n : data.need[0].n*10);
                me.nodes.btn_sc.click(function () {
                    if(G.frame.wangzhezhaomu_main.isShow){
                        G.frame.wangzhezhaomu_main.view.chouka(me.data().num,me.data().type,true);
                    }
                })
            }else {
                if(G.class.getOwnNum(data.need[0].t, data.need[0].a) < data.need[0].n){
                    if(data.rmbmoney.length > 0){
                        img.loadTexture(G.class.getItemIco(data.rmbmoney[0].t), 1);
                        if (me.data().type == 4) {
                            imgNum.setString((10 - G.class.getOwnNum(data.need[0].t, data.need[0].a)) * 200);
                        } else {
                            imgNum.setString(data.rmbmoney[0].n);
                        }
                    }else{
                        img.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                        imgNum.setString(data.need[0].n);
                    }
                }else{
                    img.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                    imgNum.setString(data.need[0].n);
                }
                me.nodes.btn_sc.click(function (sender, type) {
                    var haveNum = G.class.getOwnNum(data.need[0].t, data.need[0].a);
                    if(G.class.getOwnNum(data.need[0].t, data.need[0].a) < data.need[0].n){
                        if(data.rmbmoney.length > 0){
                            if (me.data().type == 4) {
                                if (P.gud.rmbmoney < (10 - haveNum) * 200) {
                                    return G.tip_NB.show(L("ZSBZ"));
                                } else {
                                    if(!X.cacheByUid('chouka1_hint')) {
                                        return G.frame.hint.data({
                                            callback: function () {
                                                G.frame.chouka.chou(me.data().type, data, true);
                                            },
                                            cacheKey: "chouka1_hint",
                                            txt: X.STR(L("CHOUKA_TS1"), haveNum,
                                                (10 - haveNum) * 200)
                                        }).show();
                                    }else {
                                        return G.frame.chouka.chou(me.data().type, data, true);
                                    }

                                }
                            } else {
                                if(P.gud.rmbmoney < data.rmbmoney[0].n){
                                    return G.tip_NB.show(L("ZSBZ"));
                                }else{
                                    G.frame.chouka.chou(me.data().type, data, true);
                                }
                            }
                        }else{
                            G.tip_NB.show(L("YJBZ"));
                        }
                    }else{
                        G.frame.chouka.chou(me.data().type, data, true);
                    }
                }, 500);
            }

            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L('TS1')
                }).show();
            });

            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.once("hide", function () {
                    me.setAttr();
                }).show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.once("hide", function () {
                    me.setAttr();
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.nodes.btn_jia.hide();
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.nodes.ico_yhsp.setBackGroundImage("img/public/token/token_yhsp.png", 1);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.ui.setTouchEnabled(true);

            if(me.data().jifen) {
                me.nodes.txt_yhspsl.setString(me.data().jifen)
            }

            me.setAttr();
            if(!me.data().bool) {
                me.ui.finds("bg_ico").hide();
                me.ui.finds('bg_2').opacity = 0;
                me.setAnimation();
            } else {
                me.setContents();
            }
            me.setButton(false);
            me.endPos = me.ui.finds("panel_ui").convertToNodeSpace(me.ui.finds("panel_jdt").convertToWorldSpace(me.nodes.btn_info));
        },
        setButton: function(isShow){
            var me = this;
            me.nodes.btn_sc.setVisible(isShow);
            me.nodes.btn_qd.setVisible(isShow);
            me.nodes.btn_bz.setVisible(isShow);
            me.ui.finds("panel_jdt").setVisible(isShow);
        },
        setAttr: function () {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        setAnimation: function(){
            var me = this;
            var bg2 = me.ui.finds('bg_2');
            bg2.runAction(cc.fadeOut(0.3));

            for(var i = 0; i < 2; i ++){
                var layout = me.nodes["panel_fire" + (i + 1)];
                G.class.ani.show({
                    json: "ani_chouka_huo",
                    addTo: layout,
                    x: layout.width / 2,
                    y: layout.height / 2 - 18,
                    cache: true,
                    repeat: true,
                    autoRemove: false
                })
            }

            var ani = me.nodes.panel_dh;
            ani.removeAllChildren();

            G.class.ani.show({
                json: "ani_chouka_taizi",
                addTo: ani,
                x: ani.width / 2,
                y: 259,
                repeat: false,
                cache: true,
                autoRemove: true,
                onkey: function (node, action, event) {
                    action.setTimeSpeed(1.2);
                    if(event == "cx") {
                        G.class.ani.show({
                            json: "chouka_dh1",
                            addTo: ani,
                            x: ani.width / 2,
                            y: 260,
                            repeat: false,
                            cache: true,
                            autoRemove: true,
                            onload: function (node, action1) {
                                action1.setTimeSpeed(1.2);
                            },
                            onkey: function (node, action, event1) {
                                if(event1 == "hit") {
                                    G.class.ani.show({
                                        json: "chouka_dh3",
                                        addTo: me.nodes.panel_dh1,
                                        x: me.nodes.panel_dh1.width / 2,
                                        y: me.nodes.panel_dh1.height / 2,
                                        repeat: false,
                                        autoRemove: false,
                                        onload: function (node, action2) {
                                            action2.setTimeSpeed(1.2);
                                            var callfunc = cc.callFunc(function () {
                                                me.setContents();
                                            });
                                            bg2.runActions([
                                                cc.fadeIn(0.4),
                                                callfunc
                                            ]);
                                        },
                                        onend: function () {
                                            
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            G.class.ani.show({
                json: "ani_chouka_guangxiao",
                addTo: me.ui.finds("bg_ico"),
                x: me.ui.finds("bg_ico").width / 2,
                y: me.ui.finds("bg_ico").height / 2,
                repeat: false,
                cache:true,
                autoRemove: true
            });
            me.ui.finds("bg_ico").show();

            me.fiveStar = [];

            var heros = me.data().hero;
            for (var i in heros) {
                if(G.gc.hero[heros[i].t].star == 5) me.fiveStar.push(G.gc.hero[heros[i].t]);
            }

            if(me.fiveStar.length < 1) me.showPrize();
            else me.showHero();
        },
        showPrize: function() {
            var me = this;

            if(me.data().hero.length > 1){
                me.chouType = "ten";
                me.tenChou();
            }else{
                me.chouType = "one";
                me.oneChou();
            }
        },
        oneChou: function(){
            var me = this;
            var hero = G.class.shero(me.data().hero[0]);
            hero.hide();
            hero.setPosition(me.nodes.ico_yx.width / 2, me.nodes.ico_yx.height / 2);
            hero.setTouchEnabled(true);
            hero.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    G.frame.yingxiong_jianjie.data({
                        id:me.data().hero[0].t
                    }).show();
                }
            });
            me.nodes.ico_yx.addChild(hero);
            G.class.ani.show({
                json: "ani_chouka_chuxian",
                addTo: me.nodes.ico_yx,
                x: me.nodes.ico_yx.width / 2,
                y: me.nodes.ico_yx.height / 2 + 7,
                repeat: false,
                cache:true,
                autoRemove: true,
                onkey: function (node, action, event) {
                    if(event == "chuxian") {
                        hero.show();
                        me.nodes.btn_qd.show();
                        if(me.data().data) me.nodes.btn_sc.show();
                        if(me.data().jifen) me.nodes.panel_yhsp.show();
                        me.event.emit("over");
                        if(hero.conf.star > 4) {
                            G.class.ani.show({
                                json: "ani_huoqu5xing",
                                addTo: hero,
                                x: hero.width / 2,
                                y: hero.height / 2,
                                repeat: true,
                                autoRemove: false,
								releaseRes:false,
                                onload :function(node,action){
                                    node.setScale(1.4);
                                }
                            });
                        }
                        me.ui.setTimeout(function(){
                            G.guidevent.emit('chouka_hdyx_one_over');
                        },300);
                    }
                }
            });
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
        },
        tenChou: function () {
            var me = this;
            var idx;
            var icon;
            var long = me.data().hero.length;

            for(var i = 0; i < long; i ++){
                if(me.nodes["ico_" + (i + 1)].getChildren().length < 1){
                    idx = i;
                    icon = me.nodes["ico_" + (i + 1)];
                    break;
                }
                if(me.nodes["ico_" + long].getChildren().length > 0) {
                    me.nodes.btn_qd.show();
                    me.nodes.btn_sc.show();
                    me.event.emit("over");
                    if(me.data().jifen) me.nodes.panel_yhsp.show();
                    return;
                }
            }
            var hero = G.class.shero(me.data().hero[idx]);
            hero.setPosition(icon.width / 2, icon.height / 2);
            hero.setTouchEnabled(true);
            hero.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    G.frame.yingxiong_jianjie.data({
                        id: me.data().hero[idx].t
                    }).show();
                }
            });
            hero.hide();
            icon.addChild(hero);

            G.class.ani.show({
                json: "ani_chouka_chuxian",
                addTo: icon,
                x: icon.width / 2,
                y: icon.height / 2 + 7,
                repeat: false,
                cache:true,
                autoRemove: true,
            });
            me.ui.setTimeout(function () {
                hero.show();
                if(hero.conf.star > 4) {
                    G.class.ani.show({
                        json: "ani_huoqu5xing",
                        addTo: hero,
                        x: hero.width / 2,
                        y: hero.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload :function(node,action){
                            node.setScale(1.4);
                        }
                    });
                }
                me.tenChou();
            }, 150);
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
        },
        showHero: function () {
            var me = this;
            var conf = me.fiveStar.shift();

            if (!conf) {
                me.aniNode.hide();
                me.aniNode.action.gotoFrameAndPause(0);
                return me.showPrize();
            }

            if (!cc.isNode(me.aniNode)) {
                G.class.ani.show({
                    json: "ani_xinhuode_wuxing_ui",
                    addTo: me.ui,
                    cache: true,
                    z: 1000,
                    x: 0,
                    y: 0,
                    autoRemove: false,
                    onload: function (node, action) {
                        X.autoInitUI(node);
                        X.autoInitUI(node.nodes.panel_jn1);
                        X.autoInitUI(node.nodes.panel_jn2);
                        me.aniNode = node;
                        node.show();
                        node.action = action;
                        me.showFiveHero(node, conf);

                        node.nodes.mask.click(function () {
                            if (G.frame.yingxiong_skill_xq.isShow) {
                                G.frame.yingxiong_skill_xq.remove();
                            }
                            me.showHero();
                        });
                    }
                });
            } else {
                me.aniNode.show();
                me.showFiveHero(me.aniNode, conf);
            }
        },
        showFiveHero: function (aniNode, conf) {
            G.DATA.noClick = true;
            X.audio.playEffect("sound/chengkabaodian.mp3", false);
            aniNode.action.playWithCallback("in", false, function () {
                G.DATA.noClick = false;
                G.class.hero.getSoundByHid(conf.hid);
                aniNode.action.play("wait", true);
            });

            aniNode.finds("renwu1").removeAllChildren();
            X.setHeroModel({
                parent: aniNode.finds("renwu1"),
                data: conf,
                callback: function (node) {
                    node.runAni(0, "atk", false);
                    node.addAni(0, "wait", true, 0);
                },
                cache:false
            });

            X.render({
                zz: function (node) {
                    node.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '.png', 1);
                },
                yx: conf.name,
                js: function (node) {
                    node.setBackGroundImage("img/gongxihuode/" + conf.dingwei + ".png", 1);
                }
            }, aniNode.nodes);

            var skillList = G.class.hero.getSkillList(conf.hid, conf.star);
            aniNode.nodes.panel_jn2.setVisible(skillList.length == 3);
            aniNode.nodes.panel_jn1.setVisible(skillList.length == 4);
            var jnPanel = skillList.length == 3 ? aniNode.nodes.panel_jn2 : aniNode.nodes.panel_jn1;
            for (var i = 0; i < skillList.length; i ++) {
                var lay = jnPanel.nodes["jn" + (i + 1)];
                var p = G.class.ui_skill_list(skillList[i], true, null, 1);
                p.setPosition(lay.width / 2, lay.height / 2);
                lay.removeAllChildren();
                lay.addChild(p);

                var txt = jnPanel.nodes["jnwb" + (i + 1)] || jnPanel.nodes["jnwb" + (i + 1) + "_0"];
                txt.setString(p.data.name);
            }
        }
    });


    G.frame[ID] = new fun('chouka_hdyx.json', ID);
})();