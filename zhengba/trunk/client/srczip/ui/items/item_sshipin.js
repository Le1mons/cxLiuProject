/**
 * Created by wfq on 2018/5/25.
 */
(function () {

    G.class.sshipin = function (data,showName, item) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;

        var conf = G.class.shipin.getById(data.spid || data.t || data.id || data) || data;

        var color = data.color || conf.color||0;
        item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);

        item.data = data;
        item.conf = conf;

        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal('ico/shipinico/' + conf.ico + '.png',0);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        var canUseNum = data.n || data.num;
        if (canUseNum > 1) {
            item.num.setString(canUseNum);
            // item.num.setAnchorPoint(cc.p(0,0.5));
            item.num.setAnchorPoint(0.5,0.5);
            item.num.setPosition(cc.p(item.width - item.num.width / 2 - 5, item.num.height / 2));
        } else {
            item.num.setString('');
        }
        item.num.zIndex = 10;

        if (showName){
            setTextWithColor(item.title,conf.name,G.gc.COLOR[color]);
        }

        if(conf.name.split("+").length > 1) {
            item.step.setString("+" + conf.name.split("+")[1]);
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

        item.setHighLight = function (bool) {
            item.icon.setEnableState(bool);
            item.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
            X.createStarsLayout(item.star,conf.star,{
                scale:.7,
                maxStar:5,
                isLight: true,
            });
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

        item.fuse = function (node) {
            G.class.ani.show({
                json: "ani_yingxionghecheng_posui",
                addTo: item.getParent(),
                x: item.x,
                y: item.y,
                cache: true,
                repeat: false,
                autoRemove: true,
                onend: function () {
                    node.show();
                }
            })
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
                    //var imgGou = this.gou;
                }else{
                    item.gou.show();
                }
                //imgGou.show();
            }
        };

        return item;
    };

})();