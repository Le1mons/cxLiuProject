/**
 * Created by on 2020-xx-xx.
 */
(function () {
    //
    var ID = 'tdFail';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        goToTop: function () {
            this.ui.zIndex = 100000 + 15;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_confirm2.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.remove();
                        G.frame.tdGame.remove();
                        X.cacheByUid("jumXYX", 1);
                    },
                    zIndex: 100000 + 100,
                    richText: L("TDTS")
                }).show();
            });

            me.nodes.btn_next2.click(function () {
                G.frame.tdGame.resetGame();
                me.remove();
            });

            me.nodes.btn_confirm.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();

            if (me.data() == 'jgsw' || me.data() == 'jstl') {
                me.nodes.btn_confirm2.hide();
                me.nodes.btn_next2.hide();
                me.nodes.btn_confirm.show();
                me.ui.finds('Text_1').setString(L("jgsw_fail"));
            }
        },
        onShow: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('zhandoushibai_2.json', ID);
})();