/**
 * Created by LYF on 2019/1/14.
 */
(function () {
    //至尊礼包-奖励预览
    var ID = 'szn_qdzk_jlyl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.nodes.tip_title.setString(L("MRJLYL"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.setContents();

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var scrollview = me.nodes.scrollview;
            var data = [];

            for (var i = 0; i < me.DATA.length; i ++) {
                var obj = {
                    day: i + 1,
                    prize: me.DATA[i]
                };
                data.push(obj);
            }

            var table = me.table = new X.TableView(scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 10, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            X.alignItems(ui.nodes.panel_item, data.prize, 'left',{touch:true});
            X.setRichText({
                str: X.STR(L("DJRKL"), data.day),
                parent: ui.nodes.panel_wz,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: ui.nodes.panel_wz.height / 2},
                size: 20,
            });
            ui.show();
        },
    });
    G.frame[ID] = new fun('xianshizhaomu_phb.json', ID);
})();