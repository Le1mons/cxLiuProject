(function(){

    var _fun = {
        // barrier 0阻拦 1通行
        setBarrier : function(grid, barrier, init){
            var me = this;

            if(me.tileJson){
                me.tileJson.Z[ grid.gy ][ grid.gx ] = barrier*1;
            }
            init && me.initGraph();
        },

        canEvent : function(){
            var me = this;
            var fromGrid, toGrid;
            if(arguments.length == 1){
                fromGrid = me.myRole.grid;
                toGrid = arguments[0];
            }else{
                fromGrid = arguments[0];
                toGrid = arguments[1];
            }
            if(me.isSameGrid(fromGrid, toGrid)) return true;
            //有些特殊事件，是需要走到格子上去的,如果格子上有这种事件，就需要可以走
            var toid = G.frame.shiyuanzhanchang_map.positionToIndex(toGrid.gx,toGrid.gy);
            if (!X.inArray(G.DATA.shiyuanzhanchang.finishgzid, toid) && G.DATA.shiyuanzhanchang.eventgzid[toid]){
                if (G.DATA.shiyuanzhanchang.eventgzid[toid] == '19' ||
                    G.DATA.shiyuanzhanchang.eventgzid[toid] == '20' ||
                    G.DATA.shiyuanzhanchang.eventgzid[toid] == '28' ||
                    G.DATA.shiyuanzhanchang.eventgzid[toid] == '35' ||
                    G.DATA.shiyuanzhanchang.eventgzid[toid] == '36' ||
                    G.DATA.shiyuanzhanchang.eventgzid[toid] == '33'
                ){
                    return false;
                }
            }
            if(fromGrid.gy == toGrid.gy){ // 当前行
                return Math.abs(fromGrid.gx - toGrid.gx) == 1;
                // return false;
            }else if(Math.abs(fromGrid.gy - toGrid.gy) == 1){ // 上下
                if(fromGrid.gy % 2 == 0){
                    return fromGrid.gx == toGrid.gx || fromGrid.gx - toGrid.gx == 1;
                }else{
                    return fromGrid.gx == toGrid.gx || toGrid.gx - fromGrid.gx == 1;
                }
            }
        },
        canGoto : function(grids, toGrid){
            var me = this;
            // var res = me.findWay(me.myRole.grid, toGrid);
            if(grids.length > 0){
                var grid = grids[grids.length - 1];
                grid.gx = grid.y;
                grid.gy = grid.x;
                return me.canEvent(grid, toGrid);
            }
            return false;
        },

        getFX : function(frompos,topos){
            var me = this;
            //从frompos，如果想到达topos的话，方向如何
            var _angle = Math.atan2(topos.y - frompos.y, topos.x - frompos.x) * (180 / Math.PI);
            var _fx = 1;
            // 每个面向间隔45度
            if (_angle > 67.5 && _angle < 112.5) {
                //上
                _fx = 5;
            } else if (_angle > -112.5 && _angle < -67.5) {
                //下
                _fx = 1;
            } else if (_angle == 180 || (_angle < -157.5 && _angle > -180) || (_angle > 157.5 && _angle < 180) ) {
                //左
                _fx = 7;
            } else if ( _angle == 0 || (_angle < 0 && _angle > -22.5) || (_angle > 0 && _angle < 22.5) ) {
                //右
                _fx = 3;
            } else if (_angle > 112.5 && _angle < 157.5) {
                //左上
                _fx = 6;
            } else if (_angle > 22.5 && _angle < 67.5) {
                //右上
                _fx = 4;
            } else if (_angle > -157.5 && _angle < -112.5) {
                //左下
                _fx = 8;
            } else if (_angle > -67.5 && _angle < -22.5) {
                //右下
                _fx = 2;
            }
            return _fx;
        },

        // 获取centerGrid附近距离<=distance的格子
        // includeSelf=是否包含centerGrid自己
        // eliminateObs=是否排除障碍点
        // range=distance范围内还是等于distance
        // getGridNearBy: function(centerGrid, distance, includeSelf, eliminateObs, range) {
        //     var me = this;
        //     distance = distance || 2;
        //     if(includeSelf == null) includeSelf = true;
        //     if(eliminateObs == null) eliminateObs = true;
        //     if(range == null) range = true;

        //     var grids = [];
        //     for (var _i = -distance; _i <= distance; _i++) {
        //         for (var _j = -distance; _j <= distance; _j++) {
        //             if (!range && (Math.abs(_i) != distance || Math.abs(_j) != distance)) continue;

        //             var grid = { gx: Number(centerGrid.gx) + _i, gy: Number(centerGrid.gy) + _j };
        //             //处理是否包含自己
        //             if (!includeSelf && grid.gx == centerGrid.gx && grid.gy == centerGrid.gy) continue;

        //             // gx:j, gy:i
        //             //跳过越界和障碍点
        //             // if (grid.gx <= 0 || grid.gy <= 0 || grid.gy >= me.tileJson.numh || grid.gx >= me.tileJson.numw || eliminateObs && me.tileJson.Z[grid.gy][grid.gx] == 0) {
        //             //     continue;
        //             // }
        //             if (eliminateObs && grid.gy <= 0 || grid.gx <= 0 || grid.gy >= me.tileJson.numh || grid.gx >= me.tileJson.numw || me.tileJson.Z[grid.gx][grid.gy] == 0) {
        //                 continue;
        //             }

        //             grids.push(grid);
        //         }
        //     }
        //     return grids;
        // },

        //target是否在我的屏幕的可视范围内，用于处理屏幕外的角色不低频活动降低资源占用
        // checkActiveArea : function(target){
        //     var v = true;
        //     if(!cc.isNode(target))return false;
        //
        //     if(cc.isNode(this.myRole) && this.myRole!=target && (Math.abs(this.myRole.x - target.x) > this.width+300 || Math.abs(this.myRole.y - target.y) > this.height+300)) {
        //         v = false;
        //     }
        //     return v;
        // },
        //屏幕外的角色不显示
        // hideObjectIfNotInActiveArea : function(target){
        //     var me = this;
        //     if(!cc.isNode(me.myRole))return;

        //     if(target == me.myRole){
        //         //如果是自己的主角移动了的话，需要检测除自己外的其他角色
        //         cc.each(me.obj,function(v){
        //             if(v==me.myRole)return;
        //             me.hideObjectIfNotInActiveArea(v);
        //         });
        //         return;
        //     }

        //     if(cc.isNode(target)){
        //         if(!this.checkActiveArea(target) && !G.guide.view){
        //             target.hide();
        //         }else{
        //             target.show();
        //             target._checkRoleInit && target._checkRoleInit();
        //         }
        //     }
        // },
    };

    cc.each(_fun,function(v,k){
        G.class.baseMap.prototype[ k ] = v;
    });
})();