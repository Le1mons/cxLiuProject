(function () {

    G.class.sskill = function(conf,skilllv,item, num) {
        item = item || G.class.itemTemplate();
        if (conf == null) {
            item.background.show();
            item.icon.loadTexture('img/public/btn/btn_jia2.png',1);
            return item;
        }
        item.conf = conf;

        item.background.hide();

        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal('ico/skillico/' + conf.img,0);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
        //lv
        // var lv = item.lv = new ccui.Text();
        // lv.setString((skilllv || 0) + '/' + conf.maxlv);
        // lv.setFontSize(18);
        // lv.x = 90;
        // lv.y = 30;
        // lv.setAnchorPoint(C.ANCHOR[9]);
        // lv.setLocalZOrder(100);
        // X.enableOutline(lv,'#000000',5);
        // item.addChild(lv);
        var lv = new X.bRichText({
            size: 18,
            lineHeight: 24,
            maxWidth:item.width,
            color:G.gc.COLOR.n1,
            family:G.defaultFNT,
            eachText: function (node) {
                X.enableOutline(node,'#2a1c0f');
            }
        });
        // lv.setString((skilllv || 0) + '/' + conf.maxlv);
        lv.text((skilllv || 0) + '/' + conf.maxlv);
        lv.setAnchorPoint(cc.p(1,0.5));
        lv.setPosition(cc.p(item.width - lv.width / 2 - 2,lv.height / 2 + 5));
        lv.zIndex = 10;
        item.addChild(lv);

        item.num.hide();


        if(num) {
            var tag = new ccui.ImageView("img/gonghui/img_ditu.png", 1);
            tag.setAnchorPoint(0.5, 0.5);
            tag.setPosition(20, 80);
            item.addChild(tag);
            tag.zIndex = 999;

            var txt = new ccui.Text(num, G.defaultFNT, 18);
            txt.setTextColor(cc.color("#ffffff"));
            txt.setAnchorPoint(0.5, 0.5);
            txt.setPosition(tag.width / 2 - 1, tag.height / 2);
            tag.addChild(txt);
        }

        //置灰
        item.isHighLight = true;
        item.setHighLight = function (bool) {
            item.isHighLight = bool;
            item.icon.setEnableState(bool);
        };

        item.setXuanzhong = function (bool) {
            if (bool) {
                if (item._xz) {
                    item._xz.show();
                } else {
                    var xz = item._xz = new ccui.ImageView('img/public/img_yuan_xz.png',1);
                    xz.setName('xuanzhong');
                    xz.setPosition(cc.p(item.width / 2,item.height / 2));
                    item.addChild(xz);
                }
            } else {
                if (item._xz) {
                    item._xz.hide();
                }
            }
        };

        return item;
    };

})();