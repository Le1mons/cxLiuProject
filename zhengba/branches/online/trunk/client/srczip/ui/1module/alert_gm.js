/**
 * Created by wfq on 2018/6/28.
 */
(function () {
    //单项购买弹窗
    var ID = 'alert_gm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.ui.nodes.txt_title.setString(me.data().title);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
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

            me.DATA = me.data();
            new X.bView('ui_tip_gm2.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },

        setContents: function () {
            var me = this;

            var panel = me._view;

            X.render({
                txt_nr: function (node) {
                    var str = me.DATA.intr;
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:24,
                        color:G.gc.COLOR.n4,
                        family:G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.trueHeight()));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
                btn_gm: function (node) {

                    var txtGm = node.finds('txt_gm');
                    var imgGm = node.finds('img_zs');

                    var need = me.data().need[0];

                    if (need.n < 1) {
                        txtGm.setString(L('MIANFEI'));
                    } else {
                        var ownNum = G.class.getOwnNum(need.t,need.a);
                        setTextWithColor(txtGm,need.n,G.gc.COLOR[ownNum >= need.n ? 'n12' : 5]);
                    }

                    imgGm.loadTexture(G.class.getItemIco(need.t),1);

                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var callback = me.DATA.callback;
                            callback && callback();
                        }
                    });
                }
            },panel.nodes);
        },
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();