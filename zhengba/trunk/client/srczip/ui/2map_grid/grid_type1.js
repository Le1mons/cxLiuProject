// 可以正常行走的格子
(function(){
    G.class.mapGrid111 = G.class.mapGrid1 = G.class.mapGrid34 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '1';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, null, true);
            me.node.droopAni();
        },
    });
})();