/**
 * Created by  on 2019/3/29.
 */
(function () {
    //风暴战场-要塞详情
    var ID = 'fbzc_ysxq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            if(me.DATA && me.DATA.headdata && me.DATA.headdata.uid == P.gud.uid) {
                me.nodes.zhuangtai1.hide();
                me.nodes.zhuangtai2.show();
            } else {
                me.nodes.zhuangtai1.show();
                me.nodes.zhuangtai2.hide();
                me.nodes.txt_sz3.setString(me.fightNeed);
                if(G.frame.fengbaozhanchang.DATA.num < me.fightNeed) {
                    me.nodes.txt_sz3.setTextColor(cc.color("#ff4e4e"));
                } else {
                    me.nodes.txt_sz3.setTextColor(cc.color("#1c9700"));
                }
            }

            me.nodes.txt_title.setString(L("YS_" + me.DATA.color));
            if(!me.DATA.headdata) {
                me.nodes.text_mz.setString(L("WBZL"));
                me.nodes.text_zdl1.setString(X.getNpcPower(me.conf.npc));
            } else {
                me.nodes.text_mz.setString(me.DATA.headdata.name);
                me.nodes.text_zdl1.setString(me.DATA.zhanli);
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_yc.click(function () {
                var time = (me.DATA.etime - me.DATA.stime) / 3600;
                if(time == 24) return G.tip_NB.show(L("YYCZZDSJ"));

                G.frame.fbzc_ycsj.data(time).show();
            });
            if (me.DATA && me.DATA.headdata && me.DATA.headdata.uid == P.gud.uid && G.time - me.DATA.stime < 4*3600) {
                me.nodes.text_ct.hide();
                me.nodes.panel_xh.show();
                var needConf = G.gc.fbzc.base["333need"][0];
                me.nodes.panel_zs.setBackGroundImage(G.class.getItemIco(needConf.t), 1);
                me.nodes.txt_xh.setString(needConf.n);
            }
            me.nodes.text_zl.setTextColor(cc.color(G.time - me.DATA.stime >= 4*3600 ? G.gc.COLOR.n14 : G.gc.COLOR.n15));
            me.nodes.btn_ct.click(function () {
                if(G.time - me.DATA.stime < 4*3600){
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.ajax("storm_333", [me.DATA.area, me.DATA.number], function (str, data) {
                                if(data.s == 1) {
                                    G.frame.fengbaozhanchang.getData(function () {
                                        G.frame.fengbaozhanchang.setMyFortress();
                                    });
                                    G.frame.fengbaozhanchang.getAreaData(function () {
                                        G.frame.fengbaozhanchang.setFortress();
                                    });
                                    if (data.d.prize) {
                                        G.frame.fbzc_js.data({
                                            log: [{color: me.DATA.color, area: me.DATA.area, time: G.time - me.DATA.stime}],
                                            prize: data.d.prize
                                        }).show();
                                    }
                                    G.frame.fengbaozhanchang.showAttr();
                                    me.remove();
                                }
                            });
                        },
                        richText: X.STR(L("SFXHCT"), G.gc.fbzc.base["333need"][0].n),
                    }).show();
                }else {
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.ajax("storm_333", [me.DATA.area, me.DATA.number], function (str, data) {
                                if(data.s == 1) {
                                    G.frame.fengbaozhanchang.getData(function () {
                                        G.frame.fengbaozhanchang.setMyFortress();
                                    });
                                    G.frame.fengbaozhanchang.getAreaData(function () {
                                        G.frame.fengbaozhanchang.setFortress();
                                    });
                                    G.frame.fbzc_js.data({
                                        log: [{color: me.DATA.color, area: me.DATA.area, time: G.time - me.DATA.stime}],
                                        prize: data.d.prize
                                    }).show();
                                    me.remove();
                                }
                            });
                        },
                        richText: L("SFCT"),
                    }).show();
                }
            });

            me.nodes.btn_zl.click(function () {
                if(G.frame.fengbaozhanchang.myFortress == G.frame.fengbaozhanchang.maxFortress) {
                    return G.tip_NB.show(L("ZLYSYDZDSL"));
                }
                if(G.frame.fengbaozhanchang.DATA.num < me.fightNeed) {
                    var from = G.frame.fengbaozhanchang;
                    G.frame.alert.data({
                        ok:{wz:L('GM')},
                        okCall: function(){
                            me.ajax('storm_shop', ['number'], function (str, data) {
                                if (data.s == 1){
                                    G.tip_NB.show(L("GMCG"));
                                    from.getData(function () {
                                        from.showVigor();
                                        G.frame.alert.data().richText = X.STR(L('BUY_FBZC'),
                                            20,
                                            from.DATA.maxbuynum - from.DATA.buynum);
                                        G.frame.alert.updateText();
                                        me.initUi();
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
                            from.DATA.maxbuynum - from.DATA.buynum)
                    }).show();
                    return;
                }

                var obj = {
                    pvType:'fbzc',
                    area: me.DATA.area,
                    number: me.DATA.number,
                    map: me.conf.map || "",
                    tower: me.DATA.color,
                    zhanli: me.nodes.text_zdl1.getString(),
                    uid: me.DATA.headdata ? me.DATA.headdata.uid : 'npc',
                    herolist: me.rList
                };
                G.frame.yingxiong_fight.data(obj).show();
                me.remove();
            });

            me.nodes.bx_0.click(function () {
                G.frame.jiangliyulan.data({
                    prize: me.timePrize[0].prize
                }).show();
            });
            me.nodes.bx_1.click(function () {
                G.frame.jiangliyulan.data({
                    prize: me.timePrize[1].prize
                }).show();
            });
            me.nodes.bx_2.click(function () {
                G.frame.jiangliyulan.data({
                    prize: me.timePrize[2].prize
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.fbzc.base.fortress[me.DATA.color];
            me.fightNeed = G.gc.fbzc.base.fightneed.energy;
            me.timePrize = G.gc.fbzc.base.timeprize[me.DATA.color];
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
            me.setTime();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var bossArr = [];
            me.rList = [];
            if(!me.DATA.headdata) {
                var enemyConf = G.class.npc.getById(me.conf.npc);
                me.rList = enemyConf;
                for(var i = 0; i < enemyConf.length; i ++){
                    var boss = G.class.shero(enemyConf[i]);
                    bossArr.push(boss);
                }
            } else {
                me.rList = me.DATA.team;
                for (var i = 0; i < me.DATA.team.length; i ++) {
                    if(me.DATA.team[i].sqid) continue;
                    if(me.DATA.team[i].pid) continue;
                    var boss = G.class.shero(me.DATA.team[i]);
                    bossArr.push(boss);
                }
            }
            X.center(bossArr, me.nodes.panel_ico1, {
                callback: function (node) {
                    node.setScale(.8);
                }
            });

            me.nodes.txt_sz.setString(me.conf.prize[0].n * me.conf.sec + "/" + L("XS"));
            if(me.DATA.headdata && me.DATA.headdata.uid == P.gud.uid) {

            } else {
                me.nodes.txt_sz2.setString(me.conf.prize[0].n * me.conf.sec * 12 + "(12" + L("XS") + ")");
            }
        },
        setTime: function () {
            var me = this;
            if(me.DATA.headdata) {
                me.DATA = G.frame.fengbaozhanchang.areaDATA.data[me.DATA.number];
                me.nodes.shijian_jindu.show();
                me.nodes.jindu_sz2.setString("/" + X.timeLeft(me.DATA.etime - me.DATA.stime));
                me.nodes.jindutiao_sz.setPercent((G.time - me.DATA.stime) / (me.DATA.etime - me.DATA.stime) * 100);

                var time = (me.DATA.etime - me.DATA.stime) / 3600;
                me.nodes.txt_sz2.setString(me.conf.prize[0].n * me.conf.sec * time + "(" + time + L("XS") + ")");

                var setText = function(){
                    var time = G.time;
                    if(time >= me.DATA.etime) {
                        time = me.DATA.etime;
                        G.frame.fengbaozhanchang.getData(function () {
                            G.frame.fengbaozhanchang.setMyFortress();
                        });
                        G.frame.fengbaozhanchang.getAreaData(function () {
                            G.frame.fengbaozhanchang.setFortress();
                        });
                        me.remove();
                        me.nodes.jindu_sz1.setString(X.timeLeft(time - me.DATA.stime));
                    } else {
                        me.nodes.jindu_sz1.setString(X.timeLeft(time - me.DATA.stime));
                    }
                };

                setText();

                if(me.gjTimer){
                    me.ui.clearInterval(me.gjTimer);
                    delete me.gjTimer;
                }
                me.gjTimer = me.ui.setInterval(function(){
                    setText();
                }, 1000);
            }
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang_yaosaixiangqing.json', ID);
})();