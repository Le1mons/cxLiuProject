/**
 * Created by LYF on 2019/6/25.
 */
(function () {
    //确定获得
    var ID = 'quedinghuode';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_qx.click(function () {

                me.remove();
            });

            me.nodes.btn.click(function () {

                me.ajax('item_use',[me.data().itemid, 1, me.data().index],function(str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: [].concat(data.d.prize),
                        }).show();
                        me.remove();
                        G.frame.usebox.remove();
                        G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                    }
                },true);
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            var item = G.class.sitem(me.data().itemData);
            item.setPosition(me.nodes.panel_wp.width / 2, me.nodes.panel_wp.height / 2);
            me.nodes.panel_wp.addChild(item);
            G.frame.iteminfo.showItemInfo(item);

            setTextWithColor(me.nodes.txt_yl, item.conf.name, G.gc.COLOR[item.conf.color]);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_top_hdqr.json', ID);
})();