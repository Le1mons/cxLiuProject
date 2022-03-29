/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //药水详情
    var ID = 'damijing_ysxq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f6";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
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
            me.nodes.panel_top.y -= 70;
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var num = G.frame.damijing.DATA.mixture && G.frame.damijing.DATA.mixture[me.DATA] || 0;
            var conf = G.class.watchercom.getMixtureBuyId(me.DATA - 1);
            var layIco = me.nodes.panel_jn;
            var txtName = me.nodes.txt_jn_name;
            var txtIntr = me.nodes.panel_jnnr;
            var txt_h = txtIntr.height;
            var keys = X.keysOfObject(conf.buff);

            layIco.setBackGroundImage("img/mijing/bg_wp4.png", 1);
            txtName.setString(conf.name + "(" + num + "/" + conf.limit + ")");

            var img = new ccui.ImageView('img/mijing/ico_ysda' + me.DATA + '.png', 1);
            img.setAnchorPoint(0.5, 0.5);
            img.setPosition(layIco.width / 2, layIco.height / 2);
            layIco.addChild(img);

            var str = X.STR((conf.show), num * conf.buff[keys[0]] / 10);
            var rt = new X.bRichText({
                size: 20,
                lineHeight: 20,
                color: G.gc.COLOR.n5,
                maxWidth: txtIntr.width,
                family: G.defaultFNT,
            });
            rt.text(str);
            rt.setAnchorPoint(0, 1);
            rt.setPosition( cc.p(0, txtIntr.height) );
            txtIntr.removeAllChildren();
            txtIntr.addChild(rt);


            var extHeight = rt.trueHeight() - txt_h > 0 ? rt.trueHeight() - txt_h : 0;
            me.nodes.panel_top.height += extHeight;

            ccui.helper.doLayout(me.nodes.panel_top);
        },
    });

    G.frame[ID] = new fun('ui_top2.json', ID);
})();