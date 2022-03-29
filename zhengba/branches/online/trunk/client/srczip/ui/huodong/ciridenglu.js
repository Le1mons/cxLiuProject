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
                    G.frame.jiangli.data({
                        prize: data.d.prize
                    }).show();
                    me.getData(function () {
                        me.setContents();
                    })
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

            for (var i = 1; i < 4; i ++) {
                var lay = me.nodes["img_tx" + i];
                lay.children[0].setBackGroundImage("ico/heroicon/" + G.class.fmtItemICON(me.conf[i].hid) + ".png");
            }

            X.timeout(me.nodes.txt_djs, me.DATA.time, function () {
                me.remove();
            })
        },
        onHide: function () {
            var me = this;
            G.view.mainView.getAysncBtnsData();
            G.hongdian.getData("herorecruit", 1);
        },
        setContents: function () {
            var me = this;
            var idx = 1;

            function f(type) {
                var text = me.nodes["img_wzdi" + type];
                var klq = X.inArray(me.DATA.can, type);
                var ylq = X.inArray(me.DATA.gotarr, type);
                var panel = me.nodes["panel_tx" + type];
                if(panel) panel.setTouchEnabled(false);
                switch (type) {
                    case 1:
                        text.children[0].setString(X.STR(L("TGGQ"), P.gud.maxmapid - 1, me.conf[type].pval));

                        if(klq) {
                            me.nodes.btn_jllq2.show();
                        } else {
                            me.nodes.btn_jllq2.hide();
                        }
                        if(ylq) {
                            me.nodes.btn_jllq2.hide();
                        } else {
                            me.nodes.btn_jllq2.click(function () {
                                me.getPrize(1);
                            });
                            panel.setTouchEnabled(true);
                            panel.click(function () {
                                me.getPrize(1);
                            });

                        }
                        break;
                    case 2:
                        text.children[0].setString(L("XYWJCRDL"));
                        if(klq) {
                            me.nodes.btn_jllq1.show();
                        } else {
                            me.nodes.btn_jllq1.hide();
                        }
                        if(ylq) {
                            me.nodes.btn_jllq1.hide();
                        } else {
                            me.nodes.btn_jllq1.click(function () {
                                me.getPrize(2);
                            });
                            panel.setTouchEnabled(true);
                            panel.click(function () {
                                me.getPrize(2);
                            });
                        }
                        break;
                    case 3:
                        text.children[0].setString(L("JHZZYK"));
                        if(klq) {
                            me.nodes.btn_jhyueka.show();
                            me.nodes.btn_jhyueka.loadTextureNormal("img/yingxiongzhaomu/yxzm_txt_lq.png", 1);
                            me.nodes.btn_jhyueka.click(function () {
                                me.getPrize(3);
                            });
                            panel.setTouchEnabled(true);
                            panel.click(function () {
                                me.getPrize(3);
                            });
                        } else {
                            me.nodes.btn_jhyueka.show();
                            me.nodes.btn_jhyueka.click(function () {
                                G.frame.huodong.once("hide", function () {
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                }).data({
                                    type: 0,
                                    idx: 2
                                }).show();
                            });
                            panel.setTouchEnabled(true);
                            panel.click(function () {
                                G.frame.huodong.once("hide", function () {
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                }).data({
                                    type: 0,
                                    idx: 2
                                }).show();
                            })
                        }
                        if(ylq) {
                            me.nodes.btn_jhyueka.hide();
                        }
                        break;
                    case 4:
                        if(klq) {
                            me.nodes.btn_lqan.show();
                        } else {
                            me.nodes.btn_lqan.hide();
                        }
                        if(ylq) {
                            me.nodes.btn_lqan.show();
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

            for (var i = 1; i < 4; i ++) {
                var ylq = me.nodes["img_ylq" + i];
                var wz = me.nodes["img_wzdi" + i];

                if(X.inArray(me.DATA.gotarr, i)) {
                    ylq.show();
                    wz.children[0].setTextColor(cc.color("#47da46"));
                    wz.children[0].setString(L("YDC"));
                } else {
                    ylq.hide();
                    wz.children[0].setTextColor(cc.color("#aebbff"));
                }
            }
        },
    });
    G.frame[ID] = new fun('yingxiongzhaomu.json', ID);
})();