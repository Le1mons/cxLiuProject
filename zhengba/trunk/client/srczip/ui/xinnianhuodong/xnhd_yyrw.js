/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_yyrw';
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
        toTop: function () {
            var me = this;

            G.frame.xnhd.getData(function () {
                G.frame.xnhd_yyrw.setTable();
                G.hongdian.getData('herohot', 1);
                G.frame.xnhd.checkRedPoint();
            });
        },
        onHide: function () {
            this.event.removeListener('focus', this.toTop);
        },
        onShow: function () {
            var me = this;

            me.setTable();

            me.ui.setTimeout(function () {
                me.on('focus', me.toTop);
            }, 1000);
        },
        getData: function () {
            var me = this;
            var arr = [];

            cc.each(G.gc.xnhd.task, function (task, id) {
                task._id = id;
                arr.push(task);
            });
            return arr.sort(function (a, b) {
                return Number(a._id) < Number(b._id) ? -1 : 1;
            });
        },
        setTable: function (isTop) {
            var me = this;
            var data = me.getData();

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var nval = G.frame.xnhd.DATA.myinfo.task[data._id] || 0;
            var ylq = X.inArray(G.frame.xnhd.DATA.myinfo.taskrec, data._id);

            X.autoInitUI(ui);
            X.render({
                ico_nr: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: .9
                    });
                },
                libao_mz: X.STR(data.desc, data.pval),
                wz_xg: '(' + nval + '/' + data.pval + ')',
                txt_ylq: function (node) {
                    node.setVisible(ylq);
                },
                btn_lq: function (node) {
                    node.setVisible(!ylq);
                    node.loadTextureNormal("img/public/btn/btn" + (nval >= data.pval ? 1 : 2) + "_on.png", 1);
                    node.noMove(function () {
                        if (nval >= data.pval) {
                            me.ajax('herohot_taskgetprize', [data._id], function (str, _data) {
                                if (_data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: _data.d.prize
                                    }).show();
                                    G.frame.xnhd.DATA.myinfo.taskrec.push(data._id);
                                    me.setTable();
                                    G.hongdian.getData('herohot', 1);
                                    G.frame.xnhd.checkRedPoint();
                                }
                            });
                        } else {
                            X.tiaozhuan(data.tujing);
                        }
                    });
                },
                zs_wz: function (node) {
                    node.setString(nval >= data.pval ? L("LQ") : L("QW"));
                    node.setTextColor(cc.color(nval >= data.pval ? "#2f5719" : "#7b531a"));
                },
                ico_list: function (node) {
                    node.setTouchEnabled(false);
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_tip_yyrw.json', ID);
})();