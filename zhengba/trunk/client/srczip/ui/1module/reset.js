/**
 * Created by  on 2019/3/13.
 */
(function () {
    //重置
    var ID = 'reset';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_title.setString(L("reset"));
            me.nodes.txt_gm.setString(me.DATA.needNum);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_gm.click(function () {
                me.DATA.callback && me.DATA.callback();
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

            X.setRichText({
                str: me.DATA.str,
                parent: me.nodes.txt_nr,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: me.nodes.txt_nr.width / 2, y: me.nodes.txt_nr.height / 2}
            });
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_tip_cz.json', ID);
})();