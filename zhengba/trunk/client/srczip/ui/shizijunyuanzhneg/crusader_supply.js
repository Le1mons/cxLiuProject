G.class.shizijun_supply = function (id, conf, num) {
    if(!id || !conf) return;

    var btn = new ccui.Button;
    btn.idx = id;
    btn.num = num;
    btn.loadTextureNormal("img/yuanzheng/bg_wpk" + id + ".png", 1);

    var icon = new ccui.Button;
    icon.loadTextureNormal("img/yuanzheng/daoju" + id + ".png", 1);
    icon.setAnchorPoint(0.5, 0.5);
    icon.setPosition(btn.width / 2, btn.height / 2);
    icon.setTouchEnabled(false);
    btn.addChild(icon);

    var numTxt = new ccui.Text(num, G.defaultFNT, 16);
    numTxt.setTextColor(cc.color("#f6ebcd"));
    numTxt.setAnchorPoint(0.5, 0.5);
    numTxt.setPosition(btn.width / 2 + btn.width / 4, btn.height / 4);
    X.enableOutline(numTxt, "#000000", 2);
    numTxt.zIndex = 999;
    btn.addChild(numTxt);

    var keys = X.keysOfObject(conf.buff);

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

    btn.click(function (sender) {
        G.frame.shizijun_use.data(sender.idx).show();
    });

    return btn;
};