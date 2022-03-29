/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'tanxian_show';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_tx.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            var table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, null, 6);
            table.setData(me.data());
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            X.render({
                txt_name1: function (node) {
                    node.setString(data.headdata.name || "");
                    X.enableOutline(node, "#000000", 2);
                },
                ico_wj: function (node) {
                    node.removeAllChildren();
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.addChild(head);
                    node.setTouchEnabled(true);
                    node.setSwallowTouches(false);
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.wanjiaxinxi.data({
                                pvType: 'zypkjjc',
                                uid: data.uid
                            }).checkShow();
                        }
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('tanxian_dqgk.json', ID);
})();