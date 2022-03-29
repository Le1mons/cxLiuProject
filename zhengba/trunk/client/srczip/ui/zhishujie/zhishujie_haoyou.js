/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_haoyou';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.oldDATA = JSON.parse(JSON.stringify(G.frame.zhishujie_main.DATA));
            me.nodes.mask.click(function () {
                if (me.add) {
                    G.frame.zhishujie_main.getData(function () {
                        G.frame.zhishujie_main.oldDATA = me.oldDATA;
                        G.frame.loadingIn.show();
                        G.frame.zhishujie_zsyq.showAni({
                            state: 'addnl',
                            callback: function () {
                                G.frame.zhishujie_zsyq.showFruit();
                                for (var index = 0; index < G.frame.zhishujie_zsyq.maxLen; index ++) {
                                    var parent = G.frame.zhishujie_zsyq.nodes['panel_' + (index + 1)];
                                    G.frame.zhishujie_zsyq.upFruit(parent.list.gz, index);
                                }
                                G.frame.loadingIn.remove();
                            }
                        });

                    });
                }
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);

            if (me._extData && me._extData.type == 'get') {
                me.ui.finds('text_1').setString(L("YJSQ"));
                me.nodes.txt_title.setString(L("SQNL"));
            }

            me.nodes.btn_1.click(function () {
                me.ajax(me._extData.type == 'get' ? 'planttrees_accept' : 'planttrees_gift', ['all'], function (str, data) {
                    if (data.s == 1) {
                        me.add = true;
                        G.frame.zhishujie_main.getData(function () {
                            G.frame.zhishujie_zsyq.showFruit();
                            me.setTable();
                            me.showStr();
                        });
                        G.hongdian.getData('planttrees', 1, function () {
                            G.frame.zhishujie_main.checkRedPoint();
                            G.frame.zhishujie_zsyq.checkRedPoint();
                        });
                    }
                });
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;

            if (!me.DATA) {
                me.ajax('friend_open', [], function (str, data) {
                    if (data.s == 1) {
                        me.DATA = data.d.friend;
                        _super.apply(me);
                    }
                });
            } else {
                _super.apply(me);
            }
        },
        onShow: function () {
            var me = this;

            me.setTable();
            me.showStr();
        },
        showStr: function () {
            var me = this;
            var data = G.frame.zhishujie_main.DATA.myinfo;
            X.setRichText({
                str: me._extData.type == 'get' ? X.STR(L('zs_sq'), G.gc.zhishujie.acceptmaxnum - data.accept.length) :
                    X.STR(L('zs_js'), G.gc.zhishujie.giftmaxnum - data.gift.length < 0 ? 0 : G.gc.zhishujie.giftmaxnum - data.gift.length),
                parent: me.nodes.txt_wz
            });
        },
        setTable: function () {
            var me = this;

            me.nodes.img_zwnr.setVisible(me.DATA.length < 1);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(me.DATA);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.DATA);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.nodes.text_js = ui.finds('text_js');
            X.render({
                panel_tx: function (node) {
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                },
                text_mz: data.headdata.name,
                text_qf: data.headdata.svrname,
                text_js: function (node) {
                    var str, color;
                    if (me.data().type == 'get') {
                        if (X.inArray(G.frame.zhishujie_main.DATA.myinfo.accept, data.headdata.uid)) {
                            str = L("zsj_ysq");
                            color = "#6c6c6c";
                        } else {
                            str = L("zsj_sq");
                            color = "#2f5719";
                        }
                    } else {
                        if (X.inArray(G.frame.zhishujie_main.DATA.myinfo.gift, data.headdata.uid)) {
                            str = L("zsj_yjs");
                            color = "#6c6c6c";
                        } else {
                            str = L("zsj_js");
                            color = "#2f5719";
                        }
                    }
                    node.setString(str);
                    node.setTextColor(cc.color(color));
                },
                btn_js: function (node) {
                    if (me.data().type == 'get') {
                        node.setVisible(X.inArray(G.frame.zhishujie_main.DATA.helplist, data.headdata.uid));
                    }
                    node.setEnableState(me._extData.type == 'get' ? !X.inArray(G.frame.zhishujie_main.DATA.myinfo.accept, data.headdata.uid) :
                        !X.inArray(G.frame.zhishujie_main.DATA.myinfo.gift, data.headdata.uid));
                    node.click(function () {
                        if (me._extData.type == 'get') {
                            me.ajax('planttrees_accept', [data.headdata.uid], function (str, _data) {
                                if (_data.s == 1) {
                                    me.add = true;
                                    G.frame.zhishujie_main.getData(function () {
                                        G.frame.zhishujie_zsyq.showFruit();
                                        me.setTable();
                                        me.showStr();
                                    });
                                    G.hongdian.getData('planttrees', 1, function () {
                                        G.frame.zhishujie_main.checkRedPoint();
                                        G.frame.zhishujie_zsyq.checkRedPoint();
                                    });
                                }
                            });
                        } else {
                            me.ajax('planttrees_gift', [data.headdata.uid], function (str, _data) {
                                if (_data.s == 1) {
                                    me.add = true;
                                    G.frame.zhishujie_main.getData(function () {
                                        G.frame.zhishujie_zsyq.showFruit();
                                        me.setTable();
                                        me.showStr();
                                    });
                                    G.hongdian.getData('planttrees', 1, function () {
                                        G.frame.zhishujie_main.checkRedPoint();
                                        G.frame.zhishujie_zsyq.checkRedPoint();
                                    });
                                }
                            });
                        }
                    });
                },
                txt_nl: function (node) {
                    if (me._extData.type == 'get' && X.inArray(G.frame.zhishujie_main.DATA.helplist, data.headdata.uid)) {
                        node.show();
                        node.setString(L("NL") + '+' + G.gc.zhishujie.acceptval)
                    } else {
                        node.hide();
                    }
                }
            }, ui.nodes);

        }
    });
    G.frame[ID] = new fun('zhishujie_jshz.json', ID);
})();