// 空格子
(function(){
    G.class.mapGrid0 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
        },
    });
})();

//装饰地块无法正常行走
(function(){
    G.class.mapGrid40 = G.class.mapGrid41 = G.class.mapGrid42 = G.class.mapGrid21 = G.class.mapGrid22 = G.class.mapGrid23  = G.class.mapGrid61 = G.class.controlGrid.extend({
        ctor: function (data, node) {
            var me = this;
            data.barrier = '0';
            me._super.apply(this,arguments);
        },
        doEvent: function(){
        },
    });
})();