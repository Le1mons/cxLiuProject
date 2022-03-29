/**
 * Created by wfq on 2018/5/24.
 */
(function () {

    G.class.sbaoshi = function (data,showName, item) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;

        var conf = G.class.baoshi.getById(data.bid || data.t || data) || data;

        var color = data.color || conf.color||0;
        item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);

        item.data = data;
        item.conf = conf;

        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal('ico/baoshiico/' + conf.ico + '.png',0);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        if (showName){
            setTextWithColor(item.title,conf.name,G.gc.COLOR[color]);
        }

        if (conf.star) {
            if (!cc.isNode(item.star)) {
                var star = item.star = new ccui.Layout();
                star.setName('star');
                star.setContentSize(cc.size(70,20));
                star.setAnchorPoint(cc.p(0.5,0.5));
                star.setPosition(cc.p(item.width / 2, star.height / 2 + 3));
                item.addChild(star);
            }

            X.createStarsLayout(item.star,conf.star,{
                scale:.7,
                maxStar:5
            });
        }else if (cc.isNode(item.star)){
            item.star.removeFromParent();
            delete item.star;
        }

        //数量默认隐藏
        item.num.hide();

        return item;
    };

})();