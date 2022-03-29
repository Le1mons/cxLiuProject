/**
 * Created by LYF on 2018-12-26
 */
(function () {
    var ID = "diaowen_dwxz";

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
        },
        onShow: function () {
            var me = this;
            me.bindUI();

            new X.bView('zhuangbei_zbxz.json',function(view){
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
            var data = G.frame.diaowen.getGlyphArrBySort();

            if(me.data().state == "genghuan") {
                if(G.frame.yingxiong_xxxx.dw.curDwId) data.unshift(G.frame.yingxiong_xxxx.dw.curDwId);
            }
            if(me.data().state == "ts") {
                data = G.frame.diaowen.getGlyphArrByTs(me.data().color, me.data().id);
            }

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
            ui.removeAllChildren();
            ui.addChild(widget);

            if(d.isuse) {
                var xx = new ccui.ImageView("img/diaowen/img_dw_xx.png", 1);
                xx.setAnchorPoint(0, 1);
                xx.setPosition(2, ui.height -2);
                ui.addChild(xx);
                ui.isXX = true;
            } else {
                ui.isXX = false;
            }

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.isXX) {
                        var frame = G.frame.yingxiong_xxxx.dw;
                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[frame.curXbId]));
                        me.ajax("glyph_takeoff", [frame.curIndex, frame.curXbId], function (str, data) {
                            if(data.s == 1) {
                                G.frame.yingxiong_xxxx.emit('updateInfo');
                                frame.curDwId = undefined;
                                me.remove();
                            }
                        });
                    } else {
                        G.frame.diaowen_dwxq.data({
                            id: sender.data,
                            state: me.data().state,
                            callback: me.data().callback
                        }).show();
                    }
                }
            });
            ui.show();
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();