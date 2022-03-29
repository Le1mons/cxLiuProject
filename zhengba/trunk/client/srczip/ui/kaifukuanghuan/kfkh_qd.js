/**
 * Created by
 */
(function () {
    //
    var ID = 'kfkh_qd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.DATA = G.frame.kfkh.getDayTaskBuyTabAndHType([1, 2, 3, 4, 5, 6, 7], 1, 1);
            var hid = me.DATA[me.DATA.length-1].p[1].t || '31115';
            me.nodes.mask.click(function () {
                me.remove();
            });

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: hid,
                scaleNum: 1.3
            });

            me.nodes.btn_ck.click(function () {
                G.frame.yingxiong_xxxx.data({
                    tid:hid,
                    list:[hid],
                    frame:'yingxiong_tujian'
                }).show();
            });

            

            me.list = {};
            cc.each(me.DATA, function (data, index) {
                var list = me.list[data.day] = me.nodes.list.clone();
                var parent = me.nodes['panel_' + data.day];
                list.show();
                list.data = data;
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                X.autoInitUI(list);
                X.render({
                    ico_list: function (node) {
                        node.setTouchEnabled(false);
                        X.alignCenter(node, [].concat(data.p[1]), {
                            touch: true
                        });
                    },
                    txt_sl: function (node) {
                        node.setString(X.fmtValue(data.p[0].n));
                        X.enableOutline(node, '#281B00', 2);
                    },

                }, list.nodes);
                list.setTouchEnabled(true);
                list.click(function (sender) {
                    if (sender.rec) {
                        me.ajax('kfkh_getprize', [data.day, data.hdid], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.p,
                                }).show();
                                G.frame.kfkh.DATA.data[data.hdid].finish = 1;
                                G.frame.kfkh.DATA.finipro = _data.d.finipro;
                                G.frame.kfkh.checkRedPoint();
                                me.refreshList();
                            }
                        });
                    }
                });
            });
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        onShow: function () {
            var me = this;

            me.refreshList();
        },
        refreshList: function () {
            var me = this;

            cc.each(me.list, function (list) {

                var data = list.data;
                var taskData = G.frame.kfkh.DATA.data[data.hdid];
                var rec = taskData.nval >= taskData.pval && !taskData.finish;
                X.render({
                    zs_wz: function (node) {
                        node.setString(rec ? L("KLQ") : X.STR(L('DXT1'), data.day));
                        node.setTextColor(cc.color(rec ? '#ffff00' : '#ffffff'));
                        X.enableOutline(node, '#281b00', 2);
                    },
                    panel_yhd: function (node) {
                        node.setVisible(taskData.finish > 0);
                    }
                }, list.nodes);
                list.rec = rec;
                list.finds('Image_3').getChildByTag(7777) && list.finds('Image_3').getChildByTag(7777).removeFromParent();
                if (list.rec) {
                    G.class.ani.show({
                        json: 'yxzm_wpxz_tx',
                        addTo: list.finds('Image_3'),
                        z: 999,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node) {
                            node.setTag(7777);
                        }
                    });
                }
            });
        }
    });
    G.frame[ID] = new fun('kaifukuanghuan_dljl.json', ID);
})();