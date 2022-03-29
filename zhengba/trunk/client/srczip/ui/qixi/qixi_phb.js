(function () {
    //七夕排行榜

    var ID = 'qixi_phb';

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

        show: function () {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow:function(){
            var me=this;
            var rank=me.DATA.myrank<0?L("qixi_zwsb"):X.STR(L("WJTF_TIP18"),me.DATA.myrank)
            me.nodes.txt_wdpm.setString(rank);
            me.nodes.txt_tgcs.setString(X.STR(L("qixi_qg"),me.DATA.myval));
            me.nodes.mask.click(function(){
                me.remove();
            })
            me.setContent();

        },
        setContent: function(){
            var me = this;
            var data = me.DATA.ranklist;
            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            // G.frame.qixi_phb.setItem =
        },

        setItem: function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.setTouchEnabled(false);
            var prize1=G.gc.qixi.rankprize[0][1][0];
            var prize2=G.gc.qixi.rankprize[1][1][0];
            var rank1=G.gc.qixi.rankprize[0][0][1];
            var rank2=G.gc.qixi.rankprize[1][0][1];
            X.render({
                text_fwq:function(node){
                    node.setString(data.name);
                    node.setColor(cc.color("#000000"))
                },
                text_mz:function(node){
                    node.setString(data.headdata.name)
                    node.setColor(cc.color("#000000"))
                },
                text_zdl:function(node){
                    node.setString(L("slzt_tip26") + ":" + data.val);
                    node.setColor(cc.color("#000000"))
                },
                panel_pm:function(node){
                    if(data.rank<=3){
                        node.show();
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                        ui.nodes.sz_phb.hide();
                    
                    }else{
                        node.hide();
                        ui.nodes.sz_phb.setString(data.rank);
                        ui.nodes.sz_phb.show();
                    }
                },
                panel_tx:function(node){
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(head);
                    node.show();
                },
                panel_wp:function(node){
                    if(data.rank<=rank1){
                        var item = G.class.sitem(prize1);
                        
                    }else if(data.rank<=rank2){
                        var item=G.class.sitem(prize2);
                    }
                    if(!item) debugger;
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                }
            },ui.nodes);

            ui.finds('text_jf').hide();
        },
        getData: function(callback){
            var me = this;
            G.ajax.send("qixi_ranklist", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
    
        },
        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('qixi_tk2.json', ID);
})();