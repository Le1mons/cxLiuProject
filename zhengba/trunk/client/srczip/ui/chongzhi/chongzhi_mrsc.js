/**
 * Created by lsm on 2018/6/29
 */
(function() {
    //每日商城
    G.class.chongzhi_mrsc = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('sale_dailystore.json');
        },
        refreshPanel: function() {
            var me = this;
            me.getData(function() {
                me.setContents();
            })
        },
        bindBTN: function() {
            var me = this;
        },
        onOpen: function() {
            var me = this;
            me.ifFirst = true;
            me.initScorllView();
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
        },
        onRemove: function() {
            var me = this;

        },
        filterData: function(data) {
            var me = this;
            var newData = [];
            for (var i = 0; i < data.length; i++) {
                if (i == 0) {
                    newData.push(i);
                }
                if (i == 1) continue;
                if (i % 2 != 0) {
                    newData.push(i);
                }
            }
            return newData;
        },
        setContents: function() {
            var me = this;
            var data = me.DATA;
            me.shopData = data.shop.shopitem;
            var arr = me.filterData(me.shopData);
            me.ui_table.data(arr);
            if (me.ifFirst) {
                me.ui_table.reloadDataWithScroll(true);
                me.ifFirst = false;
            } else {
                me.ui_table.reloadDataWithScroll(false);
            }

        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('shop_open', [6], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        },
        initScorllView: function(data) {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview, false);
            me.nodes.scrollview.removeAllChildren();
            var table = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.nodes.list.height + 10,
                paddingTop: 5
            });
            me.ui_table = table;
            table.setDelegate(this);
            me.ui_table.data([]);
            table.bindScrollView(me.nodes.scrollview);
            me.ui_table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me = this;

            for (var i = 0; i < 2; i++) {
                var parent = ui.finds('list' + (i + 1) + '$');
                var list = me.nodes.list.clone();
                list.setPosition(cc.p(0, 0));
                parent.removeAllChildren();
                parent.addChild(list);
                parent.hide();
                list.hide();
                var dd = me.shopData[data + i];
                if (dd) {
                    me.setChildItem(list, dd);
                    list.show();
                    parent.show();
                }
            }

            ui.setTouchEnabled(false);
            ui.show();
        },
        setChildItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var tb = ui.nodes.ico_tb;
            var limit = ui.nodes.txt_limit;
            var img_zs = ui.nodes.img_zs;
            var txt_jb1 = ui.nodes.txt_jb1;
            var panel_line = ui.nodes.panel_line;
            var txt_jb = ui.nodes.txt_jb;
            var img_zkbg = ui.nodes.img_zkbg;
            var text_zk = ui.nodes.text_zk;
            var img_ygm = ui.nodes.img_ygm;
            var panel_limit = ui.nodes.panel_limit;
            var txt_bg = panel_limit.finds('bg_limit');
            txt_bg.setColor(cc.color('#d37656'));
            txt_bg.setOpacity(155);
            img_zkbg.setPosition(cc.p(33, 120));
            text_zk.setPosition(cc.p(23, 96));
            panel_limit.show();
            var item = G.class.sitem(data.item);
            item.setPosition((tb.width - item.width) / 2, (tb.height - item.height) / 2)
            item.setAnchorPoint(0, 0);
            tb.removeAllChildren();
            tb.addChild(item);
            tb.setTouchEnabled(true);
            tb.setSwallowTouches(true);
            G.frame.iteminfo.showItemInfo(item);
            var sale = data.sale / 10;
            text_zk.setString(data.sale + L('sale'));
            if (data.sale <= 5) {
                img_zkbg.loadTexture('img/sale/img_sale_zhong.png', 1);
                X.enableOutline(text_zk, '#b51718', 2);
            } else {
                img_zkbg.loadTexture('img/sale/img_sale_zlv.png', 1);
                X.enableOutline(text_zk, '#085f0d', 2);
            }
            txt_jb.setString(data.need[0].n * sale);
            if (data.need[0].n * sale == 0 && data.buynum > 0) {
                G.setNewIcoImg(ui, .95);
                me.idx = data.idx;
            }
            txt_jb1.setString(data.need[0].n);
            if (P.gud.vip < data.chkvip) {
                limit.setString(X.STR(L('GZZS'), data.chkvip));
            } else {
                limit.setString(X.STR(L('todaycs'), data.buynum));
            }
            limit.setFontName(G.defaultFNT);
            if (data.buynum < 1) {
                img_ygm.show();
                ui.nodes.txt_jb.hide();
                ui.nodes.txt_jb1.hide();
                ui.nodes.panel_line.hide();
                ui.nodes.img_zs.hide();
                ui.nodes.panel_limit.hide();
                img_ygm.x -= 20;
                ui.setTouchEnabled(true);
            } else {
                img_ygm.hide();
                ui.setTouchEnabled(true);
            }

            ui.setSwallowTouches(false);
            ui.data = data;
            ui.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(sender.data.buynum<1){
                        G.tip_NB.show(L('SELLOVER'));
                        return;
                    }
                    if (P.gud.vip < sender.data.chkvip) {
                        G.tip_NB.show(X.STR(L('GZXGM'), sender.data.chkvip))
                    } else {
                        function buy() {
                            me.buy({
                                num: 1,
                                idx: sender.data.idx,
                                prize: ui.data.item,
                                need :ui.data.need,
                            }, function() {
                                sender.data.need[0].n = need;
                                if (sender.data.idx == me.idx) {
                                    G.removeNewIco(sender);
                                    G.hongdian.getData("chongzhiandlibao", 1, function() {
                                        G.frame.chongzhi.checkRedPoint();
                                    });
                                }
                            });
                        }
                        var need = sender.data.need[0].n * sale;
                        if(P.gud[sender.data.need[0].t] < need) {
                            G.tip_NB.show(L("ZSBZ"));
                            return;
                        }
                        if (need >= 100) {
                            G.frame.alert.data({
                                cancelCall: null,
                                okCall: function() {
                                    buy();
                                },
                                richText: L("SFGM"),
                                sizeType: 3
                            }).show();
                        } else {
                            buy();
                        }
                    }
                }
            })
        },
        buy: function(args, callback) {
            var me = this;

            var num = args.num;
            var idx = args.idx;
            var shopid = 6;
            G.ajax.send('shop_buy', [shopid, idx], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    G.event.emit("sdkevent", {
                        event: "shopBuy",
                        data:{
                            shopType:shopid,
                            consume:args.need,
                            get:[args.prize],
                        }
                    });
                    me.DATA.shop = d.d.shopinfo;
                    // G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));

                    G.frame.jiangli.data({
                        prize: [].concat(args.prize)
                    }).show();
                    callback && callback();
                    me.refreshPanel();
                    G.view.toper.updateAttr();
                }
            }, true);
        },
        cellDataTemplate: function() {
            return this.nodes.panel_list.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         */
        cellDataInit: function(ui, data) {
            if (!data && data != 0) {
                ui.hide();
                return;
            }
            this.setItem(ui, data);
            ui.show();
        },
    });
})();