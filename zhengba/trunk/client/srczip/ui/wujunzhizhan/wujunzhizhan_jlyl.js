/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_jlyl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.list_lb.hide();
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            X.radio([me.nodes.btn_dld, me.nodes.btn_zss, me.nodes.btn_wzs], function(sender) {
                var name = sender.getName();
                var name2type = {
                    btn_dld$: 1,
                    btn_zss$: 2,
                    btn_wzs$: 3
                };
                me.changeType(name2type[name]);
            });

            me.ui.finds("bg_jjc").setTouchEnabled(true);
            me.ui.finds("ui").click(function () {
                me.remove();
            });
        },
        changeType: function (type) {
            this.type = type;
            this.DATA = G.gc.wjzz.base.prize[{
                1: 'daily',
                2: 'season',
                3: 'lianji'
            }[type]];
            this.setTable();
            this.nodes.txt_tip.setString(L("wjzz_jl_txt" + type));
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_dld.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setTable: function () {
            var me = this;

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                }, null, null, 8, 10);
                me.table.setData(me.DATA);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.DATA);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data, index) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                panel_pm: function (node) {
                    node.hide();
                    if (me.type != 3) {
                        index < 3 && node.show();
                        index < 3 && node.setBackGroundImage('img/public/img_paihangbang_' + (index + 1) + '.png', 1);
                    }
                },
                sz_phb: function (node) {
                    node.hide();
                    if (me.type != 3) {
                        index > 2 && node.show();
                        node.setString(index + 1);
                    } else {
                        node.show();
                        node.setString(data[0] == data[1] ? data[0] : data[0] + "-" + data[1]);
                    }
                },
                panel_tx: function (node) {
                    X.alignItems(node, me.type == 3 ? data[2] : data, 'left', {
                        touch: true
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_tip.json', ID);
})();