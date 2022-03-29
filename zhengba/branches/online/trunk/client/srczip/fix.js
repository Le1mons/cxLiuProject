(function(){

    if(!cc.sys.isNative){
        //字体test
        ccui.Text.prototype._setFontName = ccui.Text.prototype.setFontName;
        ccui.Text.prototype.setFontName = function(name){
            name = name.replace('.ttf','');
            this._setFontName(name);
        };
    }
    
    cc.getRect = function (node) {
        var ap = node.getAnchorPoint(),
            pos = node.convertToWorldSpaceAR(),//.getPosition(),
            size = node.getContentSize(),
            //parent = node.getParent(),
            scaleX = node.getScaleX(),
            scaleY = node.getScaleY();

        //if (parent){
            //pos = parent.convertToWorldSpace(pos);
        //}
        return cc.rect(pos.x - size.width * scaleX * ap.x, pos.y - size.height * scaleY * ap.y,size.width * scaleX,size.height * scaleY);
    };

    //窗体扩展功能
    X.bUi.prototype.showMainMenu = function(){
        this.needshowMainMenu = true;
        var me = this;

        if(!me.attr('_bindShowMainMenu')){
            me.on('focus',function(){
                if(cc.sys.isObjectValid(G.view.mainMenu.ui)){
                    G.view.mainMenu.zIndex = me.ui.zIndex+3;
                    G.view.mainMenu.showWith(me);
                }
            });
            me.on('hide',function(){
                //重置menu层级
                cc.log('重置menu层级');
                G.view.mainMenu.delShowWithHistory(me._id);
                if( X.topFrameID && G.frame[ X.topFrameID ] && !G.frame[ X.topFrameID]._bindShowMainMenu ){
                    //如果当前最顶部的窗口不需要mainMenu，则重新设置mainMenu的层级
                    var showWith = G.view.mainMenu.getLastShowWith();
                    if( showWith && G.frame[showWith] && G.frame[showWith].ui){
                        cc.log('重置到='+showWith);
                        // G.frame[showWith].emit('focus2');
                        G.frame[showWith].showMainMenu();
                    }
                }
            });
            me.attr('_bindShowMainMenu',true);
        }
        if(cc.sys.isObjectValid(G.view.mainMenu.ui)){
            G.view.mainMenu.zIndex = me.ui.zIndex+3;
            G.view.mainMenu.showWith(me);
        }
    };
    
    X.bUi.prototype.showToper = function(){
        this.needShowToper = true;
        if(cc.sys.isObjectValid(G.view.toper.ui)){
            G.view.toper.zIndex = this.ui.zIndex+3;
            G.view.toper.showWith(this);
        }
    };
    //改变toper的货币值显示
    X.bUi.prototype.changeToperAttr = function(obj){
        if(cc.sys.isObjectValid(G.view.toper.ui)){
            G.view.toper.changeAttr(obj);
        }
    };

    cc.Action.prototype.playWithCallback = function(name,repeat,callback){
        var me = this;
        if(name && me.isAnimationInfoExists(name)){
            var endIndex = me.getAnimationInfo(name).endIndex;
            me.setLastFrameCallFunc(function(){
                if(endIndex == me.getCurrentFrame()){
                    this.clearLastFrameCallFunc();
                    cc.callLater(function(){
                        cc.sys.isObjectValid(me) && callback && callback();
                    });
                }
            });
            me.play(name,repeat);
        }else{
            callback && callback();
        }
    };

    cc.enableScrollBar = function (scrollView,isEnable) {
        scrollView.setScrollBarEnabled && scrollView.setScrollBarEnabled(isEnable != undefined ? isEnable : false);
    };

    //listview跳转到某个指定的idx
    ccui.ListView.prototype.jumpToIdx = function (idx,args) {
        var me = this;

        args = args || {};
        var type = args.type || 'horizontal';
        var offset = args.offset || 0;

        var children = me.getChildren();
        if(idx >= children.length){
            idx = children.length - 1;
        }

        var child = children[idx];
        var itemMargin = me.getItemsMargin();

        var val,visibleVal,innerVal;
        if (type == 'horizontal') {
            //水平滑动
            visibleVal = me.getContentSize().width;
            innerVal = me.getInnerContainerSize().width;
            val = (child.width + itemMargin) * idx - offset;
            //滑动到最后边时
            console.log('已滑到最边缘======', 1);
            if (innerVal - val < visibleVal) {
                me.jumpToRight();
            } else {
                me.getInnerContainer().setPosition(cc.p(-val,0));
            }
        } else {
            visibleVal = me.getContentSize().height;
            innerVal = me.getInnerContainerSize().height;
            if(child == undefined) return;
            val = (child.height + itemMargin) * idx - offset;
            //滑动到最后边时
            if (innerVal - val < visibleVal) {
                me.jumpToBottom();
            } else {
                me.getInnerContainer().setPosition(cc.p(0,val - innerVal + visibleVal));
            }
        }
    };

    //设置按钮状态
    ccui.Button.prototype.setBtnState = function (bool,color) {
        var me = this;

        me.setTouchEnabled(bool);
        me.setBrightAndColor(bool,color);
    };
    //设置按钮高亮切换时的文字颜色
    ccui.Button.prototype.setBrightAndColor = function (bool,color) {
        var me = this;

        var obj = {
            1:{
                yellow:G.gc.COLOR.n101,
                red:G.gc.COLOR.n103,
                green:G.gc.COLOR.n102
            },
            0:{
                yellow:G.gc.COLOR.n15,
                red:G.gc.COLOR.n15,
                green:G.gc.COLOR.n15
            }
        };

        color = color || 'yellow';

        me.setBright(bool);
        me.setTitleColor && me.setTitleColor(cc.color(obj[bool ? 1 : 0][color]));
    };
    
    //扩展ccui下的精度条在指定时间内动画设定为x值
    ccui.LoadingBar.prototype.setPercentAni = function (val) {
    	var that = this;
    	this._from = this.getPercent();
    	this._to = val;
    	
    	this._dtsum = 0;
    	var nv = 0;
    	this.unscheduleUpdate();
    	this.update = function(dt){
    		this._dtsum += dt;
    		nv = parseInt(this._from + (this._to - this._from) * this._dtsum);
    		this.setPercent( nv );
    		if(nv==this._to){
    			this.unscheduleUpdate();
    		}
    	};
    	this.scheduleUpdate();
    };
    
    G.event.on("TOUCH_ENDED", function (sender, fromwhere) {
        X.playSound(sender, fromwhere);
    })
})();