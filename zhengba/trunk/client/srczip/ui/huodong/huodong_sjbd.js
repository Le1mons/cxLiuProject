/**
 * Created by LYF on 2019/7/15.
 */
(function () {
    //手机绑定礼包
    G.class.huodong_sjbd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_bandinshouji.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_1.click(function () {

                cc.sys.openURL("https://i.anfeng.com/act/_fe5bcc");
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.alignItems(me.nodes.panel_jl, G.gc.sjbdPrize, "left", {
                touch: true
            });
        },
        onRemove: function () {
            var me = this;
        },
    })
})();