(function () {
    var ID = 'syzc_baoxiang';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.DATA = me.data();
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var conf = me.DATA.data.typename;
            me.nodes.panel_bx.removeBackGroundImage();
            me.nodes.panel_bx.removeAllChildren();
            G.class.ani.show({
                json:  "ani_shiyuanzcbx"+conf.image+"_dh",
                addTo:me.nodes.panel_bx,
                repeat: true,
                autoRemove: false,
                onload: function (aniNode, action) {
                    aniNode.setScale(2);
                    action.play('chuxian',false);
                    me.aniNode = aniNode;
                }
            });
            var color = G.class.getOwnNum(conf.need[0].t, conf.need[0].a) >= conf.need[0].n ? "#1c9700" : "#be5e30";
            var img = new ccui.ImageView(G.class.getItemIco(conf.need[0].t), 1);
            var rh = X.setRichText({
                str: X.STR(L('syzc_108'), color, X.fmtValue(G.class.getOwnNum(conf.need[0].t, conf.need[0].a)), conf.need[0].n),
                parent: me.nodes.txt_hd,
                node: img,
                size: 20,
                color: "#ffffff"
            });
            img.y =  img.y+4;
            rh.setPosition(me.nodes.txt_hd.width / 2 - rh.trueWidth() / 2, me.nodes.txt_hd.height / 2 - rh.trueHeight() / 2);
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_lan.click(function (sender) {
                me.DATA.callback();
            });
            me.nodes.mask.click(function (sender) {
                me.remove()
            });
            me.nodes.panel_ui.setTouchEnabled(false);
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_qb_tk2.json', ID);
})();