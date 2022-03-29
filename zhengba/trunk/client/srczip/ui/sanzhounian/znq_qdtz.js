(function () {
    G.class.znq_qdtz = X.bView.extend({
        ctor: function (data) {
            var me = this;
            G.frame.znq_qdtz = me;
            me._super('zhounianqing_tz.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            // me.type = 1;
            me.setContents(1)
        },
        setContents: function (idx) {
            var me = this;
            if (me.type == idx) return;
            me.type = idx;
            var viewConf = {
                "1": G.class.znq_qdtz1,
                "2": G.class.znq_qdtz2,
            };
            me.nodes.btn_you.setVisible(me.type != 2);
            me.nodes.btn_zuo.setVisible(me.type != 1);
            me.nodes.txt_zj.setString(X.STR(L('szn_14'), me.type));
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[idx])) {
                cc.log('type...', idx);
                me._panels[idx] = new viewConf[idx](idx);
                me.nodes.panel_gk.addChild(me._panels[idx]);
            } else {
                me._panels[idx].show();
            }
        },
        getNum: function (idx) {
            var me = this;
            var data = G.DATA.szn.guankarec.fightnum;
            return data || 0
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
        },
        reSetView: function () {
            var me = this;
            me.show()
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_you.click(function (sender) {
                var num = G.class.szn.get().guankaopen[2]
                if (G.DATA.asyncBtnsData.zhounian3.stime + (num - 1) * 24 * 3600 > G.time) {
                    G.tip_NB.show(X.STR(L('szn_27'), num))
                    return
                }
                me.setContents(2)
            })
            me.nodes.btn_zuo.click(function (sender) {

                me.setContents(1)
            });
            me.nodes.btn_dh.click(function (sender) {
                G.frame.szn_duihuan.show();
            })
            me.nodes.btn_qdjh.click(function (sender) {
                if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                    G.tip_NB.show(L('szn_26'));
                    return
                }
                G.frame.szn_qdjh.once("close", function () {
                }).show()
            })
        },
    });
})();
