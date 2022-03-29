/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wztt_ttbz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("TTPH"));
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

            connectApi("rank_open", [30], function (data) {
                me.DATA = data;
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            new X.bView("wztt_ttpm.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(view.nodes.scrollview);
                me.setContents();
            });
        },
        showStr: function (node, star, color, outline) {
            var dan = G.class.getDan(star);
            var addStar = star > Object.keys(G.gc.wztt.star).length - 1 ? star - (Object.keys(G.gc.wztt.star).length - 1) : 0;
            var rh = X.setRichText({
                str: dan.intr + (addStar ? "<font node=1></font>" + addStar : ""),
                parent: node,
                node: new ccui.ImageView("img/wztt/img_tt_xx_xiao.png", 1),
                maxWidth: 300,
                color: color,
                outline: outline
            });
            rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
        },
        setContents: function () {
            var me = this;
            X.render({
                txt_dw: me.DATA.myrank > 0 ? me.DATA.myrank : "",
                panel_qw1: function (node) {
                    me.showStr(node, G.frame.wztt.DATA.star, "#ebc206", "#802B26");
                }
            }, me.view.nodes);
            me.view.finds("wsb_pmyer").setVisible(me.DATA.myrank <= 0);

            if (me.DATA.ranklist.length < 1) return me.view.nodes.img_zwnr.show();

            var table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data)
            });
            table.setData(me.DATA.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                sz_phb: data.rank,
                img_rank: function (node) {
                    node.removeBackGroundImage();
                    data.rank < 4 && node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                },
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.addChild(head);
                },
                txt_name: function (node) {
                    node.setTextColor(cc.color("#804326"));
                    node.setString(data.headdata.name || "");
                },
                txt_title: function (node) {
                    node.setTextColor(cc.color("#804326"));
                },
                text_zdl2: function (node) {
                    node.setTextColor(cc.color("#804326"));
                    node.setString(X.fmtValue(data.maxzhanli || 0));
                },
                panel_qw: function (node) {
                    me.showStr(node, data.val || 0);
                }
            }, ui.nodes);
        }

    });
    G.frame[ID] = new fun('ui_tip4.json', ID);
})();