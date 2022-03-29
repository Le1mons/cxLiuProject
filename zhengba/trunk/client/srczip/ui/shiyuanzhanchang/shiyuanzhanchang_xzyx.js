/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-设置上阵英雄
    var ID = 'shiyuanzhanchang_xzyx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ['zhenfa.png', 'zhenfa.plist'];
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                // G.frame.alert.data({
                //     sizeType:3,
                //     cancelCall:null,
                //     okCall: function () {
                       me.remove();
                       G.frame.shiyuanzhanchang_floor.remove();
                //     },
                //     autoClose:true,
                //     richText:L('syzc_32')
                // }).show();
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
            me.layer =  me.data().layer;
            var mask = me.mask = new ccui.Layout;
            mask.setContentSize(cc.director.getWinSize());
            mask.setTouchEnabled(true);
            mask.setAnchorPoint(0, 0);
            me.ui.finds("panel_ui").addChild(mask);
            me.mask.zIndex = 999;
            me.mask.hide();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.setTop();
            me.setBottom();
        },
        setTop: function () {
            var me = this;

            if (!me.top) {
                me.top = new G.class.shiyuanzhanchang_zhongzu_xuanze("fight");
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function () {
            var me = this;

            if (!me.bottom) {
                me.bottom = new G.class.shiyuanzhanchang_save_hero('fight');
                me.nodes.panel_nr2.removeAllChildren();
                me.nodes.panel_nr2.addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
        },
        playAniMove: function (node) {
            var me = this;
            me.mask.show();
            var posSz = G.frame.shiyuanzhanchang_xzyx.posSz;
            var posSelect = G.frame.shiyuanzhanchang_xzyx.posSelect;
            var type = G.frame.shiyuanzhanchang_xzyx.playAniType;

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
    G.frame[ID] = new fun('shiyuan_tk9.json', ID);
})();