// 路障
(function(){
    G.class.mapGrid21 = G.class.mapGrid22 = G.class.mapGrid23 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';//可以直接走到上边
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function(){
                // G.DAO.shiyuanzhanchang.walk(me.data.idx,function(){
                    me.gotoEvent();
                // });
            }, true);
        },
        gotoEvent:function () {
            var me = this;
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            me.node.aniNode.nodes.anniu1_.show();
            me.node.aniNode.nodes.anniu_.show();
            cc.director.getRunningScene().setTimeout(function () {
                me.node.aniNode.nodes.anniu1_.hide();
                me.node.aniNode.nodes.anniu_.hide();
            },G.gc.syzccom.eventHideTime*1000);
        }
    });
})();


