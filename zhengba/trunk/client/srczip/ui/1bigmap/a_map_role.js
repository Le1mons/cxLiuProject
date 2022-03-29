(function(){
    G.class.mapRole = G.class.mapObject.extend({
        ctor : function(data){
            var me = this;
            data.width = data.width || 152;
            data.height = data.height || 152;
            me._super.apply(this,arguments);
            me._footmark = {}; // 走过的路
            me.eventFootArr = [];
            me.eventFootAni = [];
            this.data.fx = data.fx || 0; //逻辑方向\
            this.role = null; // 外形
            var hid = X.cacheByUid('mydzid') || G.gc.syzccom.duizhang[1];
            this._initRole(hid);
        },
        //获取从角色当前pos移动到距target dis距离的point
        // TODOZZ 改成距离的格子数
        // nearTo: function(target, dis){
        //     var me = this;
        //     var frompos = me.getpos();
        //     var topos = target.getpos();

        //     var toDistance = me.distance(target) - dis; // 需要前进的距离
        //     var radian = Math.atan2( topos.y - frompos.y, topos.x - frompos.x );
        //     var endpos = cc.p(frompos.x + toDistance * Math.cos( radian ) , frompos.y + toDistance * Math.sin( radian ));

        //     return endpos;
        // },

        //开始移动并发送数据
        findWayAndMoveTo : function(toGrid, callback, sync){
            var me = this;
            if(!me.map.tileJson) return;
            if (me.map.myRole.role.dead)return;
            if (G.DATA.isFight){
                return G.tip_NB.show(L('syzc_13'));
            }
            if(me.data.moveTargetGrid){
                cc.log('has moveGrid');
                return;
            }
            var sjgzarr = G.frame.shiyuanzhanchang_map.getYbhGzid();
            var togridId = G.frame.shiyuanzhanchang_map.positionToIndex(toGrid.gx,toGrid.gy);
            var megridid = G.frame.shiyuanzhanchang_map.positionToIndex(me.grid.gx,me.grid.gy);
            if (!X.inArray(sjgzarr,togridId) && !X.inArray(sjgzarr,megridid)){
                for (var i=0;i<sjgzarr.length;i++){
                    var __gzpos = G.frame.shiyuanzhanchang_map.indexToPosition(sjgzarr[i]);
                    me.map.tileJson.Z[ __gzpos.gy ][ __gzpos.gx ] = 0;
                    me.map.initGraph();
                }
            }


            if(me.map.isSameGrid(me.grid, toGrid)){
                // me.stopMove(true);
                // me.wait();
                callback && callback(me);
                return;
            }

            if(callback && me.map.canEvent(toGrid)){
                callback && callback(me);
            }else{
                var grids = me.map.findWay(me.grid, toGrid);
                if (G.frame.shiyuanzhanchang_map.myRole.eventFootArr.length > 0 && grids.length>1){
                    return G.tip_NB.show(L('syzc_22'));
                }
                if(me.map.canGoto(grids, toGrid)){
                    me.data.moveTargetGrid = toGrid; // 设定移动目标点
                    var wpos = me.convertToWorldSpace();

                    if (wpos.x < -126 || wpos.x > 604 || wpos.y < 106 || wpos.y > 934){
                        me.map.follow(me);
                    }else {
                        me.map.followNode();
                    }
                    me.setFootMark(grids);
                    if(sync){
                        me.syncWalkInfo(grids[grids.length - 1], function(){
                            me.moveByGrids(grids, callback);
                        });
                    }else{
                        me.moveByGrids(grids, callback);
                    }
                }else{
                    G.tip_NB.show(L('syzc_wfqw'));
                }
            }
            if (!X.inArray(sjgzarr,togridId) && !X.inArray(sjgzarr,megridid)){
                for (var i=0;i<sjgzarr.length;i++){
                    var __gzpos = G.frame.shiyuanzhanchang_map.indexToPosition(sjgzarr[i]);
                    me.map.tileJson.Z[ __gzpos.gy ][ __gzpos.gx ] = 1;
                    me.map.initGraph();
                }
            }
        },

        syncWalkInfo : function(grid, callback){
            callback && callback();
        },

        moveToGrid : function(grid){
        },

        //通过grid移动
        moveByGrids : function(grids, callback){
            var me = this;
            var grid = grids.shift();
            grid.gx = grid.y;
            grid.gy = grid.x;

            //广播角色移动事件
            cc.log('move:', grid.gx, grid.gy);

            var pos = me.map.gridToPosition(grid);
            var fx = me.map.getFX( me.getPosition(), pos );
            me.setDirection(fx);

            //通过距离计算耗时
            var distance = cc.pDistance(me.getPosition(), pos);
            // me.stopMove();

            me.data.moving = true;
            me.runActions([
                cc.moveTo(distance / (500) , pos),
                cc.callFunc(function(){
                    me.grid = {gx:grid.gx, gy:grid.gy};
                    me.moveToGrid(me.grid);

                    if(grids.length==0){
                        delete me.data.moveTargetGrid;
                        // me.wait();
                        me.stopMove(true);
                        callback && callback(me);
                    }else{
                        me.moveByGrids(grids,callback,true);
                    }
                },this)
            ],12545652);
        },

        // 传送到某处
        flashTo: function(grid,nofollow){
            var me = this;
            var pos = me.map.gridToPosition(grid);
            me.grid = grid;
            me.setPosition(pos);
            if (!nofollow){
                me.map.follow(me);
            }
        },
        //停止移动
        stopMove : function(stopEffect){
            var me = this;
            this.stopActionByTag(12545652);
            this.data.moving = false;
            this.role.spine.runAni(0,"wait",true)
        },
        setFootMark: function(grids){
            var me = this;

            for(var i=0;i<grids.length;i++){
                var grid = grids[i];
                grid.gx = grid.y;
                grid.gy = grid.x;
                me._footmark[me.map.gridToId( grid )] = 1;
            }
        },
        getFootMark : function(){
            var me = this;
            return X.keysOfObject(me._footmark);
        },
        getStandGrid : function(){
            var me = this;
            var grid = me.map.get(me.map.gridToId(me.grid));
            if(cc.isNode(grid)){
                return grid.data.idx;
            }
            return -1;
        },
        play : function(name,loop,endCall){
            if(cc.isNode(this.role)){
                this.role.runAni(0, name, loop);
            }
        },
        setDirection : function(fxint){
            this.data.fx = fxint;
            var dir;
            var data = G.DATA.shiyuanzhanchang;
            if (this.role.yscNode && data.yunshu && data.yunshu.jiequ){
                switch(fxint){
                    case 6: // 左上
                        dir = 'left';
                        break;
                    case 4: // 右上
                        dir = 'up';
                        break;
                    case 8: // 左下
                        dir = 'down';
                        break;
                    case 2: // 右下
                        dir = 'right';
                        break;
                    case 3: // 右
                        dir = 'right';
                        break;
                    case 7: // 左
                        dir = 'left';
                        break;
                }
                dir && this.role.yscNode.action.play(dir, true);
            } else {
                if (X.inArray([6,7,8],fxint)){
                    this.role.setScaleX(-1);
                } else {
                    this.role.setScaleX(1);
                }
                fxint && this.role.spine.runAni(0,'run', true);
            }
        },

        _initRole : function(hid){
            var me = this;
            //初始化角色
            if(me.role) return;
            // this.setBody();
            this.changeData(true,hid);
            // this.setDirection( this.data.fx );
        },
        //刷新身体|衣服
        setBody: function () {},

        changeData: function(force,hid){
            var me = this;
            me.setBody(hid);
            this.setDirection( 0 );
        },

        // _checkRoleInit : function(){
        //     //检测是否需要绘制形象，如果形象还没有绘制，则doit
        //     //_initRole 时，会根据距离，远的角色不处理
        //     //map的hideObjectIfNotInActiveArea中，判断如果走进了，会调用该方法
        //     var me = this;

        //     // if(this.data.type=='deadbody'){
        //     //     this.dead(false, true);
        //     // }else{
        //         // this.wait();
        //     // }
        // },
    });
})();
