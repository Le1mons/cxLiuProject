/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //
    var ID = 'yxzt_blsl_gqjl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            new X.bView('blsl_gqjl.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.addChild(view);
                me.setContents();
            });
            me.nodes.txt_title.setString(L("yxzt17"));
            me.bindBtn();
        },
        setContents: function () {
            var me = this;
            X.render({
                txt_jcsx: function (node) {
                    node.setString(X.STR(L('yxzt5'), me.DATA.id));
                },
                panel_wp: function (node) {
                    var prize = me.conf.shilian[me.DATA.id].prize;
                    var jifen = [{'a':'special','t':"sljf","n":me.conf.shilian[me.DATA.id].jifen}];
                    var _prize = prize.concat(jifen);
                    X.alignItems(node, _prize, 'center', {
                        touch: true,
                        // scale: 0.8,
                    });
                },
                btn_qr: function (node) {
                    node.id = me.DATA.id;
                    node.click(function (sender) {
                        if (sender.id == me.DATA.shilian.win.length + 1 || sender.id=='5') {
                            var obj = {
                                pvType: 'shilianfight',
                                data: sender.id,
                                save: !X.cacheByUid("shilianfight"),
                            };
                            G.frame.yingxiong_fight.data(obj).show();
                            me.remove();
                        }
                    });
                },
            }, me._view.nodes);
        },
        setItem: function (ui, id) {
            var me = this;

        },

    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();