/**
 * Created by 嘿哈 on 2020/4/11.
 */
(function () {
//皮肤商店
    G.class.huodong_pfsd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_pfsd.json");
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
        },
        onOpen:function(){
            var me = this;
            if(me._data.etime - G.time > 24*3600){
                me.nodes.txt_sj_tiem.setString(X.moment(me._data.etime - G.time));
            }else{
                X.timeout(me.nodes.txt_sj_tiem,me._data.etime,function(){
                    me.nodes.txt_sj_tiem.setString(L("YJS"));
                })
            }
            me.nodes.ico2.removeBackGroundImage();
            me.nodes.ico2.setBackGroundImage(G.class.getItemIco("2060"),1);
            me.nodes.wz_sz2.setString(G.class.getOwnNum("2060","item"));
        },
        onShow:function(){
            var me = this;
            me.getData(function(){
                for(var i = 0; i < me._data.data.arr.length; i++){
                    me._data.data.arr[i].index = i;
                    if(me.DATA.val[i] > 0){
                        me._data.data.arr[i].order = 1;
                    }else {
                        me._data.data.arr[i].order = 0;
                    }
                }
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            var data =[].concat(me._data.data.arr);
            data.sort(function(a,b){
                if(a.order != b.order){
                    return a.order > b.order ? -1 :1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
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
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.ico_item.removeAllChildren();
            var item = G.class.sitem(data.prize[0]);
            item.setPosition(0,0);
            item.setAnchorPoint(0,0);
            ui.nodes.ico_item.addChild(item);
            var rh = X.setRichText({
                parent:ui.nodes.txt_title,
                str:G.class.getItem(data.prize[0].t,data.prize[0].a).name,
                color:"#804326",
            });
            ui.nodes.txt_xj_jg.setString(me.DATA.val[data.index]);//剩余次数
            ui.nodes.txt_xj_jg.setTextColor(cc.color("#be5e30"));
            ui.finds('txt_xjjj$_0_0').setTextColor(cc.color("#804326"));
            ui.finds('text_yc').setTextColor(cc.color("#2f5719"));
            ui.nodes.panel_token.removeBackGroundImage();
            ui.nodes.panel_token.setBackGroundImage(G.class.getItemIco(data.duihuan[0].t),1);
            ui.nodes.text_sl.setString(data.duihuan[0].n);
            ui.nodes.text_sl.setTextColor(cc.color("#fff3ca"));
            X.enableOutline(ui.nodes.text_sl,"#000000");
            ui.finds('txt_xjjj$_0').setTextColor(cc.color("#804326"));
            ui.nodes.txt_xjjj.setTextColor(cc.color("#804326"));
            if(me.DATA.val[data.index]){
                ui.nodes.btn_ysq.hide();
                ui.nodes.btn_1.show();
                ui.nodes.btn.setBtnState(true);
                ui.nodes.btn_txt.setString(data.buy.unitPrice / 100+L("YUAN"));
                ui.nodes.btn_txt.setTextColor(cc.color("#7b531a"));
            }else {
                ui.nodes.btn_ysq.show();
                ui.nodes.btn_ysq.setBtnState(false);
                ui.nodes.text_ysqs.setTextColor(cc.color(G.gc.COLOR.n15));
                ui.nodes.btn_1.hide();
                ui.nodes.btn.setBtnState(false);
                ui.nodes.btn_txt.setString(L("BTN_YSQ"));
                ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
            }
            //兑换
            ui.nodes.btn_1.index = data.index;
            ui.nodes.btn_1.setSwallowTouches(false);
            ui.nodes.btn_1.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax('huodong_use', [me._data.hdid,1,sender.index], function (str,data) {
                        if (data.s == 1) {
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
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
                            me.refreshPanel();
                        }
                    })
                }
            });
            //购买
            ui.nodes.btn.data = data;
            ui.nodes.btn.setSwallowTouches(false);
            ui.nodes.btn.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.event.once('paysuccess', function(arg) {
                        if(arg && arg.success) {
                            G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            me.refreshPanel();
                        }
                    });
                    G.event.emit('doSDKPay', {
                        pid: sender.data.buy.proid,
                        logicProid: sender.data.buy.proid,
                        money: sender.data.buy.unitPrice,
                    });
                }
            });
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
            me.nodes.wz_sz2.setString(G.class.getOwnNum("2060","item"));
        },
        getData:function(callback){
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
        }
    });
})();