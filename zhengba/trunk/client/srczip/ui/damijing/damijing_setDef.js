/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //大秘境-设置上阵英雄
    var ID = 'damijing_setDef';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
                G.frame.damijing.remove();
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
            var mask = me.mask = new ccui.Layout;
            mask.setContentSize(cc.director.getWinSize());
            mask.setTouchEnabled(true);
            mask.setAnchorPoint(0, 0);
            me.ui.finds("panel_ui").addChild(mask);
            me.mask.zIndex = 999;
            me.mask.hide();

            me.setContents();

            me.ui.setTimeout(function () {
                G.guidevent.emit("shouwangzhemijingOpenOver");
            }, 500)
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.ui.finds('panel_tip').finds('txt_djgb').hide();
            me.setBottom();
            me.setTop();
        },
        setTop: function () {
            var me = this;

            if (!me.top) {
                me.top = new G.class.damijing_zhongzu_xuanze("fight");
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function () {
            var me = this;

            if (!me.bottom) {
                me.bottom = new G.class.damijing_save_hero('fight');
                me.nodes.panel_nr2.removeAllChildren();
                me.nodes.panel_nr2.addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
        },
        playAniMove: function (node) {
            var me = this;
            me.mask.show();
            var posSz = G.frame.damijing_setDef.posSz;
            var posSelect = G.frame.damijing_setDef.posSelect;
            var type = G.frame.damijing_setDef.playAniType;

            var posEnd;
            if (type == 'remove') {
                posEnd = posSelect || cc.p(310,800);
            } else {
                posEnd = posSz;
            }

            cc.isNode(me.item) && me.item.runActions([
                cc.moveTo(0.2, posEnd),
                cc.callFunc(function () {
                    cc.isNode(me.item) && me.item.removeFromParent();
                    me.mask.hide();
                })
            ]);
        }
    });
    G.frame[ID] = new fun('ui_tip3.json', ID);
})();