/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_jtpm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            X.radio([me.nodes.btn_zyjj, me.nodes.btn_phb], function(sender) {
                var name = sender.getName();
                var name2type = {
                    btn_zyjj$: 1,
                    btn_phb$: 2
                };
                me.changeType(name2type[name]);
            });

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        changeType: function (type) {
            this.type = type;
            this.rankData = type == 1 ? this.DATA.rankinfo[28] : this.DATA.rankinfo[29];
            this.setTable();
            this.nodes.txt_tip.setString(L("camp_rank" + type));
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        show: function () {
            var me = this;
            var _super = me._super;

            connectApi("rank_open", [28, 29], function (data) {
                me.DATA = data;
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setTable: function () {
            var me = this;
            var type = me.type;
            var list = type == 1 ? me.nodes.list_rank1 : me.nodes.list_rank;
            var data = me.rankData;
            me.nodes.scrollview.removeAllChildren();
            me.nodes.img_zwnr.setVisible(data.ranklist.length == 0);
            var table = new X.TableView(me.nodes.scrollview, list, 1, function (ui, data) {
                type == 1 ? me.setItem(ui, data) : me.setItem1(ui, data);
            }, null, null, 8, 10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
        },
        getSsPer: function (val) {
            var me = this;
            var maxVal;
            for (var index = 0; index < me.rankData.ranklist.length; index ++) {
                var rankInfo = me.rankData.ranklist[index];
                if (!maxVal || rankInfo.num > maxVal) maxVal = rankInfo.num;
            }
            if (val == maxVal) return 100;
            return 30 + val * .7 / maxVal * 100;
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                txt_name1: function (node) {
                    node.setString(G.frame.wujunzhizhan_main.camp[data.faction]);
                },
                img_rank1: function (node) {
                    node.setVisible(data.rank < 4);
                    data.rank < 4 && node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                },
                panel_tx1: function (node) {
                    node.setBackGroundImage("ico/avatarico/camp_" + data.faction + ".png");
                },
                sz_phb1: function (node) {
                    node.setVisible(data.rank > 3);
                    node.setString(data.rank);
                },
                img_jdt01: data.live / data.team * 100,
                img_jdt02: me.getSsPer(data.num),
                txt_jdt_sz01: function (node) {
                    node.setString(data.live + "/" + data.team);
                    X.enableOutline(node, "#3c1605", 1);
                },
                txt_jdt_sz02: function (node) {
                    node.setString(X.fmtValue(data.num));
                    X.enableOutline(node, "#3c1605", 1);
                },
                text_ss1: function (node) {
                    node.setVisible(data.live > 0);
                    X.enableOutline(node, "#764e28", 2);
                },
                img_jdtdi02: function (node) {
                    node.setVisible(data.live < 1);
                }
            }, ui.nodes);
        },
        setItem1: function (ui, data) {
            X.autoInitUI(ui);
            X.render({
                txt_name: function (node) {
                    node.setString(G.frame.wujunzhizhan_main.camp[data.faction]);
                },
                img_rank: function (node) {
                    node.setVisible(data.rank < 4);
                    data.rank < 4 && node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                },
                panel_tx: function (node) {
                    node.setBackGroundImage("ico/avatarico/camp_" + data.faction + ".png");
                },
                sz_phb: function (node) {
                    node.setVisible(data.rank > 3);
                    node.setString(data.rank);
                },
                txt_number: function (node) {
                    node.setString(data.integral);
                },
                text_qufu: function (node) {
                    node.setString(data.sumlive);
                },
                text_dd: function (node) {
                    node.setString(X.fmtValue(data.num));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_tip1.json', ID);
})();