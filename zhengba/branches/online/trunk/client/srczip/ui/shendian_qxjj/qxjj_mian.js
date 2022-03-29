/**
 * Created by LYF on 2019/1/9.
 */
(function () {
    //群雄集结
    var ID = 'qxjj_main';

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
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            var data = me.DATA.data || me.DATA;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            if(P.gud.uid != data.uid) me.nodes.btn_zm.hide();
            if(me.DATA.num < 1) {
                me.nodes.btn_zm.setBright(false);
                me.nodes.btn_zm.setTouchEnabled(false);
            }
            me.nodes.btn_zm.click(function () {

            });

            me.nodes.btn_tdlb.click(function () {
                if(G.frame.shendian_qxjj.isShow) {
                    G.frame.shendian_qxjj.remove();
                    G.frame.shendian_qxjj.once("close", function () {
                        G.frame.shendian_qxjj.show();
                    });
                } else {
                    G.frame.shendian_qxjj.show();
                }

            });
        },
        onOpen: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
            me.setBaseInfo();
            me.showToper();
            me.setContents();
            me.setFightAni();
            cc.enableScrollBar(me.nodes.listview);
        },
        onHide: function () {
            var me = this;
        },
        setBaseInfo: function() {
            var me = this;
            var data = me.DATA.data || me.DATA;
            var conf = G.class.qyjj.getConfById(data.type);

            me.ui.finds("bg_xuyuanchi").loadTexture("img/bg/bg_tdfb" + data.type + ".png");
            me.nodes.txt_sdjsq.setString(conf.name);
            me.nodes.txt_rs.setString(X.keysOfObject(data.user).length + "/" + conf.num_limit);
            X.timeout(me.nodes.txt_sj, data.ctime + conf.duration, function () {

            }, null, {showStr: L("HFBJS")});
            X.alignItems(me.nodes.panel_jlwp, conf.showdlz, "left", {
                touch: true,
                scale: .45,
                mapItem: function (node) {
                    node.num.hide();
                }
            });

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
        },
        setContents: function () {
            var me = this;
            var data = me.DATA.data || me.DATA;
            var conf = G.class.qyjj.getConfById(data.type);
            
            for (var i in data.user) {
                (function (key, data) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    list.nodes.txt_name.setString(data.name);
                    list.nodes.txt_qf.setString(data.svrname);
                    if(key == P.gud.uid) list.nodes.txt_name.setTextColor(cc.color("#30ff01"));
                    list.nodes.txt_sy.setString(X.fmtValue((G.time - data.time) / conf.cd * conf.once_prize[0].n));
                    list.nodes.txt_sy1.setString(X.fmtValue((G.time - data.time) / conf.cd * conf.once_prize[1].n));
                    list.show();
                    me.nodes.listview.pushBackCustomItem(list);
                })(i, data.user[i]);
            }
        },
        setFightAni: function () {
            var me = this;
            var data = me.DATA.data || me.DATA;

            X.addSpine({
                model: me.extConf.bossModel[data.type],
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
        }
    });
    G.frame[ID] = new fun('shendianzhilu_dcjsq.json', ID);
})();