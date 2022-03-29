// 解密事件瞭望塔
(function(){
    G.class.mapGrid26  = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
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
        gotoEvent: function(){
            var me = this;
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            me.node.aniNode.nodes.anniu_.show();
            cc.director.getRunningScene().setTimeout(function () {
                me.node.aniNode.nodes.anniu_.hide();
            },G.gc.syzccom.eventHideTime*1000);
        },
    });
})();


