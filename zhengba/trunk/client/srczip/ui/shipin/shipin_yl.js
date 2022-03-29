(function () {
    var ID = 'shipin_yl';

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

        
        onShow:function(){
            var me=this;
            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
            me.setContent();
        },
        setContent: function(){
            var me = this;
            var data =X.keysOfObject(G.gc.shipincom.awake.skillList);
            if(!me.table){
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
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
            X.autoInitUI(ui);
            var conf=G.gc.shipincom.awake.skillList[data].intr;
            ui.nodes.txt_jnms.setString(conf);
            ui.nodes.txt_jnms.show();
        },
        getData: function(callback){
            var me = this;
        },
        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shipin_top_jnyl.json', ID);
})();