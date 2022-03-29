/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //部落战旗-战旗升级
    var ID = 'buluozhanqi_zqsj';

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

            me.nodes.btn_djs.setString(X.STR(L("XJ"), me.data()));

            me.nodes.panel_hz.hide();
            G.class.ani.show({
                json: "ani_zhanqi_huizhang",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setScale(2);
                    action.playWithCallback("in", false, function () {
                        action.play("changtai", true);
                    });
                }
            });
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('buluozhanqi_zqsj2.json', ID);
})();