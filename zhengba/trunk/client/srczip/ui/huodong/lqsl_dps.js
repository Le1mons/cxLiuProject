/**
 * Created by LYF on 2019/8/28.
 */
(function () {
    //龙骑试炼-膜拜
    var ID = 'lqsl_dps';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            me.DATA = me.data().data;
            me.key = me.data().type;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA.rank;

            me.ui.finds("txt_yl$_0").setString(X.STR(L("LQSL_MB"), data.name, X.fmtValue(data.topdps)));


            var prize = G.gc.longqishilian[me.key].dailyprize;
            var index = 0;
            for (var i = prize.length - 1; i >= 0; i --) {
                if (data.topdps >= prize[i][0]) {
                    index = i;
                    break;
                }
            }

            X.alignCenter(me.nodes.list, prize[index][1].prize, {
                touch: true
            });
        }
    });
    G.frame[ID] = new fun('longqishilian_top.json', ID);
})();