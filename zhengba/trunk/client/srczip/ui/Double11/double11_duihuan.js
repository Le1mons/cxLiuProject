/**
 * Created by  on 2019//.
 */
(function () {
    //狂欢兑换
    var ID = 'double11_duihuan';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.tip_title.setString(L('DOUBLE11'));
            cc.enableScrollBar(me.nodes.scrollview);
            me.DATA = G.frame.Double11.DATA;
            me.showOwn();
            me.setContents();
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        showOwn:function(){
            var me = this;
            me.nodes.txt_wzsj.setString(G.class.getOwnNum(G.gc.double11.poolreturn,'item'));
        },
        setContents:function () {
            var me = this;
            var data = [].concat(G.gc.double11.exchange);
            for(var i = 0; i < data.length; i++){
                data[i].index = i;
                if(data[i].num - (me.DATA.exchange[i] || 0) == 0){
                    data[i].order = 0;
                }else {
                    data[i].order = 1;
                }
            }
            data.sort(function (a,b) {
                if(a.order != b.order){
                    return a.order > b.order ? -1:1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var prize1 = G.class.sitem(data.prize[0]);
            prize1.setPosition(0,0);
            prize1.setAnchorPoint(0,0);
            G.frame.iteminfo.showItemInfo(prize1);
            ui.nodes.item2.removeAllChildren();
            ui.nodes.item2.addChild(prize1);
            var prize2 = G.class.sitem(data.need[0]);
            prize2.setPosition(0,0);
            prize2.setAnchorPoint(0,0);
            G.frame.iteminfo.showItemInfo(prize2);
            ui.nodes.item1.removeAllChildren();
            ui.nodes.item1.addChild(prize2);
            var leftnum = data.num - (me.DATA.exchange[data.index] || 0);
            ui.nodes.txt.setString(X.STR(L('DOUBLE12'),leftnum));
            ui.nodes.btn.setBtnState(leftnum > 0);
            ui.nodes.btn_txt.setTextColor(cc.color(leftnum > 0 ? G.gc.COLOR.n13 : G.gc.COLOR.n15));
            ui.nodes.btn.data = data;
            ui.nodes.btn.leftnum = leftnum;
            ui.nodes.btn.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.buying.data({
                        num: 1,
                        item: sender.data.prize,
                        need: sender.data.need,
                        maxNum: leftnum,
                        callback: function (num) {
                            me.ajax("double11_exchange", [sender.data.index,num], function (str, d) {
                                if (d.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: d.d.prize
                                    }).show();
                                    me.DATA.exchange = d.d.data;
                                    G.frame.Double11.DATA.exchange = d.d.data;
                                    me.showOwn();
                                    me.setContents();
                                }
                            });
                        }
                    }).show();
                }
            })

        }
    });
    G.frame[ID] = new fun('event_double11_xyjc_tip3.json', ID);
})();