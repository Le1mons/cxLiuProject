(function () {
    var ID = 'setting_zhuxiao';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },

        initUi: function () {
            var me = this;
        },
        initBtn:function(){
            var me =this;
            me.nodes.mask.click(function(sender,type){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.initBtn();
            me.setContents();
        },
        setContents:function () {
            var me = this;
            X.setRichText({
                str: L("zhuxiaozhanghao"),
                parent: me.nodes.panel_ms,
                size:20,
                anchor:{x: 0.5, y: 1},
                pos: cc.p(me.nodes.panel_ms.width/2,me.nodes.panel_ms.height),
                color: "#dbd0b5",
            });
        }
    });
    G.frame[ID] = new fun('ui_top_zx.json', ID);
})();