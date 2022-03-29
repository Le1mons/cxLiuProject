/**
 * Created by LYF on 2019/9/21.
 */
(function () {
    //试炼活动
    var ID = 'shilianhuodong';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            // me.nodes.txt_mswz.setString(me.conf[me.type].hdinfo);
            me.nodes.txt_mswz.setString('');
            me.ui.finds("bg_tip_title").loadTexture("img/shilianhuodong/" + me.conf[me.type].img, 1);
            var str = me.conf[me.type].hdinfo;
            var rh = X.setRichText({
                parent: me.nodes.txt_mswz,
                str: str,
                color: "#ffffff",
                outline: "#000000"
            });
            rh.setPosition(0, me.nodes.txt_mswz.height - rh.trueHeight());

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L("TS48")
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            var isOld = G.OPENTIME < 1581696000;
            me.conf = isOld ? G.gc.slhd1 : G.gc.slhd;
            me.type = X.getSlhdType();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            connectApi("trial_open", [], function (data) {
                me.DATA = data;
                me.DATA.receive = me.DATA.receive || [];
                callback && callback();
            });
        },
        show: function () {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.setEndTime(me.ui.finds("txt_sz"), function () {
                X.uiMana.closeAllFrame();
            });

            me.setTable();
        },
        onHide: function () {
            var me = this;
        },
        setEndTime: function (txt, callback) {
            var type = X.getSlhdType();
            var addTime = X.getOpenTimeToNight();
            var toTime = G.OPENTIME + addTime + (type * 7 - 1)  * 24 * 3600;

            if (toTime - G.time > 24 * 3600) {
                txt.setString(X.moment(toTime - G.time));
            } else {
                X.timeout(txt, toTime, function () {
                    callback && callback();
                });
            }
        },
        setTable: function () {
            var me = this;
            var conf = me.conf[me.type];
            var data = Object.keys(conf.task);

            data.sort(function (a, b) {
                var isLqA = X.inArray(me.DATA.receive, a);
                var isLqB = X.inArray(me.DATA.receive, b);
                if (isLqA != isLqB) {
                    return isLqA < isLqB ? -1 : 1;
                } else return a * 1 < b * 1 ? -1 : 1;
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 6);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        geiJWName: function (lv) {
            var conf = G.gc.juewei[lv];

            return conf.name + (conf.rank != 0 ? "+" + conf.rank : "");
        },
        setItem: function (ui, data) {
            var me = this;
            var conf = me.conf[me.type];
            var task = conf.task[data];

            X.autoInitUI(ui);
            X.render({
                panel_wz: function (node) {
                    node.setTouchEnabled(false);
                    var str = X.STR(conf.desc, me.type == 4 ? me.geiJWName(task.pval) : task.pval, task.cond || "") +
                        " <font color=#be5e30>(" + (me.DATA.task[data] || 0) + "/" + task.pval + ")</font>";
                    var rh = X.setRichText({
                        parent: node,
                        str: str,
                        size: 24,
                        color: "#804326"
                    });
                    rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                },
                panel_item: function (node) {
                    X.alignItems(node, task.prize, "left", {
                        touch: true
                    });
                },
                btn_qwhq: function (node) {
                    var canLq = me.DATA.task[data] >= task.pval && !X.inArray(me.DATA.receive, data);
                    node.setEnableState(canLq);
                    node.setTitleText(X.inArray(me.DATA.receive, data) ? L("YLQ") : L("LQ"));
                    node.setTitleColor(cc.color(G.gc.COLOR[canLq ? 'n13' : 'n15']));

                    node.click(function () {
                        me.ajax("trial_receive", [data], function (str, dd) {
                            if (dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: dd.d.prize
                                }).show();
                                me.getData(function () {
                                    me.setTable();
                                });
                                G.hongdian.getData("trial", 1);
                            }
                        });
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('shilianhuodong.json', ID);
})();