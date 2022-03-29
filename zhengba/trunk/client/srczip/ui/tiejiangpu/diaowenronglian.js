/**
 * Created by LYF on 2018/12/27.
 */
(function () {
    G.class.diaowenronglian = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('diaowenrolian.json');
            G.frame.tiejiangpu.rl = me;
        },
        initUI: function() {
            var me = this;

            me.nodes.text_jhsl.setString(G.gc.glyphcom.base.melt.need[0].n)
        },
        bindBtn:function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS35")
                }).show();
            });

            me.nodes.btn_fh.click(function () {
                G.frame.diaowen_tisheng.remove();
            });

            me.nodes.btn_rl.click(function () {

                if(!me.selectId) return G.tip_NB.show(L("QXZRLDDW"));

                me.ajax("glyph_melt", [me.selectId], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "glyph_melt"
                        });
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.selectId = undefined;
                        me.nodes.panel_dw_6.removeAllChildren();
                        me.setTable();
                    }
                })
            },1000)
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
            me.initUI();

            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        },
        onShow : function(){
            var me = this;

            G.class.ani.show({
                json: "ani_diaowen_jinglian",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("xunhuan", true);
                    me.action = action;
                }
            });

            me.setTable();
            me.nodes.img_jia6.runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
        },
        getGlyphData: function () {
            var arr = [];
            var needColor = G.gc.glyphcom.base.melt.color;
            
            for (var i in G.frame.beibao.DATA.glyph.list) {
                if (G.frame.beibao.DATA.glyph.list[i].color >= needColor
                    && !G.frame.beibao.DATA.glyph.list[i].isuse
                    && !G.gc.glyph[G.frame.beibao.DATA.glyph.list[i].gid].colorlv) {
                    arr.push(i);
                }
            }

            return arr;
        },
        setTable: function () {
            var me = this;
            var data = me.getGlyphData();

            if(data.length < 1) {
                me.nodes.img_zwnr.show();
                me.nodes.img_jia6.hide();
            } else {
                me.nodes.img_zwnr.hide();
                me.nodes.img_jia6.show();
            }

            if(!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_yx, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, cc.size(100, 100));
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            var glyph = G.class.sglyph(G.frame.beibao.DATA.glyph.list[data]);
            glyph.setPosition(ui.width / 2, 44);
            glyph.setScale(.9);
            glyph.setLock(X.checkGlyPhIsLock(data));
            ui.glyph = glyph;
            ui.removeAllChildren();
            ui.addChild(glyph);

            if(me.selectId == data) glyph.setGou(true);
            else glyph.setGou(false);

            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if (X.checkGlyPhIsLock(data)) return G.tip_NB.show(L("DW_LOCK"));
                    if(me.selectId && me.selectId == data) {
                        me.selectId = undefined;
                        me.selectItem = undefined;
                        me.addGlyph();
                        sender.glyph.setGou(false);
                    } else {
                        G.frame.diaowen_dwxq.data({
                            id: data,
                            state: "fangru",
                            callback: function () {
                                if (X.checkGlyPhIsLock(data)) return G.tip_NB.show(L("DW_LOCK"));
                                if(me.selectItem) {
                                    me.selectItem.glyph.setGou(false);
                                }
                                me.selectId = data;
                                me.selectItem = sender;
                                sender.glyph.setGou(true);
                                me.addGlyph(data);
                            }
                        }).show();
                    }
                }
            });
        },
        addGlyph: function (data) {
            var me = this;

            if(data) {
                var glyph = G.class.sglyph(G.frame.beibao.DATA.glyph.list[data], true);
                glyph.setPosition(me.nodes.panel_dw_6.width / 2, me.nodes.panel_dw_6.height / 2);
                me.nodes.panel_dw_6.removeAllChildren();
                me.nodes.panel_dw_6.addChild(glyph);
            } else {
                me.nodes.panel_dw_6.removeAllChildren();
            }
        }
    });

})();