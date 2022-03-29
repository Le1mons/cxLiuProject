/**
 * Created by LYF on 2018/11/16.
 */
(function () {
    //公会-探宝
    var ID = 'gonghui_tanbao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("GHTB"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show: function(conf) {
            var me = this;
            var _super = this._super;
            this.getData(function() {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            new X.bView("gonghui_tip2_ghtb.json", function (node) {
                me.nodes.panel_nr.addChild(node);
                me.view = node;
                me.setContents();
            })
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("gonghui", 1, function() {
                G.frame.gonghui_main.checkRedPoint();
            });
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('friend_treasureopen', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setBtn();
            me.setList();
            me.setViewBtn();
            me.setStamina();
        },
        setBtn: function() {
            var me = this;

            if(G.time < me.DATA.myinfo.freetime) {
                me.view.nodes.btn_tx.setBright(false);
                me.view.nodes.btn_tx.setTouchEnabled(false);
                me.view.nodes.txt_sxsj.show();
                X.timeout(me.view.nodes.txt_sxsj, me.DATA.myinfo.freetime, function () {
                    me.view.nodes.btn_tx.setBright(true);
                    me.view.nodes.btn_tx.setTouchEnabled(true);
                    me.view.nodes.txt_sxsj.hide();
                })
            } else {
                me.view.nodes.txt_sxsj.hide();
                if(me.DATA.myinfo.boss && JSON.stringify(me.DATA.myinfo.boss) != "{}") {
                    me.view.nodes.btn_tx.setBright(false);
                    me.view.nodes.btn_tx.setTouchEnabled(false);
                } else {
                    me.view.nodes.btn_tx.setBright(true);
                    me.view.nodes.btn_tx.setTouchEnabled(true);
                }

            }
        },
        setViewBtn: function () {
            var me = this;

            me.view.nodes.btn_damage_rank.click(function () {
                G.frame.friend_jifen_phb.show();
            });

            me.view.nodes.btn_help.click(function () {
                G.frame.help.data({
                    intr:L('TS13')
                }).show();
            });

            me.view.nodes.btn_damage_jifenjiangli.click(function () {
                G.frame.friend_jifen_pmjl.show();
            });

            me.view.nodes.btn_tx.click(function () {

                me.ajax("friend_treasure", [], function (str, data) {
                    if(data.s == 1) {
                        if(me.getListData().length < 1) {
                            G.class.ani.show({
                                json: "ani_haoyouboss",
                                addTo: me.view.finds("diban"),
                                x: me.view.finds("diban").width / 2,
                                y: me.view.finds("diban").height / 2,
                                repeat: false,
                                autoRemove: true,
                                onend: function () {
                                    if (data.d.treasure && data.d.treasure.prize && data.d.treasure.prize.length > 0) {
                                        G.frame.jiangli.data({
                                            prize: [].concat(data.d.treasure.prize)
                                        }).show();
                                        me.getData(function () {
                                            me.setBtn();
                                        });
                                    } else {
                                        me.getData(function () {
                                            G.tip_NB.show(L("SXDBS"));
                                            me.setList(true);
                                            me.setBtn();
                                        })
                                    }
                                }
                            })
                        } else {
                            if (data.d.treasure && data.d.treasure.prize && data.d.treasure.prize.length > 0) {
                                G.frame.jiangli.data({
                                    prize: [].concat(data.d.treasure.prize)
                                }).show();
                                me.getData(function () {
                                    me.setBtn();
                                });
                            } else {
                                me.getData(function () {
                                    G.tip_NB.show(L("SXDBS"));
                                    me.setList(true);
                                    me.setBtn();
                                });
                            }
                        }

                    }
                });
            }, 1500);
        },
        setStamina: function () {
            var me = this;
            var data = me.DATA.myinfo.tiliinfo;

            me.view.nodes.txt_number.setString(data.num + "/10");

            if(data.num < 10) {
                me.view.nodes.txt_tbsj.show();
                X.timeout(me.view.nodes.txt_tbsj, data.freetime, function () {
                    me.getData(function () {
                        me.setStamina();
                    });
                });
            }else {
                me.view.nodes.txt_tbsj.hide();
            }
        },
        setList: function (isTop) {
            var me = this;
            var data = me.getListData();

            if (data.length < 1) {
                me.view.finds("diban").show();
            } else {
                me.view.finds("diban").hide();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_instance, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8,12);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop? true : false);
            }
        },
        setItem: function(ui, data) {
            var me = this;

            X.autoInitUI(ui);

            ui.show();
            ui.nodes.txt_fxz.setString(L("FXZ") + data.headdata.name);
            ui.nodes.txt_name.setString(data.boss.headdata.name);
            ui.nodes.img_jdt.setPercent(data.boss.curhp / data.boss.maxhp * 100);
            ui.nodes.jdt_time.setString((data.boss.curhp / data.boss.maxhp * 100).toFixed(2) + "%");
            X.enableOutline(ui.nodes.jdt_time, "#895105", 2);

            if(P.gud.uid == data.headdata.uid) {
                ui.nodes.img_wdfx.show();
                ui.nodes.bg_wdfx.show();
            } else {
                ui.nodes.img_wdfx.hide();
                ui.nodes.bg_wdfx.hide();
            }

            if(data.elite) {
                ui.nodes.img_nandubiaoqian.show();
            } else {
                ui.nodes.img_nandubiaoqian.hide();
            }

            var head = G.class.shero(data.boss.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.removeAllChildren();
            ui.nodes.panel_tx.addChild(head);

            var conf = G.class.friend.getPrizeByLv(data.boss.headdata.lv, data.elite ? "elite":"common");
            var itemArr = P.gud.uid == data.headdata.uid ? conf.prize : conf.killprize;
            X.alignItems(ui.nodes.panel_jb, itemArr, "left", {
                touch: true,
                scale: .6
            });

            ui.nodes.btn_tz.f = function(sender) {
                G.ajax.send('friend_fight', [G.frame.gonghui_tanbao._uid, sender.selectedData], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        if (d.d.fightres.winside == 0) {
                            G.frame.fight_win_friendboss.once('in_over', function () {
                                if(d.d.flop) {
                                    G.frame.fanpai.data(d.d.flop).show();
                                }
                            });
                        }else{
                            G.frame.fight_fail_friendboss.once('in_over', function () {
                                if(d.d.flop) {
                                    G.frame.fanpai.data(d.d.flop).show();
                                }
                            });
                        }
                        me.getData(function () {
                            me.setList();
                            me.setStamina();
                            me.setBtn();
                        });
                        G.frame.fight.data({
                            pvType: 'hybs',
                            pvid: sender.fightMap,
                            prize: d.d.prize,
                            dps: d.d.dps,
                            jifen: d.d.jifen,
                            callback: function() {
                                sender.f(sender);
                            },
                        }).once('show', function() {
                            G.frame.yingxiong_fight.remove();
                        }).demo(d.d.fightres);
                    }else {
                        me.getData(function () {
                            me.setList();
                        })
                    }
                }, true);
            };
            ui.nodes.fightMap = G.class.friend.getPrizeByLv(data.boss.headdata.lv, data.elite ? "elite":"common").fightmap;
            ui.nodes.btn_tz.uid = data.headdata.uid;
            ui.nodes.btn_tz.click(function (sender) {
                if (me.DATA.myinfo.tiliinfo.num < 1) return G.tip_NB.show(L("TLBZ"));
                G.frame.fight.startFight({}, function(node) {
                    var selectedData = sender.selectedData = node.getSelectedData();
                    G.frame.gonghui_tanbao._uid = sender.uid;
                    G.ajax.send('friend_fight', [G.frame.gonghui_tanbao._uid, selectedData], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            if (d.d.fightres.winside == 0) {
                                G.frame.fight_win_friendboss.once('in_over', function () {
                                    if(d.d.flop) {
                                        G.frame.fanpai.data(d.d.flop).show();
                                    }
                                });
                            }else {
                                G.frame.fight_fail_friendboss.once('in_over', function () {
                                    if(d.d.flop) {
                                        G.frame.fanpai.data(d.d.flop).show();
                                    }
                                });
                            }
                            me.getData(function () {
                                me.setList();
                                me.setStamina();
                                me.setBtn();
                            });
                            X.cacheByUid('fight_hybs', selectedData);
                            G.frame.fight.data({
                                pvType: 'hybs',
                                pvid: sender.fightMap,
                                prize: d.d.prize,
                                dps: d.d.dps,
                                jifen: d.d.jifen,
                                callback: function() {
                                    sender.f(sender);
                                },
                            }).once('show', function() {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }else{
                            me.getData(function () {
                                me.setList();
                            })
                        }
                    }, true);
                }, "hybs")
            });
        },
        getListData: function () {
            var me = this;
            var arr = [];

            if(me.DATA.myinfo.boss && JSON.stringify(me.DATA.myinfo.boss) != "{}") {
                arr.push(me.DATA.myinfo);
            }
            for (var i = 0; i < me.DATA.data.length; i ++) {
                arr.push(me.DATA.data[i]);
            }

            return arr;
        }
    });
    G.frame[ID] = new fun('ui_tip4.json', ID);
})();