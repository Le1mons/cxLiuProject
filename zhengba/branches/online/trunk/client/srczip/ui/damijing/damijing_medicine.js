/**
 * Created by LYF on 2018/10/23.
 */
(function () {
    //大秘境-使用药水
    var ID = 'damijing_medicine';

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

            me.ui.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('tishi_nlp.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.view.finds("img_gou").setTouchEnabled(true);
            me.view.finds("img_gou").click(function () {
                if(!X.cacheByUid("dmj_bj")) {
                    X.cacheByUid("dmj_bj", 1);
                    me.view.finds("ico_gou").show();
                }else {
                    X.cacheByUid("dmj_bj", 0);
                    me.view.finds("ico_gou").hide();
                }
            });

            me.view.nodes.btn_qd.click(function () {
                me.DATA.callback && me.DATA.callback(me.DATA.node);
                me.remove();
            });

            me.view.nodes.btn_qx.click(function () {
                me.remove();
            });

            var str = X.STR(L("dmj_syyj"), me.DATA.name);
            var rh = new X.bRichText({
                size: 24,
                maxWidth: me.view.finds("txt_nlp").width,
                lineHeight: 32,
                family: G.defaultFNT,
                color: "#804326"
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(me.view.finds("txt_nlp").width / 2, me.view.finds("txt_nlp").height / 2);
            me.view.finds("txt_nlp").addChild(rh);
        },
    });
    G.frame[ID] = new fun('ui_tip_tishi.json', ID);
})();