(function () {

// 英雄信息界面的技能图标
G.class.ui_skill_list = function (data, showTip, item, is, conf) {
    item = item || itemTemplate();

    item.data = data;

    //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
    item.ico_jn.loadTextureNormal('ico/skillico/' + data.ico + '.png', 0);
    //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    if(data.lv > 1){
        item.txt_dj.setString(data.lv);
        item.panel_dj.show();
    }else{
        if(conf && conf.star > 5){
            item.txt_dj.setString('2');
            item.panel_dj.show();
        }else{
            item.txt_dj.setString('');
            item.panel_dj.hide();
        }

    }
    data.is = is;

    item.ico_jn.setBright(!data.lock);

    if(showTip){
        item.ico_jn.setZoomScale(0);
        item.ico_jn.touch(function (sender, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                // cc.log('show~~~~~~~~', data.intr)
                G.frame.yingxiong_skill_xq.data(data).show();
            }else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_NOMOVE || type == ccui.Widget.TOUCH_CANCELED) {
                sender.setTimeout(function () {
                    if (G.frame.yingxiong_skill_xq.isShow) {
                        G.frame.yingxiong_skill_xq.remove();
                    }
                },100);


                // cc.log('hide~~~~~~~~')
            }
        });
    }

    return item;
};

var itemTemplate = function(){
    var ui = new ccui.Layout();
    ui.setAnchorPoint(0.5, 0.5);
    ui.setContentSize(88, 100);



    var ico_jn = ui.ico_jn = new ccui.Button();
    ico_jn.setName('ico_jn');
    ico_jn.setTouchEnabled(true);
    // ico_jn.loadTextureNormal('img/jineng/ico_jn1.png',1);
    ico_jn.setAnchorPoint(0.5, 0.5);
    ico_jn.setPosition(44, 50);
    ui.addChild(ico_jn);

    // var ico_bg = ui.ico_bg = new ccui.ImageView;
    // ico_bg.setName("ico_bg");
    // ico_bg.setAnchorPoint(0.5, 0.5);
    // ico_bg.loadTexture("img/public/bg_yuan.png", 1);
    // ico_bg.setPosition(44, 50);
    // ui.addChild(ico_bg);

    var panel_dj = ui.panel_dj = new ccui.Layout();
    panel_dj.setName('panel_dj');
    panel_dj.setBackGroundImage('img/public/bg_yuan1.png', 1);
    panel_dj.setAnchorPoint(0.5, 0.5);
    panel_dj.setContentSize(31, 31);
    panel_dj.setPosition(0, 86);
    ui.addChild(panel_dj);

    var txt_dj = ui.txt_dj = new ccui.Text();
    txt_dj.setName('txt_dj');
    txt_dj.setString('');
    txt_dj.x = 15;
    txt_dj.y = 14;
    // txt_dj.width = 60;
    txt_dj.setContentSize(60, 30);
    txt_dj.setAnchorPoint(0.5, 0.5);
    txt_dj.setFontSize(20);
    txt_dj.setFontName(G.defaultFNT);
    txt_dj.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    txt_dj.setTextColor(cc.color('#ffcb3f'));
    panel_dj.addChild(txt_dj);

    return ui;
};

})();
