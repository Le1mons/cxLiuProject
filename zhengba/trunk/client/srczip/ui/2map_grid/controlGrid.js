(function(){
    // 操作 & 解析数据, (非数据源)
    // 0-0,  1-1,  2-2  3-3,   5-5,   6-6,   7-7,  8-8
    // 9-9,  10-10,  11-11,  12-11,  13-11
    // 16-2,   17-1,   19-19

    G.class.controlGrid = cc.Class.extend({
        ctor : function(data, node){
            this.data = data;
            this.map = data.map;
            this.node = node;
            this.grid = {gx: data.gx, gy: data.gy};
        },
        canGoto: function(){
            var me = this;

            if(me.map.canEvent(me.grid)){
                return true;
            }else{
                var grids = me.map.findWay(me.map.myRole.grid, me.grid);
                if(me.map.canGoto(grids, me.grid)){
                    return true;
                }else{
                    return false;
                }
            }
        },
        setBarrier : function(){
            var me = this;
            me.map.setBarrier(me.grid, me.data.barrier);
        },
        getConf: function(){
            var me = this;
            // jqmap[n].json

            // return me.map.data.mapconf[me.data.idx];
            return me.data.conf;
        },
        checkPlot: function(type){
            var me = this;
            var key = {
                'before': 'cfqyd',    // 触发事件前引导
                'after': 'cfhyd',       // 触发事件后引导
                'none': 'wdcyd',     // 条件未达成引导
            }[type];
            var v = me.getConf()[key];

            return me.map.checkPlot(v);
        },
        doEvent: function(){
            var me = this;

        },
    });

})();