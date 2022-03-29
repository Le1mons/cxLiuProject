/**
 * Created by wfq on 2018/6/19.
 */
(function() {
    //自由竞技场
    var ID = 'jingjichang_freepk';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me.fullScreen = true;
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
                    G.frame.jingjichang_freepk_jjjl.show();
                }
            });
            //战斗记录
            me.nodes.btn_zdjl.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.jingjichang_fightreport.show();
                }
            });
            //防守阵容
            me.nodes.btn_fszr.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.setFSSZ();
                }
            },null,{touchDelay:1000});
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
                me.nodes.btn_zdjl.setBright(false);
                me.nodes.btn_zdjl.setTouchEnabled(false);
            }
        },
        onOpen: function() {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.isFight = me.data();
        },
        onAniShow: function() {
            var me = this;
        },
        show: function(conf) {
            var me = this;
            var _super = this._super;
            me.getRankData(function() {
                _super.apply(me, arguments);
            });
        },
        onShow: function() {
            var me = this;

            me.showToper();
            me.ui.setTimeout(function() {
                G.guidevent.emit('jingjichang_freepkOpenOver');
            }, 200);
            var isopen = me.data();
            if (!isopen) {
                me.nodes.btn_phb.triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.nodes.btn_zyjj.setColor(cc.color('#999999'));
                me.nodes.btn_zyjj.setTouchEnabled(false);
            } else {
                me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
            
            // me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
            // // });
            // me.getRankData();
        },
        getRankData: function(callback) {
            var me = this;
            G.ajax.send('rank_open', [3], function(d) {
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
            me.event.emit('hide');
        },
        getData: function(callback, errCall) {
            var me = this;

            G.ajax.send('zypkjjc_open', [], function(d) {
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
            G.ajax.send('zypkjjc_choose', [type], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    if (type == 1) me.isSX = true;
                    me.enemyData = d.d.enemy;
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
                "1": G.class.jingjichang_pk,
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
                    me.ui.setTimeout(function () {
                        me.checkIsShowFSZR();
                    }, 200);
                }).show();
            });
        },
        //判断是否显示防守阵容
        checkIsShowFSZR: function() {
            var me = this;

            var data = me.DATA;
            if (data.zhanli < 1) {
                me.setFSSZ();
            }
        },
        //设置防守部队
        setFSSZ: function() {
            var me = this;

            G.frame.yingxiong_fight.once('show', function() {
                G.frame.yingxiong_fight.ui.nodes.mask.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        var defData = G.frame.yingxiong_fight.top.getSelectedData();

                        if (!defData) {
                            G.frame.yingxiong_fight.remove();
                        } else {
                            if (me.DATA.zhanli > 1) {
                                G.frame.yingxiong_fight.remove();
                            } else {
                                G.frame.yingxiong_fight.remove();
                                G.frame.jingjichang_freepk.remove();
                            }

                        }
                    }
                });
            }).data({
                callback: function(node) {
                    var data = node.getSelectedData();
                    G.ajax.send('zypkjjc_defend', [data], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            X.cacheByUid('fight_zyjjc', data);
                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                            G.frame.yingxiong_fight.remove();
                            me.getData(function() {
                                me._panels[me.curType].refreshPanel(1);
                            });
                            G.DATA.yingxiong.jjchero = [];
                            for (var k in data) {
                                if (G.DATA.yingxiong.list[data[k]]) G.DATA.yingxiong.jjchero.push(data[k]);
                            }
                        }
                    }, true);
                },
                pvType:"jjcfszr",
                defhero: me.DATA.defhero
            }).show();
        },
    });

    G.frame[ID] = new fun('jingjichang_bg.json', ID);
})();