(function(){
    /*
    var map = M = new X.BigMap({
        width:640,
        height:1136,
        debug:true,
        tileJsonFile:'bigmap/xpetmap.json',
        resLists:[],
        initGraph:true,
        backgroundColor:cc.color('#333333')
    });
    map.event.on('preloadSuccess',function(){
        //map.showGrid('tile');
        var node = N =  new cc.SpriteAnimation();
        //node.autoRelease = true;
        node.init('animation_nanzhu',function(){
            this.play('ce_run',true);
        });
        node.zIndex = 2;
        map.follow(node);
        map.mapContent.addChild(node);

        map.mapContent.setTouchEnabled(true);
        map.mapContent.touch(function(sender,type){
            cc.log('type',type);
            var pos = sender.getTouchEndPosition();
            pos.x = Math.abs(sender.x) + Math.abs(pos.x);
            pos.y = Math.abs(sender.y) + Math.abs(pos.y);

            N.stopActionByTag(12545652);
            N.runActions([
                cc.moveTo(2, pos ),
                cc.callFunc(function(){

                },N)
            ],12545652);
        });
    });
    map.x = map.y = 0;
    map.preload();
    me.addChild( map );
    */

    X.BigMap = ccui.Layout.extend({
        /*
         * data.tileJsonFile = 瓦片地图json文件，由 astarmapeditor 生成
         * */
        extConf:{
            offsetY:90,
        },
        ctor: function (data, callback) {
            var me = this;
            me._super();
            me.data = cc.mixin({
                'debug': true, // 显示网格
                'autoRelease': true, // 地图被删除时，是否自动释放资源
                'initGraph': false, // 是否初始化障碍物信息
            }, data, true);

            me.setName(me.data.name || "unnamedbigmap");

            // me.width = data.width;
            // me.height = data.height;
            me.setContentSize(cc.director.getWinSize());
            // me.mapConf = data.mapconf;
            me._tileTexture = {}; // 记录所有使用到的纹理列表
            me._mapScale = 1;

            me.setClippingEnabled(true);
            me.event = cc.EventEmitter.create(1000);

            //设置背景色
            if (me.data.backgroundColor) {
                me.setBackGroundColor(me.data.backgroundColor);
                me.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            }

            me.createMap();
            me.initMap(callback);
            return me;
        },
        createMap: function() {
            var me = this;
            var mapScroll = this.mapScroll = new ccui.ScrollView();
            // mapScroll.setAnchorPoint(0.5,0.5);
            cc.enableScrollBar(mapScroll,false);
            mapScroll.setTouchEnabled(true);
            mapScroll.setContentSize(cc.director.getWinSize());
            // mapScroll.setInnerContainerSize(cc.size(2400, 1900))
            // mapScroll.setBounceEnabled(true);
            mapScroll.setDirection( 3 ); // cc.SCROLLVIEW_DIRECTION_BOTH
            mapScroll.addCCSEventListener(function () {
                if(me.data.followTarget){
                    me.unfollow();
                }
            });
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: function (touches, event) {
                    return true;
                },
            }, mapScroll);
            // me.mapScroll.setBounceEnabled(false);

            // me.mapScroll.scheduleUpdate();
            // me.mapScroll.update = function(dt) {
            //     if (me.mapScroll._autoScrolling) {
            //         me.mapScroll._processAutoScrolling(dt);
            //     }
            // };
            this.addChild(mapScroll);
            this.allFogarr = [];
            //主地图层，会在proload成功后，修改尺寸为配置尺寸
            var mapContent = this.mapContent = new ccui.Layout();
            mapContent.setName('mapContent');
            // mapContent.setAnchorPoint(0.15, anchor_x);
            mapContent.setTouchEnabled(false);
            mapScroll.addChild(mapContent);

            // var maskLayout = this.maskLayout = new ccui.Layout();
            // maskLayout.setBackGroundColor(cc.color(0,0,0,255));
            // maskLayout.setBackGroundColorOpacity(150);
            // maskLayout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            // maskLayout.setName('maskLayout');
            // mapContent.addChild(maskLayout);
        },
        initMap : function(callback){
            //加载资源
            var me = this;
            if(!me.data.tileJsonFile){
                cc.log('BigMap preload error : tileJsonFile is null');
                return;
            }
            X.loadPlist(me.data.preloadResLists || [] ,function(){
                X.loadJSON(me.data.tileJsonFile,function(err,tileJson){
                    me.tileJson = tileJson;
                    cc.log('===============>_initMap');
                    //设置主地图尺寸
                    me.mapContent.width = tileJson.w;
                    me.mapContent.height = tileJson.h;
                    // me.mapContent.setPosition(cc.p(-50,-50));
                    me.mapScroll.setInnerContainerSize(cc.size(tileJson.w * me._mapScale,tileJson.h * me._mapScale));
                    me.mapContent.setScale(me._mapScale);

                    // me.maskLayout.width = tileJson.w;
                    // me.maskLayout.height = tileJson.h;
                    // me.maskLayout.setLocalZOrder(tileJson.numh);
                    // me.maskLayout.setScale(me._mapScale)

                    //一屏能显示的最多tile数量
                    // me._screenMaxTileX = Math.ceil(me.width / tileJson.tilew);
                    // me._screenMaxTileY = Math.ceil(me.height / tileJson.tileh);

                    // me.mapSize = {
                    //     width: tileJson.w * me.tileJson.gridw + me.tileJson.gridw / 2,
                    //     height: tileJson.h * ((me.tileJson.gridh - 22.5) / 2 + 22.5) +
                    //         (me.tileJson.gridh - 22.5) / 2
                    // };

                    // cc.log('===============>mapContentW' + me.mapContent.width);
                    // cc.log('===============>mapContentH' + me.mapContent.height);
                    // cc.log('===============>mapContentX' + me.mapContent.x);
                    // cc.log('===============>mapContentY' + me.mapContent.y);
                    // cc.log('===============>mapScrollX' + me.mapScroll.getInnerContainer().x);
                    // cc.log('===============>mapScrollY' + me.mapScroll.getInnerContainer().y);

                    //开始检测绘制情况
                    // me.scheduleUpdate();
                    //设置寻路障碍信息
                    if(me.data.initGraph){
                        me.initGraph();
                    }

                    callback && callback.call(me);
                    me.onOpen && me.onOpen();
                    cc.callLater(function(){
                        me.event && me.event.emit('preloadSuccess');
                    });

                    // if(me.data.debug){
                        me.showGrid('grid');
                    // }
                    // me.drawTileMap();
                });
            });
        },
        //初始化astar障碍物信息，diagonal=是否可以斜角寻路
        initGraph:function(diagonal){
            if(diagonal==null)diagonal=true;
            // this.changeGraph();
            if(this.tileJson){
                this.graph = new X.GraphHex(this.tileJson.Z, { diagonal: diagonal }, this);
            }
        },
        follow : function(target){
            var me = this;
            me.unfollow();
            if (!cc.isNode(me.__target)){
                me.__target = new ccui.Layout();
                target.setPosition(target.getPosition());
                me.mapContent.addChild(me.__target);
            }
            me.__target.update = function(dt){
                me.__target.setPosition(cc.p(me.myRole.getPosition().x,me.myRole.getPosition().y+200));
            };
            me.__target.scheduleUpdate();
            me.data.followTarget =   me.__target;
            var innerContainer = me.mapScroll.getInnerContainer(); // cc.rect(0, 0, innerContainer.width , innerContainer.height )
            me._followAction = innerContainer.runAction(cc.follow(me.__target,cc.rect(0, 0, innerContainer.width , innerContainer.height )));
        },
        followNode:function(){
            var me = this;
            me.unfollow();
            if (me.mapContent.getChildByName('followNode')) {
                me.mapContent.getChildByName('followNode').unscheduleUpdate();
                me.mapContent.getChildByName('followNode').removeFromParent();
                delete me.mapContent.getChildByName('followNode');
            }
            var target = new ccui.Layout();
            target.setName('followNode');
            var pos = cc.p(C.WS.width/2,C.WS.height/2);
            pos = me.mapContent.convertToNodeSpace(pos);
            var myRolePos = me.myRole.getPosition();
            target.setPosition(pos);
            me.mapContent.addChild(target);
            var offsetPos = cc.p(pos.x - myRolePos.x,pos.y - myRolePos.y);
            target.update = function (dt) {

                var myRolePos = me.myRole.getPosition();
                target.setPosition(cc.p(myRolePos.x + offsetPos.x,myRolePos.y + offsetPos.y));
            };
            target.scheduleUpdate();
            me.data.followTarget = target;
            var innerContainer = me.mapScroll.getInnerContainer(); // cc.rect(0, 0, innerContainer.width , innerContainer.height )
            me._followAction = innerContainer.runAction(cc.follow(target,cc.rect(0, 0, innerContainer.width , innerContainer.height )));
        },
        unfollow : function(){
            var me = this;
            if(cc.isNode(me._followAction)){
                me.mapContent.stopAction(me._followAction);
                delete me._followAction;
            }
            delete me.data.followTarget;
        },
        //寻路
        findWay : function(fromGrid, toGrid){
            var me = this;
            var res;

            //同1个格子，则直接移动修正坐标
            if(me.isSameGrid(fromGrid,toGrid)){
                //统一返回的数据格式
                toGrid.x = toGrid.gx;
                toGrid.y = toGrid.gy;
                res = [toGrid];
            }else{
                res = X.astarHex.search(
                    me.graph,
                    me.graph.grid[fromGrid.gy][fromGrid.gx],
                    me.graph.grid[toGrid.gy][toGrid.gx],
                    { closest: true }
                );
                // var node = res[res.length - 1];
                // if(node && me.tileJson.Z[node.x][node.y] == 0){
                //     res.pop();
                // };
            };
            return res;
        },
        // update : function(dt){
        //     var me = this;
        //     // me.onUpdate && me.onUpdate(dt);
        //     // me.event.emit('update');

        //     //当X或Y发生了半格以上的偏移量时，检测是否需要补图&是否需要把屏幕cc.p()外的图块移除
        //     var _needDrawX = me.tileJson.tilew*0.5,
        //         _needDrawY = me.tileJson.tileh*0.5;
        //     // cc.log('=============+>x' + me.mapScroll.getInnerContainer().x);
        //     // cc.log('=============+>y' + me.mapScroll.getInnerContainer().y);
        //     if(
        //         me._lastCheckX==null ||
        //         me._lastCheckY==null ||
        //         Math.abs(me._lastCheckX-me.mapScroll.getInnerContainer().x) > _needDrawX ||
        //         Math.abs(me._lastCheckY-me.mapScroll.getInnerContainer().y) > _needDrawY
        //     ) {
        //         me._lastCheckX = me.mapScroll.getInnerContainer().x;
        //         me._lastCheckY = me.mapScroll.getInnerContainer().y;
        //         me.drawScreen && me.drawScreen();
        //     }
        // },
        isSameGrid : function(a,b){
            return a!=null && b!=null && a.gx==b.gx && a.gy == b.gy;
        },
        // positionToGridOrTile : function(ccp,type){
        //     var me = this;
        //     var gridY = (me.mapContent.height - ccp.y);
        //     var gy = parseInt(gridY/me.tileJson[type+'h']),
        //         gx = parseInt(ccp.x/me.tileJson[type+'w']);
        //     return {gx:gx,gy:gy}
        // },
        // positionToGrid : function(ccp){
        //     //pos转为grid坐标
        //     return this.mapPosToTile(ccp,'grid');
        // },
        // positionToTile : function(ccp){
        //     //pos转为瓦片坐标
        //     return this.positionToGridOrTile(ccp,'tile');
        // },
        // tileToPosition : function(tile){
        //     var me = this;
        //     var x = parseInt(tile.gx * me.tileJson.tilew + me.tileJson.tilew*.5, 10);
        //     var y = parseInt(tile.gy * me.tileJson.tileh + me.tileJson.tileh*.5, 10);
        //     return cc.p(x,me.mapContent.height-y);
        // },

        moveCameraToPos : function (pos,callback) {
            var me = this;
            if(cc.isArray(pos)){
                var pos2 = {};
                pos2.gx = pos[1];
                pos2.gy = pos[0];
            }else{
                var pos2 = pos;
            }
            var map = me.mapScroll.getInnerContainer();
            var topos = me.gridToPosition(pos2);
            // topos.x = -topos.x;
            // topos.y = -topos.y;
            if(topos.x < cc.winSize.width / 2){
                topos.x = cc.winSize.width / 2;
            }else if(topos.x > map.width - cc.winSize.width / 2){
                topos.x = map.width - cc.winSize.width / 2;
            }
            if(topos.y < cc.winSize.height / 2){
                topos.y = cc.winSize.height / 2;
            }else if(topos.y > map.height - cc.winSize.height / 2){
                topos.y = map.height - cc.winSize.height / 2;
            }
            var x = topos.x - cc.winSize.width / 2;
            var y = topos.y - cc.winSize.height / 2;

            // if(x > 0){
            //     x > map.width - cc.winSize.width / 2 ? x = map.width - cc.winSize.width /2 : x = x;
            // }else{
            //     x = 0;
            // };
            // if(y > 0){
            //     y > map.height - cc.winSize.height / 2 ? y = map.height - cc.winSize.height /2 : y = y;
            // }else{
            //     y = 0;
            // }
            topos.x = -x;
            topos.y = -y;
            // X.createLockMask2();
            me.unfollow();
            map.runActions([
                cc.moveTo(1,topos),
                cc.callFunc(function () {
                    // G.event.emit('move_over');
                    callback && callback();
                })
            ]);
        },
        gridToPosition: function (grid) {
            var me = this;
            // var ccpx = grid.gy * me.tileJson.gridw + (grid.gx % 2) * me.tileJson.gridw / 2 + me.tileJson.gridw / 2 - grid.gy * 0.5;
            // var ccpy = (grid.gx * me.tileJson.gridh) - grid.gx * me.extConf.offsetY  + me.tileJson.gridh / 2;
            var gridw = me.tileJson.gridw;
            var gridh = me.tileJson.gridh;

            var gridX = gridw * grid.gx + (grid.gy % 2 * gridw / 2) - 0.5 * grid.gx;
            var gridY = gridh * grid.gy - (grid.gy * me.extConf.offsetY);
            gridX += me.tileJson.gridw*0.5;
            gridY += me.tileJson.gridh*0.5;

            return cc.p(gridX, gridY);
        },
        // mapPosToTile: function (pos) {
        //     // 算出缩放成正六边形后边长 a 的值
        //     var me = this;
        //     var tileSize = cc.size(me.tileJson.gridw,me.tileJson.gridh);
        //     var a = tileSize.width / Math.sqrt(3);
        //     var x = pos.x,
        //         // y = pos.y
        //         y = (me.tileJson.h - pos.y) / tileSize.height * a * 2 + a / 2; // 加 a / 2 是因为矩形网格计算时会在底部增加 a / 2

        //     //位于矩形网格边线上的三个CELL中心点
        //     var points = new Array(cc.p(0, 0), cc.p(0, 0), cc.p(0, 0));
        //     //当前距离的平方
        //     var dist;
        //     //      index:被捕获的索引
        //     var i, index;
        //     //二分之根号3 边长的平方，如果距离比它还小，就必然捕获
        //     var g_MinDistance2 = Math.pow(a * Math.sqrt(3) / 2, 2);
        //     // 网格宽、高
        //     var g_unitx = a * Math.sqrt(3); //sqrt(3) * a
        //     var g_unity = a * 1.5; //a * 3 / 2
        //     // 网格对角线平方向上取整
        //     var mindist = Math.ceil(Math.pow(g_unitx, 2) + Math.pow(g_unity, 2));
        //     //计算出鼠标点位于哪一个矩形网格中
        //     var cx = parseInt(x / g_unitx);
        //     var cy = parseInt(y / g_unity);

        //     points[0].x = parseInt(g_unitx * cx);
        //     points[1].x = parseInt(g_unitx * (cx + 0.5));
        //     points[2].x = parseInt(g_unitx * (cx + 1));
        //     //根据cy是否是偶数，决定三个点的纵坐标
        //     if (cy % 2 == 0) {
        //         //偶数时，三个点组成倒立三角
        //         points[0].y = points[2].y = parseInt(g_unity * cy);
        //         points[1].y = parseInt(g_unity * (cy + 1));
        //     } else {
        //         //奇数时，三个点组成正立三角
        //         points[0].y = points[2].y = parseInt(g_unity * (cy + 1));
        //         points[1].y = parseInt(g_unity * cy);
        //     }

        //     // 计算两点间距离的平方
        //     function distance2(x1, y1, x2, y2) {
        //         return ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        //     }

        //     //现在找出鼠标距离哪一个点最近
        //     for (i = 0; i < 3; ++i) {
        //         //求出距离的平方
        //         dist = distance2(x, y, points[i].x, points[i].y);

        //         //如果已经肯定被捕获
        //         if (dist < g_MinDistance2) {
        //             index = i;
        //             break;
        //         }

        //         //更新最小距离值和索引
        //         if (dist < mindist) {
        //             mindist = dist;
        //             index = i;
        //         }
        //     }

        //     // x 第 0 个点的列值减 1 等于cell.x ( x 最左半格有 -1 值 )
        //     // cy 偶数时中间点 + 1，奇数时两边点 + 1，减 1 是因为初始为了计算方便 y 补了 a / 2 ( y 最上半格 也会存在 -1 )
        //     return {
        //         gx: cy + (cy % 2 + index % 2) % 2 - 1,
        //         gy: cx - (index > 0 ? 0 : 1)
        //     };
        // },
        forEachGrids: function(callback){
            var me = this;
            var index = 0;

            for (var gy = 0; gy < me.tileJson.numw; gy++) {
                for (var gx = 0; gx < me.tileJson.numh; gx++) {
                    callback && callback(gx, gy, index);
                    index ++;
                }
            }
        },
        // getSpriteFile: function (gx, gy) {
        //     var me = this;

        //     // var _key = gy + '_' + gx;
        //     // return me.data.mapresFolder + 'm' + G.frame.campaign_map.chapter + '_' + _key + '.png';
        //     return 'img/icon/sshl/map_2.png'
        // },
        //重绘可视区域内的瓦片地图
        // drawTileMap: function () {
        //     var me = this;
        //     var gridw = me.tileJson.gridw;
        //     var gridh = me.tileJson.gridh;

        //     me.forEachGrids(function(gx, gy, idx){
        //         if(!me.tileJson.D[gy + '_' + gx]){
        //             return;
        //         }
        //         var pgridw = gridw * gx + (gy % 2 * gridw / 2) - 0.5 * gx;
        //         var pgridh = gridh * gy - (gy * me.extConf.offsetY);

        //         pgridw += gridw*0.5;
        //         pgridh += gridh*0.5;

        //         var sprite = new cc.Sprite();
        //         var _pos = cc.p(pgridw, pgridh);
        //         sprite.setPosition(_pos);
        //         sprite.zIndex = me.tileJson.numh - gy;
        //         sprite.setName(gy + '_' + gx);

        //         var _spriteFile = me.getSpriteFile(gx, gy);
        //         //记录所有使用到的纹理列表
        //         me._tileTexture[_spriteFile] = 1;

        //         if (cc.sys.isNative) {
        //             // cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        //             sprite.initWithFile(_spriteFile);
        //             // cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
        //         } else {
        //             var _texture = cc.textureCache.getTextureForKey(_spriteFile);
        //             if (_texture) {
        //                 sprite.initWithTexture(_texture);
        //             } else {
        //                 me.data.debug && cc.log('addImageAsync for map sprite', _spriteFile);
        //                 cc.textureCache.addImageAsync(_spriteFile, function (texture) {
        //                     cc.isNode(this) && this.initWithFile(_spriteFile);
        //                 }, sprite);
        //             }
        //         }
        //         me.mapContent.addChild(sprite);
        //         sprite.show();
        //         // G.event.emit('drawTileMap', { gx: gx_i, gy: gy_i });

        //         var label = new cc.LabelBMFont();
        //         label.setFntFile(G.defaultFNT);
        //         label.setString((idx+1) + '');
        //         label.setPosition(_pos);
        //         label.zIndex = 1000;
        //         me.mapContent.addChild(label);
        //         // index++;
        //     });
        // },
        //显示网格
        showGrid : function(type){
            var me = this;
            if(type==null)type='grid';
            me.forEachGrids(function(gx, gy,idx){
                var img = new ccui.ImageView('img/gezi.png', 0);
                img.setOpacity(80);
                var txt = new ccui.Text();
                txt.setString(gx +  "," + gy);
                txt.setFontSize(22);
                txt.setTextColor(cc.color('#ffffff'));
                // X.enableOutline(txt,'#00ff00');
                img.setAnchorPoint(0.5,0.5);
                txt.setAnchorPoint(0,0);
                txt.setPosition(cc.p(0,30));
                var grid = {gx: gx, gy: gy};
                img.setPosition(me.gridToPosition(grid));
                img.addChild(txt,2000);
                me.mapContent.addChild(img,2000);
            });
        },
        onExit : function(){
            this._super();

            if(this.data.autoRelease){
                //释放瓦片地图资源
                for(var k in this._tileTexture){
                    cc.log('remove bigmap res=',k);
                    cc.textureCache.removeTextureForKey( k );
                    delete this._tileTexture[k];
                }
            }
            this._tileTexture = null;
            this.tileJson = null;
            this.event.emit('exit');
            this.event.removeAllListeners();
            this.event = null;
        },
    });

})();


