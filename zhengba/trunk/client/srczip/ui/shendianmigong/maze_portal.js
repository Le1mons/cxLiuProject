/**
 * Created by LYF on 2019/8/2.
 */
(function () {
    //神殿迷宫-传送门
    var ID = 'maze_portal';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.panel_csm.opacity = 0;
            me.nodes.panel_csm.setBackGroundImage("img/shendianmigong/img_sdmg_csm" + me.index + ".png", 1);

            G.class.ani.show({
                json: me.index == 1 ? "ani_shendianmigong_chuansongmen_zi" : "ani_shendianmigong_chuansongmen_cheng",
                addTo: me.nodes.panel_csm,
                x: me.nodes.panel_csm.width / 2,
                y: me.nodes.panel_csm.height / 2,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("wait", true);
                }
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_qw.click(function () {

                G.DATA.noClick = true;
                me.ajax("maze_difficult", [me.index.toString()], function (str, data) {
                    if (data.s == 1) {
                        G.frame.maze.getData(function () {
                            me.remove();
                            G.frame.maze.csm.ani.playWithCallback("out", false, function () {
                                G.frame.maze.csm.ani.play("wait", true);
                                G.DATA.noClick = false;
                                G.frame.maze.setContents();
                                G.frame.maze.setViewInfo();
                            });
                        });
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.index = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            var rh = new X.bRichText({
                size: 22,
                maxWidth: me.nodes.txt_wzcs.width,
                lineHeight: 24,
                color: "#804326",
                family: G.defaultFNT,
            });
            rh.text(L("mazeportal" + me.index));
            rh.setPosition(0, me.nodes.txt_wzcs.height - rh.trueHeight());
            me.nodes.txt_wzcs.addChild(rh);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianmigong_csm.json', ID);
})();