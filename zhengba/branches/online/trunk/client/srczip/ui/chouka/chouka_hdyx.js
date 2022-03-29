/**
 * Created by LYF on 2018/6/14.
 */
 (function () {
    //抽卡-获得英雄
    var ID = 'chouka_hdyx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ["ani_chouka_guangxiao.png", "ani_chouka_guangxiao.plist"];
            me._super(json, id, {action: true});

        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            
            me.nodes.btn_qd.click(function (sender, type) {
                me.remove();
            });

            var data = me.data().data;
            if(!data){
                me.nodes.btn_qd.setPositionX(me.ui.width/2 + me.nodes.btn_qd.width/2 + 5);
                return;
            }
            var img = me.ui.finds("img_zs");
            var imgNum = me.ui.finds('text_zs$');
            var ci = me.ui.finds("text_sc");
            if(me.data().type % 2 == 0){
                ci.setString(L("SC"));
            }else{
                ci.setString(L("YC"));
            }

            if(G.class.getOwnNum(data.need[0].t, data.need[0].a) < data.need[0].n){
                if(data.rmbmoney.length > 0){
                    img.loadTexture(G.class.getItemIco(data.rmbmoney[0].t), 1);
                    imgNum.setString(data.rmbmoney[0].n);
                }else{
                    img.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                    imgNum.setString(data.need[0].n);
                }
            }else{
                img.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                imgNum.setString(data.need[0].n);
            }
            me.nodes.btn_sc.click(function (sender, type) {
                if(G.class.getOwnNum(data.need[0].t, data.need[0].a) < data.need[0].n){
                    if(data.rmbmoney.length > 0){
                        if(P.gud.rmbmoney < data.rmbmoney[0].n){
                            G.tip_NB.show(L("ZSBZ"));
                            return;
                        }else{
                            G.frame.chouka.chou(me.data().type, data, true);
                        }
                    }else{
                        G.tip_NB.show(L("YJBZ"));
                        return;
                    }
                }else{
                    G.frame.chouka.chou(me.data().type, data, true);
                }
            }, 500);
            
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
                    if(event == "cx") {
                        G.class.ani.show({
                            json: "chouka_dh1",
                            addTo: ani,
                            x: ani.width / 2,
                            y: 260,
                            repeat: false,
                            cache: true,
                            autoRemove: true,
                            onload: function (node, action) {
                                action.setTimeSpeed(1.4);
                            },
                            onkey: function (node, action, event) {
                                if(event == "hit") {
                                    G.class.ani.show({
                                        json: "chouka_dh3",
                                        addTo: me.nodes.panel_dh1,
                                        x: me.nodes.panel_dh1.width / 2,
                                        y: me.nodes.panel_dh1.height / 2,
                                        repeat: false,
                                        autoRemove: false,
                                        onload: function (node) {
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


    G.frame[ID] = new fun('chouka_hdyx.json', ID);
})();