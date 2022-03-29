/**
 * Created by wfq on 2018/6/1.
 */
(function () {
    //祭祀法阵-英雄分解
    var ID = 'yingxiong_fenjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            // me.ui.nodes.tip_title.setBackGroundImage(X.getTitleImg('rhjt'),1);
            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
            me.ui.nodes.panel_bg.setBackGroundImage('img/bg/bg_jisifazhen.jpg',0);
        },
        bindBtn: function () {
            var me = this;

            // me.ui.nodes.btn_guanbi.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         me.remove();
            //     }
            // });
            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openjitan.mp3");
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.showToper();
            // me.showMainMenu();
            me.setContents();
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
        },
        setContents: function () {
            var me = this;

            me.setTop();
            me.setBottom();
        },
        setTop: function () {
            var me = this;

            if (!me.top) {
                me.top = new G.class.yingxiong_star_xuanze('fenjie');
                me.ui.finds('panle_1').removeAllChildren();
                me.ui.finds('panle_1').addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function () {
            var me = this;
            if (!me.bottom) {
                me.bottom = new G.class.yingxiong_fenjie_xuanze('fenjie');
                me.ui.finds('panle_2').removeAllChildren();
                me.ui.finds('panle_2').addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
        },
    });

    G.frame[ID] = new fun('ui_tip6.json', ID);
})();