/**
 * Created by LYF on 2018/10/25.
 */
(function () {
    //大秘境-商店
    var ID = 'damijing_shop';

    var fun = X.bUi.extend({
        extConf:{
            maxnum:3
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            // me.ui.nodes.tip_title.setString(L("sjssd"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            // for(var i = 0; i < 7; i ++) {
            //     var icon = me.nodes.list_ico.clone();
            //
            // }
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            cc.isNode(me.nodes["zhuangshi_" + me.curType]) && me.nodes["zhuangshi_" + me.curType].show();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.createMenu();
            me.getData();
            me.setAttr();
            me.needScroll = true;
            me.topMenu.changeMenu(me.checkInitType());
        },
        changeType: function (sender) {
            var me = this;
            var type = sender.data.id;

            if(!me.DATA) return;

            if(me.curType && me.curType == type) return;
            me.curType = type;

            if(!me.table) {
                me.setContents();
            }else {
                me.refreshData();
            }
        },
        createMenu: function(){
            var me = this;

            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('damijing'))
            });
        },
        onHide: function () {
            var me = this;

            G.frame.damijing.getData();
            G.removeNewIco(G.frame.damijing.ui.finds("btn_mjsd"));
        },
        getData: function (callback) {
            var me = this;
            me.DATA = G.frame.damijing.DATA.trader;
            if(!me.DATA) return;
            for(var i = 0; i < me.DATA.length; i ++) {
                me.DATA[i].idx = i;
            }
            me.nodes.txt_sl3.setString(me.DATA.length);
            callback && callback();
        },
        refreshData: function (isNo) {
            var me = this;

            me.needScroll = false;
            me.getData(function () {
                me.refreshPanel(isNo);
            });
        },
        refreshPanel: function (isNo) {
            var me = this;

            //刷新界面显示
            var data = me.filterData();

            if(data.length < 1) {
                me.ui.finds("list_zw").show();
            }else {
                me.ui.finds("list_zw").hide();
            }

            me.table.setData(data);
            me.table.reloadDataWithScroll(isNo ? false : true);
            if(me.refresh) me.refresh = 0;
        },
        setContents: function () {
            var me = this;

            var scrollview = me.nodes.scrollview_sp;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            var list = me.getNewItem();

            var data = me.filterData();

            if(data.length < 1) {
                me.ui.finds("list_zw").show();
            }else {
                me.ui.finds("list_zw").hide();
            }

            var table = me.table = new X.TableView(scrollview,list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(data);
            table.reloadDataWithScroll(me.needScroll);
            if(me.refresh) me.refresh = 0;
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
            var layIco = ui.nodes.ico_tb;
            var imgAttr = ui.nodes.image_jb;
            var txtAttr = ui.nodes.text_jinbi;
            var imgZhekou = ui.nodes.img_zkbg;
            var txtZhekou = ui.nodes.text_zk;
            var imgYgm = ui.nodes.img_ygm;


            layIco.removeAllChildren();
            imgZhekou.hide();
            txtZhekou.setString('');
            imgYgm.hide();

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
            var needId = data.need[0].t;
            var needNum = X.fmtValue(data.need[0].n * (data.sale / 10));
            imgAttr.loadTexture(G.class.getItemIco(data.need[0].t),1);
            txtAttr.setString(needNum);

            //折扣
            if (data.sale != 10) {
                imgZhekou.show();
                txtZhekou.setString(data.sale + L("sale"));
                X.enableOutline(txtZhekou,'#1d9600',2);
            }

            //是否显示限购
            if (data.buynum == 0) {
                imgYgm.show();
                txtAttr.hide();
                imgAttr.hide();
            }else{
                imgYgm.hide();
                txtAttr.show();
                imgAttr.show();
            }

            if(data.buynum > 0) {
                ui.finds("xiangou").show();
                ui.finds("wz1").setString(X.STR(L("XG"), data.buynum));
            }else {
                ui.finds("xiangou").hide();
            }

            //整个卡牌除道具显示区域外可点击购买
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data.buynum == 0) {
                        return G.tip_NB.show(L('SHOP_ITEM_OVER'));

                    } else if (needId == 'rmbmoney' && P.gud.rmbmoney < needNum) {
                        return G.tip_NB.show(L("ZSBZ"), null, function () {
                            me.setAttr();
                        });
                    } else {
                        me.buy({
                            idx: sender.data.idx,
                            need:ui.data.need,
                        });
                    }
                }
            });
        },
        // 获得组合后的新模板
        getNewItem: function () {
            var me = this;

            var list = me.nodes.list_mb;
            var list2 = me.nodes.list1;

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

            var data = me.DATA;
            var xiyou = [];

            for (var i = 0; i < data.length; i ++) {
                if(!data[i].xiyou) {
                    xiyou.push(data[i])
                }else {
                    if(data[i].xiyou == me.curType) {
                        xiyou.push(data[i]);
                    }
                }
            }
            data = xiyou;
            var newData = [],
                arr=[];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
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
        //设置初始页面
        checkInitType:function () {  
            var me = this;
            for(var j = 1;j < 4; j++){
                var data = me.DATA;
                var xiyou = [];
                var curType = j;
                for (var i = 0; i < data.length; i++) {
                    if (!data[i].xiyou) {
                        xiyou.push(data[i])
                    } else {
                        if (data[i].xiyou == curType) {
                            xiyou.push(data[i]);
                        }
                    }
                }
                data = xiyou;
                var newData = [],
                    arr = [];
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    arr.push(d);
                    if ((i + 1) % me.extConf.maxnum == 0) {
                        newData.push(arr);
                        arr = [];
                    }
                }
                if (arr.length > 0) {
                    newData.push(arr);
                }
                if (newData.length > 0){
                    return j;
                }
            }
            return 1;
        },
        // 设置货币信息
        setAttr: function () {
            var me = this;

            me.nodes.txt_sl.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_sl2.setString(X.fmtValue(P.gud.rmbmoney));
        },
        buy: function (args) {
            var me = this;

            G.frame.alert.data({
                cancelCall: null,
                okCall: function () {
                    me.ajax("watcher_useitem", [2, args.idx], function (str, data) {
                        if(data.s == 1) {
                            G.event.emit("sdkevent", {
                                event: "shopBuy",
                                data:{
                                    shopType:"mijing",
                                    consume:args.need,
                                    get:data.d.prize
                                }
                            });
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            G.frame.damijing.DATA.trader = data.d.trader;
                            me.DATA = data.d.trader;
                            me.refreshData(true);
                            me.ui.setTimeout(function () {
                                me.setAttr();
                            }, 800);
                        }
                    });
                },
                richText: L("SFGM"),
                sizeType: 3
            }).show();
        }
    });

    G.frame[ID] = new fun('shangdian_mjsd.json', ID);
})();