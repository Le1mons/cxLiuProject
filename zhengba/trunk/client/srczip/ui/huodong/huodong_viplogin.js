/**
 * Created by  on 2019//.
 */
(function () {
    //贵族登录
    G.class.huodong_viplogin = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_vipdl.json");
        },
        onOpen: function () {
            var me = this;
            me.getDayIndex();
            me.bindBtn();
            if(me._data.etime - G.time > 24*3600){
                me.nodes.txt_cs.setString(X.moment(me._data.etime - G.time));
            }else{
                X.timeout(me.nodes.txt_cs,me._data.etime,function(){
                    me.nodes.txt_cs.setString(L("YJS"));
                })
            }
        },
        //活动开启的第几天
        getDayIndex:function(){
            var me = this;
            me.dayindex = 1;
            var opentime = me._data.stime + X.getOpenTimeToNight(me._data.stime);//活动开启当天晚上24点的时间戳
            if(G.time < opentime){//第一天
                me.dayindex =  1;
            }else {
                me.dayindex = Math.ceil((G.time - opentime) / 86400) + 1;
            }
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(true);
            cc.enableScrollBar(me.ui.finds('scrollview'));
            me.nodes.btn_xyg.click(function () {
                me.ajax('huodong_use',[me._data.hdid,0,0],function (str,data) {
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize,
                        }).show();
                        if(me._data.isqingdian){
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }
                        me.DATA.myinfo = data.d.myinfo;
                        me.jumpToday();
                        for(var i = 0; i < me.nodes.listview.children.length; i++){
                            me.nodes.listview.children[i].nodes.img_ylq.setVisible(me.DATA.myinfo.gotarr[i] >= 0);
                        }
                    }
                })
            })
        },
        initBtn:function(){
            var me = this;
            me.nodes.listview.removeAllChildren();
            for(var i = 0; i < me.DATA.info.arr.length; i++){
                var btn = me.nodes.list_btn.clone();
                X.autoInitUI(btn);
                btn.show();
                btn.nodes.img_ylq.setVisible(me.DATA.myinfo.gotarr[i] >= 0);
                btn.nodes.panel_day.setTouchEnabled(false);
                btn.nodes.panel_day.removeBackGroundImage();
                btn.nodes.panel_day.setBackGroundImage('img/carnival/img_carnival_day' + (i+1) + ".png",1);
                me.nodes.listview.pushBackCustomItem(btn);
                btn.id = i;
                btn.setTouchEnabled(true);
                btn.setSwallowTouches(false);
                btn.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        for(var j = 0; j < me.nodes.listview.children.length; j++){
                            if(sender.id != me.nodes.listview.children[j].id){
                                me.nodes.listview.children[j].setBright(true);
                            }
                        }
                        sender.setBright(false);
                        me.type = sender.id;
                        me.changeType(me.type);
                    }
                })
            }
        },
        changeType:function(type){
            var me = this;
            var data = me.DATA.info.arr[type];
            var scrollview = me.ui.finds('scrollview');
            for(var i = 0; i < data.length; i++){
                if(P.gud.vip >= data[i].vip){
                    me.cangetIndex = i;
                }
            }

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.nodes.panel_list, 1, function (ui, data,pos) {
                    me.setItem(ui, data,pos[0]);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

            //领奖状态 可领取 不可领 已领
            if(me.DATA.myinfo.gotarr[type] >= 0){//以领取
                me.nodes.btn_xyg.setBtnState(false);
                me.nodes.text_zd.setString(L('YLQ'));
                me.nodes.text_zd.setTextColor(cc.color(G.gc.COLOR.n15));
            }else {
                me.nodes.btn_xyg.setBtnState(false);
                me.nodes.text_zd.setString(L('LQ'));
                me.nodes.text_zd.setTextColor(cc.color(G.gc.COLOR.n15));
                for(var i = 0; i < data.length; i++){
                    if(P.gud.vip >= data[i].vip && me.dayindex >= type+1){//可领取
                        me.nodes.btn_xyg.setBtnState(true);
                        me.nodes.text_zd.setTextColor(cc.color(G.gc.COLOR.n13));
                        break;
                    }
                }
            }
        },
        setItem:function(ui,data,index){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.txt_title.setString(X.STR(L("GUIZU"),data.vip));
            X.alignItems(ui.nodes.panle_ico,data.p,"left",{
                touch:true,
                scale:0.8
            });
            ui.nodes.txt_ylq.setVisible(me.DATA.myinfo.gotarr[me.type] == index);
            if(me.dayindex >= (me.type + 1) && me.DATA.myinfo.gotarr[me.type] != index && me.cangetIndex == index){
                ui.nodes.txt_title.setTextColor(cc.color("#ffe8a5"));
                var color = cc.color("#a01e00");
                color.a = 255;
                ui.nodes.txt_title.enableOutline(color, 2);
            }else {
                ui.nodes.txt_title.setTextColor(cc.color("#7b531a"));
                var color = cc.color("#a01e00");
                color.a = 0;
                ui.nodes.txt_title.enableOutline(color, 1);
            }

        },
        onShow: function () {
            var me = this;
            me.getData(function () {
                me.initBtn();
                cc.callLater(function () {
                    me.jumpToday();
                });
            });
        },
        onAniShow: function () {
            var me = this;
        },
        jumpToday:function(){
            var me = this;
            me.jumpindex = me.dayindex > 7 ? 6 : me.dayindex-1;
            for(var i = 0; i < me.DATA.info.arr.length; i++){
                if(me.dayindex >= (i+1) && !X.inArray(X.keysOfObject(me.DATA.myinfo.gotarr),i)){
                    me.jumpindex = i;
                    break;
                }
            }
            me.nodes.listview.children[me.jumpindex].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.nodes.listview.jumpToIdx((me.jumpindex >= 5 ? me.jumpindex : 0));
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
    });
})();