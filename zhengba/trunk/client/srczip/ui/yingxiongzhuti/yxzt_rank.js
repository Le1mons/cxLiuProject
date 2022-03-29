/**
 * Created by
 */
(function () {
    //
    var ID = 'yxzt_rank';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, { action: true });
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_phb.click(function () {
                me.type = 1;
                me.setContents();

                me.initUi();
            });
            me.nodes.btn_jl.click(function () {
                me.type = 2;
                me.setContents();
                me.initUi();
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.herotheme;
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send("herotheme_rank", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d.ranklist;
                    callback && callback();
                }
            })
        },
        show: function (conf) {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onAniShow: function () {

        },
        onShow: function () {
            var me = this;
            me.type = 1;
            me.setContents();
            me.bindBtn();
            me.initUi();
        },
        setPhbItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            X.render({
                panel_pm: function (node) {
                    node.setVisible(data.rank <= 3);
                    if(data.rank <= 3){
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                    }
                },
                sz_phb: function (node) {
                    node.setVisible(data.rank > 3);
                    node.setString(data.rank);
                },
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2, node.height / 2));
                    node.addChild(wid);
                },
                text_mz: function (node) {
                    node.setString(data.headdata.name);
                },
                text_qf: function (node) {
                    node.setString(X.STR(L('yxzt24'),data.headdata.zhanli));
                },
                text_jf: function (node) {
                    node.setString(data.val);
                },
            }, ui.nodes);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.nodes.panel_ico.setTouchEnabled(false);
            X.render({
                panel_pm2: function (node) {
                    node.hide();
                    // node.setVisible(data.val <= 3);
                    // node.setVisible('img/public/img_paihangbang_' + data.rank + '.png', 1);
                },
                tubiao_neirong: function (node) {
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.p, 'left', {
                        touch: true,
                        scale: 0.8,
                    });
                    node.x = 150;
                },
                sz_phb2: function (node) {
                    // node.setVisible(data.val > 3);
                    node.setString(data.show);
                    node.setScale(0.6);
                },
            }, ui.nodes);
        },
        initUi: function () {
            var me = this;
            X.render({
                wodepaiming: function (node) {
                    node.setVisible(me.type == 1);
                    var str = me.DATA.myrank == -1 ? L("yxzt13") : me.DATA.myrank;
                    node.setString(X.STR(L("yxzt15"), str));
                },
                jifen: function (node) {
                    node.setVisible(me.type == 1);
                    node.setString(me.DATA.myval);
                },
                wz_xx3: function (node) {
                    node.setVisible(me.type == 2);
                    node.setString(L("yxzt16"));
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            me.nodes.btn_phb.setBright(me.type != 1);
            me.nodes.btn_jl.setBright(me.type == 1);
            me.nodes.scrollview.removeAllChildren();
            if (me.type == 1) {
                var data = me.DATA.ranklist;
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                    me.setPhbItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                var data = me.conf.rankprize;
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb2, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            }
        },
    });
    G.frame[ID] = new fun('blsl_tip_phjl.json', ID);
})();