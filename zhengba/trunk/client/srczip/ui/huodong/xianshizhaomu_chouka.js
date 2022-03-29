/**
 * Created by LYF on 2019/1/14.
 */
(function () {
    //限时招募-抽卡
    var ID = 'xianshizhaomu_chouka';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ["gongxihuode_ui_dh.png", "gongxihuode_ui_dh.plist"];
            me._super(json, id,{action:true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

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

            me.nodes.btn_qd.click(function () {
                me.remove();
                G.event.emit("showPackage");
            });

            me.nodes.btn_sc.click(function () {
                G.frame.huodong.xszm.chou(me.data().length);
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setAttr();
            me.setButton();
            me.setButtonVisible(false);



            if(G.frame.huodong.xszm.isAni) {
                me.setAnimation();
            } else {
                me.setContents();
            }
        },
        setButton: function() {
            var me = this;

            me.nodes.btn_sc.finds("text_zs$").setString(G.gc.xianshizhaomu.data[me.data().length].need[0].n);
            me.ui.finds("text_sc").setString(me.data().length + L("CI"));
        },
        setButtonVisible: function(isShow) {
            var me = this;

            me.nodes.btn_qd.setVisible(isShow);
            me.nodes.btn_sc.setVisible(isShow);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.fiveStar = [];
            var heros = me.data();
            for (var i in heros) {
                if(G.gc.hero[heros[i].t].star == 5) me.fiveStar.push(G.gc.hero[heros[i].t]);
            }

            if(me.fiveStar.length < 1) me.showPrize();
            else me.showHero();
        },
        showPrize: function() {
            var me = this;

            if(me.data().length > 1){
                me.chouType = "ten";
                me.tenChou();
            }else{
                me.chouType = "one";
                me.oneChou();
            }
        },
        setAttr: function () {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        setAnimation: function () {
            var me = this;

            var ani = me.nodes.panel_dh1;
            ani.removeAllChildren();
            me.nodes.panel_ck.hide();
            G.class.ani.show({
                json: "ani_chouka_taizi",
                addTo: ani,
                x: ani.width / 2,
                y: 47,
                repeat: false,
                autoRemove: true,
                onkey: function (node, action, event) {
                    if(event == "cx") {
                        G.class.ani.show({
                            json: "chouka_dh1",
                            addTo: ani,
                            x: ani.width / 2,
                            y: 55,
                            repeat: false,
                            autoRemove: true,
                            onload: function (node, action) {
                                action.setTimeSpeed(1.4);
                            },
                            onkey: function (node, action, event) {
                                if(event == "hit") {
                                    me.ui.finds("bg_2").runActions([
                                        cc.fadeIn(0.3)
                                    ]);
                                    me.nodes.panel_ck.show();
                                    me.setContents();
                                    // if(me.data().length == 1) {
                                    //     G.class.ani.show({
                                    //         json: "chouka_dh3",
                                    //         addTo: me.nodes.panel_dh1,
                                    //         x: me.nodes.panel_dh1.width / 2,
                                    //         y: me.nodes.panel_dh1.height / 2,
                                    //         repeat: false,
                                    //         autoRemove: false,
                                    //         onload: function (node) {
                                    //             me.setContents();
                                    //         },
                                    //     })
                                    // } else {
                                    //     me.nodes.panel_ck.show();
                                    //     me.setContents();
                                    // }
                                }
                            }
                        });
                    }
                }
            });
        },
        oneChou: function(){
            var me = this;
            var hero = G.class.shero(me.data()[0]);
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
                        me.setButtonVisible(true);
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
            var long = me.data().length;

            for(var i = 0; i < long; i ++){
                if(me.nodes["ico_" + (i + 1)].getChildren().length < 1){
                    idx = i;
                    icon = me.nodes["ico_" + (i + 1)];
                    break;
                }
                if(me.nodes["ico_" + long].getChildren().length > 0) {
                    me.setButtonVisible(true);
                    me.event.emit("over");
                    return;
                }
            }
            var hero = G.class.shero(me.data()[idx]);
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
                        node.action = action;
                        node.show();
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
                }
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
    G.frame[ID] = new fun('xianshizhaomu_chouka.json', ID);
})();