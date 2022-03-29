/**
 * Created by LYF on 2019/4/23.
 */
(function () {
    //十字军-选择难度
    var ID = 'shizijun_difficult';

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

            me.nodes.btn_shiyong.click(function () {

                me.ajax("shizijun_difficult", [me.nandu], function (str, data) {
                    if(data.s == 1) {
                        X.cacheByUid("shizijunnandu", me.nandu);
                        G.frame.shizijunyuanzheng.getData(function () {
                            G.frame.shizijunyuanzheng.setContents();
                        });
                        G.class.ani.show({
                            json: "ani_shizijun_nanduxuanze_tiaozhan",
                            addTo: me.nodes.btn_dh,
                            autoRemove: true,
                        });
                        me.ui.setTimeout(function () {
                            me.action.playWithCallback("tiaozhan", false, function () {
                                me.remove();

                                if (data.d.prize && data.d.prize.length > 0) {
                                    G.DATA.noClick = true;
                                    G.frame.shizijunyuanzheng.sdjl = data.d.prize;
                                    G.class.ani.show({
                                        json: "ani_mijing_saodang",
                                        addTo: G.frame.shizijunyuanzheng.ui,
                                        repeat: false,
                                        autoRemove: true,
                                        onend: function () {
                                            G.frame.jiangli.data({
                                                prize: G.frame.shizijunyuanzheng.sdjl,
                                                sd: true
                                            }).show();
                                            G.DATA.noClick = false;
                                        }
                                    });
                                }

                            });
                        }, 800);

                    }
                });
            }, 2000);

            me.nodes.mask.click(function () {

                me.remove();
                G.frame.shizijunyuanzheng.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            for (var i = 1; i < 4; i ++) {
                G.class.ani.show({
                    json: "ani_shizijun_nanduxuanze_0" + i,
                    addTo: me.nodes["panel_dh" + i],
                    repeat: true,
                    autoRemove: false
                });
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var arr = [];
            var conf = G.gc.yuanzheng_conf.base.difiicult;

            for (var i in conf) {
                (function (i, data) {
                    var panel = me.nodes["panel_nd" + i];
                    X.autoInitUI(panel);
                    panel.id = i;
                    panel.children[3].setTouchEnabled(false);
                    if(P.gud.lv >= data.openlv) {
                        panel.children[2].hide();
                        panel.setTouchEnabled(true);
                    } else {
                        panel.children[2].show();
                        panel.setTouchEnabled(false);
                        panel.nodes.txt_suozi.setString(X.STR(L("X_LV_JS"), data.openlv));
                    }
                    X.alignItems(panel.children[3], data.prize, "center", {
                        touch: true,
                        scale: .8
                    });
                    arr.push(panel);
                })(i, conf[i]);
            }

            for (var i in arr) {
                var panel = arr[i];
                panel.click(function (sender) {

                    me.nandu = sender.id;

                    for (var j in arr) {
                        arr[j].children[1].hide();
                    }
                    sender.children[1].show();
                });
            }
            var nandu = X.cacheByUid("shizijunnandu");
            arr[nandu ? parseInt(nandu - 1) : 0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('yuanzheng_nandu.json', ID);
})();