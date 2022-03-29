// 委托找人
(function(){
    G.class.mapGrid11  = G.class.mapGrid13 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function(){
                me.gotoEvent();
            }, true);
        },
        gotoEvent: function(){
            var me = this;
            var typename = me.data.conf.typename;
            if (typename.duihua){
                G.frame.shiyuanzhanchang_dh.data({
                    idx: me.data.idx,
                    canGoto: me.canGoto(),
                    map: me.map,
                    conf: G.gc.syzccom.eventinfo[me.data.custom.event],
                    open: function () {

                    },
                    duihuaback: function () {
                        //判断委托是否完成
                        var startid = G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx].startid;
                        var targeteventid = G.DATA.shiyuanzhanchang.eventgzid[startid];
                        var targetid = -1;
                        if (G.DATA.shiyuanzhanchang.eventdata[targeteventid] && G.DATA.shiyuanzhanchang.eventdata[targeteventid][startid]){
                            targetid = G.DATA.shiyuanzhanchang.eventdata[targeteventid][startid].targetid;
                        }
                        if (targetid == me.data.idx){
                            G.DAO.shiyuanzhanchang.event(me.data.idx, false, {}, function (data) {
                                G.frame.shiyuanzhanchang_floor.checkWeiTuo();
                                if (data.prize && data.prize.length>0){
                                    G.frame.jiangli.data({
                                        prize: data.prize
                                    }).show();
                                }
                                me.map.refreshGrids(me.data.idx);
                                me.map.refreshGrids(targetid);
                            }, null);
                        }else {
                            G.tip_NB.show(L('syzc_34'));
                        }
                    },
                }).show();
            }else {
                //判断委托是否完成
                var startid = G.DATA.shiyuanzhanchang.eventdata[me.data.custom.event][me.data.idx].startid;
                var targeteventid = G.DATA.shiyuanzhanchang.eventgzid[startid];
                var targetid = -1;
                if (G.DATA.shiyuanzhanchang.eventdata[targeteventid] && G.DATA.shiyuanzhanchang.eventdata[targeteventid][startid]){
                    targetid = G.DATA.shiyuanzhanchang.eventdata[targeteventid][startid].targetid;
                }
                if (targetid == me.data.idx){
                    G.DAO.shiyuanzhanchang.event(me.data.idx, false, {}, function (data) {
                        G.frame.shiyuanzhanchang_floor.checkWeiTuo();
                        if (data.prize && data.prize.length>0){
                            G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                        }
                        me.map.refreshGrids(me.data.idx);
                        me.map.refreshGrids(targetid);
                    }, null);
                }else {
                    G.tip_NB.show(L('syzc_34'));
                }
            }

        },
    });
})();


