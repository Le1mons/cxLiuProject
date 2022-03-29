(function () {
    var ID = 'szn_duihuan';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn.duihuan;
            me.conf = X.clone(G.class.szn.getduiHuan());
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var arr = [];
            for (var k in me.conf) {
                me.conf[k].key = k;
                arr.push(me.conf[k]);
            };
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            };
            me.setNeed(arr[0]);
        },
        setNeed: function (conf) {
            var me = this;
            var rh = X.setRichText({
                str: "拥有<font node=1></font>" + G.class.getOwnNum(conf.need[0].t, conf.need[0].a) + "个",
                parent: me.nodes.panel_yy,
                node: new ccui.ImageView(G.class.getItemIco(conf.need[0].t), 1),
                maxWidth: 300,
                color: "#f6ebcd",
                outline: "#000000"
            });
            rh.setPosition(0, me.nodes.panel_yy.height / 2 - rh.trueHeight() / 2);

        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var gotNum = me.DATA[data.key] || 0;
            X.render({
                item1: function (node) {
                    X.alignItems(node, data.need, "center", {
                        touch: true,
                        scale: 1
                    });

                },
                item2: function (node) {
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                        scale: 1
                    });

                },
                btn: function (node) {
                    node.setBright(data.maxnum > gotNum);
                    node.setTouchEnabled(data.maxnum > gotNum);
                    node.click(function (sender) {
                        G.frame.buying.data({
                            num: 1,
                            item: data.prize,
                            need: data.need,
                            maxNum: data.maxnum - gotNum,
                            callback: function (num) {

                                G.ajax.send('zhounian3_duihuan', [data.key,num], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        me.DATA = d.d.myinfo.duihuan;
                                        G.frame.jiangli.data({
                                            prize: d.d.prize
                                        }).show();
                                        me.setContents()
                                    }
                                }, true);
                            }
                        }).show();






                        // G.ajax.send('zhounian3_duihuan', [data.key], function (d) {
                        //     if (!d) return;
                        //     var d = JSON.parse(d);
                        //     if (d.s == 1) {
                        //         me.DATA = d.d.myinfo.duihuan;
                        //         G.frame.jiangli.data({
                        //             prize: d.d.prize
                        //         }).show();
                        //         me.setContents()
                        //     }
                        // }, true);
                    })

                },
                txt: function (node) {
                    node.setString(X.STR(L("szn_25"), data.maxnum - gotNum));

                },
            }, ui.nodes)
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
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_dh.json', ID);
})();