/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //等级基金
    G.class.huodong_lvFund = X.bView.extend({
        extConf: {

        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_djjj.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
                me.checkRedPoint();
            });
        },
        getType:function(){
            var me = this;
            if(me.DATA.val < G.gc.djjj.data.dengjijijin_1.arr[G.gc.djjj.data.dengjijijin_1.arr.length-1].val) return me.type = 'dengjijijin_1';
            var typearr = X.keysOfObject(G.gc.djjj.data);
            for(var i = 0; i < typearr.length; i++){
                var data = G.gc.djjj.data[typearr[i]].arr;
                for(var j = 0; j < data.length; j++){
                    //直接跳到有奖励可领取的最小页签
                    if(me.DATA.val >= data[j].val && (!X.inArray(me.DATA[typearr[i]].free,j) || (me.DATA[typearr[i]].pay && !X.inArray(me.DATA[typearr[i]].paid,j)))){
                        return me.type = typearr[i];
                    }
                }
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_5.arr[G.gc.djjj.data.dengjijijin_5.arr.length-1].val) return me.type = 'dengjijijin_6';
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_4.arr[G.gc.djjj.data.dengjijijin_4.arr.length-1].val) return me.type = 'dengjijijin_5';
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_3.arr[G.gc.djjj.data.dengjijijin_3.arr.length-1].val) return me.type = 'dengjijijin_4';
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_2.arr[G.gc.djjj.data.dengjijijin_2.arr.length-1].val) return me.type = 'dengjijijin_3';
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_1.arr[G.gc.djjj.data.dengjijijin_1.arr.length-1].val) return me.type = 'dengjijijin_2';
        },
        checkRedPoint:function(){
            var me = this;
            //三个切页按钮的红点
            var typearr = X.keysOfObject(G.gc.djjj.data);
            for(var i = 0; i < typearr.length; i++){
                var data = G.gc.djjj.data[typearr[i]].arr;
                G.removeNewIco(me.nodes['btn_0' + (i+1)]);
                for(var j = 0; j < data.length; j++){
                    //有奖励可领取
                    if(me.DATA.val >= data[j].val && (!X.inArray(me.DATA[typearr[i]].free,j) || (me.DATA[typearr[i]].pay && !X.inArray(me.DATA[typearr[i]].paid,j)))){
                        G.setNewIcoImg(me.nodes['btn_0' + (i+1)]);
                        me.nodes['btn_0' + (i+1)].finds('redPoint').setPosition(55,55);
                        break;
                    }
                }
            }

        },
        initBtn:function(){
            var me = this;

            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_1.arr[G.gc.djjj.data.dengjijijin_1.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_1')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx1,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_01.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_1',1);
                }else {
                    me.nodes.btn_01.show();
                }
            }else {
                me.nodes.btn_01.hide();
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_1.arr[G.gc.djjj.data.dengjijijin_1.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_2')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx2,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_02.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_2',1);
                }else {
                    me.nodes.btn_02.show();
                }
            }else {
                me.nodes.btn_02.hide();
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_2.arr[G.gc.djjj.data.dengjijijin_2.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_3')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx3,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_03.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_3',1);
                }else {
                    me.nodes.btn_03.show();
                }
            }else {
                me.nodes.btn_03.hide();
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_3.arr[G.gc.djjj.data.dengjijijin_3.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_4')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx4,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_04.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_4',1);
                }else {
                    me.nodes.btn_04.show();
                }
            }else {
                me.nodes.btn_04.hide();
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_4.arr[G.gc.djjj.data.dengjijijin_4.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_5')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx5,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_05.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_5',1);
                }else {
                    me.nodes.btn_05.show();
                }
            }else {
                me.nodes.btn_05.hide();
            }
            if(me.DATA.val >= G.gc.djjj.data.dengjijijin_5.arr[G.gc.djjj.data.dengjijijin_5.arr.length-1].val){
                if(!X.cacheByUid('dengjijijin_6')){
                    G.class.ani.show({
                        json: "huodong_djjj_tx",
                        addTo: me.nodes.panel_tx6,
                        repeat: false,
                        autoRemove: true,
                        onkey: function (node, action, event) {
                            if (event == "hit") {
                                me.nodes.btn_06.show();
                            }
                        }
                    });
                    X.cacheByUid('dengjijijin_6',1);
                }else {
                    me.nodes.btn_06.show();
                }
            }else {
                me.nodes.btn_06.hide();
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_buy.setTouchEnabled(true);
            me.nodes.btn_buy.click(function (sender, type) {

                G.event.once('paysuccess', function() {
                    G.frame.jiangli.data({
                        prize:G.gc.djjj.data[me.type].prize
                    }).show();
                    me.refreshPanel();
                    G.hongdian.getHongdian(1, function () {
                        G.frame.huodong.checkRedPoint();
                    })
                });
                G.event.emit('doSDKPay', {
					pid:me.type,
                    logicProid: me.type,
                    money: G.gc.djjj.data[me.type].needmoney * 100,
                });
            }, 500);
            me.nodes.btn_01.click(function () {
                me.nodes.panel_xz1.show();
                me.nodes.panel_xz2.hide();
                me.nodes.panel_xz3.hide();
                me.nodes.panel_xz4.hide();
                me.nodes.panel_xz5.hide();
                me.nodes.panel_xz6.hide();
                me.setTable('dengjijijin_1');
            });
            me.nodes.btn_02.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.show();
                me.nodes.panel_xz3.hide();
                me.nodes.panel_xz4.hide();
                me.nodes.panel_xz5.hide();
                me.nodes.panel_xz6.hide();
                me.setTable('dengjijijin_2');
            });
            me.nodes.btn_03.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.hide();
                me.nodes.panel_xz3.show();
                me.nodes.panel_xz4.hide();
                me.nodes.panel_xz5.hide();
                me.nodes.panel_xz6.hide();
                me.setTable('dengjijijin_3');
            });
            me.nodes.btn_04.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.hide();
                me.nodes.panel_xz3.hide();
                me.nodes.panel_xz4.show();
                me.nodes.panel_xz5.hide();
                me.nodes.panel_xz6.hide();
                me.setTable('dengjijijin_4');
            });
            me.nodes.btn_05.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.hide();
                me.nodes.panel_xz3.hide();
                me.nodes.panel_xz4.hide();
                me.nodes.panel_xz5.show();
                me.nodes.panel_xz6.hide();
                me.setTable('dengjijijin_5');
            });
            me.nodes.btn_06.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.hide();
                me.nodes.panel_xz3.hide();
                me.nodes.panel_xz4.hide();
                me.nodes.panel_xz5.hide();
                me.nodes.panel_xz6.show();
                me.setTable('dengjijijin_6');
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.panel_txt.hide();
            me.nodes.panel_tx6.show();
            me.nodes.btn_01.hide();
            me.nodes.btn_02.hide();
            me.nodes.btn_03.hide();
            me.nodes.btn_04.hide();
            me.nodes.btn_05.hide();
            me.nodes.btn_06.hide();
        },
        onShow: function () {
            var me = this;

            me.nodes.jijin_tiao.show();
            X.viewCache.getView("event_list10.json", function (node) {
                me.list = node.nodes.panel_list;
                me.getData(function () {
                    me.initBtn();
                    me.getType();
                    me.setContents();
                    me.checkRedPoint();
                })
            });
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("sdjj_open", ['djjj'], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable(me.type);
            for(var i = 1; i < 7; i++){
                if(me.type.split('_')[1] == i && me.nodes['btn_0' + i].isVisible()){
                    me.nodes['panel_xz' + i].show();
                }else {
                    me.nodes['panel_xz' + i].hide();
                }
            }
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.getData(function () {
                    me.initBtn();
                    me.setContents();
                })
            }
        },
        refreshData: function () {
            var me = this;
            me.getData(function () {
                me.table.setData(me.DATA.prize);
                me.table.reloadDataWithScroll(false);
                me.checkRedPoint();
            });
        },
        setBanner: function () {
            var me = this;

            X.render({
                img_bg: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner33.png', 0);
                }
            },me.nodes);
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "3109a"},
            });
        },
        setTable: function (type) {
            var me = this;
            me.type = type;
            me.nodes.btn_buy.setVisible(!me.DATA[me.type].pay);
            me.nodes.btn_txt1.setString(me.DATA[me.type].pay ? L("YGM") : G.gc.djjj.data[me.type].needmoney + L("YUAN"));
            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var data = JSON.parse(JSON.stringify(G.gc.djjj.data[me.type].arr));
            for(var i = 0; i < data.length; i ++){
                data[i].idx = i;
            }
            for(var i = 0; i < data.length; i ++){
                if(X.inArray(me.DATA[me.type].paid, data[i].idx)){//以领取
                    data[i].rank = 2;
                }else{
                    data[i].rank = 1;
                }
            }
            data.sort(function (a, b) {
                if(a.rank != b.rank){
                    return a.rank < b.rank ? -1 : 1;
                }else{
                    return a.idx < b.idx ? -1 : 1;
                }

            });

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                txt_jdt: function(node){
                    node.setString(me.DATA.val + "/" + data.val);
                    X.enableOutline(node,'#66370e',2);
                },
                wz2:data.val,
                img_jdt: function (node) {
                    node.setPercent(me.DATA.val / data.val * 100);
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.free, 'left', {
                        touch: true,
                        mapItem: function (item) {
                            if (X.inArray(me.DATA[me.type].free, data.idx)) {
                                var ylq = new ccui.ImageView('img/public/img_ylq.png',1);
                                ylq.setAnchorPoint(cc.p(0.5,0.5));
                                ylq.setPosition(cc.p(item.width / 2,item.height / 2));
                                item.addChild(ylq);
                            }
                        }
                    })
                },
                ico_item2: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.paid, 'left', {
                        touch: true,
                        mapItem: function (item) {
                            if (X.inArray(me.DATA[me.type].paid, data.idx)) {
                                var ylq = new ccui.ImageView('img/public/img_ylq.png',1);
                                ylq.setAnchorPoint(cc.p(0.5,0.5));
                                ylq.setPosition(cc.p(item.width / 2,item.height / 2));
                                item.addChild(ylq);
                            }
                        }
                    })
                },
                zhezhao: function (node) {
                    node.setTouchEnabled(false);
                    node.setVisible(!me.DATA[me.type].pay);
                },
                btn: function (node) {
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    var freeOver = X.inArray(me.DATA[me.type].free, data.idx);//是否免费领取
                    var jinjieOver = X.inArray(me.DATA[me.type].paid, data.idx);//是否付费领取
                    var isMeet = me.DATA.val >= data.val;//是否满足条件
                    var isActive = me.DATA[me.type].pay;//是否激活
                    G.removeNewIco(node);
                    node.setBtnState(true);
                    ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                    if(isMeet){//满足条件
                        if(!freeOver || (isActive && !jinjieOver)){//显示领取
                            G.setNewIcoImg(node, .9);
                            node.setBright(true);
                            ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n13));
                            ui.nodes.btn_txt.setString(L("LQ"));
                        }else if(!isActive && freeOver){//进阶领取
                            ui.nodes.btn_txt.setString(L("JJLQ"));
                        }else if(freeOver && jinjieOver){//已领取
                            ui.nodes.btn_txt.setString(L("YLQ"));
                            node.setBtnState(false);
                            ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                        }
                    }else {//不可领取
                        node.setBright(false);
                        ui.nodes.btn_txt.setString(L("LQ"));
                        ui.nodes.btn_txt.setTextColor(cc.color(G.gc.COLOR.n15));
                    }
                    node.click(function (sender, type) {
                        if (jinjieOver && freeOver) return G.tip_NB.show(L("JLYLQ"));
                        if (!isMeet) return G.tip_NB.show(L("TJBZWFLQ"));
                        if (freeOver && !isActive) {
                            return me.nodes.btn_buy.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        }
                        G.ajax.send("sdjj_receive", ['djjj',me.type,data.idx], function (d) {
                            if (!d) return;
                            d = JSON.parse(d);
                            if (d.s == 1) {
                                me.refreshData();
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).once('willClose',function () {
                                    //判断是不是领的最后一个奖励
                                    var getnum = 0;
                                    for(var k in G.gc.djjj.data){
                                        if(me.DATA[k].paid.length >= G.gc.djjj.data[k].arr.length){
                                            getnum++;
                                        }
                                    }
                                    if(getnum == X.keysOfObject(G.gc.djjj.data).length){
                                        me.ajax('getayncbtn',[['sdjj']],function(str,data){
                                            G.DATA.asyncBtnsData.sdjj = data.d.sdjj;
                                            G.frame.huodong.getListData(function () {
                                                G.frame.huodong.refreshPanel();
                                            });
                                        });
                                    }
                                }).show();
                                G.frame.huodong.updateTop();
                                G.hongdian.getData("sdjj", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                            }
                        }, true)
                    })
                }
            }, ui.nodes);
            ui.show();
        }
    })
})();
