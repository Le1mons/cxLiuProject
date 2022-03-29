// 解密事件噬魂石共振
(function(){
    G.class.mapGrid29 = G.class.mapGrid30 = G.class.mapGrid31 = G.class.mapGrid32  = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
            var me = this;
            me._super.apply(this,arguments);

            me.map.myRole.findWayAndMoveTo(me.grid, function(){
                // G.DAO.shiyuanzhanchang.walk(me.data.idx,function(){
                    me.gotoEvent();
                // });
            }, true);
        },
        gotoEvent: function(){
            var me = this;
            if (!me.canGoto()){
                G.tip_NB.show(L('syzc_wfqw'));
                return;
            }
            me.node.aniNode.nodes.anniu_.hide();
            if (!G.DATA.shiyuanzhanchang.shiyuanshi.jiequ || !X.isHavItem(G.DATA.shiyuanzhanchang.shiyuanshi.jiequ)){
                //一定是激活
                me.node.aniNode.nodes.anniu_.show();
                me.node.aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_jh.png',1);
            }else{
                if (me.data.idx != G.DATA.shiyuanzhanchang.shiyuanshi.jiequ[me.data.conf.typeid]){
                    //不是同一个，这时候可以共振
                    me.node.aniNode.nodes.anniu_.show();
                    me.node.aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_gz.png',1);
                }else {
                    me.node.aniNode.nodes.anniu_.hide();
                }
            }
            cc.director.getRunningScene().setTimeout(function () {
                me.node.aniNode.nodes.anniu_.hide();
            },G.gc.syzccom.eventHideTime*1000);
        },
    });
})();


