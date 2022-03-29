(function () {

    //宝物
    G.class.sbaowu = function (data, showName, item) {
        item = item || G.class.itemTemplate();
        // item.kuang.loadTexture('img/ico_bg11.png', 1);
        if (data == null) {
            item.showAdd = function (v) {
                item.icon.loadTexture('img/public/btn_jia2.png', 1);
                item.background.setVisible(v);
                item.icon.setVisible(v);
                item.kuang.setVisible(!v);
            };
            return item;
        }
        var conf = G.class.baowu.getById(data.bid || data.itemid || data.t || data);
        var color = data.color || 0;
        if (color !== 0) {
            item.background.loadTexture('img/public/ico/ico_bg_wq' + color + '.png', 1);
        }
        item.data = data;
        item.conf = conf;
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal('item/' + conf.icon, ccui.Widget.LOCAL_TEXTURE);
        //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        //lv等级
        var dengji = item.dengji = new ccui.Text();
        dengji.setString(L('DENGJI') + (conf.lv || 1));
        dengji.x = 100;
        dengji.y = 26;
        dengji.width = item.width;
        dengji.setAnchorPoint(C.ANCHOR[9]);
        dengji.setFontSize(18);
        dengji.setTextColor(cc.color('#d5b97c'));
        dengji.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        dengji.enableShadow(cc.color(0, 0, 0, 255), cc.size(1, -1));
        item.addChild(dengji);

        // 数量
        item.num.setAnchorPoint(C.ANCHOR[9]);
        item.num.x = 120;
        item.num.setString('x1');
        item.num.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);

        if (showName) {
            setTextWithColor(item.title, conf.name, G.gc.COLOR[color]);
        }
        //特效
        item.effect.removeAllChildren();
        if (data.tsbuff && X.isHavItem(data.tsbuff)) {
            X.ccui(['tubiaotx.json', 'tubiaotx.json', 'tubiaotx.json'][0], function (loader) {
                var node = loader.node;
                node.setPosition(cc.p(item.effect.width / 2, item.effect.height / 2));
                item.effect.addChild(node);
                node.runAction(loader.action);
                loader.action.gotoFrameAndPlay(0, true);
            });
        }
        if (data.lock) {
            // 图没有
            // var suo = item.lock = new ccui.ImageView('img/public/wz_suo.png', ccui.Widget.PLIST_TEXTURE);
            // suo.setPosition(15, 90);
            // item.addChild(suo);
        }

        item.refresh = function(isLoop, callback){
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