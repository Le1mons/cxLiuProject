// 奖励事件，获得奖励
(function(){
    G.class.mapGrid19 = G.class.mapGrid20 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '1';//可以直接走到上边
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function(){
                G.DAO.shiyuanzhanchang.walk(me.data.idx,function(){
                    me.gotoEvent();
                });
            }, true);
        },
        gotoEvent:function () {
            var me = this;
            G.DAO.shiyuanzhanchang.event(me.data.idx, false,{}, function(dd){
                if (dd.prize && dd.prize.length>0){
                    G.frame.jiangli.data({
                        prize: dd.prize
                    }).show();
                }
                me.map.refreshGrids(me.data.idx);
            },null);
        }
    });
})();


