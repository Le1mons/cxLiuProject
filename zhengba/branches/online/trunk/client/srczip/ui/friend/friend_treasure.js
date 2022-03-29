/**
 * Created by lsm on 2018/6/27
 */
(function() {
    //好友探宝
    G.class.friend_treasure = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('friend_assist.json');
        },
        refreshPanel: function(first) {
            var me = this;
            me.getData(function() {
                me.setContents();
            });
            if(me.curType == 1 && !first) {
                me.ui.setTimeout(function () {
                    me.getRankData(function () {
                        me.nodes.listview1.removeAllChildren();
                        me.nodes.listview2.removeAllChildren();
                        me.setRank();
                    })
                }, 4000);
            }
        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_search.click(function() {
                if(P.gud.lv < G.class.opencond.getLvById("friendhelp")) {
                    G.tip_NB.show(X.STR(L("XJKQ"), G.class.opencond.getLvById("friendhelp")));
                    return;
                }
                G.ajax.send('friend_treasure', [], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.removeNewIco(me.nodes.btn_search);
                        G.class.ani.show({
                            json: "ani_haoyouboss",
                            addTo: me.nodes.panel_searching,
                            x: me.nodes.panel_searching.width / 2,
                            y: me.nodes.panel_searching.height / 2,
                            repeat: false,
                            autoRemove: true,
                            onend: function () {
                                if (d.d.treasure && d.d.treasure.prize && d.d.treasure.prize.length > 0) {
                                    G.frame.jiangli.data({
                                        prize: [].concat(d.d.treasure.prize)
                                    }).show();
                                }
                                me.refreshPanel();
                                G.hongdian.getData("treature", 1, function () {
                                    G.frame.friend.checkRedPoint();
                                })
                            }
                        })
                    }
                }, true);
            });

            me.nodes.btn_battle.click(function(sender) {
                G.frame.fight.startFight({}, function(node) {
                    var selectedData = me.selectedData = node.getSelectedData();
                    G.ajax.send('friend_fight', [P.gud.uid, selectedData], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            me.refreshPanel();
                            if (d.d.fightres.winside == 0) {
                                G.frame.fight_win_friendboss.once('in_over', function () {
                                    G.frame.fanpai.data(d.d.flop).show();
                                });
                            }else {
                                G.frame.fight_fail_friendboss.once('in_over', function () {
                                    G.frame.fanpai.data(d.d.flop).show();
                                });
                            }
                            X.cacheByUid('fight_hybs', selectedData);
                            G.frame.fight.data({
                                pvType: 'hybs',
                                pvid: me.DATA.bossdata.fightmap,
                                prize: d.d.prize,
                                dps: d.d.dps,
                                jifen: d.d.jifen,
                                callback: function() {
                                    me.nextFight();
                                },
                                endcallback: function() {

                                }
                            }).once('show', function() {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }else{
                            X.uiMana.closeAllFrame();
                        }
                    }, true);
                }, "hybs")
            });

            // me.nodes.btn_rank.click(function() {
            //     G.frame.friend_jifen_phb.show();
            // });
            //
            // me.nodes.btn_reward.click(function() {
            //     G.frame.friend_jifen_pmjl.show();
            // });

            X.radio([me.nodes.btn_rank, me.nodes.btn_reward], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_rank$: 1,
                    btn_reward$: 2
                };
                me.changeType(name2type[name]);
            });

            me.nodes.btn_damage_rank.click(function() {
                G.frame.friend_dps_phb.show();
            });

            me.ui.finds('btn_info').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr:L('TS13')
                    }).show();
                }
            });
        },
        changeType: function(type) {
            var me = this;

            if(me.curType && me.curType == type) return;

            me.curType = type;

            me.nodes.listview1.removeAllChildren();
            me.nodes.listview2.removeAllChildren();
            me.nodes.listview1.setTouchEnabled(false);
            me.nodes.listview2.setTouchEnabled(false);

            if(type == 1) {
                me.nodes.listview1.setTouchEnabled(true);
                me.getRankData(function () {
                    me.setRank();
                });
                me.nodes.panel_jifenph.show();
            } else {
                me.nodes.listview2.setTouchEnabled(true);
                me.setRankPrize();
                me.nodes.panel_jifenph.hide();
            }
        },
        setRank: function() {
            var me = this;

            function f(ui, data) {
                X.autoInitUI(ui);
                var layPh = ui.nodes.img_rank;
                var txtPh = ui.nodes.sz_phb;
                var layIco = ui.nodes.panel_tx;
                var txtName = ui.nodes.txt_name;
                var txtGuanqia = ui.nodes.txt_number;
                ui.nodes.txt_title.setString(L('jifenphb'));

                layPh.hide();
                txtPh.setString('');
                layIco.removeAllChildren();
                if (data.rank < 0) {
                    txtPh.setString(0);
                } else if (data.rank < 4) {
                    layPh.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                    layPh.show();
                } else {
                    txtPh.setString(data.rank);
                    txtPh.show();
                }

                var wid = G.class.shead(data.headdata);
                wid.data = data;
                wid.setTouchEnabled(true);
                wid.icon.setTouchEnabled(false);
                wid.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.headdata.uid
                        }).checkShow();
                    }
                });
                wid.setScale(.9);
                wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
                layIco.addChild(wid);

                txtName.setString(data.headdata.name);
                txtGuanqia.setString(data.jifen);

                ui.setTouchEnabled(false);
                layIco.setTouchEnabled(false);
                layPh.setTouchEnabled(false);
                return ui;
            }

            if (me.rankData.myrank.rank < 0) {
                me.nodes.fnt_jifenph.setString("");
                me.ui.finds('wsb_jifenph').show();
            } else{
                me.nodes.fnt_jifenph.setString(me.rankData.myrank.rank);
                me.ui.finds('wsb_jifenph').hide();
            }

            me.ui.finds("txt_jifenph1").setString(me.rankData.myrank.jifen);

            if(me.rankData.ranklist.length < 1) {
                me.nodes.bg_zw.show();
                return;
            }else me.nodes.bg_zw.hide();

            me.maxDps = me.rankData.ranklist[0].dps;

            for (var i = 0; i < me.rankData.ranklist.length; i ++) {
                me.rankData.ranklist[i].rank = i + 1;
                me.nodes.listview1.pushBackCustomItem(f(me.list_1.clone(), me.rankData.ranklist[i]));
            }
            me.nodes.listview1.jumpToTop();
        },
        setRankPrize: function() {
            var me = this;
            var data = G.class.friend.getWeekprize().prize;

            function f(ui, data) {
                X.autoInitUI(ui);
                var layPh = ui.nodes.img_rank;
                var txtPh = ui.nodes.sz_phb;
                txtPh.removeAllChildren();
                layPh.removeAllChildren();
                var rank = data[0];
                if (rank[0] < 4) {
                    layPh.setBackGroundImage('img/public/img_paihangbang_' + rank[0] + '.png', 1);
                    layPh.show();
                    txtPh.hide();
                }else if(rank[0] > 100){
                    layPh.show();
                    txtPh.hide();
                    rank[0] == 101 && layPh.setBackGroundImage('img/public/img_paihangbang_4.png',1);
                    rank[0] == 201 && layPh.setBackGroundImage('img/public/img_paihangbang_5.png',1);
                    rank[0] == 501 && layPh.setBackGroundImage('img/public/img_paihangbang_6.png',1);
                    rank[0] == 1001 && layPh.setBackGroundImage('img/public/img_paihangbang_7.png',1);
                } else {
                    txtPh.setString(rank[0] + '-' +rank[1] );
                    txtPh.show();
                    layPh.hide();
                }
                ui.show();
                ui.nodes.panel_item.setPositionX(520);
                X.alignItems(ui.nodes.panel_item,data[1],'left',{touch:true});
                ui.show();

                return ui;
            }

            if(data.length < 1) {
                me.nodes.bg_zw.show();
                return;
            }else me.nodes.bg_zw.hide();

            for (var i = 0; i < data.length; i ++) {
                me.nodes.listview2.pushBackCustomItem(f(me.list_2.clone(), data[i]));
            }
            me.nodes.listview2.jumpToTop();
        },
        getRankData: function(callback) {
            var me = this;

            me.ajax("rank_open", [5], function (str, data) {
                if(data.s == 1) {
                    me.rankData = data.d;
                    callback && callback();
                }
            })
        },
        nextFight: function() {
            var me = this;
            G.frame.friend.getData(function() {
                G.ajax.send('friend_fight', [P.gud.uid, me.selectedData], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    cc.log('----------------->friend_fight',d.s);
                    if (d.s == 1) {
                        if (d.d.fightres.winside == 0) {
                            G.frame.fight_win_friendboss.once('in_over', function () {
                                G.frame.fanpai.data(d.d.flop).show();
                            });
                        }else{
                            G.frame.fight_fail_friendboss.once('in_over', function () {
                                G.frame.fanpai.data(d.d.flop).show();
                            });
                        }
                        X.cacheByUid('fight_hybs', me.selectedData);
                        G.frame.fight.data({
                            pvType: 'hybs',
                            pvid: me.DATA.bossdata.fightmap,
                            prize: d.d.prize,
                            dps: d.d.dps, 
                            jifen: d.d.jifen,
                            callback: function() {
                                me.nextFight();
                            },
                            endcallback: function() {
                                me.refreshPanel();
                            }
                        }).once('show', function() {
                            G.frame.yingxiong_fight.remove();
                        }).demo(d.d.fightres);
                        me.refreshPanel();
                    }else {
                        cc.log('----------------------->close');
                        X.uiMana.closeAllFrame();
                    }
                }, true);
            })
        },
        onOpen: function() {
            var me = this;
            
            X.viewCache.getView("ui_list5.json", function (list_1) {
                me.ui.addChild(list_1);
                list_1.hide();
                me.list_1 = list_1.nodes.list_rank;
                X.viewCache.getView("ui_list4.json", function (list_2) {
                    me.ui.addChild(list_2);
                    list_2.hide();
                    me.list_2 = list_2.nodes.list_rank;
                    me.bindBTN();
                    me.nodes.btn_rank.triggerTouch(ccui.Widget.TOUCH_ENDED);
                })
            });
            cc.enableScrollBar(me.nodes.listview1);
            cc.enableScrollBar(me.nodes.listview2);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.hide();
            me.ui.finds("txt_level").setString(L("JF"));
        },
        onShow: function() {
            var me = this;

            me.refreshPanel(true);
            me.nodes.txt_search.y = 506;
            me.nodes.txt_search.x = 432;
            me.nodes.txt_next.hide();
            me.nodes.txt_time.setTextColor(cc.color("#ffd460"));
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;
            if (JSON.stringify(me.DATA.bossdata) != '{}') {
                me.showBoss();
            } else {
                if (G.time < me.DATA.freetime) {
                    X.timeout(me.nodes.txt_time, me.DATA.freetime, function() {
                        me.refreshPanel();
                    }, null,null);
                    G.removeNewIco(me.nodes.btn_search);
                    me.nodes.txt_search.show();
                    me.nodes.btn_search.setBright(false);
                    me.nodes.btn_search.setTouchEnabled(false);
                    me.nodes.btn_search.finds('img_zhuzhan').loadTexture('img/public/img_zhuzhan_h.png', 1);
                    me.nodes.btn_search.finds('txt_battle').setTextColor(cc.color(G.gc.COLOR.n15));
                } else {
                    G.setNewIcoImg(me.nodes.btn_search, .9);
                    me.nodes.btn_search.setBright(true);
                    me.nodes.btn_search.setTouchEnabled(true);
                    me.nodes.txt_search.hide();
                    me.nodes.btn_search.finds('img_zhuzhan').loadTexture('img/public/img_zhuzhan.png', 1);
                    me.nodes.btn_search.finds('txt_battle').setTextColor(cc.color(G.gc.COLOR.n12));
                }
                me.showTreasure();
            }
            // var txt_jl = me.nodes.panel_reward.finds('txt_reward');
            // txt_jl.setPositionY(65);

        },
        showTreasure: function() {
            var me = this;
            me.nodes.panel_searched.hide();
            me.nodes.panel_content.show();
            me.nodes.btn_search.show();
            me.nodes.btn_battle.hide();
            me.nodes.panel_reward.hide();
            me.nodes.panel_searching.show();
            me.ui.finds("bg_ditu").loadTexture("img/bg/bg_hydt.png");
            // me.nodes.panel_searching.removeAllChildren();
        },
        showBoss: function() {
            var me = this;
            me.nodes.panel_searching.hide();
            me.nodes.panel_searched.show();
            me.nodes.panel_content.show();
            me.nodes.btn_search.hide();
            me.nodes.btn_battle.show();
            me.nodes.panel_reward.show();
            me.setBoss();
        },
        setBoss: function() {
            var me = this;
            var data = me.DATA.bossdata;
            var head = G.class.shead(data.fightdata.headdata, false);
            head.setAnchorPoint(0, 0);
            head.setPositionX(-15);
            me.nodes.ico_player.addChild(head);
            me.nodes.ico_player.setPositionX(15);
            me.ui.finds("txt_name￥").setString(data.fightdata.headdata.name);
            if (data.curhp == data.maxhp) {
                me.nodes.panel_searched.finds("img_jdt$").setPercent(100);
                me.nodes.jdt_time.setString('100%');
            } else {
                var per = data.curhp / data.maxhp * 100;
                me.nodes.panel_searched.finds("img_jdt$").setPercent(per);
                me.nodes.jdt_time.setString(per.toFixed(2) + '%');
            }
            G.frame.friend.getData(function() {
                me.nodes.panel_content.finds("txt_number$").setString(G.frame.friend.DATA.tiliinfo.num + '/' + 10);
                me.nodes.panel_content.finds("txt_number$").setPositionX(30);
            });

            me.nodes.panel_reward.show();
            var item = G.class.sitem(data.prize[0]);
            item.setAnchorPoint(0, 0);
            item.setScale(.8);
            me.nodes.ico_item.addChild(item);
        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('friend_treasureopen', [P.gud.uid], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        }
    });
})();