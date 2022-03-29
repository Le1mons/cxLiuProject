(function () {
// ui_item_wp

// 英雄信息界面的物品图标
G.class.ui_equip_list = function (data, item) {
    item = item || itemTemplate();

    return item;
};

var itemTemplate = function(){
    var ui = new ccui.Layout();
    ui.setAnchorPoint(0.5, 0.5);
    ui.setContentSize(100, 100);

    // 底图
    var panel_ico_di = ui.panel_ico_di = new ccui.Layout();
    panel_ico_di.setBackGroundImage('img/public/ico/ico_bg_hui.png', 1);
    panel_ico_di.setAnchorPoint(0.5, 1);
    panel_ico_di.setContentSize(100, 100);
    panel_ico_di.setPosition(50, 100);
    ui.addChild(panel_ico_di);

    // 头像按钮
    var panel_tx = ui.panel_tx = new ccui.Button();
    panel_tx.setAnchorPoint(0.5, 1);
    panel_tx.setPosition(50, 100);
    panel_tx.setTouchEnabled(false);
    ui.addChild(panel_tx);

    // 左上角的种族图标
    var panel_zz = ui.panel_zz = new ccui.Layout();
    panel_zz.setAnchorPoint(0.5, 1);
    panel_zz.setContentSize(40, 40);
    panel_zz.setPosition(14, 100);
    panel_zz.setScale(0.8);
    ui.addChild(panel_zz);

    // 加号
    var img_jia = ui.img_jia = new ccui.ImageView();
    img_jia.loadTexture('img/public/img_jia.png',1);
    img_jia.setAnchorPoint(0.5, 1);
    img_jia.setPosition(cc.p(84, 100-6));
    ui.addChild(img_jia);
    img_jia.hide();

    // 星星容器
    var panel_xx = ui.panel_xx = new ccui.Layout();
    panel_xx.setName('panel_xx');
    panel_xx.setAnchorPoint(0.5, 0.5);
    panel_xx.setContentSize(30, 16);
    panel_xx.setPosition(ui.width / 2, panel_xx.height);
    ui.addChild(panel_xx);

    var txt_num = ui.txt_num = new ccui.Text();
    txt_num.setString('');
    txt_num.setContentSize(150, 30);
    txt_num.setAnchorPoint(1, 0.5);
    txt_num.setPosition(ui.width - txt_num.width / 2 - 4, txt_num.height / 2);
    txt_num.setFontSize(24);
    txt_num.setFontName(G.defaultFNT);
    txt_num.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    txt_num.setTextColor(cc.color('#0d121b'));
    ui.addChild(txt_num);

    return ui;
};

})();