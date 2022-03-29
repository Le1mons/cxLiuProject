/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //限时团购
    G.class.huodong_xstg = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_xianshituangou.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.bindBTN();
                me.ui.finds("listview").children[me.curType].triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._type.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._type.hdid,function(d){
            //     me.DATA = d;
            //     callback && callback();
            // })
        },
        bindBTN: function() {
            var me = this;

            if(X.inArray(G.DATA.hongdian.huodong, me._type.hdid)) {
                G.setNewIcoImg(me.nodes.btn_fx);
            }
            if(me.DATA.myinfo.receive) {
                me.nodes.btn_lq.setTouchEnabled(false);
                me.nodes.btn_lq.setBright(false);
                me.nodes.btn_lq.setTitleText(L("YLQ"));
                me.nodes.btn_lq.setTitleColor(cc.color("#6c6c6c"));
            }
            me.nodes.btn_lq.click(function (sender) {
                if(me._type.rtime > G.time) {
                    G.tip_NB.show(L("WDFXSJ"));
                    return;
                }
                if(me.DATA.myinfo.receive) {
                    G.tip_NB.show(L("FXYLQ"));
                    return;
                }
                me.ajax('huodong_use',[me._type.hdid, 2, 0], function (str, data) {
                    if (data.s == 1){
                        G.event.emit("sdkevent", {
                            event: "activity",
                            data:{
                                joinActivityType:me._data.stype,
                                consume:[],
                                get:data.p,
                            }
                        });
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.getData(function () {
                            me.nodes.txt_zs.setString(me.DATA.myinfo.val[0].n);
                        });
                        G.hongdian.getHongdian(1, function () {
                            G.frame.huodong.checkRedPoint();
                        });
                        G.removeNewIco(sender);
                        me.nodes.btn_lq.setTouchEnabled(false);
                        me.nodes.btn_lq.setBright(false);
                        me.nodes.btn_lq.setTitleText(L("YLQ"));
                        me.nodes.btn_lq.setTitleColor(cc.color("#6c6c6c"));
                    }
                },true);
            });
            me.nodes.btn_sz.click(function () {
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send('huodong_use',[me._type.hdid, 1, me.curType],function(d) {
                            if(!d) return;
                            var d = JSON.parse(d);
                            if(d.s == 1) {
                                G.event.emit("sdkevent", {
                                    event: "activity",
                                    data:{
                                        joinActivityType:me._type.stype,
                                        consume:me.need,
                                        get:d.d.prize,
                                    }
                                });
                                G.frame.jiangli.data({
                                    prize:[].concat(d.d.prize)
                                }).show();
                                me.refreshPanel();
                            }
                        },true);
                    },
                    richText: L("SFGM"),
                    sizeType: 3
                }).show();
            });
        },
        changeType: function(type, bool) {
            var me = this;
            me.curType = type;
            me.setContents();
        },
        createMenu: function() {
            var me = this;

            for(var i = 0; i < me._type.data.arr.length; i ++) {
                var data = me._type.data.arr[i];
                var item = G.class.sitem(data.p[0]);
                // item.num.hide();
                item.setName("item_" + i);
                item.setTouchEnabled(true);
                me.ui.finds("listview").pushBackCustomItem(item);
            }

            X.radio(me.ui.finds("listview").getChildren(), function (sender) {
                var name = sender.getName();

                me.changeType(name.split("_")[1]);
            }, {
                color: ["#ffffff", "#ffffff"],
                callback1: function (sender) {
                    if(sender.gou) {
                        sender.gou.show();
                    }else {
                        var gou = new ccui.ImageView('img/public/img_gou.png',1);
                        gou.setName('gou');
                        gou.setAnchorPoint(cc.p(0.5,0.5));
                        gou.setPosition(cc.p(sender.width / 2,sender.height / 2));
                        gou.setLocalZOrder(1000);
                        sender.addChild(gou);
                        sender.gou = gou;
                    }
                },
                callback2: function (sender) {
                    if(sender.gou) {
                        sender.gou.hide();
                    }
                }
            });
        },
        onOpen: function () {
            var me = this;

            cc.enableScrollBar(me.ui.finds("listview"));
            me.createMenu();
            me.ui.finds("listview").setItemsMargin(15);
            me.curType = 0;
            me.nodes.list.hide();
        },
        onShow: function () {
            var me = this;
            me.nodes.wz2.show();
            me.refreshPanel();
            me.setBanner();
            me.setState();
        },
        setState: function() {
            var me = this;

            if(me.isFX) {
                me.nodes.btn_lq.show();
                me.nodes.btn_sz.hide();
                me.nodes.wz1.hide();
                me.nodes.wz2.hide();
                me.ui.finds("zs_di").hide();
                me.ui.finds("txt_sjjs").show();
            }
        },
        setBanner: function () {
            var me = this;

            if(me._type.rtime - G.time > 24 * 3600 * 2) {
                me.nodes.wz3.setString(X.moment(me._type.rtime - G.time));
            }else {
                if(me._type.rtime < G.time) {
                    me.ui.finds("wz1_0").setString(L("FXJSSJ"));
                    me.isFX = true;
                    X.timeout(me.nodes.wz3, me._type.etime, function () {
                        me.nodes.wz3.setString(L("YJS"));
                    })
                }else {
                    X.timeout(me.nodes.wz3, me._type.rtime, function () {
                        me.ui.finds("wz1_0").setString(L("FXJSSJ"));
                        me.isFX = true;
                        X.timeout(me.nodes.wz3, me._type.etime, function () {
                            me.nodes.wz3.setString(L("YJS"));
                        })
                    })
                }
            }
        },
        setContents: function () {
            var me = this;
            var conf = me._type.data.arr[me.curType];
            var data = JSON.parse(JSON.stringify(me.DATA.info[me.curType]));
            var arr = ["wz_200", "wz_300", "wz_400", "wz_800"];

            for(var i = 1; i < conf.num2sale.length; i ++) {
                me.ui.finds(arr[i - 1]).setString(conf.num2sale[i][0]);
            }

            for(var i = 1; i < 5; i ++) {
                var per = data.buynum / conf.num2sale[i][0] * 100;
                if(data.buynum >= conf.num2sale[i][0]) {
                    me.nodes["jindutiao" + i].setPercent(100);
                }else if(data.buynum < conf.num2sale[i][0] && data.buynum > conf.num2sale[i - 1][0]){
                    me.nodes["jindutiao" + i].setPercent(per);
                }else {
                    me.nodes["jindutiao" + i].setPercent(0);
                }
            }

            me.nodes.wz_goumai.setString(X.STR(L("YGMXJ"), data.buynum));
            me.nodes.txt_zs.setString(me.DATA.myinfo.val[0].n);

            var item = G.class.sitem(data.p[0]);
            item.setPosition(me.nodes.ico.width / 2, me.nodes.ico.height / 2);
            G.frame.iteminfo.showItemInfo(item);
            me.nodes.ico.removeAllChildren();
            me.nodes.ico.addChild(item);
            me.nodes.text_zuanshi.setString(data.need[0].n);
            me.nodes.text_zuanshi2.setString(data.sale ? parseInt(data.need[0].n * data.sale / 100) : data.need[0].n);
            me.nodes.wz2.removeAllChildren();
            me.need = data.need;
            if(data.sale){
                me.need[0].n = me.need[0].n * data.sale / 100;
            }

            var str2 = new X.bRichText({
                size: 22,
                maxWidth: me.nodes.wz2.width,
                lineHeight: 32,
                family: G.defaultFNT,
                color: "#ffffff"
            });
            str2.text(X.STR(L("JRKGMXC"), me.DATA.myinfo.gotarr[me.curType].daynum));
            str2.setAnchorPoint(0, 0.5);
            str2.setPosition(0, me.nodes.wz2.height / 2);
            me.nodes.wz2.addChild(str2);
        },
    })
})();