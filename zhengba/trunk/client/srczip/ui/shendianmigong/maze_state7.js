/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-灵魂医者
    var ID = 'maze_state7';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);
            me.nodes.txt_wzxiug.setString(L("maze_sw7"));

            X.setHeroModel({
                parent: me.nodes.panel_csm,
                data: {},
                model: "13045"
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_qw.click(function () {

                G.frame.maze.mazeChange([me.DATA.index, me.DATA.step], function (data) {
                    G.tip_NB.show(X.STR(L("maze_event6"), me.getHeroName(data.tid)));
                    me.remove();
                });
            });
        },
        getHeroName: function (tid) {
            var hero = G.frame.maze.DATA.hero;

            for (var i in hero) if (hero[i].tid == tid) return G.gc.hero[hero[i].hid].name;

            return "";
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianmigong_lhyz.json', ID);
})();