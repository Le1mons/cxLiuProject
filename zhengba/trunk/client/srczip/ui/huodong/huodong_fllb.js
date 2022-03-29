/**
 * Created by  on 2019//.
 */
(function () {
    //福利礼包
    G.class.huodong_fllb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_czlb.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.checkRedPoint();
            X.viewCache.getView("event_list1.json", function (node) {
                me.list = node.nodes.panel_list;
                me.nodes.panel_mrfl.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
            cc.enableScrollBar(me.nodes.scrollview,false);
        },
        checkRedPoint:function(){
            var me = this;
            if(G.DATA.hongdian.weekmonthlibao && G.DATA.hongdian.weekmonthlibao.day){
                G.setNewIcoImg(me.nodes.panel_mrfl);
            }else {
                G.removeNewIco(me.nodes.panel_mrfl);
            }
            if(G.DATA.hongdian.weekmonthlibao && G.DATA.hongdian.weekmonthlibao.week){
                G.setNewIcoImg(me.nodes.panel_mzfl);
            }else {
                G.removeNewIco(me.nodes.panel_mzfl);
            }
            if(G.DATA.hongdian.weekmonthlibao && G.DATA.hongdian.weekmonthlibao.month){
                G.setNewIcoImg(me.nodes.panel_myfl);
            }else {
                G.removeNewIco(me.nodes.panel_myfl);
            }
        },
        bindBtn: function () {
            var me = this;
            //周月礼包开启vip2 每日礼包开启vip0
            if(P.gud.vip >= 2){
                me.nodes.panel_mrfl.show();
                me.nodes.panel_mzfl.show();
                me.nodes.panel_myfl.show();
            }else {
                me.nodes.panel_mrfl.hide();
                me.nodes.panel_mzfl.hide();
                me.nodes.panel_myfl.hide();
            }
            me.nodes.panel_mrfl.click(function () {
                me.nodes.img_01.show();
                me.nodes.img_02.hide();
                me.nodes.img_03.hide();
                me.nodes.txt_mzfl.setTextColor(cc.color("#E8C581"));
                me.nodes.txt_mrfl.setTextColor(cc.color("#813D00"));
                me.nodes.txt_myfl.setTextColor(cc.color("#E8C581"));
                X.timeout(me.nodes.txt_time, X.getTodayZeroTime()+24*3600,null,null,{
                    showDay:true
                });
                me.getData('day',function () {
                    me.sortData('day');
                    me.showDay();
                });
            });
            me.nodes.panel_mzfl.click(function () {
                me.nodes.img_01.hide();
                me.nodes.img_02.show();
                me.nodes.img_03.hide();
                me.nodes.txt_mrfl.setTextColor(cc.color("#E8C581"));
                me.nodes.txt_mzfl.setTextColor(cc.color("#813D00"));
                me.nodes.txt_myfl.setTextColor(cc.color("#E8C581"));
                me.getData('week',function () {
                    me.sortData('week');
                    me.showWeek();
                });
            });
            me.nodes.panel_myfl.click(function () {
                me.nodes.img_01.hide();
                me.nodes.img_02.hide();
                me.nodes.img_03.show();
                me.nodes.txt_mrfl.setTextColor(cc.color("#E8C581"));
                me.nodes.txt_mzfl.setTextColor(cc.color("#E8C581"));
                me.nodes.txt_myfl.setTextColor(cc.color("#813D00"));
                me.getData('month',function () {
                    me.sortData('month');
                    me.showMonth();
                });
            });
        },
        getData:function(type,callback){
            var me = this;
            me.ajax('weekmonthlibao_open', [type], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    if(type != 'day' && !me.DATA.itemdict[type + "_" + 0]) {
                        me.DATA.itemdict[type + "_" + 0] = {};
                        me.DATA.itemdict[type + "_" + 0].num = 1;
                    }
                    callback && callback();
                }
            });
        },
        sortData:function(type){
            var me = this;
            if(!G.gc.weekmonth[type][me.DATA.key]){
                me.monthdata = [];
                return;
            }
            var libaoData = G.gc.weekmonth[type][me.DATA.key].itemdict;
            var data = [];
            for (var key in me.DATA.itemdict) {
                if(libaoData[key] && (P.gud.vip >= libaoData[key].vip || !libaoData[key].vip)){
                    data.push({"name":key,"num":me.DATA.itemdict[key].num,index:libaoData[key].sort});
                }
            }
            for (var i = 0; i < data.length; i++) {
                for (var key in libaoData) {
                    if (data[i].name == key) {
                        data[i].rmbmoney = libaoData[key].rmbmoney;
                        break;
                    }
                }
            }
            data.sort(function (a,b) {
                var leftA = a.num == 0;
                var leftB = b.num == 0;
                if(leftA != leftB){
                    return leftA < leftB ? -1:1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            me.dataArr = data;
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
        showDay:function () {
            var me = this;
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model: "5502a"
            });
            me.nodes.img_bg.removeBackGroundImage();
            me.nodes.img_bg.setBackGroundImage('img/event/img_event_banner36.png',0);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data, pos) {
                X.autoInitUI(ui);
                ui.show();
                ui.setSwallowTouches(false);
                me.setDayItem(ui, data, pos[0]);
            }, null, null, 0, 0);
            table.setData(me.dataArr);
            table.reloadDataWithScroll(true);
        },
        setDayItem: function (ui, data, index) {
            var me = this;
            X.autoInitUI(ui);
            var libaoData = G.gc.weekmonth.day[me.DATA.key].itemdict[data.name];
            var num = libaoData.bymaxnum-data.num;
            X.render({
                txt: function (node) {
                    node.removeAllChildren();
                    if (data.num == 0) {
                        var str = X.STR(L("CZLB_XG"), "#ff4222",  data.num);
                    } else {
                        var str = X.STR(L("CZLB_XG"), "#1cab32",  data.num);
                    }

                    var rt = new X.bRichText({
                        size: 22,
                        lineHeight: 24,
                        color:"#522a11",
                        maxWidth:node.width,
                        family:G.defaultFNT
                    });
                    rt.text(str);
                    rt.setAnchorPoint(0, 1);
                    rt.setPosition(cc.p(node.width*0.5 - rt.trueWidth()*0.5, node.height));
                    node.removeAllChildren();
                    node.addChild(rt);
                },
                ico_item: function (node) {
                    var raceArr = [];
                    for (var i = 0; i < libaoData.p.length; i++) {
                        var paize = G.class.sitem(libaoData.p[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        raceArr.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, raceArr,1,10,5);
                },
                img_zk:function (node) {
                    if(libaoData.sale == 10){
                        node.hide();
                    }else{
                        node.show();
                        ui.nodes.txt_zk.setString(libaoData.sale+L("sale"));
                        X.enableOutline(ui.nodes.txt_zk, "#008000", 2);
                    }
                },
                btn: function (node) {
                    var money = libaoData.rmbmoney/100;
                    ui.nodes.btn_txt.setString(money+L("YUAN"));
                    node.setTouchEnabled(true);
                    if (num >= libaoData.bymaxnum) {
                        node.setBright(false);
                        ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                    } else {
                        node.setBright(true);
                        ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n12));
                    }
                    node.click(function (sender) {
                        if(!sender.isBright()){
                            G.tip_NB.show(L('GOUMAO_WU'));
                            return;
                        }
                        G.event.removeListener("paysuccess", X.showPayPrize);
                        G.event.once('paysuccess', X.showPayPrize, {
                            prize: libaoData.p,
                            call: function () {
                                cc.callLater(function () {
                                    me.getData('day',function () {
                                        me.sortData('day');
                                        me.table.setData(me.dataArr);
                                        me.table.reloadDataWithScroll(false);
                                        G.hongdian.getData('weekmonthlibao',1,function () {
                                            G.frame.huodong.checkRedPoint();
                                            me.checkRedPoint();
                                        })
                                    });
                                });
                            }
                        });
                        G.event.emit('doSDKPay', {
                            pid: data.name,
                            logicProid: data.name,
                            money: libaoData.rmbmoney,
                        });
                    })
                },
            }, ui.nodes);
        },
        showWeek:function () {
            var me = this;
            me.nodes.img_bg.removeBackGroundImage();
            me.nodes.img_bg.setBackGroundImage('img/event/img_event_banner2.png',0);
            me.nodes.panel_hero1.removeAllChildren();
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model: "6402a"
            });
            X.timeout(me.nodes.txt_time, me.DATA.et,null,null,{
                showDay:true
            });
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                X.autoInitUI(ui);
                ui.show();
                ui.setSwallowTouches(false);
                me.setWeekItem(ui, data);
            }, null, null, 0, 0);
            table.setData(me.dataArr);
            table.reloadDataWithScroll(true);
        },
        setWeekItem:function (ui, data) {
            var me = this;
            var libaoData = G.gc.weekmonth.week[me.DATA.key].itemdict[data.name];
            X.render({
                btn: function (node) {
                    node.data = data;
                    node.setBright(data.num < 1 ? false : true);
                    node.setTouchEnabled(data.num < 1 ? false : true);
                    if(data.rmbmoney == 0 && data.num > 0){
                        G.setNewIcoImg(node);
                        node.finds('redPoint').setPosition(118,50);
                    }else {
                        G.removeNewIco(node)
                    }
                    node.click(function (sender, type) {
                        if(sender.data.rmbmoney == 0){
                            me.ajax('weekmonthlibao_receive',['week',sender.data.name],function (str,data) {
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize:libaoData.p
                                    }).show();
                                    G.frame.huodong.updateTop();
                                    me.getData('week',function () {
                                        me.sortData('week');
                                        me.table.setData(me.dataArr);
                                        me.table.reloadDataWithScroll(false);
                                        G.hongdian.getData('weekmonthlibao',1,function () {
                                            G.frame.huodong.checkRedPoint();
                                            me.checkRedPoint();
                                        })
                                    });
                                }
                            })
                        }else {
                            G.event.removeListener("paysuccess", X.showPayPrize);
                            G.event.once('paysuccess', X.showPayPrize, {
                                prize: libaoData.p,
                                call: function () {
                                    cc.callLater(function () {
                                        me.getData('week',function () {
                                            me.sortData('week');
                                            me.table.setData(me.dataArr);
                                            me.table.reloadDataWithScroll(false);
                                            G.hongdian.getData('weekmonthlibao',1,function () {
                                                G.frame.huodong.checkRedPoint();
                                                me.checkRedPoint();
                                            })
                                        });
                                    });
                                }
                            });
                            G.event.emit('doSDKPay', {
                                pid: data.name,
                                logicProid: data.name,
                                money: libaoData.rmbmoney,
                            });
                        }
                    }, 1000)
                },
                ico_item: function (node) {
                    var raceArr = [];
                    for (var i = 0; i < libaoData.p.length; i++) {
                        var paize = G.class.sitem(libaoData.p[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        raceArr.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, raceArr,1,10,5);
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("XGX"), data.num), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0.5,0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt);
                },
                btn_txt: function (node) {
                    node.setString(data.rmbmoney / 100 + L("YUAN"));
                    if(data.num < 1){
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else{
                        node.setTextColor(cc.color("#7b531a"))
                    }
                },
                img_zk: function (node) {
                    if(data.sale) {
                        node.show();
                        ui.nodes.txt_zk.setString(data.sale + L("sale"));
                        X.enableOutline(ui.nodes.txt_zk, "#008000", 2);
                    } else {
                        node.hide();
                    }
                }
            }, ui.nodes);
        },
        showMonth:function () {
            var me = this;
            me.nodes.img_bg.removeBackGroundImage();
            me.nodes.img_bg.setBackGroundImage('img/event/img_event_banner3.png',0);
            me.nodes.panel_hero1.removeAllChildren();
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model: "5205a"
            });
            X.timeout(me.nodes.txt_time, me.DATA.et,null,null,{
                showDay:true
            });
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                X.autoInitUI(ui);
                ui.show();
                ui.setSwallowTouches(false);
                me.setMonthItem(ui, data);
            }, null, null, 0, 0);
            table.setData(me.dataArr);
            table.reloadDataWithScroll(true);
        },
        setMonthItem:function (ui,data) {
            var me = this;
            var libaoData = G.gc.weekmonth.month[me.DATA.key].itemdict[data.name];
            X.render({
                btn: function (node) {
                    node.data = data;
                    node.setBright(data.num < 1 ? false : true);
                    node.setTouchEnabled(data.num < 1 ? false : true);
                    if(data.rmbmoney == 0 && data.num > 0){
                        G.setNewIcoImg(node);
                        node.finds('redPoint').setPosition(118,50);
                    }else {
                        G.removeNewIco(node)
                    }
                    node.click(function (sender, type) {
                        if(sender.data.rmbmoney == 0){
                            me.ajax('weekmonthlibao_receive',['month',sender.data.name],function (str,data) {
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize:libaoData.p
                                    }).show();
                                    G.frame.huodong.updateTop();
                                    me.getData('month',function () {
                                        me.sortData('month');
                                        me.table.setData(me.dataArr);
                                        me.table.reloadDataWithScroll(false);
                                        G.hongdian.getData('weekmonthlibao',1,function () {
                                            G.frame.huodong.checkRedPoint();
                                            me.checkRedPoint();
                                        })
                                    });
                                }
                            })
                        }else {
                            G.event.removeListener("paysuccess", X.showPayPrize);
                            G.event.once('paysuccess', X.showPayPrize, {
                                prize: libaoData.p,
                                call: function () {
                                    cc.callLater(function () {
                                        me.getData('month',function () {
                                            me.sortData('month');
                                            me.table.setData(me.dataArr);
                                            me.table.reloadDataWithScroll(false);
                                            G.hongdian.getData('weekmonthlibao',1,function () {
                                                G.frame.huodong.checkRedPoint();
                                                me.checkRedPoint();
                                            })
                                        });
                                    });
                                }
                            });
                            G.event.emit('doSDKPay', {
                                pid: data.name,
                                logicProid: data.name,
                                money: libaoData.rmbmoney,
                            });
                        }
                    }, 1000)
                },
                ico_item: function (node) {
                    var raceArr = [];
                    for (var i = 0; i < libaoData.p.length; i++) {
                        var paize = G.class.sitem(libaoData.p[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        raceArr.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, raceArr,1,10,5);
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("XGX"), data.num), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0.5,0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt);
                },
                btn_txt: function (node) {
                    node.setString(data.rmbmoney / 100 + L("YUAN"));
                    if(data.num < 1){
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else{
                        node.setTextColor(cc.color("#7b531a"))
                    }
                },
                img_zk: function (node) {
                    if(data.sale) {
                        node.show();
                        ui.nodes.txt_zk.setString(data.sale + L("sale"));
                        X.enableOutline(ui.nodes.txt_zk, "#008000", 2);
                    } else {
                        node.hide()
                    }
                }
            }, ui.nodes);
        }
    });
})();