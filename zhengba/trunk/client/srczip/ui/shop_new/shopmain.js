/**
 * Created by  on 2019//.
 */
(function () {
    G.event.on('attrchange_over', function () {
        if(G.frame.shopmain.isShow){
            G.frame.shopmain.updateTop();
        }
    });

    G.event.on('itemchange_over', function () {
        if(G.frame.shopmain.isShow){
            G.frame.shopmain.updateTop();
        }
    });
    //新商店整合
    var ID = 'shopmain';
    var fun = X.bUi.extend({
        extConf:{
            maxnum:3
        },
        autoRefresh:[9,1,11,7,15],
        handRefresh:[2,5,12,],
        showAlert: [1,2,5,7,11],//英雄商店，祭坛商店，公会商店，军功商店，迷宫商店，
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.initUI();
            me.initTopButton();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.jumpToShop();
            me.setBaseInfo();
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = me.need2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            me.nodes.panel_top.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_top.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.show();
                        }

                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.show();
                        }
                    })
                }
            },me.nodes);
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(me.need1.t,me.need1.a)));
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(me.need2.t,me.need2.a)));
        },
        //进入哪个商店
        jumpToShop:function(){
            var me = this;
            var shopid = me.data();

            for (var i = 0; i < me.btnarr.length; i++){
                if(me.btnarr[i].data.id == shopid){
                    me.btnarr[i].triggerTouch(ccui.Widget.TOUCH_ENDED);
                    return;
                }
            }
            for(var k in G.gc.shoplist.up){
                var list = [];
                for(var i in G.gc.shoplist.up[k].list){
                    list.push(G.gc.shoplist.up[k].list[i].id);
                }
                if(X.inArray(list,shopid)){
                    me.topshoptype = k;
                    me.topshopid = shopid;
                    for (var i = 0; i < me.btnarr.length; i++){
                        if(me.btnarr[i].data.type == me.topshoptype){
                            me.btnarr[i].triggerTouch(ccui.Widget.TOUCH_ENDED);
                            return;
                        }
                    }
                }
            }
            me.btnarr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        initUI:function(){
            var me = this;
            me.shopconf = G.gc.shoplist;
            cc.enableScrollBar(me.nodes.listview_sd);
            cc.enableScrollBar(me.nodes.listview1);
            cc.enableScrollBar(me.nodes.scrollview_sp);
            me.nodes.list_wp.hide();
            me.nodes.mfsx.width = 155;
        },
        //一级按钮
        initTopButton:function () {
            var me = this;
            var btnconf = [];//开启了的商店
            for(var k in me.shopconf.left){
                var data = JSON.parse(JSON.stringify(me.shopconf.left[k]));
                data.key = k;
                if(data.type != 0){//有次级商店
                    var upconf = G.gc.shoplist.up[data.type];
                    for(var i in upconf.list){
                        var updata = upconf.list[i];
                        if(updata.checkLvId == 'jdsd'){
                            if(G.DATA.asyncBtnsData && G.DATA.asyncBtnsData.gpjjc && G.DATA.asyncBtnsData.gpjjc.shop){
                                btnconf.push(data);
                                break;
                            }
                        }else if(G.class.opencond.getIsOpenById(updata.checkLvId) || updata.checkLvId == ""){
                            btnconf.push(data);
                            break;
                        }
                    }
                }else if(data.checkLvId == 'xuyuanchi'){
                    if(P.gud.lv >=G.class.opencond.getLvById("xuyuanchi")){
                        btnconf.push(data);
                    }
                }else if(G.class.opencond.getIsOpenById(data.checkLvId) || data.checkLvId == ""){
                    btnconf.push(data);
                }
            }
            me.nodes.listview_sd.removeAllChildren();
            me.nodes.listview_sd.setTouchEnabled(true);
            me.nodes.list_shangdian.hide();
            me.btnarr = [];
            for(var i = 0; i < btnconf.length; i++){
                var btn = me.nodes.btn_sd.clone();
                me.setTopItem(btn,btnconf[i]);
                me.btnarr.push(btn);
                me.nodes.listview_sd.pushBackCustomItem(btn);
            }
        },
        setTopItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setSwallowTouches(true);
            ui.data = data;

            ui.nodes.txt_sdname.setString(data.name);
            ui.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    for(var j = 0; j < me.btnarr.length; j++){
                        var button = me.btnarr[j];
                        if (sender.data.id == button.data.id) {
                            me.curType = sender.data.id;
                            sender.setBright(false);
                            button.nodes.txt_sdname.setTextColor(cc.color("#ffffff"));
                            X.enableOutline(button.nodes.txt_sdname,"#192d54");
                            me.changeShop(sender.data);
                        } else {
                            button.setBright(true);
                            button.nodes.txt_sdname.setTextColor(cc.color("#af9e89"));
                            X.enableOutline(button.nodes.txt_sdname,"#34221d");
                        }
                    }
                }
            })
        },
        //切换商店
        changeShop:function (data) {
            var me = this;
            me.nodes.panel_xuanxiang.setVisible(data.id == 8);
            me.nodes.xuanxiang1.setVisible(data.type != 0);
            if(data.id == 8){
                me.createMenu();
            } else {
                me.zz = 0;
            }
            if (data.type != 0) {//有次级商店
                me.initDownButton(data.type);
                var jumpid = 0;
                for(var int = 0; int < me.btn_arr.length; int++){
                    if(me.btn_arr[int].data.id == me.topshopid){
                        jumpid = int;
                        me.topshopid = null;
                        break;
                    }
                }
                if(me.btn_arr) me.btn_arr[jumpid].triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.nodes.listview1.jumpToIdx(jumpid);
            } else {
                if(data.id == 'zahuopu'){//杂货铺
                    me._firstItem=null;
                    me.getZaShop(function () {
                        me.setContents(true);
                        me.ui.setTimeout(function(){
                            G.guidevent.emit('zhahuodian_setContent_over');
                        },500);
                    })
                }else {
                    me.getData(function () {
                        me.setContents(true);
                    })
                }
            }
        },
        //次级商店按钮
        initDownButton:function (type) {
            var me = this;
            var topshop = JSON.parse(JSON.stringify(G.gc.shoplist.up[type].list));//上面一排商店按钮
            var list = [];
            for(var k in topshop){//判断商店是否开启
                if(topshop[k].checkLvId == 'jdsd'){
                    if(P.gud.gpjjcexp > 0 || P.gud.gpjjclv > 1){
                        list.push(topshop[k]);
                    }
                }else if(G.class.opencond.getIsOpenById(topshop[k].checkLvId) || topshop[k].checkLvId == ""){
                    list.push(topshop[k]);
                }
            }
            me.nodes.listview1.removeAllChildren();
            me.btn_arr = [];
            for(var i = 0; i < list.length; i++){
                var btn = me.nodes.btn_x.clone();
                me.setDownItem(btn,list[i]);
                me.btn_arr.push(btn);
                me.nodes.listview1.pushBackCustomItem(btn);
            }
        },
        setDownItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;

            ui.nodes.txt_namex.setString(data.name);
            ui.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    for(var j = 0; j < me.btn_arr.length; j++){
                        var button = me.btn_arr[j];
                        if (sender.data.id == button.data.id) {
                            me.curType = data.id;
                            sender.setBright(false);
                            button.nodes.txt_namex.setTextColor(cc.color("#ffe6d0"));
                            X.enableOutline(button.nodes.txt_namex,"#34221d");
                            me.getData(function () {
                                me.curType = sender.data.id;
                                me.setContents(true);
                            })
                        } else {
                            button.setBright(true);
                            button.nodes.txt_namex.setTextColor(cc.color("#af9e89"));
                            X.enableOutline(button.nodes.txt_namex,"#34221d");
                        }
                    }
                }
            })
        },
        //种族按钮
        createMenu: function(){
            var me = this;
            me._menus = [];
            //图标
            for(var i=0;i<8;i++){
                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                if (i==7){
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                }
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(me.nodes["panel_0" + (i + 1)].width / 2, me.nodes["panel_0" + (i + 1)].height / 2);
                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        if (node.data == 7){
                            var img = 'img/public/ico/ico_zz11.png';
                        } else {
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        }
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.zz = sender.data;
                            if(!me.table) {
                                me.setContents();
                            }else {
                                me.changeZZ();
                            }
                            if (node.data == 7){
                                img = 'img/public/ico/ico_zz11_g.png';
                            } else {
                                img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            }
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;
                                    }
                                })
                            }
                        }else{
                            node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });
                me._menus.push(list_ico);
                me.nodes["panel_0" + (i + 1)].addChild(list_ico);
            }
        },
        //统一商店
        getData:function (callback) {
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
            }, true);
        },
        //杂货铺
        getZaShop:function (callback,port) {
            var me = this;
            me.ajax( port || 'zahuopu_open',[],function(str ,data){
                if (data.s === 1) {
                    me.DATA = data.d;
                    for(var i = 0; i < me.DATA.itemlist.length; i++){
                        me.DATA.itemlist[i].idx = i;
                    }
                    callback && callback();
                }
            },true);
        },
        refreshData:function(){
            var me = this;
            //刷新界面显示
            var data = me.filterData();
            me.table.setData(data);
            me.table.reloadDataWithScroll(false);
            if(me.refresh) me.refresh = 0;
            me.setRefreshBtn();
            me.setAttr();
        },
        refreshPanel: function (type) {
            var me = this;
            if(me.curType == 'zahuopu'){
                me.getZaShop(function () {
                    me.refreshData();
                },type);
            }else {
                me.getData(function () {
                    me.refreshData();
                })
            }
        },

        //切换种族
        changeZZ:function(){
            var me = this;
            var data = me.filterData();
            me.table.setData(data);
            me.table.reloadDataWithScroll(true);
            if(me.refresh) me.refresh = 0;
            me.setRefreshBtn();
            me.setAttr();
        },
        setContents: function (isTop) {
            var me = this;

            me.shopConf = G.class.shop.getById(me.curType);
            if(me.refresh) me.refresh = 0;
            me.setRefreshBtn();
            me.setAttr();
            me.setShop(isTop);
            // if(me.curType == 'zahuopu'){
            //     me.ui.finds('panel_shangdian').hide();
            //     me.ui.finds('panel_ui').show();
            //     me.setZaShop();
            // }else {
            //     me.ui.finds('panel_shangdian').show();
            //     me.ui.finds('panel_ui').hide();
            //     me.setShop();
            // }
        },
        //商店
        setShop:function(isTop){
            var me = this;
            var scrollview = me.nodes.scrollview_sp;
            scrollview.removeAllChildren();
            var list = me.getNewItem();
            var data = me.filterData();
            var table = me.table = new X.TableView(scrollview,list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(data);
            table.reloadDataWithScroll(isTop || false);
        },
        //杂货店
        setZaShop:function(){
            var me = this;
            var data = me.DATA.itemlist;
            for(var idx = 0 ; idx < data.length ; idx++){
                var list = me.nodes.list_sd.clone();
                me.ui.nodes['panel_'+(idx+1)].removeAllChildren();
                me.ui.nodes['panel_'+(idx+1)].addChild(list);
                me.setChildItem(list,data[idx],idx);
            }
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
            if(me._firstItem==null){
                me._firstItem = ui;
            }

            ui.show();
            X.autoInitUI(ui);
            var layIco = ui.nodes.ico_sdtb;
            var imgAttr = ui.nodes.image_jb;
            var txtAttr = ui.nodes.text_jinbi;
            var imgZhekou = ui.nodes.img_zkbg;
            var txtZhekou = ui.nodes.text_zk;
            var imgYgm = ui.nodes.img_ygm1;
            //倒计时
            var panelDjs = ui.nodes.panel_djs;
            var txtDjs = ui.nodes.txt_djs;

            panelDjs.hide();
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
                                        me.toXsdk(sender.data, me.curType, sender.data.idx, 1);
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
        // 获得组合后的新模板
        getNewItem: function () {
            var me = this;
            var list = me.nodes.list_mb;
            var list2 = me.nodes.list_sd;
            for (var i = 0; i < me.extConf.maxnum; i++) {
                var lay = list.finds('panel_wp' + (i + 1) + '$');
                lay.setTouchEnabled(false);
                lay.removeAllChildren();
                var item = list2.clone();
                item.setAnchorPoint(cc.p(0.5,0.5));
                item.setPosition(cc.p(lay.width / 2,lay.height / 2));
                lay.addChild(item);
            }
            return list;
        },
        //组合成需要显示的数据
        filterData: function () {
            var me = this;
            var data = me.curType == 'zahuopu' ? me.DATA.itemlist : me.DATA.shop.shopitem;
            if(me.zz && me.zz != 0) {
                var zzArr = [];
                for(var i = 0; i < data.length; i ++) {
                    var conf = G.class.getItem(data[i].item.t);
                    if(conf.zhongzu == me.zz) zzArr.push(data[i]);
                }
                data = zzArr;
            }
            var newData = [],
                arr=[];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if(!d.openday || d.openday == ""){
                    arr.push(d);
                }else if(X.getSeverDay() >= d.openday*1){
                    arr.push(d);
                }
                if (arr.length == me.extConf.maxnum) {
                    newData.push(arr);
                    arr = [];
                }
                // if ((i + 1) % me.extConf.maxnum == 0) {
                //     newData.push(arr);
                //     arr = [];
                // }
            }
            if(arr.length > 0) {
                newData.push(arr);
            }
            return newData;
        },
        // 设置货币信息
        setAttr: function () {
            var me = this;
            me.shopConf = G.class.shop.getById(me.curType);
            if(me.shopConf){
                me.ui.finds('panel_lhs').show();
                me.showAttr = me.shopConf.show[0];
                var imgAttr = me.nodes.token_lhs;
                var txtAttr = me.nodes.txt_sl;
                me.ui.finds('panel_lhs').show();
                imgAttr.loadTexture(G.class.getItemIco(me.showAttr.t), 1);
                txtAttr.setString(X.fmtValue(G.class.getOwnNum(me.showAttr.t,me.showAttr.a)));
            }else {
                me.ui.finds('panel_lhs').hide();
            }
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
        toXsdk: function (data, shopId, idx, num) {
            try {
                var need = data.need[0];
                var item = [].concat(data.item)[0];
                var itemConf = G.class.getItem(item.t, item.a);
                G.event.emit("leguXevent", {
                    type: 'track',
                    event: 'shopping',
                    data: {
                        goods_id: data.id,
                        goods_name: itemConf.name,
                        shopping_type: shopId,
                        goods_price: need.n,
                        buy_num: num,
                        cost_currency_type: need.a,
                        left_currency_type: G.class.getOwnNum(need.t, need.a)
                    }
                });
            } catch (e) {
                cc.warn(e);
            }
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
                    if(me.curType == 'zahuopu'){
                        me.ajax('zahuopu_buy',[idx],function(str ,d){
                            if(!d) return;
                            if(d.s == 1) {
                                G.frame.jiangli.data({
                                    prize:[].concat(prize)
                                }).show();
                                me.refreshPanel();
                            }
                        })
                    }else {
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
                                me.DATA.shop = d.d.shopinfo;
                                G.frame.jiangli.data({
                                    prize:[].concat(prize)
                                }).show();
                                me.toXsdk(data, shopid, idx, num);
                                me.refreshPanel();
                            }
                        },true);
                    }
                }
            }).show();
        },
        //杂货店刷新按钮
        setZaRefresh:function(){
            var me = this;
            me.nodes.txt_txwzj.hide();
            me.nodes.btn_sx.show();
            me.nodes.txt_sj.hide();
            if(me.refresh) me.refresh = 0;
            me.nodes.img_sxzs.loadTexture(G.class.getItemIco('rmbmoney'),1);
            if(me.DATA.num == 0){
                me.nodes.img_sxzs.show();
                me.nodes.text_xh.show();
                me.nodes.text_xh.setString(15);
                me.nodes.mfsx.hide();
                me.nodes.wzsx.show();
                //倒计时隐藏
                me.nodes.img_zhong.show();
                me.nodes.text_djs.show();
                me._setTime();
            }else {
                me.nodes.img_sxzs.hide();
                me.nodes.text_xh.hide();
                me.nodes.mfsx.show();
                me.nodes.wzsx.hide();
                me.nodes.mfsx.setString(L("MFSX") + "(" + me.DATA.num + "/" + "5)");
                //倒计时隐藏
                me.nodes.img_zhong.hide();
                if(me.DATA.num != 5) {
                    me.nodes.text_djs.show();
                    me.nodes.img_zhong.show();
                    me._setTime();
                }
            }

            me.nodes.btn_sx.click(function(sender,type){
                if(me.DATA.num > 0){
                    me.refresh = 1;
                    me.refreshPanel('zahuopu_shuaxin');
                }else {
                    var name = G.class.getItem("rmbmoney","attr").name;
                    var str = X.STR(L("REFRESHSHOP"), 15, name);
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.refresh = 1;
                            me.refreshPanel('zahuopu_shuaxin');
                        },
                        richText: str,
                    }).show();
                }
            },1000);
        },
        _setTime:function () {
            var me = this;
            X.timeout(me.nodes.text_djs,me.DATA.freetime,function () {
                me.getZaShop(function () {
                    me.setContents(true);
                })
            },null);
        },
        //普通商店刷新按钮
        setShopRefresh:function(){
            var me = this;
            me.nodes.img_zhong.hide();
            me.nodes.text_djs.hide();
            me.nodes.txt_sj.hide();
            me.nodes.txt_txwzj.hide();
            var btnRe = me.nodes.btn_sx;
            var imgAttr = me.nodes.img_sxzs;//道具图标
            var txtAttr = me.nodes.text_xh;//消耗数量
            var imgMf = me.nodes.mfsx;//免费刷新
            var imgSx = me.nodes.wzsx;//刷新
            var conf = me.shopConf;
            var data = me.DATA;
            var tips = L('SHUAXIN');
            if(me.curType == '9'){
                me.nodes.txt_sj.show();
                me.nodes.txt_sj.setString(L('DAYCHONGZHI'));
            }

            if(me.curType == "1" || me.curType == "5" || me.curType == "11") {
                imgSx.setString(L("CZ"));
                tips = L("CZ");
            }

            imgAttr.hide();
            txtAttr.hide();
            imgMf.hide();
            imgSx.hide();
            imgMf.setString(L('MFSX'));
            //如果商店不需要刷新，隐藏刷新按钮
            var freeTime = data.shop.freetime;
            if(me.curType == "12"){//武魂商店刷新按钮
                me.nodes.txt_sj.show();
                btnRe.show();
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
                if(me.curType == '15' && me.DATA.shop.autotime && (me.DATA.shop.autotime - G.time)){
                    var needlefttime = me.DATA.shop.autotime - G.time;
                    if (me.timer) {
                        me.timer.clearAllTimers();
                        delete me.timer;
                    }
                    me.nodes.txt_txwzj.show();
                    if (needlefttime > 24 * 3600) {
                        me.nodes.txt_txwzj.setString(X.STR(L("XHCZ"), parseInt(needlefttime / (24 * 3600)) + L("TIAN")));
                    } else {
                        me.timer = X.timeout(me.nodes.txt_txwzj, me.DATA.shop.autotime, function () {
                            me.refreshPanel();
                        }, null, {showStr: L("XHCZ")});
                    }
                }
                return;
            }else if(conf.rseconds == -1 && conf.need.length > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                btnRe.show();
                if(conf.need[0].n == 20000){
                    txtAttr.setString('2万');
                }else {
                    txtAttr.setString(X.fmtValue(conf.need[0].n));
                }
                imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
            }else if (conf.rseconds !== -1 && freeTime - G.time < 0) {
                imgMf.show();
                btnRe.show();
            }else if(conf.rseconds !== -1 && freeTime - G.time > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                btnRe.show();
                if(conf.need[0].n == 20000){
                    txtAttr.setString('2万');
                }else {
                    txtAttr.setString(X.fmtValue(conf.need[0].n));
                }
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
                    //消耗道具是否足够
                    if(G.class.getOwnNum(conf.need[0].t,conf.need[0].a) < conf.need[0].n) return G.tip_NB.show(G.class.getItem(conf.need[0].t, conf.need[0].a).name + L("BUZU"));
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
        // 设置刷新按钮
        setRefreshBtn: function () {
            var me = this;
            if(me.curType == 'zahuopu'){
                me.setZaRefresh();
            }else {
                me.setShopRefresh();
            }
        }
    });
    G.frame[ID] = new fun('shangdian3.json', ID);
})();