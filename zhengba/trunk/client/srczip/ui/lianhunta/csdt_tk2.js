/**
 * Created by
 */
 (function () {
    //传说大厅
    var ID = 'csdt_tk2';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.pid = X.keysOfObject(G.gc.csdt.itemdz)[0];
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.nodes.panel_bg.setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                G.frame.csdt_csdh.prizeid = me.prizeid;
                me.remove();
            });
        },
        setContents: function () {
            var me = this;
            var prize = G.gc.csdt.itemdz[me.pid].getitem;
            X.alignItems(me.nodes.panel_3, prize, 'center', {
                touch: true,
                mapItem:function(item){
                    item.touch(function(item){
                        if(me.prizeid != item.data.t){
                            item.setGou(true);
                            me.prizeid = item.data.t;
                        }
                    });
                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('csdt_tk2.json', ID);
})();