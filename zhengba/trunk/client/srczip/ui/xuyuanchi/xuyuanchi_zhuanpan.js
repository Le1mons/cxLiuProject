/**
 * Created by LYF on 2018/6/11.
 */
(function () {
    //许愿池-转盘
    var me = G.frame.xuyuanchi;

    var _fun = {
        appendItems: function(){
            var data = me.DATA.shopitem;
            var sum = 0;
            for(var i = 0; i < data.length; i ++){
                sum += data[i].p;
            }
            for(var i = 0; i < data.length; i ++){
                var item = G.class.sitem(data[i].item);
                if(me.refresh) item.refresh();
                if(data[i].buynum == 0){
                    item.setHighLight(false);
                }
                item.p = data[i].p;
                item.sum = sum;
                item.frame = "xuyuanchi";
                item.setScale(.7);
                me.dial.children[i].removeAllChildren();
                me.dial.children[i].addChild(item);
                G.frame.iteminfo.showItemInfo(item);
                item.setPosition(me.dial.children[i].width / 2, me.dial.children[i].height / 2);
            }
            if(me.refresh) me.refresh = 0;
        },
        refreshItems: function(){
            if(me._running) return;
            me._running = true;

            me.ui.setTimeout(function () {
                me.appendItems();
            }, 2);

            me.dial.stopAllActions();
            var action = cc.rotateBy(2.635, 360*1.25, 360*1.25);
            var sqe = cc.sequence(action,cc.callFunc(()=>{
                me._running = null;
                me.waiting();
            }));
            me.dial.runActions(sqe);
        },
        waiting: function () {
            var me = this;
            var params = [
                [3.32, 15, cc.EaseInOut, 2],
                [3.42, 18, cc.EaseInOut, 1.8],
                [4.125, 20, cc.EaseInOut, 2],
                [3.86, 22, cc.EaseInOut, 2.86],
                [4.32, 25, cc.EaseInOut, 3.12],
                [4.45, 30, cc.EaseInOut, 2.12],
                [5.325, 36, cc.EaseInOut, 2.22],
            ];
            var action = [];
            for(var i=0;i<params.length*2;i++){
                var d = X.arrayRand(params);
                var easing = d[2];
                if(X.rand(0, 10) %2 == 0){
                    action.push(easing.create.apply(easing, [cc.rotateBy(d[0], d[1]*-1, d[1]*-1)].concat(d[3])));
                }else{
                    action.push(easing.create.apply(easing, [cc.rotateBy(d[0], d[1], d[1])].concat(d[3])));
                }
                action.push(cc.delayTime(X.arrayRand([0.5, 0.65, 0.8, 1.2, 1.5])));
            }
            me.dial.stopAllActions();
            me.dial.runActions(cc.repeatForever(cc.sequence(action)));
        },
        goto: function(value, type, callback){
            if(me._running) return;
            me._running = true;

            var duration =  {
                '1':4,
                '10': 6,
                "15": 6
            }[type];

            me._goto(value, duration, callback);
        },
        _goto: function(value, duration, callback){
            me.dial.stopAllActions();
            if(duration == 4){
                me.dial.runActions([
                    cc.rotateBy(2, -2880),
                    cc.rotateBy(1, 360),
                    cc.rotateTo(1, value * 45),
                    cc.callFunc(function () {
                        callback && callback();
                    })
                ]);
            }else{
                me.dial.runActions([
                    cc.rotateBy(3, -2880),
                    cc.rotateBy(1, 360),
                    cc.rotateTo(1, value * 45),
                    cc.callFunc(function () {
                        callback && callback();
                    })
                ]);
            }
        },
    };

    cc.mixin(me,_fun,true);
})();