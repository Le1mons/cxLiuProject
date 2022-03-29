/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_enemy';

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

            me.nodes.btn_sx.click(function () {
                me.ajax("wjzz_refresh", [me.data().camp], function (str, data) {
                    if (data.s == 1) {
                        G.frame.wujunzhizhan_pk.DATA.num ++;
                        me.DATA = data.d.rival;
                        me.setContents();
                    } else {
                        G.tip_NB.show(L("wjzz_zf_over"));
                        G.frame.wujunzhizhan_pk.refresh();
                        me.remove();
                    }
                });
            });
            me.nodes.btn_kz.click(function () {
                if (G.time > X.getTodayZeroTime() + 22 *3600) return G.tip_NB.show(L("JRDTZSJYJS"));
                var obj = {
                    pvType:'pvwjzz',
                    isSj: false,
                    camp: me.data().camp
                };
                G.frame.yingxiong_fight.data(obj).show();
            });
            me.ui.finds("ui").click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        getData: function (callback) {
            var me = this;

            connectApi("wjzz_rival", [me.data().camp], function (data) {
                me.DATA = data;
                callback && callback();
            }, function () {
                G.tip_NB.show(L("wjzz_zf_over"));
                G.frame.wujunzhizhan_pk.refresh();
                me.remove();
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents: function () {
            var me = this;
            var camp = me.data().camp;
            X.render({
                txt_name: me.DATA.headdata.name || "",
                panel_wz1: function (node) {
                    node.setBackGroundImage("img/wujunzhizhan/img_wz" + camp + ".png", 1);
                },
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        data: me.DATA.headdata
                    });
                },
                img_jdt: function (node) {
                    var hp = 0;
                    var maxHp = 0;
                    for (var index = 0; index < me.DATA.data.length; index ++) {
                        var heroInfo = me.DATA.data[index];
                        if (!heroInfo.hid) continue;
                        if (heroInfo.pos == 7) continue;
                        maxHp += 100;
                        hp += me.DATA.status && me.DATA.status[heroInfo.pos] != undefined ? me.DATA.status[heroInfo.pos] : 100;
                    }
                    var per = hp / maxHp * 100;
                    node.setPercent(per);
                    me.nodes.txt_wzdj.setString(parseInt(per) + "%");
                },
                txt_yj: G.gc.wjzz.base.refresh - G.frame.wujunzhizhan_pk.DATA.num,
                panel_wp014: function (node) {
                    var arr = [];
                    for (var index = 0; index < me.DATA.data.length; index ++) {
                        var heroInfo = me.DATA.data[index];
                        if (!heroInfo.hid) continue;
                        if (heroInfo.pos == 7) continue;
                        var list = me.nodes.panel_tx.clone();
                        var hp = me.DATA.status && me.DATA.status[heroInfo.pos] != undefined ? me.DATA.status[heroInfo.pos] : 100;
                        X.autoInitUI(list);
                        X.render({
                            panel_ico: function (node) {
                                var hero = G.class.shero(heroInfo);
                                hero.setPosition(node.width / 2, node.height / 2);
                                node.addChild(hero);
                                hero.setEnabled(hp > 0);
                            },
                            jdt_hp: hp,
                            jdt_sp: hp < 0 ? 0 : heroInfo.nuqi
                        }, list.nodes);
                        list.show();
                        list.setAnchorPoint(0.5, 0.5);
                        arr.push(list);
                    }
                    X.center(arr, node);
                },
                btn_sx: function (node) {
                    node.setEnableState(G.gc.wjzz.base.refresh - G.frame.wujunzhizhan_pk.DATA.num > 0);
                }
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_goda.json', ID);
})();