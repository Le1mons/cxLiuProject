/**
 * Created by  on 2019/4/2.
 */
(function () {
    //风暴战场-结算
    var ID = 'fbzc_js';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn1_on.click(function () {

                G.frame.jiangli.once("hide", function () {
                    me.remove();
                }).data({
                    prize: me.DATA.prize
                }).show();
            });

            // me.nodes.mask.click(function () {
            //
            //     me.remove();
            // });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var log = me.DATA.log;

            for (var i = 0; i < log.length; i ++) {
                var lay = me.nodes["l" + (i + 1)];
                var con = log[i];
                X.setRichText({
                    str: X.STR(L("YSJS"), con.area, L("YS_" + con.color), X.timeLeft(con.time)),
                    parent: lay,
                    anchor: {x: 0, y: 0.5},
                    pos: {x: 0, y: lay.height / 2},
                    color: "#d9ccb1",
                    size: 20
                });
            }

            X.alignItems(me.nodes.neirong_ico, me.DATA.prize, "center", {
                touch: true
            });
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang_yaosaijiangli.json', ID);
})();