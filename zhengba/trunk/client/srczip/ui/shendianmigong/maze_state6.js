/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-灵魂囚笼
    var ID = 'maze_state6';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);
            me.nodes.txt_jlwz.setString(L("maze_sw6"));

            G.class.ani.show({
                json: "ani_shendianmigong_chizi",
                addTo: me.nodes.panel_csm,
                repeat: true,
                releaseRes:false,
                autoRemove: false
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_qw.click(function () {
                if (me.selectIndex == undefined) return G.tip_NB.show(X.STR(L("QXZXGYXJJ"), 1));

                G.frame.maze.mazeChange([me.DATA.index, me.DATA.step, me.selectIndex], function () {
                    G.tip_NB.show(me.DATA.gridData.hero[me.selectIndex].name + L("YYWNXL"));
                    me.remove();
                });
            });
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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var hero = [];
            var data = me.DATA.gridData;

            for (var i = 0; i < data.hero.length; i ++) {
                var heroData = data.hero[i];
                var wid = G.class.shero(heroData, true);
                wid.title.setFontSize(20);
                wid.title.y = -16;
                // wid.setNQ(heroData.nuqi / heroData.maxnuqi * 100, true);
                // wid.setHP(heroData.hp / heroData.maxhp * 100, true);
                hero.push(wid);
            }

            X.center(hero, me.nodes.txt_wzcs, {
                scale: .9,
                callback: function (node) {
                    node.y = 71;
                    node.setTouchEnabled(true);
                    node.click(function (sender) {
                        if (me.sender) me.sender.setGou(false);
                        sender.setGou(true);
                        me.sender = sender;
                        me.selectIndex = sender.index;
                    });
                }
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_lhql.json', ID);
})();