/**
 * Created by LYF on 2018-12-27
 */
(function () {
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

            //更换
            if(G.frame.beibao.isShow) me.nodes.btn_gh.hide();
            me.nodes.btn_gh.click(function () {
                G.frame.diaowen_dwxz.data({
                    state: "genghuan"
                }).show();
                me.remove();
            });

            //重铸
            me.nodes.btn_cz.click(function (sender) {
                if(sender.no) {
                    G.tip_NB.show(L("DWCZNEED"));
                    return;
                }
                G.frame.diaowen_peiyang.data({
                    state: "cz",
                    id: me.data()
                }).show();
            });

            //洗练
            me.nodes.btn_xl.click(function () {
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
                G.frame.diaowen_tunshi.data({
                    state: "ts",
                    id: me.data()
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onRemove: function () {
            var me = this;

            if(G.frame.beibao.isShow) G.frame.beibao._panels.refreshPanel();
            if(G.frame.yingxiong_xxxx.dw) G.frame.yingxiong_xxxx.dw.setContents();
        },
        setContents: function () {
            var me = this;
            var data = G.frame.beibao.DATA.glyph.list[me.data()];
            var conf = G.class.glyph.getById(data.gid);

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
                me.ui.finds("Image_sm").show();
                me.nodes.txt_sm.show();
                X.setRichText({
                    str: data.basebuff.hp + " <font color=#a3806f>(" + conf.buff.hp[0] + "~" + conf.buff.hp[1] + ")</font>",
                    anchor: {x: 0, y: 0.5},
                    parent: me.nodes.txt_sm,
                    pos: {x: 0, y: me.nodes.txt_sm.height / 2}
                });
            }
            var val = keys.length > 1 ? "atk" : keys[0];
            me.ui.finds("Image_gj").loadTexture("img/public/ico/ico_" + (val == "atk" ? "gj" : "sm") + ".png", 1);
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
})();