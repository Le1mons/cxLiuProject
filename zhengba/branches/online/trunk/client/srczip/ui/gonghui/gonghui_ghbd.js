/**
 * Created by LYF on 2019/2/16.
 */
(function () {
    //公会-榜单
    var ID = 'gonghui_ghbd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("GXBD"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("rank_open", [22], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            new X.bView('gonghui_gxbd1.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(view.nodes.scrollview);
                me.initUi();
                me.bindBtn();

                me.setContents();
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            if(me.DATA.ranklist.length < 1) return me._view.nodes.img_zwnr.show();

            var table = new X.TableView(me._view.nodes.scrollview, me._view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(me.DATA.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.sz_phb.setString(data.rank);
            ui.nodes.txt_name.setString(data.headdata.name);
            ui.nodes.txt_jrgx.setString(data.daynum);
            ui.nodes.txt_lsgx.setString(data.val);

            ui.nodes.panel_tx.removeAllChildren();
            var head = G.class.shead(data.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.addChild(head);
        }
    });
    G.frame[ID] = new fun('gonghui_tip2.json', ID);
})();