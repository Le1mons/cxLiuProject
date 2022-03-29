(function () {
    G.class.pet = function (data, isAddLvName) {
        var petId = data.pid || data.t || data;
        var item = G.class.itemTemplate();
        var conf = JSON.parse(JSON.stringify(G.gc.pet[petId]));

        item.data = data;
        item.conf = conf;

        if (conf.color !== 0) {
            item.background.loadTexture('img/public/ico/ico_bg' + conf.color + '.png', 1);
        }
        item.icon.loadTextureNormal('ico/petico/' + petId + ".png");
        if (data.lv) {
            item.step.setString("+" + data.lv);
            if (isAddLvName) conf.name += "+" + data.lv;
        }

        if (data.n) {
            item.num.show();
            item.num.setString(data.n);
        } else {
            item.num.hide();
        }

        item.setGou = function (show) {
            var name = arguments[1] || "gou";
            if(!show){
                cc.isNode(item[name]) && item[name].hide();
            }else{
                if(!cc.isNode(item[name])){
                    var imgPath = arguments[1] || "gou";
                    item[name] = new ccui.ImageView('img/public/img_' + imgPath + '.png',1);
                    item[name].setName('gou');
                    item[name].setAnchorPoint(cc.p(0.5,0.5));
                    item[name].setPosition(arguments[2] || cc.p(item.width / 2,item.height / 2));
                    item[name].setLocalZOrder(1000);
                    item.addChild(item[name]);
                    //var imgGou = this.gou;
                }else{
                    item[name].show();
                }
                //imgGou.show();
            }
        };

        return item;
    };
})();