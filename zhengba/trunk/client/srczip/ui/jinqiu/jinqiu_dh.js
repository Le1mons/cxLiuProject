/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_dh';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            var need = G.gc.midautumn2.duihuanNeed[0];
            var str = X.STR(L("JQHD_3"),G.class.getOwnNum(need.t, need.a));
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            me.nodes.panel_mask.click(function (sender) {
                me.remove();
            })
            img.setScale(0.7);
            var rh = X.setRichText({
                parent:me.nodes.txt_sy,
                str:str,
                color:"#804326",
                node:img,
                size:22,
            });
            me.nodes.list_lb.setTouchEnabled(false);
            var data = X.keysOfObject(G.gc.midautumn2.duihuan);
            var arr=[];
            for(var i = 0 ; i < data.length ;i++){
                if(G.gc.midautumn2.duihuan[data[i]].rtime && !(G.time >= (G.DATA.asyncBtnsData.midautumn2.stime + G.gc.midautumn2.duihuan[data[i]].rtime * 24 * 60 * 60)) ){
                    
                }else{
                    arr.push(data[i]);
                }
            }
            if(!me.table){
                var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_lb,1, function (ui, data) {
                    me.setItem(ui,data);
                },null,null,10);
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui,data) {
            var me = this;
            var dhdata=G.gc.midautumn2.duihuan[data];
            X.autoInitUI(ui);
            X.render({
                panel_wp1:function(node){
                    node.removeAllChildren();
                    var prize=dhdata.need[0];
                    var item = G.class.sitem(prize,false);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(cc.p(50,50))
                    node.addChild(item);
                },
                panel_wp2:function(node){
                    node.removeAllChildren();
                    var prize=dhdata.prize[0];
                    var item = G.class.sitem(prize,false);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(cc.p(50,50))
                    node.addChild(item);
                },
                text_jf2:function(node){
                    var num=me.DATA.myinfo.duihuan[data]? me.DATA.myinfo.duihuan[data] : 0;
                    node.setString(X.STR(L("HSXC"),dhdata.maxnum-num));
                },
                btn_ks:function(node){
                    node.prize= dhdata.prize;
                    node.id=data;
                    var num=me.DATA.myinfo.duihuan[data]? me.DATA.myinfo.duihuan[data] : 0;
                    if(dhdata.maxnum-num){
                        node.setTouchEnabled(true);
                        node.setBright(true);
                        ui.nodes.txt_ks.setString(L("qixi_qh"));
                        ui.nodes.txt_ks.setTextColor(cc.color("#2f5719"));
                    }else{
                        node.setTouchEnabled(false);
                        node.setBright(false);
                        ui.nodes.txt_ks.setString(L("qixi_ysk"));
                        ui.nodes.txt_ks.setTextColor(cc.color("#6c6c6c"));
                    }
                    node.need=dhdata.need;
                    node.maxnum=dhdata.maxnum
                    node.buy=dhdata.prize[0];
                    node.click(function(sender){
                        G.frame.iteminfo_plgm.data({
                            buy : sender.buy,
                            buyneed: sender.need,
                            num: 1,
                            maxNum :  node.maxnum - num,
                            callback:function (num) {
                                G.ajax.send("midautumn2_duihuan", [sender.id,num], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: d.d.prize
                                        }).show();
                                        me.DATA.myinfo = d.d.myinfo;
                                        me.setContents();
                                    }
                                })
                            }
                        }).show();
                    })
                }
            },ui.nodes);
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;


        },

        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
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

            G.DAO.jinqiu.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
        },
        onAniShow: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_fengshouxingdong_tk.json', ID);
})();