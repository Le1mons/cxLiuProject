(function () {
    var ID = 'shengdanjie_sdhl_tk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.christmas;
            me.DATA = G.frame.shengdanjie.DATA;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        setContents: function () {
            var me = this;
            var data = X.keysOfObject(me.conf.libao);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, id) {
            var me = this;
            var data = me.conf.libao[id];
            var buynum = data.buynum - (me.DATA.myinfo.buylibao[id] || 0);
            X.autoInitUI(ui);
            X.render({
                txt_lw: function (node) {
                    node.setString(data.name);
                    X.enableOutline(node, '#320000', 2);
                },
                txet_y: function (node) {
                    if (buynum > 0) {
                        node.setString(X.STR(L('DOUBLE9'), data.money / 100));
                    } else {
                        node.setString(L('yxzt22'));
                        node.setTextColor(cc.color("#6c6c6c"));
                    }
                },
                txt_cs: function (node) {
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('sdj_sdhl1'), buynum, data.buynum),
                        color: "#ffeee1",
                        size: 15,
                        outline: "#320000"
                    });
                },
                panel_wp: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: 0.7,
                        // interval: -8,
                    });
                },
                btn_lq: function (node) {
                    node.data = data;
                    node.setBright(buynum > 0);
                    node.setTouchEnabled(buynum > 0);
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.event.once('paysuccess', function () {
                                G.frame.jiangli.data({
                                    prize: sender.data.prize
                                }).show();
                                if (me.DATA.myinfo.buylibao[id]) {
                                    me.DATA.myinfo.buylibao[id] += 1;
                                } else {
                                    me.DATA.myinfo.buylibao[id] = 1;
                                };
                                G.frame.shengdanjie.DATA.myinfo = me.DATA.myinfo;
                                G.frame.shengdanjie_sdhl.DATA.myinfo = me.DATA.myinfo;
                                me.setContents();
                                G.frame.shengdanjie_sdhl.setContents();
                                G.frame.shengdanjie_sdhl.updateAttr();
                            });
                            G.event.emit('doSDKPay', {
                                pid: sender.data.proid,
                                logicProid: sender.data.proid,
                                money: sender.data.money,
                            });
                        }
                    });
                },
            }, ui.nodes);
        }

    });
    G.frame[ID] = new fun('sdhd_tk3.json', ID);
})();