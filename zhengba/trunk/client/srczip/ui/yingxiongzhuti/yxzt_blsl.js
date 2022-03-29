/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //
    var ID = 'yxzt_blsl';

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
            me.DATA = me.data().myinfo;
            me.rank = me.data().rank;
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.panel_bg.setTouchEnabled(false);
            me.nodes.panel_gq.setTouchEnabled(false);
            me.bindBtn();
            me.setContents();
            me.setphb();
            me.setjiacheng();
        },
        setjiacheng: function () {
            var me = this;
            var rh = X.setRichText({
                parent: me.nodes.txt_sx,
                str: X.STR(L('yxzt7'), G.gc.hero['14065'].name),
                color: "#c5c1b2",
                size: 20,
                outline: "#000000"
            });
            var jiacheng = me.conf.herostarpro[me.DATA.val] || { "jifen": 0, "buff": 0 };
            var rh1 = X.setRichText({
                parent: me.nodes.txt_jc1,
                str: X.STR(L('yxzt8'), jiacheng.jifen / 10),
                color: "#fff8e1",
                size: 20,
                outline: "#000000"
            });
            var rh2 = X.setRichText({
                parent: me.nodes.txt_jc2,
                str: X.STR(L('yxzt9'), jiacheng.buff / 10),
                color: "#fff8e1",
                size: 20,
                outline: "#000000"
            });
            me.nodes.panel_zuo.click(function (sender) {
                G.frame.yxzt_blsl_tk.data(me.DATA.val).show();
            })
            G.class.ui_star_mask(me.nodes.panel_xx2, me.DATA.val, 0.8);
        },
        setphb: function () {
            var me = this;
            var data = me.rank.ranklist;
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_wjpm, 1, function (ui, data) {
                    me.setphbItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            me.nodes.btn_zk.click(function () {
                if (me.rank.ranklist.length != 0) {
                    G.frame.yxzt_rank.show();
                }
            });
            X.render({
                // txt_wj1: function (node) {
                //     var rh = X.setRichText({
                //         parent: node,
                //         str: X.STR(L('yxzt12'), str),
                //         color: "#ffffff",
                //         size: 20,
                //     });
                //     rh.setPosition(cc.p(0, -5));
                // },
                txt_fs1: function (node) {
                    node.setString(X.STR(L('yxzt11'), me.DATA.jifen));
                },
                txt_wjmz1: function (node) {
                    var str = me.rank.myrank == -1 ? L("yxzt13") : me.rank.myrank;
                    node.setString(str);
                },
            }, me.nodes);
        },
        setphbItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                // txt_wj: function (node) {
                //     var rh = X.setRichText({
                //         parent: node,
                //         str: X.STR(L('yxzt14'), data.rank, data.name),
                //         color: "#ffffff",
                //         size: 20,
                //     });
                //     rh.setPosition(cc.p(0, -5));
                // },
                txt_wjmz: function (node) {
                    node.setString(data.headdata.name);
                },
                txt_mc: function (node) {
                    node.setString(data.rank);
                },
                txt_fs: function (node) {
                    node.setString(X.STR(L('yxzt11'), data.val));
                },
            }, ui.nodes);
        },
        setContents: function () {
            var me = this;
            for (var i = 1; i < 6; i++) {
                me.nodes['panel_gq' + i].setTouchEnabled(false);
                var list = me.nodes.list.clone();
                me.setGuanka(list, i);
                me.nodes['panel_gq' + i].removeAllChildren();
                me.nodes['panel_gq' + i].addChild(list);
                if (X.inArray(me.DATA.shilian.win, i) && cc.isNode(me.nodes['jdt_jd' + i])) {
                    me.nodes['jdt_jd' + i].show();
                }
            }
            me.updateAttr();
        },
        jiesuoAni: function (id) {
            var me = this;
            if (id==5){
                me.setContents();
                return;
            }
            G.class.ani.show({
                json: 'yingxiongyure_guankajs_dh',
                addTo: me.nodes['panel_gq' + (id * 1 + 1)],
                x: 75,
                y: 100,
                repeat: true,
                autoRemove: false,
                onend: function (node, action, event) {
                    me.setContents();
                }
            })
        },
        setGuanka: function (ui, i) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.panel_zz.setTouchEnabled(false);
            ui.nodes.panel_tb.setTouchEnabled(false);
            ui.nodes.txt_tzcs.removeAllChildren();
            if (X.inArray(me.DATA.shilian.win, i)) {
                ui.nodes.panel_zz.hide();
                ui.nodes.img_suo.hide();
                ui.nodes.img_4.show();
                ui.nodes.txt_ytg.show();
                ui.setTouchEnabled(false);
            } else if (i == me.DATA.shilian.win.length + 1) {
                ui.nodes.panel_zz.hide();
                ui.nodes.img_suo.hide();
                ui.nodes.img_4.hide();
                ui.nodes.txt_ytg.hide();
                ui.setTouchEnabled(true);
            } else {
                ui.nodes.panel_zz.show();
                ui.nodes.img_suo.show();
                ui.nodes.img_4.hide();
                ui.nodes.txt_ytg.hide();
                ui.setTouchEnabled(false);
            }
            if (i == 5) {

                X.setHeroModel({
                    parent: ui.nodes.panel_zz,
                    data: { model: '5302001' },
                    scaleNum: 1
                });
                ui.nodes.txt_sl.setString(L('yxzt6'));
                ui.nodes.txt_ytg.hide();
                ui.setTouchEnabled(true);
                ui.nodes.img_4.hide();
                if (X.inArray(me.DATA.shilian.win, i)) {
                    var txtjf = ui.nodes.txt_tzcs;
                    var str1 = X.STR(L('yrhd_tip11'),me.DATA.shilian.fightnum);
                    var rh = new X.bRichText({
                        size: 18,
                        maxWidth: txtjf.width,
                        lineHeight: 24,
                        family: G.defaultFNT,
                        color: '#fef7e0',
                        eachText: function (node) {
                            X.enableOutline(node, "#311e00", 2);
                        }
                    });
                    rh.text(str1);
                    rh.setAnchorPoint(0.5, 0.5);
                    rh.setPosition(txtjf.width / 2, txtjf.height / 2);
                    txtjf.removeAllChildren();
                    txtjf.addChild(rh);
                }
            } else {
                ui.nodes.txt_sl.setString(X.STR(L('yxzt5'), i));
            }
            ui.id = i;

            ui.setPosition(cc.p(75, 95));
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.yxzt_blsl_gqjl.data({
                        id: sender.id,
                        shilian: me.DATA.shilian,
                    }).show();
                }
            })
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('buluoshilian.json', ID);
})();