/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_jggs';
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
        onShow: function () {
            var me = this;
            var data = G.gc.xnhd.poolprize[me.data().index];

            X.render({
                panel_wp: function (node) {
                    var prize = G.class.sitem(data[1][0]);
                    prize.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(prize);
                    G.frame.iteminfo.showItemInfo(prize);
                },
                txt_jl: G.class.getItem(data[1][0].t, data[1][0].a).name,
                txt_sl: X.STR(L('GCCXF'), me.data().num)
            }, me.nodes);

            var table = new X.TableView(me.nodes.scrollview, me.nodes.txt_wz, 2, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 5, 5);
            table.setData(me.data().data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var rh = X.setRichText({
                parent: ui,
                str: "<font color=" + (data.uid == P.gud.uid ? '#45ff04' : '#ffe1ad') + ">" + data.name + "</font>（" + data.servername + "）",
                color: '#ffffff',
                size: 22,
                maxWidth: ui.width + 50
            });
            rh.setPosition(0, ui.height / 2 - rh.trueHeight() / 2);
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_jggs.json', ID);
})();