/**
 * Created by zhangming on 2018-07-04
 */
(function () {
    //超值礼包
    G.class.huodong_czlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_scrollview.json");
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
                    node.setBackGroundImage('img/event/img_event_banner6.png', 0);
                },
                panel_txt: function (node) {
                    node.show();
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
                    if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                        me.nodes.txt_count.hide();
                        node.setString(X.moment(me.DATA.info.etime - G.time));
                    }else {
                        X.timeout(node, me.DATA.info.etime, function () {
                            me.timeout = true;
                        })
                    }
                },
            },me.nodes);
            X.setHeroModel({
                parent: me.nodes.panel_hero1,
                data: {},
                model:"pet_4001",
            });
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]+pos[1]);
            }, null, null, 1, 3);
            table.setData(me.DATA.info.arr);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data, idx) {
            var me = this;
            X.autoInitUI(ui);

            ui.nodes.btn_txt.setString( data.payinfo.showrmbmoney + L('YUAN') );
            if (me.DATA.myinfo.val[idx].num > 0) {
                ui.nodes.btn.setEnableState(true);
            } else {
                ui.nodes.btn.setEnableState(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }

            X.render({
                btn: function (node) {
                    node.click(function (sender, type) {
                        G.event.once('paysuccess', function(arg) {
                            try {
                                //G.tip_NB.show(X.createPrizeInfo(data.p,0, 1));
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                me.DATA.myinfo.val[idx].num -= 1;
                                me.DATA.myinfo.gotarr.push(data.val);
                                me.setItem(ui, data, idx);
                                // me.refreshPanel();
                            } catch (e) {}
                        });
                        G.event.emit('doSDKPay', {
                            pid: data.payinfo.proid,
                            logicProid: data.payinfo.proid,
                            money: data.payinfo.unitprice,
                            pname: ''
                        });
                    }, 3000)
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.p, 0, {
                        touch: true,
                        callback: function () {
                        }
                    })
                },
                txt: function (node) {
                    node.removeAllChildren();
                    var txt = new ccui.Text(X.STR(me.DATA.info.show, me.DATA.myinfo.val[idx].num), G.defaultFNT, 22);
                    // txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(me.DATA.myinfo.val >= data.val ? G.gc.COLOR[1] : G.gc.COLOR[5]));
                    txt.setAnchorPoint(0.5,0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    node.addChild(txt);
                },
                img_zk: function (node) {
                    if(data.sale) {
                        node.show();
                        node.children[0].setString(data.sale + L("sale"));
                        X.enableOutline(node.children[0], "#008000", 2);
                    } else {
                        node.hide();
                    }
                }
            }, ui.nodes);
            ui.show();
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
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("event_list1.json", function (node) {
                me.list = node.nodes.panel_list;

                me.refreshPanel();
            });
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        onRemove: function () {
            var me = this;
        },
    })
})();
