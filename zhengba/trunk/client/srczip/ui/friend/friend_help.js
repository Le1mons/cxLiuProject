/**
 * Created by lsm on 2018-07-09
 */
(function() {
    //好友助阵
    var ID = 'friend_help';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        refreshPanel: function() {
            var me = this;
            me.getData(function() {
                me.setContents();
            });
        },
        bindUI: function() {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('DIREN'));

            me.nodes.mask.click(function() {
                me.remove();
            });
        },
        onOpen: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;
            me.bindUI();

            new X.bView('friend_tip2_battle.json', function(view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();

                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.cuiUid = me.data();
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('friend_treasureopen', [me.cuiUid], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        },
        setContents: function() {
            var me = this;
            var panel = me._view;
            me.setBoss();
            panel.nodes.btn_battle.click(function(sender) {
                G.frame.fight.startFight({}, function(node) {
                    var selectedData = me.selectedData = node.getSelectedData();
                    Fight(me.cuiUid, selectedData);
                }, "hybs")
            });

            function Fight(uid, seleted) {
                G.ajax.send('friend_fight', [uid, seleted], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        if (d.d.fightres.winside == 0 && d.d.flop) {
                            G.frame.fight_win_friendboss.once('in_over', function () {
                                if(d.d.flop) {
                                    G.frame.fanpai.data(d.d.flop).show();
                                }
                            });
                        }else if(d.d.flop){
                            G.frame.fight_fail_friendboss.once('in_over', function () {
                                G.frame.fight_fail_friendboss.ui.nodes.panel_btn.hide();
                                if(d.d.flop) {
                                    G.frame.fanpai.data(d.d.flop).show();
                                }
                            });
                        }
                        X.cacheByUid('fight_hybs', seleted);
                        G.frame.fight.data({
                            pvType: 'pvfb',
                            prize: d.d.prize,
                            dps: d.d.dps,
                            jifen: d.d.jifen,
                            callback: function() {
                                G.frame.fight_fail_friendboss.ui.nodes.panel_btn.hide();
                                G.frame.friend.getData(function() {
                                    Fight(uid, seleted);
                                });
                            },
                            endcallback: function() {
                                G.frame.friend._panels[1].refreshPanel();
                                me.remove();
                            },
                        }).once('show', function() {
                            G.frame.yingxiong_fight.remove();
                        }).demo(d.d.fightres);
                    }else{
                        X.uiMana.closeAllFrame();
                    }
                }, true);
            }
        },
        setBoss: function() {
            var me = this;
            var data = me.DATA.bossdata;
            var panel = me._view;
            var head = G.class.shead(data.fightdata.headdata, false);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(head.width / 2, head.height / 2);
            panel.nodes.ico_player.addChild(head);
            if (data.curhp == data.maxhp) {
                panel.nodes.img_jdt.setPercent(100);
                panel.nodes.time_jdt.setString('100%');
            } else {
                var per = data.curhp / data.maxhp * 100;
                panel.nodes.img_jdt.setPercent(per);
                panel.nodes.time_jdt.setString(per.toFixed(2) + '%');
            }
            G.frame.friend.getData(function() {
                panel.nodes.txt_number.setString(G.frame.friend.DATA.tiliinfo.num + '/' + 10);
                if (G.frame.friend.DATA.tiliinfo.num < 10) {
                    panel.nodes.txt_countdown.show();
                    me.tiemr = X.timeout(panel.nodes.txt_countdown, G.frame.friend.DATA.tiliinfo.freetime, function() {
                        G.frame.friend_help.isShow && me.refreshPanel();
                    }, null, null);
                } else {
                    if(me.tiemr) delete me.tiemr;
                    panel.nodes.txt_countdown.hide();
                }
            })


        },

        onRemove: function() {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();