/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 中秋商市
    var ID = 'event_zhongqiu_zqss';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_cs: function(node){ // 倒计时
                    var rtime = G.DAO.zhongqiu.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    });
                },
            }, me.nodes);

            me.setAttr();
            me.fmtItemList();
        },
        fmtItemList: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (!me.ui_table) {
                var table = new cc.myTableView({
                    rownum: 1,
                    type: 'fill',
                    lineheight: me.nodes.list_mb.height,
                    // paddingTop: 10
                });
                me.ui_table = table;
                this.setTableViewData();
                table.setDelegate(this);
                table.bindScrollView(me.nodes.scrollview);
            }else {
                this.setTableViewData();
            }
            me.ui_table.reloadDataWithScroll(true);
        },
        setTableViewData: function () {
            var me = this;
            var store = G.gc.midautumn.store;
            var data = [];

            for(var i=0;i<store.length;i++){
                if(i%3 != 0){
                    data[data.length - 1].push(store[i]);
                }else{
                    data.push([store[i]]);
                }
            }

            var table = me.ui_table;
            table.data(data);
        },
        cellDataTemplate: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            return me.nodes.list_mb.clone();
        },
        cellDataInit: function (ui, data, pos) {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if (data == null) {
                ui.hide();
                return;
            }
            ui.setName('item_' + ui.idx);
            if(!ui.nodes) X.autoInitUI(ui);

            for(var i=0;i<3;i++){
                (function(idx){
                    var index = (ui.idx*3) + idx;
                    // me.ui.setTimeout(function (){
                        me.setItem(ui.nodes['panel_wp' + (idx + 1)], data[idx], index);
                    // }, index * 16);
                })(i);
            }

            ui.setTouchEnabled(false);
            ui.show();
        },
        setItem: function(ui, data, idx){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if (data == null) {
                ui.removeAllChildren();
                return;
            }

            var list = me.nodes.list_sd.clone();
            if(!list.nodes) X.autoInitUI(list);
            var need = data.need[0];
            var prize = data.prize[0];

            var buyNum = G.DATA.zhongqiu.store.length > idx ? G.DATA.zhongqiu.store[idx] : 0;
            var sellOut = data.num <= buyNum;
            var hasSale = data.sale && data.sale != 100;

            X.render({
                ico_sdtb: function(node){
                    var widget = G.class.sitem(prize);
                    widget.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(widget);
                    G.frame.iteminfo.showItemInfo(widget);
                    node.setTouchEnabled(false);
                    widget.setSwallowTouches(true);
                },
                // text_sd: function(node){
                //     node.setString(G.class.getItem(prize.t, prize.a).name);
                //     node.show();
                // },
                img_ygm1: function(node){ // 售罄
                    node.setVisible(sellOut);
                },

                // 价格
                image_jb: function(node){
                    node.setVisible(!sellOut);
                    node.loadTexture(G.class.getItemIco(need.t),1);
                },
                text_jinbi: (sellOut || hasSale) ?  '' : need.n + '',

                // 限购
                xiangou: function(node){
                    node.setVisible(true);
                    node.setTouchEnabled(false);
                },
                wz1: function(node){
                    node.setTextColor(cc.color('#ffffff'));

                    if(P.gud.vip < data.vip){
                        node.setString(X.STR(L('zhongqiu_vipxg'), data.vip));
                        X.enableOutline(node,cc.color('#0e9409'), 2);
                    }else{
                        if(data.refresh == 0){
                            node.setString(X.STR(L('zhongqiu_store_xg1'), data.num - buyNum));
                            X.enableOutline(node,cc.color('#0e9409'), 2);
                        }else if(data.refresh == 1){
                            node.setString(X.STR(L('zhongqiu_store_xg2'), data.num - buyNum));
                            X.enableOutline(node,cc.color('#cb630a'), 2);
                        }
                    }
                },

                // 折扣
                img_zkbg: function(node){
                    node.setVisible(hasSale && !sellOut);
                },
                text_zk: function(node){
                    if(hasSale && !sellOut){
                        node.setString(X.STR(L('zhongqiu_store_sale'), data.sale / 10));
                        X.enableOutline(node,cc.color('#CB630A'), 2);
                    }else{
                        node.setString('');
                    }
                },
                panel_dazhe: function(node){
                    node.setVisible(hasSale && !sellOut);
                    node.setTouchEnabled(false);
                },
                text_jinbisz1: need.n + '', // 原价
                text_jinbisz2: (need.n * ( data.sale / 100)) + '', // 折扣价
            }, list.nodes);

            list.setTouchEnabled(false);
            list.setAnchorPoint(0.5,0.5);
            list.setPosition(cc.p(ui.width*0.5, ui.height*0.5));
            list.show();
            ui.removeAllChildren();
            ui.addChild(list);

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.setPropagateTouchEvents(true);
            ui.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_NOMOVE) {
                    if(sellOut){
                        G.tip_NB.show(L('SHOP_ITEM_OVER'));
                        return;
                    }
                    if(P.gud.vip < data.vip){
                        G.tip_NB.show(X.STR(L('zhongqiu_tip_vipxg'), data.vip));
                        return;
                    }

                    var itemData = JSON.parse(JSON.stringify(data));
                    if (itemData.sale < 100) itemData.need[0].n = parseInt(itemData.need[0].n * (itemData.sale / 100));
                    var buynum = Math.floor(G.class.getOwnNum(itemData.need[0].t, itemData.need[0].a) / itemData.need[0].n);

                    G.frame.buying.data({
                        num: 1,
                        item: [].concat(itemData.prize),
                        need: itemData.need,
                        maxNum: buynum < 0 ? 0 : buynum,
                        callback: function (num) {
                            G.DAO.zhongqiu.store(idx, num, function(dd) {
                                G.frame.jiangli.once('show', function(){
                                    me.setAttr();
                                    G.DAO.zhongqiu.getServerData(function(){
                                        me.setItem(sender, data, idx);
                                    });
                                }).data({
                                    prize:[].concat(dd.prize)
                                }).show();
                            });
                        }
                    }).show();
                }
            });

        },
        setAttr: function () {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            cc.enableScrollBar(me.nodes.scrollview, false);

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.once("hide", function () {
                    me.setAttr();
                }).show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.once("hide", function () {
                    me.setAttr();
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu_zqss.json', ID);
})();