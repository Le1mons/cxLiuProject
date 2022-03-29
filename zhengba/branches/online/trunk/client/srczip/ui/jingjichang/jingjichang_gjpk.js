/**
 * Created by lsm on 2018/6/23
 */
(function() {
    //冠军的试炼
    G.class.jingjichang_gjpk = X.bView.extend({
        extConf: {
            box: {
                idx: [1, 1, 2, 2, 3, 3, 3]
            }
        },
        ctor: function(type) {
            var me = this;
            me._type = type;
            me.fullScreen = true;
            me._super('jingjichang_zyjj.json');
        },
        refreshPanel: function() {
            var me = this;

            me.setContents();
        },
        bindBTN: function() {
            var me = this;

            //刷新
            me.nodes.btn_sx.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (!me.isFighting) {
                        G.tip_NB.show(L('JJC_FIGHT_OVER'));
                        return;
                    }

                    if (!me.isRefreshEnemy) {
                        me.isRefreshEnemy = true;
                        me.refreshEnemys();

                        if (me.refTimer) {
                            clearInterval(me.refTimer);
                            delete me.refTimer;
                        }
                        var time = 3;
                        refTimer(sender,time);
                    }
                }
            });
            function refTimer(sender,time) {
                sender.setEnableState(false);
                sender.setTitleText(time + 's');
                sender.setTitleColor(cc.color(G.gc.COLOR.n15));
                me.ui.setTimeout(function() {
                    time--;
                    cc.isNode(sender) && sender.setTitleText(L('BTN_SX'));
                    sender.setEnableState(true);
                    if (time <= 0) {
                        me.ui.setTimeout(function() {
                            delete me.isRefreshEnemy;
                        }, 200);
                        sender.setTitleColor(cc.color(G.gc.COLOR.n13));
                        return;
                    } else {
                        refTimer(sender,time);
                    }
                }, 1000)
            }
            //增加次数
            me.nodes.btn_jia.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    function callback(num) {
                        G.ajax.send('zypkjjc_buypknum', [num], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                // G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));
                                if (d.d.prize) {
                                    G.frame.jiangli.data({
                                        prize: [].concat(d.d.prize)
                                    }).once('show', function () {
                                        G.frame.iteminfo_plgm.remove();
                                        me.setTzNum();
                                        me.refreshEnemys();
                                    }).show();
                                }
                            }
                        }, true);
                    }

                    G.frame.iteminfo_plgm.data({
                        buy: G.class.jingjichang.get().base.pkneed[0],
                        num: 0,
                        buyneed: G.class.jingjichang.get().base.buyneed,
                        callback: callback
                    }).show();
                }
            });

            //隐藏宝箱
            me.nodes.panel_bxjl.hide();
        },
        onOpen: function() {
            var me = this;

            me.bindBTN();
        },
        onShow: function() {
            var me = this;

            me.refreshPanel();

            G.frame.jingjichang_guanjunshilian.onnp('updateInfo', function(d) {
                if (G.frame.jingjichang_guanjunshilian.curType == me._type) {
                    me.refreshPanel();
                } else {
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onRemove: function() {
            var me = this;
            me.event.emit('hide');
            if (me.refTimer) {
                clearInterval(me.refTimer);
                delete me.refTimer;
            }
        },
        setContents: function() {
            var me = this;

            me.setDjs();
            me.setBaseInfo();
            me.setMyRank();
            me.setTzNum();
            // me.setBoxPrize();
            G.frame.jingjichang_guanjunshilian.getEnemyData(1, function() {
                me.setEnemy();
            });
        },
        onNodeShow: function() {
            var me = this;

            if (me._needRefresh) {
                delete me._needRefresh;
                me.refreshPanel();
            }
        },
        setBaseInfo: function() {
            var me = this;

            var btnSx = me.nodes.btn_sx;
            btnSx.setBright(true);
            if (!me.isFighting) {
                btnSx.setBright(false);
            }
        },
        // 刷新敌人信息
        refreshEnemys: function() {
            var me = this;

            G.frame.jingjichang_guanjunshilian.getEnemyData(1, function() {
                // G.tip_NB.show(L('SHUAXIN') + L('SUCCESS'));
                me.setEnemy();
            });
        },
        //活动倒计时
        setDjs: function() {
            var me = this;

            var txtTimeStr1 = me.ui.finds('text_susj');
            var txtTime1 = me.nodes.text_sj;

            var zeroTime = X.getLastMondayZeroTime();
            var openDuration = G.class.jingjichang.get().base.closetime;

            if (me.timer1) {
                txtTime1.clearTimeout(me.timer1);
                delete me.timer1;
            }
            if (me.isFighting) delete me.isFighting;

            if (G.time > zeroTime + openDuration) {
                //休息时间
                G.frame.jingjichang.isFight = false;
                txtTimeStr1.setString(L('OPEN_TO_STAR') + '：');
                me.timer1 = X.timeout(txtTime1, zeroTime + 7 * 24 * 60 * 60, function() {
                    me.refreshPanel();
                }, null, null);
            } else {
                me.isFighting = true;
                //活动时间
                G.frame.jingjichang.isFight = true;
                txtTimeStr1.setString(L('OPEN_TO_END') + '：');
                me.timer1 = X.timeout(txtTime1, zeroTime + openDuration, function() {
                    if(G.frame.fight.isShow){
                        G.frame.fight.once("hide", function () {
                            X.uiMana.closeAllFrame();
                        });
                    }else {
                        X.uiMana.closeAllFrame();
                    }
                }, null, null);
            }
        },
        setMyRank: function() {
            var me = this;

            var panel = me.ui.finds('panel_wdxx');
            X.autoInitUI(panel);

            var layIco = panel.nodes.panel_wdtx;
            var txtRank = panel.nodes.text_pm;
            var txtScore = panel.nodes.text_jf;
            var txtZdl = panel.nodes.text_zdl1;

            layIco.removeAllChildren();

            var data = G.frame.jingjichang_guanjunshilian.DATA;

            var wid = G.class.shead(P.gud);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);
            txtRank.setString(data.myrank || 0);
            txtScore.setString(data.jifen);
            txtZdl.setString(data.zhanli || 0);
        },
        setTzNum: function() {
            var me = this;

            var txtTzNum = me.ui.finds('panel_wdxx').finds('text_tzjsl$');

            var need = G.class.jingjichang.get().base.pkneed;

            var ownNum = me.ownNum = G.class.getOwnNum(need[0].t, need[0].a);
            txtTzNum.setString(ownNum);
            // setTextWithColor(txtTzNum,ownNum,G.gc.COLOR[ownNum >= need[0].n ? 'n1' : 5]);
        },
        setEnemy: function() {
            var me = this;

            var lay;
            var layArr = [me.nodes.panel_lb1, me.nodes.panel_lb2, me.nodes.panel_lb3];
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }

            var item = me.nodes.list_lb;
            item.hide();

            var enemyData = G.frame.jingjichang_guanjunshilian.enemyData || [];

            if (enemyData.length < 1) {
                cc.sys.isObjectValid(me.ui.finds('img_zwnr')) && me.ui.finds('img_zwnr').show();
                return;
            } else {
                cc.sys.isObjectValid(me.ui.finds('img_zwnr')) && me.ui.finds('img_zwnr').hide();
            }

            for (var i = 0; i < enemyData.length; i++) {
                lay = layArr[i];
                var data = enemyData[i];
                var wid = item.clone();
                wid.setPosition(cc.p(0, 0));
                lay.addChild(wid);
                wid.show();
                me.setItem(wid, data);
            }
        },
        setItem: function(ui, data) {
            var me = this;

            X.autoInitUI(ui);
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.text_mz;
            var txtZdl = ui.nodes.text_zdl2;
            var txtScore = ui.nodes.text_jf;
            var btnFight = ui.nodes.btn_zd;
            var txtNeed = ui.nodes.text_tzjsl;
            ui.finds('img_dk').setColor(cc.color('#EDE4D0'));
            txtNeed.setTextColor(cc.color(G.gc.COLOR.n5));
            X.enableOutline(txtNeed,'#4A1D09',2);

            layIco.removeAllChildren();

            var wid = G.class.shead(data.headdata);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);
            txtName.setString(data.headdata.name);
            // txtZdl.setString(data.headdata.zhanli || 0);
            txtZdl.setString(data.zhanli || 0);
            txtScore.setString(data.jifen);

            var pkNeedNum = G.frame.jingjichang_guanjunshilian.DATA.freenum > 0 ? 0 : G.class.championtrial.get().base.pkneed[0].n;
            var ownNum = me.ownNum;
            setTextWithColor(txtNeed, pkNeedNum, G.gc.COLOR[ownNum >= pkNeedNum ? 'n1' : 5]);

            btnFight.setBright(true);
            if (!me.isFighting) {
                btnFight.setBright(false);
            }
            layIco.setTouchEnabled(true);
            layIco.setSwallowTouches(false);
            layIco.data = data.headdata.uid;
            layIco.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'championtrial',
                        uid: sender.data
                    }).checkShow();
                }
            });
            btnFight.setTouchEnabled(G.frame.jingjichang.isFight);
            btnFight.setTouchEnabled(G.frame.jingjichang.isFight);
            btnFight.data = data;
            btnFight.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (!me.isFighting) {
                        G.tip_NB.show(L('JJC_FIGHT_OVER'));
                        return;
                    }

                    var need = G.class.championtrial.get().base.pkneed;
                    var pkNeedNum = G.frame.jingjichang_guanjunshilian.DATA.freenum > 0 ? 0 : need[0].n;
                    var ownNum = me.ownNum;
                    if (ownNum < pkNeedNum) {
                        function callback(num) {
                            G.ajax.send('zypkjjc_buypknum', [num], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    // G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));
                                    if (d.d.prize) {
                                        G.frame.jiangli.data({
                                            prize: [].concat(d.d.prize)
                                        }).once('show', function () {
                                            G.frame.iteminfo_plgm.remove();
                                            me.setTzNum();
                                        }).show();
                                    }
                                }
                            }, true);
                        }

                        G.frame.iteminfo_plgm.data({
                            buy: G.class.jingjichang.get().base.pkneed[0],
                            num: 0,
                            buyneed: G.class.jingjichang.get().base.buyneed,
                            callback: callback
                        }).show();
                        return;
                    }
                    G.frame.jingjichang_gjfight.data({
                        type: 'pvzyjjc',
                        data: sender.data.headdata.uid,
                        callback: function(node) {
                            var data = node.getDefendData();

                            G.ajax.send("championtrial_fight", [sender.data.headdata.uid, data], function(d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    X.cacheByUid('fight_gj_ready', data);

                                    G.frame.fight.data({
                                        pvType: 'pvgjjjc',
                                        prize: d.d.prize,
                                        session: 0,
                                        fightlength: d.d.fightres.length,
                                        fightData: d.d,
                                        callback: function(session) {
                                            G.frame.fight.demo(d.d.fightres[session]);
                                            if (session == d.d.fightres.length - 1) {
                                            	G.frame.fight_win_battle.remove();
                                            	G.frame.fight_fail_battle.remove();

                                                if (d.d.fightres[session].winside == 0) {
                                                    G.frame.fight_win_battle.once('in_over', function () {
                                                        G.frame.fanpai.data(d.d.flop).show();
                                                    });
                                                } else {
                                                    G.frame.fight_fail_battle.once('in_over', function () {
                                                        G.frame.fanpai.data(d.d.flop).show();
                                                    });
                                                }
                                            }
                                        },
                                        endcallback: function() {
                                            // G.frame.jingjichang_guanjunshilian.getData(function() {
                                            //     me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                            // });
                                        }
                                    }).once('show', function() {
                                        G.frame.jingjichang_gjfight.remove();
                                        //刷新
                                        G.frame.jingjichang_guanjunshilian.getData(function() {
                                            G.frame.jingjichang_guanjunshilian._panels['1'].refreshPanel();
                                        });

                                        // G.frame.jingjichang_guanjunshilian._panels['1'].refreshEnemys();

                                    }).demo(d.d.fightres[0]);
                                }
                            }, true);
                        }
                    }).show();
                }
            });

            ui.show();
        },
        //宝箱奖励
        setBoxPrize: function() {
            var me = this;

            me.setFightNum();

            var listview = me.nodes.listview_bx;
            listview.removeAllChildren();
            cc.enableScrollBar(listview);
            var list = me.nodes.list_bx;
            list.hide();

            var conf = G.class.jingjichang.get().base.passprize;

            for (var i = 0; i < conf.length; i++) {
                var p = conf[i];
                var item = list.clone();
                item.data = p;
                item.idx = i;
                me.setItemBx(item);
                listview.pushBackCustomItem(item);
            }

            listview.jumpToRight();
        },
        setItemBx: function(item) {
            var me = this;

            X.autoInitUI(item);
            var layIco = item.nodes.panel_bx;
            var txtNum = item.nodes.text_cs2;
            var imgYlq = item.nodes.img_ylq;


            var myFightNum = G.frame.jingjichang_guanjunshilian.DATA.pknum || 0;
            // myFightNum = 100;

            var prizelist = G.frame.jingjichang_guanjunshilian.DATA.prizelist || [];
            var data = item.data;
            var idx = item.idx;

            imgYlq.hide();

            layIco.setTouchEnabled(false);
            layIco.setBackGroundImage('img/jingjichang/img_jjc_bx' + me.extConf.box.idx[idx] + '.png', 1);
            txtNum.setString(data[0][0]);

            //todo 去掉红点

            var lqState = 'yulan';
            if (X.inArray(prizelist, data[0][0])) {
                imgYlq.show();
                lqState = 'chakan'
            } else {
                if (myFightNum >= data[0][0]) {
                    //显示红点
                    lqState = 'lq';
                }
            }

            item.lqstate = lqState;
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var prize = sender.data[1];
                    if (sender.lqstate == 'yulan' || sender.lqstate == 'chakan') {
                        G.frame.jiangliyulan.data({
                            title: sender.lqstate = 'yulan' ? L('JLYL') : L('JLCK'),
                            prize: [].concat(prize)
                        }).show();
                    } else if (sender.lqstate == 'lq') {
                        G.ajax.send('zypkjjc_getprize', [sender.data[0][0]], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jingjichang_guanjunshilian.DATA.prizelist = d.d.prizelist;
                                me.setItemBx(sender);
                                G.frame.jiangli.data({
                                    prize: [].concat(prize)
                                }).show();
                            }
                        }, true);
                    }
                }
            });

            item.show();
        },
        setFightNum: function() {
            var me = this;

            var panel = me.nodes.panel_bxjl;
            panel.hide();
            // var txtNum = panel.finds('text_cs$');

            // var data = G.frame.jingjichang_guanjunshilian.DATA;
            // txtNum.setString(data.pknum || 0);
        },
    });

})();
