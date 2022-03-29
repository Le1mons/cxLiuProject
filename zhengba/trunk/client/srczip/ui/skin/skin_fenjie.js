(function () {
    var ID = 'skin_fenjie';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.num = 1;
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var prize = G.gc.skin[me.data().id].fenjieprize[0];
            var wid = G.class.sitem(prize);
            me.nodes.panel_1.addChild(wid);
            wid.setPosition(me.nodes.panel_1.width / 2, me.nodes.panel_1.height / 2);
            G.frame.iteminfo.showItemInfo(wid);
            me.nodes.textfield_5.setTextHorizontalAlignment(1);
            me.nodes.textfield_5.setTextVerticalAlignment(1);
            me.nodes.textfield_5.setString(me.num);
            var arr = [
                { node: "btn_1", key: -1, },
                { node: "btn_2", key: 1, },
                { node: "btn_jian10", key: -10, },
                { node: "btn_jia10", key: 10, }];
            arr.forEach(function name(item, idx) {
                me.nodes[item.node].click(function (sender) {
                    me.reSetNum(item.key);
                })
            })
            me.nodes.btn_qd.click(function (sender) {
                me.data().callback && me.data().callback(me.num);
                me.remove();
            })
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
        },
        reSetNum: function (num) {
            var me = this;
            if (me.num + num > me.data().max) {
                me.num = me.data().max
            } else if (me.num + num < 1) {
                me.num < 1
            } else {
                me.num += num
            };
            me.nodes.textfield_5.setString(me.num);
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
    G.frame[ID] = new fun('pifu_top_fj.json', ID);
})();