/**
 * Created by LYF on 2019/7/15.
 */
(function () {
    //雕文-重置到目标技能
    var ID = 'diaowen_czdmbjn';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_shiyong.click(function () {

                me.remove();
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

            X.render({
                panel_wzms: me.data().str
            }, me.nodes);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('diaowen_czmbjn.json', ID);
})();