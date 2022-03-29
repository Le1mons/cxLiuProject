/**
 * Created by LYF on 2019/1/15.
 */
(function () {
    //奖励预览
    var ID = 'qxjj_jlyl';

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

            me.nodes.mask.click(function () {

                me.remove();
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
            var id = me.data();
            var conf = G.class.qyjj.getConfById(id);

            me.ui.finds("txt_yl").setString(L("JJ" + id));

            X.alignItems(me.nodes.panel_yx, conf.open_prize, "left", {
                touch: true,
                scale: .8
            });

            X.alignItems(me.nodes.panel_yx1, conf.showdlz, "left", {
                touch: true,
                scale: .8
            });

        },
        setContents: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('shendianzhilu_top4.json', ID);
})();