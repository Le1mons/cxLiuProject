(function () {
// 显示品级
G.class.ui_pinji = function (node, pinji, scale , star,num) {
    scale = scale || 1;
    node.removeAllChildren();

    var x = 0;
    var star = (star && star < 7 && star + 1 ) || 7;
    for (var i = 1; i < (num || star); i++){
        var img = new ccui.ImageView();
        if(i > pinji){
            img.loadTexture('img/public/img_pinjie1.png',1);
            img.ani = true;
        }else{
            img.loadTexture('img/public/img_pinjie2.png',1);
        }
        img.setScale(scale);
        img.setAnchorPoint(0,0);
        img.x = x;
        img.y = 0;
        node.addChild(img);

        x += img.width * scale + 4;
    }
};

})();