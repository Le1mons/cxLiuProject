/**
 * Created by wfq on 2018/6/20.
 */
(function () {
    //帮助界面
    var ID = 'help';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f6";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            cc.sys.isObjectValid(me.nodes.mask) && me.nodes.mask.touch(function (sender, type) {
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
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            // me.nodes.mask.setBackGroundColorOpacity(255 * 0.7);
            var data = me.DATA;
            var layName = me.nodes.panel_bt;
            var txtIntr = me.nodes.listview_1;
            me.nodes.scrollview_.hide();
            cc.enableScrollBar(txtIntr);
            // var txt_h = txtIntr.height;

            layName.removeAllChildren();
            var strName = data.title || L('BZ');

            var rhName = new X.bRichText({
                size:24,
                maxWidth:layName.width,
                lineHeight:32,
                color:"#FFE8C0",
                family:G.defaultFNT,
            });
            rhName.text(strName);
            rhName.setPosition(cc.p(layName.width / 2 - rhName.trueWidth() / 2,layName.height / 2 - rhName.trueHeight() / 2));
            layName.addChild(rhName);

            var rt = new X.bRichText({
                size: 20,
                lineHeight: 24,
                color: G.gc.COLOR.n5,
                maxWidth: txtIntr.width,
                family: G.defaultFNT,
            });
            rt.text(data.intr);
            txtIntr.pushBackCustomItem(rt);
        },
    });

    G.frame[ID] = new fun('ui_top5.json', ID);
})();