(function () {
    G.class.wuhun = function (data, isTouch, args) {
        var item = new G.class.itemTemplate();
        if (!data) return item;
        args = args || {};
        item.data = data;
        var conf;
        if(data.id && data.lv){
            conf = G.gc.wuhun[data.id][data.lv];
        }else if(data.t){//atn格式,默认武魂是1级
            conf = G.gc.wuhun[data.t][1];
        } else{
            conf = data;
        }
        var whid = data.id || data.t;
        var whlv = data.lv || 1;
        item.icon.loadTextureNormal('ico/wuhunico/' + conf.ico + '.png');
        if (conf.color !== 0) {
            item.background.loadTexture('img/public/ico/ico_bg' + conf.color + '.png', 1);
        }
        if(data.lv){//是否显示等级
            item.step.setString(data.lv || 1);
        }
        if (data.n && data.n > 0){
            item.num.show();
            item.num.setString(data.n);
        }else {
            item.num.hide();
        }
        if(args.recycle && data.tid){//背包里的点击，显示回收
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.wuhun_info.data({
                        whtid:data.tid,
                        type:"recycle"
                    }).show();
                }
            });
        }
        if(isTouch){
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.wuhun_tips.data({
                        data:conf,
                        whid:whid,
                        whlv:whlv
                    }).show();
                }
            });
        }
        item.refresh = function(isLoop, callback, speed){
            while (item.getChildByTag(20180711)) {
                item.getChildByTag(20180711).removeFromParent();
            }

            G.class.ani.show({
                json: "ani_shangpinshuaxin",
                addTo: item,
                x: item.width / 2,
                y: item.height / 2,
                repeat: isLoop ? true : false,
                autoRemove: isLoop ? false : true,
                onload: function (node, action) {
                    speed && action.setTimeSpeed(speed);
                    callback && item.show();
                    node.setTag(20180711);
                    node.getChildren()[0].getChildren()[1].setScale(1.55);
                    item.loop = node;
                },
                onend: function (node, action) {
                    callback && callback();
                }
            })
        }
        if(args.nolv) item.step.hide();
        return item;
    }
})();