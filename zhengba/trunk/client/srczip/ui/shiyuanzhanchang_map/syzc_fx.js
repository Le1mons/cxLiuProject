(function () {
    var ID = 'syzc_fx';
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
            me.bindBtn()
        },
        sendxiaoxi: function (type) {
            var send = [];
            var me = this;
            var send = [G.gc.syzccom.chatcontent, type, '', '', '', "", X.cacheByUid("hideVip") ? 1 : 0,
            G.frame.chat.getProvince(), G.frame.chat.getCity(), { name: P.gud.name, type: me.data().idx, isask: true }];
            G.frame.chat.sendChat(send, function () {
                G.tip_NB.show(L('FSCG'));
                me.remove();
            });
        },

        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            var arr = [6, 2];
            var obj = {
                6: "btn_ts",
                2: "btn_sj",
                3: "btn_gh",
                4: "btn_kf",
            };
            var arrb = [];
            if (P.gud.ghid) arr.push(3);
            if (G.frame.chat.openConfig[4]()) arr.push(4);
            for (var i = 0; i < arr.length; i++) {
                var node = me.nodes.list_btn.clone();
                X.autoInitUI(node);
                node.nodes.btn_ts.loadTextureNormal("img/shiyuanzhanchang/" + obj[arr[i]] + ".png", 1);
                node.nodes.btn_ts.k = arr[i];
                node.nodes.txt_ts.setString(L("syzc_100_" + arr[i]))
                node.nodes.btn_ts.click(function (sender) {
                    me.sendxiaoxi(sender.k);
                })
                node.show()
                arrb.push(node)
            }
            X.center(arrb, me.nodes.panel_btn);
            me.nodes.mask.click(function (sender) {
                me.remove()
            });
            me.nodes.ui.setTouchEnabled(false);
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_fx.json', ID);
})();