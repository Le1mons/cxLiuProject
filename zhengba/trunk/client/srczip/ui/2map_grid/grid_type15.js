// 商人
(function () {
    G.class.mapGrid15 = G.class.controlGrid.extend({
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
            G.frame.syzc_shop.data({
                data: me.data.conf,
                callback: function (data,callabck) {
                    G.DAO.shiyuanzhanchang.event(me.data.idx, false, data, function (data, prize) {
                        data.prize.length  && G.frame.jiangli.data({
                            prize: data.prize
                        }).show();
                        callabck && callabck();
                        me.map.refreshGrids(me.data.idx);
                    }, null);
                },
            }).show()

        },
    });
})();