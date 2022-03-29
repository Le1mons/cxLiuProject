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
                G.frame.chongzhi.checkRedPoint();
                me.checkRedPoint();
            });
        },
        setVipBtn: function () {
            var me = this;
            var btnArr = [];
            var conf = G.gc.vip;
            var vips = Object.keys(conf);
            vips.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });
            var len = vips.length;
            if (P.gud.vip < 10) len = 10 + 1;
            else {
                if (P.gud.vip < len) len = P.gud.vip + 2;
            }
            if (len > vips.length) len = vips.length;
            me.nodes.listview_gzanbt$.removeAllChildren();
            for (var index = 0; index < len; index ++) {
                var vipLv = vips[index];
                if (vipLv == 0) continue;
                var btn = me.nodes.btn_gzbtn.clone();
                btn.vip = vipLv;
                X.autoInitUI(btn);
                X.render({
                    txte_gzm: conf[vipLv].libaoname || "",
                    txt_gzvip: "VIP" + vipLv
                }, btn.nodes);
                btn.noOulit = true;
                btn.show();
                btn.setZoomScale(0);
                btnArr.push(btn);
                me.nodes.listview_gzanbt$.pushBackCustomItem(btn);
            }
            X.radio(btnArr, function (sender) {
                me.changeVip(sender.vip);
            }, {
                callback1: function (node) {
                    node.nodes.txte_gzm.setTextColor(cc.color("#84724f"));
                    node.nodes.txt_gzvip.setTextColor(cc.color("#c05d05"));
                    X.enableOutline(node.nodes.txt_gzvip, "#fee666", 2)
                },
                callback2: function (node) {
                    node.nodes.txte_gzm.setTextColor(cc.color("#84724f"));
                    node.nodes.txt_gzvip.setTextColor(cc.color("#8a7146"));
                    X.enableOutline(node.nodes.txt_gzvip, "#f0d59e", 2)
                }
            });
            var index = me.index = P.gud.vip - 1 < 0 ? 0 : P.gud.vip - 1;
            if(G.frame.chongzhi.DATA.yktq != undefined && G.frame.chongzhi.DATA.yktq == false){
                G.setNewIcoImg(btnArr[index]);
                btnArr[index].finds('redPoint').setPosition(140,73);
            }
            btnArr[index].triggerTouch(ccui.Widget.TOUCH_ENDED);
            cc.callLater(function () {
                me.nodes.listview_gzanbt$.jumpToIdx(index, {type: 1});
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
                    me.cjShow = false;
                    me.setVipBtn();
                } else {
                    me.nodes.panel_bottom2.show();
                    me.nodes.panel_bottom1.hide();
                    me.nodes.btn_vip.loadTextureNormal('img/sale/btn_sale_vip.png', 1);
                    me.nodes.btn_vip.finds('redPoint') && me.nodes.btn_vip.finds('redPoint').show();
                    me.cjShow = true;
                }
            });
        },
        changeVip: function (vip) {
            var me = this;

            me.setPage(vip);
        },
        onOpen: function() {
            var me = this;

            me.nodes.page_bottom.show();
            X.autoInitUI(me.nodes.page_bottom);
            cc.enableScrollBar(me.nodes.listview_gzanbt$);
            cc.enableScrollBar(me.nodes.page_bottom.nodes.listview_vip);

            me.DATA = G.frame.chongzhi.DATA;
            me.isFrist = true;
            me.isDykTz = G.frame.chongzhi.data() && G.frame.chongzhi.data().isDykTz;
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.setContents();
            if(me.isFrist && !me.isDykTz) {
                me.nodes.panel_bottom2.show();
                me.isFrist = false;
            }else if(me.isDykTz){
                me.cjShow = false;
                me.nodes.panel_bottom2.hide();
                me.nodes.panel_bottom1.show();
                me.nodes.btn_vip.loadTextureNormal('img/sale/btn_sale_vip1.png', 1);
                me.nodes.btn_vip.finds('redPoint') && me.nodes.btn_vip.finds('redPoint').hide();
                me.setVipBtn();
            }
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
            me.setVip();
            me.setChongzhi();
            me.checkRedPoint();
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
            if(G.frame.chongzhi.DATA.yktq != undefined && G.frame.chongzhi.DATA.yktq == false){
                redNum++;
            }
            if (redNum > 0) {
                G.setNewIcoImg(me.nodes.btn_vip, .8, redNum);
                me.nodes.btn_vip.getChildByName("redPoint").setPosition(0 + 5, me.nodes.btn_vip.height - 20);
            }
        },
        setPage: function (vip) {
            var me = this;
            var vipconf = G.gc.vip;
            var page = me.nodes.page_bottom;
            var viptq = vipconf[vip].tq;
            var listview = page.nodes.listview_vip;
            var tequan = G.class.vip.getVipTeQuan();
            listview.removeAllChildren();

            for (var i = 0;i < viptq.length; i ++) {
                (function(i,page){
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
                })(i, page)
            }
            var prize = prize = vipconf[vip].tqprize;
            X.alignCenter(page.nodes.panel_item, prize, {
                touch: true,
                scale: prize.length > 4 ? .7 : .8
            });

            var prize1 = prize1 = vipconf[vip].tqmonth;
            X.alignItems(page.finds("pan"), prize1, "left", {
                touch: true,
                scale: .44
            });

            //img/public/btn/btn1_on.png
            var isHaveTq = G.frame.chongzhi.DATA.yktq != undefined;
            var isReceive = isHaveTq && G.frame.chongzhi.DATA.yktq == false;
            me.nodes.btn_lq10.state = undefined;
            G.removeNewIco(me.nodes.btn_lq10);
            if (!isHaveTq) {
                me.nodes.btn_lq10.show();
                me.nodes.btn_lq10.state = 'buy';
                me.nodes.btn_lq10.setTitleText(L("GM"));
            } else {
                me.nodes.btn_lq10.setVisible(P.gud.vip == vip);
                me.nodes.btn_lq10.setTitleText(isReceive ? L("LQ") : L("YLQ"));
                me.nodes.btn_lq10.setBright(isReceive);
                me.nodes.btn_lq10.setTitleColor(cc.color(isReceive ? G.gc.COLOR.n15 : G.gc.COLOR.n13));
                if(isReceive){
                    G.setNewIcoImg(me.nodes.btn_lq10);
                    me.nodes.btn_lq10.finds('redPoint').setPosition(120,50);
                }
            }

            // me.nodes.btn_lq10.setVisible(P.gud.vip == vip);
            me.nodes.btn_lq10.click(function (sender) {
                if (sender.state == 'buy') {
                    G.frame.chongzhi.remove();
                    return G.frame.huodong.data({
                        type: 0,
                        idx: 1
                    }).show();
                }
                me.ajax("yktq_receive", [], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        G.frame.chongzhi.getData(function () {
                            me.setPage(vip);
                            G.frame.chongzhi.checkRedPoint();
                            me.checkRedPoint();
                            G.removeNewIco(me.nodes.listview_gzanbt$.children[me.index]);
                        });
                    }
                });
            });

            page.nodes.bg_vipinfo.setOpacity(75);
            page.nodes.bg_giftbag.setOpacity(75);
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
                if (P.gud.vip < vip) return G.tip_NB.show("vip" + L("DJBZ"));
                if (P.gud.rmbmoney < sender.money) return G.tip_NB.show(L("ZSBZ"));

                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send('vip_getpack', [sender.vip], function(data) {
                            if (!data) return;
                            var d = JSON.parse(data);
                            if (d.s == 1) {
                                G.event.emit("sdkevent", {
                                    event: "vip_getpack"
                                });
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
        },
        setVip: function() {
            var me = this;
            var conf = G.class.vip.get();
            var vip = P.gud.vip;
            var maxvip = X.keysOfObject(G.gc.vip).length-1;
            var nextvip = vip + 1 <= maxvip ? vip + 1 : vip;
            var payexp = P.gud.payexp;
            var needexp = conf[vip + 1 > maxvip ? maxvip : vip + 1].payexp;

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