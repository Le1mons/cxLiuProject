/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //人物升级
    var ID = 'playerlvup';

    G.event.on("playerLvup", function (d) {
        G.hongdian.getHongdian(1);
        G.view.mainView.checkUnlock();
		//前几级弹框会影响新手指导
        if(d.olv < 5) return;
        if(d.lv >= G.class.opencond.getLvById("gonghui")) G.view.mainMenu.checkGonghuiRed();
        if(G.frame.tanxian.isShow) {
            G.frame.tanxian.setBtns();
            G.frame.tanxian.checkFunctionOpen();
        }
        if(G.frame.yingxiong_fight.isShow){
            G.frame.tanxianFight.once("hide", function () {
                G.frame.playerlvup.data(d).show();
            });
        }else{
            cc.director.getRunningScene().setTimeout(function () {
                if(G.frame.jiangli.isShow){
                    G.frame.jiangli.once("hide", function () {
                        G.frame.playerlvup.data(d).show();
                    })
                } else if(G.DATA.tanxianAni){
                    G.event.once("aniEnd", function () {
                        cc.director.getRunningScene().setTimeout(function () {
                            if(G.frame.jiangli.isShow){
                                G.frame.jiangli.once("hide", function () {
                                    G.frame.playerlvup.data(d).show();
                                })
                            }else{
                                G.frame.playerlvup.data(d).show();
                            }
                        }, 500);
                    })
                } else{
                    G.frame.playerlvup.data(d).show();
                }
            }, 500);
        }

        if(d.lv == 22 && P.gud.payexp < 60) {
            cc.director.getRunningScene().setTimeout(function () {
                if(G.frame.playerlvup.isShow) {
                    G.frame.playerlvup.once("hide", function () {
                        G.guide.show(170);
                    });
                } else {
                    G.guide.show(170);
                }
            }, 700);
        }
    });

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
            me.preLoadRes = ["jiesuojianzhu.png", "jiesuojianzhu.plist"]
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                if(!me.open || !me.open.title[me.idx]){
                    G.event.emit("showPackage");
                    me.remove();
                }else{
                    G.event.emit("showPackage");
                    me.showOpen();
                }
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.idx = 0;
            me.open = {
                "title": [],
                "info": [],
                "img": []
            };

            var newLv = me.data().lv;
            var oldLv = me.data().olv;
            var conf = G.class.getConf("open");
            var keys = X.keysOfObject(conf);
            var openArr = [];
            for(var i = 0; i < keys.length; i ++){
                if(keys[i] > oldLv && keys[i] <= newLv){
                    if(keys[i] !== 45) {
                        openArr.push(conf[keys[i]]);
                    }else {
                        if(P.gud.vip < 3) openArr.push(conf[keys[i]]);
                    }

                }
            }
            for(var i = 0; i < openArr.length; i ++){
                if (openArr[i].time && G.OPENTIME > openArr[i].time) continue;
                for(var j in openArr[i].title){
                    me.open.title.push(openArr[i].title[j]);
                }
                for(var k in openArr[i].title){
                    me.open.info.push(openArr[i].info[k]);
                }
                for(var l in openArr[i].title){
                    me.open.img.push(openArr[i].img[l]);
                }
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var data = me.data();
            var conf = G.class.getConf("player")[data.lv];
            X.audio.playEffect("sound/wanjiashengji.mp3");
            G.class.ani.show({
                json: "ani_renwusj",
                addTo: me.ui.finds("Image_1"),
                x: me.ui.finds("Image_1").width / 2,
                y: me.ui.finds("Image_1").height / 2,
                repeat: false,
                autoRemove: false,
                onload: function(node, action){
                    X.autoInitUI(node);
                    if(conf){
                        var str = X.STR("<font node=1></font>  +{1}", conf.prize[0].n);
                        var icon = new ccui.ImageView(G.class.getItemIco(conf.prize[0].t), 1);
                        var rh = new X.bRichText({
                            size: 22,
                            maxWidth: node.nodes.Panel_1.width,
                            lineHeight: 34,
                            family: G.defaultFNT,
                            color: "#ffffff",
                            eachText: function (node) {
                                X.enableOutline(node, "#000000", 2);
                            }
                        });
                        rh.text(str, [icon]);
                        rh.setAnchorPoint(0.5, 0.5);
                        rh.setPosition(node.nodes.Panel_1.width / 2, node.nodes.Panel_1.height / 2);
                        node.nodes.Panel_1.removeAllChildren();
                        node.nodes.Panel_1.addChild(rh);
                    }else{
                        node.nodes.ico_1.hide();
                        node.nodes.wz_1.hide();
                    }
                    node.nodes.dengji_1.setString(data.lv);
                },
                onend: function (node, action) {
                    action.play("wait", true);
                }
            })
        },
        onHide: function () {
            var me = this;
            me.emit("hide");
            X.upStarGuide();
        },
        setContents: function () {
            var me = this;
        },
        showOpen: function () {
            var me = this;
            me.ui.finds("Image_1").removeAllChildren();
            G.class.ani.show({
                json: "ani_jiesuoxinwanfa",
                addTo: me.ui.finds("Image_1"),
                x: me.ui.finds("Image_1").width / 2,
                y: me.ui.finds("Image_1").height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    if(me.open.title[me.idx] == '神殿之路'){
                        me.ajax('getayncbtn',[['sdjj']],function (str,data) {
                            G.DATA.asyncBtnsData.sdjj = data.d.sdjj;
                        });
                    }
                    node.ui.finds("Text_1").setString(me.open.title[me.idx]);
                    node.ui.finds("Text_2").setString(me.open.info[me.idx]);
                    var img = me.open.img && me.open.img[me.idx];
                    if(img) node.ui.finds("Panel_2").setBackGroundImage("img/jiesuojianzhu/" + me.open.img[me.idx] + ".png", 1);
                    me.idx ++;
                },
            })
        }
    });
    G.frame[ID] = new fun('touming.json', ID);
})();