/**
 * Created by LYF on 2018-12-28
 */
(function () {
    var ID = "diaowen_select";

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_DWXZ'));

            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.maxNum = me.data().maxNum;
            me.selectedArr = [];
            me.curNum = me.selectedArr.length;

            for (var i in me.data().selected) {
                me.selectedArr.push(me.data().selected[i]);
            }
        },
        onShow: function () {
            var me = this;
            me.bindUI();

            new X.bView('ui_tip_xuanze.json',function(view){
                me._view = view;
                cc.enableScrollBar(view.nodes.scrollview);
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var view = me._view;
            var data = G.frame.diaowen.getNoInArr(me.selectedArr);
            var arr = [];
            for (var index = 0; index < data.length; index ++) {
                var gdata = G.frame.beibao.DATA.glyph.list[data[index]];
                var gconf = G.gc.glyph[gdata.gid];
                if (gconf.color < 5) arr.push(data[index]);
            }
            data = arr;

            view.nodes.btn_xz.click(function () {
                if(me.selectedArr.length == me.curNum) me.remove();
                else {
                    me.data().callback && me.data().callback(me.selectedArr);
                    me.remove();
                }
            });

            view.nodes.txt_title.y = 318;
            view.nodes.txt_title.setString(L("CACKDWXQ"));

            cc.isNode(view.finds('img_zwnr')) && view.finds('img_zwnr').hide();
            if (data.length < 1) {
                cc.isNode(view.finds('img_zwnr')) && view.finds('img_zwnr').show();
                return;
            }

            if(!me.table) {
                var table = me.table = new X.TableView(view.nodes.scrollview, view.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.setName(data);
            ui.data = data;

            var d = G.frame.beibao.DATA.glyph.list[data];
            var widget = G.class.sglyph(d);
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.width*0.5, ui.height ));
            widget.setLock(X.checkGlyPhIsLock(data));
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

            if(X.inArray(me.selectedArr, ui.data)) {
                ui.nodes.img_gou.show();
            } else {
                ui.nodes.img_gou.hide();
            }

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function(sender, type){
                if(type == ccui.Widget.LONG_TOUCH) {
                    if (X.checkGlyPhIsLock(sender.data)) return;
                    me.isCK = true;
                    G.frame.diaowen_dwxq.data({
                        id: sender.data,
                        state: "ck",
                        noMask: true
                    }).show();
                }
                if(type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isCK) {
                        if(widget.conf.colorlv) return null;
                        if(X.checkGlyPhIsLock(sender.data)) return;
                        if(X.inArray(me.selectedArr, sender.data)) {
                            me.selectedArr.splice(X.arrayFind(me.selectedArr, sender.data), 1);
                        } else {
                            if(me.selectedArr.length == 5) {
                                G.tip_NB.show(L("SLYDSX"));
                                return;
                            }
                            me.selectedArr.push(sender.data);
                        }
                        me.checkGou();
                    } else {
                        if (X.checkGlyPhIsLock(sender.data)) return;
                        me.isCK = false;
                        if(G.frame.diaowen_dwxq.isShow) G.frame.diaowen_dwxq.remove();
                    }
                }
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    if (X.checkGlyPhIsLock(sender.data)) return G.tip_NB.show(L("DW_LOCK"));
                }
            }, null, {emitLongTouch: true});
            ui.show();
        },
        checkGou: function () {
            var me = this;
            var chr = me.table.getAllChildren();

            for (var i in chr) {
                if(X.inArray(me.selectedArr, chr[i].data)) {
                    chr[i].nodes.img_gou.show();
                } else {
                    chr[i].nodes.img_gou.hide();
                }
            }
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();