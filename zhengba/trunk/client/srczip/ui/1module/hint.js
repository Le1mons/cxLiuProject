/**
 * Created by LYF on 2019/5/20.
 */
(function () {
    //提示
    var ID = 'hint';

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
            me.cacheKey = me.DATA.cacheKey;
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
                if(!X.cacheByUid(me.cacheKey)) {
                    X.cacheByUid(me.cacheKey, 1);
                    me.view.finds("ico_gou").show();
                }else {
                    X.cacheByUid(me.cacheKey, 0);
                    me.view.finds("ico_gou").hide();
                }
            });

            me.view.nodes.btn_qd.click(function () {
                cc.log('============================>',me.DATA.callback && me.DATA.callback.toString());
                me.DATA.callback && me.DATA.callback();
                me.remove();
            });

            me.view.nodes.btn_qx.click(function () {
                me.remove();
            });

            var str = me.DATA.txt;
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