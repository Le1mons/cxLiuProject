/**
 * Created by LYF on 2018-12-27
 */
(function () {
    var ID = "diaowen_dwxq";

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        bindUI: function () {
            var me = this;

            if(me.data().state == "genghuan" || me.data().state == "xiangqian") {
                me.nodes.txt_xq.setString(L("XIANGQIAN"));
            } else {
                if(me.data().state == "fangru") {
                    me.nodes.txt_xq.setString(L("FR"));
                } else {
                    me.nodes.txt_xq.setString(L("QD"));
                }
            }
            
            me.nodes.btn_xq.click(function () {
                if(me.data().state == "genghuan" || me.data().state == "xiangqian") {
                    G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[G.frame.yingxiong_xxxx.curXbId]));
                    me.ajax("glyph_wear", [me.data().id, G.frame.yingxiong_xxxx.curXbId, G.frame.yingxiong_xxxx.dw.curIndex], function (str, data) {
                        if(data.s == 1) {
                            me.remove();
                            if(G.frame.diaowen_dwxz.isShow) {
                                G.frame.diaowen_dwxz.remove();
                            }
                            G.frame.yingxiong_xxxx.emit('updateInfo');
                        }
                    });
                } else {
                    me.data().callback && me.data().callback(me.data().id);
                    me.remove();
                    if(G.frame.diaowen_dwxz.isShow) {
                        G.frame.diaowen_dwxz.remove();
                    }
                }
            });

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
            me.fillSize();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = G.frame.beibao.DATA.glyph.list[me.data().id];
            var conf = G.class.glyph.getById(data.gid);

            var wid = G.class.sglyph(data);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(me.nodes.panel_wp.width / 2, me.nodes.panel_wp.height / 2);
            me.nodes.panel_wp.removeAllChildren();
            me.nodes.panel_wp.addChild(wid);

            me.nodes.panel_name.setString(conf.name);
            me.nodes.panel_name.setTextColor(cc.color(G.gc.COLOR[conf.color]));
            me.nodes.panel_wzns.setString(G.class.glyph.getCom().base.lvdata[data.lv].addition / 10 + "%");

            var textArr = [me.nodes.panel_pj, me.nodes.panel_smcz, me.nodes.panel_bj, me.nodes.panel_shjc];
            for (var i = 0; i < 4; i ++) {
                if(data.extbuff[i]) {
                    var con = G.class.glyph.getExtra().extbuff.id[data.extbuff[i]];
                    var key = X.keysOfObject(con.buff)[0];
                    textArr[i].show();
                    textArr[i].children[0].setString(L(key) + "：+" + con.buff[key] / 10 + "%");
                    textArr[i].children[0].setTextColor(cc.color(G.gc.COLOR[con.color]));
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
                    pos: {x: 0, y: me.nodes.txt_sm.height / 2},
                    color: "#d9ccb1"
                });
            }
            var val = G.class.getGlyphBuffKey(keys);
            me.ui.finds("Image_gj").loadTexture("img/public/ico/ico_" + G.class.getGlyphBuffIcon(val) + ".png", 1);
            X.setRichText({
                str: data.basebuff[val] + " <font color=#6c5739>(" + conf.buff[val][0] + "~" + conf.buff[val][1] + ")</font>",
                anchor: {x: 0, y: 0.5},
                parent: me.nodes.txt_gj,
                pos: {x: 0, y: me.nodes.txt_gj.height / 2},
                color: "#d9ccb1"
            });

            if(data.extskill && G.class.glyph.getExtra().extskill.id[data.extskill]) {
                me.nodes.panel_fjjn.show();
                me.nodes.panel_wzms1.setString(G.class.glyph.getExtra().extskill.id[data.extskill].desc);
            } else {
                me.nodes.panel_fjjn.hide();
                me.noSkill = true;

            }
            if(me.data().state == "ck") {
                me.nodes.btn_xq.hide();
                if(me.noSkill) {
                    me.nodes.panel_bg.height = 230;
                } else {
                    me.nodes.panel_bg.height = 355;
                }
            } else {
                if(me.noSkill) {
                    me.nodes.panel_bg.height = 300;
                }
            }
            ccui.helper.doLayout(me.nodes.panel_bg);
        }
    });

    G.frame[ID] = new fun('diaowen_tip1.json', ID);
})();