/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //
    var ID = 'yxzt_blcf';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
            });
            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
            });
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            X.timeout(me.nodes.txt_djs, G.DATA.asyncBtnsData.herotheme.etime, function () {
                G.tip_NB.show(L('HUODONG_HD_OVER'));
                me.remove();
            }, null, {
                showDay: true
            });
        },
        setContents: function () {
            var me = this;
            me.updateAttr();
            var data = X.keysOfObject(me.conf.libao);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview1, me.nodes.list_gai, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            // for (var i = 1; i < 6; i++) {
            //     var list = me.nodes.list_jd.clone();
            //     me.jdItem(list, data[i - 1]);
            //     me.nodes['panel_jd' + i].removeAllChildren();
            //     me.nodes['panel_jd' + i].addChild(list);
            // }
        },
        // jdItem: function (ui, data) {
        //     var me = this;
        //     X.autoInitUI(ui);
        //     ui.setPosition(cc.p(44.5, 50));
        //     ui.show();
        //     ui.nodes.txt_xj.setString(data.needstar);
        //     ui.nodes.img_xj1_1.setVisible();
        // },
        setItem: function (ui, id) {
            var me = this;
            var data = me.conf.libao[id];
            X.autoInitUI(ui);
            ui.show();
            var maxnum = data.buynum - (me.DATA.libao[id] || 0);
            X.render({
                txt_rwtj: function (node) {
                    node.setString(data.name);
                },
                txt_xg1: function (node) {
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('yxzt10'), maxnum),
                        color: "#fdf6e0",
                        size: 20,
                        outline: "#000000"
                    });
                },
                txt_qw: function (node) {
                    node.setString(X.STR(L('DOUBLE9'), data.money / 100));
                },
                panel_wp: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: 0.8,
                    });
                },
                btn_qw: function (node) {
                    node.id = id;
                    if(maxnum <= 0){
                        node.setBright(false);
                    }
                    node.click(function (sender) {
                        if(maxnum > 0){
                            G.event.once('paysuccess', function (txt) {
                                try {
                                    G.frame.jiangli.data({
                                        prize: data.prize
                                    }).show();
                                    if (!me.DATA.libao[sender.id]) {
                                        me.DATA.libao[sender.id] = 1;
                                    } else {
                                        me.DATA.libao[sender.id] += 1;
                                    }
                                    G.frame.yingxiongzhuti.DATA.myinfo = me.DATA;
                                    me.setContents();
                                } catch (e) { }
                            });
                            G.event.emit('doSDKPay', {
                                pid: data.proid,
                                logicProid: data.proid,
                                money: data.money,
                            });
                        }
                    })
                },
            }, ui.nodes);
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('buluocifu.json', ID);
})();