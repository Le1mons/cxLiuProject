(function(){
    /*
    var map = M = new X.BigMap({
        width:640,
        height:1136,
        debug:true,
        tileJsonFile:'bigmap/xpetmap.json',
        resLists:[],
        initGraph:true,
        tileOutOfViewer:'remove',
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
         * data.tileJsonFile = 瓦片地图json文件，由astarmapeditor生成
         * */
        ctor : function(data){
            this._super();

            this.data = cc.mixin({
                'debug':true,
                'autoRelease' : true, //地图被删除时，是否自动释放资源
                'tileOutOfViewer' : 'hide', //瓦片在屏幕外时，hide还是remove
                'initGraph' : false, //是否初始化障碍物信息
            },data,true);

            this._jsonBaseName = cc.path.basename(data.tileJsonFile).replace('.json','');
            this._grid2Sprite = {};
            this._tileTexture = {};
            this.setClippingEnabled(true);

            if(data.backgroundColor){
                this.setBackGroundColor( data.backgroundColor );
                this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            }

            //主地图层，会在proload成功后，修改尺寸为配置尺寸
            var mapContent = this.mapContent = new ccui.Layout();
            mapContent.setAnchorPoint(0,0);
            this.addChild(mapContent);

            this.width = data.width;
            this.height = data.height;
            this.event = cc.EventEmitter.create(1000);
        },
        //初始化astar障碍物信息，diagonal=是否可以斜角寻路
        initGraph:function(diagonal){
            if(diagonal==null)diagonal=true;
            this.graph = new X.Graph(this.tileJson.Z, { diagonal: diagonal });
        },
        preload : function(callback){
            //加载资源
            var me = this;
            if(!me.data.tileJsonFile){
                cc.log('BigMap preload error : tileJsonFile is null');
                return;
            }
            X.loadPlist(me.data.resLists || [] ,function(){
                X.loadJSON(me.data.tileJsonFile,function(err,tileJson){
                    me.tileJson = tileJson;

                    //设置主地图尺寸
                    me.mapContent.width = tileJson.w;
                    me.mapContent.height = tileJson.h;

                    //一屏能显示的最多tile数量
                    me._showMaxTileX = Math.ceil(me.width / tileJson.tilew);
                    me._showMaxTileY = Math.ceil(me.height / tileJson.tileh);

                    //绘制略缩图
                    var _spriteFile = 'bigmap/tile/'+ me._jsonBaseName + '_mini.png';
                    var sprite = new cc.Sprite(_spriteFile);
                    sprite.attr({
                        x:0,
                        y:0,
                        scale:10,
                        anchorX:0,
                        anchorY:0,
                        zIndex : 0,
                    });
                    me.mapContent.addChild(sprite);
                    //记录所有用到的瓦片地图资源
                    me._tileTexture[_spriteFile] = 1;
                    //开始检测绘制情况
                    me.scheduleUpdate();
                    //设置寻路障碍信息
                    if(me.data.initGraph){
                        me.initGraph();
                    }

                    callback && callback.call(me);
                    me.event.emit('preloadSuccess');

                });
            });
        },
        //寻路
        //closest = 指定如果目标不可到达，是否返回最接近的节点的路径，默认true
        findWay : function(fromGrid,toGrid,closest){
            var me = this;
            if(closest==null)closest=true;
            var res = X.astar.search(
                me.graph,
                me.graph.grid[fromGrid.gy][fromGrid.gx],
                me.graph.grid[toGrid.gy][toGrid.gx],
                {closest : closest }
            );
            return res;
        },
        onExit : function(){
            this._super();

            if(this.data.autoRelease){
                //释放瓦片地图资源
                for(var k in this._tileTexture){
                    this.data.debug && cc.log('cc.textureCache.removeTextureForKey',k);
                    cc.textureCache.removeTextureForKey( k );
                    delete this._tileTexture[k];
                }
            }

            this._grid2Sprite = null;
            this._tileTexture = null;
            this.tileJson = null;
            this.event.emit('exit');
            this.event.removeAllListeners();
            this.event = null;

        },
        update : function(){
            var me = this;
            me.event.emit('update');

            if(me.tileJson){
                //当发生了一定的偏移量时，重绘地图
                var _needDrawX = me.tileJson.tilew*0.5,
                    _needDrawY = me.tileJson.tileh*0.5;

                if(me._lastCheckX==null || me._lastCheckY==null ||  Math.abs(me._lastCheckX-me.mapContent.x) > _needDrawX || Math.abs(me._lastCheckY-me.mapContent.y) > _needDrawY ) {
                    me.drawTileMap();
                    me._lastCheckX = me.mapContent.x;
                    me._lastCheckY = me.mapContent.y;
                }
            }
        },
        follow : function(target){
            var me = this;
            me.unfollow();
            me._followAction = me.mapContent.runAction(cc.follow(target, cc.rect(0, 0, me.mapContent.width , me.mapContent.height )));
        },
        unfollow : function(){
            var me = this;
            if(me._followAction){
                me.mapContent.stopAction(me._followAction);
                delete me._followAction;
            }
        },
        //显示网格
        showGrid : function(type){
            var me = this;
            if(type==null)type='grid';
            var draw = cc.DrawNode.create();
            me.mapContent.addChild(draw,5);

            for(var i = 0;i< me.mapContent.width ;i+=me.tileJson[type+'w']){
                draw.drawSegment(cc.p(i, 0), cc.p(i, me.mapContent.height), 1, cc.color(1, 1, 1));
            }
            for(var i = 0;i< me.mapContent.height ;i+=me.tileJson[type+'h']){
                draw.drawSegment(cc.p(0, i), cc.p(me.mapContent.width, i), 2, cc.color(1, 1, 1));
            }
        },
        /*
         cocos坐标转grid坐标
         grid坐标为左上0,0，与cocos不一致，需要转换
         gy,gx
         0,0  0,1  0,2
         1,0  1,1  1,2
         */
        positionToGridOrTile : function(ccp,type){
            var me = this;
            var gridY = (me.mapContent.height - ccp.y);
            var gy = parseInt(gridY/me.tileJson[type+'h']),
                gx = parseInt(ccp.x/me.tileJson[type+'w']);
            return {gx:gx,gy:gy}
        },
        positionToGrid : function(ccp){
            return this.positionToGridOrTile(ccp,'grid');
        },
        positionToTile : function(ccp){
            return this.positionToGridOrTile(ccp,'tile');
        },
        tileToPosition : function(tile){
            var me = this;
            var x = parseInt(tile.gx * me.tileJson.tilew + me.tileJson.tilew*.5, 10);
            var y = parseInt(tile.gy * me.tileJson.tileh + me.tileJson.tileh*.5, 10);
            return cc.p(x,me.mapContent.height-y);
        },
        //重绘可视区域内的瓦片地图
        drawTileMap : function(){
            var me = this;
            me.data.debug && cc.log('drawTileMap...');
            //地图内容最左下点的tile信息
            var blTile = me.positionToTile( cc.p(me.mapContent.x * -1,me.mapContent.y*-1 ) );

            var _needDraw = {};
            for(var gx_s = blTile.gx - 1,gx_i= gx_s ; gx_i <= gx_s+me._showMaxTileX+1 ; gx_i++ ){
                //跳过范围外
                if(gx_i<0)continue;
                if(gx_i>=me.tileJson.tilenumw)continue;

                for(var gy_s=blTile.gy-me._showMaxTileY,gy_i= gy_s ; gy_i <= gy_s + me._showMaxTileY+1 ; gy_i++ ){
                    //跳过范围外
                    if(gy_i<0)continue;
                    if(gy_i>=me.tileJson.tilenumh)continue;

                    var _key = gy_i+'_'+gx_i;
                    if(!me._grid2Sprite[_key]){
                        var sprite = new cc.Sprite();
                        var _pos = me.tileToPosition({gx:gx_i,gy:gy_i});
                        sprite.setPosition(_pos);
                        sprite.zIndex = 1;
                        me.mapContent.addChild(sprite);

                        var _spriteFile = 'bigmap/tile/'+ me._jsonBaseName + '_' + _key +'.png',
                            _texture = cc.textureCache.getTextureForKey(_spriteFile);
                        //记录所有使用到的纹理列表
                        me._tileTexture[_spriteFile] = 1;

                        if(_texture){
                            sprite.initWithTexture(_texture);
                        }else{
                            me.data.debug && cc.log('addImageAsync for map sprite',_spriteFile);
                            cc.textureCache.addImageAsync(_spriteFile, function(texture){
                                if (texture instanceof cc.Texture2D) {
                                    cc.isNode(this) && this.initWithTexture(texture);
                                }
                            }, sprite);
                        }
                        me._grid2Sprite[_key] = sprite;
                    }

                    me._grid2Sprite[_key].show();
                    _needDraw[_key] = 1;
                }
            }

            //去除不需要绘制的资源
            for(var k in me._grid2Sprite){
                if( !_needDraw[k] ){
                    if(me.data.tileOutOfViewer=='hide'){
                        me.data.debug && cc.log('hide map sprite',k);
                        me._grid2Sprite[k].hide();
                    }else if(me.data.tileOutOfViewer=='remove'){
                        me.data.debug && cc.log('remove map sprite',k);
                        me._grid2Sprite[k].removeFromParent();
                        cc.textureCache.removeTextureForKey( k );
                        delete me._grid2Sprite[k];
                        delete me._tileTexture[k];
                    }
                }
            }
            _needDraw = null;
        }
    });

})();