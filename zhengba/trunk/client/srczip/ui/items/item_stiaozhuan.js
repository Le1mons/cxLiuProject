/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    G.class.stiaozhuan = function (data, showName, item) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;

        item.id = G.class.tiaozhuan.getIdByFrameId(data.id || data.t || data);
        var id = item.id;
        var conf = G.class.tiaozhuan.getById(id);

        var color = conf.color || 0;
        item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);

        item.background.hide();
        item.data = data;
        item.conf = conf;

        var ico;
        ico = 'img/tujing/' + conf.btn_img;

        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        item.icon.loadTextureNormal(ico,1);
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        item.num.hide();

        if (showName) {
            item.title.setString(conf.name);
            item.title.setTextColor(cc.color("#a1ceff"));
            item.title.setFontName(G.defaultFNT);
            item.title.y -= 5;
        }
        item.touch(function (sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED) {
                var callback = sender.data.callback;
                callback && callback();

                X.tiaozhuan(id);
            }
        });

        return item;
    };

})();