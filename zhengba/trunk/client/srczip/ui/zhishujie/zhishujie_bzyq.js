/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_bzyq';
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
            me.nodes.jifen.show();
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            me.setTable();
            me.showMyInfo();
        },
        getData: function (callback) {
            var me = this;

            me.ajax('planttrees_ranklist', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        showMyInfo: function () {
            var me = this;

            X.render({
                wodepaiming: L("WDPM") + (me.DATA.myrank != -1 ? (me.DATA.myrank >= 100 ? 100 + L("MW"): me.DATA.myrank) : L("WSB")),
                jifen: L("WDJSG") + me.DATA.myval
            }, me.nodes);
        },
        setTable: function () {
            var me = this;

            me.nodes.img_zwnr.setVisible(me.DATA.ranklist.length < 1);
            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(me.DATA.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            X.render({
                panel_pm: function (node) {
                    node.removeBackGroundImage();
                    if(data.rank < 4){
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                    }
                },
                sz_phb: function (node) {
                    node.setVisible(data.rank > 3);
                    node.setString(data.rank)
                },
                panel_tx: function (node) {
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                },
                text_mz: data.headdata.name,
                text_qf: data.name,
                text_jf: X.STR(L("HDJSG"), data.val),
                panel_wp: function (node) {
                    var prize = data.rank < 4 ? G.gc.zhishujie.rankprize[data.rank - 1] : G.gc.zhishujie.rankprize[3];
                    X.alignCenter(node, [].concat(prize[1][0]), {
                        touch: true
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('zhishujie_bzyq.json', ID);
})();