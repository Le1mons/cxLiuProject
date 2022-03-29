/**
 * Created by wfq on 2018/7/8.
 */
(function () {
    //兑换

    G.event.on("itemchange_over", function () {
        if(G.frame.huodong.duihuan) {
            G.frame.huodong.duihuan.showItem();
        }
    });

    G.class.huodong_duihuan = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            G.frame.huodong.duihuan = me;
            me._super('event_scrollview.json');
        },
        refreshPanel:function () {

        },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            X.viewCache.getView('event_list2.json', function(view) {
                me.list = view.nodes.panel_list;
                // me.ui.addChild(view);
                me.getData(function () {
                    me.setContents();
                });
            });
            me.setBanner();
            me.showItem();
        },
        showItem: function() {
            var me = this;

            if(me._data.showitem && X.keysOfObject(me._data.showitem).length > 0) {

                me.ui.finds("daibi").show();
                me.ui.finds("ico").setBackGroundImage(G.class.getItemIco(me._data.showitem.t), 1);
                me.ui.finds("wz_sz").setString(G.class.getOwnNum(me._data.showitem.t, "item"));
            }
        },
        onShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;

            G.frame.huodong.duihuan = undefined;
        },
        getData: function (callback) {
            var me = this;
            G.frame.huodong.getData(me._data.hdid,function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        setContents: function () {
            var me = this;
            me.setTime();
            var table = new X.TableView(me.nodes.scrollview,me.list,1, function (ui, data,pos) {
                me.setItem(ui,data,pos[0]);
            },null,null,1);
            table.setData(me.DATA.myinfo.arr);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setIcon:function (ui,arr,b,i) {
            var me = this;
            if( !i ) i = 0;
            var enough = 0;
            for(var idx = 0; idx < arr.length; idx++){
                var wid = G.class.sitem(arr[idx]);
                var item = ui.nodes['item'+ (idx + 1 + i)];
                wid.setPosition(item.width * 0.5,item.height * 0.5);
                item.removeAllChildren();
                item.addChild(wid);
                G.frame.iteminfo.showItemInfo(wid);
                if(b){
                    G.class.getOwnNum(arr[idx].t,arr[idx].a) >= arr[idx].n ? enough ++ :'';
                }
            }
            return enough == arr.length ? true : false;
        },
        setItem:function (ui,data,pos) {
            var me = this;
            X.autoInitUI(ui);
            if(!data){
                ui.hide();
                return;
            }
            //消耗图标
            var  enough = me.setIcon(ui, data.need ,true);

            var i = 2;
            if(data.need.length == 1){
                ui.nodes.img_plus.loadTexture('img/event/img_event_equal.png',1);
                ui.nodes.img_event_equal.hide();
                i = 1;
            }
            //奖励图标
            me.setIcon(ui, data.p , false ,i);
            X.render({
                txt: function(node){
                    var str = new ccui.Text(data.buynum >= 0 ? X.STR(L('XGX'),data.buynum) : L("YJ"), G.defaultFNT, 18);
                    str.setAnchorPoint(0.5, 0.5);
                    str.setTextColor(cc.color(G.gc.COLOR.n4));
                    str.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(str);
                },
                btn_txt:function (node) {
                    node.setString(L('DUIHUAN'));
                    node.setTextColor(cc.color(G.gc.COLOR.n12));
                },
            },ui.nodes);
            if(data.buynum < 1){
                ui.nodes.btn.setTouchEnabled(false);
                ui.nodes.btn.setBright(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }else{
            	ui.nodes.btn.setTouchEnabled(true);
                ui.nodes.btn.setBright(true);
                ui.nodes.btn_txt.setTextColor(cc.color("#2f5719"));
            }
            ui.nodes.btn.loadTextureNormal("img/public/btn/btn1_on.png", 1);
            ui.nodes.btn.data = data;
            ui.nodes.btn.pos = pos;
            ui.nodes.btn.click(function(sender, type){
                if(me.timeout){
                    G.tip_NB.show(L("LBGQ"));
                    return;
                }
                me.ajax('huodong_use',[me._data.hdid,1,sender.pos],function(str,d) {
                    if(d.s == 1) {
                        cc.mixin(me.DATA.myinfo.arr[sender.pos],d.d.myinfo,true);
                        G.frame.jiangli.data({
                            prize: sender.data.p
                        }).show();
                        me.showItem();
                        me.setItem(sender.getParent(), me.DATA.myinfo.arr[sender.pos] ,sender.pos);
                    }
                },true);
            });
            ui.show();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        setBanner: function () {
            var me = this;
            X.render({
                panel_banner: function (node) {
                    node.setBackGroundImage('img/event/img_event_banner4.png', 0);
                },
                txt_count:L('SHENGYU'),
                panel_title: function(node) {
                    var rh = new X.bRichText({
                        size:22,
                        maxWidth:node.width + 60,
                        lineHeight:24,
                        family:G.defaultFNT,
                        color:G.gc.COLOR.n5,
                        eachText: function (node) {
                            X.enableOutline(node,'#000000');
                        },
                    });
                    rh.text(me._data.intr);
                    rh.setAnchorPoint(0,1);
                    rh.setPosition(0, node.height);
                    node.addChild(rh);
                },
            },me.nodes);
            X.setModel({
                parent: me.nodes.panel_hero1,
                data: {hid: "1203a"},
            });
        },
        setTime:function () {
            var me = this;
            me.nodes.panel_txt.show();
            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_count.hide();
                me.nodes.txt_time.setString(X.moment(me.DATA.info.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_time, me.DATA.info.etime, function () {
                    me.timeout = true;
                })
            }
        },
    });

})();