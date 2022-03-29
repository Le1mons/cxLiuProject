(function () {

    var ID = 'xiariqingdian_tips';

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

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_zs.click(function (sender, type) {
                if(me.sData.info.rtime - 2*60 < G.time) return G.tip_NB.show(L("HDYJS")); //活动结束前两分钟不让他进去
                if( me.multiple == 0) return G.tip_NB.show(L("TZCSBZ"));
                G.frame.qiexigua.data({
                    multiple:  me.multiple,
                    callback: function () {

                    }
                }).show();
                me.remove();
            });
        },

        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.xiariqingdian;
            me.sData = G.frame.xiariqingdian.DATA;
            me.needConf = G.class.getItem(me.DATA.need[0].t,me.DATA.need[0].a);

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },

        onShow: function () {
            var me = this;
            me.multiple = 1;
            me.setContent();
            me.refresh(0);
        },


        setContent: function(){
            var me = this;

            X.render({
                btn_1: function (node) {
                    node.click(function () {
                        me.refresh(-1);
                    })
                },
                btn_2: function (node) {
                    node.click(function () {
                        me.refresh(1);
                    })
                },
                btn_jian10: function (node) {
                    node.click(function () {
                        me.refresh(-10);
                    })
                },
                btn_jia10: function (node) {
                    node.click(function () {
                        me.refresh(10);
                    })
                }
            },me.nodes);
        },

        refresh: function (v) {
            var me = this;
            var need = me.DATA.need;
            if(me.DATA.type == 2 && (me.multiple + v) > me.DATA.cishu){
                me.multiple =  me.DATA.cishu;
            }else if(me.DATA.type == 2 && (me.multiple + v) * need[0].n > me.DATA.nums ){
                me.multiple =  parseInt(me.DATA.nums / need[0].n);
            }else if(me.DATA.type == 1 && (me.multiple + v) * need[0].n > me.DATA.nums){
                me.multiple =  me.DATA.nums;
            } else if(me.multiple + v < 1){
                if(me.multiple == 0) return;
                me.multiple = 1;
            }else{
                me.multiple += v;
            }


            X.render({
                text_2: function (node) {
                    node.setString(X.STR(L("JUEDOUSHENGDIAN36"),me.multiple,me.needConf.name,me.multiple))
                },
                panel_xh: function (node) {
                    var ico = new ccui.ImageView(G.class.getItemIco(need[0].t),1);
                    ico.setScale(0.8);
                    var str = X.STR(L('JUEDOUSHENGDIAN37'),me.multiple * need[0].n,me.DATA.nums);
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
                },
                textfield_5: function (node) {
                    node.setString(me.multiple);
                }
            },me.nodes);
        },
    });
    G.frame[ID] = new fun('xiariqingdian_tk1.json', ID);
})();