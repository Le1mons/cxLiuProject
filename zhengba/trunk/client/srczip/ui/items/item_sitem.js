(function () {

    G.class.sitem = function (data, showName, item, showNum) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;
        if (data.a == 'attr') {
            return G.class.sattr(data, showName, item);
        }
        if (data.a == 'hero') {
            return G.class.shero(data, showName);
        }
        if (data.a == 'equip') {
            return G.class.szhuangbei(data, showName, item);
        }
        //宝物
        if (data.a == 'baowu') {
            return G.class.sbaowu(data, showName, item);
        }
        //宝石
        if (data.a == 'baoshi') {
            return G.class.sbaoshi(data, showName, item);
        }
        if (data.a == 'shipin') {
            return G.class.sshipin(data, showName, item);
        }
        if(data.a == "glyph") {
            return G.class.sglyph(data, showName, item);
        }
        if(data.a == "pet") {
            return G.class.pet(data);
        }
        if(data.a == "wenwu") {
            return G.class.swenwu(data,showName,item);
        }
        if(data.a == "wuhun"){
            return G.class.wuhun(data, showName);
        }
        // //魂石
        // if (data.a == 'hunshi') {
        //     return G.class.shunshi(data, showName, item);
        // }
        var conf = G.class.getItem(data.itemid || data.t || data) || G.class.getConf("special")[data.t];
        if(!conf) return item;
        var color = conf.color || 0;
        if (color !== 0) {
            item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);
        }

        item.data = data;
        item.conf = conf;
        item.addColorFrame();

        var ico;
        if(conf.special) ico = conf.img;
        else ico = 'ico/itemico/' + G.class.fmtItemICON(conf.img) + ".png";




        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal(ico, conf.special ? 1 : 0);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;


        //if((data.n || data.num)>1){
        item.num.setString(X.fmtValue((data.n || data.num || 1)));
        item.num.setAnchorPoint(1,0);
        item.num.setPosition(cc.p(item.width - 3, 0));
        //}else{
        //    item.num.setString('');
        //}
        // item.num.setPosition(cc.p(item.background.width/4,item.background.height/5));
        if(data.n || data.num) {
            item.num.show();
        } else {
            item.num.hide();
        }
        if(showNum){
            item.num.hide();
        }
        if(conf.star){
            if (!cc.isNode(item.star)) {
                var star = item.star = new ccui.Layout();
                star.setName('star');
                star.setContentSize(cc.size(70,20));
                star.setAnchorPoint(cc.p(0.5,0.5));
                star.setPosition(cc.p(item.width / 2,star.height / 2 + 3));
                item.addChild(star);
                item.num.zIndex = star.zIndex + 1;
                G.class.ui_star(item.star, conf.star, 0.7, {interval:-4});
            }
        }else if (cc.isNode(item.star)){
            item.star.removeFromParent();
            delete item.star;
        }
        if(conf.zhongzu){
            // item.num.setAnchorPoint(1, 0.5);
            // item.num.setPosition(111, 99);
            item.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (parseInt(conf.zhongzu) + 1) + '_s.png', 1);
        }

        if (showName) {
            setTextWithColor(item.title, conf.name, G.gc.COLOR[color]);
        }
        if (conf.usetype == 14 && conf.arg && conf.arg[1] && cc.isNumber(conf.arg[1])) {
            var layout = new ccui.Layout();
            layout.opacity = 255 * 0.75;
            layout.setContentSize(80, 21);
            layout.setAnchorPoint(0.5, 1);
            layout.setBackGroundColorType(1);
            layout.setBackGroundColor(cc.color("#341D00"));
            layout.setPosition(item.width / 2, item.height - 10);
            item.addChild(layout);

            var txt = new ccui.Text(conf.arg[1] / 3600 + L("XS"), G.defaultFNT, 18);
            X.enableOutline(txt, "#000000", 2);
            txt.setAnchorPoint(0.5, 0.5);
            txt.setPosition(layout.width / 2, layout.height / 2);
            layout.addChild(txt);
        }

        if (data.star) {
            //todo BUG!! tableView中时，这段逻辑会重复执行
            for (var i = 0; i < data.star; i++) {
                var x = new ccui.ImageView('img/xingxing.png', ccui.Widget.PLIST_TEXTURE);
                x.setPosition(i * 21, 0);
                item.addChild(x);
            }
        }

        item.setHighLight = function (bool) {
            item.icon.setEnableState(bool);
            item.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
            if(cc.isNode(item.star)){
                X.createStarsLayout(item.star,conf.star,{
                    scale:.7,
                    maxStar:5,
                    isLight: true,
                });
            }
        };

        // 特效
        item.effect.removeAllChildren();
        if (conf.effect && conf.effect > 0) {
            X.ccui(['tubiaotx.json', 'tubiaotx.json', 'tubiaotx.json'][conf.effect - 1], function (loader) {
                var node = loader.node;
                node.setPosition(cc.p(item.effect.width / 2, item.effect.height / 2));
                item.effect.addChild(node);
                node.runAction(loader.action);
                loader.action.gotoFrameAndPlay(0, true);
            });
        }

        //碎片表示
        if ((conf.bagtype * 1 == 3 && !item.sui) || conf.usetype == "7") {
            var img = item.sui = new ccui.ImageView();
            img.loadTexture('img/public/ico/ico_sp.png', ccui.Widget.PLIST_TEXTURE);
            img.setAnchorPoint(cc.p(0.5,0.5));
            img.setPosition(item.width - img.width / 2, item.height - img.height / 2);
            item.addChild(img);
        } else if (conf.bagtype * 1 != 3 && item.sui) {
            item.sui.removeFromParent();
            delete item.sui;
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




        return item;
    };

})();