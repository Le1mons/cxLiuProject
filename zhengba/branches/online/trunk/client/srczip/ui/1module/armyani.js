(function(){
    //兵种动画单个
    G.class.armyAni = X.bView.extend({
        //hid = 佣兵id，通过army.json中的 json字段配置，获取动画资源前缀，如：bb01
        //level = 等级（1/2/3），不同的等级，有不同的外形
        //direction = 方向(f/z)
        ctor: function (type,hid,level,direction,callback, conf) {

            cc.log('G.class.armyAni ctor....',type,hid,level,direction,callback, conf);
            if(hid==null || level==null || direction==null){
                cc.log('G.class.armyAni时，hid level direction必传');
                return;
            }

            conf = conf || {};
            conf.action = true;
            conf.autoFillSize = false;
            conf.releaseRes = false;

            if(type=='hero'){
                if(hid*1 > 10000) level = 1; // 经验宝宝没有进阶变化形象
                var json = G.class.hero.getAniFileName(hid,level,direction);
            }else if(type=='machine'){
                var json = G.class.machine.getAniFileName(hid,1,direction);
            }

            this.jsonFile = json;

            //根据资源前缀，判断出兵种类型
            var baseName = cc.path.basename(json);
            if(baseName.startsWith('bb')){
                this.armyType = "bubing";
                this.isBuBing = true;
            }else if(baseName.startsWith('tk')){
                this.armyType = "tanke";
                this.isTanKe = true;
            }else if(baseName.startsWith('zsj')){
                this.armyType = "zhishengji";
                this.isZhiShengJi = true;
            }else if(baseName.startsWith('hjp')){
                this.armyType = "huojian";
                this.isHuoJian = true;
            }else if(baseName.startsWith('zj')){
                this.armyType = "zhanjian";
                this.isZhanjian = true;
            }

            this._super( json, callback, conf );
        },
        onShow : function(){
            this.wait();
        },
        wait : function(){
            this.setAct('wait',true);
        },
        move : function(){
            this.setAct('move',true);
        },
        byatk : function(callback){
            var me = this;
            me.setAct('byatk',false,function(){
                //if(me._currAct=='byatk'){
                    me.wait();
                //}
                callback && callback();
            });
        },
        die : function(){
            this.setAct('die',false);
        },
        //{actname,hitCallback,endCallback}
        atk : function(conf){
            var me = this;
            conf = conf || {};
            var _actName = "atk";
            if(conf && conf.actname)_actName = conf.actname;

            //如果不存在动作，则直接容错回调
            if(!me.action.isAnimationInfoExists(_actName)){
                cc.log('JSON文件缺少动作',me.jsonFile,_actName);
                conf.hitCallback && conf.hitCallback();
                conf.endCallback && conf.endCallback();
                return;
            }

            me.action.setFrameEventCallFunc(function (e) {
                cc.log('atk_Event===',e.getEvent());
                if (e.getEvent() == 'hit') {
                    conf.hitCallback && conf.hitCallback();
                    me.action.clearFrameEventCallFunc();
                }
            });

            me.setAct(_actName,false,function(){
                //if(me._currAct==_actName){
                    me.wait();
               //}
                conf.endCallback && conf.endCallback();
            });
        },
        setAct : function(actName,repeat,callback){
            var me = this;
            me._willPlay = arguments; //试图播放
            if(me._currAct && me._currAct.startsWith('atk')){
                //如果正在播放攻击动作，则不允许被打断
                return;
            }else{
                delete me._willPlay;
            }

            me._currAct = actName;
            me.action.playWithCallback(actName,repeat,function(){
                //native中，无论repeat为何值，都会触发，WEB中repeat=true时不会进入
                cc.log('end...',actName);
                delete me._currAct;
                callback && callback.call(me);

                if(me._willPlay){
                    me.setAct.apply(me,me._willPlay);
                }
            });
        },
        onRemove : function(){
            delete this._willPlay;
            delete this._currAct;
        }
    });
})();
