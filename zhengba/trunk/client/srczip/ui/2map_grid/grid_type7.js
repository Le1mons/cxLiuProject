// 委托事件
(function () {
    G.class.mapGrid7 = G.class.mapGrid8 = G.class.mapGrid9 = G.class.mapGrid10 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
            me._super.apply(this, arguments);
        },
        doEvent: function () {
            var me = this;
            me._super.apply(this, arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function () {
                me.gotoEvent();
            }, true);
        },
        gotoEvent: function () {
            var me = this;
            G.frame.shiyuanzhanchang_dh.data({
                idx: me.data.idx,
                canGoto: me.canGoto(),
                map: me.map,
                conf: G.gc.syzccom.eventinfo[me.data.custom.event],
                open: function () {

                },
                duihuaback: function () {
                    if (G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event] && G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx] && X.isHavItem(G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx])){
                        return G.tip_NB.show(L('syzc_35'));
                    }
                    G.DAO.shiyuanzhanchang.event(me.data.idx, false, 1, function (data) {
                        G.frame.shiyuanzhanchang_floor.checkWeiTuo();
                        //刷新需要的事件的格子id
                        if (G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event] && G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx]){
                            var gid = G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx].targetid;
                            if (gid) me.map.refreshGrids(gid);
                        }
                        me.map.refreshGrids(me.data.idx);
                    }, function () {
                        G.frame.syzc_baoxiang.remove();
                    });

                },
            }).show();
        },
    });
})();


