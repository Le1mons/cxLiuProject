//
(function () {
    G.class.mapGrid5 = G.class.controlGrid.extend({
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
            var wenti = G.DATA.shiyuanzhanchang.eventdata[5][me.data.idx];
            if (typename.duihua){
                G.frame.shiyuanzhanchang_dh.data({
                    idx: me.data.idx,
                    canGoto: me.canGoto(),
                    map:me.map,
                    conf:G.gc.syzccom.eventinfo[me.data.custom.event],
                    duihuaback: function(){
                        G.frame.syzc_wenti.data({
                            idx: wenti,
                            callback: function (bool) {
                                G.DAO.shiyuanzhanchang.event(me.data.idx, false, { "win": bool }, function (data, prize) {
                                    if (bool) {
                                        data.prize && G.frame.jiangli.data({
                                            prize: data.prize
                                        }).show()
                                    } else {
                                        G.tip_NB.show(L("syzc_106"))
                                    }
                                    me.map.refreshGrids(me.data.idx);
                                    G.frame.syzc_wenti.remove()
                                }, null);
                            },
                        }).show()
                    },
                }).show();
            }else {
                G.frame.syzc_wenti.data({
                    idx: wenti,
                    callback: function (bool) {
                        G.DAO.shiyuanzhanchang.event(me.data.idx, false, { "win": bool }, function (data, prize) {
                            if (bool) {
                                data.prize && G.frame.jiangli.data({
                                    prize: data.prize
                                }).show()
                            } else {
                                G.tip_NB.show(L("syzc_106"))
                            }
                            me.map.refreshGrids(me.data.idx);
                            G.frame.syzc_wenti.remove()
                        }, null);
                    },
                }).show()
            }
        },
    });
})();


