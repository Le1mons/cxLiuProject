// 解密事件运输船起点
(function(){
    G.class.mapGrid27  = G.class.controlGrid.extend({
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
                if (cc.isNode(me.node.aniNode))  me.node.aniNode.nodes.anniu_.hide();
                if (cc.isNode(G.frame.shiyuanzhanchang_map.myRole.role.yscNode)) G.frame.shiyuanzhanchang_map.myRole.role.yscNode.nodes.anniu_.show();
            },G.gc.syzccom.eventHideTime*1000);
        },
    });
})();


