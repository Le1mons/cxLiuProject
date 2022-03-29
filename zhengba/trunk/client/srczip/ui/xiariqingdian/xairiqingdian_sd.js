(function () {
    //夏日商店

    var ID = 'xiarisd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.img_title.removeBackGroundImage();
            me.nodes.img_title.setBackGroundImage("img/xiariqingdian/title_wz3.png",1);
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
            me.conf = G.gc.xiariqingdian.duihuan;
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
            me._conf = JSON.parse(JSON.stringify(me.conf));

            var keys = X.keysOfObject(me._conf);

            var arr = [],arr1 = [];

            for(var i = 0 ; i < keys.length; i++){
                me._conf[keys[i]].idx = keys[i];
                if(me.sData.myinfo.duihuan[keys[i]] && me._conf[keys[i]].maxnum - me.sData.myinfo.duihuan[keys[i]] <= 0){
                    arr.push(keys[i]);
                }else{
                    arr1.push(keys[i]);
                }
            }

            return arr1.concat(arr);
        },

        setContent: function(){
            var me = this;

            X.render({
                panel_xh1: function (node) {
                    var need = G.gc.xiariqingdian.duihuanNeed;
                    var num =  G.class.getOwnNum(need[0].t, need[0].a)
                    var ico = new ccui.ImageView(G.class.getItemIco(need[0].t),1);
                    ico.setScale(0.8);
                    var str = X.STR(L('JUEDOUSHENGDIAN34'),num);
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
                panel_xh2: function (node) {
                    var need = G.gc.xiariqingdian.duihuanNeed;
                    var num =  G.class.getOwnNum(need[1].t, need[1].a)
                    var ico = new ccui.ImageView(G.class.getItemIco(need[1].t),1);
                    ico.setScale(0.8);
                    var str = X.STR(L('JUEDOUSHENGDIAN34'),num);
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
                }
            },me.nodes);


            var arr = me.setData();

            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao1, 1, function (ui, data) {
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
            var data = me._conf[_data];

            X.render({
                txt: function (node) {
                    node.setString(X.STR(L("HSXC"),data.maxnum - (me.sData.myinfo.duihuan[data.idx] || 0)))
                },

                item1: function (node) {
                    X.alignItems(node, data.need, 'center', {
                        touch: true
                    });
                },
                item2: function (node) {

                    X.alignItems(node, data.prize, 'center', {
                        touch: true
                    });
                },
                btn: function (node) {
                    node.idx = data.idx;
                    node.need = data.need;
                    node.prize = data.prize;
                    node.hasnums = data.maxnum - (me.sData.myinfo.duihuan[data.idx] || 0);

                    node.click(function (sender) {
                        G.frame.xiariqingdian_huihuantips.data({
                            need: sender.need,
                            prize:sender.prize,
                            hasnums:sender.hasnums,
                            callback: function (nums) {
                                if(nums == 0) return;
                                me.getPrize(sender.idx,nums, function () {
                                    me.setContent();
                                });
                            }
                        }).show();
                    });
                },
                btn_txt: function (node) {
                    if(data.maxnum - (me.sData.myinfo.duihuan[data.idx] || 0) <= 0){
                        node.setString(L("BTN_YSQ"));
                        ui.nodes.btn.setTouchEnabled(false);
                        ui.nodes.btn.setBright(false);
                    }else{
                        node.setString(X.STR(L("DUIHUAN"),data.buynum));
                        ui.nodes.btn.setTouchEnabled(true);
                        ui.nodes.btn.setBright(true);
                    }
                }

            },ui.nodes);
        },

        getPrize: function(idx,nums,callback){
            var me = this;

            G.ajax.send("xiariqingdian_duihuan", [idx,nums], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    G.frame.jiangli.data({
                        prize: d.d.prize
                    }).show();
                    G.frame.xiariqingdian.DATA.myinfo = d.d.myinfo;
                    me.sData = G.frame.xiariqingdian.DATA;
                    callback && callback();
                }
            })
        },

        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('xiariqingdian_tk2.json', ID);
})();