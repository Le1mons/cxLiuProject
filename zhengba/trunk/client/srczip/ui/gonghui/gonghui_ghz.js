/**
 * Created by LYF on 2018/12/4.
 */
(function () {
    //公会-争锋
    var ID = 'gonghui_ghz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.preLoadRes = ["gonghui4.png", "gonghui4.plist"];
        },
        initUi: function () {
            var me = this;

            me.nodes.wz_saiji.setString(X.STR(L("GHZ_SJ"), me.DATA.season));
            me.nodes.wz_shuoming.setString( X.STR(L("GHZ_SC"), me.DATA.round, 6, L("GHZ_DW" + me.DATA.segmentdata.segment)));
            me.ui.finds("vs_dengji").setBackGroundImage("img/gonghui/img_dw" + me.DATA.segmentdata.segment + ".png", 1);
        },
        checkRedPoint: function() {
            var me = this;

            if(G.DATA.hongdian.gonghui.competing == 3) {
                G.setNewIcoImg(me.nodes.btn_duanweibaoxiang);
            } else {
                G.removeNewIco(me.nodes.btn_duanweibaoxiang);
            }
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
                if(!G.frame.gonghui_zhengfeng.isFight) {
                    G.tip_NB.show(L("GHZ_ZWZDXX"));
                    return;
                }
                G.frame.gonghui_zdxx.show();
            });

            me.nodes.btn_saiqupaihang.click(function () {
                //赛区排行
                G.frame.gonghui_sqph.show();
            });

            G.class.ani.show({
                json: "ani_gonghuizhenfeng_xuanzhong",
                addTo: me.nodes.qizhi_1.finds("xuanzhong_1"),
                x: me.nodes.qizhi_1.finds("xuanzhong_1").width / 2,
                y: 124,
                repeat: true,
                autoRemove: false,
            });

            G.class.ani.show({
                json: "ani_gonghuizhenfeng_xuanzhong2",
                addTo: me.nodes.qizhi_2.finds("xuanzhong_1"),
                x: me.nodes.qizhi_2.finds("xuanzhong_1").width / 2,
                y: 19,
                repeat: true,
                autoRemove: false,
            });
            
            X.radio([me.nodes.qizhi_1, me.nodes.qizhi_2], function (sender) {
                me.changeType(sender.getName().split("_")[1][0]);
            }, {
                callback1: function (sender) {
                    sender.finds("xuanzhong_1").show();
                },
                callback2: function (sender) {
                    sender.finds("xuanzhong_1").hide();
                },
                noTextColor: true
            })
        },
        changeType: function(type) {
            var me = this;

            if(type == 1) {
                me.nodes.bg_hong.show();
                me.nodes.bg_lan.hide();
                me.nodes.qizhi_1.finds("zhandou_cishu").hide();
            } else {
                me.nodes.bg_hong.hide();
                me.nodes.bg_lan.show();
                !me.nodes.qizhi_1.finds("zhandou_cishu").isShow &&me.nodes.qizhi_1.finds("zhandou_cishu").show();
            }

            me.type = type;
            me.setTable(true);
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
        onOpen: function () {
            var me = this;

            me.DATA = me.data();
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.setContents();
            me.checkRedPoint();
            me.nodes.qizhi_2.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setCloseTime: function() {
            var me = this;

            X.timeout(me.nodes.txt_sj, X.getTodayZeroTime() + 22 * 3600, function () {
                me.remove();
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

            me.setGh();
            me.setCloseTime();
        },
        setGh: function () {
            var me = this;

            var f = function (target, type) {
                var data = me.getGhData(type);

                if(!data) return;

                target.finds("wz_zdl$").setString(X.fmtValue(data.zhanli));
                target.finds("z_sz$").setString(data.rank);
                target.finds("wz_fenshu$").setString(data.jifen);
                target.finds("wz_gonghuimingzi$").setString(data.guildinfo.name);
                target.finds("qizhi$").loadTexture(G.class.gonghui.getFlagImgById(data.guildinfo.flag),1);

                if(type == 1) {
                    if(me.getAtkNum() == "noPlayer" || P.gud.lv < 30) {
                        target.finds("zhandou_cishu").hide();
                        target.finds("zhandou_cishu").isShow = true;
                    } else {
                        for (var i = 1; i < 4; i ++) {
                            if(i <= me.getAtkNum()) {
                                target.finds("zhandou_cishu").children[i].setBright(true);
                            } else {
                                target.finds("zhandou_cishu").children[i].setBright(false);
                            }
                        }
                    }
                }

                if(!data.advance) {
                    target.finds("biaoqian$").setBackGroundImage("img/gonghui/biaoqian_2.png", 1);
                } else {
                    if(data.advance == 1) target.finds("biaoqian$").setBackGroundImage("img/gonghui/biaoqian_1.png", 1);
                    else target.finds("biaoqian$").setBackGroundImage("img/gonghui/biaoqian_3.png", 1);
                }
            };

            f(me.nodes.qizhi_1, 1);
            f(me.nodes.qizhi_2, 2);
        },
        setTable: function (bool) {
            var me = this;
            var data = me.getGhData(me.type).player;

            for (var i in data) {
                if(data[i].life_num <= 0) {
                    data[i].isLive = 0;
                } else {
                    data[i].isLive = 1;
                }
            }

            data.sort(function (a, b) {
                if(a.isLive != b.isLive) {
                    return a.isLive > b.isLive ? -1 : 1;
                } else {
                    return a.maxzhanli > b.maxzhanli ? -1 : 1;
                }
            });

            bool = bool || false;

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(bool);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(bool);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            ui.setTouchEnabled(false);
            ui.finds("wz_wanjia").setString(data.headdata.name);
            ui.finds("fenshu_wz").setString(data.lose_jifen);
            ui.finds("txt_zdl$").setString(data.maxzhanli);
            ui.finds("ico_1").removeAllChildren();
            ui.finds("ico_1").setTouchEnabled(false);
            ui.finds("neirong$").setTouchEnabled(false);

            var head = G.class.shead(data.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.finds("ico_1").width / 2, ui.finds("ico_1").height / 2);
            ui.finds("ico_1").addChild(head);

            if(me.type == 1) {
                ui.finds("btn_tiaozhan").hide();
            } else {
                if(!data.life_num) {
                    ui.finds("btn_tiaozhan").setBright(false);
                    ui.finds("wz_tiaozhan").setTextColor(cc.color("#6c6c6c"));
                } else {
                    ui.finds("btn_tiaozhan").setBright(true);
                    ui.finds("wz_tiaozhan").setTextColor(cc.color("#2f5719"));
                }
                ui.finds("btn_tiaozhan").show();
                ui.finds("panel_zdl").y = 135;
                ui.finds("btn_tiaozhan").num = data.life_num;
                ui.finds("btn_tiaozhan").uid = data.uid;
                ui.finds("btn_tiaozhan").click(function (sender) {
                    if(P.gud.lv < 30) {
                        G.tip_NB.show(L("ERR_LV"));
                        return;
                    } else if(me.getLiveNum() == "noPlayer") {
                        G.tip_NB.show(L("ERR_NO"));
                        return;
                    } else if(!me.getAtkNum()) {
                        G.tip_NB.show(L("ERR_NUM"));
                        return;
                    } else if(!sender.num) {
                        G.tip_NB.show(L("ERR_HEALTH"));
                        return;
                    }
                    var obj = {
                        pvType: "pvghz",
                        data: {
                            ghid: me.enemyId,
                            uid: sender.uid
                        }
                    };
                    G.frame.yingxiong_fight.data(obj).show();
                })
            }

            if(data.life_num < 1) {
                ui.finds("jdt$").setPercent(0);
            } else {
                if(me.type == 1) {
                    ui.finds("jdt$").setPercent(100);
                } else {
                    if(!data.fightless) {
                        ui.finds("jdt$").setPercent(100)
                    } else {
                        var maxNum = 0;
                        var curNum = 0;
                        for (var i in data.fightdata) {
                            maxNum += (data.fightdata[i].maxhp ? data.fightdata[i].maxhp : 0);
                        }
                        for (var i in data.fightless) {
                            if(data.fightless[i] <= 0) {
                                curNum += 0;
                            } else {
                                curNum += data.fightless[i];
                            }
                        }
                        ui.finds("jdt$").setPercent(curNum / maxNum * 100);
                    }
                }
            }

            for (var i = 1; i < 4; i ++) {
                var chr = ui.finds("panel_1").children[i + 2];
                var chr1 = ui.finds("panel_2").children[i + 2];

                if(data.atk_num >= i) {
                    chr.show();
                } else {
                    chr.hide();
                }

                if(data.life_num >= i) {
                    chr1.show();
                } else  {
                    chr1.hide();
                }
            }

            for (var i = 1; i < 7; i ++) {
                ui.finds("ico" + i).setTouchEnabled(false);
                ui.finds("ico" + i).removeAllChildren();
                ui.finds("ico" + i).removeBackGroundImage();
            }

            var heroList = [];
            var sqid = "";
            for (var i in data.fightdata) {
                if(!data.fightdata[i].sqid) {
                    heroList.push(data.fightdata[i]);
                } else {
                    sqid = data.fightdata[i].sqid;
                }
            }

            for (var i = 0; i < 6; i ++) {
                var lay = ui.finds("ico" + (i + 1));
                if(heroList[i]) {
                    if(i == heroList.length - 1 && me.type == 2) {
                        lay.setBackGroundImage("img/gonghui/ico_kong2.png", 1);
                    } else {
                        var hero = G.class.shero(heroList[i]);
                        hero.setArtifact(sqid);
                        hero.setAnchorPoint(0.5, 0.5);
                        hero.setPosition(lay.width / 2, lay.height / 2);
                        lay.addChild(hero);
                        if(me.type == 2) {
                            if(data.fightless && data.fightless[heroList[i].pos] <= 0) {
                                hero.setEnabled(false);
                            }
                        }
                    }
                }else {
                    lay.setBackGroundImage("img/gonghui/ico_kong1.png", 1);
                }
            }

            ui.show();
        },
        getGhData: function (type) {
            var me = this;
            
            for (var i in me.DATA.guild) {
                if(P.gud.ghid == i && type == 1) {
                    return me.DATA.guild[i];
                }
                if(P.gud.ghid !== i && type == 2) {
                    me.enemyId = i;
                    return me.DATA.guild[i];
                }
            }
        },
        getLiveNum: function () {
            var me = this;
            var data = me.getGhData(1).player;

            for (var i in data) {
                if(P.gud.uid == data[i].uid) {
                    return data[i].life_num;
                }
            }

            return "noPlayer";
        },
        getAtkNum: function() {
            var me = this;
            var data = me.getGhData(1).player;

            for (var i in data) {
                if(P.gud.uid == data[i].uid) {
                    return data[i].atk_num;
                }
            }

            return "noPlayer";
        },
        refresh: function () {
            var me = this;

            me.getData(function () {
                me.setGh();
                me.setTable();
            })
        }
    });
    G.frame[ID] = new fun('gonghui_ghzxinxi.json', ID);
})();