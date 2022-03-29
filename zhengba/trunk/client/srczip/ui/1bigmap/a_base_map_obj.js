(function(){

    var _fun = {
        action_addobj : function(data,isani){
            return null;
        },
        action_delobj : function(_id){
            //删除一个对象
            var me = this;
            var target = this.get(_id);
            if(target){
                //if(_id.indexOf('db')!=-1)console.error('delobj',_id)
                if(this.myRole == target) delete this.myRole;
                target.removeFromParent();
            }
        },
        get : function(_id){
            var obj = this.obj[_id];
            if(cc.isNode(obj)){
                return obj;
            }else{
                return null;
            }
        },
        getObjByGrid:function (grid) {
            var me = this;
            // var index = me.gridToIndex(grid);
            // for(var k in me.obj){
            //     var arr = k.split("_");
            //     if(arr[arr.length - 1] == index){
            //         return me.obj[k];
            //     }
            // }
        },
        forEachChild: function (callback) {
            var me = this;

            for (var _id in this.obj) {
                var target = this.get(_id);
                if(!cc.isNode(target)) continue;
                if(callback(target) == false) break;
            }
        },
        /**
         * 获取指定group的对象
         */
        // getObjsByConf: function(data, uid) {
        //     var me = this;
        //     var roles = [];

        //     var filterFunc = null;

        //     if(X.instanceOfReal(data, 'Object')){
        //         if(data.mapres){
        //             // 所有res_资源
        //             filterFunc = function(target){
        //                 if(target.data.type && target.data.type.startsWith('res_')){
        //                     return true;
        //                 }
        //                 return false;
        //             };
        //         }
        //     }else{
        //         var groups = [].concat(data);
        //         filterFunc = function(target){
        //             if(target.data.group && X.inArray(groups, target.data.group)){
        //                 if(!uid || target.data.uid == uid){
        //                     return true;
        //                 }
        //             }
        //             return false;
        //         };
        //     }

        //     if(!filterFunc) return roles;

        //     me.forEachChild(function(target){
        //         if (filterFunc(target)){
        //             roles.push(target);
        //         }
        //     });

        //     return roles;
        // },
    };

    cc.each(_fun,function(v,k){
        G.class.baseMap.prototype[ k ] = v;
    });
})();