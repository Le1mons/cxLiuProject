/**
 * Created by LYF on 2018/6/14.
 */
(function () {
    //捞元宵
    var ID = 'yuanxiao2022_hddx';

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

            var need = me.data().need;
            var img = me.ui.finds("img_zs");
            var imgNum = me.ui.finds('text_zs$');
            var ci = me.ui.finds("text_sc");
            if(me.data().type % 2 == 0){
                ci.setString(L("SC"));
            }else{
                ci.setString(L("YC"));
            }
            img.loadTexture(G.class.getItemIco(need[0].t), 1);
            imgNum.setString(need[0].n);
            me.nodes.btn_sc.click(function (sender, type) {
                    var haveNum = G.class.getOwnNum(need[0].t, need[0].a);
                    if(haveNum < need[0].n){
                        G.tip_NB.show(L("WPBZ"));
                    }else{
                        if (me.data().type == 1){
                            G.frame.yuanxiao2022.nodes.btn_1.triggerTouch(2);
                        } else {
                            G.frame.yuanxiao2022.nodes.btn_2.triggerTouch(2);
                        }

                 }
                me.remove();
            }, 500);

            me.nodes.btn_bz.hide();

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
            me.nodes.panel_yhsp.hide();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.ui.setTouchEnabled(true);

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
            me.showPrize();
        },
        showPrize: function() {
            var me = this;

            if(me.data().prize.length > 1){
                me.chouType = "ten";
                if (me.data().prize.length>5){
                    me.tenChou();
                } else {
                    me.midlldeChou();
                }

            }else{
                me.chouType = "one";
                me.oneChou();
            }
        },
        midlldeChou:function(){
            var me = this;
           me.nodes.panel_wp.removeAllChildren();
            X.alignItems(me.nodes.panel_wp,me.data().prize,'center',{
                touch:true,
            });
            me.nodes.btn_qd.show();
            me.nodes.btn_sc.show();
        },
        oneChou: function(){
            var me = this;
            var hero = G.class.sitem(me.data().prize[0]);
            hero.hide();
            hero.setPosition(me.nodes.ico_yx.width / 2, me.nodes.ico_yx.height / 2);
            hero.setTouchEnabled(true);
            G.frame.iteminfo.showItemInfo(hero);
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
                        me.nodes.btn_sc.show();
                    }
                }
            });
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
        },
        tenChou: function () {
            var me = this;
            var idx;
            var icon;
            var long = me.data().prize.length;

            for(var i = 0; i < long; i ++){
                if(me.nodes["ico_" + (i + 1)].getChildren().length < 1){
                    idx = i;
                    icon = me.nodes["ico_" + (i + 1)];
                    break;
                }
                if(me.nodes["ico_" + long].getChildren().length > 0) {
                    me.nodes.btn_qd.show();
                    me.nodes.btn_sc.show();
                    return;
                }
            }
            var hero = G.class.sitem(me.data().prize[idx]);
            hero.setPosition(icon.width / 2, icon.height / 2);
            hero.setTouchEnabled(true);
            G.frame.iteminfo.showItemInfo(hero);
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
                me.tenChou();
            }, 100);
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
        },
    });
    G.frame[ID] = new fun('chouka_hdyx.json', ID);
})();