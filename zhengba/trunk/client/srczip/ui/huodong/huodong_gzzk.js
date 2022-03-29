/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //贵族折扣
    G.class.huodong_gzzk = X.bView.extend({
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
            X.viewCache.getView("event_list8.json", function (node) {
                me.list = node.nodes.panel_list;

                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
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
                    node.setBackGroundImage('img/event/img_event_banner20.png', 0);
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
            },me.nodes);
        },
        setTable: function () {
            var me = this;
            var data = me.DATA.info.arr;

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

            ui.nodes.txt_zk.setString(data.sale / 10 + L("sale"));
            X.enableOutline(ui.nodes.txt_zk, "#008000", 2);
            X.render({
                btn: function (node) {
                    node.idx = idx;
                    node.click(function(sender) {
                        G.frame.alert.data({
                            sizeType: 3,
                            cancelCall: null,
                            okCall: function () {
                                me.ajax('huodong_use', [me._data.hdid, 1, sender.idx], function(str, dd) {
                                    if (dd.s == 1) {
                                        G.event.emit('sdkevent',{
                                            event:'activity',
                                            data:{
                                                joinActivityType:me._data.stype,
                                                consume:[{a:"attr",t:"rmbmoney",n:data.sale / 100 * data.price}],
                                                get:data.p
                                            }
                                        });
                                        G.frame.jiangli.data({
                                            prize: data.p
                                        }).show();
                                        me.refreshPanel();
                                    }
                                }, true);
                            },
                            richText: L("SFGM"),
                        }).show();

                    })
                },
                btn_txt: function (node) {
                    var canBuyNum = data.bnum - (me.DATA.myinfo.gotarr[data.val] || 0);
                    node.setTextColor(cc.color(canBuyNum <= 0 ? G.gc.COLOR.n15 : G.gc.COLOR.n12));
                    ui.nodes.btn.setEnableState(canBuyNum > 0);
                },
                ico_item: function (node) {
                    X.alignItems(node, data.p, "left", {
                        touch: true,
                    });
                },
                txt: function (node) {
                    X.setRichText({
                        str: L("SYCS") + "<font color=#2c9c1d>" +
                            (data.bnum - (me.DATA.myinfo.gotarr[data.val] || 0)) + "/" + data.bnum + "</font>",
                        parent: node,
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: node.width / 2, y: node.height / 2},
                        size: 20
                    });
                },
                txt_title: function (node) {
                    node.setString(data.needvip ? X.STR(L("GZXTQ"), data.needvip) : L("QMTH"));
                    node.setTextColor(cc.color("#ffe8a5"));
                    X.enableOutline(node, "#a01e00", 2);
                },
                txt_tjjj: function (node) {
                    node.setTextColor(cc.color("#98887d"));
                },
                txt_xjjj: function (node) {
                    node.setTextColor(cc.color("#874b25"));
                },
                txt_yj_jg: function (node) {
                    node.setTextColor(cc.color("#98887d"));
                    node.setString(data.price);
                },
                txt_xj_jg: function (node) {
                    node.setTextColor(cc.color("#874b25"));
                    node.setString(parseInt(data.sale / 100 * data.price));
                }
            }, ui.nodes);
        }
    });
})();