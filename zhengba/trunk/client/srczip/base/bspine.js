(function(){

var customSkeletonAnimation = sp.SkeletonAnimation.extend({
    ctor:function () {
        this._super.apply(this, arguments);
    },
    onEnter : function(){
    	this._super.apply(this, arguments);
    },
    onExit : function(){
    	this.onWillRemove && this.onWillRemove();
    	this._super.apply(this, arguments);
    }
});

X.spineNode = function(json,atlas,callback){
	
	function _call(){
		var node = new customSkeletonAnimation(json, atlas);
		
		node.runAni = function(trackIndex,name,loop){
			if(!cc.sys.isNative){
				// node.setDebugBonesEnabled(true);
				cc.log('浏览器中spine runAni动画时部分不兼容，请使用exe调试');
			}
			this.clearTracks();
			node.setAnimation(trackIndex,name,loop);
			node._curAniName = name;
		};
		node.addAni = function(trackIndex,name,loop,delay){
			node.addAnimation(trackIndex,name,loop,delay);
		};
		node.stopAni = function(trackIndex){
			node.clearTrack(trackIndex);
		};
		node.stopAllAni = function(trackIndex){
			node.setEndListener(null);
			node.clearTracks();
		};
		
		callback && callback(node);
	}

	if(cc.sys.isNative){
		_call();
		return;
	}

	cc.loader.load(atlas,function (count,result,loadedCount) {
		result = result[0];
		if(result!=""){
			var rss = result.split("\n");
			var pngs = [];
			var dirName = cc.path.dirname(json);
			
			for(var i=0;i<rss.length;i++){
				if(rss[i].indexOf('.png')!=-1){
					pngs.push( dirName + '/'+ rss[i] );
				}
			}
			pngs.push(json);
			cc.loader.load(pngs,function(count,result,loadedCount){
				_call();
			});
		}
	});
};

X.spine = {
	_cache : {},
	clearAllCache: function () {
		var cache = X.spine._cache;
		for (var key in cache) {
			var arr = cache[key];
			for (var node of arr) {
				cc.isNode(node) && node.release && node.release();
			}
		}
		X.spine._cache = {};
	},
    show: function (conf) {
        //动画缓存
        var me = this;
        conf = conf || {};

		//风暴特有的逻辑，对配置里的那几个逻辑，在特定的版本下，需要重新显示new目录下的
		if(G.gc && G.gc.changeModels && G.gc.ifChangeModels()){
			for(var __i=0;__i<G.gc.changeModels.length;__i++){
				if(conf.json == ('spine/'+ G.gc.changeModels[__i] +'.json') ){
					conf.json = "new"+ conf.json;
					break;
				}
			}
		}

        
        if (conf.autoRemove == null) conf.autoRemove = true;
        if(conf.atlas == null) conf.atlas = cc.path.changeExtname(conf.json,'.atlas');

		if(!conf.noRelease){
			G.DATA.USED_SKILLANI = G.DATA.USED_SKILLANI || {};
			G.DATA.USED_SKILLANI[conf.json.replace('.json','')] = 'spine';
		}
		
		//只有打包后才走缓存逻辑，web下异常
        if (cc.sys.isNative && me._cache[conf.json] && me._cache[conf.json].length > 0 && !conf.noRelease) {
        	var node =  me._cache[conf.json].pop();
        	cc.log('fromcache...');
        	me._created(node, conf);
        	node.release();
        } else {
        	cc.log('fromcreate...');
        	X.spineNode(conf.json,conf.atlas,function(node){
        		me._created(node, conf);
        	});
        }
    },
    _created: function (node, conf) {
    	var me = this;
        var _parentSize;
        node.conf = conf;

		changeAllNodesColor(node);
        
        if (!conf.addTo) {
            conf.addTo = cc.director.getRunningScene();
            _parentSize = cc.director.getWinSize();
        } else {
            _parentSize = conf.addTo.getContentSize();
        }
        if (!cc.isNode(node)) return null;
        node.x = conf.x != null ? conf.x : _parentSize.width / 2;
        node.y = conf.y != null ? conf.y : _parentSize.height / 2;
        node.zIndex = conf.z != null ? conf.z : 100;
		
		if(conf.onend || conf.autoRemove){
			node.setEndListener(function(traceIndex){
				cc.log("spine _created setEndListener.", traceIndex);
				conf.onend && conf.onend(node);
				if(conf.autoRemove){
					cc.callLater(function(){
						 node.removeFromParent();
					});
				}
			});
		}else{
			node.setEndListener(null);
		}
		
//		node.setCompleteListener(function(traceIndex, loopCount){
//			cc.log("spine _created setCompleteListener.", loopCount);
//			conf.onLooped && conf.onLooped(node, traceIndex, loopCount);
//		});
		
		if(conf.onkey){
			node.setEventListener(function(traceIndex, event){
				if(event.data.name.length>0){
					conf.onkey && conf.onkey(node, event.data.name, event);
				}
	            cc.log( traceIndex + " event: %s, %d, %f, %s",event.data.name, event.intValue, event.floatValue, event.stringValue);
	        });
		}else{
			node.setEventListener(null);
		}
		
		
        node.onWillRemove = function(){
        	if(conf.cache && cc.sys.isNative){
        		me._cache[conf.json] = me._cache[conf.json] || [];
        		me._cache[conf.json].push(node);
//      		node.setEndListener(function(){});
//      		node.setCompleteListener(function(){});
//      		node.setEventListener(function(){});
				node.setEndListener(null);
    			node.setCompleteListener(null);
    			node.setEventListener(null);
        			
				node.clearTracks();
        		node.retain();
        	}
        };
        
        node.clearTracks();
        conf.addTo.addChild(node);
        conf.onload && conf.onload(node);
        return node;
    }
};

	
})();