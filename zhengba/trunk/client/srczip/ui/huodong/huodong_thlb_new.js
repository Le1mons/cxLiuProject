/**
 * Created by  on 2019//.
 */
(function () {
    //特惠礼包整合
    G.class.huodong_thlb_new = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json", null, {action: true, releaseRes: false});
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        onOpen: function () {
            var me = this;
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model: me._data.model || '6102a'
            });
        },
        bindBtn: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            X.viewCache.getView("event_list1.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        getData: function(callback){
            var me = this;

            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
        },
        setBanner: function () {
            var me = this;

            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner36.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
                    node.removeAllChildren();
                    var txt_djs = new ccui.Text("", G.defaultFNT, 20);
                    var txt = new ccui.Text(L("HCZ"), G.defaultFNT, 20);
                    txt_djs.setTextColor(cc.color("#2bdf02"));
                    txt.setTextColor(cc.color("#ffffff"));
                    X.enableOutline(txt_djs, "#000000", 2);
                    X.enableOutline(txt, "#000000", 2);
                    txt_djs.setAnchorPoint(1, 0.5);
                    txt.setAnchorPoint(0, 0.5);
                    txt_djs.setPosition(node.width / 2, node.height / 2);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt_djs);
                    node.addChild(txt);
                    if(me._data.etime - G.time > 24 * 3600) {
                        txt_djs.setString(X.moment(me._data.etime - G.time));
                        txt.hide();
                    }else {
                        X.timeout(txt_djs, me._data.etime, function () {
                            me.refreshPanel();
                        });
                    }
                }
            },me.nodes);
        },
        setTable: function () {
            var me = this;
            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            var data = [].concat(me.DATA.info);
            for(var i = 0; i < data.length; i++){
                data[i].index = i;
                var leftnum = data[i].maxnum - (me.DATA.myinfo.val[i] || 0);//剩余购买次数
                data[i].order = leftnum == 0 ? 0 : 1;
            }
            data.sort(function (a,b) {
                if(a.order != b.order){
                    return a.order > b.order ? -1:1;
                }else {
                    return a.index < b.index ? -1:1;
                }
            });
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            var buynum = me.DATA.myinfo.val[data.index] || 0;
            X.render({
                btn: function (node) {
                    node.setBtnState(data.maxnum - buynum > 0);
                    node.prize = data.prize;
                    node.touch(function (sender,type) {
                        if(type == ccui.Widget.TOUCH_NOMOVE){
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: sender.prize
                                }).show();
                                me.refreshPanel();
                                if(me._data.isqingdian){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                            });
                            G.event.emit('doSDKPay', {
                                pid:data.proid,
                                logicProid: data.proid,
                                money: data.money*100,
                            });
                        }
                    })
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(L("XGX"), data.maxnum - buynum), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0.5,0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt);
                },
                btn_txt: function (node) {
                    node.setString(data.money + L("YUAN"));
                    if(data.maxnum - buynum < 1){
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else{
                        node.setTextColor(cc.color(G.gc.COLOR.n12));
                    }
                },
                img_zk:function(node){
                    if(data.sale && data.sale != 10) {
                        node.show();
                        ui.nodes.txt_zk.setString(data.sale + L("sale"));
                        X.enableOutline(ui.nodes.txt_zk, "#008000", 2);
                    } else {
                        node.hide()
                    }
                },
            }, ui.nodes);
            ui.show();
        }
    });
})();