(function () {
    var ID = 'shengdanjie';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },

        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_sdlx.click(function () {
                if (me.DATA.hdinfo.rtime < G.time) {
                    return G.tip_NB.show(L("HDYJS"));
                }
                G.frame.shengdanjie_sdlx.once("close", function () {
                    me.setContents();
                }).show();
            });
            me.nodes.btn_sdjb.click(function () {
                if (me.DATA.hdinfo.rtime < G.time) {
                    return G.tip_NB.show(L("HDYJS"));
                }
                G.frame.shengdanjie_sdjb.once("close", function () {
                    me.setContents();
                }).show();
            });
            me.nodes.btn_sds.click(function () {
                if (me.DATA.hdinfo.rtime < G.time) {
                    return G.tip_NB.show(L("HDYJS"));
                }
                G.frame.shengdanjie_sds.once("close", function () {
                    me.setContents();
                }).show();
            });
            me.nodes.btn_jzhl.click(function () {
                G.frame.shengdanjie_sdhl.once("close", function () {
                    me.setContents();
                }).show();
            });
            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS109')
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.getData(function () {
                me.setContents();
            });
            G.class.ani.show({
                json: 'shengdan_xiaxue_dx',
                addTo: me.nodes.bg,
                repeat: true,
                autoRemove: false,
            });

            X.spine.show({
                json: 'spine/jiangbing_dh.json',
                addTo: me.nodes.btn_sdjb,
                cache: true,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                    node.setScale(.6);
                }
            });
            X.spine.show({
                json: 'spine/shengdanlaoren_dh.json',
                addTo: me.nodes.btn_sdlx,
                cache: true,
                y: 75,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                    node.setScale(.4);
                }
            });

            X.cacheByDay(P.gud.uid, "sdj_tree", {});
        },
        setContents: function () {
            var me = this;
            var etime = G.time > me.DATA.hdinfo.rtime ? me.DATA.hdinfo.etime : me.DATA.hdinfo.rtime;
            X.timeout(me.nodes.txt_sj2, etime, function () {
                if (G.time >= me.DATA.hdinfo.etime) {
                    me.remove();
                } else {
                    me.setContents();
                }
            }, function (str, seconds) {
                var seconds_day = 60 * 60 * 24;
                if (seconds >= seconds_day) {
                    var day = Math.floor(seconds / seconds_day);
                    me.nodes.txt_sj2.setString(X.STR(L('shengdanjie_txt12'), day, X.timeLeft(seconds - seconds_day * day, 'h:mm:s')));
                } else {
                    me.nodes.txt_sj2.setString(str);
                }
            });
            me.setBaseInfo();
            me.checkRedPos();
            if (G.time > me.DATA.hdinfo.rtime) {
                me.nodes.txt_sj1.setString(L("shengdanjie_txt16"));
            };
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || { a: 'attr', t: 'jinbi' };
            var attr2 = me.need2 = obj.need2 || { a: 'attr', t: 'rmbmoney' };

            me.nodes.panel_up.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_up.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb: X.fmtValue(G.class.getOwnNum(attr1.t, attr1.a)),
                txt_zs: X.fmtValue(G.class.getOwnNum(attr2.t, attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.once("hide", function () {
                                me.setContents();
                            }).show();
                        }

                    });
                },
                btn_jia2: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.once("hide", function () {
                                me.setContents();
                            }).show();
                        }
                    })
                }
            }, me.nodes);
        },
        checkRedPoint: function (callback) {
            var me = this;
            var data = G.DATA.hongdian.christmas;
            if (!data) return;
            if (data.tree && G.time <= me.DATA.hdinfo.rtime) {
                G.setNewIcoImg(me.nodes.btn_sds);
                me.nodes.btn_sds.finds('redPoint').setPosition(175, 270);
            } else {
                G.removeNewIco(me.nodes.btn_sds);
            };
            if (data.duihuan && !X.cacheByDay(P.gud.uid, "sdj_duihuan")) {
                G.setNewIcoImg(me.nodes.btn_jzhl);
                me.nodes.btn_jzhl.finds('redPoint').setPosition(200, 150);
            } else {
                G.removeNewIco(me.nodes.btn_jzhl);
            };
            if (data.game && !X.cacheByDay(P.gud.uid, "sdj_game") && G.time <= me.DATA.hdinfo.rtime) {
                G.setNewIcoImg(me.nodes.btn_sdjb);
                me.nodes.btn_sdjb.finds('redPoint').setPosition(190, 30);
            } else {
                G.removeNewIco(me.nodes.btn_sdjb);
            };
            if (!X.cacheByDay(P.gud.uid, "sdj_task") && G.time <= me.DATA.hdinfo.rtime) {
                G.setNewIcoImg(me.nodes.btn_sdlx);
                me.nodes.btn_sdlx.finds('redPoint').setPosition(200, 50);
            } else {
                G.removeNewIco(me.nodes.btn_sdlx);
            };
        },
        checkRedPos: function () {
            var me = this;
            // G.removeNewIco(me[key]);
            G.hongdian.getData(['christmas'], 1, function () {
                me.checkRedPoint();
            }, true);
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send("christmas_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        }
    });
    G.frame[ID] = new fun('shengdanjie.json', ID);
})();