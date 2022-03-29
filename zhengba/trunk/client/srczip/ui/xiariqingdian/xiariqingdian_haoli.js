(function () {
    //夏日豪礼

    var ID = 'xiarihaoli';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            G.class.ani.show({
                json: "hd_xrhl_bgtx",
                addTo: me.ui,
                repeat: true,
                autoRemove: false
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
        },

        onOpen: function () {
            var me = this;
            me.conf = G.gc.xiariqingdian.qiandao;
            me.sData = G.frame.xiariqingdian.DATA;

            me.hdDay();
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

            for(var i = 1; i <= 7; i++){
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                list.show();
                var parNode = me.nodes["panel_" + i];
                list.setPosition(parNode.width / 2, parNode.height / 2);
                parNode.removeAllChildren();
                parNode.addChild(list);
                me.setItem(list,me.conf[i- 1],i);
            }
        },

        setItem: function(ui,data,idx){
            var me = this;

            X.render({
                txt_ts:function (node) {
                    if(!X.inArray(me.sData.myinfo.qiandao,idx - 1) && me.today >= idx){ // && me.today != 8
                        node.setString(L("BTN_KLQ"));
                        node.setTextColor(cc.color("#ffe8a5"));
                        node.enableShadow(cc.color("#a01e00"), cc.size(2, -2));
                    }else{
                        node.setString(X.STR(L("DXT1"),L(idx + "")));
                        node.setTextColor(cc.color("#d8fbfa"));
                        node.enableShadow(cc.color("#0c92db"), cc.size(2, -2));
                    }

                },
                panel_wp1: function (node) {
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width/ 2, node.height/ 2);
                    G.frame.iteminfo.showItemInfo(item);
                    node.addChild(item);
                },
                panel_wp2: function (node) {
                    if(data.prize[1]){
                        var item = G.class.sitem(data.prize[1]);
                        item.setPosition(node.width/ 2, node.height/ 2);
                        G.frame.iteminfo.showItemInfo(item);
                        node.addChild(item);
                    }
                },
                img_ylq: function (node) {
                    node.setVisible(X.inArray(me.sData.myinfo.qiandao,idx - 1));
                },
                img_xz: function (node) {
                    // node.setVisible(!X.inArray(me.sData.myinfo.qiandao,idx - 1) && me.today <= idx);
                    node.idx = idx - 1;
                    if(!X.inArray(me.sData.myinfo.qiandao,idx - 1) && me.today >= idx){ // && me.today != 8
                        node.show();
                        node.setTouchEnabled(true);
                        node.click(function (sender) {
                            me.getPrize(sender.idx,function () {
                                me.setContent();
                            })
                        });
                    }else{
                        node.hide();
                    }
                }
            },ui.nodes);
        },

        hdDay:function(){
            var me = this;
            var timestamp = G.time -  me.sData.info.stime;
            me.today = Math.ceil(timestamp / 60 / 60 /24);
        },

        getPrize: function(idx,callback){
            var me = this;

            G.ajax.send("xiariqingdian_qiandao", [idx], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    G.frame.xiariqingdian.DATA.myinfo  = d.d.myinfo;
                    me.sData = G.frame.xiariqingdian.DATA;
                    G.frame.jiangli.data({
                        prize: d.d.prize
                    }).show();

                    callback && callback();
                }
            })
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('xiariqingdian_xrhl.json', ID);
})();