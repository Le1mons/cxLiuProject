/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_pk';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.showToper();
            X.autoInitUI(me.nodes.panel_1);
            X.autoInitUI(me.nodes.panel_2);
            me.nodes.img_bg.loadTexture("img/bg/img_wjzz_bg" + me.data().camp + ".jpg");

            X.setHeroModel({
                parent: me.nodes.panel_1.nodes.panel_jz_dh1,
                data: {},
                model: "shuijing_boss",
                scaleNum: .8
            });
            X.setHeroModel({
                parent: me.nodes.panel_2.nodes.panel_jz_dh1,
                data: {},
                model: "shuijing_boss",
                scaleNum: .8
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });
            me.nodes.btn_baoming.click(function () {
                if (G.time > X.getTodayZeroTime() + 22 *3600) return G.tip_NB.show(L("JRDTZSJYJS"));
                if (!me.enemyOver) {
                    G.frame.wujunzhizhan_enemy.data({
                        camp: me.data().camp
                    }).show();
                } else {
                    var obj = {
                        pvType:'pvwjzz',
                        isSj: true,
                        camp: me.data().camp
                    };
                    G.frame.yingxiong_fight.data(obj).show();
                }
            });
        },
        refresh: function (callback) {
            var me = this;

            G.frame.wujunzhizhan.getData(function () {
                G.frame.wujunzhizhan_main.setTopInfo();
                G.frame.wujunzhizhan_main.setCampState();
                me.setContents();
                me.setCampState();
                callback && callback();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
            me.initDemo([].concat(me.DATA.log));
        },
        getCampData: function (camp) {
            var data = G.frame.wujunzhizhan.DATA.faction;
            for (var index = 0; index < data.length; index ++) {
                if (data[index].faction == camp) return data[index];
            }
        },
        getData: function (callback) {
            var me = this;

            connectApi("wjzz_main", [me.data().camp], function (data) {
                me.DATA = data;
                callback && callback();
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

            me.setCampState();
            me.setContents();
        },
        setCampState: function () {
            var me = this;

            me.setCamp(me.nodes.panel_2, me.getCampData(me.data().camp));
            me.setCamp(me.nodes.panel_1, me.getCampData(G.frame.wujunzhizhan.DATA.data.faction));
        },
        setCamp: function (ui, data) {
            var campData = data;
            X.render({
                panel_dwz1: function (node) {
                    node.setBackGroundImage("img/wujunzhizhan/img_sj" + campData.faction + ".png", 1);
                },
                txt_whws1: function (node) {
                    var str = campData.live < 1 ? "<font color=#fbe06b>" + L("SHOUSUN") + "</font> " + X.fmtValue(campData.num)
                        : L("WHWS");
                    var rh = X.setRichText({
                        parent: node,
                        str: str,
                        size: 22,
                        color: campData.live < 1 ? "#e34215" : "#ffffff",
                        outline: "#46290e"
                    });
                    rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                },
                panel_wz1: function (node) {
                    var str = campData.live >= 1 ? L("ZhuFang") + " <font color=#ffffff>" + campData.live + "/" + campData.team + "</font>" :
                        L("SHOUSUN") + " <font color=#e34215>" + X.fmtValue(campData.num) + "</font>";


                    // var str = campData.live < 1 ? "<font color=#fbe06b>" + L("SHOUSUN") + "</font> " + X.fmtValue(campData.num)
                    //     : L("ZhuFang") + "：<font color=#ffffff>" + campData.live + "/" + campData.team + "</font>";
                    var rh = X.setRichText({
                        parent: node,
                        str: str,
                        color: "#fbe06b",
                        outline: "#492213",
                    });
                    rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                },
                img_jdt1: campData.live / campData.team * 100
            }, ui.nodes);
        },
        setContents: function () {
            var me = this;
            var enemyData = me.getCampData(me.data().camp);
            me.enemyOver = enemyData.live < 1;
            me.nodes.wz_baoming.setString(enemyData.live < 1 ? L("GDSJ") : L("GDDR"));
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_gdsj.json', ID);
})();