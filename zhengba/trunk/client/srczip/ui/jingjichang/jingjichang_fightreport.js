/**
 * Created by wfq on 2018/6/22.
 */
(function() {
    //竞技场-战斗报告
    var ID = 'jingjichang_fightreport';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function() {
            var me = this;

            setPanelTitle(me.nodes.text_zdjl, L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function() {
            var me = this;

            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;

            if (me.needRefreshMain) delete me.needRefreshMain;

            new X.bView('jingjichang_zdjl.json', function(view) {
                me._view = view;

                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me._view.nodes.list_lb.finds("panel_slsb$").show();
                me.getData(function() {
                    me.setContents();
                });
            });
        },
        onHide: function() {
            var me = this;

            if (me.needRefreshMain) {
                //刷新
                if (G.frame.jingjichang_freepk.isShow) {
                    G.frame.jingjichang_freepk.getData(function() {
                        G.frame.jingjichang_freepk._panels[G.frame.jingjichang_freepk.curType].refreshPanel(1);
                    });
                } else {
                    G.frame.jingjichang_guanjunshilian.getData(function() {
                        G.frame.jingjichang_guanjunshilian._panels[G.frame.jingjichang_guanjunshilian.curType].refreshPanel(1);
                    });
                }

            }
        },
        refreshData: function() {
            var me = this;

            me.getData(function() {
                me.setContents();
            });
        },
        getData: function(callback) {
            var me = this;
            var api = G.frame.jingjichang_freepk.isShow ? 'zypkjjc_recording' : 'championtrial_recording';
            G.ajax.send(api, [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function() {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var data = me.DATA.recording;

            if (data.length < 1) {
                cc.sys.isObjectValid(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.show();
                return;
            } else {
                cc.sys.isObjectValid(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.hide();
            }

            var table = new X.TableView(scrollview, panel.nodes.list_lb, 1, function(ui, data) {
                me.setItem(ui, data);
            }, null, null, 8,10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me = this;

            X.autoInitUI(ui);

            ui.setTouchEnabled(false);

            var enemyUid = data.uid;
            if (P.gud.uid == data.uid) {
                enemyUid = data.enemyuid;
            }

            var wid = G.class.shead(data.headdata);

            X.render({
                panel_tx: function(node) {
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2, node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);

                    node.setTouchEnabled(true);
                    node.setSwallowTouches(false);
                    node.data = data;
                    node.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.wanjiaxinxi.data({
                                pvType: 'zypkjjc',
                                uid: sender.data.headdata.uid
                            }).checkShow();
                        }
                    });
                },
                // text_dj2: data.headdata.lv,
                //胜利失败，积分变化是指我的,头像是玩家的，
                img_sb: function(node) {
                    node.hide();

                    if ((P.gud.uid == data.uid && data.winside != 0) || (P.gud.uid == data.enemyuid && data.winside == 0)) {
                        node.show();
                    }
                },
                img_sl: function(node) {
                    node.hide();

                    if ((P.gud.uid == data.uid && data.winside == 0) || (P.gud.uid == data.enemyuid && data.winside != 0)) {
                        node.show();
                    }

                },
                text_mz: data.headdata.name,
                text_jf: function(node) {
                    //失败
                    var add, lose;

                    for (var i in data.jifenchange) {
                        if(data.jifenchange[i].change < 0) {
                            lose = data.jifenchange[i].change;
                        } else {
                            add = data.jifenchange[i].change;
                        }
                    }

                    if (P.gud.uid == data.uid) {
                        setTextWithColor(node, (data.winside == 0 ? '+' : '-') + Math.abs(data.winside == 0 ? add : lose), G.gc.COLOR[data.winside == 0 ? 1 : 5]);
                    } else {
                        setTextWithColor(node, (data.winside != 0 ? '+' : '-') + Math.abs(data.winside != 0 ? add : lose), G.gc.COLOR[data.winside == 1 > 0 ? 1 : 5]);
                    }
                },
                text_sj: X.moment((data.ctime || 0) - G.time),
                btn_hf: function(node) {
                    node.setTouchEnabled(true);
                    node.setSwallowTouches(false);
                    node.data = data;
                    node.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('zypkjjc_watch', [sender.data.tid], function(d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    G.frame.fight.data({
                                        pvType: 'pvjjc',
                                        isVideo: true,
                                        prize: d.d.prize,
                                        fightData:d.d
                                    }).once('show', function() {

                                    }).demo(d.d.fightres);
                                }
                            }, true);
                        }
                    });
                },
                btn_zd: function(node) {
                    node.hide();

                    // if ((P.gud.uid == data.uid && data.winside == 1) || (P.gud.uid == data.enemyuid && data.winside == 0)) {
                    //     node.show();
                    // }
                    node.setTouchEnabled(true);
                    node.setSwallowTouches(false);
                    node.isopen = true;
                    if(!G.frame.jingjichang_freepk.isFight) {
                        node.setBright(G.frame.jingjichang_freepk.isFight);
                        node.isopen = false;
                    }
                    node.data = data;

                    node.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if(sender.isopen == false) {
                                G.tip_NB.show(L("BLSJYJS"));
                                return;
                            }
                            G.frame.fight.startFight({}, function(n) {
                                var selectedData = n.getSelectedData();

                                G.ajax.send('zypkjjc_fight', [enemyUid, selectedData], function(d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        if (d.d.fightres.winside == 0) {
                                            G.frame.fight_win_battle.once("show", function () {
                                                if(d.d.flop) {
                                                    G.frame.fanpai.data(d.d.flop).show();
                                                }
                                            })
                                        }else{
                                            G.frame.fight_fail_battle.once("show", function () {
                                                if(d.d.flop) {
                                                    G.frame.fanpai.data(d.d.flop).show();
                                                }
                                            })
                                        }
                                        d.d.pvType = "pvjjc";
                                        G.frame.fight.data(d.d).once('show', function() {
                                            G.frame.yingxiong_fight.remove();

                                            me.refreshData();

                                            me.needRefreshMain = true;

                                        }).demo(d.d.fightres);
                                    }
                                }, true);
                            });
                        }
                    });
                },
                text_tzjsl: function(node) {
                    var data = G.frame.jingjichang_freepk.DATA || G.frame.jingjichang_guanjunshilian.DATA;
                    if (data.freenum > 0) {
                        node.setString(0);
                    } else {
                        var need = G.class.jingjichang.get().base.pkneed;
                        node.setString(need[0].n);
                    }
                    node.setTextColor(cc.color(G.gc.COLOR.n5));
                    X.enableOutline(node,'#4A1D09',2);
                }
            }, ui.nodes);
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();