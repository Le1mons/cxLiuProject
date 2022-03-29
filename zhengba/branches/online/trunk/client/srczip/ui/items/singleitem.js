(function () {
    G.class.getItem = function (itemid, type) {
        if (type == 'attr') {
            return G.class.attricon.getById(itemid);
        }
        if (type == 'hero') {
            return G.class.hero.getById(itemid);
        }
        if (type == 'equip') {
            return G.class.equip.getById(itemid);
        }
        if (type == 'baoshi') {
            return G.class.baoshi.getById(itemid);
        }
        if (type == 'shipin') {
            return G.class.shipin.getById(itemid);
        }
        if (type == "glyph") {
            return G.class.glyph.getById(itemid);
        }
        var conf = G.gc.item[itemid];
        if (!conf) {
            cc.log(itemid + '物品配置不存在');
            return null;
        }
        return conf;
    };

    G.class.getItemByType = function (tid, type) {
        if (type == 'item'){
            return G.class.getItem(tid);
        }
        if (type == 'attr'){
            return G.class.attricon.getById(tid);
        }
        // if (type == 'shili'){
        //     return G.class.attr.getAttr(tid);
        // }
        // if (type == 'hero'){
        //     return G.class.hero.getHeroById(tid);
        // }
        // if (type == 'jianhun') {
        //     return G.class.jianhun.getById(tid);
        // }
        // if (type == 'shenbing') {
        //     return G.class.shenbing.getById(tid);
        // }
    };

    G.class.getItemIco = function (itemid) {
        if (G.class.attricon.getById(itemid)) {
            return G.class.attricon.getById(itemid).ico;
        } else {
            var ico = G.class.getItem(itemid).ico;
            if (ico) {
                return 'img/public/token/' + ico + '.png';
            } else {
                return G.class.getItem(itemid).img;
            }
        }
    };
    G.class.getItemImg = function(itemId) {
        if (G.class.attricon.getById(itemId)) {
            return G.class.attricon.getById(itemId).img;
        } else {
            var img = G.class.getItem(itemId).img;
            if (img) {
                return 'ico/itemico/' + img + '.png';
            } else {
                return G.class.getItem(itemId).img;
            }
        }
    };
    //获得玩家拥有的数量
    G.class.getOwnNum = function (id, type) {
        var me = this;

        var value = 0;
        switch (type) {
            case 'attr':
                value =  P.gud[id];
                break;
            case 'item':
                value = G.frame.beibao.getItemNumByTypeid(id) || 0;
                break;
            default:
                value = 0;
                break;
        }

        return value;
    };

    G.class.itemTemplate = function (size) {
        size = size || cc.size(100, 100);
        var ui = new ccui.Layout();
        ui.setAnchorPoint(0.5, 0.5);
        ui.setContentSize(size);
        ui.setHighlight = function (v) {
            //需要废弃
            // if (v && !this._hl) {
            //     var hl = new ccui.ImageView();
            //     hl.setPosition(ui.width * .5, ui.height * .5);
            //     hl.setAnchorPoint(0.5, 0.5);
            //     hl.loadTexture('img/public/ico/ico_xzk.png', 1);
            //     ui.addChild(hl);
            //     this._hl = hl;
            // } else if (!v && this._hl) {
            //     this._hl.removeFromParent();
            //     delete this._hl;
            // }
        };
        var bg = ui.background = new ccui.ImageView();
        bg.setName('bg');
        bg.loadTexture('img/public/ico/ico_bg_hui.png', 1);
        bg.x = ui.width * .5;
        bg.y = ui.height * .5;
        ui.addChild(bg);


        var icon = ui.icon = new ccui.Button();
        icon.setName('icon');
        icon.x = ui.width * .5;
        icon.y = ui.height * .5;
        icon.setTouchEnabled(false);
        ui.addChild(icon);

        var kuang = ui.kuang = new ccui.ImageView();
        kuang.setName('kuang');
        // kuang.loadTexture('img/public/ico/ico_bg99.png', 1);
        kuang.x = ui.width * .5;
        kuang.y = ui.height * .5;
        ui.addChild(kuang);

        var num = ui.num = new ccui.Text();
        num.setName('num');
        num.setString('0');
        num.setFontSize(22);
        num.setFontName(G.defaultFNT);
        num.enableShadow(cc.color(0, 0, 0, 255), cc.size(1, -1));
        X.enableOutline(num, "#2a1c0f", 2);
        num.setAnchorPoint(cc.p(1,0.5));
        num.setPosition(ui.width - num.width / 2 - 2, num.height / 2 + 2);
        ui.addChild(num);

        var title = ui.title = new ccui.Text();
        title.setName('title');
        title.setString('');
        title.x = ui.width / 2;
        title.y = -20;
        title.width = ui.width;
        title.setAnchorPoint(C.ANCHOR[8]);
        title.setFontSize(19);
        title.enableShadow(cc.color(0, 0, 0, 255), cc.size(1, -1));
        title.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        title.setTextColor(cc.color('#4B3507'));
        ui.addChild(title);

        var effect = ui.effect = new ccui.Layout;
        effect.setName('effect');
        effect.x = ui.width * .5;
        effect.y = ui.height * .5;
        ui.addChild(effect);

        var panel_zz = ui.panel_zz = new ccui.Layout();
        panel_zz.setAnchorPoint(0.5, 0.5);
        panel_zz.setContentSize(32, 32);
        panel_zz.setPosition(panel_zz.width / 2, ui.height - panel_zz.height / 2);
        ui.addChild(panel_zz);

        // var panel_xx = ui.panel_xx = new ccui.Layout();
        // panel_xx.setAnchorPoint(0.5, 0.5);
        // panel_xx.setContentSize(90, 0);
        // panel_xx.setPosition(65, 19);
        // ui.addChild(panel_xx);

        // 星星容器
        var panel_xx = ui.panel_xx = new ccui.Layout();
        panel_xx.setName('panel_xx');
        panel_xx.setAnchorPoint(0.5, 0.5);
        panel_xx.setContentSize(30, 16);
        panel_xx.setPosition(ui.width / 2, panel_xx.height);
        ui.addChild(panel_xx);

        return ui;
    };

    /**
     *  格式化所属物品格式
     * @param d 物品数据
     * @param target
     * @param fmt 格式
     */
    G.class.fmtItemNeed = function (d, target, fmt) {
        fmt = fmt || '{1}：{2}';
        var c = G.class.getItem(d.t),
            cn = G.frame.beibao.getItemNum(d.t);
        var str = X.STR(fmt, c.name, cn + '/' + d.n);
        if (!target) {
            return str;
        }
        setTextWithColor(target, str, G.gc.COLOR[d.n > cn ? 5 : 1], 'label');
    };

})();