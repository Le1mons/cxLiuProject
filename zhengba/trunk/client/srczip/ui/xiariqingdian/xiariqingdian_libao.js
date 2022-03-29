(function () {
    //夏日礼包

    var ID = 'xiarilibao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.img_title.removeBackGroundImage();
            me.nodes.img_title.setBackGroundImage("img/xiariqingdian/title_wz4.png",1);
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
        },

        onOpen: function () {
            var me = this;
            me.conf = G.gc.xiariqingdian.libao;
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

        setData: function(){
            var me = this;

            var keys = X.keysOfObject(me.conf);

            var arr = [],arr1 = [];

            for(var i = 0 ; i < keys.length; i++){

                if(me.sData.myinfo.libao[keys[i]] && me.conf[keys[i]].buynum - me.sData.myinfo.libao[keys[i]] <= 0){
                    arr.push(keys[i]);
                }else{
                    arr1.push(keys[i]);
                }
            }

            return arr1.concat(arr);
        },

        setContent: function(){
            var me = this;

            var arr = me.setData();

            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao2, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }
        },

        setItem: function(ui,_data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var data = me.conf[_data];

            X.render({
                libao_mz: data.name,
                wz_xg: function (node) {
                    node.setString(X.STR(L("XG"),data.buynum - (me.sData.myinfo.libao[data.proid] || 0)));
                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.prize, 'left', {
                        touch: true
                    });
                },
                btn_gm: function (node) {
                    node.pid = data.proid;
                    node.logicProid = data.proid;
                    node.money = data.money;
                    node._aname = data.name;
                    node.click(function (sender) {
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            G.frame.xiariqingdian.getData(function () {
                                me.sData = G.frame.xiariqingdian.DATA;
                                me.setContent();
                            });
                        });
                        G.event.emit('doSDKPay', {
                            pid:sender.pid,
                            logicProid: sender.logicProid,
                            money: sender.money,
                            pname: sender._aname
                        });
                    });
                },
                zs_wz: function (node) {
                    if(data.buynum - (me.sData.myinfo.libao[data.proid] || 0) <= 0){
                        node.setString(L("BTN_YSQ"));
                        ui.nodes.btn_gm.setTouchEnabled(false);
                        ui.nodes.btn_gm.setBright(false);
                    }else{
                        node.setString(X.STR(L("DOUBLE9"),data.money / 100));
                        ui.nodes.btn_gm.setTouchEnabled(true);
                        ui.nodes.btn_gm.setBright(true);
                    }

                }

            },ui.nodes);
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('xiariqingdian_tk2.json', ID);
})();