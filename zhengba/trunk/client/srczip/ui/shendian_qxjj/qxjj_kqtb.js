/**
 * Created by LYF on 2019/1/15.
 */
(function () {
    //开启团本
    var ID = 'qxjj_kqtb';

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

            me.ui.finds("mask_rz").click(function () {

                me.remove();
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

            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setItemsMargin(15);
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var conf = G.class.qyjj.get().group;
            var keys = X.keysOfObject(conf);

            for (var i in keys) {
                (function (idx, conf) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    X.enableOutline(list.nodes.shijian, "#32302d", 2);
                    X.enableOutline(list.nodes.vip, "#512000", 2);
                    X.enableOutline(list.nodes.nr, G.frame.shendian_qxjj.extConf.outline[idx], 2);

                    list.nodes.vip.setTextColor(cc.color("#ffd800"));

                    list.nodes.vip.setString(X.STR(L("VIPKT"), conf.vip_limit, conf.num_limit));
                    list.nodes.img_bg.loadTexture(G.frame.shendian_qxjj.extConf.bg[idx], 1);
                    list.nodes.shijian.setString(conf.need[0].n);
                    list.nodes.nr.setString(conf.content);

                    list.nodes.but_jc.click(function () {
                        if(P.gud.vip < conf.vip_limit) {
                            return G.tip_NB.show("VIP" + L("DJBZ"));
                        }
                        if(P.gud.rmbmoney < conf.need[0].n) {
                            return G.tip_NB.show(L("ZSBZ"));
                        }
                        G.frame.alert.data({
                            cancelCall: null,
                            okCall: function () {
                                me.ajax("qyjj_open", [idx], function (str, data) {
                                    if(data.s == 1) {
                                        if(data.d.prize) {
                                            G.frame.qxjj_main.once("show", function () {
                                                G.frame.jiangli.data({
                                                    prize: data.d.prize
                                                }).show();
                                                me.remove();
                                            });
                                            G.frame.shendian_qxjj.checkShow();
                                        }
                                    }
                                });
                            },
                            richText: L("SFKQTB") + '"' + conf.name + '"',
                            sizeType: 3
                        }).show();
                    });
                    list.nodes.btn_jlyl.click(function () {
                        G.frame.qxjj_jlyl.data(idx).show();
                    });
                    list.show();
                    me.nodes.listview.pushBackCustomItem(list);
                })(keys[i], conf[keys[i]]);
            }
        }
    });

    G.frame[ID] = new fun('shendianzhilu_kqtb.json', ID);
})();