/**
 * Created by LYF on 2018/9/25.
 */
(function () {
    //月基金
    G.class.huodong_todaylibao = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("event_mrth.json");
        },
        bindBTN: function() {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.CONF = G.gc.todaylibao;
            cc.enableScrollBar(me.ui.finds("scrollview"));
        },
        onShow: function () {
            var me = this;
            me.setTime();
            me.refreshPanel();
        },
        setTime: function () {
            var me = this;
            X.timeout(me.nodes.txt_cs, X.getTodayZeroTime() + 24 * 3600, function () {
                me.setTime();
                me.refreshPanel();
            });
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setTable();
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax("todaylibao_open", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        setTable: function () {
            var me = this;
            var data = Object.keys(me.CONF.data).sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            if (!me.table) {
                me.table = new X.TableView(me.ui.finds("scrollview"), me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, id) {
            var me = this;
            var buyIdx = me.DATA[id] || 0;
            var conf = me.CONF.data[id];
            var conIdx = conf.arr[buyIdx] ? buyIdx : buyIdx - 1;
            var curConf = conf.arr[conIdx];
            X.autoInitUI(ui);
            X.render({
                panle_wupin: function (node) {
                    X.alignItems(node, curConf.prize, 'left', {
                        touch: true
                    });
                },
                ico: function (node) {
                    node.hide();
                },
                txet_sycs: L("SHENGYU") + (conf.arr.length - buyIdx),
                txet_zhekou: function (node) {
                    node.setString(curConf.sale * 10 + L("sale"));
                },
                txet_gmtp: function (node) {
                    node.setString(parseInt(curConf.baseneed[0].n * curConf.sale));
                },
                ysq: function (node) {
                    node.setVisible(buyIdx > conf.arr.length - 1);
                },
                btn_gmtp: function (node) {
                    node.setVisible(buyIdx <= conf.arr.length - 1);
                    if (curConf.baseneed[0].n == 0) {
                        G.setNewIcoImg(node, .95);
                    } else {
                        G.removeNewIco(node);
                    }
                    node.noMove(function () {
                        G.frame.alert.data({
                            cancelCall: null,
                            okCall: function() {
                                me.ajax("todaylibao_buy", [id], function (str, _data) {
                                    if (_data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        me.refreshPanel();
                                        G.hongdian.getData("todaylibao", 1, function () {
                                            G.frame.huodong.checkRedPoint();
                                        });
                                        G.view.mainView.getAysncBtnsData(null, null, ["todaylibao"]);
                                    }
                                });
                            },
                            richText: L("SFGM"),
                            sizeType: 3
                        }).show();
                    });
                }
            }, ui.nodes);
            ui.setTouchEnabled(false);
            ui.finds("Image_2").loadTexture("img/event/img_mrth_" + {
                0: 'lan',
                1: 'zi',
                2: 'cheng'
            }[id] + ".png");
        }
    })
})();