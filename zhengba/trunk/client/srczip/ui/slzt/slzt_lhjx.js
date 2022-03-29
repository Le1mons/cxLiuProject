(function () {
    var ID = 'slzt_lhjx';
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
            me.setContents()
        },
        setContents: function () {
            var me = this;
            me.nodes.txt_gl.setString(G.class.slzt.getGL(G.slzt.mydata.mirrornum)/10 + "%");
            var conf = G.class.slzt.getById(G.slzt.mydata.layer);
            X.alignItems(me.nodes.panel_wpsl, conf.mirrorprize, "center", {
                touch: true
            });
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk2.json', ID);
})();