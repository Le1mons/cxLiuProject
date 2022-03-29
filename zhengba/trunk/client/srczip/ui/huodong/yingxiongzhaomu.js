/**
 * Created by
 */
(function () {
    //
    var ID = 'yingxiongzhaomu';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ['yingxiongzhaomu.png', 'yingxiongzhaomu.plist'];
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_ck.click(function () {
                G.frame.yingxiong_xxxx.data({
                    tid:G.class.getConf("ciridenglu")[4].hid,
                    list:[G.class.getConf("ciridenglu")[4].hid],
                    frame:'yingxiong_tujian',
                }).show();
            });

            me.nodes.btn_lq.click(function () {
                me.getPrize(4);
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
            me.initUi();
            me.bindBtn();
            me.conf = G.class.getConf("ciridenglu");
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
        onHide: function () {
            var me = this;
            G.view.mainView.getAysncBtnsData();
            G.hongdian.getData("herorecruit", 1);
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        onShow: function () {
            var me = this;
            var conf = G.class.getConf("ciridenglu");

            X.setHeroModel({
                parent: me.nodes.panel_dh,
                data: {hid: conf[4].hid},
                scaleNum: 1.25
            });

            me.nodes.txt_hd.hide();
            me.nodes.txt_djs.hide();

            cc.callLater(function () {
                G.guidevent.emit("crdlShowOver");
            });

            me.list = {};
            for (var key = 1; key < 4; key ++) {
                (function (key) {
                    var list = me.list[key] = me.nodes.list.clone();
                    var parent = me.nodes['panel_' + key];
                    list.conf = conf[key];
                    list.show();
                    list.setPosition(parent.width / 2, parent.height / 2);
                    parent.addChild(list);
                    X.autoInitUI(list);
                    X.render({
                        img_tx1: function (node) {
                            var img = '';
                            if (key == 1) img = 'img/yingxiongzhaomu/img_zstx.png';
                            else if (key == 2) img = 'img/yingxiongzhaomu/img_hbfstx.png';
                            else {
                                if (G.gc.ifChangeModels()) {
                                    img = "img/yingxiongzhaomu/img_xlsstx1.png";
                                } else {
                                    img = "img/yingxiongzhaomu/img_xlsstx.png";
                                }
                            }
                            node.loadTexture(img, 1);
                        }
                    }, list.nodes);
                })(key);

            }

            me.setContents();
        },
        setContents: function () {
            var me = this;

            cc.each(me.list, function (list, key) {
                var can = X.inArray(me.DATA.can, key);
                var rec = X.inArray(me.DATA.gotarr, key);
                X.render({
                    txt_btn: function (node) {
                        node.setTextColor(cc.color("#804326"));
                        var str = '';
                        var color;
                        if (!can) {
                            if (key == 1) {
                                str = X.STR(L("TGGQ"), list.conf.pval);
                            } else if (key == 3) {
                                str = L("JHZZYK");
                            }
                        } else {
                            str = L("KLQ");
                            node.setTextColor(cc.color('#ffffff'));
                            X.enableOutline(node, '#26201f', 2);
                        }

                        node.setString(str);
                    },
                    btn_anniu1: function (node) {
                        node.setVisible((!rec && !can && key != 2) || can);
                        node.loadTextureNormal(can ? 'img/yingxiongzhaomu2/btn_yxzm.png' : 'img/yingxiongzhaomu2/btn_yxzm2.png', 1);
                        node.click(function () {
                            if (can) {
                                return list.triggerTouch(ccui.Widget.TOUCH_ENDED);
                            }
                            if (key == 1) {
                                G.frame.tanxian.show();
                            } else if (key == 3) {
                                G.frame.huodong.once("hide", function () {
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                }).data({
                                    type: 0,
                                    stype: 3
                                }).show();
                            }
                        });
                    },
                    panel_crdl: function (node) {
                        node.setVisible(rec || (key == 2 && !can));
                    },
                    txt_wz2: function (node) {
                        var str = '';
                        var color = '#ffffff';
                        var outline = '#26201F';
                        if (rec) {
                            str = L("YLQ");
                        } else if (can) {
                            str = L("KLQ");
                            color = '#e9e115';
                        } else if (key == 2) {
                            str = L("XYWJCRDL");
                        }
                        node.setString(str);
                        node.setTextColor(cc.color(color));
                        X.enableOutline(node, outline, 2);
                    }
                }, list.nodes);

                list.setTouchEnabled(can);
                list.click(function () {
                    me.getPrize(Number(key));
                });
            });

            me.nodes.btn_lq.setEnableState(X.inArray(me.DATA.can, '4'));
        },
    });
    G.frame[ID] = new fun('yingxiongzhaomu2.json', ID);
})();