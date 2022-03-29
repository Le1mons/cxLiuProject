/**
 * Created by LYF on 2018/6/13.
 */
(function () {
    //每日试炼
    var ID = 'meirishilian';

    var fun = X.bUi.extend({
        extConf: [
            "jinbi",
            "exp",
            "hero"
        ],
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
            me.nodes.btn_jia.click(function (sender, type) {
                G.frame.meirishilian_gm.data({
                    data: me.DATA,
                    type: me.type
                }).show();
            });

            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS2")
                }).show();
            });

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_xsl1.click(function () {
                me.setContents(false);
            });
            
            me.nodes.btn_xsl2.click(function () {
                me.setContents(true);
            });

            me.nodes.slrw.setTouchEnabled(true);
            me.nodes.slrw.click(function (sender) {
                if(sender.children[0]) {
                    sender.children[0].runAni(0, "atk", false);
                    sender.children[0].addAni(0, "wait", true, 0);
                }
            });

            me.ui.finds("btn_slzd").click(function () {
                if(me.nodes.text_sycs.getString() * 1 < 1) {
                    G.tip_NB.show(L("TZCSBZ"));
                    return;
                }
                var conf = G.class.meirishilian.getConfByType(me.type);
                var obj = {
                    pvType:'pvshilian',
                    data: {
                        type: me.type,
                        npc: conf[me.typeLevel[me.type]].monster,
                        prize: conf[me.typeLevel[me.type]].prize,
                        nandu: me.typeLevel[me.type]
                    }
                };
                G.frame.yingxiong_fight.data(obj).show();
            });

            me.nodes.text_jbsl.setString(L("FENGSHOU") + L("SILIAN"));
            me.nodes.text_jysl.setString(L("JY") + L("SILIAN"));
            me.nodes.text_yxsl.setString(L("WUWEI") + L("SILIAN"));

            X.radio([me.nodes.ico_1, me.nodes.ico_2, me.nodes.ico_3], function (sender) {
                me.changeType(sender.getName().split("_")[1][0]);
            }, {
                callback1: function (sender) {
                    var parent = sender.getParent();

                    if(parent.ani) {
                        parent.ani.show();
                    }else {
                        G.class.ani.show({
                            json: "ani_meirishilian",
                            addTo: parent.children[4],
                            x: 90,
                            y: 70,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node) {
                                parent.ani = node;
                            }
                        })
                    }
                    parent.children[3].setOpacity(255);
                    parent.children[1].show();
                },
                callback2: function (sender) {
                    var parent = sender.getParent();

                    if(parent.ani) parent.ani.hide();
                    parent.children[3].setOpacity(255 * 0.6);
                    parent.children[1].hide();

                    var key = me.extConf[parseInt(sender.getName().split("_")[1][0]) - 1];
                    if(me.typeLevel[key]) {
                        me.typeLevel[key] = undefined;
                    }
                }
            });

            var sPos;
            me.ui.finds("Image_16").setTouchEnabled(true);
            me.ui.finds("Image_16").touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    sPos = sender.getTouchBeganPosition();
                } else if (type == ccui.Widget.TOUCH_MOVED) {

                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    var ePos = sender.getTouchEndPosition();
                    if (ePos.x - sPos.x < -10) {
                        if(me.typeLevel[me.type] == X.keysOfObject(G.class.meirishilian.getConfByType(me.type)).length) {
                            return;
                        }
                        me.setContents(true);
                    } else if (ePos.x - sPos.x > 10) {
                        if(me.typeLevel[me.type] == 1) {
                            return;
                        }
                        me.setContents(false);
                    }
                }
            })
        },
        changeType: function(type) {
            var me = this;

            if(me.type && me.type == me.extConf[type - 1]) return;

            me.type = me.extConf[type - 1];
            me.ui.finds("wz1").setBackGroundImage("img/meirishilian/wz_shilian" + type + ".png", 1);
            me.ui.finds("bg_sl").loadTexture("img/bg/bg_shilian" + type + ".jpg");

            me.setContents();
            me.getData(function () {
                me.setCS();
            });
        },
        setCS: function(){
            var me = this;
            me.nodes.text_sycs.setString(me.DATA.lessnum);
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openshilian.mp3", false);
            me.fillSize();
            me.initUi();
            me.bindBtn();

            me.typeLevel = {};
            me.nodes.txt_slwz1.setTextColor(cc.color(G.gc.COLOR.n15));
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.mrsl;
            var obj = {
                "jinbi": "ico_1",
                "exp": "ico_2",
                "hero": "ico_3"
            };
            for (var i in data) {
                if(data[i] > 0) {
                    G.setNewIcoImg(me.nodes[obj[i]], .85);
                    me.nodes[obj[i]].getChildByName("redPoint").setPosition(110, -15);
                }else {
                    G.removeNewIco(me.nodes[obj[i]]);
                }
            }
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("mrsl_open", [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();
            me.nodes.ico_1.triggerTouch(ccui.Widget.TOUCH_ENDED);

            me.ui.setTimeout(function(){
                G.guidevent.emit('meirishilianOpenOver');
            },200);
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getData("mrsl", 1);
        },
        setContents: function (bool) {
            var me = this;
            var curLevel;
            var conf = G.class.meirishilian.getConfByType(me.type);
            var keys = X.keysOfObject(conf);
            var btn = me.ui.finds("btn_slzd");

            if(!me.typeLevel[me.type]) {
                for (var i = 0; i < keys.length; i ++) {
                    var need = conf[keys[i]].openlv;
                    if(P.gud.lv >= need && ((!keys[i + 1] || P.gud.lv < conf[keys[i + 1]].openlv))) {
                        curLevel = me.typeLevel[me.type] = parseInt(keys[i]);
                        break;
                    }
                }
                if(!curLevel) {
                    curLevel = me.typeLevel[me.type] = 1;
                }
            }else {
                if(bool) {
                    curLevel = me.typeLevel[me.type] += 1;
                }else {
                    curLevel = me.typeLevel[me.type] -= 1;
                }
            }


            me.nodes.txt_xsjbq.setString(G.class.meirishilian.getCon().title[curLevel * 1 - 1]);

            if(curLevel == 1) me.nodes.btn_xsl1.hide();
            else me.nodes.btn_xsl1.show();

            if(curLevel == keys.length) me.nodes.btn_xsl2.hide();
            else me.nodes.btn_xsl2.show();

            X.alignCenter(me.nodes.panel_wp, conf[curLevel].prize, {
                touch: true
            });

            if(P.gud.lv < conf[curLevel].openlv) {
                btn.setTouchEnabled(false);
                btn.setBright(false);
                me.nodes.txt_slwz1.setString("lv" + conf[curLevel].openlv);
                me.nodes.img_slzd.hide();
                me.nodes.txt_slwz1.show();
                me.nodes.txt_slwz1.setTextColor(cc.color("#B0B0B0"));
            } else {
                btn.setTouchEnabled(true);
                btn.setBright(true);
                me.nodes.img_slzd.show();
                me.nodes.txt_slwz1.hide();
            }

            me.ui.finds("Text_1").setString(L("ZHANLI") + "：" + conf[curLevel].zhanli);

            var enemy = G.class.npc.getById(conf[curLevel].monster);
            if(enemy) {
                X.setHeroModel({
                    parent: me.nodes.slrw,
                    data: enemy[0]
                })
            }

        },
    });
    G.frame[ID] = new fun('xinshilian.json', ID);
})();