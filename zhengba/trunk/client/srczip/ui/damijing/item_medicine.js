(function () {
    G.class.medicine = function (idx, num, callback) {
        if(!idx && idx != 0) return;
        var conf = G.class.watchercom.getMedicine(idx);
        var keys = X.keysOfObject(conf.buff);

        var btn = new ccui.Button;
        btn.idx = conf.id;
        btn.loadTextureNormal("img/mijing/bg_wp" + 5 + ".png", 1);
        if(!num) {
            var icon = new ccui.Button;
            icon.loadTextureNormal("img/mijing/ico_wu" + idx + ".png", 1);
            icon.setAnchorPoint(0.5, 0.5);
            icon.setPosition(btn.width / 2, btn.height / 2);
            icon.setTouchEnabled(false);
            btn.addChild(icon);
        }else {
            G.class.ani.show({
                json: "ani_ico_wu" + idx,
                addTo: btn,
                x: btn.width / 2,
                y: btn.height / 2,
                repeat: true,
                cache: true,
                autoRemove: false,
                onload: function (node) {
                    node.setAnchorPoint(0.5, 0.5);
                }
            })
        }


        var numTxt = new ccui.Text(num, G.defaultFNT, 16);
        numTxt.setTextColor(cc.color("#f6ebcd"));
        numTxt.setAnchorPoint(0.5, 0.5);
        numTxt.setPosition(btn.width / 2 + btn.width / 4, btn.height / 4);
        X.enableOutline(numTxt, "#000000", 2);
        numTxt.zIndex = 999;
        btn.addChild(numTxt);

        for (var i = 0; i < keys.length; i ++) {
            var str = L(keys[i]) + X.STR("<font color=#5ce624>+{1}</font>", keys[i] == "hp" ? conf.buff[keys[i]] + "%" : conf.buff[keys[i]]);
            var rh = new X.bRichText({
                size: 16,
                maxWidth: btn.width,
                lineHeight: 32,
                family: G.defaultFNT,
                color: "#f6ebcd",
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(btn.width / 2, 0 - i * rh.height);
            rh.zIndex = 999;
            btn.addChild(rh);
        }
        if(conf.intr) {
            var str = conf.intr;
            var rh = new X.bRichText({
                size: 16,
                maxWidth: btn.width,
                lineHeight: 32,
                family: G.defaultFNT,
                color: "#f6ebcd",
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(btn.width / 2, 0);
            rh.zIndex = 999;
            btn.addChild(rh);
        }

        if(!num) {
            btn.setBright(false);
        }

        btn.click(function (sender) {
            if(num == 0) {
                G.tip_NB.show(L("DMJ_BJ"));
                return;
            }
            if(G.frame.damijing.isAllDead) {
                G.tip_NB.show(L("ALL_HERO_DEAD"));
                return;
            }
            if(X.cacheByUid("dmj_bj")) {
                callback && callback(sender);
            }else{
                G.frame.damijing_medicine.data({
                    name: conf.name,
                    node: sender,
                    callback: callback
                }).show();
            }
        },500);

        return btn;
    }
})();