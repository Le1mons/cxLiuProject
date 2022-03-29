/**
 * Created by
 */
(function () {
    //
    var ID = 'lianhunta_sj';
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

            me.recOpen = false;
            var openCond = G.gc.lhtcom.guanka[4].layerinfo;
            var layer = openCond[openCond.length - 1]
            if (G.frame.lianhunta.DATA.layerstar[layer] && G.frame.lianhunta.DATA.layerstar[layer].length > 0) {
                me.recOpen = true;
            }
        },
        onShow: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var data = [];

            data = data.concat(G.gc.lhtcom.starprize);
            cc.each(data, function (d, index) {
                d.index = index;
            });
            data.sort(function (a, b) {
                var recA = X.inArray(G.frame.lianhunta.DATA.rec, a.index);
                var recB = X.inArray(G.frame.lianhunta.DATA.rec, b.index);

                if (recA != recB) {
                    return recA < recB ? -1 : 1;
                } else {
                    return a.val < b.val ? -1 : 1;
                }
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
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
            var star = G.frame.lianhunta.DATA.allstar;
            var isRec = X.inArray(G.frame.lianhunta.DATA.rec, data.index);
            var selectIndex = G.frame.lianhunta.DATA.selectprize[data.index];

            X.autoInitUI(ui);
            X.render({
                ico_list: function (node) {
                    node.hide();
                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);
                    node.removeAllChildren();
                    if (selectIndex != undefined) {
                        X.alignItems(node, G.gc.lhtcom.prizepool[selectIndex].prize, 'left', {
                            scale: .8,
                            mapItem: function (node) {
                                if (!isRec) {
                                    var img = new ccui.ImageView('img/lianhunta/img_th.png', 1);
                                    img.setAnchorPoint(0.5, 0.5);
                                    img.setPosition(node.width, node.height);
                                    node.addChild(img);
                                    node.setTouchEnabled(true);
                                    node.noMove(function () {
                                        G.frame.lianhunta_select.data({
                                            index: data.index,
                                            selectIndex: selectIndex,
                                            callback: function () {
                                                me.setTable();
                                            }
                                        }).show();
                                    });
                                }
                            }
                        });
                    } else {
                        X.alignItems(node, [null], 'left', {
                            scale: .8,
                            mapItem: function (node) {
                                node.num.hide();
                                node.background.loadTexture('img/public/ico/ico_bg4.png', 1);
                                node.setTouchEnabled(true);
                                node.noMove(function () {
                                    G.frame.lianhunta_select.data({
                                        index: data.index,
                                        callback: function () {
                                            me.setTable();
                                        }
                                    }).show();

                                });
                                var img = new ccui.ImageView('img/public/img_dwjiahao.png', 1);
                                img.setAnchorPoint(0.5, 0.5);
                                img.setPosition(node.width / 2, node.height / 2);
                                node.addChild(img);
                                var action = cc.sequence(cc.fadeOut(1.5), cc.fadeIn(1.5)).repeatForever();
                                img.runAction(action);
                            }
                        });
                    }
                },
                libao_mz: function (node) {
                    var color = star >= data.val ? '#1c9700' : '#804326';
                    var rh = X.setRichText({
                        str: X.STR(L("lht_star"), data.val) + '(<font color=' + color + '>' + star
                            + '/' + data.val + '</font>)',
                        parent: node,
                    });
                    rh.x = 0;
                },
                btn_gm: function (node) {
                    if (!isRec && me.recOpen && star >= data.val) {
                        G.setNewIcoImg(node);
                        node.redPoint.setPosition(120, 52);
                    } else {
                        G.removeNewIco(node);
                    }
                    node.setEnableState(!isRec && me.recOpen && star >= data.val);
                    node.noMove(function () {
                        if (star < data.val) return null;
                        if (selectIndex == undefined) {
                            return G.tip_NB.show(L("QXZYGMBJL"));
                        }
                        me.ajax('lianhunta_getprize', [data.index], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: _data.d.prize
                                }).show();
                                G.frame.lianhunta.DATA.rec.push(data.index);
                                me.setTable();
                                G.hongdian.getData('lianhunta', 1, function () {
                                    G.frame.lianhunta.checkRedPoint();
                                });
                            }
                        });
                    });
                },
                zs_wz: function (node) {
                    node.setString(isRec ? L("YLQ") : L("LQ"));
                    var color = isRec || !me.recOpen || star < data.val ? '#6c6c6c' : '#2f5719';
                    node.setTextColor(cc.color(color));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('lianhunta_tk3.json', ID);
})();