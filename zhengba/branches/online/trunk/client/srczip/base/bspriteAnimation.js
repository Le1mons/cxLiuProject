(function(){

    /*
     * 通过帧动画描述文件创建帧动画精灵
     * plist文件说明：https://blog.zengrong.net/post/2006.html
     * 本地可通过 cocosAnimation.py脚本操作cocostudio csd文件生成
     *
     *

     var ssss = new Date().getTime();
     for(var i=0;i<=500;i++) {
         var ss = new cc.SpriteAnimation();
         ss.randAct = function(){
             var act = X.arrayRand(['bei_daiji','bei_run','ce_daiji','ce_run','zheng_daji','zheng_run']);
                 this.play(act, false , function(){
                 this.randAct();
             });
         };
         ss.init('animation_nanzhu',ss.randAct);

         ss.x = X.rand(1,640);
         ss.y = X.rand(1,1136);

         ss.runActions([
             cc.moveBy(3, cc.p( X.rand(-300,300), X.rand(-500,500) )),
             cc.moveBy(3, cc.p( X.rand(-300,300), X.rand(-500,500) )).easing(cc.easeInOut(2.0)),
             [
                 cc.moveBy(3, cc.p( X.rand(-300,300), X.rand(-500,500)  )),
                 cc.rotateTo(3, 100,100),
                 cc.tintTo(3, 255,0,0)
             ],
             /!*cc.callFunc(function(){
             //cc.log('over....'); 回调
             }),*!/
             //cc.removeSelf()
         ]);

         me.addChild(ss);
     }
     var ee = new Date().getTime();
     cc.log('needtime %s',ee-ssss);

     */
    cc.SpriteAnimation = cc.Sprite.extend({
        ctor : function(plist,callback){
            this._super();
            if(plist || callback)return this.init(plist,callback);
        },
        init : function(plist,callback){
            var me = this;
            if(plist==null){
                cc.log("SpriteAnimation plist is null where init ");
                return;
            }
            this._animationTag = 9811547315;
            this._animationPlist = plist;

            //分析plist文件
            //loading 表示加载中，array表示plist的内容
            var _plistCache = G.DATA['SpriteAnimation' + plist];

            if(cc.isArray(_plistCache)){
                //已加载过
                callback && callback.call(me);
                return;
            }else if(_plistCache=='loading'){
                //正在预加载中
                G.event.once('SpriteAnimationPlistOnload'+plist,function(){
                    callback && callback.call(me);
                });
                return;
            }

            //开始预加载
            G.DATA['SpriteAnimation' + plist] = 'loading';

            X.load(plist+'.plist',function(err, results){
                if(err){
                    cc.log("SpriteAnimation Failed to load ", plist);
                    return;
                }
                //预加载纹理
                if (results[0] && results[0].properties && results[0].properties.spritesheets ){
                    var spritesheets = results[0].properties.spritesheets;

                    var _preloadRes = [];
                    for(var _i=0;_i<spritesheets.length;_i++){
                        _preloadRes.push( cc.path.changeExtname(spritesheets[_i],'.png') );
                        _preloadRes.push( spritesheets[_i] );
                    }
                    X.loadPlist( _preloadRes ,function(){
                        cc.animationCache.addAnimations(me._animationPlist+'.plist');
                        G.DATA['SpriteAnimation' + plist] = results;
                        G.event.emit('SpriteAnimationPlistOnload'+plist);
                        callback && callback.call(me);
                    });
                }
            });
        },
        onExit : function(){
            this._super();
            if(this.autoRelease){
                //自动释放资源
                var _cache = G.DATA['SpriteAnimation' + this._animationPlist];
                if(cc.isArray(_cache) && _cache[0] && _cache[0].properties && _cache[0].properties.spritesheets){
                    var spritesheets = _cache[0].properties.spritesheets;
                    //遍历plist文件中的spritesheets，释放plist精灵帧，释放同名png纹理
                    for(var _i=0;_i<spritesheets.length;_i++){
                        cc.spriteFrameCache.removeSpriteFramesFromFile(spritesheets[_i]);
                        var _png = cc.path.changeExtname(spritesheets[_i],'.png');
                        cc.textureCache.removeTextureForKey(_png);
                        cc.log('autoReleaseRes',spritesheets[_i],_png);
                    }
                    delete G.DATA['SpriteAnimation' + this._animationPlist];
                }
            }
        },
        getAnimationFromCache : function(name){
            var _allName = this._animationPlist+"_"+name;
            var act = cc.animationCache.getAnimation(_allName);
            if(act)act = cc.animate(act);
            return act;
        },
        play : function(name,repeat,callback){
            var act = this.getAnimationFromCache(name);
            if(!act){
                cc.log('animation has no actionName',this._animationPlist,name);
                return;
            }
            this.stopActionByTag(this._animationTag);
            if(repeat)act=cc.repeatForever(act);
            if(callback){
                if(!repeat){
                    act = cc.sequence(act, cc.callFunc(callback,this));
                }else{
                    cc.log('repeat ani can not callback when play',name,this._animationPlist);
                }
            }
            act.setTag(this._animationTag);
            return this.runAction(act);
        },
        getAnimationAction : function(){
            return this.getActionByTag(this._animationTag);
        }
    });

})();