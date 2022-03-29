/**
 * Created by lsm on 2018/7/4.
 */
(function() {
    //充值-特权详情
    var ID = 'chongzhi_tqinfo';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function() {
            var me = this;
        },
        bindBtn: function() {
            var me = this;

            me.ui.finds('panel_1').touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;

            new X.bView('zhuangbei_tip1.json', function(view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                view.setTouchEnabled(true);
            });
        },
        onHide: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;
            me.tqid = me.data().id;
            me.conf = G.class.chongzhihd.getTequan();
            me.setTop();
        },
        setTop: function() {
            var me = this;

            var panel = me._view;
            var conf = me.conf[me.tqid];
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtType = panel.nodes.text_2;
            var txt1 = panel.nodes.text_1;
            var tq = G.class.sitem();
            tq.num.setVisible(false);
            tq.icon.setScale(1.5);
            tq.icon.loadTextureNormal('img/sale/img_sale_privilege' + me.tqid + '.png', 1);
            tq.setTouchEnabled(false);
            tq.setTouchEnabled(true);
            tq.background.loadTexture('img/public/ico/ico_bg' + 3 + '.png', 1);
            tq.setAnchorPoint(0, 0);
            layIco.addChild(tq);
            txtType.setString(L('tq'));
            setTextWithColor(txt1, conf.name, G.gc.COLOR[3]);
            var rt = new X.bRichText({
                size: 20,
                maxWidth: panel.nodes.panel_2.width,
                lineHeight: 30,
                color: '#f6ebcd',
                family: G.defaultFNT
            });
            rt.text(conf.intr);
            var offsetY = rt.trueHeight() + 60;
            panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY) );
            ccui.helper.doLayout(panel.nodes.panel_bg);
            rt.setPosition(cc.p(0,0));
            layBuff.addChild(rt);
            // panel.nodes.panel_2.addChild(rt);
        },
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();