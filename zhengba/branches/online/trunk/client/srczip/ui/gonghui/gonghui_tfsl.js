/**
 * Created by LYF on 2019/2/16.
 */
(function () {
    //公会-讨伐首领
    var ID = 'gonghui_tfsl';

    var fun = X.bUi.extend({
        extConf: {
            bossModel: {
                1: "3109a_boss",
                2: "11065_boss",
                3: "15015_boss1"
            },
            heroModel: "shendian_boss"
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.btn_tdrw.click(function () {

                G.frame.gonghui_ghrw.show();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS30')
                }).show();
            });

            me.nodes.btn_tdlb.click(function () {

                G.frame.gonghui_tfjl.show();
            });

            me.nodes.btn_zm.click(function () {

                if(me.nonum) return G.tip_NB.show(L("TZCSBZ"));

                var obj = {
                    pvType:'pvghtf',
                    idx: me.idx
                };
                G.frame.yingxiong_fight.data(obj).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.idx = G.frame.gonghui_ghrw.DATA.v;
            me.showToper();
            me.setContents();

            cc.enableScrollBar(me.nodes.listview);
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("gonghui", 1, function() {
                G.frame.gonghui_main.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;

            me.setFightAni();
            me.setBaseInfo();
            me.setFightInfo();
        },
        setFightAni: function () {
            var me = this;

            X.addSpine({
                model: G.gc.ghrw.base.boss[me.idx].showid,
                parent: me.nodes.panel_boss,
                pos: {x: me.nodes.panel_boss.width / 2, y: 0, z: 0},
                callbackNode: function (node) {
                    node.runAni(0, "wait", true);
                }
            });

            X.addSpine({
                model: me.extConf.heroModel,
                parent: me.nodes.panel_gjdh,
                pos: {x: me.nodes.panel_gjdh.width / 2, y: 0, z: 0},
                callbackNode: function (node) {
                    node.runAni(0, "animation", true);
                }
            });
        },
        setBaseInfo: function () {
            var me = this;
            var data = G.frame.gonghui_ghrw.DATA;

            me.nodes.txt_sdjsq.setString(X.STR(L("DJC"), data.v));

            me.nodes.img_qp.runAction(
                cc.sequence(
                    cc.callFunc(function () {
                        me.nodes.txt_qp.setString(G.gc.qyjj.base.wenzipao[X.rand(1, 20)]);
                    }),
                    cc.fadeIn(1),
                    cc.moveBy(3, 0, 0),
                    cc.fadeOut(1)
                ).repeatForever()
            );

            var model;
            var useList = G.frame.gonghui_main.DTDATA.userlist;
            for (var i in useList) {
                if(useList[i].power == 0) {
                    model = useList[i].headdata.model || useList[i].headdata.head;
                    break;
                }
            }

            X.addSpine({
                model: model,
                parent: me.nodes.panel_rwjs,
                pos: {x: me.nodes.panel_rwjs.width / 2, y: 0, z: 0},
                callbackNode: function (node) {
                    node.runAni(0, "wait", true);
                    node.setScale(.5);
                }
            });
        },
        setFightInfo: function () {
            var me = this;
            var data = G.frame.gonghui_ghrw.DATA;

            me.nodes.text_cs.setString(data.fightnum + "/" + 5);

            if(data.fightnum < 1) {
                me.nonum = true;

                me.nodes.btn_zm.setBright(false);
                me.nodes.btn_zm.children[0].setTextColor(cc.color("#6c6c6c"));
            }

            var maxhp = data.maxhp;
            var curhp = 0;

            if(!data.maxhp) {
                maxhp = 100;
                curhp = 100;
                hp = 100;
            } else {
                for (var i in data.pos2hp) {
                    curhp += data.pos2hp[i];
                }

                var hp = curhp / maxhp * 100;
            }

            me.nodes.txt_xtbfb.setString(hp.toFixed(2) + "%");
            me.nodes.img_xueliang.setPercent(curhp / maxhp * 100);

            if(data.rank.length < 1) return cc.isNode(me.nodes.img_zw) && me.nodes.img_zw.show();

            cc.isNode(me.nodes.img_zw) && me.nodes.img_zw.hide();

            me.nodes.listview.removeAllChildren();
            for (var i = 0; i < data.rank.length; i ++) {
                (function (key, data) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    list.nodes.txt_name.setString(key + 1);
                    list.nodes.txt_qf.setString(data.name);
                    if(P.gud.name == data.name) list.nodes.txt_qf.setTextColor(cc.color("#30ff01"));
                    list.nodes.txt_sy1.setString(X.fmtValue(data.dps));
                    list.show();
                    me.nodes.listview.pushBackCustomItem(list);
                })(i, data.rank[i]);
            }
        }
    });
    G.frame[ID] = new fun('shendianzhilu_dcjsq.json', ID);
})();