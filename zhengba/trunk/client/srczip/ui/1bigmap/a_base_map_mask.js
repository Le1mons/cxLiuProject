(function(){

    var _fun = {
        initFog: function(fog){
            var me = this;
            me.fogData = fog;
            me.needSyncFog = [];
        },
        getFogStatus: function(gid){
            var me = this;
            if(!me.fogData) return false;
            return ( X.inArray(me.fogData, gid) || X.inArray(me.needSyncFog, gid) ) == false;
        },
        willClearFog: function(gid){
            var me = this;
            if(!me.getFogStatus(gid)) return false;
            if(!me.get(gid)) return false;

            me.needSyncFog.push(gid);
            return true;
        },
        // 同步迷雾数据
        syncFog: function(){
            var me = this;
        },
        // addOpenMaskCCP : function(ccp){
        //     var me = this;
        //     this._super.apply(this,arguments);

        //     if(!cc.isNode(me.warMask))return;
        //     this.minimap && this.minimap.addOpenMaskCCP( ccp );
        // },
    };

    cc.each(_fun,function(v,k){
        G.class.baseMap.prototype[ k ] = v;
    });
})();