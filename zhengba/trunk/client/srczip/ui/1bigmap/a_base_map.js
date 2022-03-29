(function(){
    var _objectIndex = 0;
    G.class.baseMap = X.BigMap.extend({
        ctor : function(data,callback){
            var me = this;
            var _ndata = cc.mixin({
                // name:"bigmap",
                width:640,
                height:1136,
                debug:false,
                preloadResLists:[],
                initGraph:true, //格式化障碍物信息
                // grassWork:true, //草丛是否生效
                // backgroundColor:cc.color('#000000')
            },data,true);

            _ndata.name = _ndata.id;

            // this.ms = (new Date().getTime());
            this.obj = {};
            // this.minTimerNum = 100; //最小时钟
            // this.zIndexDelay = 0;
            // me.initWarMask();
            this._super(_ndata,callback);

            // this.event.on('roleMove',function(role){
            //     me.hideObjectIfNotInActiveArea(role);
            // });

            // X.releaseRes(['tanxian_kongqiqiang.plist','tanxian_kongqiqiang.png']);
        },
        // emitLoop : function(){
        //     var me = this;
        //     // 更新地图图块, 迷雾
        //     // if(!me.stopWarMask) me.update(me.minTimerNum); // 是否停止更新迷雾

        //     // 1.同步小地图主角和其他对象的位置状态
        //     // 2.计算主角在地图上的透明度 (地图上的遮盖点(2)或草丛(3))
        //     // me.event && me.event.emit('GLOBALLOOP',me.minTimerNum);
        //     // 计算层级
        //     me.setZIndexForAll(me.minTimerNum);
        // },
        // 设置所有需要设置Z的
        // setZIndexForAll: function(dt){
        //     var me = this;

        //     me.zIndexDelay += dt;
        //     if(me.zIndexDelay < 650) return;
        //     me.zIndexDelay = 0;

        //     me.forEachChild(function(target){
        //         if(!target._donotResetIndex){
        //             target.zIndex = me.mapContent.height - target.y;
        //             // if(target.data.type == 'pet'){
        //             //     target.zIndex -= 40;
        //             // }
        //         }
        //     });
        // },
        //为obj监听一个type的事件，触发时候调用func
        onEvent : function(type,func,obj){
            var _id = obj.data._id;

            this._events = this._events || cc.EventEmitter.create(1000);
            this._events[ _id ] = this._events[ _id ] || {};
            this._events[ _id ][ type ] = this._events[ _id ][ type ] || [];
            this._events[ _id ][ type ].push( func );

            this.event && this.event.on(type,func);
        },
        //清理obj注册的所有事件监听
        offEventByObj : function(obj){
            var _id = obj.data._id;
            if(!this._events || !this._events[_id])return;
            for(var type in this._events[_id]){
                while( this._events[_id][type].length > 0 ){
                    this.event && this.event.off(type,this._events[_id][type].pop());
                }
                delete this._events[_id][type];
            }
            delete this._events[_id];
        },
        //清理obj注册的指定事件监听
        // offEventByType : function(obj, t){
        //     var _id = obj.data._id;
        //     if(!this._events || !this._events[_id])return;
        //     for(var type in this._events[_id]){
        //         if(type == t){
        //             while( this._events[_id][type].length > 0 ){
        //                 this.event.off(type,this._events[_id][type].pop());
        //             }
        //             delete this._events[_id][type];
        //         }
        //     }
        // },
        onOpen : function(){
            //地图初始化完成
            var me = this;

            // if(!cc.isNode(me.warMask) && me.data.initWarMaskOpenedCCP != null){
            //     me.showWarMask(me.data.initWarMaskOpenedCCP);
            // }

            //延迟，等小地图创建好，加载mapobject中默认出现的数据
            // me.setTimeout(function(){
            //     G.event.emit('baseMapOpen', me.data.id);
            // },100);

            // me.schedule(function(){
            //     me.ms += me.minTimerNum; //累加时钟
            //     me.emitLoop();
            // },me.minTimerNum/1000,cc.REPEAT_FOREVER);
        },
        onExit : function(){
            //手动是否探险中的资源
            // X.releaseRes(['tanxian2.plist','tanxian2.png','tanxian3.plist','tanxian3.png']);
            this._super();
            this.unscheduleAllCallbacks();
        },
    });
})();