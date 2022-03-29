/**
 * Created by LYF on 2019/7/16.
 */
(function () {
    //皮肤-里程碑属性
    var ID = 'skin_buffinfo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);

            me.nodes.listview.setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;
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

            me.getAllBuffInfo();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        getAllBuffInfo: function () {
            var me = this;
            var curLv = G.frame.yingxiong.getSkinActiveNum();

            me.buff = {};
            
            for (var i in G.gc.skincom.base.landmark) {

                if (curLv >= i * 1) {
                    var buff = G.gc.skincom.base.landmark[i];

                    for (var key in buff) {

                        if (me.buff[key]) me.buff[key] += buff[key];
                        else me.buff[key] = buff[key];
                    }
                }
            }
        },
        setContents: function () {
            var me = this;
            var buffKeys = G.gc.skincom.base.bufflist;

            for (var i = 0; i < buffKeys.length; i ++) {

                me.nodes.listview.pushBackCustomItem(me.setItem(me.nodes.list.clone(), buffKeys[i]));
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                txt_sx: L(data),
                txt_sz: "+" + me.getBuffValue(data)
            }, ui.nodes);

            return ui;
        },
        getBuffValue: function (key) {
            var me = this;
            var value = me.buff[key] || 0;

            return key.indexOf("pro") != -1 ? value / 10 + "%" : value;
        }
    });
    G.frame[ID] = new fun('ui_top_pifu.json', ID);
})();