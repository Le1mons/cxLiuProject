/**
 * Created by LYF on 2019/1/19.
 */
(function () {
    //VIP礼包
    var ID = 'viplibao2';

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
            me.nodes.btn_gengduo.click(function () {
                cc.sys.openURL(G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v.split(',')[2]);
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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('viplibao2.json', ID);
})();
