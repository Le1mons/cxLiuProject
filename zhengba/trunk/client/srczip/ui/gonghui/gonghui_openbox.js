/**
 * Created by LYF on 2018/10/19.
 */
(function () {
    //公会-开宝箱
    var ID = 'gonghui_openbox';

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


            function open_bx(){
                if (me.DATA.state == "can") {
                    me.ajax("gonghui_recboxprize", [me.DATA._id], function(str, data) {
                        if (data.s == 1) {
                            G.frame.gonghui_box.getData(function() {
                                G.frame.gonghui_box.setBottom();
                                me.DATA.state = "get";
                                me.setButton();
                                var info = G.frame.gonghui_box.DATA.boxdata;
                                for (var i = 0; i < info.length; i++) {
                                    var dd = info[i];
                                    if (me.DATA._id == dd._id) {
                                        G.frame.gonghui_getinfo.data(dd).show();
                                        break;
                                    }
                                }
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.frame.gonghui_openbox.remove();
                                G.hongdian.getData("gonghui", 1, function() {
                                    G.frame.gonghui_main.checkRedPoint();
                                });
                            });
                        } else {
                            G.frame.gonghui_box.getData(function() {
                                G.frame.gonghui_box.setBottom();
                                me.DATA.state = "all";
                                me.setButton();
                            })
                        }
                    });
                } else {
                    var info = G.frame.gonghui_box.DATA.boxdata;
                    for (var i = 0; i < info.length; i++) {
                        var dd = info[i];
                        if (me.DATA._id == dd._id) {
                            G.frame.gonghui_getinfo.data(dd).show();
                            break;
                        }
                    }
                }
            }

            me.ui.finds("btn_bx").click(function () {
                open_bx();
            })

            me.ui.finds("img_bx").setTouchEnabled(true);
            me.ui.finds("img_bx").click(function () {
                open_bx();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
            me.setButton();
            // G.class.ani.show({
            //     json: 'spine/' + 'xiangzi' + '.json',
            //     addTo: me.ui.finds("img_bx"),
            //     x: me.ui.finds("img_bx").width / 2,
            //     y: me.ui.finds("img_bx").height / 2,
            //     z: 0,
            //     autoRemove: false,
            //     onload: function (node) {
            //         node.stopAllAni();
            //         node.setTimeScale(1);
            //         node.opacity = 255;
            //         node.runAni(0, me.DATA.state == "can" ? "baoxiang_daiji" : "baoxiang_")
            //     }
            // })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var tx = me.ui.finds("ico_tx");

            var head = G.class.shead(me.DATA.buyer);
            head.setPosition(tx.width / 2, tx.height / 2);
            tx.addChild(head);

            me.ui.finds("nema").setString(me.DATA.buyer.name);
        },
        setButton: function () {
            var me = this;
            var btn = me.ui.finds("btn_bx");

            if(me.DATA.state == "can") {
                btn.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                me.nodes.txt_wz.setString(L("DK"));
                me.nodes.txt_wz.setTextColor(cc.color("#2f5719"));
                me.ui.finds("img_bx").setBackGroundImage("img/gonghui/ico_gonghui_bx3.png", 1);
            }else {
                btn.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                me.nodes.txt_wz.setString(L("CKLQXQ"));
                me.nodes.txt_wz.setTextColor(cc.color("#7b531a"));
                me.nodes.bg_hei.show();
                me.ui.finds("img_bx").setBackGroundImage("img/gonghui/ico_gonghui_bx2.png", 1);
                if(me.DATA.state !== "get") {
                    me.nodes.yqw.show();
                }
            }
        }
    });
    G.frame[ID] = new fun('gonghui_baoxiang.json', ID);
})();