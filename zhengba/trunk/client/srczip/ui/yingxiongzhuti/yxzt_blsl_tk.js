/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //战魂领进阶
    var ID = 'yxzt_blsl_tk';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.herotheme;
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            if (me.DATA >= 15) {
                me.nodes.panel_sxjc2.show();
                me.setmax()
            } else {
                me.nodes.panel_sxjc1.show();
                me.setNext()
            }
        },
        setNext: function () {
            var me = this;
            var star = me.DATA < 5 ? 5 : me.DATA+1;
            G.class.ui_star_mask(me.nodes.panel_xx1, me.DATA, 0.8, -5);
            G.class.ui_star_mask(me.nodes.panel_xx2, star, 0.8, -5);
            var jiacheng1 = me.conf.herostarpro[me.DATA] || { "jifen": 0, "buff": 0 };
            me.nodes.txt_jc1.setString(X.STR(L('yxzt18'), jiacheng1.jifen / 10));
            me.nodes.txt_jc2.setString(X.STR(L('yxzt19'), jiacheng1.buff / 10));
            var jiacheng2 = me.conf.herostarpro[star];
            me.nodes.txt_jc3.setString(X.STR(L('yxzt18'), jiacheng2.jifen / 10));
            me.nodes.txt_jc4.setString(X.STR(L('yxzt19'), jiacheng2.buff / 10));
        },
        setmax: function () {
            var me = this;
            // var star = me.DATA > 15 ? 15
            var jiacheng2 = me.conf.herostarpro[15];
            G.class.ui_star_mask(me.nodes.panel_xx3, 15, 0.8);
            me.nodes.txt_jc5.setString(X.STR(L('yxzt18'), jiacheng2.jifen / 10));
            me.nodes.txt_jc6.setString(X.STR(L('yxzt19'), jiacheng2.buff / 10));
        },
    });
    G.frame[ID] = new fun('buluolshilian_tk.json', ID);
})();