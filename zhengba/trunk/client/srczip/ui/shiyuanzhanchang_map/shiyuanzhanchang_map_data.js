(function(){
    var _fun = {
        gridToId: function(grid){
            return grid.gy + '_' + grid.gx;
        },
        idToGrid: function(id){
            var d = id.split('_');
            return {gy:d[0]*1, gx:d[1]*1};
        },
        getGridData : function(gx, gy, idx){
            var me = this;
            var grid = {gx: gx, gy: gy};
            var gid = me.gridToId(grid);
            var data = me.tileJson.D[ gid ];
            // cc.log('### grid:', gy, gx, idx);
            var conf;
            var typeid = '';
            var eventdata = '';
            // var conf = JSON.parse(JSON.stringify( me.data.mapconf[idx] ));
            if( X.isHavItem(G.DATA.shiyuanzhanchang.eventdata) &&
                G.DATA.shiyuanzhanchang.eventgzid &&
                G.DATA.shiyuanzhanchang.eventgzid[idx] &&
                G.DATA.shiyuanzhanchang.eventgzid[idx]!='1'&&
                !X.inArray(G.DATA.shiyuanzhanchang.finishgzid, idx)
            ){
                //这个格子有事件，然后通过格子时间去事件数据找对应格子的事件
                typeid = G.DATA.shiyuanzhanchang.eventgzid[idx];
                eventdata = G.DATA.shiyuanzhanchang.eventdata[typeid][idx];
            }
            conf = {
                "y": gy,
                "x": gx,
                "typeid": typeid,
                "eventdata":eventdata,
                "typename": G.gc.syzccom.eventinfo[typeid],
                "go": 1,
            };
            if(data*1 == 0 || !me.data.mapconf[idx]){
                //空格子
                return {
                    type: 'mapGrid0',
                    _id: gid,
                    gx: gx,
                    gy: gy,
                    idx: idx,
                    custom: null,
                    conf: conf,
                };
            }
            var custom = me.getCustomInfo(me.data.mapconf[idx], typeid,idx);
            // 容错
            //记录所有使用到的纹理列表
            me._tileTexture[custom.floorImg] = 1;
            if(custom.eventImg){
                me._tileTexture[custom.eventImg] = 1;
            }

            return {
                type: 'mapGrid' + custom.event,
                _id: gid,
                gx: gx,
                gy: gy,
                idx: idx,
                // data: data,
                custom: custom,
                conf: conf,
            };
        },
        // refreshGrids: function(){
        //     var me = this;
        //     var keys = G.DATA.shiyuanzhanchang.finishgzid;
        //
        //     for(var i=0;i<keys.length;i++){
        //         var pos = me.indexToPosition(keys[i]);
        //         var grid = me.get(me.gridToId(pos));
        //         var data = me.getGridData(pos.gx, pos.gy, keys[i]);
        //
        //         if(cc.isNode(grid)){
        //             if(data != null){
        //                 grid.changeData( keys[i] );
        //             }else{
        //                 // 之前存在的格子, 现在去掉
        //                 me.setBarrier(pos, 0);
        //                 me.action_delobj(grid.data._id);
        //             }
        //         }else{
        //             // 之前不存在的格子, 现在填充了内容
        //             if(data != null){
        //                 me.action_addobj(data);
        //             }
        //         }
        //     }
        //     var hid = X.cacheByUid('mydzid') || G.gc.syzccom.duizhang[1];
        //     me.myRole.changeData(true,hid);
        //     me.initGraph();
        // },
        getCustomInfo: function (conf, eid,gzid) {
            var me = this;
            //111是普通地块，可以正常行走
            //地块也是会有事件的，所以需要在这里初始化地块需求
            var spacialArr = ['28','35','36'];
            var getSpecialUrl = function (id,idx) {
                if (id == 28){
                    //运输船终点
                    return 'ico/syzc/img_zk' + G.DATA.shiyuanzhanchang.eventdata[28][idx].graph + '.png';
                }else if (id == 36 || id == 35){
                    return 'ico/syzc/img_zk6.png';
                }
            };
            var getConfigUrl = function(id,isico){
                if (isico){
                    //事件小图标
                    if (!G.gc.syzccom.eventinfo[id] || !G.gc.syzccom.eventinfo[id].tubiao ){
                        return null;
                    }
                    return 'img/shiyuanzhanchang/' + G.gc.syzccom.eventinfo[id].tubiao + '.png';
                } else {
                    if(!G.gc.syevent[id]){
                        //后端事件
                        if (!G.gc.syzccom.eventinfo[id] || !G.gc.syzccom.eventinfo[id].image){
                            return null;
                        }
                        return 'ico/syzc/' + G.gc.syzccom.eventinfo[id].image + '.png';
                    }else {
                        return 'ico/syzc/' + G.gc.syevent[id].picture + '.png';
                    }
                }
            };
            var result = {};
            result.floor = conf.typeid;
            // if(!G.gc.syevent[conf.typeid]){
            //     cc.log(JSON.stringify(conf));
            // }
            if (!X.inArray(spacialArr,eid)){
                result.floorImg = getConfigUrl(conf.typeid);
            }

            result.floorGrayImg = getConfigUrl(conf.typeid);

            if(
                eid == ""
            ){
                //说明是地形格子，不需要上面的事件
                result.event = result.floor;
            }else{
                //事件不为空
                result.event = eid;
                if (X.inArray(spacialArr,eid)){
                    result.floorImg = getSpecialUrl(eid,gzid);
                }
                result.eventImg = getConfigUrl( result.event );
                result.eventGrayImg = getConfigUrl(result.event);
                result.eventTitleImg = getConfigUrl(result.event,true);
            }
            return result;
        },
        indexToPosition: function (idx){
            var me = this;
            var conf = me.data.mapconf;
            var keys = X.keysOfObject(conf);

            for(var i=0;i<keys.length;i++){
                if(keys[i] == idx){
                    var grid = conf[keys[i]];
                    return {gx: grid.x, gy: grid.y};
                }
            }
            return null;
        },
        positionToIndex: function (gx, gy){
            var me = this;
            var conf = me.data.mapconf;
            var keys = X.keysOfObject(conf);

            for(var i=0;i<keys.length;i++){
                var grid = conf[keys[i]];
                if(grid.x == gx && grid.y == gy){
                    return i+1;
                }
            }
            return 0;
        },
        // 照亮周围格子
        getLightScope: function(grid){
            var me = this;
            var round;
            grid = grid || 0;
            if(grid.gy % 2 == 0){
                round = [
                    [-1, -1], [-1, -2],[-2, -3], // 左xia
                    [0, 2], [0, 4],[0,6] ,// 直上
                    [0, 1], [1, 2],[1,3] ,// 右上
                    [-3,0],[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],[3,0], // 横向
                    [-1, 1], [-1, 2],[-2,3], // 左上
                    [0, -2], [0, -4],[0,-6], // 直下
                    [0, -1], [1, -2],[1,-3], // 右下
                    [-1, -3], [0, -3], [-1, -4], [-1, -5], [1, -4], [0, -5],// 下左右空隙
                    [-1, 3], [-1, 5], [-1, 4], [0, 3], [1, 4], [0, 5],// 上左右空隙
                    [-2, 1], [-2, -3], [-3, 1], [-2, -1], [-3, -1], [-2, -2],// 左上下空隙
                    [1, 1], [2, 2], [2, 1], [1, -1], [2, -2], [2, -1],// 右上下空隙
                ];
            }else{
                round = [
                    [0, -1], [-1, -2], [-1,-3],// 左xia
                    [0, 2], [0, 4],[0,6], // 直上
                    [1, 1], [1, 2],[2,3],[1, 0], // 右上
                    [-3,0],[-2, 0], [-1, 0], [0, 0], [0, 1], [2, 0],[3,0], // 横向
                    [1, 1], [-1, 2],[-1,3], // 左上
                    [0, -2], [0, -4],[0,-6], // 直下
                    [1, -1], [1, -2], [2,-3],// 右下
                    [1, -3], [0, -3], [-1, -4], [-1, -5], [1, -5], [0, -5],// 下左右空隙
                    [1, 3], [1, 5], [-1, 4], [0, 3], [1, 5], [0, 5],[1,4],// 上左右空隙
                    [-2, 2], [-2, 1], [-1, 1], [-2, -1], [-2, -2], [-1, -1],// 左上下空隙
                    [2, 2], [2, 1], [3, 1], [3, -1], [2, -2], [2, -1],// 右上下空隙
                ];
            }

            var grids = [];

            for(var i=0;i<round.length;i++){
                var d = {gx: grid.gx + round[i][0], gy: grid.gy + round[i][1]};
                var gid = me.gridToId(d);
                grids.push(gid);
            }
            return grids;
        },
        // 照亮周围格子
        lightGrids: function(grid){
            var me = this;
            var grids = me.getLightScope(grid);

            for(var i=0;i<grids.length;i++){
                var gid = grids[i];
                if(me.willClearFog(gid)){
                    var concent = me.get(gid);
                    if (cc.isNode(concent)){
                        concent.gridStatus.fog = false;
                        if(cc.isNode(concent.grayContent)) {
                            concent.grayContent.removeFromParent();
                        }
                    }
                }
            }
        },
        //我的三格范围以内有boss的格子
        getGroundBossScope: function(grid){
            var me = this;
            var round;
            grid = grid || 0;
            round = [
                    [-1, 1], [-1, 2],[-2,3] ,// 左上
                    [0, 2], [0, 4],[0,6] ,// 直上
                    [0, 1], [1, 2], [1,3],// 右上
                    [-3,0],[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],[3,0],// 横向
                    [-1, -1], [-1, -2],[-2,-3], // 左下
                    [0, -2], [0, -4],[0-6], // 直下
                    [1, -1], [1, -2],[2,-3],// 右下
                    [-1,-3], [-1,-2],[0,-1],[1,1],[1,2],[1,3],
                    [0, -3],[-1,-4],[1,3],[1,4],[-1,-1],[-2,-2],[-2,-1],[0,-5],[1,-3],[1,-4],[1,-5],
                    [2,-1],[3,-1],[3,-2],
                    [1, 5], [1, 4],[1,3]
            ];

            var grids = [];

            for(var i=0;i<round.length;i++){
                var gid = me.positionToIndex(grid.gx + round[i][0],grid.gy + round[i][1]);
                var event = G.DATA.shiyuanzhanchang.eventgzid[gid];
                var finish =  !X.inArray(G.DATA.shiyuanzhanchang.finishgzid, gid);
                if (gid>0 && finish && event && (event=='3' || event=='2' || event=='12' || event=='14')){
                    if (!X.inArray(grids,gid.toString())){
                        grids.push(gid.toString());
                    }
                }
            }
            return grids;
        },
        // 同步迷雾数据
        syncFog: function(){
            var me = this;
            if(!me.needSyncFog || me.needSyncFog.length == 0) return;

            G.DAO.shiyuanzhanchang.fog(me.needSyncFog, function(){
                me.fogData = me.fogData.concat(me.needSyncFog);
                me.needSyncFog = [];
            });
        },
        //驅散所有迷雾
        clearAllfog:function () {
            var me = this;
            if(!me.allFogarr || me.allFogarr.length == 0) return;
            for (var i=0;i<me.allFogarr.length;i++){
                if (cc.isNode(me.allFogarr[i])){
                    me.allFogarr[i].removeFromParent();
                }
            } 
        }
    };

    cc.each(_fun,function(v,k){
        G.class.shiyuanzhanchang_map.prototype[ k ] = v;
    });
})();