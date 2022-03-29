/**
 * Created by YanJun on 5/18/16.
 */
(function(){
    G.event.on('playerZhanliChange',function(data) {
        // if(P.gud.lv==2)return;  //原因：此等级下推送信息过多，屏蔽战力变化信息凸显组合属性变化
        // G.interceptor.dispatch(data.code,'zhanli',function () {
            G.zhanli_ani.show(data);
        // });
    });

    var ani = cc.Class.extend({
        ctor: function(){
            this._layer = new ccui.Layout();
            this._layer.setName('zhanli_ani');
            
            this._layer.setAnchorPoint(0,0.5);
            //this._layer.setPosition(0, C.WS.height - 100);
            cc.director.getRunningScene().addChild(this._layer);
            this._layer.setLocalZOrder(9999999);

            this._text = new ccui.TextBMFont();
            this._text.setFntFile('img/fnt/sz_zdl.fnt');
            this._layer.addChild(this._text);
            this._text.setAnchorPoint(0,0.5);
            // this._text.setContentSize(cc.size(100, 45));
            this._text.setPosition(156, 0);

            var me = this;
            // 左边的战力动画
            X.ccui('zhanlidh.json', function (loader) {
                loader.node.setPosition(80,0);
                me._layer.addChild(loader.node);
                loader.node.runAction(loader.action);
                loader.action.gotoFrameAndPlay(0,true);
            });
        }
        ,show: function(callback){
            var me = this;

            this._layer.clearAllTimers();
            var ovalue = me.data().ov,
                nvalue = me.data().nv;
            me._layer.setScaleX(5);
            me._layer.setScaleY(1.5);
            me._layer.runAction(cc.scaleTo(0.2,1,1));
            var diff = nvalue - ovalue;
            
            var sumWidth = 200 + ( (nvalue+"").length*38); //战力+数字
            me._layer.setPosition((C.WS.width-sumWidth)*.5, C.WS.height*.5-200);
            me._layer.setContentSize(sumWidth,100);

            var aa = diff < 0 ? -1 : 1;

            var bb = diff * aa + '';
            var n = 0;
            for (var i = 0; i < bb.length; i++){
                n += bb[i] * 1;
            }
            var ii = 0,j = diff < 0 ? 0 : bb.length - 1,nn = 0;

            me._text.hide();
            var w;
            if (diff > 0) {
                me._text.setString(nvalue+"");
            }else {
                me._text.setString(ovalue+"");
            }
            w = me._text.getContentSize().width;
            this._layer.setTimeout(function () {
                X.ccui('jiantoudh.json', function (loader) {
                    loader.node.getChildByTag(543).setSpriteFrame(['img/zhanlidh/arrow_zl_down.png','img/zhanlidh/arrow_zl_up.png'][diff < 0 ? 0 : 1]);
                    loader.node.setPosition(180+w,0);
                    cc.sys.isObjectValid(me._layer.getChildByTag(666666)) && me._layer.getChildByTag(666666).removeFromParent();
                    me._layer.addChild(loader.node);
                    loader.node.runAction(loader.action);
                    loader.action.gotoFrameAndPlay(0,true);
                    loader.node.setTag(666666);
                });
                me._text.setString('' + ovalue);
                me._text.show();
                me._layer.setTimeout(function(){
                    ovalue += Math.pow(10,bb.length - 1 - j) * aa;
                    me._text.setString('' + ovalue);

                    ii++;
                    if (ii - nn == bb[j]*1){
                        nn = ii;
                        j -= aa;
                    }

                    if (ii == n){
                        me._text.setString(nvalue+"");

                        me._layer.setTimeout(function () {
                            me._layer.runActions([
                                cc.moveBy(0.3,cc.p(0,70*(diff>0?1:-1))),
                                cc.callFunc(function(){
                                    me.remove(),
                                    callback && callback();
                                })
                            ]);
                        },0,0,1);
                    }
                },50,n - 1,0.5);
            },0);

        }
        ,remove: function(){
            this._layer.removeFromParent();
        }
        ,data: function (v) {
            if (v){
                this._data = v;
                return this;
            }else{
                return this._data;
            }
        }
    });
    G.zhanli_ani = {
        _instance: null,
        show: function(d){
            if (d.ov == d.nv)return;
            var me = this;
            if (!me._instance){
                me._instance = new ani();
            }
            if (me._instance){
                me._instance.data(d);
            }
            me._instance.show(function () {
                delete me._instance;
            });
        }
    };
})();