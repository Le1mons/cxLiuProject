(function(){
    /*
     每个UI会广播以下事件
     open = 即将打开
     aniShow = 如果有进场动画，动画完毕
     willshow = 即将显示
     show = 显示完成
     focus = 获得焦点
     blur = 失去焦点
     willHide = 如果有出场动画，即将开始出场动画
     willClose = 即将关闭
     close = 被关闭

     可通过 ui.on|once('open',function(){
     do someting..

     })
     来绑定监听事件
     */

    X.uiMana = {
        //检测窗口是否处于最上方
        checkOnTopFun : function(){
            var z=0,frameid;

            //获取当前最顶层的frameID
            for(var k in G.openingFrame){
                if(G.openingFrame[k] > z && G.frame[k].listenFocus){
                    z = G.openingFrame[k];
                    frameid = k;
                }
            }

            if(frameid && G.frame[frameid]) {
                X.topFrameID = frameid;
                G.frame[frameid].isTop = true;
                G.frame[frameid].isShow && G.frame[frameid].emit('focus');
            }

            for(var k in G.openingFrame){
                if(frameid != k && G.frame[k] && G.frame[k].listenFocus){
                    G.frame[k].emit('blur');
                    G.frame[k].isTop = false;
                }
            }
        },
        //关闭所有Frame
        closeAllFrame : function(clearEvent, filterFun, isRestart){
            //按zIndex顺序，把frame从上往下逐一移除
            var arr= this.getOpenFrameOrderByZindex();
            for(var i=0;i<arr.length;i++){
                var k = arr[i].frameid;
                if(isRestart) {
                    if(clearEvent){
                        G.frame[k].event && G.frame[k].event.removeAllListeners();
                    }
                    G.frame[k].remove(false);
                } else {
                    if(filterFun==null || filterFun(G.frame[  arr[i].frameid  ] )){
                        if(G.frame.tanxianFight.isShow) {
                            if(k.indexOf("tanxian") == -1) {
                                if(clearEvent){
                                    G.frame[k].event && G.frame[k].event.removeAllListeners();
                                }
                                G.frame[k].remove(false);
                            }
                        } else {
                            if(clearEvent){
                                G.frame[k].event && G.frame[k].event.removeAllListeners();
                            }
                            G.frame[k].remove(false);
                        }
                    }
                }
            }
        },
        //获取所有frame中最大的zindex
        getMaxZOrder : function(){
            var z=[0];
            for(var k in G.openingFrame){
                if(G.frame[k] && G.frame[k].ui){
                    z.push(G.frame[k].ui.logicZindex || G.frame[k].ui.zIndex);
                }
            }
            var maxz = Math.max.apply(null,z);
            return maxz;
        },

        //显示了一个全屏ui
        fullScreenShow : function(frame){
            //获取当前最顶层的frameID
            cc.log('显示了1个全屏UI',frame.ID());

            var frames = this.getOpenFrameOrderByZindex();
            for(var k in G.openingFrame){
                if(k != frames[0].frameid && G.frame[k].fullScreen && k!=frame.ID()){
                    cc.log('自动隐藏被遮盖的UI',k);
                    G.frame[k].visibleWithOutEmit(false);
                }
            }
            G.event.emit('fullScreenShow',frame.ID());
            G.event.emit('fullScreenChange',frame.ID());
        },

        //隐藏了一个全屏UI
        fullScreenHide : function(frame){
            var z=0,frameid;
            cc.log('关闭了1个全屏UI',frame.ID());

            //获取当前最顶层的frameID
            for(var k in G.openingFrame){
                if(G.openingFrame[k] > z && G.frame[k].fullScreen){
                    z = G.openingFrame[k];
                    frameid = k;
                }
            }
            if(frameid){
                cc.log('自动显示被遮盖的UI',frameid);
                G.frame[frameid].visibleWithOutEmit(true);
            }
            G.event.emit('fullScreenHide',frameid);
            G.event.emit('fullScreenChange',frameid);
        },

        //by = asc || desc，默认 desc
        getOpenFrameOrderByZindex : function(by){
            var arr=[];
            //按zIndex顺序，把frame从上往下逐一移除
            for(var k in G.openingFrame){
                arr.push({"frameid":k,"zIndex":G.openingFrame[k]});
            }
            arr.sort(function (a, b) {
                if(by=='asc'){
                    return a.zIndex-b.zIndex;
                }else{
                    return b.zIndex-a.zIndex;
                }
            });
            return arr;
        }

    };

    X.bUi = cc.Class.extend({
        ctor: function(json,id, conf){
            var me = this;
            this._json = json;
            this._id = id;
            this._conf = conf || {};
            if(this.listenFocus==null)this.listenFocus = true; //是否参与和监听focus blur逻辑
            if(this.fullScreen==null)this.fullScreen = false; //是否全屏窗体，true时，将会在onshow时，hide掉其他ui
            if(this.singleGroup==null)this.singleGroup = null; //互斥组，同组ui只会存在一个
            this._attr = {}; //frame永久属性，不会因为remove被清理
            //初始属性
            this._defaultAttr = {'_defaultAttr':true};

            G.openingFrame = G.openingFrame || {};

            Object.defineProperty(me, "nodes" , {
                get: function () {
                    if(me.ui){
                        return me.ui.nodes;
                    }else{
                        cc.log('ui不存在时调用了bUi.nodes');
                    }
                }
            });

            this.event = cc.EventEmitter.create();
            this.event.setMaxListeners(200);
        },
        ID : function(){
            return this._id;
        },
        attr : function(k,v){
            if(v==null){
                return this._attr[k];
            }else{
                this._attr[k] = v;
                return this;
            }
        },
        delAttr : function(k){
            delete this._attr[k];
            return this;
        },
        //设置父窗口ID
        parent : function(id){
            this._parent = id;
            return this;
        },
        getParent : function(){
            return this._parent;
        },
        setParentVisible : function(v){
            if(this._parent && G.frame[this._parent]){
                cc.log('设置父UI的显隐状态',this._parent,v);
                G.frame[this._parent].visible(v);
            }
        },
        //可见性，仅设置可见性，不调用onshow onRemove等方法
        visible : function(v){
            this.visibleWithOutEmit(v);
            this.event.emit('visibleChange',v);
        },
        visibleWithOutEmit : function(v){
            cc.sys.isObjectValid(this.ui) && this.ui.setVisible(v);
        },
        //外接数据，会在frame关闭时清空
        data : function(d){
            if(d!=null){
                this._extData = d;
                return this;
            }else{
                return this._extData;
            }
        },
        /*
         this.ajax('xxxx',[],function(str,data){
            //这里的回调会在有UI时才进入
         });

         this.ajax('xxxx',[],{
             data:function(str,data){
                //无论是否有UI，都会先进入
             },
             ui : function(str,data){
                //如果有UI，会其次进入
             }
         });
        * */
        ajax : function(code, args, callbackDict,showLoading,emitData){
            var me = this;
            if (cc.isNode(me.ui)) {
                return G.ajax.ajaxWithNode(code, args, callbackDict,showLoading,emitData,me.ui);
            } else {
                return G.ajax.send(code, args, callbackDict,showLoading,emitData);
            }
        },
        _uiInited : function(state){
            //state=1 - 新创建的ui  state=2 - 已存在的UI，只是显示出来
            var me = this;
            me.isShow = true;

            //隐藏父窗体
            if(state==1 && me.ui.action && me.ui.action.isAnimationInfoExists('in') ){
                X.setLockLayer(me.ui, true);
                var isUnlock = false;
                var endIndex = me.ui.action.getAnimationInfo('in').endIndex;
                me.ui.action.setLastFrameCallFunc(function(){
                    if(endIndex == me.ui.action.getCurrentFrame()){
                        me.ui.action.pause();
                        me.ui.setTimeout(function() {
                            me.fullScreen && X.uiMana.fullScreenShow(me);
                            me.onAniShow && me.onAniShow();
                            me.emit('aniShow');
                            me.setParentVisible(false);
                            !isUnlock && X.setLockLayer(me.ui, false);
                            isUnlock = true;
                        },0);
                    }
                });
                me.ui.setTimeout(function () {
                    !isUnlock && X.setLockLayer(me.ui, false);
                    isUnlock = true;
                }, 600);
            }else{
                me.ui.setTimeout(function() {
                    me.fullScreen && X.uiMana.fullScreenShow(me);
                    me.onAniShow && me.onAniShow();
                    me.emit('aniShow');
                    me.setParentVisible(false);
                },0);
            }

            me.ui.setVisible(true);
            me.goToTop();

            me.emit('willShow');
            me.onShow && me.onShow();
            me.emit('show');

            if (me.singleGroup && me.singleGroup != "") {
                //如果有唯一组标示（互斥frame)
                X.uiMana.closeAllFrame(true, function (f) {
                    if (f.ID() != me.ID() && f.singleGroup == me.singleGroup) {
                        return true;
                    }
                });
                G.event.emit('showSingleGroup', me.singleGroup);
            }

            X.uiMana.checkOnTopFun();
            G.event.emit('uiChange',{act:"show",frameid:me.ID()});
        },
        _viewCreated : function(view){
            var me = this;
            me.__uiIniting = null;
            delete me.__uiIniting;

            view.event.on('remove',function(){
                me._viewRemove();
            });
            me.ui = view;
            //方便使用统一的me.nodes映射调用
            me.ui.setName('bui_'+me.ID());
            me.action = me.ui.action;

            (me._conf.appendTo || cc.director.getRunningScene()).addChild(me.ui);

            if(me.ui.action){
                //如果有动画的话，播放in入场动画
                me.ui.action.isAnimationInfoExists('in') && me.ui.action.play('in',false);
            }
            for(var k in me){
                me._defaultAttr[k] = true;
            }
            me.fillSize();
            me.onOpen && me.onOpen();
            me.emit('open');

            me._uiInited(1);
        },
        show : function(conf){
            var me = this;
            if(conf==null)conf={};
            cc.mixin(me._conf, conf, true);

            if(me.__uiIniting)return;

            me.beforeShow && me.beforeShow();
            cc.log('即将显示1个UI',this.ID());
            G.openingFrame[me.ID()] = 1;

            // if(me.singleGroup && me.singleGroup!=""){
            //     //如果有唯一组标示（互斥frame)
            //     X.uiMana.closeAllFrame(true, function(f){
            //         if(f.ID() != me.ID() && f.singleGroup == me.singleGroup ){
            //             return true;
            //         }
            //     });
            //     G.event.emit('showSingleGroup',me.singleGroup);
            // }

            if(!me.ui){
                //web下防止多次加载
                me.__uiIniting = true;
                me._conf.autoFillSize = false;
                if(me.preLoadRes) me._conf.preLoadRes = me._conf.preLoadRes || me.preLoadRes;

                if(me._conf.cache){
                    X.viewCache.getView( me._json , function(view){
                        me._viewCreated(view);
                    } ,me._conf );
                }else{
                    new X.bView( me._json , function(view){
                        me._viewCreated(view);
                    } ,me._conf );
                }
            }else{
                me._uiInited(2);
            }
        },
        fillSize : function(){
            //外框自适应屏幕尺寸
            this.ui.fillSize(cc.director.getWinSize());
        },
        goToTop : function(){
            //置于顶端
            var maxZ = X.uiMana.getMaxZOrder();
            this.ui.zIndex = maxZ+5;
            this.ui.logicZindex = this.ui.zIndex;
            G.openingFrame[this.ID()] = this.ui.zIndex;
        },

        //监听事件
        on : function(funType,fun){
            this.event && this.event.on(funType,fun);
            return this;
        },
        onnp : function(funType,fun,key){
            this.event && this.event.onnp(funType,fun,key);
            return this;
        },
        once : function(funType,fun){
            this.event && this.event.once(funType,fun);
            return this;
        },
        emit : function(type,args){
            this.event && this.event.emit(type,args);
            return this;
        },

        //删除该frame
        remove : function(showAni){
            var me = this;

            var conf = {showAni:true};
            if(showAni!=null)conf['showAni'] = showAni;

            me.setParentVisible(true);
            if (me.releaseRes && me.releaseRes.length) {
                cc.each(me.releaseRes, function (name) {
                    X.releaseResources(name);
                });
            }
            if (me.releaseRes1 && me.releaseRes1.length) {
                cc.each(me.releaseRes1, function (name) {
                    X.releaseTexture(name);
                });
            }

            if(conf['showAni'] && me.ui && me.ui.action && me.ui.action.isAnimationInfoExists('out')){
                if(me._removing)return;

                me._removing = true;
                var endIndex = me.ui.action.getAnimationInfo('out').endIndex;
                me.ui.action.setLastFrameCallFunc(function(){
                    if(endIndex == me.ui.action.getCurrentFrame()){
                        me.ui.setTimeout(function(){
                            me._remove();
                        },10);
                    }
                });
                me.emit('willHide');
                me.ui.action.play('out',false);
            }else{
                me.emit('willHide');
                me._remove();
            }
        },

        _remove : function(){
            //删除
            var me = this;
            delete me._removing;
            if(!me.isShow)return;

            me.emit('willClose');
            console.log('remove='+me.ID());
            delete G.openingFrame[me.ID()];

            me.isShow = false;
            me.isTop = false;
            me.fullScreen && X.uiMana.fullScreenHide(me);

            me.onRemove && me.onRemove();
            me.onHide && me.onHide();
            cc.isNode(me.ui) && me.ui.removeFromParent();

            //if(cc.isNode(me.ui)){
            //    me.ui.runAction(cc.removeSelf());
            //}

            X.uiMana.checkOnTopFun();

            delete me.ui;
            delete me.action;
            delete this._extData;

            me.afterRemove && me.afterRemove();

            me.emit('close');
            //正常移除时，不清除绑定的事件
            //me.event && me.event.removeAllListeners();

            //删除非初始属性外的其他数据
            for(var k in me){
                if(!me._defaultAttr[k]){
                    me[k] = null;
                    delete me[k];
                }
            }

            G.event.emit('uiChange',{act:"remove",frameid:me.ID()});
        },

        //该frame的主view被删时触发
        _viewRemove : function(){
            var me = this;
            //view被删除了，但是opening里还存在，非正常调用remove关闭的窗口，如：cc.director.getRunningScene().removeAllChildren() 需要清理数据
            if(G.openingFrame[me.ID()]){
                cc.log('视图被非正常销毁',me.ID());
                delete G.openingFrame[me.ID()];
                delete this._extData;
                me.isShow = false;
                me.isTop = false;
                delete me.ui;
                delete me.action;
                me.event && me.event.removeAllListeners();
                //删除非初始属性外的其他数据
                for(var k in me){
                    if(!me._defaultAttr[k]){
                        me[k] = null;
                        delete me[k];
                    }
                }
                G.event.emit('uiChange',{act:"remove",frameid:me.ID()});
            }
        }
    });

})();
