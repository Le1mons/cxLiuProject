// 情报交付
(function () {
    G.class.mapGrid6 = G.class.controlGrid.extend({
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
            var typename = me.data.conf.typename;
            if (typename.duihua){
                G.frame.shiyuanzhanchang_dh.data({
                    idx: me.data.idx,
                    canGoto: me.canGoto(),
                    map:me.map,
                    conf:G.gc.syzccom.eventinfo[me.data.custom.event],
                    duihuaback: function(){
                        G.frame.syzc_qbjf.data({
                            data: me.data.conf,
                            callback: function (data, callabck) {
                                G.DAO.shiyuanzhanchang.event(me.data.idx, false, 1, function (data, prize) {
                                    G.class.ani.show({
                                        json: "ani_shiyuanzcbx5_dh",
                                        addTo:cc.director.getRunningScene(),
                                        x: 320,
                                        y: 568,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function (node, action) {
                                            action.playWithCallback('chuxian',false,function () {
                                                action.playWithCallback('kaixiang',false,function () {
                                                    node.removeFromParent();
                                                    data.prize.length && G.frame.jiangli.data({
                                                        prize: data.prize
                                                    }).show();
                                                })
                                            })
                                        },
                                    });
                                    callabck && callabck();
                                    me.map.refreshGrids(me.data.idx);
                                }, null);
                            },
                        }).show()
                    },
                }).show();
            }else {
                G.frame.syzc_qbjf.data({
                    data: me.data.conf,
                    callback: function (data, callabck) {
                        G.DAO.shiyuanzhanchang.event(me.data.idx, false, 1, function (data, prize) {
                            G.class.ani.show({
                                json: "ani_shiyuanzcbx5_dh",
                                addTo:cc.director.getRunningScene(),
                                repeat: false,
                                autoRemove: true,
                                onload: function (node, action) {
                                    action.playWithCallback('chuxian',false,function () {
                                        action.playWithCallback('kaixiang',false,function () {
                                            node.removeFromParent();
                                            data.prize.length && G.frame.jiangli.data({
                                                prize: data.prize
                                            }).show();
                                        })
                                    })
                                },
                            });
                            callabck && callabck();
                            me.map.refreshGrids(me.data.idx);
                        }, null);
                    },
                }).show()
            }
        },
    });
})();


