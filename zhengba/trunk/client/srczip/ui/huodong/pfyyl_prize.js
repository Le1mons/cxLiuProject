/**
 * Created by  on 2019//.
 */
(function () {
    //皮肤摇摇乐-奖励
    var ID = 'pfyyl_prize';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().prize;
            me._data = me.data()._data;
            me.gotarr = me.data().gotarr;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.setTouchEnabled(true);
            me.nodes.panel_list.hide();
            me.nodes.list.hide();
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;

            var data = [];
            for(var i = 0; i < Math.ceil(me.DATA.length / 3); i++){
                var arr = [];
                for(var j = i*3; j < (me.DATA.length < (i+1)*3 ? me.DATA.length : (i+1)*3); j++){
                    me.DATA[j].index = j;
                    arr.push(me.DATA[j]);
                }
                data.push(arr);
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 5, 5);
                table.setData(data);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            for(var i = 0; i < data.length; i++){
                var list = me.nodes.list.clone();
                list.show();
                list.setPosition(0,0);
                X.autoInitUI(list);
                var prize = G.class.sitem(data[i].prize[0]);
                prize.setPosition(list.nodes.ico_jl.width / 2, list.nodes.ico_jl.height / 2);
                list.nodes.ico_jl.removeAllChildren();
                list.nodes.ico_jl.addChild(prize);
                G.frame.iteminfo.showItemInfo(prize);
                //判断是否还有次数
                if(me.gotarr[data[i].index] >= me.DATA[data[i].index].num){
                    prize.setGet(true,'img_ysq','sold');
                    list.setTouchEnabled(false);
                }else {
                    prize.setGet(false);
                    list.setTouchEnabled(true);
                }

                list.nodes.txt_wp_wz.setString(G.class.getItem(data[i].prize[0].t).name);
                list.buyname = G.class.getItem(data[i].prize[0].t).name;
                list.nodes.txt_wp_wz.setTextColor(cc.color(G.gc.COLOR[G.class.getItem(data[i].prize[0].t).color]));
                var img = new ccui.ImageView(G.class.getItemIco(data[i].need[0].t),1);
                var rh = X.setRichText({
                    str:"<font node=1></font>  " + "<font color = #874b25>" + data[i].need[0].n + "</font>",
                    parent:list.nodes.ico_xh,
                    node:img
                });
                rh.x = list.nodes.ico_xh.width / 2;
                rh.y = list.nodes.ico_xh.height / 2 - 5;
                rh.setAnchorPoint(0.5,0.5);
                ui.nodes['panel_' + (i+1)].setSwallowTouches(false);
                ui.nodes['panel_' + (i+1)].removeAllChildren();
                ui.nodes['panel_' + (i+1)].addChild(list);
                list.index = data[i].index;
                list.costnum = data[i].need[0].n;
                list.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        var str = X.STR(L("PFYYLDUIHUAN"), sender.costnum, sender.buyname);
                        G.frame.alert.data({
                            sizeType: 3,
                            cancelCall: null,
                            okCall: function () {
                                me.ajax('huodong_use',[me._data.hdid,2,sender.index],function (str,data) {
                                    if(data.s == 1){
                                        G.frame.jiangli.data({
                                            prize:data.d.prize,
                                        }).show();
                                        G.frame.huodong._panels.getData(function () {
                                            me.DATA = G.frame.huodong._panels.DATA.info.duihuan;
                                            me.gotarr = G.frame.huodong._panels.DATA.myinfo.gotarr;
                                            me.setContents();
                                            G.frame.huodong._panels.refreshInfo();
                                        });
                                        G.hongdian.getData("huodong", 1);
                                    }
                                })
                            },
                            richText: str,
                        }).show();
                    }
                })
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('event_zpjl.json', ID);
})();