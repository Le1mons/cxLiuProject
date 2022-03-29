// 解密事件完成出现的宝箱
(function(){
    G.class.mapGrid33  = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '1';
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
        gotoEvent: function(){
            var me = this;
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            G.DAO.shiyuanzhanchang.event(me.data.idx, false, [], function (data) {
                G.class.ani.show({
                    json: "ani_shiyuanzcbx4_dh",
                    addTo: cc.director.getRunningScene(),
                    x:320,
                    y:568,
                    repeat: false,
                    autoRemove: true,
                    onload: function (node,action) {
                        action.playWithCallback('kaixiang',false,function () {
                            node.removeFromParent();
                            data.prize && G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                        });
                    }
                })

                me.map.refreshGrids(me.data.idx);
            }, null);
        },
    });
})();


