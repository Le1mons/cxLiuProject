/**
 * Created by
 */
(function () {
    //
    var ID = 'yingxiongyure_yxyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        bindBtn: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.initUi();
        },
        onHide: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.plid = me.data().plid;
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.setHero();
        },
        setHero:function(){
            var me = this;
            var hid = G.class.hero.getHeroByPinglun(me.plid)[0].hid;
            var heroconf = G.class.hero.getById(hid);
            me.nodes.tip_title.setString(heroconf.name);
            me.nodes.panel_xx.removeAllChildren();
            for (var i=0;i<5;i++){
                var img = new ccui.ImageView('img/public/img_xing2.png', 1);
                img.setAnchorPoint(0, 0);
                img.setPosition(0,40*i);
                me.nodes.panel_xx.addChild(img);
            }
            me.nodes.panel_rw.removeBackGroundImage();
            me.nodes.panel_rw.removeAllChildren();
            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: hid,
                noRelease: true,
                cache: false,
                callback: function (node) {
                    node.y = 50;
                },
            });
            me.setSkillIcon(hid);
        },
        setSkillIcon: function (hid) {
            var me = this;
            var interval = 16;
            var conf = G.class.hero.getById(hid);
            var skillList = G.class.hero.getSkillList(hid, 6);
            var w = skillList.length * 88 + (skillList.length - 1) * interval;
            var x = (me.nodes.panel_jn.width - w) * 0.5;
            var btn_num = 0;
            for (var i = 0; i < conf.bdskillopendjlv.length; i++) {
                if (5 >= conf.bdskillopendjlv[i]) {
                    ++btn_num;
                }
            }

            me.nodes.panel_jn.removeAllChildren();

            for (var i = 0; i < skillList.length; i++) {
                var p = G.class.ui_skill_list(skillList[i], true, null, null, null);
                p.setAnchorPoint(0, 0);
                p.x = x;
                p.y = -9;
                p.panel_dj.hide();
                me.nodes.panel_jn.addChild(p);
                x += 88 + interval;
            }
        },
    });
    G.frame[ID] = new fun('yingxiongyure_tk1.json', ID);
})();