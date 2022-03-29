/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-主界面
    var ID = 'gonghui_main';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id, {action: true});
            me.preLoadRes = ["gonghui.png", "gonghui.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh && me.nodes.btn_fh.hide();
            // me.nodes.btn_fh.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         me.remove();
            //     }
            // });
            me.nodes.btn_bx.click(function () {
                G.frame.gonghui_box.show();
            });

            if (P.gud.lv < 150) {
                me.nodes.btn_ghsr.hide();
            }
            me.nodes.btn_ghsr.click(function () {
                G.frame.gonghui_duihuan.show();
            });

            //排行榜
            me.nodes.btn_ph.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('gonghui_getlist', [1], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            if (!d.d.applylist) d.d.applylist = [];
                            d.d[1] = d.d.list;
                            G.frame.gonghui_paihangbang.data(d.d).show();
                        }
                    }, true);
                }
            });
            //公会副本
            G.class.ani.show({
                json: "ani_gonghuifuben",
                addTo: me.nodes.ani_ghfb,
                x: 119,
                y: 55,
                repeat: true,
                autoRemove: false
            });
            me.nodes.panel_ghfb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.gonghui_fuben.show();
                }
            });
            //公会捐献
            G.class.ani.show({
                json: "ani_gonghuijuanxian",
                addTo: me.nodes.ani_ghjx,
                x: 137,
                y: 17,
                repeat: true,
                autoRemove: false
            });
            me.nodes.panel_ghjx.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.gonghui_juanxian.show();
                }
            });
            //公会商店
            me.nodes.panel_ghsd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // G.frame.shop.data({
                    //     type: "5",
                    //     name: "ghsd"
                    // }).show();
                    G.frame.shopmain.data('5').show();
                }
            });
            //公会科技
            G.class.ani.show({
                json: "ani_gonghuikeji",
                addTo: me.nodes.ani_ghkj,
                x: 119,
                y: 85,
                repeat: true,
                autoRemove: false
            });
            me.nodes.panel_ghkj.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.gonghui_keji.show();
                }
            });
            //公会战
            G.class.ani.show({
                json: "ani_gonghuizhan",
                addTo: me.nodes.ani_ghz,
                x: 155,
                y: 66,
                repeat: true,
                autoRemove: false
            });
            me.nodes.panel_ghz.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // if(!G.DATA.openGHZ) return G.tip_NB.show(X.STR(L("KFJTHKQ_GHZ"), G.gc.openSeverTime.openGHZ.time / (24 * 3600)));
                    // G.frame.gonghui_zhengfeng.checkShow();
                    G.frame.gonghuizf_main.show();
                }
            });
            //大厅
            me.nodes.panel_dt.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.gonghui_dating.show();
                }
            });

            if(G.frame.chat.allRedNum) {
                G.setNewIcoImg(me.nodes.btn_lt, null, G.frame.chat.allRedNum);
            }
            me.nodes.btn_lt.click(function (sender, type) {
                G.frame.chat.show();
            });

            if(G.view.mainView.nodes.btn_yj.getChildByName("redPoint")) {
                G.setNewIcoImg(me.nodes.btn_yj);
            }
            me.nodes.btn_yj.click(function (sender, type) {
                G.frame.youjian.show();
            });

            G.class.ani.show({
                json: "ani_gonghuitabbao.csd",
                addTo: me.nodes.panel_ghtb,
                x: 137.5,
                y: 135,
                repeat: true,
                autoRemove: false
            });
            me.nodes.panel_ghtb.click(function () {
                if(P.gud.lv < G.class.opencond.getLvById("friendhelp")) {
                    G.tip_NB.show(X.STR(L("XJKQ"), G.class.opencond.getLvById("friendhelp")));
                    return;
                }
                G.frame.gonghui_tanbao.show();
            });

            me.nodes.panel_tdrw.click(function () {

                G.frame.gonghui_ghrw.checkShow();
            });
        },
        checkGHRW: function() {
            var me = this;
            if(me.DATA.fbid * 1 < 56) me.nodes.panel_tdrw.hide();
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.setDTdata();
        },
        onAniShow: function () {
            var me = this;

            me.ui.setTimeout(function () {
                G.guidevent.emit('gonghuiOpenOver');
            }, 200);
        },
        setDTdata: function () {
            var me = this;

            G.ajax.send('gonghui_userlist', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DTDATA = d.d;
                }
            }, true);
        },
        onShow: function () {
            var me = this;

            me.showMainMenu();
            me.showToper();

            me.changeToperAttr({
                attr2: {a: 'item', t: '2003'}
            });
            me.checkGHRW();
            me.setBaseInfo();
            me.checkRedPoint();
            me.emit("showOver");
            G.view.mainMenu.set_fhzc(4);
            G.view.mainMenu.checkRedPoint('gonghui');
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            me.changeToperAttr();
            G.hongdian.getData("gonghui", 1);
        },
        setBaseInfo: function () {
            var me = this;

            // var layGhz = me.nodes.panel_ghz;
            //
            // //公会战，暂不开启，不需要做。
            // layGhz.finds('panel_bq').hide();
        },
        checkRedPoint: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var data = G.DATA.hongdian.gonghui;
            var arr = ["apply", "donate", "fuben", "box", "treasure", "competing", "teamtask",'siege'];
            if(data[arr[0]] > 0) {
                G.setNewIcoImg(me.nodes.panel_dt.finds("panel_bq"), .7);
                me.nodes.panel_dt.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_dt.finds("panel_bq"));
            }

            if(data[arr[1]] > 0) {
                G.setNewIcoImg(me.nodes.panel_ghjx.finds("panel_bq"), .7);
                me.nodes.panel_ghjx.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_ghjx.finds("panel_bq"));
            }

            if(data[arr[2]] > 0) {
                G.setNewIcoImg(me.nodes.panel_ghfb.finds("panel_bq"), .7);
                me.nodes.panel_ghfb.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_ghfb.finds("panel_bq"));
            }

            if (data[arr[3]] > 0) {
                G.setNewIcoImg(me.nodes.btn_bx);
            } else {
                G.removeNewIco(me.nodes.btn_bx);
            }

            if(data[arr[4]] > 0) {
                G.setNewIcoImg(me.nodes.panel_ghtb.finds("panel_bq"), .7);
                me.nodes.panel_ghtb.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_ghtb.finds("panel_bq"));
            }

            if(data[arr[5]] > 0 || data[arr[7]] > 0) {
                G.setNewIcoImg(me.nodes.panel_ghz.finds("panel_bq"), .7);
                me.nodes.panel_ghz.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_ghz.finds("panel_bq"));
            }

            if(data[arr[6]] > 0) {
                G.setNewIcoImg(me.nodes.panel_tdrw.finds("panel_bq"), .7);
                me.nodes.panel_tdrw.finds("panel_bq").getChildByName("redPoint").setPosition(133, 44);
            }else {
                G.removeNewIco(me.nodes.panel_tdrw.finds("panel_bq"));
            }
        },
        getData: function (callback, errCall) {
            var me = this;

            G.ajax.send('gonghui_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else if (d.s == -3) {
                    errCall && errCall();
                }
            });
        },
        checkShow: function (data) {
            var me = this;

            if (!P.gud.ghid || P.gud.ghid == '') {
                G.frame.gonghui_list.data(data).show();
            } else {
                me.getData(function () {
                    me.show();
                });
            }
        }
    });

    G.frame[ID] = new fun('gonghui.json', ID);
})();