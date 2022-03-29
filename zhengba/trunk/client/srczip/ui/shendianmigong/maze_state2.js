/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-神殿守卫/神殿精英/神殿魔王
    var ID = 'maze_state2';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);

            me.nodes.tip_title.setString(L("SDEVENT" + me.DATA.gridData.event));

            me.nodes.txt_jlwz.setString(L("maze_sw" + me.DATA.gridData.event));

            if (me.DATA.gridData.event != 2) {
                me.nodes.panel_sdjy.removeBackGroundImage();
                G.class.ani.show({
                    json: me.DATA.gridData.event == "3" ? "ani_shendianmigong_xiaobing2" : "ani_shendianmigong_boss",
                    addTo: me.nodes.panel_sdjy,
                    repeat: true,
                    releaseRes:false,
                    autoRemove: false
                });
            } else {
                me.nodes.panel_sdjy.setBackGroundImage("img/shendianmigong/img_sdmg_sdsw" + me.DATA.gridData.event + ".png", 1);
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_qw.click(function () {

                G.frame.yingxiong_fight.data({
                    pvType:'pvmaze',
                    data: {
                        step: me.DATA.step,
                        index: me.DATA.index,
                        prize: me.DATA.gridData.prize,
                        isBoss: me.DATA.gridData.event == 4,
                        name: L("SDEVENT" + me.DATA.gridData.event)
                    }
                // }).once("hide", function () {
                //     me.remove();
                }).show();
                me.remove();
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
            var fightless = G.frame.maze.DATA.data.fightless || {};

            for (var i = 0; i < data.hero.length; i ++) {
                var heroData = data.hero[i];
                if (heroData.hid) {
                    var wid = G.class.shero(heroData);
                    var info = me.DATA.isClick ? fightless[heroData.pos] || {} : {};
                    var nq = info.nuqi != undefined ? info.nuqi : 50;
                    var hp = info.hp != undefined ? info.hp : 100;
                    wid.setNQ(nq, true);
                    wid.setHP(hp, true);
                    if (hp <= 0) {
                        wid.setEnabled(false);
                        wid.setGou(true, "img_yzw");
                    }
                    hero.push(wid);
                }
            }

            X.center(hero, me.nodes.panel_tx, {
                scale: .8,
                callback: function (node) {
                    node.y = 60;
                }
            });

            X.alignCenter(me.nodes.panel_wpsl, [].concat([{a: "item", t: "yiwu", n: 0}], data.prize), {
                touch: true
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_sdsw.json', ID);
    G.frame["maze_state3"] = new fun('shendianmigong_sdsw.json', ID);
    G.frame["maze_state4"] = new fun('shendianmigong_sdsw.json', ID);
})();