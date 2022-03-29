(function () {
    var ID = 'syzc_qbjf';
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
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var conf = me.DATA.data.typename;
            me.can = true;
            for (var i = 1; i < 6; i++) {
                var need = conf.need[i - 1];
                var node = me.nodes.list.clone();
                node.show();
                me.nodes["panel_wp" + i].addChild(node)
                X.autoInitUI(node);
                node.setPosition(me.nodes["panel_wp" + i].width / 2, me.nodes["panel_wp" + i].height/2);
                var prize = G.class.sitem(need);
                prize.setPosition(node.nodes.panel_wp.width / 2, node.nodes.panel_wp.height / 2);
                node.nodes.panel_wp.removeAllChildren();
                node.nodes.panel_wp.addChild(prize);
                G.frame.iteminfo.showItemInfo(prize);
                node.nodes.panel_zz.setVisible(G.class.getOwnNum(need.t, need.a) < need.n)
                if (G.class.getOwnNum(need.t, need.a) < need.n) {

                    me.can = false;
                }
            }
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_h.click(function (sender) {
                me.remove()
            });
            me.nodes.btn_lan.click(function (sender) {
                if (!me.can) return G.tip_NB.show(L("syzc_109"));
                me.showAni(function () {
                    me.DATA.callback();
                    me.remove()
                });
            })
        },
        showAni:function(callback){
            var me = this;
            var parent = me.ui.finds('panel_tip');
            G.class.ani.show({
                json: "ani_shiyuanzcqbhj_dh",
                addTo: parent,
                y:244,
                repeat: false,
                autoRemove: true,
                onkey: function (node, action, event) {
                    if(event == "hit") {
                        callback && callback();
                    }
                }
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_qb_tk4.json', ID);
})();