/**
 * Created by LYF on 2019/8/1.
 */
(function () {
    //神殿迷宫-英雄列表
    var ID = 'maze_herolist';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
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
        setTable: function () {
            var me = this;
            var heroArr = G.frame.maze.DATA.hero;
            me.status = G.frame.maze.DATA.data.status || {};

            var zz = {
                5:1, //神圣
                6:0, //暗影
                4:2, //自然
                3:4, //邪能
                2:5, //奥术
                1:6 //亡灵
            };
            heroArr.sort(function (a, b) {
                if(a.star != b.star) {
                    return a.star > b.star ? -1 : 1;
                } else if(a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else if(G.gc.hero[a.hid].zhongzu != G.gc.hero[b.hid].zhongzu) {
                    return zz[G.gc.hero[a.hid].zhongzu] < zz[G.gc.hero[b.hid].zhongzu] ? -1 : 1;
                } else if(a.hid != b.hid) {
                    return a.hid * 1 > b.hid ? -1 : 1;
                } else {
                    return a.zhanli > b.zhanli ? -1 : 1;
                }
            });

            cc.enableScrollBar(me.ui.finds("scrollview"));
            var table = new X.TableView(me.ui.finds("scrollview"), me.nodes.list, 4, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 23);
            table.setData(heroArr);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            var status = me.status[data.tid] || {};
            var nq = status.nuqi != undefined ? status.nuqi : 50;
            var hp = status.hp != undefined ? status.hp : 100;

            var hero = G.class.shero(data, null, null, G.DATA.yingxiong.list[data.tid] ? false : true);
            hero.setPosition(ui.width / 2, ui.height / 2);
            hero.setNQ(nq, true);
            hero.setHP(hp, true);
            if (hp <= 0) {
                hero.setEnabled(false);
                hero.setGou(true, "img_yzw");
            }
            ui.tid = data.tid;
            ui.removeAllChildren();
            ui.addChild(hero);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.DATA.noClick = true;
                    me.ajax("maze_herodata", [sender.tid], function (str, dd) {
                        if (dd.s == 1) {
                            G.DATA.noClick = false;
                            G.frame.yingxiong_jianjie.data({
                                data: dd.d,
                                hideBtn: true
                            }).show();
                        } else {
                            G.DATA.noClick = false;
                        }
                    });
                }
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_yx.json', ID);
})();