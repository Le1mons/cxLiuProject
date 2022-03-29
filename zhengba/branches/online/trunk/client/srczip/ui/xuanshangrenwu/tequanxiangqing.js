/**
 * Created by LYF on 2018/6/6.
 */

(function () {
    //悬赏特权-详情
    var ID = 'tequanxiangqing';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id);
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
            me.ui.setPositionY(335);
            me.ui.finds("img_xiantiao1").hide();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var str1 = L("MXTQ") + (G.frame.xuanshangrenwu.adventure ? L("YJH_1") : L("WJHMX"));
            var rh1 = new X.bRichText({
                size:22,
                maxWidth:me.nodes.panel_jnnr.width,
                lineHeight:34,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            rh1.text(str1);
            me.nodes.panel_jnnr2.addChild(rh1);

            var str2 = L("YXTQ") + (G.frame.xuanshangrenwu.hero ? L("YJH_1") : L("WJHYX"));
            var rh2 = new X.bRichText({
                size:22,
                maxWidth:me.nodes.panel_jnnr.width,
                lineHeight:34,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            rh2.text(str2);
            me.nodes.panel_jnnr.addChild(rh2);

            me.nodes.bg_top.height = 248;
            me.nodes.panel_jnnr2.setPositionY(135);
        },
    });

    G.frame[ID] = new fun('ui_top2.json', ID);
})();