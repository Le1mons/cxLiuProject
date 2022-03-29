// 一笔画普通格子
(function(){
    G.class.mapGrid36 = G.class.controlGrid.extend({
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
            if (G.frame.shiyuanzhanchang_map.myRole.eventFootArr.length==0){
                G.tip_NB.show(L('syzc_20'));
            }
            G.frame.shiyuanzhanchang_map.myRole.eventFootArr.push(me.data.idx);
            G.class.ani.show({
                json: "ani_shiyuanzcdikuai_dh",
                addTo: me.node.gridContent,
                x:90,
                y:15,
                repeat: true,
                autoRemove: false,
                onload: function (node,action) {
                    action.playWithCallback('in',false,function () {
                        action.play('wait',true);
                    });
                    G.frame.shiyuanzhanchang_map.myRole.eventFootAni.push(node);
                }
            });
        }
    });
})();


