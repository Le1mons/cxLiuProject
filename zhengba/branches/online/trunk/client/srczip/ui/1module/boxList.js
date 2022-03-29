(function () {

G.class.boxList = function (nodes, count, callback) {
    var me = this;
    me._nodes = nodes;
    me._count = count;
    me._boxColor = {};

    for(var i=0;i<me._count;i++){
        var idx = i+1;
        var box = me._nodes['panel_bx' + idx];
        box.idx = i;
        // me.setStatus(idx, 2); // 默认不可领取
        // me.setPercent(idx, 0); // 默认进度条0

        box.setTouchEnabled(true);
        box.click(function(sender, type){
            callback && callback(sender, type);
        });
    }
};

G.class.boxList.prototype = {
    setPercent : function(idx, val){
        var me = this;
        me._nodes['jdt_' + idx].setPercent(val);
    },
    // color 1 绿 2蓝 3橙
    setBoxColors : function(colors){
        var me = this;
        for(var i=0;i<colors.length;i++){
            me._boxColor[i+1] = colors[i];
        }
    },
    // status 0未领取 1已领取 2不可领取 
    setStatus : function(idx, status){
        var me = this;
        var box = me._nodes['panel_bx' + idx];
        box.status = status;
        var color = me._boxColor[idx] || '1';
        box.setBackGroundImage({
            "0": 'img/public/img_bx' + color + '_1.png', // 可领取
            "1": 'img/public/img_bx' + color + '_3.png', // 已领取
            "2": 'img/public/img_bx' + color + '_2.png', // 不可领取
        }[status],ccui.Widget.PLIST_TEXTURE);
    },
    setText : function(idx, val){
        var me = this;
        var box = me._nodes['panel_bx' + idx];

        var rt = new X.bRichText({
            size: 18,
            lineHeight: 24,
            maxWidth:box.width,
            color:G.gc.COLOR.n11
        });
        rt.text(val);
        rt.setAnchorPoint(0.5, 0);
        rt.setPosition(cc.p( (box.width-rt.trueWidth())*0.5, 0 ));
        box.removeAllChildren();
        box.addChild(rt);
    },
    reset: function(){
        var me = this;
        me._count

        for(var i=0;i<me._count;i++){
            var idx = i+1;
            me.setPercent(idx, 0); // 默认进度条0
            me.setStatus(idx, 2);   // 默认不可领取
            var box = me._nodes['panel_bx' + idx];
            box.setTouchEnabled(true);
        }
    },
    getBox: function(idx){
        var me = this;
        return me._nodes['panel_bx' + idx];
    }
};

})();