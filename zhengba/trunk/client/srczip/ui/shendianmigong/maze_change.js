/**
 * Created by LYF on 2019/8/1.
 */
(function () {
    //选择遗物
    var ID = 'maze_change';

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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = G.frame.maze.DATA.data.relicprize;

            for (var i = 0; i < data.length; i ++) {
                me.setItem(me.nodes["panel_ny" + i], data[i], i);
            }
        },
        setItem: function (ui, id, index) {
            var me = this;
            var conf = G.gc.mazerelic[id];

            X.autoInitUI(ui);
            X.render({
                txt_nywz: conf.intro,
                txt_name: function (node) {
                    node.setString(conf.name);
                    node.setTextColor(cc.color(G.gc.COLOR["yw" + conf.color]));
                },
                panel_zz: function (node) {
                    if (conf.zhongzu) {
                        node.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
                    } else if (conf.job) {
                        node.setBackGroundImage('img/public/ico_zy/zy_' + conf.job + '_x.png', 1);
                    } else {
                        node.hide();
                    }
                },
                btn_qw: function (node) {
                    node.click(function () {
                        G.DATA.noClick = true;
                        me.ajax("maze_getrelic", [index], function (str, data) {
                            if (data.s == 1) {

                                G.frame.maze.getData(function () {
                                    G.tip_NB.show(L("XZYWCG"));
                                    G.frame.maze.boxNode && G.frame.maze.boxNode.removeFromParent();
                                    me.remove();
                                    G.DATA.noClick = false;
                                });
                            } else {
                                G.DATA.noClick = false;
                            }
                        });
                    });
                },
                ico_yw: function (node) {
                    node.setBackGroundImage("ico/relicico/" + conf.icon + ".png");
                }
            }, ui.nodes);

            ui.nodes.paneL_dh.hide();
            G.class.ani.show({
                json: "ani_shendianmigong_xuanzhong",
                addTo: ui.nodes.paneL_dh,
                x: ui.nodes.paneL_dh.width / 2,
                y: ui.nodes.paneL_dh.height / 2,
                repeat: true,
                autoRemove: false
            });

            ui.finds("Image_1").loadTexture("img/shendianmigong/img_sdmg_sz" + conf.color + ".png", 1);
            ui.click(function (sender) {
                if (me.sender) {
                    me.sender.nodes.paneL_dh.hide();
                    me.sender.nodes.btn_qw.hide();
                }

                sender.nodes.paneL_dh.show();
                sender.nodes.btn_qw.show();
                me.sender = sender;
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_xzyw.json', ID);
})();