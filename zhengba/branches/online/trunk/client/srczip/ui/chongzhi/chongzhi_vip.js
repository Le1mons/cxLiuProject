/**
 * Created by lsm on 2018/6/29
 */
(function() {
    //充值礼包 
    G.class.chongzhi_vip = X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.huodong.zs = me;
            me._type = type;
            me._super('sale_topup.json');
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

            me.nodes.btn_vip.click(function() {
                if (me.cjShow) {
                    me.nodes.panel_bottom2.hide();
                    me.nodes.panel_bottom1.show();
                    me.nodes.btn_vip.loadTextureNormal('img/sale/btn_sale_vip1.png', 1);
                    me.nodes.btn_vip.finds('redPoint') && me.nodes.btn_vip.finds('redPoint').hide();
                    jumpToTqlb();
                    me.cjShow = false;
                } else {
                    me.nodes.panel_bottom2.show();
                    me.nodes.panel_bottom1.hide();
                    me.nodes.btn_vip.loadTextureNormal('img/sale/btn_sale_vip.png', 1);
                    me.nodes.btn_vip.finds('redPoint') && me.nodes.btn_vip.finds('redPoint').show();
                    me.cjShow = true;
                }
            });


            function jumpToTqlb() {
                G.frame.chongzhi.getData(function() {
                    if (me.isDykTz) {
                        me.setPage(P.gud.vip || 1);
                        me.nodes.pageview.scrollToPage(P.gud.vip - 1 || 0);
                        me.nodes.pageview.update(1 / 60 * 1000);
                    }else{
                        var data = G.frame.chongzhi.DATA.alreadypack;
                        var jump = false;
                        for (var i = P.gud.vip; i > 0; i--) {
                            if (!X.inArray(data, i) && data.length > 0) {
                                jump = true;
                                me.showPage(i || 1);
                                me.nodes.pageview.scrollToPage((i - 1 || 0));
                                me.nodes.pageview.update(1 / 60 * 1000);
                                me.firstshow = true;
                                break;
                            }
                        }
                        if (!jump) {
                            me.showPage(P.gud.vip || 1);
                            me.nodes.pageview.scrollToPage(P.gud.vip - 1 || 0);
                            me.nodes.pageview.update(1 / 60 * 1000);
                            me.firstshow = true;
                        }
                    }

                })
            }
        },
        onOpen: function() {
            var me = this;
            me.DATA = G.frame.chongzhi.DATA;
            me.isFrist = true;
            me.isDykTz = G.frame.chongzhi.data() && G.frame.chongzhi.data().isDykTz;
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.setContents();
        },
        onRemove: function() {
            var me = this;

        },
        onNodeShow: function() {
            var me = this;
            if (cc.isNode(me.ui)) {
                me.setVip();
            }
        },
        setContents: function() {
            var me = this;
            var dt = 0;
            me.setVip();
            me.setChongzhi();
            me.checkRedPoint();
            if (!me.vip) {
                me.vip = P.gud.vip
            }
            if(!me.isDykTz){
                dt = me.isFris ? 800 : 100
            }else{
                dt = 100;
            }
            if (P.gud.vip > me.vip || me.isFrist) {
                me.ui.setTimeout(function() {
                    me.vip = P.gud.vip;
                    me.setTequan();
                    if (me.isDykTz) {
                        me.nodes.btn_vip.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        me.isFrist = false;
                    } else {
                        var data = G.frame.chongzhi.DATA.alreadypack;
                        var jump = false;
                        for (var i = P.gud.vip; i > 0; i--) {
                            if (!X.inArray(data, i) && data.length > 0) {
                                me.showPage(i || 1);
                                me.nodes.pageview.scrollToPage((i - 1 || 1));
                                me.nodes.pageview.update(1 / 60 * 1000);
                                jump = true;
                                break;
                            }
                        }
                        if (!jump) {
                            me.showPage(P.gud.vip || 1);
                            me.nodes.pageview.scrollToPage(P.gud.vip - 1 || 0);
                            me.nodes.pageview.update(1 / 60 * 1000);
                        }
                    }
                },dt);
            }
            if(me.isFrist && !me.isDykTz) {
                me.nodes.panel_bottom2.show();
                me.isFrist = false;
            }else if(me.isDykTz){
                me.nodes.panel_bottom2.hide();
            }
        },
        checkRedPoint: function() {
            var me = this;
            var redNum = 0;
            var buyArr = me.DATA.alreadypack;
            if (P.gud.vip < 1) return;
            G.removeNewIco(me.nodes.btn_vip);
            for (var i = 1; i <= P.gud.vip; i++) {
                if (!X.inArray(buyArr, i)) {
                    redNum++;
                }
            }
            if (redNum > 0) {
                G.setNewIcoImg(me.nodes.btn_vip, .8, redNum);
                me.nodes.btn_vip.getChildByName("redPoint").setPosition(0 + 5, me.nodes.btn_vip.height - 20);
            }
        },
        // onNodeShow: function(){
        //     var me = this;
        //     me.setVip();
        // },
        setVip: function() {
            var me = this;
            var conf = G.class.vip.get();
            var vip = P.gud.vip;
            var nextvip = vip + 1 <= 17 ? vip + 1 : vip;
            var payexp = P.gud.payexp;
            var needexp = conf[vip + 1 > 17 ? 17 : vip + 1].payexp;

            me.nodes.ico_vip1.setBackGroundImage(X.getVipIcon(P.gud.vip), 0);
            me.nodes.ico_vip2.setBackGroundImage(X.getVipIcon(nextvip), 0);
            me.nodes.txt_viplv.setString(P.gud.vip);
            me.nodes.txt_viplv2.setString(nextvip);
            var rt = new X.bRichText({
                size: 22,
                maxWidth: me.nodes.txt1.width + 100,
                lineHeight: 32,
                family: G.defaultFNT,
                color: '#ffb47d',
            });
            var cz = (needexp - payexp) / 10 > 0 ? (needexp - payexp) / 10 : 0;
            var str = X.STR(L('CHONGZHI_ZCZ'), cz.toFixed(0));
            rt.text(str);
            me.nodes.txt1.removeAllChildren();
            rt.setAnchorPoint(0,0);
            rt.setPositionX(me.nodes.txt1.width - rt.trueWidth());
            me.nodes.txt1.addChild(rt);
            me.nodes.txt1.setPosition(me.nodes.ico_vip2.x - me.nodes.txt1.width - me.nodes.ico_vip2.width / 4, me.nodes.txt1.y);
            // me.nodes.txt_number.setString(needexp - payexp);
            var pre = payexp / needexp * 100;
            me.nodes.img_jdt.setPercent(pre);
            me.nodes.txt_jdt.setString(payexp + '/' + needexp);

            if(G.tiShenIng){
                me.finds('img_banner').hide();
            }
        },
        setTequan: function() {
            var me = this;
            var vipconf = G.class.vip.get();
            var tequan = G.class.vip.getVipTeQuan();
            var pageView = me.nodes.pageview;
            var pageItem = me.nodes.page_bottom;
            var dt = 5;
            var count = 0;
            pageView.setCustomScrollThreshold(10 * 0.01 * pageView.width);
            pageView.removeAllPages();
            vipconf[0] = {};
            delete vipconf[0];
            var vips = X.keysOfObject(vipconf);
            vips.sort(function(a, b) {
                return a * 1 - b * 1;
            });
            //设置pageview
            var len;
            if(P.gud.vip < 10) len = 10;
            else if(P.gud.vip < 13) len = 13;
            else if(P.gud.vip < 15) len = 15;
            else len = 17;
            for (var i = 0; i < len; i++) {
                var page = new ccui.Layout();
                page.setContentSize(pageView.getContentSize());
                pageView.addPage(page);
            }
            var setPage = me.setPage = function(vip) {
                if (vip == 0 || vip > vips.length) return;
                if(P.gud.vip > 1) {
                    if (pageView.getPage(vip - 1).getChildrenCount() > 0) return;
                }
                var page = pageItem.clone();
                var viptq = vipconf[vip].tq;
                X.autoInitUI(page);
                var listview = page.nodes.listview_vip;
                var listItem = page.nodes.list_vip;
                listview.removeAllChildren();

                cc.enableScrollBar(listview);
                for (var i in viptq) {
                    (function(i,page){
                        listview.setTimeout(function() {
                            if(!cc.isNode(page))return;

                            var tq = viptq[i];
                            var tqItem = page.nodes.list_vip.clone();
                            X.autoInitUI(tqItem);
                            var tqcon = tequan[tq[0]];
                            var rt = new X.bRichText({
                                size: 20,
                                maxWidth: tqItem.nodes.txt_vipinfo.width,
                                lineHeight: 30,
                                color: '#7b531a',
                                family: G.defaultFNT
                            });
                            rt.text(X.STR(tqcon.intr, tq[1]));
                            rt.setPosition(0, 0);
                            tqItem.nodes.txt_vipinfo.addChild(rt);
                            tqItem.nodes.txt_vipinfo.setPositionY(tqItem.nodes.img_dot.y + tqItem.nodes.txt_vipinfo.y - rt.trueHeight() / 2);
                            listview.pushBackCustomItem(tqItem);
                            tqItem.show();
                        }, i *  (i<4?0:100)  );
                    })(i,page)
                }
                prize = vipconf[vip].tqprize;

                X.alignCenter(page.nodes.panel_item, prize, {
                    touch: true,
                    scale: prize.length > 4 ? .7 : .8
                });

                prize1 = vipconf[vip].tqmonth;

                X.alignCenter(page.finds("pan"), prize1, {
                    touch: true,
                    scale: prize1.length > 4 ? .45 : .55
                });

                page.nodes.bg_vipinfo.setOpacity(75);
                page.nodes.bg_giftbag.setOpacity(75);
                // page.finds('bg_bottom2').setOpacity(90);
                page.nodes.ico_vip3.setBackGroundImage(X.getVipIcon(vip), 0);
                page.nodes.txt_viplv3.setString((vip));
                page.nodes.txt_number1.setString(vipconf[vip].needpay);
                page.nodes.txt_number2.setString(vipconf[vip].nowpay);
                X.enableOutline(page.nodes.txt_viplv3, '#2A1C0F', 2);
                X.enableOutline(page.finds('txt_title'), '#854500', 2);
                X.enableOutline(page.finds('txt_title2'), '#854500', 2);
                page.nodes.btn_buy.vip = vip;
                page.nodes.btn_buy.prize = vipconf[vip].tqprize;
                page.nodes.btn_buy.money = vipconf[vip].nowpay;
                if (vip <= P.gud.vip) {
                    page.nodes.btn_buy.setBright(true);
                    page.nodes.btn_buy.setTouchEnabled(true);
                } else {
                    page.nodes.btn_buy.setBright(false);
                    page.nodes.btn_buy.setTouchEnabled(false);
                }
                if (X.inArray(me.DATA.alreadypack, vip)) {
                    page.nodes.btn_buy.hide();
                    page.nodes.img_bought.show();
                    page.finds("panel_price1").hide();
                    page.finds("panel_price2").hide();
                } else {
                    page.nodes.img_bought.hide();
                    page.nodes.btn_buy.show();
                    page.finds("panel_price1").show();
                    page.finds("panel_price2").show();
                }
                page.nodes.btn_buy.click(function(sender) {
                    if(P.gud.rmbmoney < sender.money) {
                        G.tip_NB.show(L("ZSBZ"));
                        return;
                    }
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            G.ajax.send('vip_getpack', [sender.vip], function(data) {
                                if (!data) return;
                                var d = JSON.parse(data);
                                if (d.s == 1) {
                                    page.nodes.btn_buy.hide();
                                    page.nodes.img_bought.show();
                                    page.finds("panel_price1").hide();
                                    page.finds("panel_price2").hide();
                                    G.frame.jiangli.data({
                                        prize: [].concat(sender.prize)
                                    }).show();
                                    me.DATA.alreadypack.push(sender.vip);
                                    me.checkRedPoint();
                                }
                            });
                        },
                        richText: L("QDGM"),
                        sizeType: 3
                    }).show();

                });
                pageView.getPage(vip - 1).removeAllChildren();
                pageView.getPage(vip - 1).addChild(page);
                page.show();
            };
            var showPage = me.showPage = function(vip) {

                // if (me.curPage && me.curPage == vip) {
                //     return;
                // }
                me.curPage = vip;

                var len = pageView.getPages().length;
                if (vip - 1 >= 0) {
                    setPage(vip - 1);
                }
                if (vip > 0 && vip <= len) {
                    setPage(vip);
                }
                if (vip + 1 <= len) {
                    setPage(vip + 1);
                }
            };
            pageView.addEventListener(function(sender, type) {
                if (type == ccui.PageView.EVENT_TURNING) {
                    if (me.isDykTz){
                        me.isDykTz = false;
                        return;
                    }
                    var curPageIndex = sender.getCurrentPageIndex ? sender.getCurrentPageIndex() : sender.getCurPageIndex();
                    showPage(curPageIndex + 1);
                }
            });


            me.nodes.btn_left.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var curPageIndex = pageView.getCurrentPageIndex ? pageView.getCurrentPageIndex() : pageView.getCurPageIndex();
                    if (curPageIndex <= 0) {
                        return;
                    }
                    showPage(curPageIndex - 1);
                    pageView.scrollToPage(curPageIndex - 1);
                }
            });
            me.nodes.btn_right.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var curPageIndex = pageView.getCurrentPageIndex ? pageView.getCurrentPageIndex() : pageView.getCurPageIndex();
                    if (curPageIndex >= pageView.getPages().length - 1) {
                        return;
                    }
                    showPage(curPageIndex + 1);
                    pageView.scrollToPage(curPageIndex + 1);
                }
            });

        },
        setChongzhi: function() {
            var me = this;
            var listview = me.nodes.listview;
            var data = me.DATA.paylist;
            var d = [];
            var count = 0;
            me.nodes.list.hide();
            listview.removeAllChildren();
            listview.setItemsMargin(9);
            for (var i in data) {
                count++;
                d.push(data[i]);
                if (count % 2 == 0 && count != 0) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    for (var k = 0; k < 2; k++) {
                        var panel = me.nodes.panel_list.clone();
                        var ld = d[k];
                        X.autoInitUI(panel);
                        panel.nodes.txt_info.setString(X.STR(L('HDZS'), ld.name));
                        // var icon = new ccui.ImageView('img/sale/img_sale_rmb.png', 1);
                        var txt = X.STR(L('price'), ld.show);
                        var rh = new X.bRichText({
                            size: 16,
                            maxWidth: panel.nodes.txt_price.width,
                            lineHeight: 26,
                            family: G.defaultFNT,
                            color: '#be5e30',
                        });
                        rh.text(txt);
                        rh.setAnchorPoint(1.1, 0.5);
                        rh.setPosition(panel.nodes.txt_price.width, panel.nodes.txt_price.height / 2 + 3);
                        panel.nodes.txt_price.removeAllChildren();
                        panel.nodes.txt_price.addChild(rh);

                        if(G.tiShenIng){
                            panel.nodes.panel_treasure.setBackGroundImage('zs/' + ld.img + ".png");
                        }else{
                            panel.nodes.panel_treasure.setBackGroundImage('img/sale/' + ld.img, 1);
                        }

                        if (ld.zs.cznum < 1) {
                            panel.nodes.panel_pop.setBackGroundImage('img/sale/' + ld.xb, 1);
                        } else {
                            panel.nodes.panel_pop.setBackGroundImage('img/sale/' + ld.xbn, 1);
                        }
                        panel.nodes.panel_pop.show();
                        panel.setAnchorPoint(0, 0);
                        panel.setPositionY(-8);
                        panel.show();
                        panel.data = ld;
                        panel.setTouchEnabled(true);
                        panel.click(function(sender) {
                            sender.setTouchEnabled(false);
                            G.event.once('paysuccess', function(txt) {
                                try {
                                    me.refreshPanel();
                                } catch (e) {}
                            });
                            G.event.emit('doSDKPay', {
                                pid: sender.data.proid,
                                logicProid: sender.data.proid,
                                money: sender.data.unitPrice,
                                pname: sender.data.name
                            });
                            sender.setTimeout(function () {
                                sender.setTouchEnabled(true);
                            }, 6000)
                        });
                        list.nodes['panel_' + (k + 1)].addChild(panel);
                    }
                    d = [];
                    list.show();
                    listview.pushBackCustomItem(list);
                    cc.enableScrollBar(listview);
                }
            }
            var aa = me.nodes.list.clone();
            aa.setContentSize(me.nodes.list.width, 10);
            aa.hide();
            listview.pushBackCustomItem(aa);
            me.cjShow = true;
        },
    });
})();