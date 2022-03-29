/*
 var emitter = cc.EventEmitter.create();
 emitter.emit('my_event', args);
 emitter.on('my_event', function(args){
 ......
 });

 http://nodejs.org/api/events.html
 */
;(function(global){

    cc.isUndefined = function(arg) {
        return arg === void 0;
    };

    cc.isObject = function(arg) {
        return typeof arg === 'object' && arg !== null;
    };

    cc.isFunction = function(arg) {
        return typeof arg === 'function';
    };

    cc.isTimestamp = function(arg) {
        return cc.isNumber(arg) && new Date(arg*1000).getFullYear() != 1970;
    };

    function EventEmitter(maxListeners) {
        this._events = this._events || {};
        this._maxListeners = maxListeners || undefined;
    }

//  Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

//  By default EventEmitters will print a warning if more than 10 listeners are
//  added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;


//  Obviously not all Emitters should be limited to 10. This function allows
//  that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function(n) {
        if (isNaN(n) || n < 0 )
            throw TypeError('n must be a positive number');
        this._maxListeners = n;
        return this;
    };

    EventEmitter.prototype.emit = function(type) {
        var er, handler, len, args, i, listeners;
		
        if (!this._events)
            this._events = {};

        // If there is no 'error' event listener then throw.
        if (type === 'error' && !this._events.error) {
            er = arguments[1];
            if (er instanceof Error) {
                throw er; // Unhandled 'error' event
            } else {
                throw Error('Uncaught, unspecified "error" event.');
            }
            return false;
        }

        handler = this._events[type];

        if (cc.isUndefined(handler))
            return false;

        if (cc.isFunction(handler)) {
            var __caller = handler.__caller||this;
            switch (arguments.length) {
                // fast cases
                case 1:
                    handler.call(__caller);
                    break;
                case 2:
                    handler.call(__caller, arguments[1]);
                    break;
                case 3:
                    handler.call(__caller, arguments[1], arguments[2]);
                    break;
                // slower
                default:
                    len = arguments.length;
                    args = new Array(len - 1);
                    for (i = 1; i < len; i++)
                        args[i - 1] = arguments[i];
                    handler.apply(__caller, args);
            }
        } else if (cc.isObject(handler)) {
            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++)
                args[i - 1] = arguments[i];

            listeners = handler.slice();
            len = listeners.length;
            for (i = 0; i < len; i++){
                var __caller = listeners[i].__caller||this;
                listeners[i].apply(__caller, args);
            }

        }

        return true;
    };

    EventEmitter.prototype.addListener = function(type, listener,caller) {
        var m;

        if (!cc.isFunction(listener))
            throw TypeError('listener must be a function');

        listener.__caller = caller;

        if (!this._events)
            this._events = {};

        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener)
            this.emit('newListener', type,
                cc.isFunction(listener.listener) ?
                    listener.listener : listener);

        if (!this._events[type])
        // Optimize the case of one listener. Don't need the extra array object.
            this._events[type] = listener;
        else if (cc.isObject(this._events[type]))
        // If we've already got an array, just append.
            this._events[type].push(listener);
        else
        // Adding the second element, need to change to array.
            this._events[type] = [this._events[type], listener];

        // Check for listener leak
        if (cc.isObject(this._events[type]) && !this._events[type].warned) {
            var m;
            if (!cc.isUndefined(this._maxListeners)) {
                m = this._maxListeners;
            } else {
                m = EventEmitter.defaultMaxListeners;
            }

            if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
                console.trace();
            }
        }

        return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(type, listener,caller) {
        if (!cc.isFunction(listener))
            throw TypeError('listener must be a function');

        var fired = false;
        var that = this;
        function g() {
            that.removeListener(type, g);

            if (!fired) {
                fired = true;
                listener.apply(caller||that, arguments);
            }
        }

        g.listener = listener;
        this.on(type, g , caller);

        return this;
    };

    EventEmitter.prototype.onnp = function(type, listener,key) {
        if (!cc.isFunction(listener))
            throw TypeError('listener must be a function');
        if(!this._noRepeatKey)this._noRepeatKey={};

        var _key = key;
        if(_key==null)_key = type+"_"+listener.toString();

        if(this._noRepeatKey[_key]){
            this.removeListener(type,this._noRepeatKey[_key]);
        }
        this._noRepeatKey[_key] = listener;
        this.on(type, listener);
        return this;
    };

//  emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function(type, listener) {
        var list, position, length, i;

        if (!cc.isFunction(listener)){
            throw TypeError('listener must be a function');
            //return this;
        }


        if (!this._events || !this._events[type])
            return this;

        list = this._events[type];
        length = list.length;
        position = -1;

        if (list === listener ||
            (cc.isFunction(list.listener) && list.listener === listener)) {
            delete this._events[type];
            if (this._events.removeListener)
                this.emit('removeListener', type, listener);

        } else if (cc.isObject(list)) {
            for (i = length; i-- > 0;) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }

            if (position < 0)
                return this;

            if (list.length === 1) {
                list.length = 0;
                delete this._events[type];
            } else {
                list.splice(position, 1);
            }

            if (this._events.removeListener)
                this.emit('removeListener', type, listener);
        }

        return this;
    };

    EventEmitter.prototype.removeAllListeners = function(type) {
        var key, listeners;

        if (!this._events)
            return this;

        // not listening for removeListener, no need to emit
        if (!this._events.removeListener) {
            if (arguments.length === 0)
                this._events = {};
            else if (this._events[type])
                delete this._events[type];
            return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
            for (key in this._events) {
                if (key === 'removeListener') continue;
                this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = {};
            return this;
        }

        listeners = this._events[type];

        if (cc.isFunction(listeners)) {
            this.removeListener(type, listeners);
        } else if (Array.isArray(listeners)) {
            // LIFO order
            while (listeners.length)
                this.removeListener(type, listeners[listeners.length - 1]);
        }
        delete this._events[type];
        this._noRepeatKey = {};

        return this;
    };

    EventEmitter.prototype.listeners = function(type) {
        var ret;
        if (!this._events || !this._events[type])
            ret = [];
        else if (cc.isFunction(this._events[type]))
            ret = [this._events[type]];
        else
            ret = this._events[type].slice();
        return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
        var ret;
        if (!emitter._events || !emitter._events[type])
            ret = 0;
        else if (cc.isFunction(emitter._events[type]))
            ret = 1;
        else
            ret = emitter._events[type].length;
        return ret;
    };

    cc.EventEmitter = EventEmitter;
    cc.EventEmitter.create = function(maxListeners){
        return new EventEmitter(maxListeners);
    };

})(this);



;(function(global){
    global.C = {};//for cocos
    global.X = {};//for me
    global.window = global.window || {};

    C.ANCHOR = {
        1: cc.p(0,1)
        ,2: cc.p(0.5,1)
        ,3: cc.p(1,1)
        ,4: cc.p(0,0.5)
        ,5: cc.p(0.5,0.5)
        ,6: cc.p(1,0.5)
        ,7: cc.p(0,0)
        ,8: cc.p(0.5,0)
        ,9: cc.p(1,0)
    };
    //兼容调试器
    C.init = function(){};
    C.D = cc.director;

    Object.defineProperty(C, "WS" , {
        get: function () {
            return cc.director.getWinSize();
        }
    });

    if(cc.sys.platform==cc.sys.DESKTOP_BROWSER){
        cc . log = C . log= function(){
            console . log.apply( console, arguments );
        };
    }else if(cc.sys.isNative && cc.sys.os!=cc.sys.OS_WINDOWS){
        cc . log = C . log= function(){
            try {
                if(arguments.length==1 && (typeof(arguments[0])=='string' || typeof(arguments[0])=='number') ){
                    console . log( arguments[0] );
                }else{
                    var s = JSON.stringify(arguments);
                    console . log(s.substr(0,500));
                }
            }catch(e){
                console . log( arguments.toString() );
            }
        };
    }

    //将src对象上的属性copy到des对象上，默认不覆盖des对象原有属性，mixer为function可以选择属性的覆盖方式
    cc.mixin = function(des, src, mixer) {
        mixer = mixer || function(d, s){
                if(typeof d === 'undefined'){
                    return s;
                }
            };

        if(mixer == true){
            mixer = function(d, s){return s};
        }

        for (var i in src) {
            var v = mixer(des[i], src[i], i, des, src);
            if(typeof v !== 'undefined'){
                des[i] = v;
            }
        }

        return des;
    };

    cc.isNode = function(v){
    	if(v==null)return false;
    	return cc.sys.isObjectValid(v);
    };

    //广度优先搜索子节点
    cc.seekWidgetByName = function(root, name) {
        var children = root.getChildren();
        var len = children.length;
        for (var i=0;i<len;i++){
            if(children[i].getName() == name) {
                return children[i];
            }
        }

        for (var i=0;i<len;i++){
            var res = cc.seekWidgetByName(children[i],name);
            if(res)return res;
        }

        return null;
    };

    //timeout相关扩展
    cc.setTimer = function(target,callback,interval,repeat,delay){
        target.schedule(callback,interval/1000,repeat,delay/1000);
        return callback;
    };
    cc.clearTimer = function(target,callfun){
        return target.unschedule(callfun);
    };

    cc.callLater = function(callback){
    	if(!cc.sys.isNative){
			setTimeout(function(){
    			callback && callback();
			},0);
    	}else{
    		cc.director.getRunningScene().scheduleOnce(function(){
	            callback && callback();
	        });
    	}
        
    };

    //控制显影
    cc.Node.prototype.show = function(){
        this.setVisible(true);
        this.onNodeShow && this.onNodeShow();
    };
    cc.Node.prototype.hide = function(){
        this.setVisible(false);
        this.onNodeHide && this.onNodeHide();
    };
    //查找所有子里第一个等于v的node
    cc.Node.prototype.finds = function(v,ifcache){
        return X.findChild(this,v,ifcache);
    };
    cc.Node.prototype.eachChild = function(v,callfun){
        return X.eachChild(this,v,callfun);
    };

    //cocostudio嵌套的动画，默认播放会有bug，需要主动调用一次播放事件
    //跟UI约定，所有animation_****格式的节点，都是嵌套的动画节点
    cc.Node.prototype.playChildrenAnimation = function(){
        //this.eachChild("//animation_[STR]",function(node){
        //    var _action = node.getActionByTag(node.getTag());
        //    if(_action)_action.gotoFrameAndPlay(0,true);
        //});
        X.forEachChild(this,function(node){
            if(node.getName() && node.getName().startsWith('animation_')){
                var _action = node.getActionByTag(node.getTag());
                if(_action)_action.gotoFrameAndPlay(0,true);
            }
        });
    };

    //定时器相关操作 interval & delay都是毫秒单位
    cc.Node.prototype.setTimeout = function (callback, interval,repeat,delay) {
        var me = this;
        return cc.setTimer(this,function(){
            cc.callLater(function(){
                cc.isNode(me) && callback && callback.call(me);
            });
        },interval||0, repeat||0, delay||0);
    };
    cc.Node.prototype.setInterval = function (callback, interval) {
        var me = this;
        return cc.setTimer(this,function(){
            cc.callLater(function(){
                cc.isNode(me) && callback && callback.call(me);
            });
        },interval||0, cc.REPEAT_FOREVER, 0 );
    };
    cc.Node.prototype.clearAllTimers = function(){
        return this.unscheduleAllCallbacks();
    };
    cc.Node.prototype.clearInterval = cc.Node.prototype.clearTimeout = function (callfun) {
        return cc.clearTimer(this, callfun);
    };


    /*
     //从上往下逐一执行，如果是数组，则数组内的动作同时执行
     [
         cc.moveBy(3, cc.p(350, 0)),
         cc.moveBy(3, cc.p(100, 0)).easing(cc.easeInOut(2.0)),
         [
             cc.moveBy(3, cc.p(0, -500)),
             cc.rotateTo(3, 100,100),
             cc.tintTo(3, 255,0,0)
         ]
     ]

     * */
    cc.fmtActions= function(actios){
        if(!cc.isArray(actios)){
            return actios;
        }
        for(var i=0;i<=actios.length;i++){
            if( cc.isArray(actios[i]) ){
                //如果是数组，表示同时执行
                actios[i] = cc.Spawn.create.apply(cc.spawn, actios[i] );
            }
        }
        return cc.Sequence.create.apply(cc.Sequence, actios);
    };
    //执行动作链
    cc.Node.prototype.runActions = function(actions,tag){
        var action = cc.fmtActions(actions);
        if(tag)action.setTag(tag);
        return this.runAction(action);
    };


    //点击事件
    ccui.Widget.TOUCH_NOMOVE = 99;
    ccui.Widget.LONG_TOUCH = 98;
    var _nextClickTime = 0;
    /*
     conf={
     touchDelay = int 点击后锁定屏幕 x ms
     emitLongTouch = int || bool  存在该key，表示触发长按事件，如为int，则表示 int ms后触发长按
     }
     * */
    ccui.Widget.prototype.touch = function(fun,caller,conf){
        var me = this;
        var _startTime,_endTime,_longTouchFun;
        conf = conf || {};

        this._touchFunction = function(sender,type,fromwhere){
            var _now = new Date().getTime();
            if(type == ccui.Widget.TOUCH_ENDED && _now < _nextClickTime && fromwhere!='fromcode'){
                //如果处于锁定状态且不是代码触发的
                cc.log('delay to ',_nextClickTime);
                return;
            }
            fun.call(me._touchCaller,sender,type,fromwhere);
            if (!cc.sys.isObjectValid(sender)) return;

            if (type == ccui.Widget.TOUCH_BEGAN) {

                if(G.tiShenIng){
                    X.tiShenLog(sender,sender.getTouchBeganPosition());
                }

            	if(!cc.sys.isNative || sys.os.toLowerCase()=='windows'){
					cc.log('点击元素名：',this.getName() );
				}
            	
                _startTime = new Date().getTime();
				
                if(conf.emitLongTouch){
                    //如果需要触发长按
                    _longTouchFun = function(){
                        fun.call(me._touchCaller,sender,ccui.Widget.LONG_TOUCH);
                        _longTouchFun = null;
                    };
                    var _longTouchDeleyTime = 700;
                    if(typeof(conf.emitLongTouch)=='number')_longTouchDeleyTime=conf.emitLongTouch*1;

                    me.scheduleOnce(_longTouchFun, _longTouchDeleyTime/1000);
                }
            }else if (type == ccui.Widget.TOUCH_MOVED) {

            }else if (type == ccui.Widget.TOUCH_ENDED){
                if(this._touchDelayTime!=null ){
                    _nextClickTime = _now + this._touchDelayTime;
                }
                G.event.emit("TOUCH_ENDED", me, fromwhere);
                if(_longTouchFun){
                    //释放长按事件定时器
                    me.unschedule(_longTouchFun);
                    _longTouchFun = null;
                }

                var start = sender.getTouchBeganPosition();
                var end = sender.getTouchEndPosition();
                var dis = cc.pDistance(start,end);
                if(dis<10 || fromwhere=='fromcode'){
                    //触发无移动点击事件
                    fun.call(me._touchCaller,sender,ccui.Widget.TOUCH_NOMOVE);
                }
            }else if (type == ccui.Widget.TOUCH_CANCELED) {
                if(_longTouchFun){
                    //释放长按事件定时器
                    me.unschedule(_longTouchFun);
                    _longTouchFun = null;
                }
            }
        };
        this._touchDelayTime = conf.touchDelay;
        this._touchCaller = caller||this;
        this.addTouchEventListener(this._touchFunction,this._touchCaller);
    };
    //触发点击事件
    ccui.Widget.prototype.triggerTouch = function(type){
        if(!this._touchFunction)return;
        this._touchFunction(this,type,"fromcode");
    };
    ccui.Widget.prototype.click = function(fun,touchDelay){
        this.touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                fun(sender,type);
            }
        },this,{"touchDelay":touchDelay});
    };

    ccui.ScrollView.prototype.setAutoChildrenPos = function(c){
        var w = this.width; //总宽度
        var children = this.getChildren();
        if(children.length==0)return;

        if(c.order)children.sort(c.order);

        var cw = children[0].width,
            ch = children[0].height; //子元素尺寸
        var type = c.type||'fill';
        var maxrow = Math.ceil(children.length/c.rownum);
        var lineheight = c.lineheight || ch;

        var innerHeight = this.height;
        if(innerHeight < maxrow*lineheight) innerHeight = maxrow*lineheight;
        this.innerHeight = innerHeight;

        var _lineidx = 0;
        var _anchor = C.ANCHOR[1];

        for(var i=0;i<children.length;i++){
            children.autoSortIndex = i;
            if(type=='fill'){
                //填充满
                var sw = (w-cw)/(c.rownum-1);
                children[i].x = i%c.rownum*sw;
            }else if(type=='avg'){
                //平均排布
                var margin = w-cw*c.rownum,
                    smargin = margin/(c.rownum+1);
                children[i].x = (i%c.rownum)*cw + smargin* ((i%c.rownum)+1);
            }
            _lineidx = parseInt(i/c.rownum);
            children[i].setAnchorPoint(_anchor);
            children[i].y = innerHeight-_lineidx*lineheight;
        }
        c.callback && c.callback(children);
    };

    C.color = function(hex){
        if (hex.length == 4){
            hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        var c = cc.color(0,0,0,255);
        c.r = parseInt('0x'+hex.substr(1,2)) || 0;
        c.g = parseInt('0x'+hex.substr(3,2)) || 0;
        c.b = parseInt('0x'+hex.substr(5,2)) || 0;
        return c;
    };

    cc.baseEvent = cc.EventEmitter.create();
    cc.baseEvent.setMaxListeners(5000);

})(this);
