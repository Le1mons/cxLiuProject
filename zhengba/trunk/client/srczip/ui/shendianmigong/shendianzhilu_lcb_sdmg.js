/**
 * Created by  on 2019//.
 */
(function () {
    //神殿迷宫-里程碑
    var ID = 'maze_lcb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

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
            var conf = me.conf = G.gc.mazecom.base.landmark;
            var keys = Object.keys(conf);
            var recList = G.frame.maze.DATA.data.reclist;

            function fun(arr) {
                arr.sort(function (a, b) {
                    return a * 1 < b * 1 ? -1 : 1;
                });
            }

            for (var i = 0; i < keys.length; i ++) {
                if (X.inArray(recList, keys[i])) ylq.push(keys[i]);
                else lq.push(keys[i]);
            }
            fun(lq);

            var arr = [];

            for (var i = 0; i < 10; i ++) {
                if (lq[i]) arr.push(lq[i]);
            }

            if (arr.length < 1) {
                G.frame.maze.nodes.btn_lcb.hide();
                return me.remove();
            }
            return arr;
        },
        setItem: function (ui, data) {
            var me = this;
            var conf = me.conf[data];
            var curNum = G.frame.maze.DATA.data.total[conf.cond.diff] || 0;

            var ylq = X.inArray(G.frame.maze.DATA.data.reclist, data);
            var klq = !ylq && curNum >= conf.cond.num;

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
                txt_name: X.STR(L("mazetg"), conf.cond.diff, conf.cond.num) + "(" + curNum + "/" + conf.cond.num + ")",
                btn_qd: function (node) {
                    node.setEnableState(klq);
                    node.click(function () {
                        me.ajax("maze_getprize", [data], function (str, dd) {
                            if (dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: conf.prize
                                }).show();
                                G.frame.maze.DATA.data.reclist.push(data);
                                me.setTable();
                                G.hongdian.getData("fashita", 1, function () {
                                    G.frame.julongshendian.checkRedPoint();
                                    G.frame.maze.checkRedPoint();
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

            ui.nodes.txt_name.setTextColor(cc.color(curNum >= conf.cond.num ? G.gc.COLOR[1] : G.gc.COLOR[5]))
        }
    });
    G.frame[ID] = new fun('shendianzhilu_lcb_sdmg.json', ID);
})();