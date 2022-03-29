//
(function () {
    G.class.mapGrid50 = G.class.mapGrid51 = G.class.mapGrid52 = G.class.mapGrid53 = G.class.mapGrid54 = G.class.controlGrid.extend({
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
            G.frame.syzc_qb.data({
                data: me.data.conf,
                callback: function () {
                    G.DAO.shiyuanzhanchang.event(me.data.idx, false, [], function (data) {
                        data.prize && G.frame.jiangli.data({
                            prize: data.prize
                        }).show();
                        me.map.refreshGrids(me.data.idx);
                        G.frame.syzc_qb.remove()
                    }, null);
                },
            }).show()
        },
    });
})();
//传送门
(function () {
    G.class.mapGrid55 = G.class.controlGrid.extend({
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
            if (me.isclick) return ;
            //层数判断
            // var shiyuanshi = G.DATA.shiyuanzhanchang.shiyuanshi.jiequ;
            // if (X.isHavItem(shiyuanshi)){
            //    return  G.tip_NB.show(L('syzc_36'));
            // }
            // var yunshu = G.DATA.shiyuanzhanchang.yunshu;
            // if (yunshu.jiequ && yunshu.finish==0){
            //     //如果有其他的运输船，就不上车
            //     return G.tip_NB.show(L('syzc_16'));
            // }
            //判断当前层是否还有事件
            var eventArr = [];
            var arr = ['1','24','25','34','40','41','42','55','60'];
            for (var i in G.DATA.shiyuanzhanchang.eventgzid){
                if (!X.inArray(arr,G.DATA.shiyuanzhanchang.eventgzid[i])){
                    eventArr.push(i);
                }
            }
            function xyc(code) {
                X.setLockLayer(G.frame.shiyuanzhanchang_floor.nodes.ui,true);
                G.DAO.shiyuanzhanchang.pass(code,function (dd) {
                    if (dd.prize && dd.prize.length>0){
                        G.frame.jiangli.data({
                            prize: dd.prize
                        }).show();
                    }
                    me.isclick = true;
                    G.frame.shiyuanzhanchang_floor.bgAninode.action.playWithCallback('in',false,function () {
                        G.frame.shiyuanzhanchang_floor.bgAninode.action.play('wait',true);
                        G.frame.shiyuanzhanchang_floor.floorInfo(G.DATA.shiyuanzhanchang.layer);
                        G.frame.shiyuanzhanchang_floor.createDz();
                    })
                },function () {
                    X.setLockLayer(G.frame.shiyuanzhanchang_floor.nodes.ui,false);
                })
            }
            if (G.DATA.shiyuanzhanchang.finishgzid.length < eventArr.length){
                //有事件没完成
                G.frame.alert.data({
                    cancelCall:null,
                    okCall: function () {
                        if (G.DATA.shiyuanzhanchang.layernum >= G.DATA.shiyuanzhanchang.maxlayernum && G.DATA.shiyuanzhanchang.maxlayernum >= G.gc.syzccom.meiluncengshu){
                            G.frame.shiyuanzhanchang_tip.data({
                                title: '提示',
                                intr: '本轮挑战次数已达上限'
                            }).show();
                            return;
                        }
                        if (G.DATA.shiyuanzhanchang.layernum >= G.DATA.shiyuanzhanchang.maxlayernum){
                            G.frame.shiyuanzhanchang_tip.data({
                                title: '提示',
                                intr: '每日挑战次数已达上限'
                            }).show();
                            return;
                        }
                        var nextlayer = G.DATA.shiyuanzhanchang.layer+1;
                        var nextconf = G.gc.syzcmapinfo[nextlayer];
                        if (G.DATA.shiyuanzhanchang.toplayer>10 && nextconf && nextconf.type == 0){
                            //显示扫荡
                            G.frame.shiyuanzhanchang_sd.data({
                                conf:nextconf,
                                callback:function (code) {
                                    xyc(code);
                                }
                            }).show();
                            return;
                        }
                        xyc();
                    },
                    richText:L("syzc_40"),
                }).show();
            }else {
                if (G.DATA.shiyuanzhanchang.layernum >= G.DATA.shiyuanzhanchang.maxlayernum && G.DATA.shiyuanzhanchang.maxlayernum >= G.gc.syzccom.meiluncengshu){
                    G.frame.shiyuanzhanchang_tip.data({
                        title: '提示',
                        intr: '本轮挑战次数已达上限'
                    }).show();
                    return;
                }
                if (G.DATA.shiyuanzhanchang.layernum >= G.DATA.shiyuanzhanchang.maxlayernum){
                    G.frame.shiyuanzhanchang_tip.data({
                        title: '提示',
                        intr: '每日挑战次数已达上限'
                    }).show();
                    return;
                }
                var nextlayer = G.DATA.shiyuanzhanchang.layer+1;
                var nextconf = G.gc.syzcmapinfo[nextlayer];
                if (G.DATA.shiyuanzhanchang.toplayer>10 && nextconf && nextconf.type == 0){
                    //显示扫荡
                    G.frame.shiyuanzhanchang_sd.data({
                        conf:nextconf,
                        callback:function (code) {
                            xyc(code);
                        }
                    }).show();
                    return;
                }
                xyc();
            }
        },
    });
})();