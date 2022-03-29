/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //等级基金
    G.class.huodong_lvFund = X.bView.extend({
        extConf: {

        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_scrollview.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_buy.click(function (sender, type) {

                G.event.once('paysuccess', function() {
                    me.refreshPanel();
                    G.hongdian.getHongdian(1, function () {
                        G.frame.huodong.checkRedPoint();
                    })
                });
                G.event.emit('doSDKPay', {
					pid:me.DATA.info.payinfo.proid,
                    logicProid: me.DATA.info.payinfo.proid,
                    money: me.DATA.info.payinfo.unitprice,
                });
            }, 5000)
        },
        onOpen: function () {
            var me = this;

            me.hid = 400;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("event_list3.json", function (node) {
                me.list = node.nodes.panel_list;

                me.refreshPanel();
            });
            me.nodes.panel_banner2.hide();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("huodong_open", [me.hid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
            //me.setBaseInfo();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        refreshData: function () {
            var me = this;
            me.getData(function () {
                me.table.setData(me.DATA.prize);
                me.table.reloadDataWithScroll(false);
            });
            // me.setBaseInfo();
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner1.png', 0);
                },
                btn_buy: function (node) {
                    node.show();
                    X.inArray(me.DATA.myinfo.gotarr, -1) && node.hide();
                },
                btn_txt: function (node) {
                    node.setString(X.inArray(me.DATA.myinfo.gotarr, -1) ? L("YGM") : me.DATA.info.payinfo.showrmbmoney + L("YUAN"));
                }
            },me.nodes);
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "3108a"},
            });
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var data = me.DATA.info.arr;
            for(var i = 0; i < data.length; i ++){
                data[i].idx = i;
            }
            for(var i = 0; i < data.length; i ++){
                if(X.inArray(me.DATA.myinfo.gotarr, data[i].val)){
                    data[i].rank = 2;
                }else{
                    data[i].rank = 1;
                }
            }
            data.sort(function (a, b) {
                if(a.rank != b.rank){
                    return a.rank < b.rank ? -1 : 1;
                }else{
                    return a.val < b.val ? -1 : 1;
                }

            });

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                txt_jdt: function(node){
                    node.setString(P.gud.lv + "/" + data.val);
                    X.enableOutline(node,'#66370e',2);
                },
                txt_title: function (node) {
                    node.removeAllChildren();

                    var txt = new ccui.Text(X.STR(L("DJDDXJ"), data.val), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2 + 3);
                    node.addChild(txt);
                },
                img_jdt: function (node) {
                    node.setPercent(P.gud.lv / data.val * 100);
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.p, 'left', {
                        touch: true,
                        mapItem: function (item) {
                        }
                    })
                },
                btn_txt: function (node) {
                    node.setString(X.inArray(me.DATA.myinfo.gotarr, data.val) ? L("YLQ") : L("LQ"));
                    // X.inArray(me.DATA.myinfo.gotarr, -1) && node.setTextColor(cc.color(X.inArray(me.DATA.myinfo.gotarr, data.val) ? G.gc.COLOR.n15 :
                    //     (P.gud.lv >= data.val ? G.gc.COLOR.n13 : G.gc.COLOR.n15)));
                    // var is = X.inArray(me.DATA.myinfo.gotarr, data.val) ? false : true;
                    //var color = X.inArray(me.DATA.myinfo.gotarr, data.val) ? G.gc.COLOR.n15 : (P.gud.lv >= data.val ? G.gc.COLOR.n13 : G.gc.COLOR.n15);
                    //node.setTextColor(cc.color(color));
                    if( me.DATA.myinfo.gotarr.length >= 1 && P.gud.lv > data.val) {
                        node.setTextColor(cc.color(X.inArray(me.DATA.myinfo.gotarr, data.val) ? G.gc.COLOR.n15 : G.gc.COLOR.n13));
                    }else {
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }


                },
                btn: function (node) {
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    var is = X.inArray(me.DATA.myinfo.gotarr, data.val) ? false : true;
                    if(is && P.gud.lv >= data.val){
                        G.setNewIcoImg(node, .9);
                    }else{
                        is = false;
                        G.removeNewIco(node);
                    }
                    if( me.DATA.myinfo.gotarr.length >= 1 && P.gud.lv >= data.val ) {
                        node.setTouchEnabled(is);
                        node.setBright(is);
                    }else {
                       // node.setTouchEnabled(false);
                        node.setBright(false);
                    }
                    //node.setTouchEnabled(is);
                    //node.setBright(is);
                    node.click(function (sender, type) {
                        if(me.DATA.myinfo.gotarr.length < 1){
                            G.tip_NB.show(L("QXGMJJLB"));
                            return;
                        }
                        if(P.gud.lv < data.val){
                            G.tip_NB.show(L("DJWDDYQ"));
                            return;
                        }
                        G.ajax.send("huodong_use", [me.hid, 1, data.idx], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                me.refreshData();
                                G.frame.huodong.updateTop();
                                G.hongdian.getData("dengjiprize", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            }
                        }, true)
                    })
                }
            }, ui.nodes);
            ui.show();
        }
    })
})();
