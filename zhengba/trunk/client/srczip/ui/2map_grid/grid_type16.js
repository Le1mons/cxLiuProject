// 宝箱
(function () {
    G.class.mapGrid17 = G.class.mapGrid18 = G.class.mapGrid16 = G.class.controlGrid.extend({
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
            var conf = me.data.conf.typename;
            G.frame.syzc_baoxiang.data({
                data: me.data.conf,
                callback: function (data, callabck) {
                    G.DAO.shiyuanzhanchang.event(me.data.idx, false, 1, function (data, prize) {
                        me.node.aniNode.action.play('kaixiang',false);
                        cc.isNode(G.frame.syzc_baoxiang.aniNode)&&G.frame.syzc_baoxiang.aniNode.action.playWithCallback('kaixiang',false,function () {
                            G.frame.syzc_baoxiang.remove();
                            data.prize.length && G.frame.jiangli.once('willClose',function () {
                                me.map.refreshGrids(me.data.idx);
                            }).data({
                                prize: data.prize
                            }).show();
                        });
                        callabck && callabck();
                    }, function () {
                        G.frame.syzc_baoxiang.remove();
                    });
                },
            }).show()

        },
    });
})();