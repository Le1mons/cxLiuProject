/**
 * Created by LYF on 2019/1/19.
 */
(function () {
    //VIP礼包
    var ID = 'viplibao';

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
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();

            G.class.ani.show({
                json: "ani_viprenzheng",
                addTo: me.ui.finds("Image_4"),
                x: me.ui.finds("Image_4").width / 2,
                y: me.ui.finds("Image_4").height / 2,
                repeat: true,
                autoRemove: false
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            for (var i = 1; i < 6; i ++) {
                me.nodes["txt_wz" + i].setString(L("VIP_" + i));
            }

            if(G.gameconfig.DATA["vipconfig_" + (G.owner || "")] && G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v) {
                var qq = G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v.split(",")[1];
                me.nodes.txt_kuqq.setString(L("KFQQ") + qq);
            }
        },
    });
    G.frame[ID] = new fun('viplibao.json', ID);
})();
