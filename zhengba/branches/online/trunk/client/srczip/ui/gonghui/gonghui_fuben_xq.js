/**
 * Created by wfq on 2018/6/27.
 */
(function () {
    //公会-副本-详情
    var ID = 'gonghui_fuben_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            // setPanelTitle(me.ui.finds('text_zdjl'), L('UI_TITLE_SHPH'));
            me.nodes.text_zdjl.setString(L("FBSL"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();

            me.ui.finds("panel_zsy").y += 23;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('gonghui_shph.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.initUi();
                me.bindBtn();

                me.getData(function () {
                    me.setContents();
                });
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     pknum:1,
            //     hp:10,
            //     maxhp:100,
            //     ranklist:[
            //         {maxzhanli:10000,dps:1000000,showhead:P.gud}
            //     ]
            // };
            // callback && callback();

            G.ajax.send('gonghuifuben_fbdata', [me.data().fbid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        refreshData: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        setContents: function () {
            var me = this;

            me.setBoss();
            me.setTable();
        },
        setBoss: function () {
            var me = this;

            var panel = me._view;

            var conf = G.class.gonghui.getFubenById(me.data().fbid);

            X.render({
                //战斗
                btn_battle: function (node) {
                    node.hide();
                    if (me.DATA.pknum == 0) {
                        node.show();
                    } else {
                        var conf = G.class.gonghui.getFubenConf().pkneed[me.DATA.pknum];
                        if (!conf) {
                            node.show();
                            node.setTouchEnabled(false);
                            node.setEnableState(false);
                        }
                    }

                    node.data = me.data().fbid;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.fight.startFight({}, function (node) {
                                var selectedData = node.getSelectedData();

                                G.ajax.send('gonghuifuben_fight', [sender.data, selectedData], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        X.cacheByUid('fight_ghfb', selectedData);
                                        G.frame.fight.data({
                                            pvType:'pvfuben',
                                            prize: d.d.prize,
                                            pvid:sender.data
                                        }).once('show', function () {
                                            G.frame.yingxiong_fight.remove();

                                            // 不论胜负，都需要刷新界面
                                            //刷新
                                            G.frame.gonghui_fuben.refreshData();
                                            G.frame.gonghui_main.getData(function () {
                                                G.frame.gonghui_main.checkGHRW();
                                            });
                                        }).demo(d.d.fightres);
                                    }
                                }, true);
                            }, "ghfb");
                        }
                    });
                },
                //复活
                btn_resurrection: function (node) {
                    node.hide();
                    if (me.DATA.pknum > 0) {
                        var conf = G.class.gonghui.getFubenConf().pkneed[me.DATA.pknum];
                        if (conf) {
                            node.finds('txt_sl$').setString(conf[0].n);
                            node.show();

                            var ownNum = G.class.getOwnNum(conf[0].t,conf[0].a);
                            setTextWithColor(node.finds('txt_sl$'),conf[0].n,G.gc.COLOR[ownNum >= conf[0].n ? 'n1' : 'n16']);
                            ownNum < conf[0].n && X.enableOutline(node.finds('txt_sl$'),cc.color('#740000'),1)
                        }
                    }
                    node.data = me.data().fbid;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (sender.isOver) {
                                G.tip_NB.show(L('GONGHUI_FUBEN_FIGHT_MAX'));
                                return;
                            }

                            if (ownNum < conf[0].n) {
                                G.tip_NB.show(G.class.getItem(conf[0].t,conf[0].a).name + L('buzu'));
                                return;
                            }

                            G.frame.fight.startFight({}, function (node) {
                                var selectedData = node.getSelectedData();

                                G.ajax.send('gonghuifuben_fight', [sender.data, selectedData], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {

                                        X.cacheByUid('fight_ghfb',selectedData);
                                        G.frame.fight.data({
                                            pvType:'pvfuben',
                                            prize: d.d.prize,
                                            pvid: sender.data
                                        }).once('show', function () {
                                            G.frame.yingxiong_fight.remove();

                                            // 不论胜负，都需要刷新界面
                                            //刷新
                                            G.frame.gonghui_fuben.refreshData();
                                            G.frame.gonghui_main.getData(function () {
                                                G.frame.gonghui_main.checkGHRW();
                                            });
                                        }).demo(d.d.fightres);
                                    }
                                }, true);
                            }, "ghfb");
                        }
                    });
                },
                img_jdt1: function (node) {
                    var per;
                    if (!me.DATA.maxhp) {
                        per = 100;
                    } else {
                        per = me.DATA.hp / me.DATA.maxhp * 100;
                    }
                    node.setPercent(per);

                    panel.nodes.txt_jdt.setString(per.toFixed(2) + '%');
                },
                // txt_jdt:per + '%',
                btn_instance: function (node) {
                    node.setTouchEnabled(false); 
                },
                //头像
                panel_character: function (node) {
                    node.setScale(1);
                    node.setBackGroundImage('ico/heroicon/' + G.class.fmtItemICON(conf.bossimg) + '.png',0);
                },
                txt_name:me.data().fbid,
                //奖励
                btn_reward: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.gonghui_fuben_prize.show();
                        }
                    });
                },
                //背景
                zz_bg:function(node){
                    var boss = G.class.hero.getById(conf.hid);
                    node.setBackGroundImage('ico/ghbossico/zhongzu_' + boss.zhongzu + '.png',0);
                },
                //倒计时
                panel_countdown: function (node) {
                    node.hide();

                    if (me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    if (me.DATA.pknum > 0 ) {
                        me.timer = X.timeout(node.finds('txt_countdown$'),X.getTodayZeroTime() + 24 * 60 * 60, function () {
                            me.refreshData();
                        });
                        node.show();
                    }
                }
            },panel.nodes);

            me.setMyRank();

            me._view.nodes.panel_show.show();
        },
        setTable: function () {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview_rank;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            panel.nodes.panel_listview.show();

            var data = [].concat(me.DATA.ranklist);

            if (data.length < 1) {
                panel.nodes.img_zwnr.show();
                return;
            } else {
                panel.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < data.length; i++) {
                var dd = data[i];
                dd.rank = i + 1;
            }

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_rank,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            ui.setTouchEnabled(false);

            X.autoInitUI(ui);
            X.render({
                panel_tx: function (node) {
                    var wid = G.class.shead(data.showhead);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                    wid.setTouchEnabled(true);
                    wid.data = data;
                    wid.click(function (sender, type) {
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.showhead.uid,
                        }).checkShow();
                    })
                },
                txt_player_name:data.showhead.name,
                // txt_job:L('GONGHUI_POWER_' + (data.power || 3)),
                //排名
                wz_fnt:function (node) {
                    node.setString(data.rank > 3 ? data.rank : "");
                },
                //伤害
                txt_zsh:X.fmtValue(data.dps || 0),
                panel_pm: function (node) {
                    node.removeBackGroundImage();
                    if(data.rank < 4){
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                    }
                }
            },ui.nodes);
        },
        setMyRank: function () {
            var me = this;
            var is = false;
            var wsb = me._view.finds("wsb_player");
            var rank = me._view.nodes.fnt_player;
            var dps = me._view.finds("txt_level_0");
            var data = me.DATA.ranklist;

            for(var i = 0; i < data.length; i ++) {
                if(data[i].showhead.uid == P.gud.uid) {
                    rank.setString(i + 1);
                    dps.setString(X.fmtValue(data[i].dps));
                    is = true;
                    break;
                }
            }

            if(!is) {
                rank.hide();
                wsb.show();
            }
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();