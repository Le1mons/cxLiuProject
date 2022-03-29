(function(){
    //战斗相关
    var me = G.frame.fight;

    //子弹飞行
    function bullet_move(target,from,to,callback){
        var _dist = 200;//cc.pDistance(from,to);
        var _needTime = _dist / target.getSpeed();
        var _vec = cc.pSub(to,from),
            _angle= cc.pToAngle(_vec);
        target.setRotation(cc.radiansToDegrees(-1 * _angle));
        target.setVisible(true);
        target.setPosition(from);
        target.setAnchorPoint(cc.p(0,0.5));
        target.runActions([
            cc.moveTo( _needTime ,to),
            cc.callFunc(function(){
                cc.log('bullet_move_end...');
                target.stopAllActions();
                cc.callLater(function(){
                    callback();
                });
            },target),
            cc.removeSelf()
        ]);
        return _needTime;
    }
    //激光模式
    function shape_move(target,from,to){
        var ui = target.finds('ui') || target.finds('Node_1');
        var _width = ui.width;
        var _dist = cc.pDistance(from,to);

        //缩放
        target.setVisible(true);
        target.setPosition(from);
        target.setAnchorPoint(cc.p(0,0.5));
        target.setScaleX(_dist/_width);

        //旋转
        var _vec = cc.pSub(to,from),
            _angle= cc.pToAngle(_vec);
        target.setRotation(cc.radiansToDegrees(-1 * _angle));
    }
    
    //普通技能动画
    G.class.skillAniCSB = X.bView.extend({
        ctor : function(){
            this._ctorSuper = this._super;
            this.reuse.apply(this,arguments);
            delete this._ctorSuper;
        },
        reuse : function(skillAni , callback){
            this.skillAni = skillAni;
            this._speed = 1200 * (me.timeSpeed||1);
            this.tmp = {};
            this._createCallback = callback;
            this._ctorSuper && this._ctorSuper((skillAni.releaseAni || ("skillani/"+ skillAni.ani) ) +'.json',null,{
                "action":true,
                autoFillSize:false,
                releaseRes:false
            });
        },
        setSpeed : function(v){
            this._speed = 1200*v;
        },
        getSpeed : function(v){
            return this._speed;
        },
        onShow : function(){
            this.hide();
            this.action.gotoFrameAndPause(0);
            this.setRotation(0);
            this.setScale(1);
            this._createCallback && this._createCallback.call(this);
        },
        onRemove : function(){
            this.tmp = {};
        },
        startMove : function(fromPosition,toPosition,callback){
            var _that = this;

            /*
            *******************
            *对应配置在json/skillani.json，如果战斗莫名暂停，请检查配置所填写的字段是否正确
            *@param
            *@returns {}
            *******************
            */
            console.log('this.skillAni.animovetype======', this.skillAni.animovetype);
            if(this.skillAni.animovetype=='bullet'){
                //子弹
                _that.action.gotoFrameAndPlay(0, true);
                
                var fp = cc.p(fromPosition.x,fromPosition.y+50);
                if(toPosition.x > fp.x){
                	//目标在右侧
                	fp.x += 100;
                }else{
                	fp.x -= 100;
                }
                
                bullet_move(this,fp,cc.p(toPosition.x,toPosition.y+50),function(){
                    callback();
                    //hit_ani(toPosition,_that.skillAni);
                });
            }else if(this.skillAni.animovetype=='none'){
                //原地
                var _emitHit = false;
                _that.show();
                _that.setPosition(toPosition);
                _that.action.setFrameEventCallFunc(function (e) {
                    if (e.getEvent() == 'hit') {
                        cc.log('noneAnihit.....');
                        _that.action.clearFrameEventCallFunc();
                        _emitHit = true;
                        callback && callback();
                        //hit_ani(toPosition,_that.skillAni);
                    }
                });
                _that.action.setLastFrameCallFunc(function () {
                    this.clearLastFrameCallFunc();
                    _that.removeFromParent();
                    cc.log('noneAniLastFrame........');
                    if(!_emitHit){
                    	callback && callback();
                    	//hit_ani(toPosition,_that.skillAni);
                    }
                });
                _that.action.gotoFrameAndPlay(0, false);
            }else if(this.skillAni.animovetype=='shape'){
                //激光
                _that.action.setFrameEventCallFunc(function (e) {
                    if (e.getEvent() == 'hit') {
                        _that.action.clearFrameEventCallFunc();
                        callback && callback();
                        //hit_ani(toPosition,_that.skillAni);
                    }
                });
                _that.action.setLastFrameCallFunc(function () {
                    this.clearLastFrameCallFunc();
                    _that.removeFromParent();
                });
                _that.action.gotoFrameAndPlay(0, false);
                
                var fp = cc.p(fromPosition.x,fromPosition.y+50);
                if(toPosition.x > fp.x){
                	//目标在右侧
                	fp.x += 100;
                }else{
                	fp.x -= 100;
                }
                shape_move(_that, fp ,cc.p(toPosition.x,toPosition.y+50));
            }
        }
    });
    
})();

//文字泡
G.class.wordBubble = function (pictureArr, parent, cb) {
    if(pictureArr.length < 1) {
        return cb && cb();
    }

    var txtBg = new ccui.ImageView("img/public/img_wzpao.png", 1);
    txtBg.setAnchorPoint(1, 0);
    txtBg.setPosition(-20, 200);
    txtBg.scaleX = parent.scaleX;

    var name = X.arrayRand(pictureArr);
    var txt = new ccui.ImageView("img/public/" + name + ".png", 1);
    txt.setAnchorPoint(0.5, 0.5);
    txt.setPosition(txtBg.width / 2, txtBg.height / 2);
    txtBg.addChild(txt);

    parent.addChild(txtBg);
    txtBg.zIndex = 9999;

    txtBg.runActions([
        cc.fadeTo(1, 255),
        cc.spawn(cc.fadeOut(0.5), cc.scaleBy(0.5, 0.2, 0.2)),
        cc.removeSelf(),
        cc.callFunc(function () {
            cb && cb();
        })
    ])
};