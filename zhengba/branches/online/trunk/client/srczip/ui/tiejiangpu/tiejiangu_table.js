/**
 * Created by wfq on 2018/7/10.
 */
(function () {
    //tiejiangu_table
    G.class.tiejiangu_table = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('zhuangbei_zbxz2.json');
        },
        refreshData :function (data,type) {
            var me = this;


            me.DATA = data;
            me._type=type;
            me.isTouch = false;
            me.isShow && me.setContents();
        },
        bindBtn: function(){
            var me = this;
            me.ui.finds('$btn_fanhui').click(function(sender,type){
                G.frame.tiejiangpu.remove();
            });
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            me.nodes.panel_tb1.hide();
            me.scrollview = me.nodes.scrollview_1;
            me.itemArr = [];
            if (!me.tableView) {
                me.tableView = new X.TableView(me.scrollview, me.nodes.panel_tb1, 5, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] * 5 + pos[1]);
                }, null, null, 1, 5);
            }
            me.tableView.setData(data);
            me.tableView.reloadDataWithScroll(true);

            if (!me.isTouch) {
                me.ui.setTimeout(function () {
                    me.tableView.cellByName(0)[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                },100);
            }
        },
        setItem: function (ui, data, pos) {
            var me = this;
            if (!data) {
                ui.hide();
                return;
            }
            ui.setName(pos);


            var widget = G.class.szhuangbei(data);
            widget.setAnchorPoint(0.5,0.5);
            widget.setPosition(ui.width / 2, ui.height / 2);
            me.checkRedPoint(widget);
            //暂时屏蔽图标
            widget.setScale(.9);
            ui.removeAllChildren();
            ui.data = data;
            ui.addChild(widget);
            ui.show();
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.setXuanZhong(sender.getName());
                    // me.setXuanZhong(sender.idx);
                    G.frame.tiejiangpu.bViewDown && G.frame.tiejiangpu.bViewDown.getIdxData(sender.data,me._type);
                    me.isTouch = true;
                }
            });
            // me.itemArr.push(widget);
            // if(pos == 0 && !me.isTouch){
            //      me.ui.setTimeout(function () {
            //          me.tableView.cellByName(0)[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
            //      },200);
            // }
            ui.show();
        },
        checkRedPoint: function(target){
            if(X.checkHeCheng(target.data.need)) {
                G.setNewIcoImg(target, .9);
            }else{
                G.removeNewIco(target);
            }

        },
        setXuanZhong: function (name) {
            var me = this;

            if (me.tableView._table.getItemByName(name)) {
                if(me._lastXz){
                    cc.sys.isObjectValid(me._lastXz) && me._lastXz.setGou(false);
                }
                me._lastXz = me.tableView._table.getItemByName(name)[0].getChildren()[0];
                me._lastXz.setGou(true);
            }
        },
        // setXuanZhong:function(d) {
        //     var me = this;
        //     for(var j in me.itemArr) {
        //         if(d == me.itemArr[j].idx)
        //             me.itemArr[j].setHighlight(true);
        //         else
        //             me.itemArr[j].setHighlight(false);
        //     }
        // },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview_1);
        },
        onShow : function(){
            var me = this;
            me.setContents();
            me.isShow = true;
            me.bindBtn();

            //设置上方位置
            var txt_1 = me.finds('text_1');
            // me.setPosition(0,me.height - txt_1.y - txt_1.height);
        },
        onNodeShow : function(){
            var me = this;
        }
    });

})();