(function () {

    //设置头像数据
    G.class.shead = function (data, showName, item, isAni) {
        item = item || G.class.itemTemplate(cc.size(100,100));
        item.setLv = function(v) {
            var lv = item.lv = new ccui.Text();
            lv.setFontName(G.defaultFNT);
            lv.setString(v);
            lv.setAnchorPoint(1, 0);
            lv.setPosition(cc.p(item.width-5, 5));
            lv.setFontSize(18);
            lv.setFontName(G.defaultFNT);
            lv.setVisible(true);
            X.enableOutline(lv);
            item.addChild(lv);
        };
        if (data == null) {
            item.icon.loadTextureNormal('ico/itemico/15036.png', 0);
            return item;
        }
        item.data = data;
        var ico;
        var zxConf;

        var head_txt = data.head.toString();
        if(head_txt.split("_").length > 1) {
            var head = data.head.split("_")[0];
            head = head.substring(0, head.length - 1);
            head += 'a.png';
            ico = head;
        } else {
            zxConf = G.class.zaoxing.getHeadById(data.head) || G.class.zaoxing.getHeadById('25075');
            ico = zxConf.img;
        }


        item.icon.removeAllChildren();
        if(data.head == 1000) {
            G.class.ani.show({
                x: item.icon.width / 2,
                y: item.icon.height / 2,
                json: "ani_viptouxiangkuang",
                addTo: item.icon,
                repeat: true,
                releaseRes:false,
                autoRemove: false,
            })
        } else {
            item.icon.loadTextureNormal('ico/itemico/' + G.class.fmtItemICON(ico), ccui.Widget.LOCAL_TEXTURE);
        }


        if (data.lv) {
            item.setLv(data.lv);
        }

        item.background.loadTexture('img/public/ico/ico_bg0.png', 1);

        if(data.headborder){
            item.kuang.loadTexture('img/public/head_0'+ data.headborder + '.png', 1);

            if(data.vip && data.vip >= 9 && !isAni) {
                G.class.ani.show({
                    json: data.headborder == 2 ? "ani_vip12zhuanshu" : (data.headborder == 3 ? "ani_wangzekuang" : "ani_viptouxiang"),
                    addTo: item,
                    x: item.width / 2,
                    y: item.height / 2,
                    repeat: true,
                    releaseRes:false,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setTag(12312897);
                        item.tx = node;
                    }
                })
            }else{
                if(cc.isNode(item) && cc.isNode(item.getChildByTag(12312897))){
                    item.removeChildByTag(12312897);
                }
            }
        }



        //数量默认隐藏
        item.num.hide();

        if (showName) {
            setTextWithColor(item.title, data.name, G.gc.COLOR[data.headborder * 1 || 0]);
        }
        return item;
    };

})();
