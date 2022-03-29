/**
 * Created by  on 2019/3/29.
 */
(function () {
    //风暴战场
    G.event.on("storm_update", function () {
        if(!G.frame.fengbaozhanchang.isShow) return;
        if(G.frame.fbzc_ysxq.isShow) G.frame.fbzc_ysxq.remove();
        G.frame.fengbaozhanchang.getData(function () {
            G.frame.fengbaozhanchang.setMyFortress();
            G.frame.fengbaozhanchang.showVigor();
            G.frame.fengbaozhanchang.getAreaData(function () {
                G.frame.fengbaozhanchang.setFortress();
                G.frame.fengbaozhanchang.updateBox();
            });
        });
    });

    var ID = 'fengbaozhanchang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        showAttr: function() {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.rmbmoney));
        },
        showVigor: function() {
            var me = this;

            me.nodes.txt_zs.setString(me.DATA.num + "/" + 25);
        },
        initUi: function () {
            var me = this;

            X.setRichText({
                str: "<font color=#fff71d>" + P.gud.name + "</font>",
                parent: me.nodes.wanjiamingzi,
                anchor: {x: 0, y: .5},
                pos: {x: 0, y: me.nodes.wanjiamingzi.height / 2},
                outline: "#000000"
            });
            
            me.showAttr();
            me.nodes.bg_2.setTouchEnabled(false);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_jia1.click(function () {

                G.frame.chongzhi.once("hide", function () {
                    me.showAttr();
                }).show();
            });

            me.nodes.btn_zs1.click(function () {
                G.frame.alert.data({
                    ok:{wz:L('GM')},
                    okCall: function(){
                        me.ajax('storm_shop', ['number'], function (str, data) {
                            if (data.s == 1){
                                G.tip_NB.show(L("GMCG"));
                                me.getData(function () {
                                    me.showVigor();
                                    G.frame.alert.data().richText = X.STR(L('BUY_FBZC'),
                                        20,
                                        me.DATA.maxbuynum - me.DATA.buynum);
                                    G.frame.alert.updateText();
                                });
                            }
                        },true);
                    },
                    autoClose: false,
                    richNodes:[
                        new cc.Sprite('#'+G.class.getItemIco('rmbmoney'))
                    ],
                    richText: X.STR(L('BUY_FBZC'),
                        20,
                        me.DATA.maxbuynum - me.DATA.buynum)
                }).show();
            });

            me.nodes.btn_zuo1.click(function () {
                me.changeArea(-1);
            }, 400);

            me.nodes.btn_you1.click(function () {
                me.changeArea(1);
            }, 400);

            me.nodes.btn_zdrz.click(function () {
                G.frame.fbzc_zdrz.show();
            });

            me.nodes.btn_fbsd.click(function () {
                G.frame.shopmain.once("hide", function () {
                    me.showAttr();
                }).data('9').show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.fbzc_bz.show();
            });

            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L('TS34')
                }).show();
            });

            me.ui.finds("btn_baoxiangjishi").click(function () {
                G.frame.fbzc_tjbx.show();
            });

            var sPos;
            me.nodes.img_bg.show();
            me.nodes.img_bg.setTouchEnabled(true);
            me.nodes.img_bg.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    sPos = sender.getTouchBeganPosition();
                } else if (type == ccui.Widget.TOUCH_MOVED) {

                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    var ePos = sender.getTouchEndPosition();
                    if (ePos.x - sPos.x < -10) {
                        if(me.area == 22) {
                            return;
                        }
                        me.changeArea(1);
                    } else if (ePos.x - sPos.x > 10) {
                        if(me.area == 1) {
                            return;
                        }
                        me.changeArea(-1);
                    }
                }
            });

            me.nodes.btn_zuo2.click(function () {
                me.changeArea(-5);
            }, 400);

            me.nodes.btn_you2.click(function () {
                me.changeArea(5);
            }, 400);
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
             G.class.ani.show({
                json: "ani_yaosai_fengwei",
                addTo: me.nodes.panel_bgdh,
                repeat: true,
                autoRemove: false,
            });
            me.getData(function () {
                me.showVigor();
                me.setMyFortress();
                me.setBox();
                me.updateBox();
            });
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("storm", 1, function () {
                G.frame.jingjichang.checkRedPoint();
            });
        },
        checkRedPoint: function() {
            var me = this;
            if(G.DATA.hongdian.storm == 2) {
                G.setNewIcoImg(me.nodes.btn_bz);
            } else {
                G.removeNewIco(me.nodes.btn_bz);
            }
        },
        onShow: function () {
            var me = this;
            me.setFortress();
            me.setBtnState();
            me.checkRedPoint();
        },
        show : function(){
            var me = this;
            var _super = this._super;
            me.area = 1;
            this.getAreaData(function () {
                _super.apply(me,arguments);
            });
        },
        getAreaData: function(callback){
            var me = this;

            G.ajax.send("storm_open", [me.area], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.areaDATA = d.d;
                    callback && callback();
                }
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax("storm_data", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    if(me.DATA.boxprize && me.DATA.gjprize) {
                        var prizeArr = [].concat(me.DATA.boxprize, me.DATA.gjprize);
                        var obj = {};
                        var arr = [];
                        for (var i in prizeArr) {
                            if(!obj[prizeArr[i].t]) {
                                obj[prizeArr[i].t] = {};
                                obj[prizeArr[i].t].a = prizeArr[i].a;
                                obj[prizeArr[i].t].t = prizeArr[i].t;
                                obj[prizeArr[i].t].n = prizeArr[i].n;
                            } else {
                                obj[prizeArr[i].t].n += prizeArr[i].n;
                            }
                        }
                        for (var i in obj) {
                            arr.push(obj[i]);
                        }

                        G.frame.fbzc_js.data({
                            log: me.DATA.show,
                            prize: arr,
                            hideButton: true
                        }).show();
                    } else if(me.DATA.gjprize && me.DATA.show) {
                        G.frame.fbzc_js.data({
                            log: me.DATA.show,
                            prize: me.DATA.gjprize,
                            hideButton: true
                        }).show();
                    } else if(me.DATA.boxprize) {
                        G.frame.jiangli.data({
                            prize: me.DATA.boxprize
                        }).show();
                    } else if(me.DATA.gjprize) {
                        G.frame.jiangli.data({
                            prize: me.DATA.gjprize
                        }).show();
                    }
                    callback && callback();
                }
            });
        },
        changeArea: function (number) {
            var me = this;
            var area = G.gc.fbzc.base.region;
            var keys = X.keysOfObject(area);

            if(number > 0) {
                if(me.area + number <= keys.length) {
                    me.area += number
                } else {
                    me.area += (keys.length - me.area);
                }
            } else {
                if(me.area + number >= 1) {
                    me.area += number;
                } else {
                    me.area += (1 - me.area);
                }
            }

            me.setBtnState();
            me.getAreaData(function () {
                me.setFortress();
                me.updateBox();
            });
        },
        setBtnState: function () {
            var me = this;
            var area = G.gc.fbzc.base.region;
            var keys = X.keysOfObject(area);

            me.nodes.btn_zuo1.setEnableState(true);
            me.nodes.btn_you1.setEnableState(true);
            me.nodes.btn_zuo2.setEnableState(true);
            me.nodes.btn_you2.setEnableState(true);

            if(me.area == 1) {
                me.nodes.btn_zuo1.setEnableState(false);
                me.nodes.btn_zuo2.setEnableState(false);
            }
            if(me.area == keys.length) {
                me.nodes.btn_you1.setEnableState(false);
                me.nodes.btn_you2.setEnableState(false);
            }
        },
        setFortress: function () {
            var me = this;
            var fortressConf = G.gc.fbzc.base.region[me.area];

            me.fortress = [];
            me.nodes.text_ys.setString(X.STR(L("DJQ"), me.area));
            
            for (var i = 0; i < 6; i ++) {
                me.initFortress(fortressConf[i], i);
            }
        },
        initFortress: function (id, idx) {
            var me = this;
            var index = idx + 1;
            var lay = me.nodes["p" + index];
            lay.setTouchEnabled(false);
            if(!id) return lay.removeAllChildren();

            var data = me.areaDATA.data[idx];
            var fortress = me.nodes.list.clone();
            X.autoInitUI(fortress);
            fortress.setTouchEnabled(false);
            fortress.type = id;
            fortress.data = data;
            var tower = fortress.nodes.tower = new ccui.ImageView("img/fengbao/fangzi_" + id + ".png");
            tower.setAnchorPoint(0, 0.5);
            tower.setTouchEnabled(true);
            tower.setPosition(0, fortress.nodes.ta.height / 2);
            tower.opacity = 0;
            fortress.nodes.wz_tadengji.hide();

            tower.runActions([
                cc.fadeTo(0.05 * index, 0),
                cc.callFunc(function () {
                    tower.opacity = 255;
                    fortress.nodes.wz_tadengji.show();
                    if(me.area == 22 && idx != 0) {
                        fortress.nodes.wz_tadengji.hide();
                    }
                    if(id == 1) {
                        //增加最高级塔的动效
                        //底部圆圈特效
                        G.class.ani.show({
                            json: "ani_yaosai_shanguang",
                            addTo: fortress.nodes.panel_tadidh,
                            x: 40,
                            y: 120,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                node.opacity = 0;
                                node.runAction(cc.fadeIn(1));
                            }
                        });

                        //增加上升动效
                        G.class.ani.show({
                            json: "ani_yaosai_zuigaoji",
                            addTo: fortress.nodes.tower,
                            x: 90,
                            y: 141,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                node.opacity = 0;
                                node.runAction(cc.fadeIn(1));
                            }
                        });
                    }
                })
            ]);
            fortress.nodes.ta.removeBackGroundImage();
            fortress.nodes.ta.addChild(tower);
            fortress.nodes.wz_tadengji.setBackGroundImage("img/fengbaozhanchang/img_yaosai" + id + ".png", 1);

            fortress.aaa = L("YS_" + id);
            if(!fortress.data) {
                fortress.nodes.wjnr.hide();
            } else {
                fortress.nodes.wjnr.show();
                fortress.nodes.text_zdl1.setString(data.zhanli);
                fortress.nodes.wanjiaming.setString(data.headdata.name);
                fortress.nodes.gonghuim.setString(L("gonghui") + (data.headdata.guildname ? data.headdata.guildname : L("ZW")));
                X.enableOutline(fortress.nodes.wanjiaming, "#000000", 2);
                X.enableOutline(fortress.nodes.gonghuim, "#000000", 2);
                if(data.headdata.head) {
                    var head = G.class.shead(data.headdata);
                    head.setAnchorPoint(0.5, 0.5);
                    head.setPosition(fortress.nodes.panel_tx.width / 2, fortress.nodes.panel_tx.height / 2);
                    head.setScale(.7);
                    fortress.nodes.panel_tx.addChild(head);
                }
                if (data.headdata.chenghao) {
                    fortress.nodes.panel_ch.setBackGroundImage("img/public/chenghao_" + data.headdata.chenghao + ".png", 1);
                }
            }

            //为自己的要塞加动效
            if (data){
                if (data.headdata.uid == P.gud.uid){
                    G.class.ani.show({
                        json: "ani_yaosai_xuanzhong",
                        addTo: fortress.nodes.tower,
                        repeat: true,
                        autoRemove: false,
                        onload: function(node, action){
                            action.play("0" + id, true);
                        }
                    });    
                    
                    G.class.ani.show({
                        json: "ani_yaosai_jiqi",
                        addTo: fortress.nodes.tower,
                        repeat: true,
                        autoRemove: false,
                        onload: function(node, action){
                            action.play("0" + id, true);
                        }
                    });   
                }
            }
            
            fortress.nodes.ta.setTouchEnabled(false);
            fortress.nodes.tower.click(function () {
                if(me.area == 22 && idx != 0) {
                    return G.tip_NB.show(L("BKGDQTWJYS"));
                }
                var obj = {};
                if(!data) {
                    obj.color = id;
                }
                G.frame.fbzc_ysxq.data(data ? data : {color: id, number: idx, area: me.area}).show();
                me.towerNumber = idx;
            });

            fortress.show();
            fortress.setPosition(0, 0);
            lay.removeAllChildren();
            lay.addChild(fortress);
            me.fortress.push(fortress);
        },
        setMyFortress: function () {
            var me = this;
            var openNum = G.gc.fbzc.base.opennum;  //自己占领数
            me.myFortress = 0;
            me.maxFortress = 3;

            for (var i = 0; i < openNum; i ++) {
                (function (index) {
                    var list = me.nodes.list_tubiao.clone();
                    var lay = me.nodes["quan" + (index + 1)];
                    var data = me.DATA.data[index];
                    var isOpen = me.getIsOpen(G.class.opencond.getConditionById("storm_" + (index + 1)));
                    X.autoInitUI(list);
                    list.nodes.ico_tian.show();
                    list.nodes.ico_tian.setTouchEnabled(true);
                    if(isOpen) {
                        if(data) {
                            me.myFortress ++;
                            list.nodes.ico_tian.loadTexture("img/fengbao/xiaofangzi_" + data.color + ".png");
                            
                            list.nodes.wz_jishi.setTextColor(cc.color(G.gc.COLOR.n34));
                            X.enableOutline(list.nodes.wz_jishi, "#000000", 1);

                            var setText = function(){
                                var time = G.time;
                                if(time >= data.etime) {
                                    time = data.stime;
                                    if(!G.frame.fbzc_ysxq.isShow) {
                                        me.getData(function () {
                                            me.setMyFortress();
                                        });
                                        if(data.area == me.area) {
                                            me.getAreaData(function () {
                                                me.setFortress();
                                            });
                                        }
                                    }
                                }
                                list.nodes.wz_jishi.setString(X.timeLeft(time - data.stime));
                            };
                            setText();
                            list.gjTimer = list.setInterval(function(){
                                setText();
                            }, 1000);
                        } else {
                            list.nodes.ico_tian.runAction(cc.sequence(cc.fadeOut(1.2), cc.fadeIn(1.2)).repeatForever());
                        }
                    } else {
                        list.nodes.ico_tian.loadTexture("img/fengbaozhanchang/img_ketianjia_hui.png", 1);
                        me.maxFortress --;
                    }
                    list.nodes.ico_tian.click(function () {
                        if(!isOpen) return G.tip_NB.show(X.STR(L("XYJS"), X.getNeedToStr(G.class.opencond.getConditionById("storm_" + (index + 1)))));
                        if(!data) return G.frame.fbzc_ksss.show();
                        if(me.area == data.area) {
                            return me.fortress[data.number].nodes.tower.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        }
                        me.area = parseInt(data.area);
                        me.setBtnState();
                        me.getAreaData(function () {
                            me.setFortress();
                            me.fortress[data.number].nodes.tower.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        });
                    });
                    list.show();
                    list.setPosition(lay.width / 2, lay.height / 2);
                    lay.removeAllChildren();
                    lay.addChild(list);
                })(i);
            }
        },
        getIsOpen: function (conf) {
            var isOpen = false;

            for (var i in conf) {
                if(P.gud[i] >= conf[i]) {
                    isOpen = true;
                    break;
                }
            }

            return isOpen;
        },
        setBox: function () {
            var me = this;
            var txt = me.ui.finds("wz_baoxiang");
            var djs = me.ui.finds("wz_shijian");
            var zeroTime = X.getTodayZeroTime();
            var time = G.gc.fbzc.base.act_time;

            function f(str, time) {
                txt.setString(str);
                X.timeout(djs, time, function () {
                    me.getData(function () {
                        me.setBox();
                        me.updateBox();
                    });
                });
            }

            if(G.time < zeroTime + 12 * 3600) {
                f(L("TJBXKS"), zeroTime + 12 * 3600);
            } else if(G.time >= zeroTime + 12 * 3600 && G.time < zeroTime + 12 * 3600 + time) {
                f(L("TJBXJS"), zeroTime + 12 * 3600 + time);
            } else if(G.time < zeroTime + 21 * 3600){
                f(L("TJBXKS"), zeroTime + 21 * 3600);
            } else if(G.time >= zeroTime + 21 * 3600 && G.time < zeroTime + 21 * 3600 + time) {
                f(L("TJBXJS"), zeroTime + 21 * 3600 + time);
            } else {
                f(L("TJBXKS"), zeroTime + 36 * 3600);
            }
        },
        updateBox: function () {
            var me = this;
            if(me.fortress.length == 0) return;
            var boxArr = me.getBoxArr();

            for (var i in me.fortress) {
                me.fortress[i].nodes.tianjiangbaoxiang.removeAllChildren();
                me.fortress[i].nodes.tianjiangbaoxiang.setTouchEnabled(false);
            }

            for (var i in boxArr) {
                (function (idx) {
                    var con = boxArr[idx];
                    X.addBoxAni({
                        parent: me.fortress[con.number].nodes.tianjiangbaoxiang,
                        boximg: "img/fengbaozhanchang/fengbao_box" + con.boxType + ".png"
                    });
                    me.fortress[con.number].nodes.tianjiangbaoxiang.setTouchEnabled(true);
                    me.fortress[con.number].nodes.tianjiangbaoxiang.click(function () {
                        return me.ui.finds("btn_baoxiangjishi").triggerTouch(ccui.Widget.TOUCH_ENDED);
                    });
                })(i);
            }
        },
        getBoxArr: function () {
            var me = this;
            var arr = [];
            var data = [];
            var boxData = me.DATA.box.v;

            for (var i in boxData) {
                for (var j in boxData[i]) {
                    if(me.area == j) {
                        var obj = {};
                        obj.boxType = i;
                        obj.areaArr = boxData[i][j];
                        arr.push(obj);
                    }
                }
            }

            for (var i in arr) {
                for (var j in arr[i].areaArr) {
                    var obj = {};
                    obj.boxType = arr[i].boxType;
                    obj.number = arr[i].areaArr[j];
                    data.push(obj);
                }
            }

            return data;
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang.json', ID);
})();