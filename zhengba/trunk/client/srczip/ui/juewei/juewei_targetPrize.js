/**
 * Created by LYF on 2019/10/11.
 */
(function () {
    //爵位-目标奖励
    var ID = 'juewei_targetPrize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.finds("title").setString(L("JWJL"));
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds("mask_rz").click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.conf = G.gc.jueweicom.aimsprize;
            me.setTable();
        },
        onHide: function () {
            var me = this;
        },
        setTable: function () {
            var me = this;
            var data = me.getData();

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        getData: function () {
            var lq = [];
            var ylq = [];
            var me = this;
            var conf = me.conf;
            var recList = G.frame.juewei.DATA.reclist;

            function fun(arr) {
                arr.sort(function (a, b) {
                    return a * 1 < b * 1 ? -1 : 1;
                });
            }

            for (var i = 0; i < conf.length; i ++) {
                if (X.inArray(recList, i)) ylq.push(i);
                else lq.push(i);
            }
            fun(lq);
            fun(ylq);

            return [].concat(lq, ylq);
        },
        geiJWName: function (lv) {
            var conf = G.gc.juewei[lv];

            return conf.name + (conf.rank != 0 ? "+" + conf.rank : "");
        },
        setItem: function (ui, data) {
            var me = this;
            var conf = me.conf[data];
            var curNum = P.gud.title || 0;

            var ylq = X.inArray(G.frame.juewei.DATA.reclist, data);
            var klq = !ylq && curNum >= conf.cond;

            X.autoInitUI(ui);
            if (klq) {
                G.setNewIcoImg(ui.nodes.btn_qd);
                ui.nodes.btn_qd.redPoint.setPosition(123, 55);
            } else {
                G.removeNewIco(ui.nodes.btn_qd);
            }
            X.render({
                panel_tx: function (node) {
                    X.alignItems(node, conf.prize, "left", {
                        touch: true
                    });
                },
                txt_name: function (node) {
                    node.setString(X.STR(L("JWDD"), me.geiJWName(conf.cond)));
                    node.setTextColor(cc.color(curNum >= conf.cond ? "#1F9D13" : "#D7302D"));
                },
                btn_qd: function (node) {
                    node.setEnableState(klq);
                    node.click(function () {
                        me.ajax("title_receive", [data], function (str, dd) {
                            if (dd.s == 1) {
                                G.event.emit('sdkevent',{
                                    event:'title_receive',
                                    data:{
                                        nowLv:P.gud.title,
                                        get:conf.prize,
                                    }
                                });
                                G.frame.jiangli.data({
                                    prize: conf.prize
                                }).show();
                                G.frame.juewei.DATA.reclist.push(data);
                                me.setTable();
                                G.hongdian.getData("title", 1, function () {
                                    G.frame.juewei.checkRedPoint();
                                });
                            }
                        });
                    });
                },
                txt_qd: function (node) {
                    node.setString(ylq ? L("YLQ") : (klq ? L("KLQ") : L("LQ")));
                    node.setTextColor(cc.color(klq ? "#2f5719" : "#6c6c6c"))
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('shendianzhilu_lcb_sdmg.json', ID);
})();