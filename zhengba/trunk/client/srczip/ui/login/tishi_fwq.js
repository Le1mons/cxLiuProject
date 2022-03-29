/**
 * Created by ys on 2018/8/16.
 */
(function () {
    //帮助界面
    var ID = 'tishi_fwq';

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
            var txtIntr = me.nodes.panel_nr;
            // var txt_h = txtIntr.height;

            me.nodes.panel_top.setPositionY(cc.director.getWinSize().height/2);

            layName.removeAllChildren();
            var strName = data.title || L('BZ');

            var rhName = new X.bRichText({
                size:24,
                maxWidth:layName.width,
                lineHeight:32,
                color:'#ffe386',
                family:G.defaultFNT,
            });
            rhName.text(strName);
            rhName.setPosition(cc.p(layName.width / 2 - rhName.trueWidth() / 2,layName.height / 2 - rhName.trueHeight() / 2));
            layName.addChild(rhName);

            var rt = new X.bRichText({
                size: 20,
                lineHeight: 24,
                color: '#fff8e1',
                maxWidth: txtIntr.width,
                family: G.defaultFNT,
            });
            rt.text(data.intr);
            rt.setAnchorPoint(0,1);
            rt.setPositionY(txtIntr.height - 15);
            txtIntr.addChild(rt);
        },
    });

    G.frame[ID] = new fun('tishi_fwq.json', ID);
})();