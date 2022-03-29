/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wztt_pmjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("PHJL"));
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
        onShow: function () {
            var me = this;

            new X.bView("wztt_pmjl.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(view.nodes.scrollview);
                me.setContents();
            });
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.wztt.email.prize;

            var table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(conf);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            X.render({
                img_wp: function (node) {
                    X.alignItems(node, data[3] || [], 'left', {
                        touch: true,
                        scale: .7
                    });
                },
                txt_wzjl: function (node) {
                    var rh = X.setRichText({
                        str: data[4] || "",
                        parent: node,
                        color: "#804326",
                        size: 22
                    });
                    rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                },
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('ui_tip4.json', ID);
})();