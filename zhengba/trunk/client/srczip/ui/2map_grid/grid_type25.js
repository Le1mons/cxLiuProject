// 解密事件说明点
(function(){
    G.class.mapGrid25  = G.class.controlGrid.extend({
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
            G.frame.shiyuanzhanchang_sjsm.data({
                idx: me.data.idx,
                canGoto: me.canGoto(),
                conf:G.gc.syzccom.eventinfo[me.data.custom.event],
                map:me.map,
                open: function(){
                },
            }).show();
        },
    });
})();


