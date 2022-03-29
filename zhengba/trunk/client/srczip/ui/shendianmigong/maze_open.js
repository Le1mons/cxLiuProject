/**
 * Created by LYF on 2019/7/30.
 */
(function () {
    //神殿迷宫-开启挑战
    var ID = 'maze_open';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.ui.finds("scrollview"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
                G.frame.maze.remove();
            });

            me.nodes.btn_qw.click(function () {

                if (me.heroTidArr.length < 1) return G.tip_NB.show(L("ZWYBJYSYX"));

                me.ajax("maze_prepare", [], function (str, data) {
                    if (data.s == 1) {
                        G.hongdian.getData("fashita", 1, function () {
                            G.frame.julongshendian.checkRedPoint();
                            G.frame.maze.getData(function () {
                                G.frame.maze.setContents();
                                G.frame.maze.setViewInfo();
                                G.frame.maze.setCountdown();
                            });
                        });
                        G.tip_NB.show(L("KQTZCG"));
                        me.remove();
                    }
                });
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

            me.setTable();
        },
        onHide: function () {
            var me = this;
        },
        getHeroData: function () {
            var me = this;
            var tidArr = [];
            var allHeroData = G.DATA.yingxiong.list;

            for (var tid in allHeroData) {
                if (allHeroData[tid].lv > G.gc.mazecom.base.herolv) tidArr.push(tid);
            }

            return tidArr;
        },
        setTable: function () {
            var me = this;
            var data = me.heroTidArr = me.getHeroData();

            me.nodes.img_zw && me.nodes.img_zw.setVisible(data.length == 0);

            var table = new X.TableView(me.ui.finds("scrollview"), me.nodes.list, 4, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 23);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var hero = G.class.shero(G.DATA.yingxiong.list[data]);
            hero.setPosition(ui.width / 2, ui.height / 2);
            hero.setNQ(100, true);
            hero.setHP(100, true);
            ui.removeAllChildren();
            ui.addChild(hero);
            ui.setTouchEnabled(false);
        }
    });
    G.frame[ID] = new fun('shendianmigong_sdmg.json', ID);
})();