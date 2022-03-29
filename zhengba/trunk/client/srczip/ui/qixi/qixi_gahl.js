(function () {
    //供案惠礼

    var ID = 'qixi_gahl';

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
            me.nodes.img_title.setBackGroundImage("img/qixi/wz_title4.png",1);
            me.nodes.mask.click(function(){
                me.remove();
            })
            me.setContent();
            me.nodes.txt_djs.hide();
        },
        setContent: function(){
            var me = this;
            var data=X.keysOfObject(G.gc.qixi.libao);

            var arr = [],arr1 = [];
            for(var i = 0 ; i < data.length; i++){
                var dh1=G.frame.qixi.DATA.myinfo.libao[data[i]]?G.frame.qixi.DATA.myinfo.libao[data[i]]:0;

                if(G.gc.qixi.libao[data[i]].buynum - dh1 == 0){
                    arr.push(data[i]);
                }else{
                    arr1.push(data[i]);
                }
            }

            data = arr1.concat(arr);

            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao3, 1, function (ui, data) {
                    me.setItem(ui, data);
                },null,0,10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },

        setItem: function(ui,data){
            var me = this;
            var conf=G.gc.qixi.libao[data];
            X.autoInitUI(ui);
            X.render({
                libao_mz:function(node){
                    node.setString(conf.name)
                },
                ico_nr:function(node){
                    X.alignItems(node, conf.prize, 'left', {
                        touch: true,
                        scale: 0.8
                    });
                },
                zs_wz:function(node){
                    node.setString((conf.money/100) + L("YUAN"));
                    node.setColor(cc.color("#000000"))
                },
                btn_gm:function(node){
                    var num=G.frame.qixi.DATA.myinfo.libao[data]?G.frame.qixi.DATA.myinfo.libao[data]:0;
                    node.money=conf.money;
                    node.pid=conf.proid;
                    node.logicProid=conf.proid;
                    node.prize=conf.prize
                    if(conf.buynum-num){
                        node.setTouchEnabled(true);
                        node.setBright(true);
                    }else{
                        node.setBright(false);
                        node.setTouchEnabled(false);
                    }
                    node.click(function(sender){
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: sender.prize
                            }).show();
                            G.frame.qixi.getData(function () {
                                me.setContent();
                                G.frame.qixi.setContent();
                            });
                            
                        });
                        G.event.emit('doSDKPay', {
                            pid:sender.pid,
                            logicProid: sender.logicProid,
                            money: sender.money,
                            pname: sender._aname
                        });
                    })
                },
                wz_xg:function(node){
                    var num=G.frame.qixi.DATA.myinfo.libao[data]?G.frame.qixi.DATA.myinfo.libao[data]:0;
                    node.setString(X.STR(L("XG"),conf.buynum-num));
                    node.setColor(cc.color("#000000"))
                }
            },ui.nodes);
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('qixi_tk3.json', ID);
})();