(function () {
    //切西瓜

    var ID = 'xiariqingliang_qiexigua';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });


        },

        onOpen: function () {
            var me = this;
            me.conf = G.gc.xiariqingdian;
            me.sData = G.frame.xiariqingdian.DATA;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },

        onShow: function () {
            var me = this;
            me.setContent();
        },

        setContent: function(){
            var me = this;

            X.render({
                panel_zs: function (node) {
                    var need = me.conf.youxiitemneed;
                    var num =  G.class.getOwnNum(need[0].t, need[0].a);
                    var type = 1;

                    if(num < need[0].n){
                        need = me.conf.youxizuanshineed;
                        num =  G.class.getOwnNum(need[0].t, need[0].a);
                        type = 2;
                    }
                    var ico = new ccui.ImageView(G.class.getItemIco(need[0].t),1);
                    ico.setScale(0.8);
                    var str = X.STR(L('JUEDOUSHENGDIAN34'),type == 1 ? num : need[0].n);
                    var rh = X.setRichText({
                        parent:node,
                        str:str,
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: node.width / 2, y: node.height / 2},
                        color:"#ffffff",
                        node:ico,
                        size:20,
                        outline:"#000000",
                    });

                    me.nodes.btn_1.click(function () {
                        if(me.sData.info.rtime - 2*60 < G.time) return G.tip_NB.show(L("HDYJS")); //活动结束前两分钟不让他进去
                        G.frame.xiariqingdian_tips.data({
                            need: need,
                            nums : num,
                            type: type,
                            cishu: me.conf.buynum - me.sData.myinfo.zuanshinum
                        }).show();
                    });

                },
                txt_wz: function (node) {
                    var str = X.STR(L("JUEDOUSHENGDIAN35"),me.conf.buynum - me.sData.myinfo.zuanshinum);
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:32,
                        color:G.gc.COLOR.n1,
                        family:G.defaultFNT
                    });
                    rh.text(str);
                    rh.setAnchorPoint(0.5,0.5);
                    rh.setPosition(cc.p(node.width/ 2,node.height/ 2));
                    node.removeAllChildren();
                    node.addChild(rh);
                }
            },me.nodes);

            var arr = me.conf.youxiprize;

            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }

        },

        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);

            X.render({
                item1: function (node) {
                    X.alignItems(node, data.prize, 'center', {
                        touch: true
                    });
                },
                txt_fs:data.val[0]
            },ui.nodes);
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('xiariqingdian_jsqg.json', ID);
})();