/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_mrlb';
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

            me.nodes.txt_title.setString(L("MRLB"));
            me.ui.finds('txt_rw').setString(L("YYLBMTCZ"));
        },
        getData: function () {
            var arr = [];

            cc.each(G.gc.xnhd.libao, function (task, id) {
                task._id = id;
                task.buyNum = G.frame.xnhd.DATA.myinfo.libao[task.proid] || 0;
                task.buyMax = task.buyNum >= task.buynum;
                arr.push(task);
            });
            return arr;
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

            X.autoInitUI(ui);
            X.render({
                ico_nr: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: .9
                    });
                },
                libao_mz: data.name || 'sbysr',
                wz_xg: function (node) {
                    node.setString(X.STR(L("XG"), data.buynum - data.buyNum) + L("GE"))
                    node.setVisible(!data.buyMax);
                },
                txt_ylq: function (node) {
                    node.setVisible(data.buyMax);
                    node.setString(L("YSQ"));
                },
                btn_lq: function (node) {
                    node.setVisible(!data.buyMax);
                    node.setEnableState(!data.buyMax);
                    node.click(function () {
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            if (!G.frame.xnhd.DATA.myinfo.libao[data._id]) {
                                G.frame.xnhd.DATA.myinfo.libao[data._id] = 0;
                            }
                            G.frame.xnhd.DATA.myinfo.libao[data._id] += 1;
                            me.setTable();
                            if (G.frame.xnhd.nodes.txt_ps.getString().indexOf(L("PIAO")) != -1) {
                                var need = G.gc.xnhd.toupiaoneed[0];
                                G.frame.xnhd.nodes.txt_ps.setString(X.STR(L("XGX"), X.fmtValue(G.class.getOwnNum(need.t, need.a))) + L("PIAO"));
                            }
                        });
                        G.event.emit('doSDKPay', {
                            pid:data.proid,
                            logicProid: data.proid,
                            money: data.money,
                        });
                    }, 5000);
                },
                zs_wz: function (node) {
                    node.setString(data.money / 100 + L("YUAN"));
                    node.setTextColor(cc.color(data.buyMax ? '#6c6c6c' : '#7b531a'));
                },
                ico_list: function (node) {
                    node.setTouchEnabled(false);
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_tip_yyrw.json', ID);
})();