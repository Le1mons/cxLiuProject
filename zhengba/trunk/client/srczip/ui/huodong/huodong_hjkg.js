/**
 * Created by LYF on 2019/9/20.
 */
(function () {
    //黄金矿工
    G.class.huodong_hjkg = X.bView.extend({
        animal: {
            1: {
                type: 1,
                speed: 4,
                ani: "ani_wakuang_lu"
            },
            2: {
                type: 2,
                speed: 5,
                ani: "ani_wakuang_yezhu"
            },
            3: {
                type: 3,
                speed: 6,
                ani: "ani_wakuang_yanshu"
            }
        },
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_hjkg.json");
        },
        initUi: function () {
            var me = this;

            me.nodes.img_gouzi.opacity = 0;
            G.class.ani.show({
                json: "ani_wakuang_jiazi",
                addTo: me.nodes.img_gouzi,
                autoRemove: false,
                y: 69,
                x: 47,
                onload: function (node, action) {
                    action.playWithCallback("in", false, function () {
                        me.nodeRunRotation(me.nodes.img_szwz);
                    });
                    node.ani = action;
                    me.gouAni = node;
                }
            });

            me.nodes.panel_wkj.removeBackGroundImage();
            G.class.ani.show({
                addTo: me.nodes.panel_wkj,
                json: "ani_wakuang_kuanggong",
                repeat: true,
                autoRemove: false,
                x: 88,
                y: 37,
                z: -10,
                onload: function (node, action) {
                    node.ani = action;
                    me.kg = node;
                    action.play("wait1", true);
                }
            });
        },
        ani: function (onAni, loop, lastAni) {
            var ani = this.gouAni;

            if (!lastAni) {
                ani.ani.play(onAni, loop || false);
            } else {
                ani.ani.playWithCallback(onAni, false, function () {
                    ani.ani.play(lastAni, true);
                });
            }

        },
        bindBtn: function () {
            var me = this;

            function z () {
                G.DATA.noClick = true;
                me.actionIn = false;
                me.nodes.img_szwz.stopAllActions();
                me.kg.ani.play("wait2", true);
                me.ani("wait", true);
            }

            me.nodes.panel_djqy.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
                if (G.class.getOwnNum('2054', 'item') < 1) {
                    if (G.gc.hjkg.lottery.cost.length - (me.DATA.myinfo.buynum || 0) <= 0) return G.tip_NB.show(L("JRCSYYW"));
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.ajax("huodong_use", [me._data.hdid, 2, 1], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: G.gc.hjkg.lottery.prize
                                    }).show();
                                    me.DATA.myinfo = data.d.myinfo;
                                    me.showNeed();
                                    if(G.frame.zhounianqing_main.isShow){
                                        G.hongdian.getData("qingdian", 1, function () {
                                            G.frame.zhounianqing_main.checkRedPoint();
                                        });
                                    }else {
                                        G.hongdian.getData("huodong", 1, function () {
                                            G.frame.huodong.checkRedPoint();
                                        });
                                    }
                                    // G.hongdian.getData("huodong", 1, function(){
                                    //     G.frame.huodong.checkRedPoint();
                                    // });
                                } else {
                                    G.frame.chongzhi.show();
                                }
                            });
                        },
                        richText: X.STR(L("SFGMNLJS"), G.gc.hjkg.lottery.cost[me.DATA.myinfo.buynum || 0][0].n),
                    }).show();
                } else {
                    z();
                }
            });

            me.nodes.btn_jia2.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
                if (G.gc.hjkg.lottery.cost.length - (me.DATA.myinfo.buynum || 0) <= 0) {
                    return G.tip_NB.show(L("JRGMCSBZ"));
                }
                G.frame.iteminfo_plgm.data({
                    add: true,
                    buy: G.gc.hjkg.lottery.prize[0],
                    num: 1,
                    buyneed: G.gc.hjkg.lottery.cost[me.DATA.myinfo.buynum || 0],
                    buyConf: G.gc.hjkg.lottery.cost,
                    buyIndex: me.DATA.myinfo.buynum || 0,
                    buyNum: G.gc.hjkg.lottery.cost.length - (me.DATA.myinfo.buynum || 0),
                    str: X.STR(L("JRHKGMXC"), G.gc.hjkg.lottery.cost.length - (me.DATA.myinfo.buynum || 0)),
                    callback: function (num) {
                        me.ajax("huodong_use", [me._data.hdid, 2, num], function (str, data) {
                            if (data.s == 1) {
                                G.event.emit("sdkevent", {
                                    event: "gold_miner",
                                    num: num
                                });
                                var p = JSON.parse(JSON.stringify(G.gc.hjkg.lottery.prize));
                                for (var i = 0; i < p.length; i ++) p[i].n *= num;
                                G.frame.jiangli.data({
                                    prize: p
                                }).show();
                                me.DATA.myinfo = data.d.myinfo;
                                me.showNeed();
                                if(G.frame.zhounianqing_main.isShow){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                                // G.hongdian.getData("huodong", 1, function(){
                                //     G.frame.huodong.checkRedPoint();
                                // });
                            }
                        });
                    }
                }).show();
            });

            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L("TS47")
                }).show();
            });

            me.nodes.btn_djsd.click(function () {
                G.frame.dijingshangdian.data(me).show();
            });
        },
        angling: function (index, num, callback) {
            var me = this;

            me.ajax("huodong_use", [me._data.hdid, 3, index, num], function (str, data) {
                if (data.s == 1) {
                    me.DATA.myinfo = data.d.myinfo;
                    G.frame.jiangli.data({
                        prize: data.d.prize
                    }).show();
                    if(G.frame.zhounianqing_main.isShow){
                        G.hongdian.getData("qingdian", 1, function () {
                            G.frame.zhounianqing_main.checkRedPoint();
                        });
                    }else {
                        G.hongdian.getData("huodong", 1, function () {
                            G.frame.huodong.checkRedPoint();
                        });
                    }
                    // G.hongdian.getData("huodong", 1, function(){
                    //     G.frame.huodong.checkRedPoint();
                    // });
                    callback && callback();
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.lay = {};
            me.prize = {};
            me.initUi();
            me.bindBtn();
            me.initAnimal();
        },
        onRemove: function () {
            var me = this;
        },
        showNeed: function () {
            var me = this;

            me.nodes.btn_jia2.setEnableState(G.gc.hjkg.lottery.cost.length - (me.DATA.myinfo.buynum || 0) > 0);
            cc.callLater(function () {
                me.nodes.txt_zs.setString(G.class.getOwnNum('2054', 'item'));
            });
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();

            if(me._data.rtime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_cs.setString(X.moment(me._data.rtime - G.time));
            }else {
                if (G.time > me._data.rtime) {
                    me.eventEnd = true;
                    me.ui.finds("Text_5").setString("兑换时间：");
                    X.timeout(me.nodes.txt_cs, me._data.etime, function () {

                    });
                } else {
                    X.timeout(me.nodes.txt_cs, me._data.rtime, function () {
                        me.ui.finds("Text_5").setString("兑换时间：");
                        me.eventEnd = true;
                        X.timeout(me.nodes.txt_cs, me._data.etime, function () {
                        });
                    });
                }
            }

            me.actionIn = true;
            me.extendSpeed = 0;
            me.shortenSpeed = 0;
            me.defaultHeight = me.nodes.img_szwz.height;
            me.initUpdate();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.showNeed();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        showPrize: function () {
            var me = this;

            me.kg.ani.play("wait1", true);
            me.ani("out");
            me.ajax("huodong_use", [me._data.hdid, 1, me.snatch], function (str, data) {
                if (data.s == 1) {
                    G.frame.jiangli.data({
                        prize: data.d.prize
                    }).once("show", function () {
                        G.DATA.noClick = false;
                    }).show();
                    me.showNeed();
                    me.prize[me.snatch] && me.initItem(me.snatch);
                    me.snatch = undefined;
                    me.nodeRunRotation(me.nodes.img_szwz);
                    if(G.frame.zhounianqing_main.isShow){
                        G.hongdian.getData("qingdian", 1, function () {
                            G.frame.zhounianqing_main.checkRedPoint();
                        });
                    }else {
                        G.hongdian.getData("huodong", 1, function () {
                            G.frame.huodong.checkRedPoint();
                        });
                    }
                    // G.hongdian.getData("huodong", 1, function(){
                    //     G.frame.huodong.checkRedPoint();
                    // });
                }
            });
        },
        nodeRunRotation: function (node) {
            var time, direction;
            if (node.rotation != 0) {
                var angle = Math.abs(node.rotation);
                time = (70 - angle) / 70 * 2;
                direction = node.rotation > 0 ? -1 : 1
            }

            var action_;
            var _action = cc.sequence(cc.rotateTo(2, 70), cc.rotateTo(2, -70)).repeatForever();
            if (time) {
                action_ = cc.sequence(cc.rotateTo(time, node.rotation > 0 ? 70 : -70), cc.callFunc(function () {
                    node.runAction(cc.sequence(cc.rotateTo(2, 70 * direction), cc.rotateTo(2, 70 * direction * -1)).repeatForever());
                }));
            } else action_ = _action;
            node.runAction(action_);
        },
        initUpdate: function () {
            var me = this;
            var rope = me.nodes.img_szwz;

            me.ui.update = function (dt) {
                if (!me.actionIn) {
                    me.extendSpeed += dt * 7;
                    rope.height += me.extendSpeed;
                } else {
                    me.extendSpeed = 0;
                }

                if (me.outOfRange() && !me.actionIn) {
                    me.actionIn = true;
                    me.amendHeight = true;
                    me.addPrize(me.snatch);
                }

                if (me.checkSnatch()) {
                    me.addPrize(me.snatch);
                    me.actionIn = true;
                    me.amendHeight = true;
                    me.prize[me.snatch].stopAllActions();
                    me.prize[me.snatch].hide();
                }

                if (me.amendHeight) {
                    me.shortenSpeed += dt * 4;
                    if (rope.height <= me.defaultHeight) {
                        me.amendHeight = false;
                        rope.height = me.defaultHeight;
                        me.addPrize();
                        me.showPrize();
                    } else {
                        rope.height -= me.shortenSpeed;
                    }
                } else {
                    me.shortenSpeed = 0;
                }
            };
            me.ui.scheduleUpdate();
        },
        checkSnatch: function () {
            var me = this;
            if (me.snatch) return false;

            for (var i in me.prize) {
                if (me.prize[i] && me.isSnatch(me.nodes.panel_gzwp, me.prize[i])) return true;
            }
        },
        isSnatch: function (grapnel, animal) {
            var pos = this.amendPosition(grapnel, 0);
            var rect = cc.getRect(animal);
            var atpos = cc.p(rect.x, rect.y);

            this.lay[animal.type] && this.lay[animal.type].setPosition(atpos);

            if (this.checkRectangleCrash(pos, atpos, animal.getSize())) return this.snatch = animal.type;
            else return false;
        },
        checkRectangleCrash: function (pos, curPos, size) {

            if (curPos.x >= pos.x - size.width / 2
                && curPos.x <= pos.x + size.width / 2
                && curPos.y >= pos.y - size.height / 2
                && curPos.y <= pos.y + size.height / 2) return true;
            else return false;
        },
        outOfRange: function () {
            var me = this;
            var pos = me.amendPosition(me.nodes.panel_gzwp, 0);

            if (pos.x <= -100 || pos.x >= C.WS.width + 100 || pos.y <= 0) return me.snatch = 4;
            else return false;
        },
        amendPosition: function (node, id) {
            var pos = node.convertToWorldSpace();
            var atPos = cc.p(pos.x, pos.y);


            return pos;
        },
        initAnimal: function () {
            var me = this;

            for (var i in me.animal) {
                me.initItem(i);
            }
        },
        initItem: function (id) {
            var me = this;

            if (!me.nodes['panel_dh' + id]) return;
            var conf = me.animal[id];
            var direction = X.arrayRand([1, -1]);
            if (!me.prize[id]) {
                var layout = new ccui.Layout();
                layout.id = id;
                layout.setContentSize(150, 80);
                layout.setAnchorPoint(0.5, 0.5);
                layout.y = 40;
                layout.type = conf.type;
                me.nodes['panel_dh' + id].addChild(layout);
                me.prize[id] = layout;

                G.class.ani.show({
                    json: conf.ani,
                    addTo: layout,
                    y: 0,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.scaleX = direction;
                        layout.ani = node;
                    }
                });
            }
            var item = me.prize[id];
            if (item.ani) {
                item.ani.scaleX = direction;
            }
            item.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        item.show();
                        item.x = direction == 1 ? -80 : C.WS.width + 80;
                    }),
                    cc.moveTo(conf.speed, direction == 1 ? C.WS.width + 80 : -80, 40),
                    cc.callFunc(function () {
                        me.initItem(item.id);
                    }))
            );
        },
        addPrize: function (type) {
            if (type) {
                this.ani("in2", false, "wait2");
                this.nodes.panel_gzwp.setBackGroundImage("img/huangjinkuanggong/img_ks" + type + ".png", 1);
            } else {
                this.nodes.panel_gzwp.removeBackGroundImage();
            }
        }
    });
})();