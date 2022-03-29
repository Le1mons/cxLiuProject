(function () {
    //巧果兑换

    var ID = 'qixi_qgdh';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

        },

        onOpen: function () {
            var me = this;
          
        },
        onAniShow: function () {
            var me = this;
        },

        onShow: function () {
            var me = this;
            me.conf=G.gc.qixi.duihuan;
            me.setContent();
            

            me.nodes.mask.click(function(){
                me.remove();
            })
        },
        setContent: function(){
            var me = this;
            me.nodes.txt_djs.hide();
            var need = G.gc.qixi.duihuanNeed[0]
            me.nodes.img_title.setBackGroundImage("img/qixi/wz_title3.png",1);
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            var str = X.STR(L("qixi_zlxy1"), G.class.getOwnNum(need.t,need.a));
            me.nodes.panel_xh.removeAllChildren();
            var rh = X.setRichText({
                parent: me.nodes.panel_xh,
                str:str,
                node:img,
                color:"#fff0d8",
                outline:"#000000"
            });
            var data=X.keysOfObject(me.conf);

            var arr = [],arr1 = [];
            for(var i = 0 ; i < data.length; i++){
                var dh1=G.frame.qixi.DATA.myinfo.duihuan[data[i]] ? G.frame.qixi.DATA.myinfo.duihuan[data[i]]:0;
                
                if(me.conf[data[i]].maxnum - dh1 == 0){
                    arr.push(data[i]);
                }else{
                    arr1.push(data[i]);
                }
            }

            data = arr1.concat(arr);

            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao2, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },

        setItem: function(ui,data){
            var me = this;
            var dhdata=me.conf[data]
            X.autoInitUI(ui);
            
            X.render({
                item1:function(node){
                    node.removeAllChildren();
                    var prize=dhdata.need[0];
                    var item = G.class.sitem(prize,false);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(cc.p(50,50))
                    node.addChild(item);
                },
                item2:function(node){
                    node.removeAllChildren();
                    var prize=dhdata.prize[0];
                    var item = G.class.sitem(prize,false);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(cc.p(50,50))
                    node.addChild(item);
                },
                txt:function(node){
                    var num=G.frame.qixi.DATA.myinfo.duihuan[data]? G.frame.qixi.DATA.myinfo.duihuan[data] : 0;
                    node.setString(X.STR(L("HSXC"),dhdata.maxnum-num));
                    node.setColor(cc.color("#000000"))
                },
                btn:function(node){
                    node.prize= dhdata.prize;
                    node.id=data;
                    var num=G.frame.qixi.DATA.myinfo.duihuan[data]? G.frame.qixi.DATA.myinfo.duihuan[data] : 0;
                    if(dhdata.maxnum-num){
                        node.setTouchEnabled(true);
                        node.setBright(true);
                        ui.nodes.btn_txt.setString(L("qixi_qh"));
                    }else{
                        node.setTouchEnabled(false);
                        node.setBright(false);
                        ui.nodes.btn_txt.setString(L("qixi_ysk"));
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
                                G.ajax.send("qixi_duihuan", [sender.id,num], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: d.d.prize
                                        }).show();
                                        G.frame.qixi.DATA.myinfo=d.d.myinfo;
                                        me.setContent();
                                        G.frame.qixi.checkHongdian();
                                    }
                                })
                            }
                        }).show();
                        
                        
                    })
                }
            },ui.nodes);
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('qixi_tk3.json', ID);
})();