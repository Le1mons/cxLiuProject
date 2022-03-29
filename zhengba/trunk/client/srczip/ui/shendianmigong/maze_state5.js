/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-前线营地
    var ID = 'maze_state5';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);

            me.nodes.txt_wzxiug.setString(L("maze_sw5"));

            G.class.ani.show({
                json: "ani_shendianmigong_zhangpeng",
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

                G.frame.maze.mazeChange([me.DATA.index, me.DATA.step], function () {
                    G.tip_NB.show(L("maze_event5"));
                    me.remove();
                });
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
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianmigong_qxyd.json', ID);
})();