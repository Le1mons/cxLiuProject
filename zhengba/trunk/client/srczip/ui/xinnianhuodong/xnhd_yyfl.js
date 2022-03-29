/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_yyfl';
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

            X.radio([me.nodes.btn_1, me.nodes.btn_2, me.nodes.btn_3, me.nodes.btn_4], function (sender) {
                me.changeType({
                    btn_1$: 1,
                    btn_2$: 2,
                    btn_3$: 3,
                    btn_4$: 4,
                }[sender.getName()], sender);
            });
        },
        onHide: function () {
            G.frame.xnhd.checkRedPoint();
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_1.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            if (G.frame.xnhd.yyflRedObj.fuli) {
                G.setNewIcoImg(me.nodes.btn_1);
                me.nodes.btn_1.redPoint.setPosition(150, 38);
            } else {
                G.removeNewIco(me.nodes.btn_1);
            }
            if (G.frame.xnhd.yyflRedObj.sale) {
                G.setNewIcoImg(me.nodes.btn_2);
                me.nodes.btn_2.redPoint.setPosition(150, 38);
            } else {
                G.removeNewIco(me.nodes.btn_2);
            }
            if (G.frame.xnhd.yyflRedObj.yyjc) {
                G.setNewIcoImg(me.nodes.btn_4);
                me.nodes.btn_4.redPoint.setPosition(150, 38);
            } else {
                G.removeNewIco(me.nodes.btn_4);
            }
        },
        changeType: function (type, sender) {
            var me = this;

            if (type == 2) {
                G.removeNewIco(sender);
            }
            if (type == 4) {
                G.removeNewIco(sender);
                X.cacheByUid('xnhd_ckjc', 1);
            }
            me.curType = type;
            me.table = undefined;
            me.nodes.txt_kj.setVisible(type == 4);
            me.nodes.scrollview.removeAllChildren();
            me.setTable();

            me.ui.finds('img_gsbg').setVisible(type == 3);
            me.nodes.text_sl.setVisible(type == 3);
            me.nodes.panel_token.setVisible(type == 3);
            if (type == 3) {
                me.showToken();
            }
        },
        showToken: function () {
            var me = this;
            var need = G.gc.xnhd.duihuanneed;
            me.nodes.panel_token.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.text_sl.setString(X.fmtValue(G.class.getOwnNum(need.t, need.a)));
        },
        getData: function () {
            switch (this.curType) {
                case 1:
                    return G.gc.xnhd.fuli.sort(function (a, b) {
                        var lqA = X.inArray(G.frame.xnhd.DATA.myinfo.fuli, a.index);
                        var lqB = X.inArray(G.frame.xnhd.DATA.myinfo.fuli, b.index);
                        if (lqA != lqB) {
                            return lqA < lqB ? -1 : 1;
                        } else {
                            return a.index < b.index ? -1 : 1;
                        }
                    });
                case 2:
                    cc.each(G.gc.xnhd.zhekou, function (sale) {
                        if (G.frame.xnhd.DATA.myinfo.num >= sale.val && !X.cacheByUid('xnhd_sale_' + sale.index)) {
                            X.cacheByUid('xnhd_sale_' + sale.index, 1);
                        }
                    });
                    return G.gc.xnhd.zhekou.sort(function (a, b) {
                        var numA = G.frame.xnhd.DATA.myinfo.zhekou[a.index] || 0;
                        var numB = G.frame.xnhd.DATA.myinfo.zhekou[b.index] || 0;
                        var maxA = numA >= a.maxnum;
                        var maxB = numB >= b.maxnum;
                        if (maxA != maxB) {
                            return maxA < maxB ? -1 : 1;
                        } else {
                            return a.index < b.index ? -1 : 1;
                        }
                    });
                case 3:
                    var conf = G.gc.xnhd.duihuan;
                    var data = [];
                    cc.each(conf, function (obj, id) {
                        var _obj = JSON.parse(JSON.stringify(obj));
                        _obj.id = id;
                        _obj.buyNum = G.frame.xnhd.DATA.myinfo.duihuan[_obj.id] || 0;
                        _obj.buyMax = _obj.buyNum >= _obj.maxnum;
                        data.push(_obj);
                    });
                    return data.sort(function (a, b) {
                        if (a.buyMax != b.buyMax) {
                            return a.buyMax < b.buyMax ? -1 : 1;
                        } else {
                            return Number(a.id) < Number(b.id) ? -1 : 1;
                        }
                    });
                case 4:
                    return G.gc.xnhd.poolprize;
            }
        },
        setTable: function () {
            var me = this;
            var data = me.getData();

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes['list_liebiao' + me.curType], 1, function (ui, data, pos) {
                    me['setItem' + me.curType](ui, data, pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem1: function (ui, data) {
            var me = this;
            var ylq = X.inArray(G.frame.xnhd.DATA.myinfo.fuli, data.index);
            X.autoInitUI(ui);
            X.render({
                libao_mz: X.STR(L('YYXP'), data.val),
                wz_xg: '(' + G.frame.xnhd.DATA.myinfo.num + '/' + data.val + ')',
                ico_nr: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true
                    });
                },
                btn_lq: function (node) {
                    node.setVisible(!ylq);
                    node.setEnableState(G.frame.xnhd.DATA.myinfo.num >= data.val);
                    node.noMove(function () {
                        me.ajax('herohot_fuli', [data.index], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: _data.d.prize
                                }).show();
                                G.frame.xnhd.DATA.myinfo.fuli.push(data.index);
                                me.setTable();
                                G.hongdian.getData('herohot', 1);
                                G.frame.xnhd.checkRedPoint();
                                me.checkRedPoint();
                            }
                        });
                    });
                },
                txt_ylq: function (node) {
                    node.setVisible(ylq);
                },
                zs_wz: function (node) {
                    node.setTextColor(cc.color(G.frame.xnhd.DATA.myinfo.num >= data.val ? '#2f5719' : '#6c6c6c'));
                }
            }, ui.nodes);
        },
        setItem2: function (ui, data) {
            var me = this;
            var buyNum = G.frame.xnhd.DATA.myinfo.zhekou[data.index] || 0;
            var need = data.need[0];
            X.autoInitUI(ui);
            X.render({
                txt_zk: data.sale + L('sale'),
                libao_mz2: X.STR(L('YYXP'), data.val) + '(' + G.frame.xnhd.DATA.myinfo.num + '/' + data.val + ')',
                wz_xg2: function (node) {
                    node.setString(X.STR(L('XGXG'), data.maxnum - buyNum));
                    node.setVisible(buyNum < data.maxnum);
                },
                ico_nr2: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true
                    });
                },
                txt_ysq: function (node) {
                    node.setVisible(buyNum >= data.maxnum);
                },
                btn_gm: function (node) {
                    node.setEnableState(G.frame.xnhd.DATA.myinfo.num >= data.val);
                    node.setVisible(buyNum < data.maxnum);
                    node.noMove(function () {
                        G.frame.alert.data({
                            cancelCall: null,
                            okCall: function () {
                                me.ajax('herohot_zhekou', [data.index], function (str, _data) {
                                    if (_data.s == 1) {
                                        if (!G.frame.xnhd.DATA.myinfo.zhekou[data.index]) G.frame.xnhd.DATA.myinfo.zhekou[data.index] = 0;
                                        G.frame.xnhd.DATA.myinfo.zhekou[data.index] ++;
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        me.setTable();
                                    }
                                });
                            },
                            richText: L("SFGM"),
                            sizeType: 3
                        }).show();
                    });
                },
                ico_zs: function (node) {
                    node.setBackGroundImage(G.class.getItemIco(need.t), 1);
                },
                zs_wz2: function (node) {
                    node.setString(need.n);
                    node.setTextColor(cc.color(G.frame.xnhd.DATA.myinfo.num >= data.val ? '#2f5719' : '#6c6c6c'))
                },
                daibi_xh: function (node) {
                    node.show();
                }
            }, ui.nodes);
        },
        setItem3: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                item1: function (node) {
                    var item = G.class.sitem(data.need[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                item2: function (node) {
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                txt3: function (node) {
                    node.setTextColor(cc.color('#804326'));
                    node.setString(X.STR(L("DOUBLE12"), data.maxnum - data.buyNum));
                },
                btn3: function (node) {
                    node.setEnableState(!data.buyMax);
                    node.click(function () {
                        G.frame.buying.data({
                            num: 1,
                            item: data.prize,
                            need: data.need,
                            maxNum: data.maxnum - data.buyNum,
                            callback: function (num) {
                                me.ajax('herohot_duihuan', [data.id, num], function (str, _data) {
                                    if (_data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        if (!G.frame.xnhd.DATA.myinfo.duihuan[data.id]) {
                                            G.frame.xnhd.DATA.myinfo.duihuan[data.id] = 0;
                                        }
                                        G.frame.xnhd.DATA.myinfo.duihuan[data.id] += num;
                                        me.setTable();
                                        me.showToken();
                                    }
                                });
                            }
                        }).show();
                    });
                },
                btn_txt: function (node) {
                    node.setTextColor(cc.color(data.buyMax ? '#6c6c6c' : '#7b531a'));
                }
            }, ui.nodes);
        },
        setItem4: function (ui, data, pos) {
            var me = this;
            X.autoInitUI(ui);

            if (G.frame.xnhd.DATA.day != 8 || G.time < X.getTodayZeroTime() + 12 * 3600) {
                X.render({
                    item4: function (node) {
                        var prize = G.class.sitem(data[1][0]);
                        prize.setPosition(node.width / 2, node.height / 2);
                        node.removeAllChildren();
                        node.addChild(prize);
                        G.frame.iteminfo.showItemInfo(prize);
                    },
                    txt_pm: X.STR(L('DJM'), X.num2China(data[0][0])) + L('prizePool'),
                    txt_jc: X.STR(G.gc.xnhd.poolinfo, data[0][0], data[4].n, data[2], G.class.getItem(data[1][0].t, data[1][0].a).name,
                        data[1][0].n, data[3]),
                    txt_tprs: '',
                    txt_jp: ''
                }, ui.nodes);
            } else {
                var num = G.frame.xnhd.DATA.kuaizhao[pos].selectnum || 0;
                var prizeNum = parseInt(num / data[2]) || 1;
                X.render({
                    item4: function (node) {
                        var prize = G.class.sitem(data[1][0]);
                        prize.setPosition(node.width / 2, node.height / 2);
                        node.removeAllChildren();
                        node.addChild(prize);
                        G.frame.iteminfo.showItemInfo(prize);
                    },
                    txt_pm: X.STR(L('DJM'), X.num2China(data[0][0])) + L('prizePool'),
                    txt_jc: '',
                    txt_tprs: L("TPRS") + "：" + num,
                    txt_jp: num ? X.STR(L('poolkj'), prizeNum > data[3] ? data[3] : prizeNum, G.class.getItem(data[1][0].t, data[1][0].a).name, data[1][0].n)
                        : L('poolno'),
                    btn4: function (node) {
                        node.setVisible(G.frame.xnhd.DATA.day >= 8 && G.time >= X.getTodayZeroTime() + 12 * 3600 && num > 0);
                        node.click(function () {
                            var _obj = G.frame.xnhd.DATA.lottery;
                            var plid = G.frame.xnhd.DATA.kuaizhao[pos].plid;
                            G.frame.xnhd_jggs.data({
                                index: pos,
                                num: prizeNum > data[3] ? data[3] : prizeNum,
                                data: _obj[plid] || _obj[Object.keys(_obj)[0]]
                            }).show();
                        });
                    }
                }, ui.nodes);
            }
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_tip_yyfl.json', ID);
})();