// 小崽子小怪
(function(){
    G.class.mapGrid2 = G.class.controlGrid.extend({
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
            //两只小怪打架
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            if (G.DATA.shiyuanzhanchang.yunshu.jiequ){
                return  G.tip_NB.show(L('syzc_18'));;
            }
            if (X.cacheByUid("syzcJumpfight")){
                //开启提示
                G.frame.shiyuanzhanchang_zdtip.data({
                    cancelCall: null,
                    okCall: function () {
                        G.DATA.isFight = true;
                        me.map.myRole.role.showH5bar();
                        var team = G.frame.shiyuanzhanchang_floor.currerentT*1-1;
                        G.DAO.shiyuanzhanchang.event(me.data.idx, false,{"idx":team}, function(dd){
                            me.gotoFight(dd);
                        },function () {
                            G.DATA.isFight = false;
                        });
                    },
                }).show();
            }else {
                G.DATA.isFight = true;
                me.map.myRole.role.showH5bar();
                var team = G.frame.shiyuanzhanchang_floor.currerentT*1-1;
                G.DAO.shiyuanzhanchang.event(me.data.idx, false,{"idx":team}, function(dd){
                    me.gotoFight(dd);
                },function () {
                    G.DATA.isFight = false;
                });
            }
        },
        gotoFight:function (data) {
            var me = this;
            var zdcs = G.gc.syzccom.zdxueliangfs;
            //计算掉血。
            var myoldhp = me.map.myRole.role.nowhp;
            var mynowhp = G.frame.shiyuanzhanchang_floor.getTheteamState(G.frame.shiyuanzhanchang_floor.currerentT).nowhp;
            var enedps = (myoldhp - mynowhp)>0?(myoldhp - mynowhp):0;//对面的输出，就是当前血量-原来的血量
            cc.log('对面对我的输出'+enedps);
            var mydps = G.frame.shiyuanzhanchang_floor.getTheFightDps(data.fightres);
            // if (data.fightres.winside == 0){
            //     //我赢了对面掉的血就是最大血量
            //     var mydps = me.node.enemyRole.maxhp;
            // }else {
            //     if (G.DATA.shiyuanzhanchang.finishgzid[me.data.idx]){
            //         //我输了，但是对面死了
            //         var mydps = me.node.enemyRole.maxhp;
            //     }else {
            //         var mydps = data.fightres.dpsbyside[0];
            //     }
            // }
            if (mydps>=me.node.enemyRole.maxhp){
                mydps = me.node.enemyRole.maxhp;
            }
            var everymydps = mydps/5;
            var everyenedps = enedps/5;

            function check(idx,type) {
                __index ++;
                if (type=='me'){
                    me.map.myRole.role.f5Bar(everyenedps);
                    me.map.myRole.role.hmpChange(-everyenedps);
                    G.frame.shiyuanzhanchang_floor.refreshHpJdt(everyenedps);
                } else {
                    me.node.enemyRole.f5Bar(everymydps);
                    me.node.enemyRole.hmpChange(-everymydps);
                }
                if (__index == 2) {
                    f(idx+1);
                }
            }
            function f(idx) {
                if (idx>zdcs-1){
                    me.stop = true;
                    G.DATA.isFight = false;
                    if ( !me.map.myRole.role.dead ){
                        me.map.myRole.role.nowhp = G.frame.shiyuanzhanchang_floor.getTheteamState(G.frame.shiyuanzhanchang_floor.currerentT).nowhp;
                        me.map.myRole.role.f5Bar();
                    }
                    me.map.myRole.role.hideH5bar();

                    if (data.fightres.winside == 0){
                        //赢了
                        G.frame.shiyuanzhanchang_floor.createDz();
                        if (data.prize && data.prize.length>0){
                            G.frame.jiangli.once('willClose',function () {
                                G.frame.shiyuanzhanchang_slsb.data({
                                    data:data
                                }).show();
                            }).data({
                                prize: data.prize
                            }).show();
                        }
                    }else {
                        G.frame.shiyuanzhanchang_floor.createDz();
                        G.frame.shiyuanzhanchang_floor.cheackDz();
                        G.frame.shiyuanzhanchang_slsb.data({
                            data:data
                        }).show();
                    }
                    me.map.refreshGrids(me.data.idx);

                }
                cc.director.getRunningScene().setTimeout(function () {
                    if (me.stop) return;
                     __index = 0;
                    me.map.myRole.role.atk(everyenedps,idx,'me', check);
                    me.node.enemyRole.atk(everymydps,idx,'enemy', check);
                },idx*50);
            }
            f(0);
        }
    });
})();


