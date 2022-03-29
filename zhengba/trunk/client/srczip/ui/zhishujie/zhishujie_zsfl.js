/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_zsfl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var data = G.gc.zhishujie.fuli;
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, index) {
            var me = this;
            var val = data.type == 1 ? G.frame.zhishujie_main.DATA.myinfo.val : (G.frame.zhishujie_main.DATA.myinfo.fruitrec[5] || 0);

            X.autoInitUI(ui);
            X.render({
                libao_mz: function (node) {
                    var addStr = "<font color=#ffe8a5>(" + val + "/" + data.val + ")</font>";
                    var rh = X.setRichText({
                        str: X.STR(L("zsj_fl" + data.type), data.val) + addStr,
                        parent: node,
                        color: '#ffe8a5',
                        outline: '#a01e00'
                    });
                    rh.x = 0;
                },
                wz_xg: function (node) {
                    node.setString('');
                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: .8
                    });
                },
                ico_list: function (node) {
                    node.setTouchEnabled(false);
                },
                btn_gm: function (node) {
                    node.setEnableState(!G.frame.zhishujie_main.DATA.myinfo.fuli[index] && val >= data.val);
                    node.click(function () {
                        me.ajax('planttrees_fuli', [index], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: _data.d.prize
                                }).show();
                                G.frame.zhishujie_main.DATA.myinfo.fuli[index] = 1;
                                me.setTable();
                                G.hongdian.getData('planttrees', 1, function () {
                                    G.frame.zhishujie_main.checkRedPoint();
                                    G.frame.zhishujie_zsyq.checkRedPoint();
                                });
                            }
                        });
                    });
                },
                zs_wz: function (node) {
                    node.setString(G.frame.zhishujie_main.DATA.myinfo.fuli[index] != undefined ? L("YLQ") : L("LQ"));
                    node.setTextColor(cc.color(!G.frame.zhishujie_main.DATA.myinfo.fuli[index] && val >= data.val ? '#2f5719' : '#6c6c6c'));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('zhishujie_zsfl.json', ID);
})();