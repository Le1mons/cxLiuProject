/**
 * Created by
 */
(function () {
    //
    var ID = 'niudan_fuli';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);

            X.radio([me.nodes.btn_jjxs, me.nodes.btn_ttxs], function (sender) {
                var nameType = {
                    btn_jjxs$: 2,
                    btn_ttxs$: 1
                };
                me.changeType(nameType[sender.getName()]);
            });
            if (G.frame.niudan.eventEnd) {
                var layout = new ccui.Layout();
                layout.setContentSize(me.nodes.btn_jjxs.getSize());
                me.nodes.btn_jjxs.addChild(layout);
                layout.setTouchEnabled(true);
                layout.click(function () {
                    G.tip_NB.show(L("HDYJS"));
                });
            }
        },
        onShow: function () {
            var me = this;

            !G.frame.niudan.eventEnd && me.nodes.btn_jjxs.triggerTouch(ccui.Widget.TOUCH_ENDED);
            G.frame.niudan.eventEnd && me.nodes.btn_ttxs.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function (type) {
            var me = this;
            if (me.table) {
                me.table = undefined;
                delete me.table;
                me.nodes.scrollview.removeAllChildren();
            }
            me.type = type;
            me.nodes.xiaohao_110.setVisible(type == 1);
            me.setTable();
        },
        setTable: function (isTop) {
            var me = this;
            var data = [];

            if (me.type == 1) {
                me.showAttr();
                var conf = G.frame.niudan.DATA.info.data.duihuan;
                cc.each(conf, function (obj, id) {
                    var _obj = JSON.parse(JSON.stringify(obj));
                    _obj.id = id;
                    _obj.buyNum = G.frame.niudan.DATA.myinfo.duihuan[_obj.id] || 0;
                    _obj.buyMax = _obj.buyNum >= _obj.maxnum;
                    data.push(_obj);
                });
                data.sort(function (a, b) {
                    if (a.buyMax != b.buyMax) {
                        return a.buyMax < b.buyMax ? -1 : 1;
                    } else {
                        return Number(a.id) < Number(b.id) ? -1 : 1;
                    }
                });
            } else if (me.type == 2) {
                var conf = G.gc.niudan.task;
                cc.each(conf, function (obj, id) {
                    var _obj = JSON.parse(JSON.stringify(obj));
                    _obj.id = id;
                    data.push(_obj);
                });
                var lqData = G.frame.niudan.DATA.myinfo.task;
                data.sort(function (a, b) {
                    // var nvalA = lqData.data[a.id] || 0;
                    // var nvalB = lqData.data[b.id] || 0;
                    // var lqA = nvalA >= a.pval && !X.inArray(lqData.rec.pt, a.id);
                    // var lqB = nvalB >= b.pval && !X.inArray(lqData.rec.pt, b.id);
                    // if (lqA != lqB) {
                    //     return lqA > lqB ? -1 : 1;
                    // } else {
                    //
                    // }
                    return Number(a.id) < Number(b.id) ? -1 : 1;
                });
            }
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes['list_lb' + me.type], 1, function (ui, data) {
                    me['setItem' + me.type](ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem1: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                panel_icol1: function (node) {
                    var item = G.class.sitem(data.need[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                panel_icol2: function (node) {
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                shuliang: function (node) {
                    node.setTextColor(cc.color('#804326'));
                    node.setString(data.maxnum - data.buyNum + "/" + data.maxnum);
                },
                btn_lingqu: function (node) {
                    node.setVisible(!data.buyMax);
                    node.setEnableState(!data.buyMax);
                    node.setTitleColor(cc.color(data.buyMax ? '#6c6c6c' : '#2f5719'))
                    node.click(function () {
                        G.frame.buying.data({
                            num: 1,
                            item: data.prize,
                            need: data.need,
                            maxNum: data.maxnum - data.buyNum,
                            callback: function (num) {
                                me.ajax('niudan_duihuan', [data.id, num], function (str, _data) {
                                    if (_data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        if (!G.frame.niudan.DATA.myinfo.duihuan[data.id]) {
                                            G.frame.niudan.DATA.myinfo.duihuan[data.id] = 0;
                                        }
                                        G.frame.niudan.DATA.myinfo.duihuan[data.id] += num;
                                        me.setTable();
                                        G.frame.niudan.showTenBtnState();
                                    }
                                });
                            }
                        }).show();
                    });
                },
                ysq: function (node) {
                    node.setVisible(data.buyMax);
                }
            }, ui.nodes);
        },
        setItem2: function (ui, data) {
            var me = this;
            var lqData = G.frame.niudan.DATA.myinfo.task;
            var nval = lqData.data[data.id] || 0;
            X.autoInitUI(ui);
            X.render({
                text_mz2: data.desc,
                shuliang2: nval + '/' + data.pval,
                panel_ico1: function (node) {
                    X.alignItems(node, data.ptprize, 'left', {
                        touch: true
                    });
                },
                btn_lingqu2: function (node) {
                    var green = nval >= data.pval && (!X.inArray(lqData.rec.pt, data.id))
                    node.setEnableState(green);
                    node.setTitleText(X.inArray(lqData.rec.pt, data.id) ? L("YLQ") : L("LQ"));
                    node.setTitleColor(cc.color(!green ? '#6c6c6c' : '#2f5719'));
                    node.click(function () {
                        me.ajax('niudan_receive', [data.id], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: _data.d.prize
                                }).show();
                                G.frame.niudan.getData(function () {
                                    me.setTable();
                                });
                                G.hongdian.getData('niudan', 1, function () {
                                    G.frame.niudan.checkRedPoint();
                                });
                                G.frame.niudan.showTenBtnState();
                            }
                        });
                    });
                }
            }, ui.nodes);
        },
        showAttr: function () {
            var me = this;
            var need = G.gc.niudan.duihuanNeed[0];
            me.nodes.ico_zs.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.daibi_sl.setString(X.fmtValue(G.class.getOwnNum(need.t, need.a)));
        }
    });
    G.frame[ID] = new fun('zhengguniudan_tankuang2.json', ID);
})();