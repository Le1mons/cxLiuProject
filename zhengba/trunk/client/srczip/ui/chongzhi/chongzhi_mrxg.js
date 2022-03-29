/**
 * Created by lsm on 2018/6/29
 */
(function() {
    //每日限购
    G.class.chongzhi_mrxg = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me.preLoadRes = ['gonghui1.plist', 'gonghui1.png'];
            me._super('sale_quota.json');
        },
        refreshPanel: function() {
            var me = this;
            G.frame.chongzhi.getData(function() {
                me.DATA = G.frame.chongzhi.DATA;
                me.setTop();
                me.setContents();
            });
        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_receive.click(function() {
                G.ajax.send('mrxg_recmrprize', [], function(data) {
                    if (!data) return;
                    var d = JSON.parse(data);
                    if (d.s == 1) {
                        me.refreshPanel();
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        G.hongdian.getData("chongzhiandlibao", 1, function () {
                            G.frame.chongzhi.checkRedPoint();
                        })
                    }
                });
            });

            G.class.ani.show({
                json: "ani_xinghunshangdian_dh",
                addTo: me.nodes.btn_xinghunshangdian,
                repeat: true,
                autoRemove: false
            });
            me.nodes.btn_xinghunshangdian.click(function () {
                G.frame.xhsd.show();
            });
        },
        onOpen: function() {
            var me = this;

            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
        },
        onRemove: function() {
            var me = this;

        },
        setTop: function() {
            var me = this;
            var meirixiangou = me.DATA.meirixiangou;
            // me.nodes.panel_banner.setBackGroundImage('img/sale/bg_sale_banner2.png',1);
            if (meirixiangou['free']) {
                G.removeNewIco(me.nodes.btn_receive);
                me.nodes.btn_receive.setBright(false);
                me.nodes.btn_receive.setTouchEnabled(false);
                me.nodes.btn_receive.setTitleText(L('jingri')+L('YLQ'));
                me.nodes.btn_receive.setTitleColor(cc.color(G.gc.COLOR.n15));
                me.nodes.panel_box.removeBackGroundImage();
                me.nodes.panel_box.setBackGroundImage('img/sale/img_sale_box2.png',1);
            } else {
                G.setNewIcoImg(me.nodes.btn_receive, .95);
                me.nodes.btn_receive.setBright(true);
                me.nodes.btn_receive.setTouchEnabled(true);
                me.nodes.btn_receive.setTitleColor(cc.color(G.gc.COLOR.n13));
                me.nodes.panel_box.removeBackGroundImage();
                me.nodes.panel_box.setBackGroundImage('img/sale/img_sale_box.png',1);
            }

        },
        setContents: function() {
            var me = this;

            var conf = G.class.chongzhihd.getMeirixiangou();
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            listview.setTouchEnabled(true);
            var fcolor = {
                0: '#054484',
                1: '#5a165b',
                2: '#940000',
                3: '#940000'
            };
            var pcolor = {
                0: '#006f00',
                1: '#1173a9',
                2: '#be5e30',
                3: '#be5e30'
            };
            var txtColor = {
                0: '#0e9409',
                1: '#088aa2',
                2: '#bb500b',
                3: '#bb500b',
            };
            for (var i = 1; i < 5; i++) {
                var list = me.nodes.list.clone();
                setItem(list, conf[i], i - 1);
                listview.pushBackCustomItem(list);
            }
            cc.callLater(function () {
                me.nodes.listview.jumpToTop();
            });

            function setItem(ui, data, idx) {
                X.autoInitUI(ui);
                ui.nodes.img_ygm.hide();
                ui.nodes.bg_list.loadTexture('img/sale/bg_sale_list' + (idx + 1) + '.png', 1);
                ui.nodes.img_flag.loadTexture('img/sale/img_sale_flag' + (idx + 1) + '.png', 1);
                setTextWithColor(ui.nodes.txt_flag, data.name, '#ffe9cd');
                X.enableOutline(ui.nodes.txt_flag, fcolor[idx]);
                X.alignItems(ui.nodes.panel_item, data.prize, 1, {
                    touch: true,
                    mapItem: function (node) {
                        if(node.conf.color >= 4) {
                            node.ani();
                        }
                    }
                });
                for (var i = ui.nodes.panel_item.children.length - 1; i >= 0; i--) {
                    ui.nodes.panel_item.children[i].setSwallowTouches(true);
                }
                // ui.nodes.txt_limit.setString(X.STR(L('MRSG_PAYNUM'), data.paynum));
                setTextWithColor(ui.nodes.txt_price, data.paymoney, pcolor[idx]);
                X.enableOutline(ui.nodes.txt_price, '#ffffff');
                if (me.DATA.meirixiangou["mrxgbox"+ (idx + 1)] >= data.paynum){
                    ui.nodes.img_ygm.show();
                    ui.nodes.txt_limit.hide();
                    ui.nodes.txt_price.hide();
                }

                var xgnum = me.DATA.meirixiangou["mrxgbox"+ (idx + 1)] || 0;
                var showTxt = xgnum < data.paynum ? X.STR(L("XG"), data.paynum - xgnum) : X.STR(L("XG"), 0);
                ui.nodes.txt_xgsl.setString(showTxt);
                X.enableOutline(ui.nodes.txt_xgsl, txtColor[idx], 2);

                ui.nodes.panel_gift.setBackGroundImage('img/gonghui/img_gonghui_jxbx1.png',1);
                ui.data = data;
                ui.setTouchEnabled(true);
                ui.click(function(sender, type) {
                    if(P.gud.vip < sender.data.vip) {
                        G.tip_NB.show(X.STR(L("GZXKGM"), sender.data.vip));
                        return;
                    }
                    G.event.once('paysuccess', function(arg) {
                        try {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: sender.data.prize
                            }).show();
                            ui.nodes.img_ygm.show();
                            ui.nodes.txt_limit.hide();
                            ui.nodes.txt_price.hide();
                            me.refreshPanel();
                        } catch (e) {}
                    });
                    if(me.DATA.meirixiangou[sender.data.chkkey] >= data.paynum){
                        G.tip_NB.show(L('ToDaySx'));
                        return;
                    }
                    sender.setTouchEnabled(false);
                    G.event.emit('doSDKPay', {
                        pid: sender.data.chkkey,
                        logicProid: sender.data.chkkey,
                        money: sender.data.money,
                        pname: sender.data.name
                    });
                    sender.setTimeout(function () {
                        sender.setTouchEnabled(true);
                    }, 5000);
                });
                ui.show()
            }
        }

    });
})();