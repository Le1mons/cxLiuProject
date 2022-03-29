/**
 * Created by LYF on 2018/11/15.
 */
(function () {
    //tiejiangu_table
    G.class.tiejiangu_zhuanhuan_table = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('zhuangbei_zbxz2.json');
        },
        refreshData :function (type) {
            var me = this;
            me.type = type;
            me.DATA = me.getData(type);
            me.setContents();
        },
        bindBtn: function(){
            var me = this;

            me.ui.finds('$btn_fanhui').click(function(sender, type){
                G.frame.tiejiangpu.remove();
            });
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;

            if(data.length < 1) {
                me.nodes.img_zw.show();
            }else {
                me.nodes.img_zw.hide();
            }

            if (!me.tableView) {
                me.tableView = new X.TableView(me.scrollview, me.nodes.panel_tb1, 5, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] * 5 + pos[1]);
                }, null, null, 1, 5);
                me.tableView.setData(data);
                me.tableView.reloadDataWithScroll(true);
            }else {
                me.tableView.setData(data);
                me.tableView.reloadDataWithScroll(true);
            }

            me.ui.setTimeout(function () {
                if (!me.isTouch) {
                    cc.isNode(me.tableView.getAllChildren()[0]) && me.tableView.getAllChildren()[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                }else {
                    if(cc.isNode(me.tableView.getAllChildren()[me.isTouch])) {
                        me.tableView.getAllChildren()[me.isTouch].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                    }else {
                        me.tableView.getAllChildren()[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                    }
                }
            }, 200);
        },
        getNum: function(wid) {
            var equip = G.frame.beibao.DATA.zhuangbei.list;

            for (var i in equip) {
                if(equip[i].eid == wid.data.id && equip[i].num > 0) {
                    return equip[i].num - equip[i].usenum;
                }
            }

            return 0;
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
            widget.setScale(.9);
            var num = me.getNum(widget);
            widget.num.setString(num > 0 ? num : "");
            widget.num.x -= 9;
            widget.num.y += 15;
            ui.idx = pos;
            ui.data = data;
            ui.removeAllChildren();
            ui.addChild(widget);
            ui.show();
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.isTouch = sender.idx;
                    me.selected = sender.children[0].data.id;
                    me.eid = sender.children[0].data.id;
                    me.btn = sender;
                    me.setXuanZhong(sender.getName());
                    G.frame.tiejiangpu.bViewDown && G.frame.tiejiangpu.bViewDown.getIdxData(sender.data);
                }
            });
            ui.show();
            ui.setTimeout(function () {
                if(me.selected && me.selected == ui.children[0].data.id) {
                    me.setXuanZhong(ui.getName())
                }
            }, 200)
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
        onOpen: function () {
            var me = this;

            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview_1);
        },
        onShow : function(){
            var me = this;

            me.nodes.panel_tb1.hide();
            me.scrollview = me.nodes.scrollview_1;
        },
        getData: function(type) {
            var arr = [];
            var data = G.class.equip.get();

            for (var i in data) {
                if(data[i].type == type && data[i].changeprize.length > 0) {
                    arr.push(data[i]);
                }
            }

            arr.sort(function (a, b) {
                if(a.color != b.color) {
                    return a.color < b.color ? -1 : 1;
                }else {
                    return a.star < b.star ? -1 : 1;
                }
            });

            return arr;
        },
    });

})();