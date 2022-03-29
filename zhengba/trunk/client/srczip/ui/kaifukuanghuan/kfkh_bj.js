/**
 * Created by
 */
(function () {
    //
    var ID = 'kfkh_bj';
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

            me.dayBtn = {};
            (function addDayBtn(day) {
                if (day >= 8) return null;

                var list = me.dayBtn[day] = me.nodes.list.clone();
                var parent = me.nodes['panel_ts' + day];
                list.show();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                X.autoInitUI(list);
                X.render({
                    panel_zt1: function (node) {
                        node.hide();
                    },
                    panel_zt2: function (node) {
                        node.show();
                    },
                    txt_1: function (node) {
                        node.setString(X.STR(L('DXT1'), day));
                        node.setTextColor(cc.color('#fff8d5'));
                        X.enableOutline(node, '#653a07', 2);
                    },
                    txt_2: function (node) {
                        node.setString(X.STR(L('DXT1'), day));
                        node.setTextColor(cc.color('#804326'));
                    }
                }, list.nodes);
                list.day = day;
                list.setTouchEnabled(true);
                list.click(function (sender) {
                    if (me.selectDay == sender.day) return false;
                    if (me.lastList) {
                        me.lastList.nodes.panel_zt1.hide();
                        me.lastList.nodes.panel_zt2.show();
                    }
                    list.nodes.panel_zt2.hide();
                    list.nodes.panel_zt1.show();
                    me.lastList = list;
                    me.selectDay = sender.day;
                    me.setTable(true);
                });
                if (!me.lastList && list.day == G.frame.kfkh.DATA.sday) {
                    list.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
                day ++;
                addDayBtn(day);
            })(1);
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            cc.each(me.dayBtn, function (btn, day) {
                if (G.frame.kfkh.getTaskRedPointByDay(day, 1, 2)) {
                    G.setNewIcoImg(btn);
                    btn.redPoint.setPosition(63, 79);
                } else {
                    G.removeNewIco(btn);
                }
            });
        },
        setTable: function (isTop) {
            var me = this;
            var data = [].concat(G.frame.kfkh.getDayTaskBuyTabAndHType(me.selectDay, 4), G.frame.kfkh.getDayTaskBuyTabAndHType(me.selectDay, 1, 2));

            // data.sort(function (a, b) {
            //     var taskDataA = G.frame.kfkh.DATA.data[a.hdid];
            //     var taskDataB = G.frame.kfkh.DATA.data[b.hdid];
            //
            //     if (taskDataA.finish != taskDataB.finish) {
            //         return taskDataA.finish < taskDataB.finish ? -1 : 1;
            //     } else {
            //         return Number(a.hdid) < Number(b.hdid) ? -1 : 1;
            //     }
            // });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var taskData = G.frame.kfkh.DATA.data[data.hdid];
            var rec = taskData.nval >= taskData.pval && !taskData.finish;
            X.autoInitUI(ui);
            X.render({
                libao_mz: function (node) {
                    node.setString(data.title + (data.tab == 1 ? '(' + taskData.nval + '/' + taskData.pval + ')' : ''));
                    X.enableOutline(node, '#A01E00', 2);
                },
                ico_nr: function (node) {
                    X.alignItems(node, data.p, 'left', {
                        touch: true,
                        scale: .8
                    });
                },
                ico_list: function (node) {
                    node.setTouchEnabled(false);
                },
                btn_gm: function (node) {
                    var txt = ui.nodes.zs_wz;
                    txt.setString('');
                    txt.removeAllChildren();
                    txt.setAnchorPoint(0.5, 0.5);
                    txt.setPosition(node.width / 2, node.height / 2);
                    if (data.tab == 1) {
                        var rec = taskData.nval >= taskData.pval && !taskData.finish;
                        node.setEnableState(rec);
                        txt.setString(taskData.finish != 0 ? L("YLQ") : L("LQ"));
                        txt.setTextColor(cc.color(rec ? '#7b531a' : '#6c6c6c'));
                    } else {
                        node.setEnableState(taskData.finish == 0);
                        if (taskData.finish == 0) {
                            var need = data.need[0];
                            var ico = new ccui.ImageView(G.class.getItemIco(need.t), 1);
                            ico.setAnchorPoint(0.5, 0.5);
                            ico.scale = .75;
                            X.setRichText({
                                str: '<font node=1></font>' + X.fmtValue(need.n * (data.needsale / 10)),
                                parent: txt,
                                node: ico,
                                color: '#7b531a',
                                size: txt.fontSize,
                                maxWidth: txt.width + 20
                            });
                        } else {
                            txt.setString(L("YGM"));
                            txt.setTextColor(cc.color('#6c6c6c'));
                        }

                    }
                    function buy() {
                        me.ajax('kfkh_getprize', [data.day, data.hdid], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.p,
                                }).show();
                                G.frame.kfkh.DATA.data[data.hdid].finish = 1;
                                G.frame.kfkh.DATA.finipro = _data.d.finipro;
                                G.frame.kfkh.checkRedPoint();
                                me.setTable();
                                me.checkRedPoint();
                            }
                        });
                    }
                    node.click(function () {
                        if (data.tab == 1) {
                            buy()
                        } else {
                            if (me.selectDay > G.frame.kfkh.DATA.sday) {
                                return G.tip_NB.show(L("wdts"));
                            }
                            G.frame.alert.data({
                                cancelCall: null,
                                okCall: function () {
                                    buy();
                                },
                                richText: L("SFGM"),
                                sizeType: 3
                            }).show();
                        }
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('kaifukuanghuan_tk1.json', ID);
})();