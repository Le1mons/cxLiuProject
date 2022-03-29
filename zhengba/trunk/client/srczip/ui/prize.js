/**
 * Created by wfq on 2018/3/17.
 */
(function () {
    //奖励信息
    var ID = 'prize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
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

            /*
            *******************
            *prize
            *@param {title,intr,prize,callback,state,hideCloseBtn}
            *@returns {null}
            *******************
            */

            X.render({
                top_title:me.data().title,
                btn_gb: function (node) {
                    if (me.data().hideCloseBtn) {
                        node.hide();
                        me.ui.finds('ui_top_whbg').hide();
                    }
                    node.click(function (sender, type) {
                        me.remove();
                    });
                }
            },me.nodes);

            new X.bView('ui_tip_jlxq.json', function (view) {
                me._view = view;

                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var view = me._view;

            X.render({
                txt_title: me.data().intr,
                panel_wp: function (node) {
                    var prize = me.data().prize;
                    X.alignItems(node,prize,'center',{
                        touch:true,
                        scale:0.7,
                        callback: function (node) {
                            node.y += 5;
                        }
                    });
                },
                btn_qd: function (node) {
                    var state = me.data().state;
                    var callback = me.data().callback;
                    switch (state) {
                        case 'qd':
                            node.setTitleText(L('BTN_OK'));
                            break;
                        case 'lq':
                            node.setTitleText(L('BTN_LQ'));
                            break;
                        default:
                            break;
                    }

                    node.click(function (sender, type) {
                        if (!callback) {
                            me.remove();
                        } else {
                            callback();
                        }
                    });
                }
            },view.nodes);
        },
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();