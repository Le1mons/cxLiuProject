(function () {

    G.class.sattr = function (data,showName, item) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;
        item.data = data;
        item.conf = G.class.attricon.getById(data.t);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal(G.class.attricon.getById(data.t).img);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
        item.background.loadTexture('img/public/ico/ico_bg' + item.conf.color + '.png', 1);
        //if(data.n>1){
        item.num.setAnchorPoint(1, 0);
        item.num.setString(X.fmtValue(data.n));
        item.num.setPosition(item.width - 3, 0);
        //}

        var color = item.conf.color;
        if (showName){
            setTextWithColor(item.title,G.class.attricon.getById(data.t).name,color ? G.gc.COLOR[color] : G.gc.COLOR[0]);
        }

        // if (color){
        //     item.kuang.loadTexture('img/ico_bg'+ color +'.png',ccui.Widget.PLIST_TEXTURE);
        // }

        item.setHighLight = function (bool) {
            item.icon.setEnableState(bool);
            item.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
        };
        item.setGou = function (show) {
            if(!show){
                cc.isNode(item.gou) && item.gou.hide();
            }else{
                if(!cc.isNode(item.gou)){
                    item.gou = new ccui.ImageView('img/public/img_gou.png',1);
                    item.gou.setName('gou');
                    item.gou.setAnchorPoint(cc.p(0.5,0.5));
                    item.gou.setPosition(cc.p(item.width / 2,item.height / 2));
                    item.gou.setLocalZOrder(1000);
                    item.addChild(item.gou);
                }else{
                    item.gou.show();
                }
            }
        };

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
        };

        return item;
    };

})();