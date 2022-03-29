// 格子终点
(function(){
    G.class.mapGrid35  = G.class.controlGrid.extend({
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
            if (G.frame.shiyuanzhanchang_map.myRole.eventFootArr.length > 0){
                if (G.frame.shiyuanzhanchang_map.myRole.eventFootArr.length != G.frame.shiyuanzhanchang_map.getYbhGzid().length){
                    //说明没完成事件；
                    G.frame.shiyuanzhanchang_map.clearAllYbhInfo();
                    G.frame.shiyuanzhanchang_map.myRole.moveTofuhuodian();
                    return G.tip_NB.show(L('syzc_19'));
                }
            } else {
                return ;
            }
            G.DAO.shiyuanzhanchang.event(me.data.idx, false,{}, function(dd){
                G.tip_NB.show(L('syzc_23'));
                G.frame.shiyuanzhanchang_map.clearAllYbhInfo();
                G.class.ani.show({
                    json: "ani_shiyuanzcbx4_dh",
                    addTo: cc.director.getRunningScene(),
                    x:320,
                    y:568,
                    repeat: false,
                    autoRemove: true,
                    onload: function (node,action) {
                        action.playWithCallback('chuxian',false,function () {
                            node.removeFromParent();
                            //传送到这个格子上
                            me.map.refreshGrids(me.data.idx);
                            var allptgz = G.frame.shiyuanzhanchang_map.getYbhGzid();
                            for (var i=0;i<allptgz.length;i++){
                                me.map.refreshGrids(allptgz[i]);
                            }
                        });
                    }
                })
            },null);
        }
    });
})();


