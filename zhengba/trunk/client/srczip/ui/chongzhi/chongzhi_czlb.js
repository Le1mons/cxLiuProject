/**
 * Created by lsm on 2018/6/29
 */
(function() {
    //超值礼包
    G.class.chongzhi_czlb = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('sale_giftbag.json');
        },
        refreshPanel: function() {
            var me = this;
            G.frame.chongzhi.getData(function() {
                me.DATA = G.frame.chongzhi.DATA;
                me.setContents();
            });
        },
        bindBTN: function() {
            var me = this;
        },
        onOpen: function() {
            var me = this;
            me.initPageView();
            me.loopAdvertising();
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
            me.nodes.listview.setItemsMargin(0);
        },
        onRemove: function() {
            var me = this;
        },
        onNodeHide: function () {
            if (!X.cacheByUid("tqlb_login_redPoint")) {
                X.cacheByUid("tqlb_login_redPoint", 1);
                G.frame.chongzhi.checkRedPoint();
            }
        },
        onNodeShow: function () {
            if (cc.isNode(this)) {
                this.refreshPanel();
            }
        },
        setContents: function() {
            var me = this;
            me.setChaozhilibao();
        },
        setChaozhilibao: function() {
            var me = this;
            var conf = G.class.chongzhihd.getChaozhilibao();
            var chaozhihaoli = me.DATA.chaozhihaoli;
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var xbcon = {
                week: 'img/sale/bg_sale_xb1',
                month: 'img/sale/bg_sale_xb2',
                forever: 'img/sale/bg_sale_xb3'
            };
            for (var k in conf) {
                var list = me.nodes.list.clone();
                setitem(list, conf[k], k);
                listview.pushBackCustomItem(list);
            }
            listview.jumpToTop();

            function setitem(ui, data, idx) {
                X.autoInitUI(ui);
                var ico = ui.nodes.panel_ico;
                var name = ui.nodes.txt_name;
                var srandard = ui.nodes.panel_srandard;
                var describe = ui.nodes.panel_describe;
                var item = ui.nodes.panel_item;
                var countdown = ui.nodes.txt_countdown;
                var tiem = ui.nodes.txt_time;
                var buy = ui.nodes.btn_buy;
                var txt_number = ui.nodes.txt_number;
                var img_ygm = ui.nodes.img_ygm;
                var cash = ui.nodes.txt_cash;
                cash.setTextColor(cc.color(G.gc.COLOR.n12));
                ico.setBackGroundImage('img/sale/' + data.img + '.png', 1);
                name.setBackGroundImage('img/sale/' + data.wz + '.png', 1);
                srandard.setBackGroundImage(xbcon[data.ctype] + '.png', 1);
                if (chaozhihaoli[data.chkkey] != undefined) {
                    if (chaozhihaoli[data.chkkey] == 0) {
                        img_ygm.show();
                        countdown.hide();
                        buy.hide();
                        G.removeNewIco(buy);
                    } else {
                        buy.setBright(false);
                        buy.setTouchEnabled(false);
                        buy.hide();
                        cash.setTextColor(cc.color(G.gc.COLOR.n15));
                        var str = X.moment(chaozhihaoli[data.chkkey] - G.time, {
                            d: L('czlb_djs'),
                            h: L('czlb_djs1'),
                            mm: L('czlb_djs2'),
                        });
                        tiem.setString(str);
                        img_ygm.show();
                        img_ygm.setPositionY(buy.getPositionY());
                    }
                } else {
                    countdown.hide();
                    if (data.act != 'pay' && G.DATA.hongdian.tqlb[data.chkkey] && !X.cacheByUid("tqlb_login_redPoint")) {
                        G.setNewIcoImg(buy);
                        buy.redPoint.setPosition(120, 52);
                    }
                }
                var rt = new X.bRichText({
                    size: 20,
                    maxWidth: describe.width,
                    lineHeight: 10,
                    color: '#804326',
                    family: G.defaultFNT
                });
                rt.text(data.intr);
                rt.setAnchorPoint(0, 0.5);
                rt.setPositionY(describe.height / 2 - 6);
                describe.addChild(rt);
                if (data.tq > 0) {
                    var items = [{a: "item", t: "tq" + idx, n: 0}].concat(data.prize);
                    X.alignItems(item, items, 1, {
                        touch: true
                    });
                } else {
                    X.alignItems(item, data.prize, 1, {
                        touch: true
                    });
                }
                buy.data = data;
                buy.idx = idx;
                if (data.act == 'pay') {
                    buy.finds('image_2').hide();
                    txt_number.hide();
                    cash.setString(data.btnshow);
                    buy.click(function(sender, type) {
                        G.event.once('paysuccess', function(arg) {
                            try {
                                me.refreshPanel();
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: sender.data.prize
                                }).show();
                            } catch (e) {}
                        });
                        G.event.emit('doSDKPay', {
                            pid: sender.data.chkkey,
                            logicProid: sender.data.chkkey,
                            money: sender.data.money,
                            pname: sender.data.btnshow
                        });
                    }, 3000);
                } else {
                    txt_number.setString(data.btnshow);
                    buy.click(function(sender) {
                        G.ajax.send('czhl_buy', [sender.idx >> 0], function(data) {
                            if (!data) return;
                            var d = JSON.parse(data);
                            if (d.s == 1) {
                                G.DATA.hongdian.tqlb[data.chkkey] = 0;
                                G.event.emit("sdkevent", {
                                    event: "czlb_buy"
                                });
                                me.refreshPanel();
                                G.frame.jiangli.data({
                                    prize: sender.data.prize
                                }).show();
                                G.hongdian.checkCZ();
                            }
                        })
                    })
                }
                ui.setContentSize(cc.size(ui.width, ui.height + 5));
                ccui.helper.doLayout(ui);
                ui.show();
            }
        },
        loopAdvertising: function() {
            var me = this;
            me.ui.scheduleUpdate();
            me.ui.update = function() {
                if (--me.loopTime <= 0) {
                    me.loopTime = me.deftime;
                    var pageview = me.pageview;
                    var idx = pageview.getCurPageIndex().valueOf() - 0 + 1;
                    pageview.scrollToPage(idx);
                    if (idx + 1 == 6) {
                        pageview.scrollToPage(1);
                        pageview.update(1 / 60 * 1000);
                    } else {
                        me.pointShow(idx - 1);
                    }
                }
            }
        },
        pointShow: function(idx) {
            var me = this;
            var points = [me.nodes.img_dot1, me.nodes.img_dot2, me.nodes.img_dot3];
            for (var i = points.length - 1; i >= 0; i--) {
                points[i].hide();
            }
            points[idx - 1].show();
        },
        initPageView: function() {
            var me = this;
            var pageview = me.pageview = me.nodes.pageview;
            me.deftime = 150;
            me.loopTime = me.deftime;
            pageview.setCustomScrollThreshold(10 * 0.01 * pageview.width);
            var advertising = G.class.chongzhihd.getAdvertising();
            var conf = {
                0: 'img/sale/' + advertising[2] + '.png',
                1: 'img/sale/' + advertising[0] + '.png',
                2: 'img/sale/' + advertising[1] + '.png',
                3: 'img/sale/' + advertising[2] + '.png',
                4: 'img/sale/' + advertising[0] + '.png',
            };
            for (var i = 0; i < 5; i++) {
                var page = new ccui.Layout();
                var img = me.nodes.panel_banner.clone();
                img.setBackGroundImage(conf[i], 0);
                page.setContentSize(pageview.getContentSize());
                page.removeAllChildren();
                page.addChild(img);
                page.show();
                pageview.addWidgetToPage(page, i, true);
            }
            pageview.scrollToPage(1);
            pageview.addEventListener(function(sender, type) {
                var pageview = sender;
                me.loopTime = me.deftime;
                var idx = pageview.getCurPageIndex().valueOf() - 0 + 1;
                if (idx == 5) {
                    pageview.scrollToPage(1);
                    pageview.update(1 / 60 * 1000);
                    me.pointShow(1);
                } else if (idx == 1) {
                    pageview.scrollToPage(3);
                    pageview.update(1 / 60 * 1000);
                    me.pointShow(3);
                } else {
                    me.pointShow(idx - 1);
                }
            });
        }
    });
})();