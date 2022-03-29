/**
 * Created by  on 2019//.
 */
(function () {
    //王者商城
    G.class.wangzhezhaomu_shop = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            X.viewCache.getView('event_list1.json', function (node) {
                me.list = node.nodes.panel_list;
                me.getData(function () {
                    me.setBanner();
                    me.setContents();
                });
            });
        },
        setBanner: function () {
            var me = this;
            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner30.png', 0);
                },
                txt_count:L("SYSJ"),
                txt_time:function (node) {
                    if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me.DATA.info.etime - G.time));
                    }else {
                        X.timeout(node, me.DATA.info.etime, function () {
                            me.timeout = true;
                        });
                    }
                }
            },me.nodes);
        },
        setContents:function(){
            var me = this;
            var data = [].concat(me.DATA.info.data.openinfo.libao);
            data.sort(function(a,b){
                if(a.order != b.order){
                    return a.order > b.order ? -1:1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            X.alignItems(ui.nodes.ico_item,data.p,"left",{
                touch:true
            });
            var str = X.STR(L("WANZGHEZHAOMU7"),data.val - (me.DATA.libao.buyinfo[data.index] || 0));
            var rh = X.setRichText({
                parent:ui.nodes.txt,
                str:str,
                size:19,
                anchor: {x: 0.5, y: 0},
                pos: {x: ui.nodes.txt.width / 2, y: 0}
            });
            if(data.val - (me.DATA.libao.buyinfo[data.index] || 0) > 0){
                ui.nodes.btn.setBtnState(true);
                ui.nodes.btn_txt.setString(data.money / 100 + L("YUAN"));
                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n12));
            }else {
                ui.nodes.btn.setBtnState(false);
                ui.nodes.btn_txt.setString(L("BTN_YSQ"));
                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
            }
            ui.nodes.btn.data = data;
            ui.nodes.btn.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.event.once('paysuccess', function() {
                        G.frame.jiangli.data({
                            prize:sender.data.p
                        }).show();
                        me.getData(function(){
                            me.setContents();
                        });
                    });
                    G.event.emit('doSDKPay', {
                        pid:sender.data.pid,
                        logicProid:sender.data.pid,
                        money: sender.data.money,
                    });
                }
            })

        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open',['libao'],function(str,data){
                if(data.s == 1){
                    me.DATA = data.d;
                    for(var i = 0; i < me.DATA.info.data.openinfo.libao.length;i++){
                        me.DATA.info.data.openinfo.libao[i].index = i;
                        if(me.DATA.info.data.openinfo.libao[i].val <= me.DATA.libao.buyinfo[i]){
                            me.DATA.info.data.openinfo.libao[i].order = 0;
                        }else {
                            me.DATA.info.data.openinfo.libao[i].order = 1;
                        }
                    }
                    callback && callback();
                }
            })
        }
    });
})();