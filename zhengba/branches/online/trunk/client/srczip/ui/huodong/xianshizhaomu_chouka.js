/**
 * Created by LYF on 2019/1/14.
 */
(function () {
    //限时招募-抽卡
    var ID = 'xianshizhaomu_chouka';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
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
            });

            me.nodes.btn_sc.click(function () {



                G.frame.xianshizhaomu.chou(me.data().length);
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



            if(G.frame.xianshizhaomu.isAni) {
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
                                    if(me.data().length == 1) {
                                        G.class.ani.show({
                                            json: "chouka_dh3",
                                            addTo: me.nodes.panel_dh1,
                                            x: me.nodes.panel_dh1.width / 2,
                                            y: me.nodes.panel_dh1.height / 2,
                                            repeat: false,
                                            autoRemove: false,
                                            onload: function (node) {
                                                me.setContents();
                                            },
                                        })
                                    } else {
                                        me.action.playWithCallback("donghua", false, function () {

                                            me.setContents();
                                        });
                                    }
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
                            me.showHero(hero.conf);
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
                    me.showHero(hero.conf, function () {
                        me.tenChou();
                    });
                }else {
                    me.tenChou();
                }
            }, 300);
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
        },
        showHero: function (conf, callback) {
            var me = this;
            var layout = new ccui.Layout;
            layout.setContentSize(cc.director.getWinSize());
            layout.setTouchEnabled(true);
            me.ui.addChild(layout);

            G.class.ani.show({
                json: "ani_xinhuode_wuxing_ui",
                addTo: layout,
                x: layout.width / 2,
                y: layout.height / 2,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    action.playWithCallback("kaishi", false, function () {
                        action.play("xunhuan", true);
                        X.setHeroModel({
                            parent: node.finds("renwu1"),
                            data: conf
                        });
                        me.ui.setTimeout(function () {
                            me.emit("aniOver");
                            layout.click(function (sender) {
                                callback && callback();
                                sender.removeFromParent();
                            })
                        }, 1000);
                    });
                },
            });

            G.class.ani.show({
                json: "ani_xinhuode_wuxing",
                addTo: layout,
                x: layout.width / 2,
                y: layout.height / 2,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    node.finds("yingxiong").setString(conf.name)
                }
            });
        }
    });
    G.frame[ID] = new fun('xianshizhaomu_chouka.json', ID);
})();