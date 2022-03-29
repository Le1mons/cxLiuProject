/**
 * Created by
 */
(function () {
    //
    var ID = 'jstl_level';
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
            var data = G.gc.xyx[0].level;

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
            var isOpen = P.gud.maxmapid - 1 >= data.cond[0];
            X.autoInitUI(ui);
            X.render({
                libao_mz: function (node) {
                    node.setString(data.name);
                    X.enableOutline(node, '#A01E00', 2);
                },
                ico_nr: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        scale: .8,
                        mapItem: function (node) {
                            node.setGet(X.inArray(G.frame.xiaoyouxi.DATA.xiaoyouxi[0], index), 'img_yhd2');
                        }
                    });
                },
                ico_list: function (node) {
                    node.hide();
                },
                btn_gm: function (node) {
                    node.setEnableState(isOpen);
                    node.noMove(function () {
                        G.frame.jstl.data({
                            conf: data,
                            enemy: G.gc.xyx_level.jstl[data.level],
                            index: index
                        }).show();
                    });
                    if (isOpen && !X.inArray(G.frame.xiaoyouxi.DATA.xiaoyouxi[0], index)) {
                        G.setNewIcoImg(node);
                        node.redPoint.setPosition(123, 51);
                    } else {
                        G.removeNewIco(node);
                    }
                },
                zs_wz: function (node) {
                    node.setString(isOpen ? L("TIAOZHAN") : X.STR(L('zxxxg'), data.cond[0]));
                    node.setTextColor(cc.color(isOpen ? '#7b531a' : '#6c6c6c'));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('jianshengtulong_tk1.json', ID);
})();