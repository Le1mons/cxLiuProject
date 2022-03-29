(function () {
    var ID = 'yxzt_jlyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            X.alignItems(me.nodes.panel_wp, me.DATA.prize, "center", {
                touch: true,
                scale: .9
            });
            // if(me.DATA.val){

            //     var rh1 = new X.bRichText({
            //         size: 20,
            //         maxWidth: me.nodes.panel_jf.width,
            //         lineHeight: 20,
            //         family: G.defaultFNT,
            //         color: G.gc.COLOR.n5,
            //     });
            //     rh1.text(X.STR(L('szn_1'), me.DATA.val));
            //     me.nodes.panel_jf.addChild(rh1);
            //     rh1.setPosition(me.nodes.panel_jf.width / 2 - rh1.trueWidth() / 2, me.nodes.panel_jf.height / 2 - rh1.trueHeight() / 2);
                
            // }
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_jlyl.json', ID);
})();