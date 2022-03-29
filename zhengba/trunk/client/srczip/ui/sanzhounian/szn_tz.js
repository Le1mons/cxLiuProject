(function () {
    var ID = 'szn_tz';
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
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var allHero = G.gc.npc[me.DATA.conf.npcid];
            var arr = [];
            me.nodes.tip_title.setString(X.STR(L('szn_15'),me.DATA.pos-1))
            allHero.forEach(function name(item, idx) {
                var widget = G.class.shero(item);
                arr.push(widget);
            });
            X.center(arr, me.nodes.panel_tx, {
                scale: 0.8
            });
            X.alignItems(me.nodes.panel_wpsl, me.DATA.conf.prize, "center", {
                touch: true,
                scale: 1
            });
            me.setcs()
        },
        setcs: function () {
            var me = this;
            var rh1 = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.panel_tzcs.width,
                lineHeight: 20,
                family: G.defaultFNT,
                color: "#804326",
            });
            var num = G.frame.znq_qdtz.getNum(me.DATA.conf.idx);
            var allnum = G.class.szn.getNum();
            rh1.text(X.STR(L('szn_22'),allnum > num ? "#1c9700" :"#c80000", allnum- num,allnum));
            me.nodes.panel_tzcs.removeAllChildren();
            me.nodes.panel_tzcs.addChild(rh1);
            rh1.setPosition(me.nodes.panel_tzcs.width - rh1.trueWidth(), me.nodes.panel_tzcs.height / 2 - rh1.trueHeight() / 2);

        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
            me.nodes.btn_qw.click(function (sender) {
                me.DATA.callback();
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_gk.json', ID);
})();