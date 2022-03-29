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
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.listview.setItemsMargin(3);
            me.nodes.text_jbsl.setString(L("FENGSHOU") + L("JIANGE"));
            me.nodes.text_jysl.setString(L("JY") + L("JIANGE"));
            me.nodes.text_yxsl.setString(L("WUWEI") + L("JIANGE"));
            me.checkSdState();
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
                    sender.setBright(true);
                    sender.setTouchEnabled(false);
                    parent.children[3].setOpacity(255);
                    parent.children[1].show();
                },
                callback2: function (sender) {
                    var parent = sender.getParent();

                    sender.setBright(true);
                    sender.setTouchEnabled(true);
                    if(parent.ani) parent.ani.hide();
                    parent.children[3].setOpacity(255 * 0.6);
                    parent.children[1].hide();
                }
            });
            me.nodes.ico_1.triggerTouch(ccui.Widget.TOUCH_ENDED);


            me.ui.finds('img_di').setTouchEnabled(true);
            me.ui.finds('img_di').click(function () {
                if (!X.cacheByUid('swjg')) {
                    X.cacheByUid('swjg', 1);
                } else {
                    X.cacheByUid('swjg', 0);
                }
                me.checkSdState();
                me.changeType(me.intType);
            });
        },
        changeType: function(type) {
            var me = this;

            me.intType = type;
            me.type = me.extConf[type - 1];
            me.ui.finds("bg_sl").loadTexture("img/bg/bg_shilian" + type + ".jpg");
            me.ui.finds("wz1").loadTexture("img/meirishilian/wz_shilian" + type + ".png", 1);

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
            me.initUi();
            me.bindBtn();
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
                    me.nodes[obj[i]].getChildByName("redPoint").setPosition(100, -15);
                }else {
                    G.removeNewIco(me.nodes[obj[i]]);
                }
            }
        },
        checkSdState: function () {
            var me = this;

            me.ui.finds('ico_gou').setVisible(X.cacheByUid('swjg') == 1);
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            if (!me.isFirst) {
                me.isFirst = true;
                callback && callback();
            } else {
                me.ajax("mrsl_open", [me.type], function (str, data) {
                    if (data.s == 1) {
                        me.DATA = data.d;
                        me.DATA.sweeping[me.type] = me.DATA.sweeping[me.type] || [];
                        callback && callback();
                    }
                });
            }
        },
        show: function () {
            var me = this;
            var _super = this._super;
            
            connectApi("mrsl_open", ["jinbi"], function (data) {
                me.DATA = data;
                me.DATA.sweeping['jinbi'] = me.DATA.sweeping['jinbi'] || [];
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();
            me.ui.setTimeout(function(){
                G.guidevent.emit('meirishilianOpenOver');
            },200);
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getData("mrsl", 1);
            G.frame.julongshendian.checkRedPoint();
        },
        setContents: function () {
            var me = this;
            var conf = G.class.meirishilian.getConfByType(me.type);
            var keys = X.keysOfObject(conf);
            var sdIndex = G.class.meirishilian.getSdIndex(me.type);
            var arr = me.DATA.sweeping[me.type];

            me.nodes.listview.removeAllChildren();
            for(var i = 0; i < keys.length; i ++){
                me.setList(keys[i], conf[keys[i]], sdIndex, arr);
            }

            me.ui.setTimeout(function () {
                me.nodes.listview.jumpToIdx(me.jumpidx - 1, { type: 'vertical' });
                delete me.jumpidx;
            },200);

            X.setModel({
                parent: me.nodes.rw_dh,
                data: {hid: G.class.getConf("mrslcon").model[me.type].toString()},
                scale: 1.2
            });
        },
        setList: function (idx, conf, sdIndex, arr) {
            var me = this;
            var list = me.nodes.panel_list.clone();
            list.show();
            X.autoInitUI(list);

            list.nodes.btn_tz.hide();
            list.nodes.img_jb.loadTexture("img/meirishilian/img_sl_jb_" + idx + ".png", 1);
            list.nodes.img_ndwz.loadTexture("img/meirishilian/wz_sl_wz" + idx + ".png", 1);

            var rh = new X.bRichText({
                size:24,
                maxWidth:list.nodes.text_zdl.width,
                lineHeight:32,
                color:G.gc.COLOR.n4,
                family: G.defaultFNT
            });
            rh.text(L("ZHANLI") + ':' + conf.zhanli);
            rh.setAnchorPoint(0.5,0.5);
            rh.setPosition(list.nodes.text_zdl.width/2,list.nodes.text_zdl.height/2);
            list.nodes.text_zdl.removeAllChildren();
            list.nodes.text_zdl.addChild(rh);

            for(var i = 0; i < conf.prize.length; i ++){
                var prize = G.class.sitem(conf.prize[i]);
                prize.setPosition(list.nodes["panel_ico" + (i + 1)].width / 2, list.nodes["panel_ico" + (i + 1)].height / 2);
                list.nodes["panel_ico" + (i + 1)].addChild(prize);
                G.frame.iteminfo.showItemInfo(prize);
            }
            if(P.gud.lv < parseInt(conf.openlv)){
                list.nodes.btn_tz.setTouchEnabled(false);
                list.nodes.btn_tz.setBright(false);
                list.nodes.text_tz.setString("lv" + conf.openlv);
                list.nodes.text_tz.setTextColor(cc.color(G.gc.COLOR.n15));
            }else{
                me.jumpidx = parseInt(idx);
            }

            list.nodes.btn_sd.children[0].setTextColor(cc.color(G.gc.COLOR.n13));
            if (X.inArray(arr, idx) && X.cacheByUid('swjg')) {
                list.nodes.btn_sd.show();
                list.nodes.btn_tz.hide();
            } else {
                list.nodes.btn_tz.show();
                list.nodes.btn_sd.hide();
            }

            list.nodes.btn_tz.click(function (sender, type) {
                if(me.nodes.text_sycs.getString() < 1){
                    return G.tip_NB.show(L("TZCSBZ"));
                }
                G.frame.td_fightRead.data({
                    type: me.type,
                    idx: idx,
                    showJump: X.inArray(arr, idx)
                }).show();
            });
            list.nodes.btn_sd.click(function () {
                if(me.nodes.text_sycs.getString() < 1){
                    return G.tip_NB.show(L("TZCSBZ"));
                }
                me.ajax("mrsl_fight", [me.type, idx, true], function (str, data) {
                    if (data.s == 1) {
                        if (data.d.prize) {
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            G.frame.meirishilian.nodes.text_sycs.setString(data.d.lessnum);
                            G.hongdian.getData("mrsl", 1, function () {
                                G.frame.meirishilian.checkRedPoint();
                            });
                        }
                    }
                });
            }, 300);
            list.setName('list_' + idx);
            me.nodes.listview.pushBackCustomItem(list);
        }
    });
    G.frame[ID] = new fun('shilian.json', ID);
})();