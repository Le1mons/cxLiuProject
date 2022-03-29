/**
 * Created by
 */
(function () {
    //
    var ID = 'kfkh_rw';
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
        },
        onShow: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var data = JSON.parse(JSON.stringify(G.gc.kaifukuanghuan_jdt.base.stageprize));
            cc.each(data, function (d, index) {
                d[2] = index;
            });

            data.sort(function (a, b) {
                var recA = X.inArray(G.frame.kfkh.DATA.recprize, a[2]);
                var recB = X.inArray(G.frame.kfkh.DATA.recprize, b[2]);

                if (recA != recB) {
                    return recA < recB ? -1 : 1;
                } else {
                    return a[0] < b[0] ? -1 : 1;
                }
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao1, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var nval = G.frame.kfkh.DATA.finipro;
            var ylq = X.inArray(G.frame.kfkh.DATA.recprize, data[2]);
            var rec = nval >= data[0] && !ylq;
            X.autoInitUI(ui);
            X.render({
                txt_name: X.STR(L("ljwckhrw"), data[0]),
                txt_jdt: function (node) {
                    node.setString(nval + '/' + data[0]);
                    X.enableOutline(node, '#584115', 2);
                },
                img_jdt: nval / data[0] * 100,
                btn_go: function (node) {
                    node.setTitleText(L("LQ"));
                    node.setTitleColor(cc.color(rec ? '#7b531a' : '#6c6c6c'));
                    node.setVisible(!ylq);
                    node.setEnableState(rec);
                    node.click(function () {
                        me.ajax('kfkh_recproprize', [data[2]], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data[1],
                                }).show();
                                G.frame.kfkh.DATA.recprize.push(data[2]);
                                G.frame.kfkh.checkRedPoint();
                                me.setTable();
                            }
                        });
                    });
                },
                img_received: function (node) {
                    node.setVisible(ylq);
                },
                img_item: function (node) {
                    X.alignItems(node, data[1], 'left', {
                        touch: true
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('kaifukuanghuan_tk3.json', ID);
})();