/**
 * Created by zhangming on 2018-05-14
 */
(function(){
    // tips窗口管理

    // G.event.on('playerZhanliChange',function(data) {
    //     G.zhanli_ani.show(data);
    // });

    var tips = cc.Class.extend({
        ctor: function(){
            var me = this;

            me._mask = new ccui.Layout();
            me._mask.setName('tipsmanager');
            me._mask.setContentSize(C.WS);
            me._mask.setAnchorPoint(0,0);
            me._mask.setPosition(0,0);
            me._mask.setTouchEnabled(true);
            // me._mask.setLocalZOrder(9999999);

            me._mask.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    for (var _type in me._panels) {
                        if(cc.isNode(me._panels[_type])){
                            me._panels[_type].onRemove && me._panels[_type].onRemove();
                            me._panels[_type].removeFromParent();
                        }
                        delete me._panels[_type];
                    }
                    G.tipsManager.remove();
                }
            });

            me._mask.zIndex = G.gc.zIndex.tipsmanager;
            cc.director.getRunningScene().addChild(me._mask);
        },
        show: function(){
            var me = this;

            me._panels = me._panels || {};
            var type = me.data().frame;

            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new G.class[type](function(){
                    me.doLayout();
                }, me.data().data);
                
                me._mask.addChild(me._panels[type]);
            }

            me._panels[type].show();
        },
        doLayout: function(){
            var me = this;
            var keys = X.keysOfObject(me._panels);

            if(keys.length == 1){
                var view = me._panels[keys[0]];
                view.setAnchorPoint(0.5,0.5);
                view.setPosition( cc.p(C.WS.width*0.5, C.WS.height*0.5) );
            }else{
                var sumHeight = 0;
                for(var i=0;i<keys.length;i++){
                    sumHeight += me._panels[keys[i]].height;
                }
                var y = (C.WS.height - sumHeight) * 0.5 + sumHeight;
                for(var j=0;j<keys.length;j++){
                    var panel = me._panels[keys[j]];
                    panel.setAnchorPoint(0.5,1);
                    panel.setPosition(cc.p(C.WS.width*0.5, y));
                    y -= panel.height;
                }
            }
        },
        remove: function(){
            this._mask.removeFromParent();
        },
        data: function (v) {
            if (v){
                this._data = v;
                return this;
            }else{
                return this._data;
            }
        }
    });

    G.tipsManager = {
        _instance: null,
        show: function(d){
            var me = this;
            if (!me._instance){
                me._instance = new tips();
            }
            if (me._instance){
                me._instance.data(d);
            }
            me._instance.show();
        },
        remove: function(){
            var me = this;
            if (me._instance){
                me._instance.remove();
            }
            delete me._instance;
        }
    };
})();