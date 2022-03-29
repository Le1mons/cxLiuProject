/**
 * Created by LYF on 2019/9/24.
 */
(function () {
    //虚空魔王-挑战
    var ID = 'xukongmowang_tz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_1.click(function () {
                if (me.data().DATA.myinfo.val >= G.gc.xkfb.dailynum) return G.tip_NB.show(L("JRTZCSBZ"));

                G.frame.yingxiong_fight.data({
                    pvType: 'xkfb',
                    hdid: me.data()._data.hdid,
                    from: me.data(),
                    from1: me
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.data().DATA;
            var index = me.data().selectIndex;
            var bossIndex = data.myinfo.boss || 0;
            if (index != undefined) bossIndex = index;
            var prize = G.gc.xkfb.prize[bossIndex];
            var bossConf = G.gc.xkfb.challengesort;
            var bosData = G.gc.xkfb.mowang[bossConf[bossIndex]];
            var canIndex = data.myinfo.boss || 0;
            var txtImg = me.nodes.panel_wzms;

            if (index == 5) {
                txtImg.setBackGroundImage("img/xukomowang/img_wz_jl.png", 1);
            }
            if (data.myinfo.over) {
                txtImg.setBackGroundImage("img/xukomowang/img_wz_jxtz.png", 1);
            }

            X.alignCenter(me.nodes.panel_jl, prize.fight, {
                touch: true
            });

            me.nodes.btn_1.setVisible(canIndex == bossIndex);
            me.nodes.img_wkq.setVisible(canIndex != bossIndex);

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: bosData.boss[0],
                model: index == 0 ? bosData.boss[0].heroico : bosData.boss[0].model
            });

            var skillArr = [];
            for (var i = 0; i < bosData.intr.length; i ++) {
                var skillIco = G.class.bossInfo(null, null, bosData.intr[i]);
                skillArr.push(skillIco);
            }
            X.center(skillArr, me.nodes.panel_jineng);

            var hp = data.myinfo.mowanghp ? (data.myinfo.mowanghp <= 0 ? 0 : data.myinfo.mowanghp) : 100;
            if (canIndex != bossIndex) hp = 100;
            me.nodes.img_jdt.setPercent(hp);
            cc.sys.isNative && me.ui.finds("Text_3").setString(hp + "%");
        }
    });
    G.frame[ID] = new fun('event_xkfb.json', ID);
})();