;(function(){

    X.defaultViewConf = {
        "action": false, //不加载动作
        "releaseRes": true, //自动释放同名的资源
        "pixel": cc.Texture2D.PIXEL_FORMAT_RGBA8888, //RGBA8888
    };

    X.defaultRichTextConf = {
        size: 20,
        lineHeight: 24,
        colorFunc: function () {
            return G.gc.COLOR.n5;
        },
        // color:'#f6ebcd' //常态文本内容颜色 n5
    };

    var _viewCache = {};
	var _viewCount = {};
    X.viewCache = {
        getViewFromCache : function(_id,reuseData){
            //从缓存中获取一个view，没有时候返回null
            if( _viewCache[_id] && _viewCache[_id].length > 0){
                var _view = _viewCache[_id].pop();
                if (_id != 'ani_dianji.json') {
                    cc.log('从缓存中显示视图',_id,_view._json);
                }
                if(_view.getParent())_view.removeFromParent();

                if(_view.action){
                    _view.runAction(_view.action);
                }
                _view.reuse && _view.reuse.apply(_view,reuseData||[]);
                _view.onShow && _view.onShow();
                return _view;
            }
        },
        getView : function(json,callback,conf){
            //获取一个view并缓存，如果不存在，则自动创建
            conf = conf || {};
            if(conf.cache==null)conf.cache = true;
            var _cacheView = this.getViewFromCache(json);
            if(_cacheView){
                callback && callback(_cacheView);
            }else{
                _cacheView = new X.bView(json,function(view){
                    callback && callback(view);
                },conf);
            }
            return _cacheView;
        },
        getViewByClass : function(cls,args,cacheid){
            var _id = 'viewClass' + cls.id;
            if(cacheid!=null){
                _id = cacheid;
            }

            var _cacheView = this.getViewFromCache(_id,args);
            if(_cacheView){
                return _cacheView;
            }else{
                var applyArgs = ([{}]).concat(args || []);

                cls.prototype.reWriteConf = {cache:_id,releaseRes:false};
                var f = Function.prototype.bind.apply(cls, applyArgs);
                var view = new f();
                return view;
            }
        },
        getViewCahceInfo : function(){
            return _viewCache;
        },
        pushView : function(view){
            //viewOnExit时，如果需要被缓存，则会退出回收池
            //cc.log('pushViewFromCache',view._json);
            var _cacheid = view._json;
            if(typeof(view._conf.cache)=='string'){
                _cacheid = view._conf.cache;
            }
            _viewCache[_cacheid] = _viewCache[_cacheid] || [];
            _viewCache[_cacheid].push(view);
        },
        getCacheSize : function(_id){
            if( _viewCache[_id] ){
                return _viewCache[_id].length;
            }else{
                return 0;
            }
        },
        releaseCache : function(target){
            //target=释放哪个target对应的view缓存，不传表示释放所有
            for(var _key in _viewCache){

                var _releaseKey;
                if(target!=null){
                    if(typeof(target)=='string'){
                        _releaseKey = target; //通过key释放
                    }else{
                        _releaseKey = 'viewClass' +target.id; //通过class释放
                    }
                }
                if(target==null || _releaseKey==_key){
                    var _views = _viewCache[_key];
                    cc.log('releaseViewFromCache',_key);
                    for(var i=0;i<_views.length;i++){
                        if(i==0){
                            _views[i].releaseRes = true;
                            _views[i].autoReleaseRes && _views[i].autoReleaseRes();
                        }
                        _views[i].action && _views[i].action.release();
                        _views[i].release();
                    }
                    _viewCache[_key] = [];
                    delete _viewCache[_key];
                }
            }
        }
    };

    cc.baseEvent.on('gameRestart',function(){
        X.viewCache.releaseCache();
    });

    X.bView = ccui.Layout.extend({
        ctor: function (json, callback, conf) {
            var me = this;
            this._super();
            me.setName('bview_'+ cc.path.mainFileName(json));
            me._json = json;
            me._callback = callback;

            //UI设计时，所有以 $ 结尾的控件，会自动以name为key，映射到view层的 nodes 字典中，方便代码中直接绑定代码逻辑
            me._nodes = {};
            Object.defineProperty(this, "nodes" , {
                get: function () {
                    if(!me.__firstAutoInitUI){
                        me.autoInitUI();
                        me.__firstAutoInitUI = true;
                    }
                    return me._nodes;
                }
            });

            me.event = cc.EventEmitter.create();
            //默认配置
            me._conf = cc.mixin({}, X.defaultViewConf, true);
            if (conf)cc.mixin(me._conf, conf, true);

            if(me._conf.autoFillSize==null)me._conf.autoFillSize = true;
            if(me._conf.autoCreate==null)me._conf.autoCreate = true;
            if(me._conf.preLoadRes==null)me._conf.preLoadRes = me.preLoadRes || [];

            if(me.reWriteConf)cc.mixin(me._conf, me.reWriteConf, true);

            if(me._conf.pixel=='4444')me._conf.pixel = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
            if(me._conf.pixel=='8888')me._conf.pixel = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
            if(me._conf.pixel=='565')me._conf.pixel = cc.Texture2D.PIXEL_FORMAT_RGB565;
            if(me._conf.pixel=='5A1')me._conf.pixel = cc.Texture2D.PIXEL_FORMAT_RGB5A1;

            //如果需要缓存，则不释放资源
            if(me._conf.cache){
                me._conf.releaseRes=false;
            }
            if(me._conf.autoCreate)me.create();

			if(!cc.sys.isNative){
            	if(me._conf.cache){
            		_viewCount[ me._json ] = _viewCount[ me._json ] || 1;
            		_viewCount[ me._json ]++;
            		if( _viewCount[ me._json ] > 10 ){
            			cc.warn('警告：累计创建了'+ _viewCount[ me._json ] + '个缓存的view：'+ me._json)
            		}
            	}
            }
        },
        create : function(){
            var me = this;
            me._create(function () {
                me._createSucc();
                me._callback && me._callback(me);
                changeAllNodesColor(me);
            });
        },
        _createSucc : function(){
            var me = this;

            if(me._conf.autoFillSize){
                if(cc.isNode(me.getParent())){
                    //创建成功时，如果已有父，则直接fillsize
                    me.fillSize();
                }else{
                    me.event.once('onEnterTransitionDidFinish',function(){
                        me._createSucc();
                    });
                    return;
                }
            }

            me.onOpen && me.onOpen();
            me.event && me.event.emit('opened');
            me.onShow && me.onShow();
            me.event && me.event.emit('showed');
        },
        getViewJson : function(){
            return this._json;  
        },
        onExit: function () {
            this.onRemove && this.onRemove();
            this.event && this.event.emit('remove');
            this._super();
            if (this._json != 'ani_dianji.json') {
                cc.log('view onExit', this._json);
            }


            this.autoReleaseRes && this.autoReleaseRes();
            this.event && this.event.removeAllListeners();

            this._nodes = {};
            delete this.__firstAutoInitUI;

            //cc.sys.garbageCollect();

            //cache有可能为bool型，此时回收池中会以json的文件名为key缓存
            //有可能为string型，此时会以该值为key缓存
            if(this._conf.cache){
                X.viewCache.pushView(this);
            }
            this.afterRemove && this.afterRemove();
        },
        autoInitUI : function(){
            return X.autoInitUI(this,'_nodes');
        },
        autoReleaseRes: function () {
            //简单释放资源，按照约定，frame用到的资源是 json同名的plist和png，这里只释放这2个资源，其他的需要手动处理
            //如果资源多于一张，则 json2，json3 ... 理论上不会超过3张，so，循环3次
            var me = this;
            if (!me._conf.releaseRes)return;

            var jsonName = this._json;

            for (var i = 0; i < 3; i++) {
                var _index = i == 0 ? "" : i;
                //如果纹理存在
                var oplist = cc.path.changeExtname(jsonName, _index + '.plist');
                var opng = cc.path.changeExtname(jsonName, _index + '.png');

                if (cc.textureCache.getTextureForKey(opng)) {
                    cc.log('自动释放资源=' + oplist);
                    cc.spriteFrameCache.removeSpriteFramesFromFile(oplist);
                    cc.textureCache.removeTextureForKey(opng);
                }
            }

            //cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS && cc.textureCache.getCachedTextureInfo && console.log(cc.textureCache.getCachedTextureInfo());
        },

        fillSize : function(size){
            //外框自适应父控件
            var _parent = this.getParent();
            if(size){
                this.setContentSize( size );
                this.ui.setContentSize( this.getContentSize() );
            }else if( cc.isNode(_parent) && !(_parent instanceof X.bScene) ){
                this.setContentSize( _parent.getContentSize() );
                this.ui.setContentSize( this.getContentSize() );
            }
            ccui.helper.doLayout( this.ui );
        },

        onEnterTransitionDidFinish : function(){
            var me = this;
            this._super();
            this.event.emit('onEnterTransitionDidFinish');
        },
        ajax : function(code, args, callbackDict,showLoading,emitData){
            var me = this;
            return G.ajax.ajaxWithNode(code, args, callbackDict,showLoading,emitData,me);
        },

        //将data数据，渲染到默认的nodes节点，也可以通过第2个参数，指定其他nodes
        render : function(data,nodes){
            var me = this;
            if(nodes==null)nodes=me.nodes;
            return X.render.call(me,data,nodes);
        },

        _create: function (callback) {
            var me = this;

            if (this._json != 'ani_dianji.json') {
                cc.log('创建视图', this._json);
            }

            X.loadPlist(me._conf.preLoadRes, function () {
                cc.Texture2D.defaultPixelFormat = me._conf.pixel;
                X.ccui(me._json, function (uiLoader) {
                    cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

                    if(!cc.isNode(me))return;

                    me.ui = uiLoader.node;
                    me.action = uiLoader.action;

                    if (me.action) {
                        me.ui.runAction(me.action);
                        me.action.gotoFrameAndPause(0);
                    }
                    me.addChild(me.ui);

                    //如果需要缓存
                    if(me._conf.cache){
                        me.retain();
                        me.action && me.action.retain();
                    }

                    callback && callback();
                }, me._conf)
            });
        },

        dumpUI: function () {
            return X.dumpUI(this);
        }
    });
})();
