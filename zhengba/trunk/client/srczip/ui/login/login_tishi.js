/**
 * Created by  on 2019//.
 */
(function () {
    //登录隐私提示框
    var ID = 'login_tishi';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.tip_title.setString(L("WENXINTISHI"));
            me.bindBtn();
            new X.bView('ui_tips_wxts.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.listview);
                me.view.nodes.txt_wz.hide();
                me.view.nodes.img_gou.hide();
                me.view.nodes.txt_nr.hide();
                me.view.finds('Image_7').hide();
                me.view.nodes.btn_yjlq.click(function () {
                    me.remove();
                });
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.view.nodes.img_gou.setVisible(X.cacheByUid('tishi'));
            var rh = new X.bRichText({
                size: 18,
                lineHeight: 32,
                maxWidth: me.view.nodes.listview.width,
                family: G.defaultFNT,
                color: "#804326",
            });
            var datastr = me.data().str;
            rh.text(datastr);
            rh.setAnchorPoint(0, 0.5);
            rh.setPosition(0, me.view.nodes.listview.width / 2);
            me.view.nodes.listview.pushBackCustomItem(rh);

            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(me.view.nodes.listview.width, 10));
            me.view.nodes.listview.pushBackCustomItem(layout);
            if (me.data().openbtns) {
                me.view.nodes.btn_yjlq1.show();
                me.view.nodes.btn_pb.show();
                me.view.nodes.btn_yjlq1.click(function () {
                    me.remove();
                });
                me.view.nodes.btn_pb.click(function () {
                    jsbHelper.callNative(null, null, {
                        act: 'exit'
                    });
                });
            } else {
                me.view.nodes.btn_yjlq.show();
            }
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();