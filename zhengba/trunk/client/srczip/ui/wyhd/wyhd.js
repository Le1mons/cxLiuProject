/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['wuyipaidui1.png', 'wuyipaidui1.plist'];
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.DATA = undefined;
            delete me.DATA;
            me.getData(function () {
                _super.apply(me);
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax('labour_open', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();


            me.setTime();
        },
        setTime: function () {
            var me = this;
            var rtime = G.DATA.asyncBtnsData.labour.rtime;
            var etime = G.DATA.asyncBtnsData.labour.etime;

            if (G.time < rtime) {
                X.timeout(me.nodes.txt_cs, rtime, function () {
                    me.setTime();
                }, null, {
                    showDay: true
                });
            } else {
                me.eventEnd = true;
                me.ui.finds('Text_5').setString(L("DUIHUAN") + L("DJS") + ':');
                X.timeout(me.nodes.txt_cs, etime, function () {
                    me.setTime();
                }, null, {
                    showDay: true
                });
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.panel_dhsd.setTouchEnabled(true);
            me.nodes.panel_dhsd.click(function () {
                G.frame.wyhd_dh.show();
            });

            me.nodes.panel_jrlb.setTouchEnabled(true);
            me.nodes.panel_jrlb.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
                G.frame.wyhd_sl.show();
            });

            me.nodes.panel_mrrw.setTouchEnabled(true);
            me.nodes.panel_mrrw.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
                G.frame.wyhd_rw.show();
            });

            me.nodes.panel_hlcj.setTouchEnabled(true);
            me.nodes.panel_hlcj.click(function () {
                G.frame.wyhd_cj.show();
                G.view.mainView.nodes.panel_wuyi.firstDuiHuanRed = true;
                G.hongdian.checkWuYi();
                me.checkRedPoint();
            });

            me.nodes.panel_ldsl.setTouchEnabled(true);
            me.nodes.panel_ldsl.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
                G.frame.wyhd_lb.show();
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS88')
                }).show();
            });
        },
        checkRedPoint: function () {
            var me = this;
            var data = G.DATA.hongdian.labour || {};

            if (data.task) {
                G.setNewIcoImg(me.nodes.panel_mrrw);
                me.nodes.panel_mrrw.redPoint.setPosition(233, 108);
            } else {
                G.removeNewIco(me.nodes.panel_mrrw);
            }

            if (data.boss) {
                G.setNewIcoImg(me.nodes.panel_jrlb);
                me.nodes.panel_jrlb.redPoint.setPosition(191, 52);
            } else {
                G.removeNewIco(me.nodes.panel_jrlb);
            }

            var need = G.gc.wyhd.lotteryneed[0];
            if (!G.view.mainView.nodes.panel_wuyi.firstDuiHuanRed && G.class.getOwnNum(need.t, need.a) > 0) {
                G.setNewIcoImg(me.nodes.panel_hlcj);
                me.nodes.panel_hlcj.redPoint.setPosition(199, 8);
            } else {
                G.removeNewIco(me.nodes.panel_hlcj);
            }
        }
    });
    G.frame[ID] = new fun('wuyipaidui.json', ID);
})();