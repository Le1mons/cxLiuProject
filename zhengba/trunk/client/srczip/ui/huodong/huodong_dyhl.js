/**
 * Created by LYF on 2019/6/24.
 */
 (function () {
    G.class.huodong_dyhl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_dylb.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            var str1=L("dygongzhonghao1");
            var str2=L("dygongzhonghao2");
            var rh = X.setRichText({
                parent:me.nodes.panel_wz_ms1,
                str:str1,
                color:"#ffffff",
                size:18,
            });
            var rh1 = X.setRichText({
                parent:me.nodes.panel_wz_ms2,
                str:str2,
                color:"#ffffff",
                size:18,
            });
            var arr=[
                {a: "attr", t: "rmbmoney", n: 600},
                {a: "item", t: "2010", n: 3},
                {a: "item", t: "2004", n: 200},
                {a: "item", t: "2007", n: 12},
                {a: "item", t: "2014", n: 5},
                {a: "item", t: "2006", n: 5},
                {a: "attr", t: "jinbi", n: 1000000},
                {a: "attr", t: "exp", n: 1000000},
            ]
            for(var i=0;i<8;i++){
                me.nodes['panel_'+(i+1)].removeAllChildren();
                var p = G.class.sitem(arr[i]);
                p.setScale(0.65)
                p.setPosition(cc.p(me.nodes['panel_'+(i+1)].width / 2, me.nodes['panel_'+(i+1)].height / 2));
                me.nodes['panel_'+(i+1)].addChild(p);
            }
            // X.alignItems(me.nodes.panel_jl, G.gc.gzhPrize, "left", {
            //     touch: true,
            //     scale: .85
            // });

            //  me.ui.finds('Text_5_0').hide();
            // // me.nodes.panel_jl.hide();
            //  me.ui.finds('Text_5').setPosition(56,206);
            //  me.ui.finds('Text_5_1').y = 60;
            //  me.ui.finds('Text_5_1_0').y = 60;
            //  me.ui.finds('Text_5_1_0_0').y = 60;
            //  me.ui.finds('Text_5_1_0_0_0').y = 60;
            //  me.ui.finds('Text_5_1_0_0_1').y = 60;
            //  me.ui.finds('Text_5_1_0').setString(L('AHCS'));

            //改成所有东西纯ui显示

        },
        onRemove: function () {
            var me = this;
        },
    })
})();