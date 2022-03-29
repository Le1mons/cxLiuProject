/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_ljpm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_zdjl.setString(L("LJPM"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        show: function () {
            var me = this;
            var _super = me._super;

            connectApi("rank_open", [27], function (data) {
                me.DATA = data;
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            new X.bView("wujunzhizhan_ljpm.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.scrollview);
                me.setTable();
                me.setMyRank();
            });
        },
        setMyRank: function () {
            var me = this;

            me.view.nodes.txt_dw.setString(me.DATA.myval);
            me.view.finds("txt_level_0").setString(me.DATA.myrank && me.DATA.myrank != -1 ? me.DATA.myrank : "");
            me.view.finds("wsb_pmyer").setVisible(!me.DATA.myrank || me.DATA.myrank == -1);
        },
        setTable: function () {
            var me = this;
            var data = me.DATA;

            me.view.nodes.img_zwnr.setVisible(data.ranklist.length == 0);
            var table = me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 8, 10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txtGuanqia = ui.nodes.txt_number;
            var txtQuFu = ui.nodes.text_qufu;

            layPh.hide();
            txtPh.setString('');
            layIco.removeAllChildren();
            if (data.rank < 4) {
                layPh.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                layPh.show();
            } else {
                txtPh.setString(data.rank);
                txtPh.show();
            }

            var wid = G.class.shead(data.headdata);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            txtName.setString(data.headdata.name);
            txtGuanqia.setString(data.val);
            txtQuFu.setString(data.name || L("ZW"));
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();