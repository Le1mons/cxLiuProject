// boss,点击周围格子也需要触发事件
(function(){
    G.class.mapGrid3 = G.class.mapGrid60 = G.class.controlGrid.extend({
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
            me.BOSSGRIDARR  = G.frame.shiyuanzhanchang_map.getBossGrid();
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
            var enedps = (myoldhp - mynowhp)>0?(myoldhp - mynowhp):0;//对面的输出，原来的血量 - 就是当前血量
            var bossidx = X.keysOfObject(G.DATA.shiyuanzhanchang.eventdata['3'])[0];
            var gid = G.frame.shiyuanzhanchang_map.indexToPosition(bossidx);
            var concent = G.frame.shiyuanzhanchang_map.mapContent.getChildByName(gid.gy+'_'+gid.gx);
            var enemyRole = concent.getChildByName('gridContent').getChildren()[0];
            var mydps = G.frame.shiyuanzhanchang_floor.getTheFightDps(data.fightres);
            // if (data.fightres.winside == 0){
            //     //我赢了对面掉的血就是最大血量
            //     var mydps = enemyRole.maxhp;
            // }else {
            //     if (G.DATA.shiyuanzhanchang.finishgzid[me.data.idx]){
            //         //我输了，但是对面死了
            //         var mydps = enemyRole.maxhp;
            //     }else {
            //         var mydps = data.fightres.dpsbyside[0];
            //     }
            // }
            if (mydps>=enemyRole.maxhp){
                mydps = enemyRole.maxhp;
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
                    enemyRole.f5Bar(everymydps);
                    enemyRole.hmpChange(-everymydps);
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
                        //刷新boss的四个格子
                        G.frame.jiangli.once('willClose',function () {
                            G.frame.shiyuanzhanchang_slsb.data({
                                data:data
                            }).show();
                        }).data({
                            prize: data.prize
                        }).show();
                        G.frame.shiyuanzhanchang_floor.createDz();
                    }else {
                        G.frame.shiyuanzhanchang_floor.createDz();
                        cc.director.getRunningScene().setTimeout(function () {
                                G.frame.shiyuanzhanchang_floor.cheackDz();
                        },200);
                        G.frame.shiyuanzhanchang_slsb.data({
                            data:data
                        }).show();
                    }
                    for (var i=0;i< me.BOSSGRIDARR.length;i++){
                        me.map.refreshGrids( me.BOSSGRIDARR[i]);
                    }
                }
                cc.director.getRunningScene().setTimeout(function () {
                    if (me.stop) return;
                    __index = 0;
                    me.map.myRole.role.atk(everyenedps,idx,'me', check);
                    enemyRole.atk(everymydps,idx,'enemy', check);
                },idx*50);
            }
            f(0);
        }
    });
})();


