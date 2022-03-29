(function () {
// 显示星级-仅适用于英雄星级显示
G.class.ui_star = function (node, star, scale, conf, yxxx, inter) {
    // 1-5星，用1-5颗小黄星星表示。 img_xing2
    // 6-9星，用1-4颗中大小的红星星表示。 img_xing3
    // 10星，用1颗带特效的大的金星星表示。  img_xing4

    // scale = scale || .9;
    // conf = conf || {};
    var starNum = 0;
    var ico = '';
    var wid = 0;
    if(yxxx){
        wid = -1;
    }else{
        wid = -17;
    }

    if(inter) wid = inter;

    if(star < 6){
        ico = 'img_xing2';
    }else if(star < 10){
        ico = 'img_xing4';
    }else if (star < 14){
        ico = 'img_xing3';
    } else {
        ico = 'img_xing5';
    }


    if (star > 9 && star < 14) {
        X.createStarsLayout(node, star - 9, {
            interval: inter || wid,
            imgstar: 'img/public/' + ico + '.png',
            maxStar: star - 9,
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
                    onload: function (node, action) {
                        node.setScale(.95);
                    }
                });
            }
        });
    } else if (star > 13) {
        X.createStarsLayout(node, star - 13, {
            interval: inter || wid,
            imgstar: 'img/public/' + ico + '.png',
            maxStar: star - 13,
            callback: function (panel) {

            },
            cb: function (target) {
                target.opacity = 0;
                G.class.ani.show({
                    json: "ani_huangguan_xiao",
                    addTo: target,
                    repeat: true,
                    autoRemove: false,
                });
            }
        });
    } else if (star > 5) {
        X.createStarsLayout(node, star - 5, {
            interval: wid,
            imgstar: 'img/public/' + ico + '.png',
            scale: .65,
            maxStar: 5,
            callback: function (item) {

            }
        });
    } else {
        X.createStarsLayout(node,star,{
            interval:wid,
            imgstar:'img/public/' + ico + '.png',
            scale:.65,
            maxStar:5,
            callback: function (panel) {
                var children = panel.getChildren();
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    child.y -= 3;
                }
            }
        });
    }

    //
    // ico = conf.ico || ico;
    // var img = new ccui.ImageView();
    // img.loadTexture('img/public/' + ico + '.png',1);
    // img.setScale(scale);
    //
    // var interval = conf.interval || 0; // 间隔
    // var imgW = img.width * scale;
    // var w = starNum * imgW + (starNum - 1) * interval; // 星星所占宽度
    // var x = (node.width - w) * 0.5; // 星星初始x
    // var arr = [];
    // node.removeAllChildren();
    // // node.setScale(scale);
    // if(star > 9){
    //     G.class.ani.show({
    //         json: "ani_10xingsaoguang",
    //         addTo: node,
    //         x: node.width / 2,
    //         y: node.height / 2,
    //         repeat: true,
    //         autoRemove: false
    //     })
    // }else if(yxxx){
    //     for (var i = 0; i < starNum; i++){
    //         var p = img.clone();
    //
    //         p.setAnchorPoint(0,0);
    //         p.x = x;
    //         p.y = -3;
    //         node.addChild(p);
    //         x += imgW + interval;
    //     }
    // }else {
    //     // for (var i = 0; i < starNum; i++){
    //     //     var p = img.clone();
    //     //
    //     //     arr.push(p);
    //     //     // p.setAnchorPoint(0,0);
    //     //     // p.x = x;
    //     //     // p.y = -3;
    //     //     // node.addChild(p);
    //     //     // x += imgW + interval;
    //     // }
    //     if (star < 6) {
    //         // X.center(arr, node, {
    //         //     scale: scale,
    //         //     interval:-10,
    //         //     callback: function (item) {
    //         //         item.y -= 3;
    //         //     }
    //         // });
    //         X.createStarsLayout(node,star,{
    //             interval:1,
    //             imgstar:'img/public/' + ico + '.png',
    //             scale:.7,
    //             maxStar:5
    //         });
    //     } else {
    //         X.createStarsLayout(item.star,conf.star,{
    //             interval:1,
    //             imgstar:'img/public/' + ico + '.png',
    //             scale:.7,
    //             maxStar:5
    //         });
    //         // X.center(arr, node, {
    //         //     scale: scale - 0.05,
    //         //     interval:-10,
    //         // });
    //     }
    //
    // }

};

})();