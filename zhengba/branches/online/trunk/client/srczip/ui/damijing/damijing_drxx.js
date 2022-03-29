/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //大秘境-敌人信息
    var ID = 'damijing_drxx';

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
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
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
            var layout = me.ui.finds("panel_yx");
            var arr = [];
            for(var i in me.DATA.herolist) {
                var data = me.DATA.herolist[i];
                var wid = G.class.shero(data);
                var hp = me.DATA.fightless ? (me.DATA.fightless.hp / me.DATA.fightless.maxhp * 100) : (data.hp / data.maxhp * 100)
                wid.setNQ(data.nuqi / data.maxnuqi * 100, true);
                wid.setHP(hp, true);
                arr.push(wid);
            }
            X.center(arr, layout, {
                scale: arr.length > 4 ? .8 : 1
            });
        },
    });
    G.frame[ID] = new fun('ui_top8.json', ID);
})();