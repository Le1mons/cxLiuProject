/**
 * Created by wfq on 2018/5/24.
 */
(function () {

    G.class.swenwu = function (data,showNum, isTouch,item) {
        item = item || G.class.itemTemplate();
        if (data == null) return item;

        var conf = G.class.wenwu.getById(data.bid || data.t || data) || data;

        var color = data.color || conf.color||0;
        item.background.loadTexture('img/public/ico/ico_bg' + color + '.png', 1);

        item.data = data;
        item.conf = conf;

        item.icon.loadTextureNormal('ico/wenwuico/' + conf.icon + '.png',0);

        if (showNum){
            item.num.show();
            if(data.n){
                item.num.setString(data.n);
            }else {
                item.num.setString(G.class.getOwnNum(data.t || data,"wenwu"));
            }
        }else {
            item.num.hide();
        }
        if(isTouch){
            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.wenwu_tips.data(data.t || data).show();
                }
            });
        }
        return item;
    };

})();