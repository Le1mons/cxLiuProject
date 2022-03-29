/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 中秋礼包
    var ID = 'event_zhongqiu_zqlb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_sj: function(node){ // 倒计时
                    var rtime = G.DAO.zhongqiu.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    });
                },
                panel_di: function (node) {
                    node.setTouchEnabled(true);
                    node.click(function (sender) {
                        me.remove();
                    })                     
                },
            }, me.nodes);

            me.fmtItemList();
        },
        fmtItemList: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (!me.ui_table) {
                var table = new cc.myTableView({
                    rownum: 1,
                    type: 'fill',
                    lineheight: me.nodes.list.height,
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
            var conf = G.gc.midautumn.giftpack;
            var keys = X.keysOfObject(conf);
            keys.sort(function(a, b){
                return conf[a].num*1 - conf[b].num*1;
            });

            var table = me.ui_table;
            table.data(keys);
        },
        cellDataTemplate: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            return me.nodes.list.clone();
        },
        cellDataInit: function (ui, gid, pos) {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if (gid == null) {
                ui.hide();
                return;
            }
            ui.setName('item_' + ui.idx);
            if(!ui.nodes) X.autoInitUI(ui);

            me.setItem(ui, gid);
            ui.show();
        },
        setItem: function(ui, gid){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var data = G.gc.midautumn.giftpack[gid];
            var canBuy = data.num - (G.DATA.zhongqiu.giftpack[gid] || 0);

            X.render({
                panel_lb: function(node){ // 标题
                    node.setBackGroundImage('img/zhongqiu/img_wz_lb' + (ui.idx + 1) + '.png',ccui.Widget.PLIST_TEXTURE);
                },
                panel_wp: function(node){
                    var prize = data.prize;
                    node.removeAllChildren();
                    X.centerLayout(node, {
                        dataCount:prize.length,
                        extend:false,
                        delay:false,
                        cellCount:5,
                        nodeWidth:100,
                        rowHeight:100,
                        // interval:10,
                        itemAtIndex: function (index) {
                            var p = prize[index];

                            var widget = G.class.sitem(p);
                            G.frame.iteminfo.showItemInfo(widget);
                            return widget;
                        }
                    });
                },
                txt_cs: canBuy + '', // 限购数
                txt_sz: data.needmoney + L('YUAN'), // 价格
                btn_gm: function(node){
                    node.setTouchEnabled(true);
                    node.setBright(canBuy > 0);
                    node.setSwallowTouches(false);
                    node.setPropagateTouchEvents(true);
                    node.touch(function (sender, type) {
                        if (type === ccui.Widget.TOUCH_NOMOVE) {
                            if(!sender.isBright()) return;

                            G.event.once('paysuccess', function() {
                                G.frame.jiangli.data({
                                    prize: data.prize
                                }).show();

                                G.DAO.zhongqiu.getServerData(function(){
                                    me.setItem(ui, gid);
                                });

                                // G.hongdian.getData('lifetimecard',1,function () {
                                //     G.frame.huodong.checkRedPoint();
                                //     me.setContents();
                                // })
                            });
                            G.event.emit('doSDKPay', {
                                pid: gid,
                                logicProid: gid,
                                money: data.needmoney * 100,
                            });
                        }
                    });
                },
            }, ui.nodes);
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            cc.enableScrollBar(me.nodes.scrollview, false);

            me.nodes.mask.click(function(sender,type){
                me.remove();
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

    G.frame[ID] = new fun('event_zhongqiu_zqlb.json', ID);
})();