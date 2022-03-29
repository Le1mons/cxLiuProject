/**
 * Created by wfq on 2018/6/26.
 */
(function () {
    //玩家改名
    var ID = 'player_gm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
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

            me.DATA = me.data();
            // new X.bView('gaiming.json', function (view) {
            //     me._view = view;
            //     me.ui.nodes.panel_nr.removeAllChildren();
            //     me.ui.nodes.panel_nr.addChild(view);
            //     me.setContents();
            //     view.setTouchEnabled(true);
            // });
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var panel = me;

            X.render({
                panel_bt:function(node){
                    var rh = new X.bRichText({
                        size: 30,
                        maxWidth: node.width,
                        lineHeight: 32,
                        color: "#fff8e1",
                        family: G.defaultFNT,
                    });
                    rh.setPosition(cc.p(165, 0));
                    rh.text(L('XIUGAI') + L('MINGZI'));
                    node.addChild(rh);

                },
                txt_title: function (node) {
                    node.setString(me.DATA.info);
                },
                panel_input2: function (node) {
                    var txtInput = node.finds('txt_input$');

                    txtInput.setPlaceHolder(me.DATA.placeholder);
                    // txtInput.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
                },
                btn_confirm2: function (node) {
                    node.finds('txt_sl$').hide();
                    node.finds('token_zs').hide();
                    node.finds('txt_confirm2').hide();

                    var need = [].concat(me.DATA.need);
                    if (need) {
                        node.finds('txt_sl$').show();
                        node.finds('token_zs').show();
                        node.finds('txt_confirm2').show();
                        setTextWithColor(node.finds('txt_sl$'), need[0].n, G.gc.COLOR[G.class.getOwnNum(need[0].t, need[0].a) >= need[0].n ? 'n1' : 5]);
                    } else {
                        node.setTitleText(L('BTN_OK'));
                    }
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var txt = panel.nodes.panel_input2.finds('txt_input$').getString().trim();
                            var callback = me.DATA.callback;
                            callback && callback(txt);
                        }
                    });
                }
            }, me.nodes);
        },

    });

    G.frame[ID] = new fun('gaiming.json', ID);
})();