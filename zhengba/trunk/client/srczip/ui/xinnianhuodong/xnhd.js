/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd';
    var fun = X.bUi.extend({
        hxLen: 3,
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
                if (G.frame.xnhd_jg.isShow) G.frame.xnhd_jg.remove();
            });
            me.nodes.btn_1.click(function () {
                if (me.state == 'hx') {
                    if (me.selectArr.length < me.hxLen) return G.tip_NB.show(L("XNHD_HXNEED"));
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            me.ajax('herohot_haixuan', [me.selectArr], function (str, data) {
                                if (data.s == 1) {
                                    me.DATA.myinfo.haixuan = [].concat(me.selectArr);
                                    me.act_hx();
                                    G.hongdian.getData('herohot', 1);
                                }
                            });
                        },
                        richText: L("XNHD_HXQD"),
                        sizeType: 3
                    }).show();
                } else if (me.state == '32jin16' || me.state == '8jin4') {
                    if (me.DATA.myinfo.selecthid) {
                        G.frame.xnhd_tp.data({
                            num: 1,
                            need: G.gc.xnhd.toupiaoneed,
                            callback: function (num) {
                                me.ajax('herohot_toupiao', [num], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        me.getData(function () {
                                            me.state == '32jin16' ? me.set32Table() : me.set8Table();
                                            G.hongdian.getData('herohot', 1);
                                            me.checkRedPoint();
                                        });
                                    }
                                });
                            }
                        }).show();
                    } else {
                        if (!me.selecthid) return G.tip_NB.show(L("QXZYYYX"));
                        G.frame.alert.data({
                            cancelCall: null,
                            okCall: function () {
                                me.ajax('herohot_select', [me.selecthid], function (str, data) {
                                    if (data.s == 1) {
                                        me.DATA.myinfo.selecthid = me.selecthid;
                                        me.state == '32jin16' ? me.act_32jin16() : me.act_8jin4();
                                        G.hongdian.getData('herohot', 1);
                                    }
                                });
                            },
                            richText: L("YY_TIPS"),
                            sizeType: 3
                        }).show();
                    }
                }
            });
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr: L("TS85")
                }).show();
            });
            me.nodes.btn_yyrw.click(function () {
                G.frame.xnhd_yyrw.show();
            });
            me.nodes.btn_yyfl.click(function () {
                G.frame.xnhd_yyfl.show();
            });
            me.nodes.btn_yyb.click(function () {
                G.frame.xnhd_phb.show();
            });
            me.nodes.btn_mrlb.click(function () {
                G.frame.xnhd_mrlb.show();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
            me.allHero = me.getAllHero();
            cc.enableScrollBar(me.nodes.listview_zz);
            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.nodes.scrollview2);
            X.autoInitUI(me.nodes.panel_zhuangtai3);
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax('herohot_open', [G.DATA.asyncBtnsData.herohot.hdid], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onShow: function () {
            var me = this;

            me.getEventState();
            me.action.play('wait', true);

            if (me.DATA.day == 1 && X.cacheByUid('xnhd_ckjc')) {
                X.cacheByUid('xnhd_ckjc', 0);
            }
        },
        showTitle: function (imgPath) {
            this.nodes.bg_hx.show();
            this.nodes.panel_jd.setBackGroundImage(imgPath, 1);
        },
        getEventState: function () {
            if (!cc.isNode(this.ui)) return null;
            var me = this;
            var stime = G.DATA.asyncBtnsData.herohot.stime;
            var openTime = stime + X.getOpenTimeToNight(stime) - 24 * 3600;
            var showTxt = '';
            var toTime = 0;
            var toDayZeroTime = X.getTodayZeroTime();
            me.theFirstFour = false;
            me.state = '';
            me.nodes.btn_yyfl.setVisible(true);
            me.nodes.btn_yyb.setVisible(true);
            me.nodes.btn_mrlb.setVisible(true);
            me.nodes.btn_yyrw.setVisible(true);
            me.nodes.bg_hx.hide();

            var gsjg = '';
            if (G.time < openTime + 24 * 3600) {
                me.state = 'hx';
                if (G.time < toDayZeroTime + 22 * 3600) {
                    showTxt = L("XNHD_HXDJS");
                    toTime = toDayZeroTime + 22 * 3600;
                    me.showTitle('img/xinnianhuodong/img_hxjd.png');
                } else if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    showTxt = L("XNHD_JGTJ");
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                    me.showTitle('img/xinnianhuodong/img_hxjd.png');
                } else {
                    showTxt = L("XNHD_GSDJS");
                    toTime = toDayZeroTime + 24 * 3600;
                    me.state = 'gxgs';
                    gsjg = 'hx';
                }
                me.nodes.btn_yyrw.setVisible(false);
                me.nodes.btn_yyfl.setVisible(false);
                me.nodes.btn_yyb.setVisible(false);
                me.nodes.btn_mrlb.setVisible(false);
            } else if (G.time < openTime + 2 * 24 * 3600) {
                me.state = '32jin16';
                if (G.time < toDayZeroTime + 22 * 3600) {
                    showTxt = L("XNHD_32DJS");
                    toTime = toDayZeroTime + 22 * 3600;
                    me.showTitle('img/xinnianhuodong/img_16.png');
                } else if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    showTxt = L("XNHD_JGTJ");
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                    me.showTitle('img/xinnianhuodong/img_16.png');
                } else {
                    showTxt = L("XNHD_GSDJS");
                    toTime = toDayZeroTime + 24 * 3600;
                    me.state = 'gxgs';
                    gsjg = '16q';
                }
            } else if (G.time < openTime + 3 * 24 * 3600) {
                me.state = '32jin16';
                if (G.time < toDayZeroTime + 22 * 3600) {
                    showTxt = L("XNHD_16DJS");
                    toTime = toDayZeroTime + 22 * 3600;
                    me.showTitle('img/xinnianhuodong/img_8.png');
                } else if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    showTxt = L("XNHD_JGTJ");
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                    me.showTitle('img/xinnianhuodong/img_8.png');
                } else {
                    showTxt = L("XNHD_GSDJS");
                    toTime = toDayZeroTime + 24 * 3600;
                    me.state = 'gxgs';
                    gsjg = '8q';
                }
            } else if (G.time < openTime + 5 * 24 * 3600) {
                me.state = '8jin4';
                if (G.time < openTime + 4 * 24 * 3600 + 22 * 3600) {
                    showTxt = L("XNHD_8DJS");
                    toTime = openTime + 4 * 24 * 3600 + 22 * 3600;
                    me.showTitle('img/xinnianhuodong/img_4.png');
                } else if (G.time < openTime + 4 * 24 * 3600 + 22 * 3600 + 1800) {
                    showTxt = L("XNHD_JGTJ");
                    toTime = openTime + 4 * 24 * 3600 + 22 * 3600 + 1800;
                    me.showTitle('img/xinnianhuodong/img_4.png');
                } else {
                    me.theFirstFour = true;
                    showTxt = L("XNHD_GSDJS");
                    toTime = openTime + 5 * 24 * 3600;
                    me.state = 'gxgs';
                    gsjg = '4q';
                }
            } else if (G.time < openTime + 8 * 24 * 3600) {
                me.state = '8jin4';
                me.theFirstFour = true;
                if (G.time < openTime + 6 * 24 * 3600 + 22 * 3600) {
                    showTxt = L("XNHD_4DJS");
                    toTime = openTime + 6 * 24 * 3600 + 22 * 3600;
                    me.showTitle('img/xinnianhuodong/img_zjs.png');
                } else if (G.time < openTime + 6 * 24 * 3600 + 22 * 3600 + 1800) {
                    showTxt = L("XNHD_JGTJ");
                    toTime = openTime + 6 * 24 * 3600 + 22 * 3600 + 1800;
                    me.showTitle('img/xinnianhuodong/img_zjs.png');
                } else {
                    me.nodes.btn_mrlb.setVisible(false);
                    me.nodes.btn_yyrw.setVisible(false);
                    me.state = 'jsgs';
                    showTxt = L("XNHD_GSDJS");
                    toTime = openTime + 8 * 24 * 3600;
                }
            }
            me.nodes.txt_djs.setString(showTxt + ':');
            X.timeout(me.nodes.txt_sj, toTime, function () {
                me.getData(function () {
                    me.getEventState();
                });
            });
            G.frame.xnhd_jg.remove();
            cc.each(me.ui.finds('panel_bg').children, function (chr) {
                if (!X.inArray([
                    'Image_1', 'Image_2', 'txt_1', 'btn_bangzhu$', 'btn_yyrw$',
                    'txt_djs$', 'txt_sj$', 'Image_1_0', 'btn_yyfl$', 'btn_yyb$', 'btn_mrlb$', 'bg_hx$'
                ], chr.getName())) chr.hide();
            });

            me['act_' + me.state] && me['act_' + me.state](gsjg);
            me.checkRedPoint();
        },
        onHide: function () {
            G.hongdian.getData('herohot', 1);
        },
        checkRedPoint: function () {
            var me = this;
            var data = me.DATA.myinfo;

            //应援任务
            var taskRedPoint = false;
            for (var id in G.gc.xnhd.task) {
                var conf = G.gc.xnhd.task[id];
                if (data.task[id] && data.task[id] >= conf.pval && !X.inArray(data.taskrec, id)) {
                    taskRedPoint = true;
                    break;
                }
            }
            if (taskRedPoint) G.setNewIcoImg(me.nodes.btn_yyrw);
            else G.removeNewIco(me.nodes.btn_yyrw);

            //应援福利
            me.yyflRedObj = {};

            for (var fuliConf of G.gc.xnhd.fuli) {
                if (data.num >= fuliConf.val && !X.inArray(data.fuli, fuliConf.index)) {
                    me.yyflRedObj.fuli = true;
                    break;
                }
            }
            for (var sale of G.gc.xnhd.zhekou) {
                var buyNum = data.zhekou[sale.index] || 0;
                if (data.num >= sale.val && buyNum < sale.maxnum && !X.cacheByUid('xnhd_sale_' + sale.index)) {
                    me.yyflRedObj.sale = true;
                    break;
                }
            }
            if (me.DATA.day == 8 && G.time >= X.getTodayZeroTime() + 12 * 3600 && !X.cacheByUid('xnhd_ckjc')) {
                me.yyflRedObj.yyjc = true;
            }

            if (Object.keys(me.yyflRedObj).length > 0) G.setNewIcoImg(me.nodes.btn_yyfl);
            else G.removeNewIco(me.nodes.btn_yyfl);
        },
        checkIconState: function () {
            var me = this;
            var stime = G.DATA.asyncBtnsData.herohot.stime;
            var openTime = stime + X.getOpenTimeToNight(stime) - 24 * 3600;
            var toTime = 0;
            var str = L("RQZX");
            var toDayZeroTime = X.getTodayZeroTime();

            if (G.time < openTime + 24 * 3600) {
                if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                } else {
                    str = L("JGGB");
                    toTime = toDayZeroTime + 24 * 3600;
                }
            } else if (G.time < openTime + 2 * 24 * 3600) {
                if (G.time < toDayZeroTime + 12 * 3600) {
                    toTime = toDayZeroTime + 12 * 3600;
                } else if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    str = L("SBGX");
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                } else {
                    str = L("JGGB");
                    toTime = toDayZeroTime + 24 * 3600;
                }
            } else if (G.time < openTime + 3 * 24 * 3600) {
                if (G.time < toDayZeroTime + 12 * 3600) {
                    toTime = toDayZeroTime + 12 * 3600;
                } else if (G.time < toDayZeroTime + 22 * 3600 + 1800) {
                    str = L("SBGX");
                    toTime = toDayZeroTime + 22 * 3600 + 1800;
                } else {
                    str = L("JGGB");
                    toTime = toDayZeroTime + 24 * 3600;
                }
            } else if (G.time < openTime + 5 * 24 * 3600) {
                if (G.time < openTime + 4 * 24 * 3600 + 22 * 3600 + 1800) {
                    str = L("SBGX");
                    toTime = openTime + 4 * 24 * 3600 + 22 * 3600 + 1800;
                } else {
                    str = L("JGGB");
                    toTime = openTime + 5 * 24 * 3600;
                }
            } else if (G.time < openTime + 8 * 24 * 3600) {
                if (G.time < openTime + 6 * 24 * 3600 + 22 * 3600 + 1800) {
                    str = L("SBGX");
                    toTime = openTime + 6 * 24 * 3600 + 22 * 3600 + 1800;
                } else {
                    str = L("JGGB");
                    toTime = openTime + 8 * 24 * 3600;
                }
            }
            toTime && X.timeout(G.view.mainView.nodes.panel_xinnian, toTime, function () {
                me.checkIconState();
            });
            G.view.mainView.nodes.txt_xinnian.setString(str);
        }
    });
    G.frame[ID] = new fun('xinnianhuodong.json', ID);
})();