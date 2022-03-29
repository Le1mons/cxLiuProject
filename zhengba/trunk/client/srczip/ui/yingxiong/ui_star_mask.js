(function () {
// 升星界面显示的星级, 有黑底
G.class.ui_star_mask = function (node, star, scale, interval) {
    // 1-5星，用1-5颗小黄星星表示。 img_xing2
    // 6-9星，用1-4颗中大小的红星星表示。 img_xing3
    // 10星，用1颗带特效的大的金星星表示。  img_xing4

    scale = scale || 1;
    var starNum = 0;
    var starMax = 0;
    var ico = '';
    if(star < 6){
        starNum = star;
        ico = 'img_xing2';
        starMax = 5;
    }else if(star < 10){
        starNum = star - 5;
        ico = 'img_xing4';
        starMax = 4;
    }else if (star < 14){
        starNum = star - 9;
        ico = 'img_xing3';
        starMax = 1;
    }else {
        starNum = star - 13;
        ico = 'img_xing5';
        starMax = 1;
    }


    interval = interval || 0; // 间隔
    var imgSize = cc.size(40,40);
    var imgW = imgSize.width * scale;
    var w = starMax * imgW + (starMax - 1) * interval; // 星星所占宽度
    var x = (node.width - w) * 0.5; // 星星初始x

    node.removeAllChildren();
    if(star > 9 && star < 14){
        X.createStarsLayout(node, star - 9, {
            imgstar: 'img/public/' + ico + '.png',
            maxStar: star - 9,
            align: "left",
            callback: function (panel) {

            },
            cb: function (target) {
                target.opacity = 0;
                G.class.ani.show({
                    json: "ani_10xingsaoguang",
                    addTo: target,
                    x: target.width / 2,
                    y: target.height / 2,
                    repeat: true,
                    autoRemove: false,
                    cache:true,
                    onload: function (node, action) {
                        node.setScale(.95);
                    }
                });
            }
        });
    }else if (star > 13){
        X.createStarsLayout(node, star - 13, {
            imgstar: 'img/public/' + ico + '.png',
            maxStar: star - 13,
            align: "left",
            callback: function (panel) {

            },
            cb: function (target) {
                target.opacity = 0;
                G.class.ani.show({
                    json: "ani_huangguan_xiao",
                    addTo: target,
                    repeat: true,
                    autoRemove: false,
                    cache:true,
                });
            }
        });
    } else{
        for (var i = 0; i < starMax; i++){
            var p = new ccui.ImageView();
            if(i+1 > starNum){
                p.loadTexture('img/public/img_xing1.png',1);
            }else{
                p.loadTexture('img/public/' + ico + '.png',1);
            }
            p.setScale(scale);
            p.setAnchorPoint(0,0);
            p.x = x;
            p.y = 0;
            node.addChild(p);
            x += imgW + interval;
        }
    }

};

})();