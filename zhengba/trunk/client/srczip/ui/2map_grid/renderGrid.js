(function(){
    // 仅处理显示, 操作交给control
    G.class.renderGrid = G.class.mapObject.extend({
         extConf:{
            hexagon: {w:152, h:152, floor: 90},
            zIndex: {
                gridContent: 10,
                blackImg:15,
            }
         },
        ctor: function (data) {
            var me = this;
            data.width = data.map.tileJson.gridw;
            data.height = data.map.tileJson.gridh;
            me._super.apply(this,arguments);
            me.setControl(data);
            me.gridStatus = {};

            me.map.onEvent('mapTouch',function(pos){
                if(me.hitTest(pos)){
                    me.control.doEvent();
                }
            },this);
        },
        setControl: function(data){
            var me = this;
            // cc.log('setControl:', data);
            if (G.class[data.type]){
                me.control = new G.class[data.type](data, me);
            }else {
                me.control = new G.class.mapGrid1(data, me);

            }
            me.control.setBarrier();
        },
        onEnter: function(){
            var me = this;
            me._super.apply(this,arguments);
            me.renderGrid();
        },
        // 初次渲染 or 迷雾散开
        renderGrid: function(){
            var me = this;
            if(!X.isHavItem(me.data.custom)) return; // 空格子
            var fog = me.map.getFogStatus(me.data._id);
            if(me.gridStatus.fog == fog) return;
            me.gridStatus.fog = fog;
            if(cc.isNode(me.grayContent)) {
                me.refreshGray();
            }
            me.initGrid();
            me.initEvent();
            me.initTitle();
            // me.setVisible(!me.gridStatus.fog);
        },
        initGrid: function(){
            var me = this;
            if(!me.data.custom.floor) return;

            if(me.floorSprite){
                me.floorSprite.removeFromParent();
                delete me.floorSprite;
            }
            var _spriteFile = me.data.custom.floorImg;
            me.floorSprite = me.createSprite(_spriteFile);
            me.floorSprite.setPosition(me.width*0.5, me.height*0.5);
            me.addChild(me.floorSprite);

        },
        initTitle: function(){
            var me = this;
            if(me.titleSprite){
                me.titleSprite.removeFromParent();
                delete me.titleSprite;
            }
            if(!me.data.custom.eventTitleImg || !me.data.conf.typename) return;
            var posy = {
                "29":264,
                "30":264,
                "31":264,
                "32":264,
                "43":264,
                "26":300,
                "3":425,
                '16':215,
                '17':215,
                '18':215,
                '24':230,
                '21':250,
                '22':250,
                '23':250,
                '27':270,
            };
            var posx = {
                '16':70,
                '17':70,
                '18':70,

            };
            if(!cc.isNode(me.titleSprite)){
                var titleSprite = me.titleSprite = new ccui.Layout();
                titleSprite.setName('titleSprite');
                titleSprite.setAnchorPoint(0.5, 0.5);
                titleSprite.setPosition(85,posy[me.data.conf.typeid]||280);
                titleSprite.setContentSize(cc.size(100, 35));
                titleSprite.setTouchEnabled(false);
                titleSprite.setScale(1);
                var _spriteFile = me.data.custom.eventTitleImg;
                var sprite = new ccui.ImageView(_spriteFile,1);
                sprite.setPosition(0, 5);

                var label = new ccui.Text();
                label.setFontName(G.defaultFNT);
                label.setString(me.data.conf.typename.mingzi);
                label.setAnchorPoint(0.5, 0.5);
                label.setPosition(posx[me.data.conf.typeid]||60,0);
                label.setFontSize(18);
                label.setTextColor(cc.color('#fff9e6'));
                X.enableOutline(label,me.data.conf.typename.outline,2);
                me.titleSprite.addChild(sprite);
                me.titleSprite.addChild(label);
                me.addChild(me.titleSprite, 10000);
            }

        },
        initEvent: function(){
            var me = this;

            if(!cc.isNode(me.gridContent)){
                var gridContent = me.gridContent = new ccui.Layout();
                gridContent.setName('gridContent');
                gridContent.setAnchorPoint(0.5, 0.5);
                gridContent.setContentSize(cc.size(me.extConf.hexagon.w, me.extConf.hexagon.h));
                gridContent.setPosition(cc.p(me.width*0.5, me.extConf.hexagon.floor + me.extConf.hexagon.h*0.5));
                gridContent.setTouchEnabled(false);
                me.addChild(gridContent, me.extConf.zIndex.gridContent);
            }

            me._initEvent('init');
        },
        setMiWu:function(){
            var me =this;
            if (G.DATA.shiyuanzhanchang.miwu)return;
            //迷雾
            if(!cc.isNode(me.grayContent)){
                var grayContent = me.grayContent = new ccui.Layout();
                grayContent.setName('grayContent');
                grayContent.setAnchorPoint(0.5, 0.5);
                grayContent.setContentSize(cc.size(me.extConf.hexagon.w, me.extConf.hexagon.h));
                grayContent.setPosition(me.getPosition());
                grayContent.setTouchEnabled(false);
                grayContent.setScale(.5);
                var _spriteFile = 'ico/syzc/map_69.png';
                var sprite = me.createSprite(_spriteFile);
                sprite.setPosition(me.grayContent.width*0.5, me.grayContent.height*0.5+20);
                me.grayContent.addChild(sprite);
                me.map.mapContent.addChild(me.grayContent, 999999);
                me.map.allFogarr.push(me.grayContent);
                me.refreshGray();
            }
        },
        refreshGray:function(){
            var me = this;
            me.grayContent.setVisible(me.gridStatus.fog);
        },
        droopAni: function(callback){
            var me = this;
            if(!me.defaultPos){
                me.defaultPos = me.getPosition();
            }
            me.stopActionByTag(12313256);
            me.runActions([
                cc.moveTo(0.45, cc.p(me.defaultPos.x, me.defaultPos.y - 10)),
                cc.moveTo(0.18, me.defaultPos),
                cc.callFunc(function(){
                    callback && callback();
                })
            ],12313256);
        },
        createSprite: function(url){
            var me = this;
            var sprite = new cc.Sprite();

            var _spriteFile = url;
            // var _spriteFile = 'img/gezi.png';
            if (cc.sys.isNative) {
                // cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
                sprite.initWithFile(_spriteFile);
                // cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
            } else {
                var _texture = cc.textureCache.getTextureForKey(_spriteFile);
                if (_texture) {
                    sprite.initWithTexture(_texture);
                } else {
                    // me.data.debug && cc.log('addImageAsync for map sprite', _spriteFile);
                    cc.textureCache.addImageAsync(_spriteFile, function (texture) {
                        cc.isNode(this) && this.initWithFile(_spriteFile);
                    }, sprite);
                }
            }
            return sprite;
        },
        hitTest: function(touchPos){
            var me = this;
            if(me.data.custom == null) return false;
            if(me.gridStatus.fog && !G.DATA.shiyuanzhanchang.miwu) return false;
            var hexagon = me.extConf.hexagon;
            var pos = me.getPosition();
            var cx = pos.x, cy = pos.y + hexagon.floor*0.5;

            var __a = cc.p( cx - me.width*0.5, cy);
            var __b = cc.p( cx, cy + hexagon.h*0.5);
            var __c = cc.p( cx + me.width*0.5, __a.y);
            var __d = __c;
            var __e = cc.p( __b.x, cy - hexagon.h*0.5);
            var __f = __a;

            var top = X.inTriangle(__a, __b, __c, touchPos);
            var bottom = X.inTriangle(__d, __e, __f, touchPos);

            return top || bottom;
        },
        // 是否需要改变外观
        willChange: function(mapdata){
            var me = this;
            mapdata = mapdata || {};

            if(
                !mapdata.floor &&
                (!mapdata.typeid || mapdata.typeid == me.data.conf.typeid) && // 事件ID不变
                (!mapdata.fog || mapdata.fog == me.data.conf.fog) // 黑白状态不变
            ){
                // 无需更新外观
                return null;
            }
            return JSON.parse(JSON.stringify(me.data.conf));
        },
        changeData: function(what){
            var me = this;
            if(what.finish){
                var gridData = me.map.getGridData(me.data.gx, me.data.gy, me.data.idx);
                me.data.type = gridData.type;
                me.data.custom = gridData.custom;
                me.data.conf = gridData.conf;

                me.setControl(me.data);
                me.initGrid();
                me.initTitle();
                me.againRender();
            }
        },
        // changeBarrier: function(){
        //     data.barrier = '1';
        // },
        getStatus: function(){
            var me = this;
            return {
                // black: me.data.conf.black, // 黑夜
                fog: me.gridStatus.fog, // 迷雾
                // mask: me.gridStatus.mask // 迷雾状态下是否显示事件
            }
        }
    });
})();


