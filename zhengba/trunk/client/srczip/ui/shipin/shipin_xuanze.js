/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //饰品-选择
    var ID = 'shipin_xuanze';

    var fun = X.bUi.extend({
        extConf:{
            1:{
                data: function () {
                    var data = G.frame.beibao.DATA.shipin.list;

                    var keys = X.keysOfObject(data);
                    return keys;
                },
                sort: function (a,b) {
                    var dataA = G.frame.beibao.DATA.shipin.list[a],
                        dataB = G.frame.beibao.DATA.shipin.list[b];
                    var confA = G.class.shipin.getById(dataA.spid),
                        confB = G.class.shipin.getById(dataB.spid);

                    if (confA.color != confB.color) {
                        return confA.color * 1 > confB.color * 1 ? -1 : 1;
                    }else if(confA.star != confB.star){
                        var starA = confA.star * 1 || 0;
                        var starB = confB.star * 1 || 0;
                        return starA > starB ? -1 : 1;
                    }else{
                        return confA.id * 1 > confB.id * 1 ? -1 : 1;
                    }
                }
            }
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_XZSP'));

            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;


            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.heroConf = G.DATA.yingxiong.list[me.curXbId];
            me.curType = me.data().type;

            new X.bView('zhuangbei_zbxz.json',function(view){
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();

                me.ui.nodes.panel_nr.addChild(view);
                // G.frame.yingxiong_xxxx.getNextBuff('dengjielv', me.curXbId, function(buff){
                me.setContents();
                // });
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function() {
            var me = this;

            me.fmtItemList();
        },
        fmtItemList: function () {
            var me = this;
            var view = me._view;
            var scrollview = view.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            var data = me.extConf[me.curType].data();

            if (data.length < 1) {
                view.finds("img_zwnr").show();
                return;
            }

            data.sort(me.extConf[me.curType].sort);

            var table = me.table = new X.TableView(scrollview,me._view.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,3,5);
            table.setData(data);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x -= 2;
        },
        setItem: function (ui, data) {
            var me = this;
            if (data == null) {
                ui.hide();
                return;
            }
            ui.setName(data);
            X.autoInitUI(ui);
            var d = G.frame.beibao.DATA.shipin.list[data];

            var widget = G.class.sshipin(d);
            widget.setScale(.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.width*0.5, ui.height ));
            ui.removeAllChildren();
            ui.addChild(widget);

            ui.data = d.spid;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    var state = me.heroConf.weardata && me.heroConf.weardata['5'] ? 'tihuan' : 'chuandai';
                    G.frame.shipin_xq.data({id:sender.data,state:state}).show();
                }
            });
            ui.show();
        },
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();