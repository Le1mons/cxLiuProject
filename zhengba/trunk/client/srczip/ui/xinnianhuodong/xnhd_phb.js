/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_phb';
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
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax('herohot_ranklist', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.txt_ps.setString(me.DATA.myval + L("ZHANG"));

            if (me.DATA.ranklist.length < 1) return me.nodes.img_zwnr.show();

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 5, 5);
            table.setData(me.DATA.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                panel_tx: function (node) {
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(head);
                },
                txt_name: data.headdata.name,
                txt_title: data.name,
                text_wkj: L("TPZS") + "：" + data.val,
                sz_phb: data.rank,
                ico_nr: function (node) {
                    var prize = me.getPrize(data.rank);
                    if (prize) {
                        X.alignCenter(node, prize, {
                            touch: true
                        });
                    } else node.removeAllChildren();
                }
            }, ui.nodes);
        },
        getPrize: function (rank) {
            var conf = G.gc.xnhd.emailprize;

            for (var index = 0; index < conf.length; index ++) {
                var _conf = conf[index];
                if (rank >= _conf[0][0] && rank <= _conf[0][1]) return _conf[1];
            }
            return null;
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_yyb.json', ID);
})();