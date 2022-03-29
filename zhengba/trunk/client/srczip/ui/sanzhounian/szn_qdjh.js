(function () {
    var ID = 'szn_qdjh';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn;
            me.conf = X.clone(G.class.szn.getqdjh());
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var arr = [];
            for (var k in me.conf) {
                arr.push(me.conf[k])
            };
            if (me.table) {

                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            } else {
                cc.enableScrollBar(me.nodes.scrollview, false);
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 0, 0);
                table.setData(arr);
                table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                libao_cs: function (node) {
                    node.removeAllChildren();
                    var rh = X.setRichText({
                        str: X.STR(L("szn_11"), data.buynum - (me.DATA.libao1[data.proid] || 0)),
                        parent: node,
                        color: '#be5e30',
                        size: 20
                    });
                    rh.x = node.width / 2
                    rh.y = -10;
                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);

                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                        scale: .8
                    });

                },
                zs_wz: X.STR(L('DOUBLE9'), data.money / 100),
                btn_lq: function (node) {
                    node.show();
                    node.setBright(data.buynum > (me.DATA.libao1[data.proid] || 0))
                    node.setTouchEnabled(data.buynum > (me.DATA.libao1[data.proid] || 0))
                    node.click(function (sender) {

                        G.event.once('paysuccess', function (arg) {
                            G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            G.frame.szn_main.getData(function () {
                                me.DATA = G.DATA.szn;
                                me.setContents();
                            })
                        });
                        G.event.emit('doSDKPay', {
                            pid: data.proid,
                            logicProid: data.proid,
                            money: data.money,
                        });
                    })
                },
            }, ui.nodes)
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
                me.remove();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_qdjh.json', ID);
})();