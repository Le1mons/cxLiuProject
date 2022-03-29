/**
 * Created by LYF on 2019/8/1.
 */
(function () {
    //
    var ID = 'lianhunta_help';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.selectTid = G.frame.lianhunta.DATA.borrow;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_tx.click(function () {
                if(!me.selectTid) return G.tip_NB.show(L("WUJIANGLZ_QXZPQ"));
                me.ajax('lianhunta_borrow', [me.selectTid], function (str, data) {
                    if (data.s == 1) {
                        G.frame.lianhunta.DATA.borrow = me.selectTid;
                        me.remove();
                    }
                });
            });
        },
        onShow: function () {
            var me = this;
            me.selectZZBtn();
            cc.enableScrollBar(me.nodes.scrollview);
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(isToTop){
            var me = this;
            me.heroArray = [];
            var data = me.herolist = me.heroSort();
            me.nodes.img_zwnr.setVisible(data.length == 0);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 0, 0);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isToTop||false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.removeAllChildren();
            ui.show();
            var heroData = G.DATA.yingxiong.list[data];
            var hero = new G.class.shero(heroData);
            hero.setScale(0.8);
            hero.setPosition(ui.width / 2, ui.height / 2);
            hero.setGou(data == me.selectTid)
            ui.addChild(hero);
            ui.hero = hero;
            ui.data = data;
            me.heroArray.push(ui);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.selectTid = data;
                    me.setContents();
                }
            });

        },
        selectZZBtn: function() {
            var me = this;
            var raceArr = me.raceArr = [];

            for (var i = 0; i < 7; i ++) {
                var ico = me.nodes.list_ico.clone();
                X.autoInitUI(ico);
                ico.show();
                ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                ico.nodes.panel_zz.zz = i;
                ico.zz = i;
                raceArr.push(ico);
            }
            X.center(raceArr, me.nodes.panel_1, {
                callback: function (node) {
                    node.nodes.panel_zz.click(function (sender) {
                        if(me.zhongzu == sender.zz) return;
                        me.zhongzu = sender.zz;
                        me.setContents(true);
                        for (var i in raceArr) {
                            if(raceArr[i].zz != sender.zz) {
                                raceArr[i].nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (parseInt(i) + 1) + '.png', 1);
                                //raceArr[i].nodes.img_yuan_xz.hide();
                            } else {
                                raceArr[i].nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (parseInt(i) + 1) + '_g.png', 1);
                                //raceArr[i].nodes.img_yuan_xz.show();
                            }
                        }
                    });
                }
            });
            raceArr[0].nodes.panel_zz.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        heroSort: function () {
            var me = this;
            var arr = [];
            var zhongzu = me.zhongzu;
            var heroArr = [];

            var data = G.DATA.yingxiong.list;
            if(zhongzu == 0) {
                for (var i in data) {//橙色以下的不要，已经在外援列表中的不要
                    if (data[i].zhongzu != '7'){
                        arr.push(data[i]);
                    }
                }
            } else {
                for (var i in data) {
                    if(data[i].zhongzu == zhongzu) {
                        arr.push(data[i]);
                    }
                }
            }
            arr.sort(function (a, b) {
                var zz = {
                    2: 1,
                    4: 2,
                    3: 3,
                    1: 4,
                    5: 5
                };
                acolor = G.gc.hero[a.hid].color;
                bcolor = G.gc.hero[b.hid].color;
                var isXzA = G.frame.lianhunta.DATA.borrow == a.tid;
                var isXzB = G.frame.lianhunta.DATA.borrow == b.tid;
                if (isXzA != isXzB) {
                    return isXzA > isXzB ? -1 : 1;
                }else if(acolor != bcolor) {
                    return acolor > bcolor ? -1 : 1;
                } else if(a.star != b.star) {
                    return a.star > b.star ? -1 : 1;
                } else if(a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else if(zz[a.zhongzu] != zz[b.zhongzu]) {
                    return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                } else if(a.hid != b.hid) {
                    return a.hid > b.hid ? -1 : 1;
                } else {
                    return a.zhanli > b.zhanli ? -1 : 1;
                }
            });

            for (var i = 0; i < arr.length; i ++) {
                heroArr.push(arr[i].tid);
            }
            return heroArr;
        },
    });
    G.frame[ID] = new fun('jiban_xzwy.json', ID);
})();