/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'shipin_back';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_2.click(function () {
                me.ajax("shipin_back", [me.data().id, me.data().wear ? G.frame.yingxiong_xxxx.curXbId : ""], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).once("willClose", function () {
                            me.remove();
                        }).once("show", function () {

                        }).show();
                        me.ui.setTimeout(function () {
                            if (me.data().wear) {
                                G.frame.yingxiong_xxxx.emit('updateInfo');
                            } else {
                                G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                            }
                        }, 500);
                    }
                });
            }, 1000);
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            var conf = G.gc.shipin[me.data().id];
            var back = conf.back;

            me.nodes.text_yc2.setString(L("QD"));
            me.nodes.text_sl2.setString(back.need[0].n);
            me.nodes.panel_token2.setBackGroundImage(G.class.getItemIco(back.need[0].t), 1);

            X.alignCenter(me.nodes.panel_wp, back.prize, {
                touch: true
            });
        }
    });
    G.frame[ID] = new fun('ui_top_spti.json', ID);
})();