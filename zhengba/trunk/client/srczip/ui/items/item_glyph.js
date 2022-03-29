(function () {
    G.class.sglyph = function (data, noShow) {
        var item = G.class.itemTemplate();

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
        item.addColorFrame();

        item.num.setString(data.lv || data.n || "");

        item.icon.loadTextureNormal('ico/glyphico/' + conf.ico + '.png', 0);

        if (data.tid && X.cacheByUid("dw_remarks" + data.tid)) {
            var panel_bz = new ccui.ImageView();
            panel_bz.setName('panel_zz');
            panel_bz.setAnchorPoint(0.5, 0.5);
            panel_bz.loadTexture("img/public/diaowen_biao.png", 1);
            item.addChild(panel_bz);
            panel_bz.zIndex = 99999;

            var txt = new ccui.Text(X.cacheByUid("dw_remarks" + data.tid), G.defaultFNT, 16);
            txt.setAnchorPoint(0.5, 0.5);
            X.enableOutline(txt, "#523018", 2);
            txt.setPosition(panel_bz.width / 2, panel_bz.height / 2);
            panel_bz.addChild(txt);
            panel_bz.setPosition(panel_bz.width / 2, panel_bz.height / 2);
        }

        if(color == 5 && !noShow) {
            G.class.ani.show({
                json: "ani_diaowen_wuping_hong",
                addTo: item,
                x: item.width / 2,
                y: item.height / 2,
                cache: true,
                repeat: true,
                autoRemove: false
            });
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

        item.setLock = function (show) {
            if(!show){
                cc.isNode(item.lock) && item.lock.hide();
            }else{
                if(!cc.isNode(item.lock)){
                    item.lock = new ccui.ImageView('img/public/img_suo.png',1);
                    item.lock.setName('lock');
                    item.lock.setAnchorPoint(cc.p(0.5,0.5));
                    item.lock.setPosition(cc.p(item.width / 2,item.height / 2));
                    item.lock.setLocalZOrder(1000);
                    item.addChild(item.lock);
                }else{
                    item.lock.show();
                }
            }
        };

        return item;
    }
})();