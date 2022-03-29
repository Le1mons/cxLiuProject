/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    //装备选择
    var ID = 'zhuangbei_zbxz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        setContents:function() {
            var me = this;

            me.fmtItemList();
        },
        fmtItemList: function () {
            var me = this;
            var view = me._view;

            view.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(view.nodes.scrollview);
            var data = G.frame.zhuangbei.getCanUseZbTidArrByType(me.curType);

            cc.isNode(view.finds('img_zwnr')) && view.finds('img_zwnr').hide();
            if (data.length < 1) {
                cc.isNode(view.finds('img_zwnr')) && view.finds('img_zwnr').show();
                return;
            }

            var table = new cc.myTableView({
                rownum: 5,
                type: 'fill',
                lineheight: view.nodes.list.height+1,
                paddingTop: 2
            });
            me.ui_table = table;
            table.setDelegate(this);
            this.setTableViewData(data);
            table.bindScrollView(view.nodes.scrollview);
            me.ui_table.tableView.reloadData();
        },
        setTableViewData: function (data) {
            var me = this;
            // me. = G.frame.yingxiong.getTidArr(me.curType);

            var table = me.ui_table;

            data.sort(function (a,b) {
                var dataA = G.frame.beibao.DATA.zhuangbei.list[a],
                    dataB = G.frame.beibao.DATA.zhuangbei.list[b];
                var confA = G.class.equip.getById(dataA.eid),
                    confB = G.class.equip.getById(dataB.eid);

                if (confA.color != confB.color) {
                    return confA.color * 1 > confB.color * 1 ? -1 : 1;
                } else {
                    var starA = confA.star * 1 || 0;
                    var starB = confB.star * 1 || 0;

                    return starA > starB ? -1 : 1;
                }

            });
            table.data(data);
        },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function () {
            var me = this;
            return me._view.nodes.list.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         */
        cellDataInit: function (ui, data, pos) {
            var me = this;
            if (data == null) {
                ui.hide();
                return;
            }
            // ui.setName(pos[0]*1 + pos[1]);
            ui.setName(data);
            X.autoInitUI(ui);
            var d = G.frame.beibao.DATA.zhuangbei.list[data];

            var widget = G.class.szhuangbei(d);
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.width*0.5, ui.height ));
            ui.removeAllChildren();
            ui.addChild(widget);

            ui.data = d.eid;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    var state = me.heroConf.weardata && me.heroConf.weardata[me.curType] ? 'tihuan' : 'chuandai';
                    G.frame.zhuangbei_xq.data({id:sender.data,state:state}).show();
                }
            });
            ui.show();
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_ZBXZ'));

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
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.heroConf = G.DATA.yingxiong.list[me.curXbId];
            me.curType = me.data();

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
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();
