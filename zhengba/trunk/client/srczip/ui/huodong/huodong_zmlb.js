/**
 * Created by 嘿哈 on 2020/3/23.
 */

(function () {
    //周末礼包
    G.class.huodong_zmlb = X.bView.extend({
        day : ['6','0','1'],//周六周日周一
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_zmlb.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid,function(d){
            //     me.DATA = d;
            //     callback && callback();
            // })
        },
        bindBTN: function() {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.ifMonday = G.time <= X.getLastMondayZeroTime() + 24*3600;//今天是不是周一
            var endtime;
            if(me.ifMonday){
                me.time = {//周六周日周一时间段
                    "6" : [X.getLastMondayZeroTime() - 2*24*3600, X.getLastMondayZeroTime() - 24*3600],
                    "0" : [X.getLastMondayZeroTime() - 24*3600, X.getLastMondayZeroTime()],
                    "1" : [X.getLastMondayZeroTime(), X.getLastMondayZeroTime() + 24*3600],
                };
                endtime = X.getLastMondayZeroTime() + 24*3600;
            }else {
                me.time = {//周六周日周一时间段
                    "6" : [X.getLastMondayZeroTime() + 5*24*3600, X.getLastMondayZeroTime() + 6*24*3600],
                    "0" : [X.getLastMondayZeroTime() + 6*24*3600, X.getLastMondayZeroTime() + 7*24*3600],
                    "1" : [X.getLastMondayZeroTime() + 7*24*3600, X.getLastMondayZeroTime() + 8*24*3600],
                };
                endtime = X.getLastMondayZeroTime() + 8*24*3600;
            }
            me.bindBTN();
            //倒计时
            if(endtime - G.time > 24 * 3600){
                me.nodes.txt_cs.setString(X.moment(endtime - G.time));
            }else {
                X.timeout(me.nodes.txt_cs,endtime);
            }
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        setBanner: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            for(var i = 0; i < me.day.length; i++){
                var list = me.nodes.list.clone();
                list.setPosition(10,0);
                list.setAnchorPoint(0,0);
                var data = me.DATA.info.arr[me.day[i]];
                me.setItem(list,data,parseInt(me.day[i]));
                me.nodes['panel_nr' + (i+1)].removeAllChildren();
                me.nodes['panel_nr' + (i+1)].addChild(list);
            }
        },
        setItem:function(ui,data,day){
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            //日期
            var time = X.timetostr(me.time[day][0],'m-d');
            var month = time.split("-");
            ui.nodes.txt_rq.setString(X.STR(L("MONTHANDDAY"),month[0],month[1]));
            ui.nodes.txt_rq.setTextColor(cc.color("#fffca0"));
            X.enableOutline(ui.nodes.txt_rq,"#764e28");
            //var key;
            //if(me.ifMonday){//是周一
            //    if(day == 1){
            //        key = me.weekIndex;
            //    }else {
            //        key = me.weekIndex - 1;
            //    }
            //}else {
            //    if(day == 1){
            //        key = me.weekIndex+1;
            //    }else {
            //        key = me.weekIndex;
            //    }
            //}
            //var gotarr = me.DATA.myinfo.gotarr["2020-" + key];
            //只能当天才能奖励
            if(G.time >= me.time[day][0] && G.time <= me.time[day][1] && !X.inArray(me.DATA.myinfo.gotarr,day)){//可领取
                ui.nodes.img_ylq.hide();
                ui.nodes.btn_gmtp.show();
                ui.nodes.btn_gmtp.setBtnState(true);
                ui.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n13));
                G.setNewIcoImg(ui.nodes.btn_gmtp);
                ui.nodes.btn_gmtp.finds('redPoint').setPosition(130,50);
            }else if(X.inArray(me.DATA.myinfo.gotarr,day)){//已领取
                ui.nodes.img_ylq.show();
                ui.nodes.btn_gmtp.hide();
                G.removeNewIco(ui.nodes.btn_gmtp);
            }else {//不可领
                ui.nodes.img_ylq.hide();
                ui.nodes.btn_gmtp.show();
                ui.nodes.btn_gmtp.setBtnState(false);
                ui.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n15));
                G.removeNewIco(ui.nodes.btn_gmtp);
            }
            //奖励显示
            ui.nodes.panel_wp1.removeAllChildren();
            ui.nodes.panel_wp2.removeAllChildren();
            var prizearr1 = [];
            var prizearr2 = [];
            if(data.length == 1){
                var prizearr = [];
                for(var i = 0; i < data.length; i++){
                    var prize = G.class.sitem(data[i]);
                    G.frame.iteminfo.showItemInfo(prize);
                    prizearr.push(prize);
                }
                X.center(prizearr,ui.nodes.panel_wp3);
            }else if(data.length == 2){
                var prize1 = G.class.sitem(data[0]);
                var prize2 = G.class.sitem(data[1]);
                G.frame.iteminfo.showItemInfo(prize1);
                G.frame.iteminfo.showItemInfo(prize2);
                prizearr1.push(prize1);
                prizearr2.push(prize2);
                X.center(prizearr1,ui.nodes.panel_wp1);
                X.center(prizearr2,ui.nodes.panel_wp2);
            }else if(data.length == 3){
                var prize1 = G.class.sitem(data[0]);
                G.frame.iteminfo.showItemInfo(prize1);
                prizearr1.push(prize1);
                for(var i = 1; i < data.length; i++){
                    var prize = G.class.sitem(data[i]);
                    G.frame.iteminfo.showItemInfo(prize);
                    prizearr2.push(prize);
                }
                X.center(prizearr1,ui.nodes.panel_wp1);
                X.center(prizearr2,ui.nodes.panel_wp2);
            }else {
                for(var i = 0; i < 2; i++){
                    var prize1 = G.class.sitem(data[i]);
                    G.frame.iteminfo.showItemInfo(prize1);
                    prizearr1.push(prize1);
                }
                for(var j = 2; j < data.length; j++){
                    var prize2 = G.class.sitem(data[j]);
                    G.frame.iteminfo.showItemInfo(prize2);
                    prizearr2.push(prize2);
                }
                X.center(prizearr1,ui.nodes.panel_wp1);
                X.center(prizearr2,ui.nodes.panel_wp2);
            }
            ui.nodes.btn_gmtp.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax("huodong_use",[me._data.hdid,1,day],function(str,data){
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize,
                            }).show();
                            me.refreshPanel();
                            if(G.frame.zhounianqing_main.isShow){
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                            }else {
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                            }
                            // G.hongdian.getData("huodong", 1, function(){
                            //     G.frame.huodong.checkRedPoint();
                            // });
                        }
                    })
                }
            })

        }
    })
})();