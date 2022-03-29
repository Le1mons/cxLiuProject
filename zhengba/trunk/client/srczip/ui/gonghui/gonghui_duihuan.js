/**
 * Created by LYF on 2019/8/27.
 */
(function () {
    //公会-兑换
    var ID = 'gonghui_duihuan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_wzms.setString(X.fmtValue((P.gud.lv - 150) * 20000 + 1000000));
            me.nodes.txt_jbslwz.setString(X.fmtValue((P.gud.lv - 150) * 20000 + 1000000));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_zzlbbtn.click(function () {

                me.ajax("gonghui_exchange", [], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        G.frame.gonghui_main.DATA.ischange = 1;
                        me.setButtonState();
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setButtonState();
        },
        onHide: function () {
            var me = this;
        },
        setButtonState: function () {
            var me = this;
            var isChange = G.frame.gonghui_main.DATA.ischange;

            me.nodes.btn_zzlbbtn.setEnableState(isChange ? false : true);
            me.nodes.txt_yuanshul.setString(isChange ? L("YDH") : L("DUIHUAN"));
            me.nodes.txt_yuanshul.setTextColor(cc.color(isChange ? "#6c6c6c" : "#2f5719"));

            if (isChange) {
                me.nodes.panel_djs.show();
                X.timeout(me.ui.finds("txt_sz"), X.getTodayZeroTime() + 24 * 3600, function () {
                    G.frame.gonghui_main.DATA.ischange = 0;
                    me.setButtonState();
                });
            } else {
                me.nodes.panel_djs.hide();
            }
        }
    });
    G.frame[ID] = new fun('gonghui_shangren.json', ID);
})();