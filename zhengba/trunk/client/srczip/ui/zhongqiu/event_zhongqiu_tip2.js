/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 月饼-奖励详情
    var ID = 'event_zhongqiu_tip2';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var prize = me.DATA.prize;
            var name = G.class.getItem(prize.t, prize.a).name;

            X.render({
                txt_title: name,
                text_1: X.STR(L('zhongqiu_title4'), name),
            }, me.nodes);

            me.fmtItemList();
        },
        fmtItemList: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (!me.ui_table) {
                var table = new cc.myTableView({
                    rownum: 5,
                    type: 'fill',
                    lineheight: me.nodes.list_item.height,
                    // paddingTop: 10
                });
                me.ui_table = table;
                this.setTableViewData();
                table.setDelegate(this);
                table.bindScrollView(me.nodes.scrollview);
            }else {
                this.setTableViewData();
            }
            me.ui_table.reloadDataWithScroll(true);
        },
        setTableViewData: function () {
            var me = this;
            var prize = me.DATA.prize;
            var dlp = G.class.getItem(prize.t, prize.a).dlp;
            var data = [];

            for (var i = 0; i < dlp.length; i++) {
                data = data.concat(G.class.diaoluo.getById(dlp[i]));
            }

            var table = me.ui_table;
            table.data(data);
        },
        cellDataTemplate: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            return me.nodes.list_item.clone();
        },
        cellDataInit: function (ui, data, pos) {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if (data == null) {
                ui.hide();
                return;
            }
            ui.setName('item_' + ui.idx);
            if(!ui.nodes) X.autoInitUI(ui);

            X.render({
                ico_item: function(node){
                    var widget = G.class.sitem(data);
                    widget.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(widget);
                    widget.setScale(.9);
                    G.frame.iteminfo.showItemInfo(widget);
                },
            }, ui.nodes);

            ui.show();
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            cc.enableScrollBar(me.nodes.scrollview, false);

            me.nodes.mask.click(function(sender,type){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            // me.getData(function(){
                me.setContents();
            // });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu_tip2.json', ID);
})();