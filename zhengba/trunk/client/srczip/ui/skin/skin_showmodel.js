/**
 * Created by LYF on 2019/7/16.
 */
(function () {
    //皮肤-预览
    var ID = 'skin_showmodel';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, { action: true });
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
            me.nodes.btn_fj.setVisible(G.frame.yingxiong.getSkinActiveNum(me.data()));
            me.nodes.btn_fj.click(function (sender) {
                var tidArr = me.getAllData();
                if (tidArr.length < 1) {

                    return G.tip_NB.show(L("skin_1"))
                }
                G.frame.skin_fenjie.data({
                    id: me.data(),
                    max:tidArr.length,
                    callback: function (num) {

                        G.ajax.send('skin_fenjie', [tidArr.splice(0,num)], function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize,

                                }).once("willClose", function () {
                                    me.remove();
                                }).show();
                                me.remove();

                            }
                        });

                    },
                }).show();

            })
        },
        getAllData: function () {
            var me = this;
            var data = G.DATA.skin.list;
            var arr = [];
            for (var k in data) {
                if (data[k].id == me.data() && data[k].expire == -1 && !data[k].wearer) {
                    arr.push(k)
                }
            };
            // arr.sort(function (a, b) {
            //     return data[a].wearer ? 1 : -1 - data[b].wearer ? 1 : -1;
            // })
            return arr;
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
            var conf = G.gc.skin[me.data()];

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: me.data()
            });

            me.nodes.txt_name.setString(conf.name);

            me.nodes.txt_zssx.setString(L("ZSSX") + ":" + G.frame.skin_change.showBuff(conf.buff));


            me.nodes.panel_rw.setTouchEnabled(true);
            me.nodes.panel_rw.click(function (sender) {

                G.class.hero.getSoundByHid(conf.hid[0], { sid: me.data() });
                sender.getChildren()[0].runAni(0, "atk", false);
                sender.getChildren()[0].addAni(0, "wait", true, 0);
            });

            me.ui.setTimeout(function () {
                me.nodes.panel_rw.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }, 200);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('ui_pifu_top.json', ID);
})();