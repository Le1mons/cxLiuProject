/**
 * Created by wfq on 2018/7/9.
 */
(function() {
    //设置活动btn
    //type:[panel,btn_qrdl]
    G.class.shdbtnType = {
        Normal: 'panel', //一般按钮
        ForQRDL: 'btn_qrdl' //七天登录
    };
    G.class.shdbtn = function(data, item, type, texType, isDjs) {

        if (!data) {
            return;
        }

        type = type || G.class.shdbtnType.Normal;
        texType = texType != undefined ? texType : ccui.Widget.PLIST_TEXTURE;

        var set = function(item, data) {

            var ui = item;
            var btn;
            var djs;
            var icon;
            // var djs = item.djs = item.finds('dsjs');
            // djs.enableShadow(cc.color(0, 0, 0, 255),cc.size(1,-1));
            // icon = item.icon = ui.finds("icon");
            // icon.loadTexture(data.img, texType);

            btn = item.btn = ui.finds('btn');
            btn.setTouchEnabled(true);
            btn.loadTextureNormal(data.img, texType);

            if(data.ani) {
                btn.opacity = 0;
                G.class.ani.show({
                    json: data.ani,
                    addTo: btn,
                    x: btn.width / 2,
                    y: btn.height / 2,
                    repeat: true,
                    autoRemove: false,
                })
            }

            djs = item.djs = ui.finds("wz_djs");
            if(cc.isArray(isDjs)) {
                djs.show();
                X.enableOutline(djs, "#000000", 1);
                isDjs.sort(function (a, b) {
                    return a.rtime < b.rtime ? -1 : 1;
                });
                var conf = isDjs[0];
                X.timeout(djs, conf.rtime, function () {
                    G.view.mainView.getAysncBtnsData(function(){
                        G.view.mainView.allBtns["lefttop"] = [];
                        G.view.mainView.setSvrBtns();
                    }, false);
                })
            }

            btn.show();
            item.data = data;
            item.setName(data.btnname);
            item.setTouchEnabled(false);
        };

        if (!item) {
            item = G._hdBtnNode.clone();
            set(item, data);
        } else {
            set(item, data);
        }
        return item;
    };
})();