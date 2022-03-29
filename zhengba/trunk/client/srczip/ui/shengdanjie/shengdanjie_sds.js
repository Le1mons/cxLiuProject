(function () {
    var ID = 'shengdanjie_sds';
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
            me.nodes.btn_lan.setTouchEnabled(false);
            me.nodes.panel_btn1.click(function () {
                var num = me.DATA.myinfo.liwu.rec.length;
                if ((me.liwu - num) > 0) {
                    G.ajax.send("christmas_zhuangshi", [], function (str, data) {
                        if (data.s == 1) {
                            G.frame.jiangli.once('close', function () {

                            }).data({
                                prize: data.d.prize
                            }).show();
                            me.DATA.myinfo = data.d.myinfo;
                            G.frame.shengdanjie.DATA.myinfo = data.d.myinfo;
                            me.setContents();
                            G.frame.shengdanjie.checkRedPos();
                        }
                    });
                } else {
                    G.tip_NB.show(L("sdj_sdhl5"));
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.christmas;
            me.DATA = G.frame.shengdanjie.DATA;

            // if(G.DATA.hongdian.christmas && G.DATA.hongdian.christmas.tree){
            // };
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.updateAttr();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            for (var i = 0; i < 6; i++) {
                var list = me.nodes.list_lw.clone();
                me.setItem(list, i + 1);
                list.setPosition(cc.p(me.nodes['panel_lw' + (7 - i)].width / 2, me.nodes['panel_lw' + (7 - i)].height / 2));
                me.nodes['panel_lw' + (7 - i)].removeAllChildren();
                me.nodes['panel_lw' + (7 - i)].addChild(list);
            };

            me.liwu = 0;
            for (var k in me.DATA.myinfo.liwu.data) {
                if (me.DATA.myinfo.liwu.data[k] >= me.conf.liwu[k].pval) {
                    me.liwu++;
                };
            };

            var rh = X.setRichText({
                parent: me.nodes.txt_sp,
                str: X.STR(L('sdj_sdhl4'), me.liwu, 7),
                color: "#fff4ec",
                size: 20,
                outline: "#431100"
            });

            me.nodes.txt_lw1.setString(me.conf.liwu[7].intr);
            me.nodes.img_ylq1.setVisible(X.inArray(me.DATA.myinfo.liwu.rec, 7));

            if (me.liwu - me.DATA.myinfo.liwu.rec.length > 0) {
                G.setNewIcoImg(me.nodes.panel_btn1);
                me.nodes.panel_btn1.finds('redPoint').setPosition(160, 55);
            } else {
                G.removeNewIco(me.nodes.panel_btn1);
            };

            if (me.liwu >= 7) {
                G.class.ani.show({
                    json: 'shengdan_tree_dh',
                    addTo: me.nodes.bg,
                    repeat: true,
                    autoRemove: false,
                });
            };
            if (me.DATA.myinfo.liwu.rec.length >= 7) {
                me.nodes.txet_lan.setTextColor(cc.color("#6c6c6c"));
                me.nodes.btn_lan.setBright(false);
                me.nodes.panel_btn1.setTouchEnabled(false);
            }
        },
        setItem: function (ui, i) {
            var me = this;
            var data = me.conf.liwu[i];
            // me.DATA.myinfo.liwu.data[i];
            ui.show();
            X.autoInitUI(ui);
            ui.nodes.txt_lw.setString(data.intr);
            ui.nodes.panel_zz.setVisible(X.inArray(me.DATA.myinfo.liwu.rec, i));
            ui.nodes.img_ylq.setVisible(X.inArray(me.DATA.myinfo.liwu.rec, i));
            ui.nodes.txt_lw.setVisible(!X.inArray(me.DATA.myinfo.liwu.rec, i));
            ui.finds('ty_di9').setVisible(!X.inArray(me.DATA.myinfo.liwu.rec, i));
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        },
    });
    G.frame[ID] = new fun('shengdanshu.json', ID);
})();