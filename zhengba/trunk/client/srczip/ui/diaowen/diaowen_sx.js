/**
 * Created by LYF on 2018-12-27
 */
(function () {
    X.checkGlyPhIsLock = function (tid) {
        var glyphLock = X.cacheByUid("glyphLock") || {};
        return glyphLock[tid] ? true : false;
    };
    var ID = "diaowen_sx";

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

            //背包里面 玩家等级达到180级后开启红色雕文的分解功能
            if(G.frame.beibao.isShow){
                var data = G.frame.beibao.DATA.glyph.list[me.data()];
                var conf = G.class.glyph.getById(data.gid);
                if(P.gud.lv >= 180 && (conf.color == 5 && conf.colorlv != 1)){
                    me.nodes.txt_gh.setString(L('FJ'));
                    me.nodes.btn_gh.show();
                    me.nodes.btn_gh.click(function () {
                        G.frame.alert.data({
                            sizeType: 3,
                            cancelCall: null,
                            okCall: function () {
                                me.ajax('glyph_breakdown',[me.data()],function (str,data) {
                                    if(data.s == 1){
                                        G.frame.jiangli.data({
                                            prize:data.d.prize
                                        }).show();
                                        G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                        me.remove();
                                    }
                                })
                            },
                            richText: L("DWFJ"),
                        }).show();
                    });
                }else {
                    me.nodes.btn_gh.hide();
                }
            }else {
                //更换
                me.nodes.btn_gh.click(function () {
                    G.frame.diaowen_dwxz.data({
                        state: "genghuan"
                    }).show();
                    me.remove();
                });
            }

            //重铸
            me.nodes.btn_cz.click(function (sender) {
                if(sender.no) {
                    G.tip_NB.show(L("DWCZNEED"));
                    return;
                }
                if (X.checkGlyPhIsLock(me.tid)) {
                    return G.tip_NB.show(L("DW_LOCK"));
                }
                G.frame.diaowen_peiyang.data({
                    state: "cz",
                    id: me.data()
                }).show();
            });

            //洗练
            me.nodes.btn_xl.click(function () {
                if (X.checkGlyPhIsLock(me.tid)) {
                    return G.tip_NB.show(L("DW_LOCK"));
                }
                G.frame.diaowen_peiyang.data({
                    state: "xl",
                    id: me.data()
                }).show();
            });

            //升级
            me.nodes.btn_sj.click(function (sender) {
                if(sender.max) {
                    G.tip_NB.show(L("DQDWMJ"));
                    return;
                }
                G.frame.diaowen_peiyang.data({
                    state: "sj",
                    id: me.data()
                }).show();
            });

            //吞噬
            me.nodes.btn_ts.click(function () {
                if (X.checkGlyPhIsLock(me.tid)) {
                    return G.tip_NB.show(L("DW_LOCK"));
                }
                G.frame.diaowen_tunshi.data({
                    state: "ts",
                    id: me.data()
                }).show();
            });

            me.nodes.btn_suo.click(function () {
                var glyphLock = X.cacheByUid("glyphLock") || {};
                if (glyphLock[me.tid]) {
                    glyphLock[me.tid] = 0;
                } else {
                    glyphLock[me.tid] = 1;
                }
                X.cacheByUid("glyphLock", glyphLock);
                me.setLockState();
            });

            me.nodes.btn_beizhu.click(function () {
                G.frame.dw_bz.data(me.data()).show();
            });

            me.nodes.btn_czdw.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.ajax('glyph_reset',[me.data()],function (str,data) {
                            if(data.s == 1){
                                G.frame.jiangli.data({
                                    prize:data.d.prize
                                }).show();
                                me.setContents();
                            }
                        })
                    },
                    richText: L("DWCZ"),
                }).show();
            })
        },
        setLockState: function () {
            var me = this;
            var glyphLock = X.cacheByUid("glyphLock") || {};

            if (glyphLock[me.tid]) {
                me.nodes.btn_suo.loadTextureNormal("img/public/btn/btn_d_suo.png", 1);
            } else {
                me.nodes.btn_suo.loadTextureNormal("img/public/btn/btn_d_jiesuo.png", 1);
            }
        },
        onOpen: function () {
            var me = this;
            me.tid = me.data();
            me.setLockState();
            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.DATA.diaowen = [];
            me.setContents();
        },
        onRemove: function () {
            var me = this;

            G.DATA.diaowen = [];
            if(G.frame.beibao.isShow) G.frame.beibao._panels.refreshPanel();
            if(G.frame.yingxiong_xxxx.dw) G.frame.yingxiong_xxxx.dw.setContents();
        },
        setContents: function () {
            var me = this;
            var data = G.frame.beibao.DATA.glyph.list[me.data()];
            var conf = G.class.glyph.getById(data.gid);

            //重置按钮
            me.nodes.btn_czdw.setVisible(data.lv > 0);

            if(data.lv >= G.class.glyph.getCom().base.lvlimit) {
                me.nodes.btn_sj.setBright(false);
                me.nodes.btn_sj.max = true;
                me.nodes.btn_sj.children[0].setTextColor(cc.color("#6c6c6c"));
            }

            if(conf.color < 5) {
                me.nodes.btn_cz.setBright(false);
                me.nodes.btn_cz.no = true;
                me.nodes.btn_cz.children[0].setTextColor(cc.color("#6c6c6c"));
            }

            var wid = G.class.sglyph(data);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(me.nodes.panel_dw.width / 2, me.nodes.panel_dw.height / 2);
            me.nodes.panel_dw.removeAllChildren();
            me.nodes.panel_dw.addChild(wid);

            me.nodes.txt_name.setString(conf.name);
            me.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[conf.color]));
            me.nodes.txt_jcz.setString(G.class.glyph.getCom().base.lvdata[data.lv].addition / 10 + "%");

            var textArr = [me.nodes.panel_pj, me.nodes.panel_smcz, me.nodes.panel_bj, me.nodes.panel_shjc];
            for (var i = 0; i < 4; i ++) {
                if(data.extbuff[i]) {
                    var con = G.class.glyph.getExtra().extbuff.id[data.extbuff[i]];
                    var key = X.keysOfObject(con.buff)[0];
                    textArr[i].show();
                    textArr[i].children[1].setString(L(key) + "：+" + con.buff[key] / 10 + "%");
                    textArr[i].children[1].setTextColor(cc.color(G.gc.COLOR[con.color]));
                } else {
                    textArr[i].hide();
                }
            }

            var keys = X.keysOfObject(data.basebuff);
            if(keys.length == 1) {
                me.ui.finds("Image_sm").hide();
                me.nodes.txt_sm.hide();
            } else {
                var keyVal = keys[1];
                me.ui.finds("Image_sm").show();
                me.ui.finds("Image_sm").loadTexture("img/public/ico/ico_" + G.class.getGlyphBuffIcon(keyVal) + ".png", 1);
                me.nodes.txt_sm.show();
                X.setRichText({
                    str: data.basebuff[keyVal] + " <font color=#a3806f>(" + conf.buff[keyVal][0] + "~" + conf.buff[keyVal][1] + ")</font>",
                    anchor: {x: 0, y: 0.5},
                    parent: me.nodes.txt_sm,
                    pos: {x: 0, y: me.nodes.txt_sm.height / 2}
                });
            }
            var val = G.class.getGlyphBuffKey(keys);
            me.ui.finds("Image_gj").loadTexture("img/public/ico/ico_" + G.class.getGlyphBuffIcon(val) + ".png", 1);
            X.setRichText({
                str: data.basebuff[val] + " <font color=#a3806f>(" + conf.buff[val][0] + "~" + conf.buff[val][1] + ")</font>",
                anchor: {x: 0, y: 0.5},
                parent: me.nodes.txt_gj,
                pos: {x: 0, y: me.nodes.txt_gj.height / 2}
            });

            if(data.extskill && G.class.glyph.getExtra().extskill.id[data.extskill]) {
                me.nodes.img_zw.hide();
                me.nodes.panel_wzms.show();
                me.nodes.panel_wzms.setString(G.class.glyph.getExtra().extskill.id[data.extskill].desc);
            } else {
                me.nodes.img_zw.show();
                me.nodes.panel_wzms.hide();
            }
        }
    });

    G.frame[ID] = new fun('diaowen_dwsx.json', ID);

    G.class.getGlyphBuffKey = function (buffKeys) {
        return buffKeys[0];
    };
    G.class.getGlyphBuffIcon = function (key) {
        return {
            atk: 'gj',
            hp: 'sm',
            speed: 'sd'
        }[key];
    }
})();