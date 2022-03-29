/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //雕文提升
    var ID = 'diaowen_tisheng';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            X.radio([me.nodes.btn_jl1, me.nodes.btn_dwrl1], function (sender) {
                var nameType = {
                    btn_jl1$: 1,
                    btn_dwrl1$: 2
                };

                me.changeType(nameType[sender.getName()]);
            });
        },
        changeType: function(type) {
            var me = this;
            var viewConf = {
                1: G.class.diaowenjinglian,
                2: G.class.diaowenronglian
            };

            var view = new viewConf[type];
            me.nodes.panle_nr.addChild(view);

            if(me.view) me.view.removeFromParent();
            me.view = view;
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

            me.showToper();
            me.nodes.btn_jl1.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_diaowen_nr.json', ID);
})();