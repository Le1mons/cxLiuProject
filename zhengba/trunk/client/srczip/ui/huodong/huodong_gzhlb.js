/**
 * Created by LYF on 2019/6/24.
 */
(function () {
    //公众号礼包
    G.class.huodong_gzhlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_gongzhonghao.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            // X.alignItems(me.nodes.panel_jl, G.gc.gzhPrize, "left", {
            //     touch: true,
            //     scale: .85
            // });

             me.ui.finds('Text_5_0').hide();
            // me.nodes.panel_jl.hide();
             me.ui.finds('Text_5').setPosition(56,206);
             me.ui.finds('Text_5_1').y = 60;
             me.ui.finds('Text_5_1_0').y = 60;
             me.ui.finds('Text_5_1_0_0').y = 60;
             me.ui.finds('Text_5_1_0_0_0').y = 60;
             me.ui.finds('Text_5_1_0_0_1').y = 60;
             me.ui.finds('Text_5_1_0').setString(L('AHCS'));

            //改成所有东西纯ui显示

        },
        onRemove: function () {
            var me = this;
        },
    })
})();