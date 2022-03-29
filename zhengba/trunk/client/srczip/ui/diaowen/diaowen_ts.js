/**
 * Created by LYF on 2018-12-27
 */
(function () {
    var ID = "diaowen_tunshi";

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.tip_title.setString(L("DIAOWEN") + L(me.data().state));
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.DATA = G.frame.beibao.DATA.glyph.list[me.data().id];
            me.CONF = G.class.glyph.getById(me.DATA.gid);

            new X.bView("diaowen_dwts.json", function (node) {
                me.view = node;
                me.nodes.panel_nr.addChild(node);
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            var conf = me.CONF;
            me.selected = [];

            var wid = G.class.sglyph(data, true);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(me.view.nodes.panel_dw.width / 2, me.view.nodes.panel_dw.height / 2);
            me.view.nodes.panel_dw.removeAllChildren();
            me.view.nodes.panel_dw.addChild(wid);

            me.setJia();

            me.view.nodes.btn_xl.click(function () {
                if(!me.view.nodes.panel_dw1.children[0]) {
                    G.tip_NB.show(L("QFRTSDDW"));
                    return;
                }
                if(me.selected.length < 1) {
                    G.tip_NB.show(L("QXZTSSX"));
                    return;
                }
                me.ajax("glyph_devoure", [me.data().id, me.tsid, me.selected], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "glyph_devoure"
                        });
                        G.tip_NB.show(L("TSCG"));
                        G.frame.diaowen_sx.setContents();
                        G.class.ani.show({
                            json: "ani_diaowen_tunshi",
                            addTo: me.view.ui,
                            x: me.view.ui.width / 2,
                            y: 325,
                            repeat: false,
                            autoRemove: true,
                            onend: function () {
                                if(data.d && data.d.prize && data.d.prize.length > 0) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                }
                                me.remove();
                            }
                        });
                    }
                })
            }, 1000);

            me.view.nodes.panel_dw.click(function (sender) {
                G.frame.diaowen_dwxq.data({
                    id: sender.children[0].data.tid,
                    state: "ck"
                }).show();
            });

            me.view.nodes.panel_dw1.click(function (sender) {
                if(sender.children.length > 0) {
                    G.frame.diaowen_dwxq.data({
                        id: sender.children[0].data.tid,
                        state: "ck"
                    }).show();
                    return;
                }
                G.frame.diaowen_dwxz.data({
                    id: me.data().id,
                    state: me.data().state,
                    color: conf.color,
                    callback: function (id) {
                        me.setTsDw(id);
                        me.setJia();
                    },
                    showLock: true
                }).show();
            });
            var key = ["buff", "extbuff", "extskill"];
            var gou = [me.view.nodes.img_gou1, me.view.nodes.img_gou3, me.view.nodes.img_gou2];
            var gouArr = [me.view.nodes.panel_pj.finds("Image_8"), me.view.nodes.panel_smcz.finds("Image_8"), me.view.nodes.panel_bj.finds("Image_8")];

            for (var i = 0; i < gouArr.length; i ++) {
                (function (lay, i) {
                    lay.setTouchEnabled(true);
                    lay.gou = gou[i];
                    lay.key = key[i];
                    lay.gou.setTouchEnabled(false);
                    lay.click(function (sender) {
                        if(!me.view.nodes.panel_dw1.children[0]) {
                            G.tip_NB.show(L("QFRTSDDW"));
                            return;
                        }
                        if(!X.inArray(me.selected, sender.key)) {
                            me.selected.push(sender.key);
                            sender.gou.show();
                        } else {
                            me.selected.splice(X.arrayFind(me.selected, sender.key), 1);
                            sender.gou.hide();
                        }
                        me.setNeed();
                    })
                })(gouArr[i], i);
            }
            me.setNeed();
        },
        setTsDw: function (id) {
            var me = this;
            var lay = me.view.nodes.panel_dw1;
            var data = G.frame.beibao.DATA.glyph.list[id];

            var wid = G.class.sglyph(data, true);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(lay.width / 2, lay.height / 2);
            lay.removeAllChildren();
            lay.addChild(wid);

            me.tsid = id;
            me.checkState();

            if(X.keysOfObject(me.DATA.buff).length == 1) {
                var val1 = X.keysOfObject(me.DATA.buff)[0];
                var val2 = X.keysOfObject(data.buff);

                if(data.basebuff[val2] < me.DATA.basebuff[val1]) {

                    me.view.nodes.panel_pj.finds("Image_8").hide();
                }
            }
        },
        checkState: function () {
            var me = this;
            var lay = me.view.nodes.panel_dw1.children[0];

            if(!lay.data.extskill || lay.data.extskill.length < 1) {
                me.view.nodes.panel_bj.hide();
            }
        },
        setNeed: function () {
            var me = this;
            var need = X.clone(G.class.glyph.getCom().base.need.devoured);

            if(me.selected.length < 1) {
                need[0].n = 0;
            }

            X.alignItems(me.view.nodes.panel_cl, need, "left",{
                scale: .75,
                touch: true
            });
        },
        setJia: function () {
            var me = this;

            me.view.nodes.panel_dwdh.removeAllChildren();

            if(!me.view.nodes.panel_dw1.children[0] && G.frame.diaowen.getGlyphArrByTs(me.CONF.color, me.data().id)) {
                var img = new ccui.ImageView("img/public/img_jia.png", 1);
                img.setAnchorPoint(0.5, 0.5);
                img.setPosition(me.view.nodes.panel_dwdh.width / 2, me.view.nodes.panel_dwdh.height / 2);
                me.view.nodes.panel_dwdh.addChild(img);
                img.runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
            }
        }
    });

    G.frame[ID] = new fun('diaowen_tip.json', ID);
})();