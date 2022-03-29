/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_apply';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS56")
                }).show();
            });

            me.nodes.btn_fszr.click(function () {
                G.frame.wujunzhizhan_def.show();
            });

            me.nodes.btn_baoming.click(function () {
                G.frame.wujunzhizhan_def.data({
                    apply: true
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var data = G.frame.wujunzhizhan.DATA;
            var state = G.frame.wujunzhizhan.getState();
            var btn_apply = me.nodes.btn_baoming;
            var img_ybm = me.nodes.img_ybm;
            var img_wbm = me.nodes.img_wbm;
            var img_wkq = me.nodes.img_wkq;
            var txt_layout = me.nodes.wz_4;

            btn_apply.setVisible(!data.signup && state.state == 'apply');
            img_ybm.setVisible(data.signup && X.inArray(['apply', 'applyEnd'], state.state));
            img_wbm.setVisible(!data.signup && state.state != 'apply' && data.signnum >= G.gc.wjzz.base.open);
            img_wkq.setVisible(state.state != 'apply' && data.signnum < G.gc.wjzz.base.open);

            if(txt_layout.__timeoutTimer){
                txt_layout.clearTimeout(txt_layout.__timeoutTimer);
                delete txt_layout.__timeoutTimer;
            }
            txt_layout.removeAllChildren();
            if (state.state == 'apply') {//当前报名期间内
                if (data.signnum < G.gc.wjzz.base.open) {//报名人数小于开启人数
                    var rh = X.setRichText({
                        str: L("DQBMRS") + "<font color=#2bdf02>" + data.signnum + "</font>",
                        parent: txt_layout,
                        color: "#fff8e1",
                        outline: "#000000"
                    });
                    rh.setPosition(txt_layout.width / 2 - rh.trueWidth() / 2,
                        txt_layout.height / 2 - rh.trueHeight() / 2);
                } else {
                    var thisWeekZeroTime = X.getLastMondayZeroTime();
                    var toTime = G.time < thisWeekZeroTime + 24 * 3600 ?
                        thisWeekZeroTime + 24 * 3600 : thisWeekZeroTime + 7 * 24 *3600 + 22 * 3600;
                    X.timeCountPanel(txt_layout, toTime, {
                        endCall: function () {
                            me.remove();
                        },
                        str: "{1} <font color=#fff8e1>" + L("HHDKQ") + "</font>"
                    });
                }
            } else {//不在报名期间内
                if (data.signnum < G.gc.wjzz.base.open) {//报名人数不足未开启
                    var rh = X.setRichText({
                        str: L("BMRSBZ"),
                        parent: txt_layout,
                        color: "#fff8e1",
                        outline: "#000000"
                    });
                    rh.setPosition(txt_layout.width / 2 - rh.trueWidth() / 2,
                        txt_layout.height / 2 - rh.trueHeight() / 2);
                } else {
                    if (data.signup) {//自己是否报了名
                        X.timeCountPanel(txt_layout, X.getLastMondayZeroTime() + 24 * 3600, {
                            endCall: function () {
                                me.remove();
                            },
                            str: "{1} <font color=#fff8e1>" + L("HHDKQ") + "</font>"
                        });
                    } else {
                        var rh = X.setRichText({
                            str: L("WJZZ_WFCY"),
                            parent: txt_layout,
                            color: "#fff8e1",
                            outline: "#000000"
                        });
                        rh.setPosition(txt_layout.width / 2 - rh.trueWidth() / 2,
                            txt_layout.height / 2 - rh.trueHeight() / 2);
                    }
                }
            }
        }
    });

    G.frame[ID] = new fun('wujunzhizhan_bm.json', ID);
})();