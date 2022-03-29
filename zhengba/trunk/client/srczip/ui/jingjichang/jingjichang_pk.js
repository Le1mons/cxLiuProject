/**
 * Created by wfq on 2018/6/19.
 */
(function () {
    //自由竞技场
    G.class.jingjichang_pk = X.bView.extend({
        extConf: {
            box: {
                idx: [1, 1, 2, 2, 3, 3, 3]
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('jingjichang_zyjj.json');
        },
        refreshPanel: function (d) {
            var me = this;

            me.setContents(d);
        },
        bindBTN: function () {
            var me = this;

            //刷新
            me.nodes.btn_sx.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (!G.frame.jingjichang_freepk.isFight) {
                        G.tip_NB.show(L('JJC_FIGHT_OVER'));
                        return;
                    }

                    if (!me.isRefreshEnemy) {
                        me.isRefreshEnemy = true;
                        me.refreshEnemys();
                        var time = 3;
                        refTimer(sender, time);
                    }


                }
            });

            function refTimer(sender, time) {
                sender.setEnableState(false);
                sender.setTitleText(time + 's');
                sender.setTitleColor(cc.color(G.gc.COLOR.n15));
                me.ui.setTimeout(function () {
                    time--;
                    cc.isNode(sender) && sender.setTitleText(L('BTN_SX'));
                    sender.setEnableState(true);
                    if (time <= 0) {
                        me.ui.setTimeout(function () {
                            delete me.isRefreshEnemy;
                        }, 200)
                        sender.setTitleColor(cc.color(G.gc.COLOR.n13));
                        return;
                    } else {
                        refTimer(sender, time);
                    }
                }, 1000)
            }
            //增加次数
            me.nodes.btn_jia.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    function callback(num) {
                        G.ajax.send('zypkjjc_buypknum', [num], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.event.emit("sdkevent", {
                                    event: "zypkjjc_buypknum",
                                    num: num
                                });
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

            me.nodes.img_kuang.click(function () {
                if (X.cacheByUid("jjcJumFight")) {
                    X.cacheByUid("jjcJumFight", 0);
                    me.nodes.img_gouxuan.hide();
                } else {
                    X.cacheByUid("jjcJumFight", 1);
                    me.nodes.img_gouxuan.show();
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
            if (X.cacheByUid("jjcJumFight")) {
                me.nodes.img_gouxuan.show();
            } else {
                me.nodes.img_gouxuan.hide();
            }

            me.nodes.img_kuang.setTouchEnabled(true);
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();

            G.frame.jingjichang_freepk.onnp('updateInfo', function (d) {
                if (G.frame.jingjichang_freepk.curType == me._type) {
                    me.refreshPanel(d);
                } else {
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onRemove: function () {
            var me = this;

            if (me.refTimer) {
                clearInterval(me.refTimer);
                delete me.refTimer;
            }
        },
        setContents: function (d) {
            var me = this;

            me.setDjs();
            me.setBaseInfo();
            me.setMyRank();
            me.setTzNum();
            me.setBoxPrize();
            G.frame.jingjichang_freepk.getEnemyData(d ? 1 : 0, function () {
                me.setEnemy();
            });
        },
        onNodeShow: function () {
            var me = this;

            if (me._needRefresh) {
                delete me._needRefresh;
                me.refreshPanel();
            }
        },
        setBaseInfo: function () {
            var me = this;

            var btnSx = me.nodes.btn_sx;
            btnSx.setBright(true);
            if (!G.frame.jingjichang_freepk.isFight) {
                btnSx.setBright(false);
            }
        },
        // 刷新敌人信息
        refreshEnemys: function () {
            var me = this;

            G.frame.jingjichang_freepk.getEnemyData(1, function () {
                // G.tip_NB.show(L('SHUAXIN') + L('SUCCESS'));
                me.setEnemy();
            });
        },
        refresh: function () {
            var me = this;

            G.frame.jingjichang_freepk.getEnemyData(0, function () {
                // G.tip_NB.show(L('SHUAXIN') + L('SUCCESS'));
                me.setEnemy();
            });
        },
        //活动倒计时
        setDjs: function () {
            var me = this;

            var txtTimeStr1 = me.ui.finds('text_susj');
            var txtTime1 = me.nodes.text_sj;
            txtTime1.setFontName(G.defaultFNT);

            var zeroTime = X.getLastMondayZeroTime();
            var openDuration = G.class.jingjichang.get().base.closetime;

            if (me.timer1) {
                txtTime1.clearTimeout(me.timer1);
                delete me.timer1;
            }
            if (me.isFighting) delete me.isFighting;

            if (G.time > zeroTime + openDuration) {
                //休息时间
                txtTimeStr1.setString(L('OPEN_TO_STAR') + '：');
                me.timer1 = X.timeout(txtTime1, zeroTime + 7 * 24 * 60 * 60, function () {
                    me.refreshPanel();
                    G.frame.jingjichang_freepk.isFight = true;
                }, null, null);
            } else {
                //活动时间
                txtTimeStr1.setString(L('OPEN_TO_END') + '：');
                me.timer1 = X.timeout(txtTime1, zeroTime + openDuration, function () {
                    if (G.frame.fight.isShow) {
                        G.frame.fight.once("hide", function () {
                            X.uiMana.closeAllFrame();
                        });
                    } else {
                        X.uiMana.closeAllFrame();
                    }
                }, null, null);
            }
        },
        setMyRank: function (isEmit) {
            var me = this;

            var panel = me.ui.finds('panel_wdxx');
            X.autoInitUI(panel);

            var layIco = panel.nodes.panel_wdtx;
            // var txtLv = panel.nodes.text_dj;
            var txtRank = panel.nodes.text_pm;
            var txtScore = panel.nodes.text_jf;
            var txtZdl = panel.nodes.text_zdl1;

            layIco.removeAllChildren();

            var data = G.frame.jingjichang_freepk.DATA;

            var wid = G.class.shead(P.gud);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);

            // txtLv.setString(P.gud.lv);
            var rank = data.myrank || 0;
            txtRank.setString(rank > 1000 ? "1000+" : rank);
            txtScore.setString(data.jifen || 1000);
            txtZdl.setString(data.zhanli || 0);

            if (isEmit) {
                G.event.emit("sdkevent", {
                    event: "jjc_ziyoujj",
                    data: {
                        waiyu_rank: rank,
                        waiyu_score: data.jifen
                    }
                });
            }
        },
        setTzNum: function () {
            var me = this;

            var txtTzNum = me.ui.finds('panel_wdxx').finds('text_tzjsl$');

            var need = G.class.jingjichang.get().base.pkneed;

            var ownNum = me.ownNum = G.class.getOwnNum(need[0].t, need[0].a);
            txtTzNum.setString(ownNum);
            // setTextWithColor(txtTzNum,ownNum,G.gc.COLOR[ownNum >= need[0].n ? 'n1' : 5]);
        },
        setEnemy: function () {
            var me = this;

            var lay;
            var layArr = [me.nodes.panel_lb1, me.nodes.panel_lb2, me.nodes.panel_lb3];
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }

            var item = me.nodes.list_lb;
            item.hide();

            var enemyData = G.frame.jingjichang_freepk.enemyData || [];

            if (enemyData.length < 1) {
                me.nodes.img_zwnr.show();
                return;
            } else {
                me.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < enemyData.length; i++) {
                lay = layArr[i];
                var data = enemyData[i];
                var wid = item.clone();
                wid.setPosition(cc.p(0, 0));
                lay.addChild(wid);
                if (G.frame.jingjichang_freepk.isSX) {
                    G.class.ani.show({
                        json: "ani_shuaxin",
                        addTo: wid,
                        x: wid.width / 2,
                        y: wid.height / 2,
                        repeat: false,
                        autoRemove: true
                    });
                }
                wid.show();
                me.setItem(wid, data);
            }
            G.frame.jingjichang_freepk.isSX = false;
        },
        setItem: function (ui, data) {

            var me = this;
            if (!data.headdata.uid) data.headdata.uid = data.uid;
            X.autoInitUI(ui);
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.text_mz;
            var txtZdl = ui.nodes.text_zdl2;
            var txtScore = ui.nodes.text_jf;
            var btnFight = ui.nodes.btn_zd;
            var txtNeed = ui.nodes.text_tzjsl;
            ui.finds('img_dk').setColor(cc.color('#EDE4D0'));
            layIco.removeAllChildren();

            var wid = G.class.shead(data.headdata);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);

            wid.data = data;
            wid.setTouchEnabled(true);
            wid.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (data.uid.indexOf("npc") != -1) {
                        G.frame.wanjiaxinxi.data({
                            npc: data
                        }).checkShow();
                    } else {
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.headdata.uid
                        }).checkShow();
                    }
                }
            });

            txtName.setString(data.headdata.name);
            // txtZdl.setString(data.headdata.zhanli || 0);
            txtZdl.setString(data.zhanli || 0);
            //X.enableOutline(txtZdl, cc.color('#740000'), 1);
            txtScore.setString(data.jifen || 0);
            //X.enableOutline(txtScore, cc.color('#740000'), 1);
            txtName.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);

            var pkNeedNum = G.frame.jingjichang_freepk.DATA.freenum > 0 ? 0 : G.class.jingjichang.get().base.pkneed[0].n;
            var ownNum = me.ownNum;
            setTextWithColor(txtNeed, pkNeedNum, G.gc.COLOR[ownNum >= pkNeedNum ? 'n1' : 'n16']);
            X.enableOutline(txtNeed, cc.color(ownNum >= pkNeedNum ? "#000000" : '#740000'), 1);

            btnFight.setBright(G.frame.jingjichang_freepk.isFight);
            btnFight.setTouchEnabled(G.frame.jingjichang_freepk.isFight);
            btnFight.isopen = G.frame.jingjichang_freepk.isFight;
            btnFight.data = data;
            btnFight.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (sender.isopen == false) {
                        G.tip_NB.show(L('BLSJYJS'));
                        return;
                    }
                    var need = G.class.jingjichang.get().base.pkneed;
                    var pkNeedNum = G.frame.jingjichang_freepk.DATA.freenum > 0 ? 0 : need[0].n;
                    var ownNum = me.ownNum;
                    if (ownNum < pkNeedNum) {
                        function callback(num) {
                            G.ajax.send('zypkjjc_buypknum', [num], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    G.event.emit("sdkevent", {
                                        event: "zypkjjc_buypknum"
                                    });
                                    me.setTzNum();
                                    me.refresh();
                                    sender.triggerTouch(ccui.Widget.TOUCH_ENDED);
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
                    var jjccache = X.cacheByUid('fight_zyjjc');
                    var iflose;//竞技场缓存的英雄是否还在
                    if (jjccache && jjccache.sqid) delete jjccache.sqid;
                    for (var k in jjccache) {
                        if (!G.DATA.yingxiong.list[jjccache[k]]) {
                            iflose = true;
                            break;
                        }
                    }
                    if (X.cacheByUid("jjcJumFight") && cc.isObject(X.cacheByUid('fight_zyjjc')) && Object.keys(X.cacheByUid('fight_zyjjc')).length > 0 && !iflose) {
                        G.ajax.send('zypkjjc_fight', [sender.data.headdata.uid, X.cacheByUid('fight_zyjjc'), 1], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {

                                if (d.d.fightres.winside == 0) {
                                    G.frame.jumpfight_win.data({
                                        pvType: 'pvjjc',
                                        prize: d.d.prize,
                                        fightData: d.d,
                                        flop: d.d.flop
                                    }).show();
                                } else {
                                    G.frame.jumpfight_fail.data({
                                        pvType: 'pvjjc',
                                        prize: d.d.prize,
                                        fightData: d.d,
                                        flop: d.d.flop
                                    }).show();
                                }

                                G.frame.jingjichang_freepk.getData(function () {
                                    me.setMyRank(1);
                                    me.refreshPanel(1);
                                    me.setTzNum();
                                    me.refreshEnemys();
                                });
                            }
                        }, true);
                    } else {
                        G.frame.fight.startFight({pvType:'jjckz'}, function (node) {
                            var selectedData = node.getSelectedData();

                            G.ajax.send('zypkjjc_fight', [sender.data.headdata.uid, selectedData, 0], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    X.cacheByUid('fight_zyjjc', selectedData);

                                    G.frame.fight.data({
                                        pvType: 'pvjjc',
                                        prize: d.d.prize,
                                        fightData: d.d,
                                        flop: d.d.flop
                                    }).once('show', function () {
                                        G.frame.yingxiong_fight.remove();

                                        // 不论胜负，都需要刷新界面
                                        //刷新
                                        G.frame.fight.pvp_start({
                                            id: sender.data.headdata.uid,
                                            zhanli: sender.data.zhanli,
                                            rList: G.frame.fight.getHeroHidArr(sender.data.defhero),
                                            lList: G.frame.fight.getMyHidArr(selectedData),
                                            type: 'ziyoujingjichang'
                                        });
                                    }).once('willClose', function () {
                                        G.frame.fight.pvp_end({
                                            id: sender.data.headdata.uid,
                                            zhanli: sender.data.zhanli,
                                            rList: G.frame.fight.getHeroHidArr(sender.data.defhero[0]),
                                            lList: G.frame.fight.getMyHidArr(selectedData),
                                            result: d.d.fightres.winside,
                                            data: G.frame.fight.getHeroData(d.d.fightres, 0, true),

                                            type: 'ziyoujingjichang'
                                        });
                                    }).demo(d.d.fightres);

                                    G.frame.jingjichang_freepk.getData(function () {
                                        me.setMyRank(1);
                                        me.refreshPanel(1);
                                        me.setTzNum();
                                        me.refreshEnemys();
                                    });
                                }
                            }, true);
                        });
                    }
                }
            });

            ui.show();
        },
        //宝箱奖励
        setBoxPrize: function () {
            var me = this;

            me.setFightNum();

            var listview = me.nodes.listview_bx;
            listview.removeAllChildren();
            cc.enableScrollBar(listview);
            var list = me.nodes.list_bx;
            list.hide();

            var conf = G.class.jingjichang.get().base.passprize;
            var myFightNum = G.frame.jingjichang_freepk.DATA.pknum || 0;

            for (var i = 0; i < conf.length; i++) {
                var p = conf[i];
                var item = list.clone();
                item.data = p;
                item.idx = i;
                me.setItemBx(item);
                listview.pushBackCustomItem(item);
            }

            for (var i = 1; i < conf.length; i++) {
                var jdt = me.nodes["img_tiao" + i];
                if (conf[i - 1] && conf[i - 1][0][0] < myFightNum) {
                    jdt.setPercent(myFightNum / conf[i][0][0] * 100);
                } else {
                    jdt.setPercent(0);
                }
            }
        },
        setItemBx: function (item) {
            var me = this;

            X.autoInitUI(item);
            var layIco = item.nodes.panel_bx;
            var txtNum = item.nodes.text_cs2;
            var imgYlq = item.nodes.img_ylq;


            var myFightNum = G.frame.jingjichang_freepk.DATA.pknum || 0;
            // myFightNum = 100;

            var prizelist = G.frame.jingjichang_freepk.DATA.prizelist || [];
            var data = item.data;
            var idx = item.idx;

            imgYlq.hide();

            layIco.removeAllChildren();
            layIco.removeBackGroundImage();
            layIco.setTouchEnabled(false);
            txtNum.setString(data[0][0]);
            txtNum.setTextColor(cc.color(G.gc.COLOR.n5));
            X.enableOutline(txtNum, '#4A1D09', 2);

            //todo 去掉红点

            var lqState = 'yulan';
            if (X.inArray(prizelist, idx)) {
                imgYlq.show();
                lqState = 'chakan';

                layIco.setBackGroundImage('img/jingjichang/img_jjc_bx' + me.extConf.box.idx[idx] + '_d.png', 1);
            } else {
                if (myFightNum >= data[0][0]) {
                    //显示红点
                    lqState = 'lq';

                    X.addBoxAni({
                        parent: layIco,
                        boximg: 'img/jingjichang/img_jjc_bx' + me.extConf.box.idx[idx] + '.png'
                    });

                    // G.class.ani.show({
                    //     addTo:layIco,
                    //     json:'ani_baoxianglingqu',
                    //     x:layIco.width / 2,
                    //     y:layIco.height / 2,
                    //     repeat:true,
                    //     autoRemove:false,
                    //     onload: function (node,action) {
                    //         node.finds('baoxiang').setBackGroundImage('img/jingjichang/img_jjc_bx' + me.extConf.box.idx[idx] + '.png', 1);
                    //     }
                    // });
                } else {
                    layIco.setBackGroundImage('img/jingjichang/img_jjc_bx' + me.extConf.box.idx[idx] + '.png', 1);
                }
            }

            item.lqstate = lqState;
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var prize = sender.data[1];
                    if (sender.lqstate == 'yulan' || sender.lqstate == 'chakan') {
                        G.frame.jiangliyulan.data({
                            title: sender.lqstate == 'yulan' ? L('JLYL') : L('JLCK'),
                            prize: [].concat(prize)
                        }).show();
                    } else if (sender.lqstate == 'lq') { //sender.data[0][0]
                        G.ajax.send('zypkjjc_getprize', [sender.idx], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jingjichang_freepk.DATA.prizelist.push(sender.idx);
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
        setFightNum: function () {
            var me = this;

            var panel = me.nodes.panel_bxjl;

            var txtNum = panel.finds('text_cs$');

            var data = G.frame.jingjichang_freepk.DATA;
            txtNum.setString(X.STR(L('YYC'), data.pknum) || 0);
        },
    });

})();