(function () {
    G.class.sglyph = function (data, noShow) {
        item = G.class.itemTemplate();

        var conf = G.class.glyph.getById(data.gid || data.t);
        if(!conf) return item;

        var color = conf.color || 0;
        if (color !== 0) {
            item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);
        }

        if(noShow) {
            item.background.hide();
            item.num.hide();
        }

        if(!data.n) {
            item.num.y = 80;
        }

        item.data = data;
        item.conf = conf;

        item.num.setString(data.lv || data.n || "");

        item.icon.loadTextureNormal('ico/glyphico/' + conf.ico + '.png', 0);

        if(color == 5 && !noShow) {
            G.class.ani.show({
                json: "ani_diaowen_wuping_hong",
                addTo: item,
                x: item.width / 2,
                y: item.height / 2,
                cache: true,
                repeat: true,
                autoRemove: false
            })
        }

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

        return item;
    }
})();