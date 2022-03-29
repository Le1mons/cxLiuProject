/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //自选豪礼
    G.class.huodong_zxhl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            X.viewCache.getView("event_list4.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
        },
        refreshView: function() {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel: function () {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.setContents();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function (data) {
            //     me.DATA = data;
            //     me.setContents();
            // });
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
                    node.setBackGroundImage("img/event/img_event_banner21.png");
                },
                panel_title: function(node) {
                    var rh = new X.bRichText({
                        size:22,
                        maxWidth:node.width + 60,
                        lineHeight:24,
                        family:G.defaultFNT,
                        color:G.gc.COLOR.n5,
                        eachText: function (node) {
                            X.enableOutline(node,'#000000');
                        },
                    });
                    rh.text(me._data.intr);
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
                txt_count: L("CHONGZHI"),
                txt_time: function (node) {
                    if(me._data.etime - G.time > 24 * 3600 * 2) {
                        me.nodes.txt_count.hide();
                        node.setString(X.moment(me._data.etime - G.time));
                    }else {
                        X.timeout(node, me._data.etime, function () {
                            me.timeout = true;
                        })
                    }
                },
                txt_jrlc: function (node) {
                    X.setRichText({
                        str: L("SYCS") + (me.DATA.myinfo.lessnum - me.DATA.myinfo.usenum) + "/" + me.DATA.myinfo.maxnum,
                        parent: node,
                        anchor: {x: 0, y: 0.5},
                        pos: {x: 0, y: node.height / 2},
                        color: "#26c702",
                        outline: "#000000",
                        size: 20
                    });
                }
            }, me.nodes);
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model:"pet_5001",
            });
        },
        setTable: function () {
            var me = this;
            var data = me.DATA.info;

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] + pos[1]);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, idx) {
            X.autoInitUI(ui);
            var me = this;

            X.render({
                btn: function (node) {
                    node.idx = idx;
                    node.click(function(sender) {
                        if (me.DATA.myinfo.lessnum - me.DATA.myinfo.usenum < 1) return G.tip_NB.show(L("JRLQCSBZ"));
                        G.frame.buying.data({
                            num: 1,
                            item: data.p,
                            need: [1],
                            maxNum: me.DATA.myinfo.lessnum - me.DATA.myinfo.usenum,
                            callback: function (num) {
                                me.ajax('huodong_use', [me._data.hdid, num, sender.idx], function(str, dd) {
                                    if (dd.s == 1) {
                                        G.event.emit('sdkevent',{
                                            event:'activity',
                                            data:{
                                                joinActivityType:me._data.stype,
                                                consume:[],
                                                get:dd.d.prize
                                            }
                                        });
                                        G.frame.jiangli.data({
                                            prize: dd.d.prize
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
                                    }
                                }, true);
                            }
                        }).show();
                    })
                },
                ico_item: function (node) {
                    X.alignItems(node, data.p, "left", {
                        touch: true,
                    });
                },
                txt: function (node) {
                    X.setRichText({
                        str: L("ZXJL") + data.val,
                        parent: node,
                        anchor: {x: 0, y: 0.5},
                        pos: {x: 0, y: node.height / 2},
                        size: 20
                    });
                },
                btn_txt: L("LQ"),
            }, ui.nodes);
        }
    });
})();