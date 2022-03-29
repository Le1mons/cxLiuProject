/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //商店
    var ID = 'shop';

    var fun = X.bUi.extend({
        extConf:{
            maxnum:3
        },
        showAlert: [1,2,5,7,11],//英雄商店，祭坛商店，公会商店，军功商店，迷宫商店，
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.ui.nodes.tip_title.setString(me.shopConf.name);
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.panel_djqy.click(function () {
                me.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();


            me.shopConf = G.class.shop.getById(me.curType);
            me.curAttr = me.shopConf.need[0];
            me.showAttr = me.shopConf.show[0];
            cc.isNode(me.nodes["zhuangshi_" + me.curType]) && me.nodes["zhuangshi_" + me.curType].show();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.curType = me.data().type;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.needScroll = true;
            me.setContents();
            me.setUpdateShop();
        },
        setUpdateShop: function() {
            var me = this;
            if(me.curType != 9) return;
            me.nodes.txt_sj.show();

            X.timeout(me.nodes.img_wz, X.getTodayZeroTime() + 24 * 3600, function () {
                me.refreshPanel();
            });
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');

            if(me.curType == 9 && G.frame.shenqi_list.isShow) {
                if(G.frame.shenqi_list.nodes.down_jihuo.visible) {
                    G.frame.shenqi_list.setJH();
                } else {
                    G.frame.shenqi_list.downMenu.changeMenu(G.frame.shenqi_list.curIdx);
                }
            }
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('shop_open', [me.curType], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    if(me.curType == 1) {
                        G.view.mainView.getAysncBtnsData(function () {
                            me.DATA.shop.shopitem = [].concat(G.DATA.asyncBtnsData.herocoming, me.DATA.shop.shopitem);
                            callback && callback();
                        });
                    }else {
                        callback && callback();
                    }
                }
            });
        },
        refreshData: function () {
            var me = this;

            me.needScroll = false;
            me.getData(function () {
                me.setContents();
            });
        },
        refreshPanel: function () {
            var me = this;

            //刷新界面显示
            me.getData(function () {
                var data = me.filterData();
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
                if(me.refresh) me.refresh = 0;

                me.setRefreshBtn();
                me.setAttr();
            })
        },
        setContents: function () {
            var me = this;

            var scrollview = me.nodes.scrollview_sp;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            var list = me.getNewItem();

            var data = me.filterData();
            var table = me.table = new X.TableView(scrollview,list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(data);
            table.reloadDataWithScroll(me.needScroll);
            if(me.refresh) me.refresh = 0;

            me.setRefreshBtn();
            me.setAttr();
        },
        // 设置每行
        setItem: function (ui,data) {
            var me = this;

            for (var i = 0; i < 3; i++) {
                var parent = ui.finds('panel_wp' + (i + 1) + '$');
                var child = parent.getChildren()[0];
                child.hide();
                var dd = data[i];
                if (dd) {
                    me.setChildItem(child,dd);
                    child.show();
                }
            }

            ui.setTouchEnabled(false);
            ui.show();
        },
        //设置一行的子项
        setChildItem: function (ui,data) {
            var me = this;

            X.autoInitUI(ui);
            var imgKapian = ui.nodes.img_kapian1;
            var layIco = ui.nodes.ico_tb;
            // var txtName = ui.nodes.text_1;
            var imgAttr = ui.nodes.image_jb;
            var txtAttr = ui.nodes.text_jinbi;
            var imgZhekou = ui.nodes.img_zkbg;
            var txtZhekou = ui.nodes.text_zk;
            var imgYgm = ui.nodes.img_ygm;
            //倒计时
            var panelDjs = ui.nodes.panel_djs;
            var txtDjs = ui.nodes.txt_djs;
            // 限购次数
            // var panelXg = ui.nodes.panel_xgcs;
            // var txtXg = ui.nodes.txt_xgsl;

            panelDjs.hide();
            // panelXg.hide();
            layIco.removeAllChildren();
            layIco.setTouchEnabled(false);
            imgZhekou.hide();
            txtZhekou.setString('');
            imgYgm.hide();
            ui.nodes.pan1.removeBackGroundImage();
            ui.nodes.pan1.hide();

            // 道具
            var wid = G.class.sitem(data.item);
            if(me.refresh) wid.refresh();
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            G.frame.iteminfo.showItemInfo(wid);

            wid.setTouchEnabled(true);
            wid.setSwallowTouches(true);

            //设置名字
            // setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color || 1]);

            // 消耗货币
            imgAttr.loadTexture(G.class.getItemIco(data.need[0].t),1);
            txtAttr.setString(data.need[0].n);



            //折扣
            if (data.sale && data.sale != 10) {
                imgZhekou.show();
                txtZhekou.setString(data.sale + L('sale'));
                X.enableOutline(txtZhekou,'#1d9600',2);
                txtAttr.hide();
                ui.nodes.panel_dazhe.show();
                ui.nodes.panel_dazhe.children[1].setString(data.need[0].n);
                ui.nodes.panel_dazhe.children[2].setString(parseInt(data.need[0].n * (data.sale / 10)));
            } else {
                txtAttr.show();
                ui.nodes.panel_dazhe.hide();
            }

            //是否显示限购
            if (data.buynum == 0) {
                imgYgm.show();
                txtAttr.hide();
                imgAttr.hide();
                ui.nodes.panel_dazhe.hide();
            }else{
                imgYgm.hide();
                imgAttr.show();
                if (data.sale != 10) {
                    ui.nodes.panel_dazhe.show();
                } else {
                    txtAttr.show();
                }
            }

            if(data.buynum > 0 && me.curType != "12") {
                ui.finds("xiangou").show();
                ui.finds("wz1").setString(X.STR(L("XG"), data.buynum));
            }else {
                ui.finds("xiangou").hide();
            }

            //限购倒计时
            if (panelDjs.timer) {
                panelDjs.clearTimeout(panelDjs.timer);
                delete panelDjs.timer;
            }

            if (data.buynum > 0 && data.buytime && data.buytime > G.time) {
                panelDjs.show();
            }

            if(data.etime) {
                panelDjs.show();
                if(data.etime - G.time > 24 * 3600 * 2) {
                    txtDjs.setString(X.moment(data.etime - G.time));
                }else {
                    X.timeout(txtDjs, data.etime, function () {
                        X.uiMana.closeAllFrame();
                    })
                }
            }

            //圣器商店
            //商品名字
            if (me.curType == "12"){
                panelDjs.show();
                ui.nodes.pan1.show();
                if(data.item.a == "wuhun"){
                    txtDjs.setString(G.gc.hero[G.gc.wuhun[data.item.t][1].hero].name + L("WUHUN14"));
                    if(X.inArray(G.DATA.maxPowerHeroHid, G.gc.wuhun[data.item.t][1].hero)){//武魂对应的武将是我战力前六的武将
                        ui.nodes.pan1.setBackGroundImage('img/shangdian/wz_zl.png',1);
                    }
                }else {
                    txtDjs.setString(G.class.getItem(data.item.t,data.item.a).name);
                    if(data.item.t == "2071"){//武魂精华
                        ui.nodes.pan1.setBackGroundImage('img/shangdian/wz_ty.png',1);
                    }
                }
            }

            //整个卡牌除道具显示区域外可点击购买
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(sender.data.hdid) {
                        me.hdUse(sender.data);
                        return;
                    }
                    if (sender.data.buynum == 0) {
                        G.tip_NB.show(L('SHOP_ITEM_OVER'));
                        return;
                    }
                    if(me.curType == "12"){//武魂商店
                        var str = X.STR(L("SHOP_BUY_ALERT"),G.class.getItem(sender.data.need[0].t,sender.data.need[0].a).name,sender.data.need[0].n*data.sale/10);
                        G.frame.alert.data({
                            sizeType:3,
                            cancelCall:null,
                            okCall: function () {
                                G.ajax.send('shop_buy',[me.curType,sender.data.idx,1],function(d) {
                                    if(!d) return;
                                    var d = JSON.parse(d);
                                    if(d.s == 1) {
                                        G.event.emit("sdkevent", {
                                            event: "shopBuy",
                                            data:{
                                                shopType:me.curType,
                                                consume:sender.data.need,
                                                get:[sender.data.item],
                                            }
                                        });
                                        me.DATA.shop = d.d.shopinfo;
                                        G.frame.jiangli.data({
                                            prize:[].concat(sender.data.item)
                                        }).show();
                                        me.refreshPanel();
                                        if(G.frame.wuhun_strength.isShow){
                                            G.frame.wuhun_strength.setCost();
                                        }
                                    }
                                },true);
                            },
                            autoClose:true,
                            richText:str
                        }).show();
                    }else {
                        me.buy({
                            prize: data.item,
                            idx:sender.data.idx,
                            num:1,
                            data: data
                        });
                    }
                }
            });
        },
        hdUse: function(data) {
            var me = this;

            var str = L('SHOP_NEED_BUY');
            G.frame.alert.data({
                sizeType:3,
                cancelCall:null,
                okCall: function () {
                    G.ajax.send('huodong_use',[data.hdid, 1, data.index],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.frame.jiangli.data({
                                prize:[].concat(d.d.prize)
                            }).show();
                            me.refreshPanel();
                        }
                    },true);
                },
                autoClose:true,
                richText:str
            }).show();
        },
        // 获得组合后的新模板
        getNewItem: function () {
            var me = this;

            var list = me.nodes.list_mb;
            var list2 = me.nodes.list;

            // var interval = (list.width - me.extConf.maxnum * list2.width) / (me.extConf.maxnum - 1);
            for (var i = 0; i < me.extConf.maxnum; i++) {
                var lay = list.finds('panel_wp' + (i + 1) + '$');
                lay.setTouchEnabled(false);
                lay.removeAllChildren();
                var item = list2.clone();
                item.setAnchorPoint(cc.p(0.5,0.5));
                item.setPosition(cc.p(lay.width / 2,lay.height / 2));
                lay.addChild(item);
                // item.setPosition(cc.p(item.width / 2 + (item.width + interval) * i,list.height / 2));
                // list.addChild(item);
            }

            return list;
        },
        //组合成需要显示的数据
        filterData: function () {
            var me = this;

            var data = me.DATA.shop.shopitem;

            var newData = [],
                arr=[];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                //if (i % me.extConf.maxnum == 0) {
                //    arr = [];
                //}
                arr.push(d);
                if ((i + 1) % me.extConf.maxnum == 0) {
                    newData.push(arr);
                    arr = [];
                }
            }
            if(arr.length > 0) {
                newData.push(arr);
            }

            return newData;
        },
        // 设置场景动画
        setAni: function () {
            var me = this;

            var layLeft = me.nodes.panel_zs1;
            var layRight = me.nodes.panel_zs2;
        },
        // 设置刷新按钮
        setRefreshBtn: function () {
            var me = this;

            var btnRe = me.nodes.btn_1;
            var imgAttr = me.nodes.img_zs;
            var txtAttr = me.nodes.text_2;
            var imgMf = me.nodes.img_wz;
            var imgSx = me.nodes.img_wz2;
            var conf = me.shopConf;
            var data = me.DATA;
            var tips = L('SHUAXIN');

            if(me.curType == "1" || me.curType == "5" || me.curType == "11") {
                imgSx.setString(L("CZ"));
                tips = L("CZ");
            }

            imgAttr.hide();
            txtAttr.hide();
            imgMf.hide();
            imgSx.hide();
            //如果商店不需要刷新，隐藏刷新按钮
            var freeTime = data.shop.freetime;
            if(me.curType == "12"){//武魂商店刷新按钮
                me.nodes.txt_sj.show();
                if(data.rfnum > 0){//还有免费刷新次数
                    imgMf.show();
                    var leftnum = data.rfnum;
                    me.nodes.txt_sj.setString(L("MFSX")+"("+leftnum+"/" + conf.dailyrfnum + ")");
                }else {
                    imgAttr.show();
                    txtAttr.show();
                    imgSx.show();
                    var leftnum = conf.dailycostnum - data.costnum;
                    me.nodes.txt_sj.setString(X.STR(L("WUHUN11"),leftnum));
                    txtAttr.setString(conf.need[0].n);
                    imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
                }
            }else if (conf.rseconds == -1 && conf.need.length < 1) {
                btnRe.hide();
                return;
            }else if(conf.rseconds == -1 && conf.need.length > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                if(conf.need[0].n == 20000){
                    conf.need[0].n = '2万';
                }
                txtAttr.setString(conf.need[0].n);
                imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
            }else if (conf.rseconds !== -1 && freeTime - G.time < 0) {
                imgMf.show();
            }else if(conf.rseconds !== -1 && freeTime - G.time > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                if(conf.need[0].n == 20000){
                    conf.need[0].n = '2万';
                }
                txtAttr.setString(conf.need[0].n);
                imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
            }

            function refresh () {
                me.ajax("shop_shuaxin", [me.curType], function (str, data) {
                    if (data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "shopRefresh",
                            data:{
                                shopType:me.curType,
                                consume:me.shopConf.need[0],
                            }
                        });
                        me.refresh = 1;
                        G.tip_NB.show(tips + L('SUCCESS'));
                        me.DATA.shop = data.d.shopinfo;
                        me.refreshPanel();
                    }
                });
            }

            btnRe.setTouchEnabled(true);
            btnRe.click(function (sender, type) {
                if (X.inArray(me.showAlert, me.curType)) {
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            refresh();
                        },
                        richText: X.STR(L("JXHSXSD"), conf.need[0].n, G.class.getItem(conf.need[0].t, conf.need[0].a).name, me.shopConf.name)
                    }).show();
                } else {
                    refresh();
                }
            });

            var autotime = me.DATA.shop.autotime;
            var countTime = autotime - G.time;
            if (!autotime || autotime == -1) {
                me.nodes.txt_txwzj.hide();
            } else {
                if (me.timer) {
                    me.timer.clearAllTimers();
                    delete me.timer;
                }
                me.nodes.txt_txwzj.show();

                if (countTime > 24 * 3600) {
                    me.nodes.txt_txwzj.setString(X.STR(L("XHCZ"), parseInt(countTime / (24 * 3600)) + L("TIAN")));
                } else {
                    me.timer = X.timeout(me.nodes.txt_txwzj, autotime, function () {
                        me.refreshPanel();
                    }, null, {showStr: L("XHCZ")});
                }
            }
        },
        // 设置货币信息
        setAttr: function () {
            var me = this;
            var imgAttr = me.nodes.token_lhs;
            var txtAttr = me.nodes.txt_sl;
            me.ui.finds('panel_lhs').show();
            imgAttr.loadTexture(G.class.getItemIco(me.showAttr.t), 1);
            txtAttr.setString(X.fmtValue(G.class.getOwnNum(me.showAttr.t,me.showAttr.a)));
        },
        buy: function (args) {
            var me = this;

            var data = JSON.parse(JSON.stringify(args.data));
            if (data.sale < 10) data.need[0].n = parseInt(data.need[0].n * (data.sale / 10));
            var idx = args.idx;
            var shopid = me.curType;

            G.frame.buying.data({
                num: 1,
                item: [].concat(data.item),
                need: data.need,
                maxNum: data.buynum < 0 ? 0 : data.buynum,
                callback: function (num) {
                    var prize = JSON.parse(JSON.stringify(args.prize));
                    prize.n *= num;
                    G.ajax.send('shop_buy',[shopid,idx,num],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.event.emit("sdkevent", {
                                event: "shopBuy",
                                data:{
                                    shopType:shopid,
                                    consume:data.need,
                                    get:[args.prize],
                                }
                            });
                            // if (shopid == '9') {
                            //     G.event.emit("sdkevent", {
                            //         event: "storm_shop"
                            //     });
                            // } else {
                            //     G.event.emit("sdkevent", {
                            //         event: "shop_buy",
                            //         data:{
                            //
                            //         }
                            //     });
                            // }
                            me.DATA.shop = d.d.shopinfo;
                            G.frame.jiangli.data({
                                prize:[].concat(prize)
                            }).show();

                            me.refreshPanel();
                        }
                    },true);
                }
            }).show();

            // G.frame.iteminfo_plgm.data({
            //     buy: data.item,
            //     num: 1,
            //     maxNum: data.buynum < 0 ? 0 : data.buynum,
            //     buyneed: data.need,
            //     callback: function (num) {
            //         var prize = JSON.parse(JSON.stringify(args.prize));
            //         prize.n *= num;
            //         G.ajax.send('shop_buy',[shopid,idx,num],function(d) {
            //             if(!d) return;
            //             var d = JSON.parse(d);
            //             if(d.s == 1) {
            //
            //                 me.DATA.shop = d.d.shopinfo;
            //                 G.frame.jiangli.data({
            //                     prize:[].concat(prize)
            //                 }).show();
            //
            //                 me.refreshPanel();
            //             }
            //         },true);
            //     }
            // }).show();
        }

    });

    G.frame[ID] = new fun('shangdian.json', ID);
})();