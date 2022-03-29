(function(){

//场景
X.bScene = cc.Scene.extend({
    ctor: function(){
        this._super();
        this.event = cc.EventEmitter.create();
    }
    //创景切换完成时
    ,onEnterTransitionDidFinish : function(){
        this._super();
        console.log('bScene DidFinish...');
        //若window中设置了readyCall则回调
        this.onShow && this.onShow.call(this);
    }
    ,onExit : function(){
        this._super();
        this.onClose && this.onClose.call(this);
    }
});

})();