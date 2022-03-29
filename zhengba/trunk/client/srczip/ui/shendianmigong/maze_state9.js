/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-贪婪洞窟
    var ID = 'maze_state9';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);
            me.nodes.txt_jlwz.setString(L("maze_sw9"));

            G.class.ani.show({
                json: "ani_shendianmigong_dongku",
                addTo: me.nodes.panel_csm,
                repeat: true,
                releaseRes:false,
                autoRemove: false
            });
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
                        isMw: true,
                        name: G.gc.mazecom.base.event[9].name
                    }
                }).once("hide", function () {
                    me.remove();
                }).show();
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
            var conf = G.gc.mazecom.base.bosslist[me.DATA.gridData.boss];

            X.alignCenter(me.nodes.panel_wpsl, conf.prize, {
                touch: true
            });

            var mw = G.class.shero(conf.boss[0]);
            mw.setPosition(me.nodes.panel_tx.width / 2, me.nodes.panel_tx.height / 2);
            me.nodes.panel_tx.addChild(mw);

            me.nodes.btn_bz.click(function () {
                G.frame.shendianmowang_info.data({
                    conf: conf.intr,
                    title: L("MWXX")
                }).show();
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_tldk.json', ID);
})();