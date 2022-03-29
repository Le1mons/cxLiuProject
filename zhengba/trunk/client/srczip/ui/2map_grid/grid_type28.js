// 解密事件运输船终点
(function(){
    G.class.mapGrid28  = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '1';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function(){
                G.DAO.shiyuanzhanchang.walk(me.data.idx,function(){
                    me.gotoEvent();
                });
            }, true);
        },
        gotoEvent: function(){
            var me = this;
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            //走到了终点，如果是同一个id运输船，直接掉接口
            var yunshu = G.DATA.shiyuanzhanchang.yunshu;
            var eventdata = me.data.conf.eventdata;
            if (!yunshu.jiequ){
                return;
            }
            if (eventdata.graph == G.DATA.shiyuanzhanchang.eventdata['27'][yunshu.jiequ].graph){
                var togrid = G.frame.shiyuanzhanchang_map.getYscGroudgz();
                G.DAO.shiyuanzhanchang.event(me.data.idx,false,{'xiache':togrid},function () {
                    G.tip_NB.show(L('syzc_37'));
                    G.frame.shiyuanzhanchang_map.myRole.role.setChangeBody();
                    var sjarr = [27,28];
                    var thesjarr = [];
                    var finish = X.keysOfObject(G.DATA.shiyuanzhanchang.eventdata['28']).length;
                    for (var i=0;i<sjarr.length;i++){
                        if (G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                            for (var k in G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                thesjarr.push(k);
                            }
                        }
                    }
                    if (G.DATA.shiyuanzhanchang.yunshu.finish == finish){
                        //说明已经完成了所有运输船事件。可以获得噬渊宝箱
                        //先走到附近一个空格子上，然后该格子变成宝箱事件，
                        var grid = G.frame.shiyuanzhanchang_map.indexToPosition(togrid);
                        G.frame.shiyuanzhanchang_map.myRole.flashTo(grid);
                        G.class.ani.show({
                            json: "ani_shiyuanzcbx4_dh",
                            addTo: cc.director.getRunningScene(),
                            x:320,
                            y:568,
                            repeat: false,
                            autoRemove: true,
                            onload: function (node,action) {
                                action.playWithCallback('chuxian',false,function () {
                                    node.removeFromParent();
                                    //传送到这个格子上
                                    me.map.refreshGrids(me.data.idx);
                                    G.frame.shiyuanzhanchang_map.refreshGrids(togrid);
                                });
                            }
                        })
                    }else {
                        me.map.refreshGrids(me.data.idx);
                        //传送到这个格子上
                        var grid = G.frame.shiyuanzhanchang_map.indexToPosition(togrid);
                        G.frame.shiyuanzhanchang_map.myRole.flashTo(grid);
                        G.frame.shiyuanzhanchang_map.refreshGrids(togrid);
                    }
                },null);
            }else {
                G.tip_NB.show(L('syzc_17'));
            }
        },
    });
})();


