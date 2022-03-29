/**
 * Created by  on 2019//.
 */
(function () {
    //跨服屏蔽
    var ID = 'kfpb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            var btns = [];
            var data = me.data();

            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            var conf = {
                0: L("QD"),
                1: L("QX")
            };
            for (var i = 0; i < 2; i++) {
                var btn = new ccui.Button();
                me.nodes.panel_top.addChild(btn);
                btn.loadTextureNormal('img/public/btn/btn2_on.png', 1);
                btn.setPosition(115 + (i * 310), 90);
                btn.setTitleText(conf[i]);
                btn.setTitleFontName(G.defaultFNT);
                btn.setTitleFontSize(24);
                btn.setTitleColor(cc.color('#7b531a'));
                btns.push(btn);
            }
            btns[0].touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.DATA.kfpb[data.uid] = data.data;
                    X.cacheByUid("newkfpb", G.DATA.kfpb);
                    data.callback && data.callback();
                    G.tip_NB.show(L("SZCG"));
                    me.remove();
                }
            });
            btns[1].touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            })
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            var richText = new X.bRichText({
                size: 24,
                maxWidth: me.nodes.txt_nr.width,
                lineHeight: 24,
                color: '#F6EBCD',
                family: G.defaultFNT,
            });
            richText.text(L('KFPB'));
            richText.setPosition(118, 60);
            me.nodes.txt_nr.addChild(richText);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_top3.json', ID);
})();