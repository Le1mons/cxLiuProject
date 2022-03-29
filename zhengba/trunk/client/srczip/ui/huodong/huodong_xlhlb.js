/**
 * Created by LYF on 2019/6/24.
 */
(function () {
    //小蓝盒礼包
    G.class.huodong_xlhlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_xiaolanhe.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_1.click(function () {

                cc.sys.openURL("https://www.kingcheergame.cn/bluebox/index.html");
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.alignItems(me.nodes.panel_jl, G.gc.xlhPrize, "left", {
                touch: true
            });
        },
        onRemove: function () {
            var me = this;
        },
    })
})();