(function () {
    //情报事件弹窗
    var ID = 'syzc_qb';
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
            me.nodes.panel_rw2.removeAllChildren();
            me.nodes.txt_1.setString(conf.mingzi)
            X.spine.show({
                json: 'spine/' + conf.hero + '.json',
                addTo: me.nodes.panel_rw2,
                cache: true,
                x: 80,
                y:50,
                z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                }
            });
            var str = X.STR(L('syzc_107'), JSON.stringify(conf.need[0]), G.class.getItemConf(conf.need[0]).name)
            var rh = X.setRichText({
                parent: me.nodes.txt_ms1,
                color: "#480f00",
                str: X.STR(conf.wenben, str),
                size: 22
            });
            rh.x = 0;
            var item = G.class.sitem(conf.need[0]);
            item.setAnchorPoint(0, 0);
            G.frame.iteminfo.showItemInfo(item);
            me.nodes.panel_wp1.addChild(item);
            var item2 = G.class.sitem(conf.prize[0]);
            item2.setAnchorPoint(0, 0);
            G.frame.iteminfo.showItemInfo(item2);
            me.nodes.panel_wp2.addChild(item2);
            var color = G.class.getOwnNum(conf.need[0].t, conf.need[0].a) >= conf.need[0].n ? "#1c9700" : "#be5e30";
            var rh = X.setRichText({
                str: X.STR(L('syzc_108'), color, X.fmtValue(G.class.getOwnNum(conf.need[0].t, conf.need[0].a)), conf.need[0].n),
                parent: me.nodes.txt_hd,
                node: new ccui.ImageView(G.class.getItemIco(conf.need[0].t), 1),
                size: 20,
                color: "#804326"
            });
            rh.setPosition(me.nodes.txt_hd.width / 2 - rh.trueWidth() / 2, me.nodes.txt_hd.height / 2 - rh.trueHeight() / 2);

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
            })
            me.nodes.btn_lan.click(function (sender) {
                var conf = me.DATA.data.typename;
                if (G.class.getOwnNum(conf.need[0].t, conf.need[0].a) < conf.need[0].n) {
                    G.tip_NB.show(L("syzc_109"));
                    return
                }
                me.DATA.callback && me.DATA.callback();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_qb_tk1.json', ID);
})();