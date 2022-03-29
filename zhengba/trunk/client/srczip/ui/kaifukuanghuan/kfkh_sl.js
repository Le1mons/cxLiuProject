/**
 * Created by
 */
(function () {
    //
    var ID = 'kfkh_sl';
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

            me.tabType = 2;
            me.nodes.panel_fy.setTouchEnabled(true);
            me.nodes.panel_fy.click(function () {
                if (me.tabType == 2) {
                    me.tabType = 3;
                } else {
                    me.tabType = 2;
                }
                me.changeType();
            });
            me.nodes.txt_qy1.setString('');
            me.nodes.txt_qy2.setString('');
            me.changeType(true);

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
        changeType: function (refresh) {
            var me = this;

            X.setRichText({
                str: L("RWSL"),
                parent: me.nodes.txt_qy1,
                color: me.tabType == 2 ? '#ffffff' : '#653a07',
                outline: me.tabType == 2 ? '#653A07' : null,
                size: me.nodes.txt_qy1.fontSize
            });
            X.setRichText({
                str: L("TZSL"),
                parent: me.nodes.txt_qy2,
                color: me.tabType == 3 ? '#ffffff' : '#653a07',
                outline: me.tabType == 3 ? '#653A07' : null,
                size: me.nodes.txt_qy2.fontSize
            });
            me.nodes.panel_fy.setBackGroundImage('img/kaifukuanghuan/btn_qy0' + (me.tabType == 2 ? 2 : 1) + '.png', 1);
            if (!refresh) {
                me.setTable(true);
                me.checkRedPoint();
            }
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            if (G.frame.kfkh.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 2)) {
                G.setNewIcoImg(me.nodes.txt_qy1);
                me.nodes.txt_qy1.redPoint.setPosition(189, 26);
            } else {
                G.removeNewIco(me.nodes.txt_qy1)
            }

            if (G.frame.kfkh.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 3)) {
                G.setNewIcoImg(me.nodes.txt_qy2);
                me.nodes.txt_qy2.redPoint.setPosition(189, 26);
            } else {
                G.removeNewIco(me.nodes.txt_qy2);
            }

            cc.each(me.dayBtn, function (btn, day) {
                if (G.frame.kfkh.getTaskRedPointByDay(day, me.tabType)) {
                    G.setNewIcoImg(btn);
                    btn.redPoint.setPosition(63, 79);
                } else {
                    G.removeNewIco(btn);
                }
            });
        },
        setTable: function (isTop) {
            var me = this;
            var data = G.frame.kfkh.getDayTaskBuyTabAndHType(me.selectDay, me.tabType);

            data.sort(function (a, b) {
                var taskDataA = G.frame.kfkh.DATA.data[a.hdid];
                var taskDataB = G.frame.kfkh.DATA.data[b.hdid];

                if (taskDataA.finish != taskDataB.finish) {
                    return taskDataA.finish < taskDataB.finish ? -1 : 1;
                } else {
                    return Number(a.hdid) < Number(b.hdid) ? -1 : 1;
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
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var taskData = G.frame.kfkh.DATA.data[data.hdid];
            var rec = taskData.nval >= taskData.pval && !taskData.finish;
            X.autoInitUI(ui);
            X.render({
                txt_name: data.title,
                txt_jdt: function (node) {
                    node.setString(taskData.nval + '/' + taskData.pval);
                    X.enableOutline(node, '#584115', 2);
                },
                img_jdt: taskData.nval / taskData.pval * 100,
                btn_go: function (node) {
                    node.setTitleText(L("LQ"));
                    node.setTitleColor(cc.color(rec ? '#2f5719' : '#6c6c6c'));
                    node.setVisible(taskData.finish == 0);
                    node.setEnableState(rec);
                    node.click(function () {
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
                    });
                },
                img_received: function (node) {
                    node.setVisible(taskData.finish != 0);
                },
                img_item: function (node) {
                    X.alignItems(node, data.p, 'left', {
                        touch: true
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('kaifukuanghuan_tk2.json', ID);
})();