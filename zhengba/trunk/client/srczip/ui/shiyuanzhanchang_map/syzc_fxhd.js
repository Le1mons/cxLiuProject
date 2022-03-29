(function () {
    var ID = 'syzc_fxhd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = JSON.parse(me.data())
            me.setContents()
        },
        checkshow: function (data) {
            var me = this;
            var data
        },
        setContents: function () {
            var me = this;
            var conf = me.conf = G.gc.syzccom.questions[me.DATA.data.type];
            me.nodes.panel_rw2.removeAllChildren();
            me.nodes.txt_1.setString(conf.mingzi)
            X.spine.show({
                json: 'spine/' + conf.lihui + '.json',
                addTo: me.nodes.panel_rw2,
                cache: true,
                x: 80,
                y: 40,
                z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                }
            });
            me.nodes.txt_ms.setString(conf.content);
            var arr = [];
            for (var k in conf.answer) {
                var node = me.nodes.list.clone();
                X.autoInitUI(node);
                node.nodes.txt_xz.setString(conf.answer[k].intr);
                node.nodes.btn_xz.k = k
                node.nodes.btn_xz.setTouchEnabled(true);
                node.nodes.btn_xz.click(function (sender) {
                    me.sendxiaoxi(sender.k);
                })
                node.show()
                arr.push(node)
            }
            arr.reverse()
            X.verticalcenter(me.nodes.panel_2, arr, {
                itemHeight: me.nodes.list.height,
            })
        },
        sendxiaoxi: function (num) {
            var send = [];
            var me = this;
            if (me.DATA.data.name == P.gud.name) return G.tip_NB.show(L("syzc_105"))
            var send = ["1", me.DATA.pindao, '', '', '', "", X.cacheByUid("hideVip") ? 1 : 0,
                G.frame.chat.getProvince(), G.frame.chat.getCity(), { name: me.DATA.data.name, type: num, isask: false }];
            G.frame.chat.sendChat(send, function () {
                me.remove();
            });
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
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.panel_ui.setTouchEnabled(false);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_tk4.json', ID);
})();