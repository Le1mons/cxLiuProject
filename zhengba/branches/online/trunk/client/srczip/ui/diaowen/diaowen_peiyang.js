/**
 * Created by LYF on 2018-12-27
 */
(function () {
    var ID = "diaowen_peiyang";

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
            me.xlArr = [];
            me.redArr = [];
            
            new X.bView("diaowen_dwxl.json", function (node) {
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

            me.view.nodes.panel_fjjn.hide();
            me.view.nodes.panel_fjsx.hide();
            me.view.nodes.panel_jbsx.hide();
            me.view.nodes.txt_xl.setString(L(me.data().state));

            if(me.data().state == "sj") me.view.nodes.panel_jbsx.show();
            if(me.data().state == "xl") me.view.nodes.panel_fjsx.show();
            if(me.data().state == "cz") me.view.nodes.panel_fjjn.show();

            me.view.nodes.btn_xl.click(function () {
                switch (me.data().state) {
                    case "sj":
                        me.ajax("glyph_lvup", [me.data().id], function (str, data) {
                            if(data.s == 1) {
                                me.DATA = G.frame.beibao.DATA.glyph.list[me.data().id];
                                var keys = X.keysOfObject(me.DATA.basebuff);
                                var buff = me.DATA.basebuff;
                                var val = keys.length < 2 ?
                                    L(keys[0]) + "+" + parseInt(0.09 * buff[keys[0]]) :
                                    L(keys[0]) + "+" + parseInt(0.09 * buff[keys[0]]) + "  " + L(keys[1]) + "+" + parseInt(0.09 * buff[keys[1]]);

                                G.tip_NB.show(val);
                                G.frame.diaowen_sx.setContents();
                                me.playAni(function () {
                                    if(me.DATA.lv >= G.class.glyph.getCom().base.lvlimit) me.remove();
                                    else {
                                        me.sj();
                                        me.setBaseInfo();
                                    }
                                });
                            }
                        });
                        break;
                    case "xl":
                        function f() {
                            me.ajax("glyph_scrutiny", [me.data().id, me.xlArr], function (str, data) {
                                if(data.s == 1) {
                                    me.playAni();
                                    me.DATA = G.frame.beibao.DATA.glyph.list[me.data().id];
                                    G.frame.diaowen_sx.setContents();

                                    for (var i = 0; i < me.xlPanel.length; i ++) {
                                        if(!X.inArray(me.xlArr, i)) {
                                            G.class.ani.show({
                                                json: "ani_diaowen_xilian",
                                                addTo: me.xlPanel[i],
                                                x: me.xlPanel[i].width / 2,
                                                y: me.xlPanel[i].height / 2,
                                                repeat: false,
                                                autoRemove: true,
                                            });
                                        }
                                    }
                                    me.xl();
                                }
                            });
                        }
                        var isNoLockRed = false;
                        for (var i in me.redArr) {
                            if(!X.inArray(me.xlArr, me.redArr[i])) {
                                isNoLockRed = true;
                                break;
                            }
                        }
                        if(isNoLockRed) {
                            if(!X.cacheByUid("todayTipRed")) {
                                G.frame.diaowen_tip.data({
                                    callback: function () {
                                        f();
                                    }
                                }).show();
                            } else {
                                f();
                            }
                        } else {
                            f();
                        }
                        break;
                    case "cz":
                        me.ajax("glyph_recast", [me.data().id], function (str, data) {
                            if(data.s == 1) {
                                G.tip_NB.show(L("CZCG"));
                                me.playAni();
                                me.DATA = G.frame.beibao.DATA.glyph.list[me.data().id];
                                me.view.nodes.panel_wzms.runActions([
                                    cc.fadeOut(0.4),
                                    cc.callFunc(function () {
                                        me.cz();
                                    }),
                                    cc.fadeIn(0.4)
                                ]);
                                G.frame.diaowen_sx.setContents();
                            }
                        });
                        break;
                }
            }, 1000);

            me.setBaseInfo();
        },
        setBaseInfo: function() {
            var me = this;
            var data = me.DATA;
            var conf = me.CONF;

            var wid = G.class.sglyph(data);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(me.view.nodes.panel_dw.width / 2, me.view.nodes.panel_dw.height / 2);
            me.view.nodes.panel_dw.removeAllChildren();
            me.view.nodes.panel_dw.addChild(wid);

            me.view.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[conf.color]));
            me.view.nodes.txt_name.setString(conf.name);
            me.view.nodes.txt_jcz1.setString(G.class.glyph.getCom().base.lvdata[data.lv].addition / 10 + "%");

            var keys = X.keysOfObject(data.basebuff);
            if(keys.length == 1) {
                me.view.ui.finds("Image_sm").hide();
                me.view.nodes.txt_sm.hide();
            } else {
                me.view.ui.finds("Image_sm").show();
                me.view.nodes.txt_sm.show();
                X.setRichText({
                    str: data.basebuff.hp + " <font color=#a3806f>(" + conf.buff.hp[0] + "~" + conf.buff.hp[1] + ")</font>",
                    anchor: {x: 0, y: 0.5},
                    parent: me.view.nodes.txt_sm,
                    pos: {x: 0, y: me.view.nodes.txt_sm.height / 2}
                });
            }
            var val = keys.length > 1 ? "atk" : keys[0];
            me.view.ui.finds("Image_gj").loadTexture("img/public/ico/ico_" + (val == "atk" ? "gj" : "sm") + ".png", 1);
            X.setRichText({
                str: data.basebuff[val] + " <font color=#a3806f>(" + conf.buff[val][0] + "~" + conf.buff[val][1] + ")</font>",
                anchor: {x: 0, y: 0.5},
                parent: me.view.nodes.txt_gj,
                pos: {x: 0, y: me.view.nodes.txt_gj.height / 2}
            });

            me[me.data().state]();
        },
        sj: function () {
            var me = this;
            var data = me.DATA;

            X.setRichText({
                str: X.STR(L("DW_DJ"), data.lv),
                anchor: {x: 0, y: 0.5},
                parent: me.view.nodes.txt_dj1,
                pos: {x: 0, y: me.view.nodes.txt_dj1.height / 2}
            });

            X.setRichText({
                str: X.STR(L("DW_SX"), G.class.glyph.getCom().base.lvdata[data.lv].addition / 10),
                anchor: {x: 0, y: 0.5},
                parent: me.view.nodes.txt_sxjc1,
                pos: {x: 0, y: me.view.nodes.txt_sxjc1.height / 2}
            });

            X.setRichText({
                str: X.STR(L("DW_DJJ"), data.lv + 1),
                anchor: {x: 0, y: 0.5},
                parent: me.view.nodes.txt_dj2,
                pos: {x: 0, y: me.view.nodes.txt_dj2.height / 2}
            });

            X.setRichText({
                str: X.STR(L("DW_SXJ"), G.class.glyph.getCom().base.lvdata[data.lv + 1].addition / 10),
                anchor: {x: 0, y: 0.5},
                parent: me.view.nodes.txt_sxjc2,
                pos: {x: 0, y: me.view.nodes.txt_sxjc2.height / 2}
            });

            X.alignItems(me.view.nodes.panel_cl, G.class.glyph.getCom().base.lvdata[data.lv].need, "left",{
                scale: .75,
                touch: true,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color("#ff4e4e"));
                    }
                }
            });
        },
        xl: function () {
            var me = this;
            var btnArr = [];
            var data = me.DATA;
            var textArr = [me.view.nodes.panel_pj, me.view.nodes.panel_smcz, me.view.nodes.panel_bj, me.view.nodes.panel_shjc1];

            function f(arr) {
                var need = G.class.glyph.getCom().base.need.lock[arr.length];
                X.alignItems(me.view.nodes.panel_cl, need, "left",{
                    scale: .75,
                    touch: true,
                    mapItem: function (node) {
                        if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                            node.num.setTextColor(cc.color("#ff4e4e"));
                        }
                    }
                });
            }

            me.xlPanel = [];
            me.redArr = [];
            for (var i = 0; i < 4; i ++) {
                if(data.extbuff[i]) {
                    var con = G.class.glyph.getExtra().extbuff.id[data.extbuff[i]];
                    var key = X.keysOfObject(con.buff)[0];
                    textArr[i].show();
                    textArr[i].children[1].setString(L(key) + "：+" + con.buff[key] / 10 + "%");
                    textArr[i].children[1].setTextColor(cc.color(G.gc.COLOR[con.color]));
                    btnArr.push(textArr[i].children[2]);
                    if(con.color == 5) me.redArr.push(i);
                    me.xlPanel.push(textArr[i]);
                } else {
                    textArr[i].hide();
                }
            }

            for (var i = 0; i < btnArr.length; i ++) {
                var btn = btnArr[i];
                btn.idx = i;
                (function (btn) {
                    if(btnArr.length == 1) btn.hide();
                    if(X.inArray(me.xlArr, btn.idx)) btn.setBright(false);
                    btn.click(function (sender) {
                        if(X.inArray(me.xlArr, sender.idx)) {
                            sender.setBright(true);
                            me.xlArr.splice(X.arrayFind(me.xlArr, sender.idx), 1);
                            f(me.xlArr);
                        } else {
                            if(me.xlArr.length == btnArr.length - 1) {
                                G.tip_NB.show(L("BKSDSYSXXL"));
                                return;
                            }
                            sender.setBright(false);
                            me.xlArr.push(sender.idx);
                            f(me.xlArr);
                        }
                    })
                })(btn);

                f(me.xlArr);
            }
        },
        cz: function () {
            var me = this;
            var data = me.DATA;

            if(data.extskill && G.class.glyph.getExtra().extskill.id[data.extskill]) {
                me.view.nodes.panel_wzms.show();
                me.view.nodes.panel_wzms.setString(G.class.glyph.getExtra().extskill.id[data.extskill].desc);
            } else {
                me.view.nodes.panel_wzms.hide();
            }

            X.alignItems(me.view.nodes.panel_cl, G.class.glyph.getCom().base.need.recast, "left",{
                scale: .75,
                touch: true,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color("#ff4e4e"));
                    }
                }
            });
        },
        playAni: function (cb) {
            var me = this;

            G.class.ani.show({
                json: "ani_diaowen_shengji",
                addTo: me.ui.finds("panel_tip"),
                x: me.ui.finds("panel_tip").width / 2,
                y: me.ui.finds("panel_tip").height / 2,
                repeat: false,
                autoRemove: true,
                onload: function(node) {
                    node.zIndex = -1;
                },
                onend: function () {
                    cb && cb();
                }
            })
        }
    });

    G.frame[ID] = new fun('diaowen_tip.json', ID);
})();