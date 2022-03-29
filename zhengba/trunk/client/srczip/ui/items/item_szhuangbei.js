(function () {

    G.class.szhuangbei = function (data,showName, item, showNum) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;
        
        var conf = G.class.equip.getById(data.eid || data.t || data) || data;

        var color = data.color || conf.color|| 0;
        item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);

        item.data = data;
        item.conf = conf;
        item.addColorFrame();

        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal('ico/equipico/' + conf.ico + '.png',0);
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        var allNum = data.n || data.num;
        var canUseNum = allNum - (data.usenum || 0);
        if (canUseNum > 1) {
            item.num.setString(canUseNum);
            // item.num.setAnchorPoint(cc.p(0,0.5));
            // item.num.setPosition(cc.p(2,item.height - item.num.height / 2));
        } else {
            item.num.setString('');
        }
        item.num.setAnchorPoint(0.5,0.5);
        item.num.setPosition(cc.p(item.width - item.num.width / 2 - 6, item.num.height / 2));
        item.num.zIndex = 10;
        if(showNum == false){
            item.num.hide();
        }
        if (showName){
            setTextWithColor(item.title,conf.name,G.gc.COLOR[color]);
        }
        if(conf.job){
            item.panel_zz.setBackGroundImage('img/public/ico_zy/zy_' + conf.job + '.png', 1);
            item.panel_zz.setScale(.6);
        }

        if (conf.star) {
            if (!cc.isNode(item.star)) {
                var star = item.star = new ccui.Layout();
                star.setName('star');
                star.setContentSize(cc.size(70,20));
                star.setAnchorPoint(cc.p(0.5,0.5));
                star.setPosition(cc.p(item.width / 2,star.height / 2 + 3));
                item.addChild(star);
            }

            if(conf.star > 5) {
                X.createStarsLayout(item.star, conf.star - 5, {
                    imgstar: 'img/public/img_xing4.png',
                    scale: .65,
                    maxStar: 5,
                });
            }else {
                X.createStarsLayout(item.star,conf.star,{
                    scale:.7,
                    maxStar:5
                });
            }
        }else if (cc.isNode(item.star)){
            item.star.removeFromParent();
            delete item.star;
        }
        item.setGou = function (v) {
            if (v) {
                if (item.gou) {
                    item.gou.show();
                } else {
                    var imgGou = item.gou = new ccui.ImageView('img/public/img_gou.png',1);
                    imgGou.setAnchorPoint(cc.p(0.5,0.5));
                    imgGou.setPosition(cc.p(item.width / 2,item.height / 2));
                    imgGou.setName('gou');
                    item.addChild(imgGou);
                    imgGou.setLocalZOrder(1000);
                    imgGou.show();
                }
            } else {
                if (item.gou) {
                    item.gou.hide();
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

        item.setHighLight = function (bool) {
            item.icon.setEnableState(bool);
            item.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
            X.createStarsLayout(item.star,conf.star,{
                scale:.7,
                maxStar:5,
                isLight: true,
            });
        };

        return item;
    };

})();