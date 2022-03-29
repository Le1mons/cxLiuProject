/**
 * Created by LYF on 2018/10/9.
 */
(function () {
    //次日登陆
    var ID = 'ciridenglu';

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
        },
        getPrize: function(type) {
            var me = this;

            me.ajax("giverarepet_getprize", [type], function (str, data) {
                if(data.s == 1) {
                    G.frame.jiangli.once("hide", function () {
                        if(me.DATA.gotarr.length == 3) {
                            me.remove();
                        } else {
                            me.getData(function () {
                                me.setContents();
                            });
                        }
                    }).data({
                        prize: data.d.prize
                    }).show();
                }
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.conf = G.class.getConf("ciridenglu");
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;
            G.ajax.send("giverarepet_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            me.setContents();

            X.setHeroModel({
                parent: me.nodes.panel_dh,
                data: {hid: G.class.getConf("ciridenglu")[4].hid},
                scaleNum: 1.25
            });

            G.class.ani.show({
                json: "ani_yingxiongzhaomu",
                addTo: me.nodes.panel_dh,
                x: 103,
                y: 90,
                repeat: true,
                autoRemove: false
            });

            me.nodes.txt_hd.hide();
            me.nodes.txt_djs.hide();
            // X.timeout(me.nodes.txt_djs, me.DATA.time, function () {
            //     me.remove();
            // });

            cc.callLater(function () {
                G.guidevent.emit("crdlShowOver");
            });

            if (G.gc.ifChangeModels()) {
                me.nodes.img_tx3.finds("Image_9").loadTexture("img/yingxiongzhaomu/img_xlsstx1.png", 1);
            }
        },
        onHide: function () {
            var me = this;
            G.view.mainView.getAysncBtnsData();
            G.hongdian.getData("herorecruit", 1);
        },
        setContents: function () {
            var me = this;
            var idx = 1;
            var str = {
                1: "",
                2: "",
                3: ""
            };

            function f(type) {
                var text = me.nodes["txt_wz" + type];
                var klq = X.inArray(me.DATA.can, type);
                var ylq = X.inArray(me.DATA.gotarr, type);
                var panel = me.nodes["panel_tx" + type];
                if(panel) panel.setTouchEnabled(false);
                switch (type) {
                    case 1:
                        text.setString(X.STR(L("TGGQ"), P.gud.maxmapid - 1, me.conf[type].pval));
                        text.setTextColor(cc.color("#ff5353"));
                        X.enableOutline(text, "#26201f", 2);
                        break;
                    case 2:
                        text.setString(L("XYWJCRDL"));
                        text.setTextColor(cc.color("#ff5353"));
                        X.enableOutline(text, "#26201f", 2);
                        break;
                    case 3:
                        text.setString(L("JHZZYK"));
                        text.setTextColor(cc.color("#ff5353"));
                        X.enableOutline(text, "#26201f", 2);
                        break;
                    case 4:
                        if(klq) {
                            me.nodes.btn_lqan.show();
                        } else {
                            me.nodes.btn_lqan.hide();
                        }
                        if(ylq) {
                            me.nodes.btn_lqan.hide();
                            me.nodes.btn_lqan.setTouchEnabled(false);
                            me.nodes.btn_lqan.loadTextureNormal("img/yingxiongzhaomu/btn_shouchong_ylq.png", 1);
                        } else {
                            me.nodes.btn_lqan.setTouchEnabled(true);
                            me.nodes.btn_lqan.click(function () {
                                me.getPrize(4);
                            })
                        }
                        break;
                }
            }

            while (idx < 5) {
                f(idx);
                idx ++;
            }

            for (var index = 1; index < 4; index ++) {
                (function (i) {
                    var btn = me.nodes["btn_lq" + i];
                    var wz = me.nodes["txt_wz" + i];
                    var btnTxt = btn.children[0];
                    if(X.inArray(me.DATA.gotarr, i)) {
                        wz.setTextColor(cc.color("#4af72e"));
                        wz.setString(L("YLQ"));
                        X.enableOutline(wz, "#26201f", 2);
                        btn.hide();
                    } else {
                        if(i != 2) btn.show();
                        if(X.inArray(me.DATA.can, i)) {
                            wz.setString(L("YDC"));
                            X.enableOutline(wz, "#26201f", 2);
                            wz.setTextColor(cc.color("#4af72e"));
                            btn.show();
                            btn.click(function () {
                                me.getPrize(i);
                            });
                            btn.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                            btnTxt.setString(L("LQ"));
                            btnTxt.setTextColor(cc.color(G.gc.COLOR.n13));
                        } else {
                            btnTxt.setTextColor(cc.color(G.gc.COLOR.n12));
                            btnTxt.setString(L("CIDLTXT_" + i));
                            btn.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                            btn.click(function () {
                                if(i == 3) {
                                    G.frame.huodong.once("hide", function () {
                                        me.getData(function () {
                                            me.setContents();
                                        });
                                    }).data({
                                        type: 0,
                                        stype: 3
                                    }).show();
                                } else if(i == 1) {
                                    G.frame.tanxian.show();
                                } else {
                                    G.tip_NB.show(L("CIDLTS_" + i));
                                }
                            });
                        }
                    }
                })(index)
            }
        },
    });
    G.frame[ID] = new fun('yingxiongzhaomu.json', ID);
})();