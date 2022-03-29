/**
 * Created by lsm on 2018/6/22.
 */
(function() {
    //冠军的试炼
    var ID = 'jingjichang_guanjunshilian';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {
                action: true
            });
        },
        initUi: function() {
            var me = this;
            me.setBlackFrame();
            X.radio([me.nodes.btn_zyjj, me.nodes.btn_phb], function(sender) {
                var name = sender.getName();
                var name2type = {
                    btn_zyjj$: 1,
                    btn_phb$: 2
                };

                me.changeType(name2type[name]);
            });
        },
        setBlackFrame: function() {
            var me = this;
            var blackFrame = new ccui.Layout();
            var winsize = cc.director.getWinSize();
            blackFrame.setContentSize(winsize);
            blackFrame.setBackGroundColor(C.color('#000000'));
            blackFrame.setBackGroundColorOpacity(255 * 0.7);
            blackFrame.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            me.ui.addChild(blackFrame, -1);
        },
        bindBtn: function() {
            var me = this;

            //竞技奖励
            me.nodes.btn_jjjl.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.jingjichang_gj_prize.show();
                }
            });
            //战斗记录
            me.nodes.btn_zdjl.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.jingjichang_gj_fightreport.show();
                }
            });
            //防守阵容
            me.nodes.btn_fszr.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.setFSSZ();
                }
            });
            //返回
            me.nodes.btn_fh.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            //介绍
            me.nodes.btn_bz.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr: L('TS9')
                    }).show();
                }
            });

            var isopen = me.data();
            if (!isopen) {
                me.nodes.btn_fszr.setBright(false);
                me.nodes.btn_zdjl.setBright(false);
                me.nodes.btn_zdjl.setTouchEnabled(false);
                me.nodes.btn_fszr.setTouchEnabled(false);
            }

            //按钮名字
            me.nodes.text_zzjjc.setString(L('BTN_NAME_' + ID));
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
        show: function(conf) {
            var me = this;
            var _super = this._super;
            me.getData(function() {
                me.getRankData(function() {
                    _super.apply(me, arguments);
                });
            });
        },
        onShow: function() {
            var me = this;
            me.showToper();
            me.showMainMenu();
            me.showPanel();
        },
        showPanel: function() {
            var me = this;
            var isopen = me.data();
            if (!isopen) {
                me.nodes.btn_phb.triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.nodes.btn_zyjj.setColor(cc.color('#999999'));
                me.nodes.btn_zyjj.setTouchEnabled(false);
            } else {
                me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
        },
        getRankData: function(callback) {
            var me = this;
            G.ajax.send('rank_open', [4], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.rankData = d.d;
                    callback && callback();
                }
            });
        },
        onHide: function() {
            var me = this;
        },
        getData: function(callback, errCall) {
            var me = this;

            G.ajax.send('championtrial_open', [], function(d) {
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
        getEnemyData: function(type, callback) {
            var me = this;

            //type 0 不刷新，1刷新
            G.ajax.send('championtrial_choose', [type], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.enemyData = d.d.list;
                    callback && callback();
                }
            });
        },
        setContents: function() {
            var me = this;

        },
        changeType: function(type) {
            var me = this;

            if (me.curType && me.curType == type) {
                return;
            }

            me.curType = type;

            var viewConf = {
                "1": G.class.jingjichang_gjpk,
                "2": G.class.jingjichang_phb,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].show();
        },
        checkShow: function() {
            var me = this;

            me.getData(function() {
                me.once('show', function() {
                    // me.DATA.zhanli = 0;
                    me.checkIsShowFSZR();
                }).show();
            });
        },
        //判断是否显示防守阵容
        checkIsShowFSZR: function() {
            var me = this;

            var data = me.DATA;
            if (data.defhero.length < 1) {
                me.setFSSZ();
            }
        },
        //设置防守部队
        setFSSZ: function() {
            var me = this;

            G.frame.jingjichang_gjfight.once('show', function() {
                G.frame.jingjichang_gjfight.ui.nodes.mask.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        var defData = G.frame.jingjichang_gjfight.top.getDefendData();
                        var count = 0;
                        for (var k in defData) {
                            if (!defData[k]) {
                                count++
                            }
                        };
                        if (count < 3) {
                            if (me.DATA.defhero < 1) {
                                G.frame.jingjichang_gjfight.remove();
                                G.frame.jingjichang_guanjunshilian.remove();
                            } else {
                                G.frame.jingjichang_gjfight.remove();
                            }
                        } else {
                            G.frame.jingjichang_gjfight.remove();
                        }
                    }
                });
            }).data({
                type: 'defend',
                defendData: me.DATA.defhero,
                callback: function(node) {
                    var data = node.getDefendData();
                    if (data.length < 3) {
                        G.tip_NB.show(L('championtrial_defend_erro'));
                    } else {
                        G.ajax.send('championtrial_defend', [data], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                X.cacheByUid('fight_gjjjc', data);
                                G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                G.frame.jingjichang_gjfight.remove();
                                me.getData(function() {
                                    me._panels[me.curType].refreshPanel();
                                });
                            }
                        }, true, {
                            dataArr: data,
                            index: 0
                        });
                    }

                }
            }).show();
        }
    });

    G.frame[ID] = new fun('jingjichang_bg.json', ID);
})();