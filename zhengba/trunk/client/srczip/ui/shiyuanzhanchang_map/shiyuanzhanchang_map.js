(function () {
    //
    G.class.shiyuanzhanchang_map = G.class.baseMap.extend({
        ctor : function(data,callback){
            var me = this;
            data.debug = false;
            G.frame.shiyuanzhanchang_map = me;
            this._super.apply(this,arguments);
        },
        omRemove:function(){
            var me = this;
            G.frame.shiyuanzhanchang_map = undefined;
            delete G.frame.shiyuanzhanchang_map;
        },
        onReady : function(){
            var me = this;

            var opend = G.DATA.shiyuanzhanchang.opengzid;
            //G.DATA.shiyuanzhanchang.nowgzid
            var nowgzid = G.DATA.shiyuanzhanchang.nowgzid;
            if (X.inArray(me.getYbhGzid(),nowgzid) && G.DATA.shiyuanzhanchang.eventdata['34']){
                //如果站在一笔画上，就把坐标调回出生点
                nowgzid =  X.keysOfObject(G.DATA.shiyuanzhanchang.eventdata['34'])[0];
            }
            var playstart = me.indexToPosition(nowgzid); // 出生点
            var lightGrids = [];
            if(opend.length == 0){
                // 点亮出生点周围
                lightGrids = me.getLightScope(playstart);
            }else{
                // 点亮所有经过的地方
                for(var i=0;i<opend.length;i++){
                    var grids = me.getLightScope(me.idToGrid(opend[i]));
                    for(var _g=0;_g<grids.length;_g++){
                        if(!X.inArray(lightGrids, grids[_g])){
                            lightGrids.push(grids[_g]);
                        }
                    }
                }
            }
            me.initFog(lightGrids);
            me.drawTileMap();
            me.createMyRole(playstart);
        },
        drawTileMap: function () {
            var me = this;
            me.forEachGrids(function(gx, gy, idx){
                if(!me.tileJson.D[ me.gridToId({gx: gx, gy: gy}) ]) return;
                var d = me.getGridData(gx, gy, idx+1);
                if (d.conf.typeid == '0' || !d.custom || !d.custom.floorImg){
                    return;
                }
                if(d){
                    me.action_addobj(d);
                }
            });
            me.initGraph();
        },
        indexToPosition: function (idx){
            var me = this;
            var conf = me.mapConf;
            if(conf[idx]){
                return {gx: conf[idx].x, gy: conf[idx].y};
            }
            return null;
        },
        getBossGrid:function(){
          var me = this;
          //获取boss占据的四个格子
            var eventgzid = G.DATA.shiyuanzhanchang.eventgzid;
            var idxarr = [];
            for (var i in eventgzid){
                if (eventgzid[i] == '60' || eventgzid[i] == '3'){
                    idxarr.push(i);
                }
            }
            return idxarr;
        },
        refreshGrids: function(idx){
            var me = this;
            var idx= idx || G.DATA.shiyuanzhanchang.nowgzid;
            var pos = me.indexToPosition(idx);
            var grid = me.get(me.gridToId(pos));
            if(cc.isNode(grid)){
                grid.changeData( {"finish":1} );
            }
            me.initGraph();
        },
        //获取boss位置偏移量，四个格子只去对角的那一个，如果对角格子在四个boss站的格子内，一定是往对应方向偏移
        getBossPosOffset:function(gx,gy){
          var me = this;
          var pos = cc.p(80,15);
          var idxarr = me.getBossGrid();
          //上边四个格子
            var topid = me.positionToIndex(gx,gy+2);
            var bottomid = me.positionToIndex(gx,gy-2);
            var leftid = me.positionToIndex(gx-1,gy);
            var rightid = me.positionToIndex(gx+1,gy);
            if (X.inArray(idxarr,topid)){
                pos = cc.p(75,65);
            } else if (X.inArray(idxarr,bottomid)){
                pos = cc.p(75,-45);
            } else if (X.inArray(idxarr,leftid)){
                pos = cc.p(0,65);
            } else if (X.inArray(idxarr,rightid)){
                pos = cc.p(160,10);
            }
            return pos;
        },
        //判断噬渊石共振是否是同一个
        getGzissame:function(old,gzid){
          var me = this;
          //gzid:需要用来判断的gzid；
            var jiequ = old;
            var sjid = X.keysOfObject(jiequ)[0];
            var eventdata = G.DATA.shiyuanzhanchang.eventdata[sjid];
            var keys = X.keysOfObject(eventdata);
            return X.inArray(keys,gzid) && X.inArray(keys,jiequ[sjid]) && jiequ[sjid] != gzid;
        },
        getYscGroudgz:function(){
          var me = this;
          //获取运输船周围的格子，没有事件且可以走的格子
            var round;
            var grid = G.frame.shiyuanzhanchang_map.indexToPosition(G.DATA.shiyuanzhanchang.nowgzid);
            if(grid.gy % 2 == 0){
                round = [
                    [1, 0],[0, -1],
                    [0, -2],[-1, -1],
                    [-1, 0],[-1, 1],
                    [0, 2],[0,1]
                ];
            }else {
                round = [
                    [1, 0],[1, -1],
                    [0, -2],[0, -1],
                    [-1, 0],[0,1],
                    [0, 2],[1,1]
                ];
            }
            var grids = [];

            for(var i=0;i<round.length;i++){
                var gid = me.positionToIndex(grid.gx + round[i][0],grid.gy + round[i][1]);
                var concent = G.frame.shiyuanzhanchang_map.mapContent.getChildByName((grid.gy + round[i][1])+'_'+(grid.gx + round[i][0]));
                if (concent){
                    if (X.inArray(G.DATA.shiyuanzhanchang.finishgzid,gid) || (!concent.data.conf.typeid)) {
                        grids.push(gid.toString());
                    }
                }
            }
            return grids[0];
        },
        //一笔画所有格子id
        getYbhGzid:function(){
          var me = this;
          var arr = [];
          var event = G.DATA.shiyuanzhanchang.eventdata['36'] || {};
          for (var i in event){
              arr.push(i);
          }
          return arr;
        },
        //一笔画终点id
        getYbhZDID:function(){
            var me = this;
            var gzid = -1;
            var event = G.DATA.shiyuanzhanchang.eventdata['35']||{};
            if (!X.isHavItem(event)) return gzid;
            for (var i in event){
                gzid = i;
            }
            return gzid;
        },
        clearAllYbhInfo :function(){
            var me = this;
            G.frame.shiyuanzhanchang_map.myRole.eventFootArr = [];
            for (var i=0;i< G.frame.shiyuanzhanchang_map.myRole.eventFootAni.length;i++){
                G.frame.shiyuanzhanchang_map.myRole.eventFootAni[i].removeFromParent();
            }
            G.frame.shiyuanzhanchang_map.myRole.eventFootAni = [];
        },
        createMyRole: function (grid) {
            var me = this;
            var d = {
                type: 'player',
                _id: 1,
                gx: grid.gx,
                gy: grid.gy,
            };
            var role = me.action_addobj(d);
            role.moveToGrid(grid);
        },

        action_addobj : function(data){
            //地图上新增一个对象
            if(typeof(data)=='string')data = JSON.parse(data);
            var obj;
            var me = this;
            data.map = me;
            if(data._id==null){
                data._id = data.type+"_c_"+ _objectIndex ;
                data.roleIndex = _objectIndex;
                _objectIndex++;
            }
            if( data.type == 'player' ){
                //玩家
                cc.mixin(data,{
                    map : this
                },true);
                data.myrole = true;
                obj = new G.class.shiyuanzhanchang_player(data);
                this.myRole = obj;
                this.mapContent.addChild(obj);
                obj.zIndex = me.mapContent.height - obj.y;

                //镜头跟踪我的角色
                if(data.myrole){
                    this.follow(obj);
                    this.myRole = obj;
                }
            }else if(data.type.startsWith('mapGrid')){
                // obj = new G.class[data.type](data);
                obj = new G.class.renderGrid(data);
                obj.setMiWu();
                this.mapContent.addChild(obj);
                obj.zIndex = me.tileJson.numh - obj.data.gy+100;
            }
            return obj;
        },
        onOpen : function(){
            var me = this;

            this.mapContent.setTouchEnabled(true);
            this.mapContent.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_ENDED){
                    var touchPos = me.mapContent.convertToNodeSpace(sender.getTouchBeganPosition());
                    me.event.emit('mapTouch',touchPos);
                }
            });
            this._super.apply(this,arguments);

            if(me.tileJson){
                me.onReady();
            }else{
                me.event.once('preloadSuccess',function(){
                    me.onReady();
                });
            }
        },
    });
})();