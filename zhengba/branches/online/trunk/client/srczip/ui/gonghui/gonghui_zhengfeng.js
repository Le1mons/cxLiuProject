/**
 * Created by LYF on 2018/12/3.
 */
(function () {
    //公会-争锋
    var ID = 'gonghui_zhengfeng';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.preLoadRes = ["gonghui3.png", "gonghui3.plist", "gonghui5.png", "gonghui5.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS23")
                }).show();
            });

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });

            me.ui.finds("btn_baoming").click(function () {
                if(me.jiesuan) {
                    G.frame.gonghui_sqph.show();
                } else {
                    if(P.gud.ghpower > 1) {
                        G.tip_NB.show(L("GHZ_BMSB"));
                        return;
                    }
                    me.ajax("ghcompeting_signup", [], function (str, data) {
                        if(data.s == 1) {
                            G.tip_NB.show(X.STR(L("GHZ_BMCG"), me.DATA.season));
                            me.getData(function () {
                                me.setContents()
                            });
                        } else {
                            me.getData(function () {
                                me.setContents()
                            });
                        }
                    })
                }
            });

            me.nodes.btn_duanweibaoxiang.click(function () {
                //段位宝箱
                G.frame.gonghui_dwbx.show();
            });

            me.nodes.btn_paimingjiangli.click(function () {
                //排名奖励
                G.frame.gonghui_pmjl.show();
            });

            me.nodes.btn_lijiewangzhe.click(function () {
                //历届王者
                if(G.frame.gonghui_zhengfeng.DATA.season == 1) {
                    G.tip_NB.show(L("SJWZZWDS"));
                    return;
                }
                G.frame.gonghui_ljwz.show();
            });

            me.nodes.btn_zdxx.click(function () {
                //战斗信息
                if(!me.isFight) {
                    G.tip_NB.show(L("GHZ_ZWZDXX"));
                    return;
                }
                G.frame.gonghui_zdxx.show();
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



            me.nodes.ding_jy.show();
            me.nodes.panel_dh.show();
            G.class.ani.show({
                json: "ani_gonghuizhenfeng_baoming",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: 145,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("xunhuan", true);
                }
            });

            me.showToper();
            me.setContents();
            me.checkRedPoint();
        },
        getData: function(callback) {
            var me = this;

            me.ajax("ghcompeting_open", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("gonghui", 1, function () {
                G.frame.gonghui_main.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            var title = me.ui.finds("jy_jy");
            var num = me.ui.finds("wz_3");
            var cond = me.ui.finds("wz_4");
            var btn = me.ui.finds("btn_baoming");
            var ybm = me.nodes.img_ybm;
            var huizhang = me.nodes.panel_hz;
            var top = me.nodes.wz_shuoming;
            var saiji = me.nodes.wz_saiji;

            top.hide();
            num.hide();
            btn.hide();
            ybm.hide();
            cond.hide();
            title.hide();
            saiji.hide();
            huizhang.hide();
            huizhang.removeAllChildren();
            huizhang.removeBackGroundImage();
            btn.finds("wz_baoming").setFontSize(24);

            function  jiesuan(num) {
                if(me.DATA.segmentdata.segment == 4 && !me.isLK) {
                    G.class.ani.show({
                        json: "ani_gonghuizhenfeng_jiesuan",
                        x: huizhang.width / 2,
                        y: huizhang.height / 2 - 100,
                        addTo: huizhang,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            action.playWithCallback("in", false, function () {
                                action.play("xunhuan", true);
                            });
                            G.class.ani.show({
                                json: "ani_gonghuizhenfeng" + me.DATA.segmentdata.segment,
                                addTo: node.finds("xunzhang"),
                                x: node.finds("xunzhang").width / 2,
                                y: node.finds("xunzhang").height / 2,
                                repeat: true,
                                autoRemove: false,
                                onload: function (node, action) {
                                    action.play("xunhuan", true);
                                }
                            });
                            if(num != 6) {
                                node.finds("Text_1").setString(X.STR(L("GHZ_WZRANK"), me.DATA.segmentdata.rank));
                            } else {
                                node.finds("Text_1").setString(L("GHZ_LKJF") + G.class.getConf("gonghuizhengfeng").base.segment[4].lunk_integral);
                            }
                        }
                    });
                } else {
                    G.class.ani.show({
                        json: "ani_gonghuizhenfeng" + me.DATA.segmentdata.segment,
                        addTo: huizhang,
                        x: huizhang.width / 2,
                        y: huizhang.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            if(me.DATA.advance == 1) {
                                action.playWithCallback("in", false, function () {
                                    action.play("xunhuan", true);
                                })
                            } else {
                                action.play("xunhuan", true);
                            }
                            if(!me.xiuzhan) {
                                G.class.ani.show({
                                    json: "ani_gonghuizhenfeng_jinji",
                                    addTo: huizhang,
                                    x: huizhang.width / 2,
                                    y: huizhang.height / 2 - 100,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node1, action1) {
                                        if(me.DATA.advance == 1) {
                                            action1.playWithCallback("jinji", false, function () {
                                                action1.play("jinjixunhuan", true);
                                            })
                                        } else if(me.DATA.advance == 0) {
                                            action1.playWithCallback("baoji", false, function () {
                                                action1.play("baojixunhuan", true);
                                            })
                                        } else {
                                            action1.playWithCallback("jiangji", false, function () {
                                                action1.play("jiangjixunhuan", true);
                                            });
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            }

            if(me.xunhuan && G.time > X.getTodayZeroTime() + 22 * 3600 && G.time <= X.getTodayZeroTime() + 22 * 3600 + 3) {
                //结算中
                me.nodes.panel_dh.hide();
                me.ui.finds("img_bg").loadTexture("img/bg/bg_ghzf.png");
                title.show();
                huizhang.show();
                btn.children[0].setString(L("GHZ_SLSQPM"));
                title.children[0].setString(L("GHZ_SQJSZ"));
                huizhang.setBackGroundImage("img/gonghui/img_huizhang5.png", 1);
                saiji.show();
                saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                top.setString(X.STR(L("GHZ_SLJS"), me.DATA.round - 1, L("GHZ_DW" + me.DATA.segmentdata.segment)));
                return;
            }
            if(me.xiuzhan) {
                //周末休战
                top.show();
                num.show();

                if(me.DATA.season == 1) {
                } else {
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(L("GHZ_SJJS"));
                }
                num.setString(X.STR(L("GHZ_BMGH"), me.DATA.guildnum || 0));
                if(me.DATA.status == 1) {
                    btn.children[0].setString(X.STR(L("GHZ_BMSJ"), me.DATA.season));
                    btn.show();
                    cond.show();
                    cond.setString(L("GHZ_TJ"));
                    if(P.gud.ghpower > 1) {
                        btn.setBright(false);
                        btn.finds("wz_baoming").setTextColor(cc.color("#6c6c6c"));
                    } else {
                        btn.setBright(true);
                        btn.finds("wz_baoming").setTextColor(cc.color("#2f5719"));
                    }
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(L("GHZ_WBM"));
                }

                if(me.DATA.guildnum >= G.class.getConf("gonghuizhengfeng").base.cond.guild_num) {
                    me.addCountdown(num);
                }

                if(me.DATA.segmentdata.isjoin) {
                    huizhang.show();
                    title.show();
                    jiesuan();
                    title.children[0].setString(X.STR(L("SJJG"), me.DATA.season - 1));
                    me.ui.finds("img_bg").loadTexture("img/bg/bg_ghzf.png");
                    me.nodes.panel_dh.hide();
                }

                if(me.DATA.status == 2) {
                    ybm.show();
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(L("GHZ_YBM1"));
                }
                return;
            }
            switch (me.DATA.status) {
                case 1:
                    //未报名
                    num.show();
                    btn.show();
                    cond.show();
                    top.show();
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(L("GHZ_WBM"));
                    num.setString(X.STR(L("GHZ_BMGH"), me.DATA.guildnum));
                    cond.setString(L("GHZ_TJ"));
                    btn.finds("wz_baoming").setString(X.STR(L("GHZ_BMSJ"), me.DATA.season));
                    if(me.DATA.guildnum >= G.class.getConf("gonghuizhengfeng").base.cond.guild_num) {
                        num.hide();
                    }
                    if(P.gud.ghpower > 1) {
                        btn.setBright(false);
                        btn.finds("wz_baoming").setTextColor(cc.color("#6c6c6c"));
                    } else {
                        btn.setBright(true);
                        btn.finds("wz_baoming").setTextColor(cc.color("#2f5719"));
                    }
                    break;
                case 2:
                    //匹配中
                    ybm.show();
                    num.show();
                    top.show();
                    num.setString(X.STR(L("GHZ_BMGH"), me.DATA.guildnum));
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(X.STR(L("GHZ_YBM"), me.DATA.round, L("GHZ_DW" + me.DATA.segmentdata.segment)));
                    if(me.DATA.guildnum >= G.class.getConf("gonghuizhengfeng").base.cond.guild_num) {
                        me.addCountdown(num);
                        btn.children[0].setString(L("GHZ_SLSQPM"));
                    }
                    break;
                case 3:
                    //匹配失败
                    me.nodes.panel_dh.hide();
                    me.ui.finds("img_bg").loadTexture("img/bg/bg_ghzf.png");
                    cond.show();
                    top.show();
                    title.show();
                    huizhang.show();
                    huizhang.setBackGroundImage("img/gonghui/hz_xiuzhan.png", 1);
                    title.children[0].setString(L("GHZ_XZ"));
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(X.STR(L("GHZ_DDXZ"), me.DATA.round, L("GHZ_DW" + me.DATA.segmentdata.segment)));
                    cond.setString(L("GHZ_PPSB"));
                    me.addCountdown(num);
                    break;
                case 4:
                    //结算期
                    me.nodes.panel_dh.hide();
                    me.ui.finds("img_bg").loadTexture("img/bg/bg_ghzf.png");
                    top.show();
                    btn.show();
                    btn.finds("wz_baoming").setFontSize(26);
                    btn.loadTextureNormal("img/public/btn/btn1_ssj.png", 1);
                    btn.children[0].setTextColor(cc.color("#7b531a"));
                    huizhang.show();
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    me.addCountdown(num);
                    btn.children[0].setString(L("GHZ_SLSQPM"));
                    top.setString(X.STR(L("GHZ_DDPP"), me.DATA.round, L("GHZ_DW" + me.DATA.segmentdata.segment)));

                    if(G.time > X.getTodayZeroTime() + 22 * 3600 + 60 && G.time < X.getTodayZeroTime() * 24 * 3600) {
                        if(G.time > X.getLastMondayZeroTime() + 5 * 24 * 3600) {
                            top.setString(X.STR(L("GHZ_SLJS"), 6, L("GHZ_DW" + me.DATA.segmentdata.segment)));
                            num.show();
                            num.removeAllChildren();
                            cond.show();
                            btn.show();
                            cond.setString(L("GHZ_TJ"));
                            num.setString(L("GHZ_CRBM"));
                            btn.setBright(false);
                            btn.setTouchEnabled(false);
                            btn.finds("wz_baoming").setTextColor(cc.color("#6c6c6c"));
                            btn.finds("wz_baoming").setString(X.STR(L("GHZ_BMSJ"), me.DATA.season + 1));
                        }
                    }
                    me.jiesuan = true;
                    jiesuan();
                    break;
                case 6:
                    //轮空
                    me.DATA.advance = 1;
                    me.nodes.panel_dh.hide();
                    me.ui.finds("img_bg").loadTexture("img/bg/bg_ghzf.png");
                    huizhang.show();
                    title.show();
                    if(me.DATA.segmentdata.segment == 4 && me.DATA.pre_seg == me.DATA.segmentdata.segment) {
                        title.children[0].setString(L("GHZ_LK"));
                    } else {
                        me.isLK = true;
                        title.children[0].setString(X.STR(L("GHZ_GXLK"), L("GHZ_DW" + me.DATA.segmentdata.segment)));
                    }
                    saiji.show();
                    saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
                    top.setString(X.STR(L("GHZ_PPZ"), me.DATA.round, 6, L("GHZ_DW" + me.DATA.segmentdata.segment)));
                    jiesuan(6);
                    if(me.DATA.round != 6 && G.time < X.getLastMondayZeroTime() + 5 * 24 * 3600) {
                        me.addCountdown(num);
                    }
                    break;
            }
        },
        checkShow: function () {
            var me = this;

            if(G.time <= X.getLastMondayZeroTime() + 6 * 24 * 3600) {
                //循环期
                me.xunhuan = true;
            } else {
                me.xiuzhan = true;
                //休战期
            }
            
            G.ajax.send("ghcompeting_open", [], function (data) {
                if(!data) return;
                var data = JSON.parse(data);
                if(data.s == 1) {
                    me.DATA = data.d;
                    if(data.d.status == 5) {
                        if(G.time >= X.getTodayZeroTime() + 6 * 3600 && G.time <= X.getTodayZeroTime() + 22 * 3600) {
                            G.frame.gonghui_ghz.data(data.d).show();
                            me.isFight = true;
                        } else {
                            me.show();
                        }
                    } else {
                        me.show();
                    }
                }
            })
        },
        addCountdown: function (num) {
            var me = this;
            num.show();
            num.setString("");
            var str = L("XLDJS") + "<font node=1></font>";
            var txt = new ccui.Text("", G.defaultFNT, 18);
            txt.setTextColor(cc.color("#30ff01"));
            X.enableOutline(txt, "#000000", 2);
            X.timeout(txt, G.time > X.getTodayZeroTime() + 6 * 3600 ? X.getTodayZeroTime() + 24 * 3600 + 6 * 3600 : X.getTodayZeroTime() + 6 * 3600, function () {
                me.remove();
            });
            var rh = new X.bRichText({
                size: 18,
                family: G.defaultFNT,
                maxWidth: num.width,
                lineHeight: 32,
                color: "#ffffff",
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str, [txt]);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(num.width / 2, num.height / 2 + 10);
            num.addChild(rh);
        },
        checkRedPoint: function() {
            var me = this;

            if(G.DATA.hongdian.gonghui.competing == 3) {
                G.setNewIcoImg(me.nodes.btn_duanweibaoxiang);
            } else {
                G.removeNewIco(me.nodes.btn_duanweibaoxiang);
            }
        }
    });
    G.frame[ID] = new fun('gonghui_ghzf.json', ID);
})();