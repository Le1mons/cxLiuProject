(function () {
    var ID = 'shengdanjie_sdhl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.panel_lh.click(function () {
                G.frame.shengdanjie_sdhl_tk.show();
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.christmas;
            me.DATA = G.frame.shengdanjie.DATA;
            if(G.DATA.hongdian.christmas && G.DATA.hongdian.christmas.duihuan){
                X.cacheByDay(P.gud.uid, "sdj_duihuan", {});
            };
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.updateAttr();
            me.setContents();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        setContents: function () {
            var me = this;
            var data = X.keysOfObject(me.conf.duihuan);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            var rh = X.setRichText({
                parent: me.nodes.txt_sp,
                str: X.STR(L('sdj_sdhl2'), G.class.getOwnNum('5103', 'item')),
                color: "#ffeee1",
                size: 20,
                outline: "#320000"
            });
        },
        setItem: function (ui, id) {
            var me = this;
            var data = me.conf.duihuan[id];
            var maxnum = data.maxnum - (me.DATA.myinfo.duihuan[id] || 0);
            X.autoInitUI(ui);
            X.render({
                panel_wp2: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        // scale: 0.8,
                    });
                },
                panel_wp1: function (node) {
                    X.alignItems(node, data.need, 'left', {
                        touch: true,
                        // scale: 0.8,
                    });
                },
                txt_cs: function (node) {
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('sdj_sdhl1'), maxnum, data.maxnum),
                        color: "#ffeee1",
                        size: 15,
                        outline: "#320000"
                    });
                },
                btn_lq: function (node) {
                    node.id = id;
                    node.maxnum = maxnum;
                    var str = maxnum > 0 ? L("yxzt28") : L("yxzt22");
                    if (maxnum <= 0) {
                        node.setTitleColor(cc.color("#6c6c6c"));
                    }
                    node.setTitleText(str);
                    node.setBright(maxnum > 0);
                    node.setTouchEnabled(maxnum > 0);
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            // if (sender.maxnum == 1) {
                            //     G.ajax.send("christmas_duihuan", [sender.id, 1], function (str, data) {
                            //         if (data.s == 1) {
                            //             G.frame.jiangli.once('close', function () {
                            //                 // me.bindBtn();
                            //                 // G.hongdian.getData('herotheme');
                            //                 // G.frame.yingxiongzhuti.checkRedPoint();
                            //             }).data({
                            //                 prize: data.d.prize
                            //             }).show();
                            //             // me.DATA = data.d.myinfo;
                            //             // G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                            //             me.setContents();
                            //         }
                            //     });
                            // }else{
                            G.frame.yxzt_th_tk.data({
                                id: sender.id,
                                num: sender.maxnum,
                                conf: G.gc.christmas,
                                type: "sdj",
                            }).show();
                            // }

                        }
                    });
                },
            }, ui.nodes);
            if (maxnum > 0 && G.class.getOwnNum('5103', 'item') >= data.need[0].n) {
                G.setNewIcoImg(me.nodes.btn_lq);
                me.nodes.btn_lq.finds('redPoint').setPosition(125, 55);
                // X.cacheByDay(P.gud.uid, "shengdanjie_sdhl", true);
            } else {
                G.removeNewIco(me.nodes.btn_lq);
            }
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        },
    });
    G.frame[ID] = new fun('shengdanhaoli.json', ID);
})();