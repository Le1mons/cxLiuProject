/**
 * Created by on 2020-xx-xx.
 */
(function () {
    //
    var ID = 'wztt_zdrz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.text_zdjl.setString(L("TTZB"));
        },
        show: function () {
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        getData: function (callback) {
            var me = this;

            connectApi("ladder_log", [], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        onShow: function () {
            var me = this;

            new X.bView("wztt_zdjl.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.setTable();
                cc.enableScrollBar(view.nodes.scrollview);
            });

            new X.bView('ui_top3.json', function(view) {
                // me.ui.removeAllChildren();
                me.fenxiang = view;
                me.fenxiang.hide();
                me.ui.addChild(view);
                me.setFenXiang(view);
            }, {action: true});
        },
        setTable: function () {
            var me = this;

            if (me.DATA.length < 1) return me.view.nodes.img_zwnr.show();

            var table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_lb, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 10, 10);
            table.setData(me.DATA);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            var isWin = false;
            if (data.mode == 1 && data.num >= 1) isWin = true;
            if (data.mode == 3 && data.num >= 2) isWin = true;
            X.autoInitUI(ui);
            X.render({
                text_mz: data.headdata.name || "",
                text_qufu: data.svrname || P.gud.ext_servername,
                 text_zl: X.fmtValue(data.zhanli || 0),
                text_sj: X.moment(data.ctime - G.time),
                text_moshi: function (node){
                    node.setString(data.mode == 1 ? L("DD") : L("SD"));
                    node.hide();
                },
                moshi: function (node) {
                    node.loadTexture("img/wztt/duiwu" + (data.mode == 1 ? 1 : 2) + ".png", 1);
                },
                panel_tx: function (node) {
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(head);
                },
                img_sl: function (node) {
                    node.setVisible(isWin);
                },
                img_sb: function (node) {
                    node.setVisible(!isWin);
                },
                btn_hf: function (node) {
                    node.click(function () {
                        me.ajax("ladder_watch", [data._id], function (str, data) {
                            if (data.s == 1) {
                                var fight = data.d.data;
                                if (fight.length == 1) {
                                    fight[0].pvType = "wztt_one";
                                    G.frame.fight.demo(fight[0]);
                                } else {
                                    data.d.fightres = data.d.data;
                                    G.frame.fight.data({
                                        pvType: 'wztt_three',
                                        session: 0,
                                        fightlength: fight.length,
                                        fightData:data.d,
                                        callback: function(session) {
                                            G.frame.fight.demo(fight[session]);
                                        }
                                    }).demo(fight[0]);
                                }
                            }
                        });
                    });
                },
                btn_fx: function (node) {
                    node.click(function () {
                        me.__data = data;
                        me.fenxiang.show();
                        me.fenxiang.action.play("in", false);
                    });
                },
                text_hf:L('HUIFANG')
            }, ui.nodes);
        },
        setFenXiang: function(ui) {
            var me = this;
            var panel = ui;
            var btns = [];
            X.autoInitUI(panel);

            panel.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    panel.hide();
                }
            });

            var richText = new X.bRichText({
                size: 24,
                maxWidth: panel.nodes.txt_nr.width,
                lineHeight: 24,
                color: '#F6EBCD',
                family: G.defaultFNT,
            });
            richText.text(L('XZFXPD'));
            richText.setPosition(154, 60);
            panel.nodes.txt_nr.addChild(richText);
            var conf = {
                0: '世界',
                1: '跨服',
                2: '公会'
            };
            var callFunc = {
                0: function () {
                    // var send = ['1',2,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                    //     G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    // G.frame.chat.sendChat(send,function(){
                    //     G.tip_NB.show(L('FSCG'));
                    //     panel.hide();
                    // });
                    me.ajax("ladder_share", [me.__data._id, 2], function (str, data) {
                        if (data.s == 1) {
                            G.tip_NB.show(L('FSCG'));
                            panel.hide();
                        }
                    });
                },
                1: function () {
                    // var send = ['徐',4,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                    //     G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    // G.frame.chat.sendChat(send,function(){
                    //     G.tip_NB.show(L('FSCG'));
                    //     panel.hide();
                    // });
                    me.ajax("ladder_share", [me.__data._id, 4], function (str, data) {
                        if (data.s == 1) {
                            G.tip_NB.show(L('FSCG'));
                            panel.hide();
                        }
                    });
                },
                2: function () {
                    // var send = ['1',3,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                    //     G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    // G.frame.chat.sendChat(send,function(){
                    //     G.tip_NB.show(L('FSCG'));
                    //     panel.hide();
                    // });
                    me.ajax("ladder_share", [me.__data._id, 3], function (str, data) {
                        if (data.s == 1) {
                            G.tip_NB.show(L('FSCG'));
                            panel.hide();
                        }
                    });
                }
            };
            var arr = G.DATA.closeKf ? [0, 2] : [0, 1, 2];
            for (var i in arr) {
                (function (id) {
                    var btn = new ccui.Button();
                    btn.loadTextureNormal('img/public/btn/btn2_on.png', 1);
                    btn.setTitleText(conf[id]);
                    btn.setTitleFontName(G.defaultFNT);
                    btn.setTitleFontSize(24);
                    btn.setTitleColor(cc.color('#7b531a'));
                    btn.click(function () {
                        callFunc[id]();
                    });
                    btns.push(btn);
                })(arr[i]);
            }
            X.center(btns, panel.nodes.panel_top, {
                noRemove: true,
                callback: function (node) {
                    node.y = 68;
                }
            });
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();