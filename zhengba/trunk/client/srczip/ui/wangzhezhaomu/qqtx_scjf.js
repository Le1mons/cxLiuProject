(function () {
//商城积分
    var ID = 'qqtx_scjf';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.finds('mask').click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.DATA = me.data();
            for(var i = 0; i < me.DATA.prize.length; i++){
                me.DATA.prize[i].index = i;
            }
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;

            //拥有
            me.nodes.daibi.removeBackGroundImage();
            me.nodes.daibi.setBackGroundImage(G.class.getItemIco(me.DATA.prize[0].need[0].t),1);
            me.nodes.zs_wz.setString(X.fmtValue(G.class.getOwnNum(me.DATA.prize[0].need[0].t,me.DATA.prize[0].need[0].a)));
            var data = me.getData(me.DATA.prize);

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setlist(ui, data);
                },null,null,10,10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setlist:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            for(var i = 0; i < data.length; i++){
                var item = me.nodes.list.clone();
                me.setItem(item,data[i]);
                ui.nodes['list' + (i+1)].removeAllChildren();
                ui.nodes['list' + (i+1)].addChild(item);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setPosition(0,0);
            var txt_bg = ui.finds('bg_limit');
            txt_bg.setColor(cc.color('#d37656'));
            var prize = G.class.sitem(data.prize[0]);
            prize.setPosition(0,0);
            prize.setAnchorPoint(0,0);
            ui.nodes.ico_tb.removeAllChildren();
            ui.nodes.ico_tb.addChild(prize);
            ui.nodes.img_zs.loadTexture(G.class.getItemIco(data.need[0].t),1);
            ui.nodes.txt_jb.setString(data.need[0].n);
            ui.nodes.txt_limit.setString(X.STR(L("WANZGHEZHAOMU15"),data.val - (me.DATA.buyinfo[data.index]||0),data.val));

            //是否售罄
            if(me.DATA.buyinfo[data.index] >= data.val){
                ui.setTouchEnabled(false);
                ui.nodes.img_ygm.show();
            }else {
                ui.setTouchEnabled(true);
                ui.nodes.img_ygm.hide();
            }
            ui.data = data;
            ui.setSwallowTouches(false);
            ui.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.iteminfo_plgm.data({
                        buy : sender.data.prize[0],
                        buyneed: sender.data.need,
                        num: 1,
                        maxNum : sender.data.val - (me.DATA.buyinfo[sender.data.index]||0),
                        callback:function (num) {
                            me.ajax("wangzhezhaomu_duihuan", [sender.data.index,num], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    G.frame.iteminfo_plgm.remove();
                                    me.DATA.buyinfo = data.d.boss.buyinfo;
                                    G.frame.wangzhezhaomu_main.view.DATA.boss.buyinfo = data.d.boss.buyinfo;
                                    me.setContents();
                                }
                            });
                        }
                    }).show();
                }
            })
        },
        getData:function(data){
            var me = this;
            var newData = [],
                arr=[];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                arr.push(d);
                if (arr.length == 2) {
                    newData.push(arr);
                    arr = [];
                }
            }
            if(arr.length > 0) {
                newData.push(arr);
            }
            return newData;
        }
    });

    G.frame[ID] = new fun('event_chuanqitiaozhan_duihuanshangcheng.json', ID);
})();
