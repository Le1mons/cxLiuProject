/**
 * Created by YanJun on 9/5/14.
 */
(function(){
    var tip_NB = ccui.Layout.extend({
        ctor: function(){
            this._super.call(this,arguments);
            this._layer = this;

            this._container = new ccui.Layout();
            this._container.setContentSize(C.WS.width, 190);
            this._container.setAnchorPoint(0,0);
            this._container.setPosition(0,C.WS.height*0.5);
            this._margin = 36; // 36 wz_bg_tishi.height

            this._layer.addChild(this._container);
            this._layer.setName('tip_NB');
            cc.director.getRunningScene().addChild(this._layer);
            this._layer.setLocalZOrder(9999999);
        },
        onExit : function(){
            this._super();
            delete G.tip_NB._node;
        }
        ,show: function(){
            var me = this;
            this._sel = function(){
                if (me._tips.length > 0) {
                    // var children = me._container.getChildren();
                    // if(children.length > 0 ){
                        // children[0].removeFromParent();
                        // if(children.length > 4 ){
                        //     children[0].removeFromParent();
                        // }
                        // children = me._container.getChildren();
                        // for(var i=0;i<children.length;i++){
                        //     var node = children[i];
                        //     node.setPositionY((children.length-i)*this._margin);
                        // }
                    // }

                    var d = me._tips.shift();
                    me.nowShowData = d;

                    var color = '#ffe8c0';
                    var content = '';
                    var list = d.split(',');
                    if (list.length == 1) {
                        var item = d.split('|');
                        if(item.length==1){
                            content = item[0];
                        }else{
                            color = item[0];
                            item.shift();
                            content = item.join('|');
                        }
                    } else {
                        for(var j=0;j<list.length;j++) {
                            var l = list[j];
                            var ii = l.split('|');
                            if(ii.length==1){
                                content += ii[0];
                            }else{
                                color = ii[0] ? ii[0] : '#ffe8c0';
                                content += '<font color=' + color + '>' + ii[1] + '</font>';
                            }
                        }
                    }

                    var layout = me.getTipNode(content, color);
                    me._container.addChild(layout);
                }
            };
            this._layer.setTimeout(function(){
                me._sel();
            },100,this._tips.length);
        },
        getTipNode: function(content, color){
            var me = this;

            var layout = new ccui.Layout();
            layout.setContentSize(C.WS.width, 36);

            var rt = new X.bRichText({
                size: 22,
                maxWidth: C.WS.width,
                lineHeight:30,

                color: color,
                family:G.defaultFNT,
                eachText:function(node){
                    node.enableShadow && node.enableShadow(cc.color(0,0,0,255),cc.size(1,-1));
                },
            });
            rt.text(content);
            rt.setAnchorPoint(0, 0);
            rt.setPosition(0, 2);
            var label = new ccui.Layout();
            label.setContentSize(rt.trueWidth(), rt.trueHeight());
            label.setAnchorPoint(0.5,0.5);
            label.setPosition(C.WS.width/2, layout.height*0.5);
            label.addChild(rt);
            //label.setScaleX(5);
            //label.setScaleY(1.5);
            label.setOpacity(0);
            label.setScale(0);

            var img = new ccui.ImageView();
            img.loadTexture('img/public/jy_2.png', ccui.Widget.PLIST_TEXTURE);
            img.setAnchorPoint(0.5, 0.5);
            img.setPosition(C.WS.width/2, layout.height*0.5);
            img.setScale(0);
            img.setScale9Enabled(true);
            if(rt.width > img.width) img.width += rt.width - img.width + 10;
            if(rt.width > 600) {
                img.width = 640;
                img.height = rt.height * 1.5;
            }
            ccui.helper.doLayout(img);
            layout.addChild(img);
            layout.addChild(label);

            img.runActions([
                cc.scaleTo(0.25,1.5,1.5),
                cc.scaleTo(0.05,1,1),
                cc.delayTime(3),
                [
                    cc.moveBy(0.3,0,20),
                    cc.scaleTo(0.3,0.7,0.7),
                    cc.fadeOut(0.15)
                ],
                cc.removeSelf()
            ]);

            label.runActions([
                cc.scaleTo(0.25,1.5,1.5),
                cc.scaleTo(0.05,1,1),
                cc.delayTime(3),
                [
                    cc.moveBy(0.3,0,20),
                    cc.scaleTo(0.3,0.7,0.7),
                    cc.fadeOut(0.15)
                ],
                cc.removeSelf(),
                cc.callFunc(function(){
                    var lens = me._container.getChildren().length;
                    if(lens>5){
                        me._container.getChildren()[0].removeFromParent();
                    }else{
                        me._willdel = (me._willdel || 0) + 1;
                        if(me._willdel>=lens){
                            me._willdel = 0;
                            me._container.removeAllChildren();
                        }
                    }
                    if (me.nowShowData) {
                        delete me.nowShowData;
                    }
                })
            ]);

            layout.setAnchorPoint(0,0);
            if(G.frame.yingxiong_xxxx.isShow){
                layout.setPosition(0, 150);
            }else{
                layout.setPosition(0, 0 + (me.addY || 0));
            }
            return layout;
        },
        getAniNode: function(content, color){
            var me = this;
            var layout = new ccui.Layout();
            layout.setContentSize(C.WS.width, 36);

            G.class.ani.show({
                json:'piaozi_dh',
                addTo:layout,
                repeat:false,
                autoRemove:true,
                cache:true,
                onload:function(node, action){
                    X.autoInitUI(node);
                    var tishi = node.nodes.txt_tishi;
                    tishi.removeAllChildren();

                    var rt = new X.bRichText({
                        size: 22,
                        maxWidth: tishi.width,
                        lineHeight:30,
                        color: color,
                        eachText:function(node){
                            node.enableShadow && node.enableShadow(cc.color(0,0,0,255),cc.size(1,-1));
                        }
                    });
                    rt.text(content);
                    rt.setAnchorPoint(0.5, 1);
                    rt.setPosition( tishi.width*0.5, tishi.height);
                    tishi.addChild(rt);
                },
                onend:function() {
                    var lens = me._container.getChildren().length;
                    if(lens>5){
                        me._container.getChildren()[0].removeFromParent();
                    }else{
                        me._willdel = (me._willdel || 0) + 1;
                        if(me._willdel>=lens){
                            me._willdel = 0;
                            me._container.removeAllChildren();
                        }
                    }
                    if (me.nowShowData) {
                        delete me.nowShowData;
                    }
                }
            });
            layout.setAnchorPoint(0,0);
            layout.setPosition(0, 0);

            return layout;
        },
        createItem: function(d, y){
            var me = this;
            me.addY = y;

            if (!d) return;
            d = [].concat(d);
            this._tips = this._tips || [];

            if(!G.frame.dianjin.isShow) {
                for (var i = 0; i < d.length; i++){
                    //过滤掉新增相同的提示内容 //道具信息需要除外   //分隔符取+-需要根据实际情况
                    var dd = d[i];
                    var arrAdd = dd.split('+');
                    var arrPlus = dd.split('-');
                    if (arrAdd.length < 2 && arrPlus.length < 2 && me.nowShowData && d[i] == me.nowShowData) continue;
                    this._tips.push(d[i]);
                }
            }else {
                if(X.inArray(this._tips, d[0])) return;
                this._tips.push(d[0]);
            }
        }
        ,remove: function(){
            this._layer.removeFromParent();
        }
    });
    G.tip_NB = {
        show: function(d, y, callback){
            var me = this;
            if(d != L("ZSBZWFBL") && d.indexOf(L("ZSBZ")) >= 0) {
                if(!G.frame.chongzhi.isShow) {
                    if (G.frame.alert.isShow) {
                        G.frame.alert.remove();
                        G.frame.alert_1.data({
                            cancelCall: null,
                            okCall: function () {
                                G.frame.chongzhi.once("hide", function () {
                                    callback && callback();
                                }).show();
                            },
                            richText: L("ZSBZQWCZ"),
                            sizeType: 3
                        }).show();
                    } else {
                        G.frame.alert.data({
                            cancelCall: null,
                            okCall: function () {
                                G.frame.chongzhi.once("hide", function () {
                                    callback && callback();
                                }).show();
                            },
                            richText: L("ZSBZQWCZ"),
                            sizeType: 3
                        }).show();

                    }
                    return;
                }
            }
            if (!cc.isNode(me._node)){
            	X.loadPlist(['public2.png','public2.plist'],function(){
            		me._node = new tip_NB();
            		
            		me._node.createItem(d, y);
		            me._node.show();
		            me._node.setSwallowTouches(false);
            	});
                //this._node = new tip_NB();
            }else{
            	me._node.createItem(d, y);
	            me._node.show();
	            me._node.setSwallowTouches(false);
            }
//          this._node.createItem(d);
//          this._node.show();
//          this._node.setSwallowTouches(false);
        },
        getZOrder: function(){
            return this._node ? this._node._layer.getLocalZOrder() : 9999999;
        }
    };
})();