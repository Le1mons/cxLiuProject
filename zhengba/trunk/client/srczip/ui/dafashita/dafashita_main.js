/**
 * Created by LYF on 2018/6/8.
 */
(function () {
    //大法师塔
    var ID = 'dafashita';

    var fun = X.bUi.extend({
        extConf: {
            1: {
                scale: .15,
                pos: {x: 351, y: 789},
                tier: 1,
                isModel: true,
                isTouch: false,
                opacity: 100,
                txt: false,
                actionCall: function (node, time, callback) {
                    node.runActions([
                        cc.spawn(cc.moveTo(time, 172, 732), cc.scaleTo(time, .3, .3), cc.fadeTo(time, 175)),
                        cc.callFunc(function () {
                            callback && callback(node);
                        })
                    ])
                }
            },
            2: {
                scale: .3,
                pos: {x: 172, y: 732},
                tier: 3,
                isModel: true,
                isTouch: false,
                opacity: 175,
                txt: false,
                actionCall: function (node, time, callback) {
                    node.runActions([
                        cc.spawn(cc.moveTo(time, 464, 679), cc.scaleTo(time, .4, .4), cc.fadeTo(time, 230)),
                        cc.callFunc(function () {
                            callback && callback(node);
                        })
                    ])
                }
            },
            3: {
                scale: .4,
                pos: {x: 464, y: 679},
                isModel: true,
                tier: 5,
                isTouch: false,
                opacity: 230,
                txt: false,
                actionCall: function (node, time, callback) {
                    node.runActions([
                        cc.spawn(cc.moveTo(time, 242, 505), cc.scaleTo(time, .9, .9), cc.fadeTo(time, 255)),
                        cc.callFunc(function () {
                            if(node.hid) {
                                G.class.hero.getSoundByHid(node.hid);
                            }
                            callback && callback(node);
                        })
                    ])
                }
            },
            4: {
                scale: .9,
                pos: {x: 242, y: 505},
                isModel: true,
                tier: 7,
                isTouch: true,
                opacity:255,
                txt: true,
                actionCall: function (node, time) {
                    node.runActions([
                        cc.spawn(cc.moveBy(time, 400, -1000)),
                        cc.removeSelf()
                    ])
                }
            }
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
            me.preLoadRes=['fashita.png','fashita.plist'];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.ui.finds("btn_bx").setTouchEnabled(true);
            me.ui.finds("btn_bx").click(function (sender, type) {
                // var num = parseInt(me.DATA.layernum / 10);
                // if(G.class.dafashita.getPrize().passprize[num]) {
                //     G.frame.jiangliyulan.data({
                //         prize: G.class.dafashita.getPrize().passprize[num][1],
                //         layer: G.class.dafashita.getPrize().passprize[num][0]
                //     }).show();
                // } else {
                //     G.tip_NB.show(L("ZWJL"));
                // }
                me.getData(function () {
                    G.frame.dafashita_tgjl.show();
                });
            });
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS6")
                }).show();
            });
            me.nodes.btn_ph.click(function (sender, type) {
                G.frame.dafashita_phb.show();
            });
            me.nodes.btn_kstx.hide();
            me.nodes.btn_kstx.click(function () {
                G.frame.dafashita_tiaozhan.data({
                    conf: me.conf[me.DATA.layernum + 1]
                }).show();
            });
        },
        getPrize: function(callback) {
            var me = this;

            G.frame.jiangli.once("hide", function () {
                callback && callback();
            }).data({
                prize: G.class.dafashita.getPrize().passprize[me.DATA.layernum / 10 - 1][1]
            }).show();
            me.DATA.prizelist.push(me.DATA.layernum);
            me.setBoxText();
            // me.ajax("fashita_getprize", [me.DATA.layernum], function (str, data) {
            //     if(data.s == 1) {
            //
            //     }
            // })
        },
        setBoxText: function() {
            var me = this;
            var last;
            var idx;
            var conf = G.class.dafashita.getPrizeTargetArr();

            for (var i = 0; i < conf.length; i ++) {
                if(!X.inArray(me.DATA.prizelist, conf[i])) {
                    last = conf[i];
                    idx = i;
                    break;
                }
            }

            if(last) {
                me.nodes.text_bx.setString(me.DATA.layernum + "/" + last);
            } else {
                me.nodes.text_bx.setString(me.DATA.layernum + "/" + conf[conf.length - 1]);
            }

            var prize = G.class.dafashita.getPrize().passprize[idx][1];
            X.alignItems(me.nodes.panel_jlbx, prize, "left", {
                scale: .4,
                touch: true
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("fashita_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d.fashita;
                    me.DATA.passlist = [];
                    for(var i = 0; i < me.DATA.layernum; i ++) {
                        me.DATA.passlist.push(i);
                    }
                    me.DATA.prizelist.sort(function (a, b) {
                        return a < b ? -1 : 1;
                    });
                    callback && callback();
                }
            })
        },
        onOpen: function () {
            var me = this;
            me.conf = G.class.dafashita.get();
            me.com = G.class.dafashita.getPrize();
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            me.nodes.gw.hide();
            me.action.play("y", true);

            me.sui = [];
            me.listArr = [];
            me.setContents();
            me.setBoxText();

            me.ui.setTimeout(function(){
                G.guidevent.emit('dafashitaOpenOver');
                X.setLockLayer(me.ui, false);
            },300);
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getData("fashita", 1);
        },
        setContents: function () {
            var me = this;
            var arr = me.getLevelArr();
            var type = {
                0: 4,
                1: 3,
                2: 2,
                3: 1,
            };
            var info = [
                {scale: .25, opacity: 100, tier: 2, pos: {x: 289, y: 740}, time: 3},
                {scale: .4, opacity: 180, tier: 4, pos: {x: 345, y:674}, time: 2},
                {scale: .6, opacity: 255, tier: 6, pos: {x: 556, y:549}, time: 1}
            ];

            me.nodes.txt_mz.setString(X.STR(L("SDSW"), me.DATA.layernum + 1));

            for (var i = 0; i < arr.length; i ++) {
                var list =  me.nodes.list.clone();
                list.idx = type[i];
                list.type = arr[i];
                me.setTZ(list);
                list.setName(arr[i]);
                me.listArr.push(list);
            }

            for (var i = 0; i < 3; i ++) {
                (function (i) {
                    var sui = new ccui.ImageView("img/julongshendian/img_st2.png", 1);
                    sui.setPosition(info[i].pos);
                    sui.setScale(info[i].scale);
                    sui.conf = info[i];
                    sui.opacity = info[i].opacity;
                    sui.zIndex = info[i].tier;
                    var action = cc.repeatForever(cc.sequence(cc.moveBy(info[i].time, 0, 6 - i), cc.moveBy(info[i].time, 0, -6 + i)));
                    sui.action = action;
                    sui.runAction(action);
                    me.nodes.panel_bg.addChild(sui);
                    me.sui.push(sui);
                })(i);
            }
        },
        setSui: function(bool) {
            var me = this;

            if(bool) {
                me.sui[0].runAction(cc.fadeTo(0.5, me.sui[0].conf.opacity));
                me.sui[1].runAction(cc.fadeTo(0.5, me.sui[1].conf.opacity));
                me.sui[2].runAction(cc.fadeTo(0.5, me.sui[2].conf.opacity));
            } else {
                me.sui[0].runAction(cc.fadeOut(0.5));
                me.sui[1].runAction(cc.fadeOut(0.5));
                me.sui[2].runAction(cc.fadeOut(0.5));
            }
        },
        setTZ: function(list) {
            var me = this;
            var conf = me.extConf[list.idx];

            if(conf.isModel) {
                if(list.type == "box") {
                    list.children[1].removeAllChildren();
                    G.class.ani.show({
                        json: "ani_xinfashita_baoxiang",
                        addTo: list.children[1],
                        x: list.children[1].width / 2,
                        y: 40,
                        repeat: true,
                        autoRemove: false,
                    });
                    list.box = true;
                } else {
                    if(me.conf[list.type]) {
                        X.setModel({
                            parent: list.children[1],
                            data: {
                                hid: me.conf[list.type].model
                            },
                        });
                        list.hid = me.conf[list.type].model
                    } else {
                        if(X.keysOfObject(me.conf).length + 1 == list.type) {
                            list.children[1].setBackGroundImage("img/julongshendian/img_sttg.png", 1);
                            list.children[1].y = 242;
                        }
                    }
                }
            }
            list.taizi = true;
            list.setScale(conf.scale);
            list.setCascadeOpacityEnabled(true);
            list.children[0].setBackGroundImage("img/julongshendian/img_st.png", 1);
            list.children[1].setCascadeOpacityEnabled(true);
            list.opacity = conf.opacity;
            list.actionCall = conf.actionCall;

            if(conf.isTouch && me.conf[list.type]) {
                G.class.ani.show({
                    json: 'ani_gonghuiboss',
                    addTo: list.children[1],
                    x: list.children[1].width / 2,
                    y: 50,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.zIndex = 999
                    }
                });
            }

            if((me.conf[list.type] || list.type == "box") && conf.isTouch) {
                list.children[1].setTouchEnabled(true);
            } else {
                list.children[1].setTouchEnabled(false);
            }

            list.show();
            list.setPosition(conf.pos);
            list.zIndex = conf.tier;

            if(!cc.isNode(me.nodes.panel_bg.getChildByName(list.getName()))) {
                me.nodes.panel_bg.addChild(list);
            }

            X.enableOutline(list.children[2], "#000000", 2);
            if(conf.txt && me.conf[list.type]) {
                list.children[2].show();
                list.children[2].setString(X.STR(L("SDSW"), list.type));
            } else if(conf.txt && list.type == "box"){
                list.children[2].show();
                list.children[2].setString(L("BXJL"));
            } else {
                list.children[2].hide();
            }
            list.children[1].type = list.type;
            list.children[1].click(function (sender) {
                if(sender.type == "box") {
                    me.getPrize(function () {
                        me.playLevelAni();
                    });
                } else {
                    G.frame.dafashita_tiaozhan.data({
                        conf: me.conf[sender.type]
                    }).show();
                }
            });
        },
        playLevelAni: function() {
            var me = this;

            me.setSui(false);
            for (var i = 0; i < me.listArr.length; i ++) {
                var node = me.listArr[i];
                (function (node) {
                    node.actionCall(node, 0.5, function (node) {
                        node.idx ++;
                        me.setTZ(node);
                    });
                })(node);
            }
            me.ui.setTimeout(function () {
                me.listArr.splice(0, 1);
                var list = me.nodes.list.clone();
                var arr = me.getLevelArr();
                list.type = arr[arr.length - 1];
                list.idx = 1;
                list.setName(arr[arr.length - 1]);
                me.setTZ(list);
                me.listArr.push(list);
                me.nodes.txt_mz.setString(X.STR(L("SDSW"), me.DATA.layernum + 1));
                me.setBoxText();
                me.setSui(true);
            }, 700);
        },
        getLevelArr: function () {
            var me = this;
            var arr = [];
            var index = 1;
            var curNum = me.DATA.layernum;

            while (arr.length != 4) {
                if(curNum % 10 == 0 && curNum != 0 && !X.inArray(me.DATA.prizelist, curNum) && !X.inArray(arr, "box")) {
                    arr.push("box");
                } else if(arr[arr.length - 1] && arr[arr.length - 1] != 0 && arr[arr.length - 1] % 10 == 0 && !X.inArray(arr, "box")) {
                    arr.push("box");
                } else {
                    arr.push(curNum + index);
                    index ++;
                }
            }

            return arr;
        },
        fightCall: function () {
            var me = this;
            
            me.ajax("fashita_fight", [G.frame.dafashita.DATA.layernum + 1, X.cacheByUid('fight_fashita')], function (str, d) {
                if(d.s == 1) {
                    d.d.fightres['pvType'] = 'pvdafashita';
                    G.frame.fight.data({
                        prize:d.d.prize,
                        pvid:me.DATA.layernum + 1
                    }).demo(d.d.fightres);
                    if(d.d.fightres.winside == 0){
                        G.frame.dafashita.DATA.layernum ++;
                    }
                }
            });
        },
        refreshPanel:function () {
            var me = this;
            var chr = me.nodes.panel_bg.children;

            for (var i in chr) {
                if(chr[i].taizi) {
                    chr[i].removeFromParent(true);
                }
            }
            me.listArr = [];

            var arr = me.getLevelArr();
            var type = {
                0: 4,
                1: 3,
                2: 2,
                3: 1,
            };

            me.nodes.txt_mz.setString(X.STR(L("SDSW"), me.DATA.layernum + 1));

            for (var i = 0; i < arr.length; i ++) {
                var list =  me.nodes.list.clone();
                list.idx = type[i];
                list.type = arr[i];
                me.setTZ(list);
                list.setName(arr[i]);
                me.listArr.push(list);
            }
        }
    });
    G.frame[ID] = new fun('julongshendian.json', ID);
})();