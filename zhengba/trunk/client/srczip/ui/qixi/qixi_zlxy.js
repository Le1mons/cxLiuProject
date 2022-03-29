(function () {
    //织女心愿

    var ID = 'qixi_zlxy';

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
            me.nodes.img_title.setBackGroundImage("img/qixi/wz_title2.png",1);
            me.nodes.mask.click(function(){
                me.remove();    
            })
            
            X.timeout(me.nodes.txt_sxsj,G.time + X.getOpenTimeToNight(G.time))
            me.setContent();
            
        },
        setContent: function(){
            var me = this;
            me.rec=G.frame.qixi.DATA.myinfo.task.rec;
            me.kwctask=G.frame.qixi.DATA.myinfo.task.data;
            me.task=G.gc.qixi.task
            var data = X.keysOfObject(me.task);



            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao1, 1, function (ui, data) {
                    me.setItem(ui, data);
                },null,0,15);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },

        setItem: function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            var conf=me.task[data]
            X.render({
                txt_name:function(node){
                    //    qixi_txt:"{1} <font color={2}>({3}/{4})</font>",
                    var ywc=G.frame.qixi.DATA.myinfo.task.data[data]?G.frame.qixi.DATA.myinfo.task.data[data]:0;
                    node.setColor(cc.color("#000000"))
                    // if(conf.pval <= ywc){
                    //     var color='#cafd79';
                    // }else{
                        var color='#4E1400';
                    // }
                    var str=X.STR(L("qixi_txt"),conf.desc,color,ywc,conf.pval)
                    var rh = X.setRichText({
                        str: str,
                        parent: node,
                    });
                    rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                   
                    
                },
                img_item:function(node){
                    node.removeAllChildren();
                    X.alignItems(node, conf.prize, 'left', {
                        touch: true
                    });
                },
                btn_receive:function(node){
                    node.id=data;
                    node.prize=conf.prize;
                    if(me.kwctask[data]>=conf.pval && !X.inArray(me.rec,data)){
                        //可完成
                        node.setTouchEnabled(true);
                        node.setTitleText(L("LQ"));
                        ui.nodes.wz_ylq.hide();
                    }else if(X.inArray(me.rec,data)){
                        //已完成
                        node.setEnabled(false);
                        node.setTouchEnabled(false);
                        node.setTitleText(L("BTN_LQ"));
                        node.hide();
                        ui.nodes.wz_ylq.show();
                    }else{
                        node.setTouchEnabled(true);
                        ui.nodes.btn_dh.show();
                        ui.nodes.wz_ylq.hide();
                    }
                    node.click(function(sender){
                        G.ajax.send("qixi_receive", [sender.id], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize: sender.prize
                                }).show();
                                G.frame.qixi.DATA.myinfo=d.d.myinfo;
                                me.setContent();
                                G.frame.qixi.setContent();
                                G.frame.qixi.checkHongdian();
                            }
                        })
                    })
                },
                btn_dh:function(node){
                    node.id=conf.tiaozhuan;
                    node.click(function(sender){
                        X.tiaozhuan(node.id);
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