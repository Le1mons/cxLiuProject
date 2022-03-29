/**
 * Created by wfq on 2018/6/5.
 */
(function () {
    //英雄-开战选择
    G.class.yingxiong_kaizhan = X.bView.extend({
        extConf: {
            showHelp: ['lht'],
            noShowYJ: ['lht'],
            noShowPet: ['lht'],
            maxnum: 6,
            sqimg: {
                1: "shenbing_hmzr",
                2: "shenbing_lrsg",
                3: "shenbing_snfz",
                4: "shenbing_zwjj",
                5: "shenbing_slcq",
                6: "shenbing_jdzc"
            },
            fight: {
                pvdafashita: function (node) {
                    //需要是有站位信息的出站数据
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    var time = G.time;
                    G.ajax.send("fashita_fight", [type.data, data], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvdafashita';
                            G.frame.dafashita_tiaozhan.remove();

                            if (!d.d.fightres.winside) {
                                G.frame.dafashita.DATA.layernum++;
                                G.event.emit("sdkevent", {
                                    event: "shendian_zhilu",
                                    data: {
                                        sdzl_maxsection: type.data,
                                        get: d.d.prize,
                                    }
                                });
                            }
                            X.cacheByUid('fight_fashita', data);

                            G.frame.fight.data({
                                prize: d.d.prize,
                                pvid: type.data
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.fight.pve_start({
                                    stage_id: type.data,
                                    stage_name: G.gc.dafashita[type.data].boss,
                                    pve_id: 'shendianzhilu'
                                });
                            }).once('willClose', function () {
                                G.frame.fight.pve_end({
                                    stage_id: type.data,
                                    stage_name: G.gc.dafashita[type.data].boss,
                                    mission_start_time: time,
                                    stage_result: d.d.fightres.winside,
                                    reward_list: X.arrPirze(d.d.prize),
                                    pve_id: 'shendianzhilu'
                                });
                                G.frame.fight.hero_go_on(data, d.d.fightres.winside);
                            }).demo(d.d.fightres);
                        }
                    }, true);
                },
                pvshilian: function (node) {
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    G.ajax.send("mrsl_fight", [type.data.type, type.data.nandu, data, type.data.npc], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvshilian';

                            X.cacheByUid('fight_ready', data);
                            G.frame.fight.data({
                                prize: d.d.prize,
                                type1: "pvshilian",
                                type: type.data.type,
                                nandu: type.data.nandu,
                                data: data,
                                npc: type.data.npc
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                            if (d.d.fightres.winside == 0) {
                                G.frame.meirishilian.list.nodes.btn_tz.hide();
                                G.frame.meirishilian.list.nodes.btn_sd.show();
                            }

                            G.hongdian.getData("mrsl", 1, function () {
                                G.frame.meirishilian.checkRedPoint();
                            });
                            G.frame.meirishilian.nodes.text_sycs.setString(d.d.lessnum);
                        }
                    });
                },
                pvguanqia: function (node) {
                    // var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    var mapid = P.gud.maxmapid;
                    var time = G.time;
                    G.ajax.send('tanxian_fightboss', [data], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvguanqia';
                            G.frame.tanxian.refreshData();
                            X.cacheByUid('fight_tanxian', data);

                            G.DATA.heroPoint = G.DATA.heroPoint || {};
                            for (var i in data) {
                                G.DATA.heroPoint[data[i]] = 0;
                            }
                            G.hongdian.checkYx();

                            if (d.d.israndom && P.gud.maxmapid > 5) {
                                G.frame.yingxiong_fight.remove();
                                G.class.ani.show({
                                    json: "ani_taopao",
                                    addTo: G.frame.tanxian.ui,
                                    x: G.frame.tanxian.ui.width / 2,
                                    y: G.frame.tanxian.ui.height / 2,
                                    repeat: false,
                                    autoRemove: true,
                                    onend: function () {
                                        G.frame.fight_tanxian_win.data({
                                            prize: d.d.prize
                                        }).show();
                                        G.tip_NB.show(L("ZJSL"));
                                    }
                                });
                            } else {
                                G.frame.tanxianFight.data({
                                    prize: d.d.prize,
                                    pvType: "pvguanqia"
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                    G.frame.fight.pve_start({
                                        stage_id: mapid,
                                        stage_name: G.gc.tanxian[mapid].name,
                                        pve_id: 'tanxian'
                                    });
                                }).once('willClose', function () {
                                    G.frame.fight.pve_end({
                                        stage_id: mapid,
                                        stage_name: G.gc.tanxian[mapid].name,
                                        mission_start_time: time,
                                        stage_result: d.d.fightres.winside,
                                        reward_list: X.arrPirze(d.d.prize),
                                        pve_id: 'tanxian'
                                    });
                                    G.frame.fight.hero_go_on(data, d.d.fightres.winside);
                                }).demo(d.d.fightres);
                            }
                        }
                    }, true);
                },
                pvshizijun: function (node) {
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    var time = G.time;
                    G.ajax.send("shizijun_fight", [data, type.idx], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvshizijun';

                            X.cacheByUid('fight_shizijun', data);
                            G.frame.fight.data({
                                prize: d.d.prize,
                                pvid: type.idx,
                                ptype: 'pvshizijun',
                                difficulty: type.difficulty
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.sizijunyuanzheng_dsxx.remove();
                                G.frame.fight.pve_start({
                                    stage_id: type.idx,
                                    pve_id: 'shizijun'
                                });
                            }).once('willClose', function () {
                                G.frame.fight.pve_end({
                                    stage_id: type.idx,
                                    mission_start_time: time,
                                    stage_result: d.d.fightres.winside,
                                    reward_list: X.arrPirze(d.d.prize),
                                    pve_id: 'shizijun'
                                });
                                G.frame.fight.hero_go_on(data, d.d.fightres.winside);
                            }).demo(d.d.fightres);

                            G.frame.shizijunyuanzheng.getData(function () {
                                G.frame.shizijunyuanzheng.setContents();
                            });

                            if (d.d.fightres.winside == 0) {
                                G.frame.fight_win.once('show', function () {
                                    if (d.d.flop) {
                                        G.frame.fanpai.data(d.d.flop).show();
                                    }
                                });
                            }
                            // G.frame.fight_win.once('shizijun', function () {
                            //     G.frame.fanpai.data(d.d.flop).show();
                            // });
                        } else if (d.s == -3) {
                            //没有数据防守阵容数据，很大几率是由于换天了
                            G.tip_NB.show(L('reseted'));
                            G.frame.yingxiong_fight.remove();
                            G.frame.sizijunyuanzheng_dsxx.remove();
                            G.frame.shizijunyuanzheng.remove();
                            cc.director.getRunningScene().setTimeout(function () {
                                G.frame.shizijunyuanzheng.show();
                            }, 200);
                        }
                    }, true);
                },
                pvywzbjf: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("crosszb_jffight", [data.idx, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'pvywzbjf';
                            G.hongdian.getData("crosszbjifen", 1, function () {
                                G.frame.yuwaizhengba.checkRedPoint();
                                G.frame.yuwaizhengba_jifen.checkRedPoint();
                            });
                            X.cacheByUid('fight_ywzbjf', hereList);

                            if (X.cacheByUid("jumpJiFenSai")) {
                                G.frame.fight.DATA = d.d.fightres;
                                if (d.d.fightres.winside == 0) {
                                    G.frame.fight_win.data(d.d).show();
                                } else {
                                    G.frame.fight_fail.data(d.d.fightres).show();
                                }
                                G.frame.yingxiong_fight.remove();
                            } else {
                                G.frame.fight.data({
                                    prize: d.d.prize,
                                    pvid: data.idx
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                    G.frame.fight.pvp_start({
                                        id: data.uid,
                                        zhanli: data.zhanli,
                                        rList: G.frame.fight.getHeroHidArr(data.herolist),
                                        lList: G.frame.fight.getMyHidArr(hereList),
                                        type: 'waiyuzhengba'
                                    });
                                }).once('willClose', function () {
                                    G.frame.fight.pvp_end({
                                        id: data.uid,
                                        zhanli: data.zhanli,
                                        rList: G.frame.fight.getHeroHidArr(data.herolist),
                                        lList: G.frame.fight.getMyHidArr(hereList),
                                        result: d.d.fightres.winside,
                                        data: G.frame.fight.getHeroData(d.d.fightres, 0, true),

                                        type: 'waiyuzhengba'
                                    });
                                }).demo(d.d.fightres);
                            }
                            data.callback && data.callback(d);
                            if (d.d.fightres.winside == 0) {
                                G.event.emit('sdkevent', {
                                    event: 'waiyu_tiaozhan',
                                    data: {
                                        waiyu_rank: data.rank,
                                        waiyu_score: data.jifen,
                                        get: d.d.prize,
                                    }
                                });
                            }
                        }
                    }, true);
                },
                pvywzbjfsd: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    data.callback && data.callback(hereList);
                    G.frame.yingxiong_fight.remove();
                },
                pvywzbzb: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("crosszb_zbfight", [data.uid, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'pvywzbzb';

                            X.cacheByUid('fight_ywzbzb', hereList);
                            G.frame.fight.data({
                                prize: d.d.prize,
                                pvid: data.idx
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }
                        data.callback && data.callback(d);
                    }, true);
                },
                pvghz: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("ghcompeting_fight", [hereList, data.data], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'pvghz';
                            X.cacheByUid('fight_pvghz', hereList);
                            G.frame.yingxiong_fight.remove();
                            G.frame.fight.once('hide', function () {
                                if (G.frame.gonghui_ghz.isShow) {
                                    G.frame.gonghui_ghz.refresh();
                                }
                            }).demo(d.d.fightres);

                            if (d.d.fightres.winside == 0) {
                                G.frame.fight_win.once('show', function () {
                                    if (d.d.flop) {
                                        G.frame.fanpai.data(d.d.flop).show();
                                    }
                                });
                            } else {
                                G.frame.fight_fail.once('show', function () {
                                    if (d.d.flop) {
                                        G.frame.fanpai.data(d.d.flop).show();
                                    }
                                });
                            }
                        }
                    })
                },
                pvmw: function (node) {
                    var hereList = node.getSelectedData();

                    var time = G.time;
                    G.ajax.send("devil_fight", [hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'pvmw';
                            X.cacheByUid('fight_pvmw', hereList);
                            G.frame.yingxiong_fight.remove();
                            d.d.fightres.prize = d.d.prize;
                            G.frame.fight.once('show', function () {
                                G.frame.fight.pve_start({
                                    pve_id: 'shendianmowang'
                                });
                            }).once('willClose', function () {
                                G.frame.fight.pve_end({
                                    mission_start_time: time,
                                    stage_result: d.d.fightres.winside,
                                    reward_list: X.arrPirze(d.d.prize),
                                    pve_id: 'shendianmowang'
                                });
                                G.frame.fight.hero_go_on(hereList, d.d.fightres.winside);
                            }).demo(d.d.fightres);
                            G.frame.shendianmowang.getData(function () {
                                G.frame.shendianmowang.setFightNum();
                                G.frame.shendianmowang.setRankInfo();
                            });
                        }
                        G.event.emit('sdkevent', {
                            event: 'shendian_mowang',
                            data: {
                                sdmw_tiaozhannum: 1,
                            }
                        });
                    })
                },
                pvghtf: function (node) {
                    var hereList = node.getSelectedData();

                    G.ajax.send("teamtask_fight", [hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'pvghtf';
                            d.d.fightres['mapIdx'] = G.frame.yingxiong_fight.data().idx;
                            X.cacheByUid('fight_pvghtf', hereList);
                            G.frame.yingxiong_fight.remove();
                            d.d.fightres.prize = d.d.prize;
                            G.frame.fight.demo(d.d.fightres);
                            G.frame.gonghui_ghrw.getData(function () {
                                G.frame.gonghui_ghrw.checkShow();
                            });
                        }
                    })
                },
                sddl: function (node) {
                    var hereList = node.getSelectedData();
                    var data = G.frame.yingxiong_fight.data();

                    var time = G.time;
                    G.ajax.send("dungeon_fight", [data.idx, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'sddl';
                            X.cacheByUid('sddl_' + data.idx, hereList);
                            G.frame.yingxiong_fight.remove();
                            d.d.fightres.prize = d.d.prize;
                            d.d.fightres.map = G.frame.yingxiong_fight.DATA.map;
                            d.d.fightres.idx = data.idx;
                            d.d.fightres.hereList = hereList;
                            //d.d.fightres.level = data.level;

                            G.frame.fight.once('show', function () {
                                G.frame.shendian_sddl.getData(function () {
                                    G.frame.shendian_sddl.setContents();
                                });
                                G.frame.fight.pve_start({
                                    stage_id: data.idx,
                                    stage_name: G.gc.sddlcom.base.road[data.idx].name,
                                    pve_id: 'shendiandilao'
                                });
                            }).once('willClose', function () {
                                G.frame.fight.pve_end({
                                    stage_id: data.idx,
                                    stage_name: G.gc.sddlcom.base.road[data.idx].name,
                                    mission_start_time: time,
                                    stage_result: d.d.fightres.winside,
                                    reward_list: X.arrPirze(d.d.prize),
                                    pve_id: 'shendiandilao'
                                });
                                G.frame.fight.hero_go_on(hereList, d.d.fightres.winside);
                            }).demo(d.d.fightres);

                            G.hongdian.getData("fashita", 1, function () {
                                G.frame.julongshendian.checkRedPoint();
                                G.frame.shendian_sddl.checkRedPoint();
                            });
                            if (d.d.fightres.winside == 0) {
                                G.event.emit('sdkevent', {
                                    event: 'shendian_dilao',
                                    data: {
                                        dilaoType: data.idx,
                                        sddl_maxsection: data.level,
                                        get: d.d.prize,
                                    }
                                });
                            }
                        }
                    });
                },
                fbzc: function (node) {
                    var hereList = node.getSelectedData();
                    var data = G.frame.yingxiong_fight.data();

                    G.ajax.send("storm_seize", [data.area, data.number, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres['pvType'] = 'fbzc';
                            d.d.fightres.map = G.frame.yingxiong_fight.DATA.map;
                            d.d.fightres.tower = data.tower;
                            G.frame.fight.once("hide", function () {
                                if (d.d.fightres.winside == 0) {
                                    G.frame.fengbaozhanchang.fortress[G.frame.fengbaozhanchang.towerNumber].nodes.tower.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                }
                                G.frame.fight.pvp_end({
                                    id: data.uid,
                                    zhanli: data.zhanli,
                                    rList: G.frame.fight.getHeroHidArr(data.herolist),
                                    lList: G.frame.fight.getMyHidArr(hereList),
                                    result: d.d.fightres.winside,
                                    data: G.frame.fight.getHeroData(d.d.fightres, 0, true),

                                    type: 'fengbaozhanchang'
                                });
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.fight.pvp_start({
                                    id: data.uid,
                                    zhanli: data.zhanli,
                                    rList: G.frame.fight.getHeroHidArr(data.herolist),
                                    lList: G.frame.fight.getMyHidArr(hereList),
                                    type: 'fengbaozhanchang'
                                });
                            }).demo(d.d.fightres);

                            G.frame.fengbaozhanchang.getData(function () {
                                G.frame.fengbaozhanchang.setMyFortress();
                                G.frame.fengbaozhanchang.showVigor();
                                G.frame.fengbaozhanchang.getAreaData(function () {
                                    G.frame.fengbaozhanchang.setFortress();
                                    G.frame.fengbaozhanchang.updateBox();
                                });
                            });

                        }
                    });
                },
                fight_demo: function (node) {
                    var hereList = node.getSelectedData();
                    var data = G.frame.yingxiong_fight.data();

                    G.ajax.send("user_train", [data.data.npcPos, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            X.cacheByUid("fight_demo", hereList);
                            d.d.fightres['pvType'] = 'fight_demo';
                            G.frame.fight.demo(d.d.fightres);
                            G.frame.yingxiong_fight.remove();
                        }
                    });
                },
                pvmaze: function (node) {
                    var hereList = node.getSelectedData();
                    var _data = G.frame.yingxiong_fight.data();

                    var time = G.time;
                    G.frame.maze.mazeChange([_data.data.index, _data.data.step, hereList], function (data) {
                        X.cacheByUid("pvmaze", hereList);
                        data.fightres.pvType = "pvmaze";
                        data.fightres.prize = data.prize;
                        data.fightres.isBoss = G.frame.yingxiong_fight.data().data.isBoss;
                        G.frame.fight.once('show', function () {
                            G.frame.fight.pve_start({
                                stage_id: _data.data.index,
                                stage_name: _data.data.name,
                                pve_id: 'shendianmigong'
                            });
                        }).once('willClose', function () {
                            G.frame.fight.pve_end({
                                stage_id: _data.data.index,
                                stage_name: _data.data.name,
                                mission_start_time: time,
                                stage_result: data.fightres.winside,
                                reward_list: X.arrPirze(data.prize),
                                pve_id: 'shendianmigong'
                            });
                            G.frame.fight.hero_go_on(hereList, data.fightres.winside);
                        }).demo(data.fightres);
                        G.frame.yingxiong_fight.remove();
                        G.hongdian.getData("fashita", 1, function () {
                            G.frame.julongshendian.checkRedPoint();
                            G.frame.maze.checkRedPoint();
                        });
                    }, true);
                },
                lqsl: function (that) {
                    var heroNums = 0;
                    var hereList = that.getSelectedData();
                    for (var key in hereList) {
                        if (key != 'sqid') heroNums++;
                    }
                    if (heroNums < 6) return G.tip_NB.show(L("MLSFQD"));
                    var dd = G.frame.yingxiong_fight.DATA;

                    that.ajax("huodong_use", [dd.hdid, 1, hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid("lqsl", hereList);
                            dd.from.DATA.myinfo = data.d.myinfo;
                            dd.from.DATA.rank = data.d.rank;
                            dd.from.setContents();
                            data.d.fightres.pvType = "lqsl";
                            data.d.fightres.key = dd.key;
                            G.frame.fight.demo(data.d.fightres);
                            G.frame.yingxiong_fight.remove();
                            if (G.frame.huodong.isShow) {
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                            } else {
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                            }
                        }
                    }, true);
                },
                newyear_xrtz: function (that) {
                    var heroNums = 0;
                    var hereList = that.getSelectedData();
                    for (var key in hereList) {
                        if (key != 'sqid') heroNums++;
                    }
                    // if (heroNums < 6) return G.tip_NB.show(L("MLSFQD"));
                    var dd = G.frame.yingxiong_fight.DATA;
                    G.DAO.springfestival.fight(hereList,function (data) {
                        X.cacheByUid("newyear_xrtz", hereList);
                        G.DATA.springfestival.myinfo = data.myinfo;
                        G.DATA.springfestival.rank = data.rank;
                        dd.from.setContents();
                        dd.from.initPhb();
                        dd.from.refreshRedPoint();
                        data.fightres.pvType = "newyear_xrtz";
                        data.fightres.prize = data.prize;
                        data.fightres.key = dd.key;
                        G.frame.yingxiong_fight.remove();
                        G.frame.fight.once('willClose',function () {
                        }).demo(data.fightres);


                    });
                },
                xkfb: function (that) {
                    var dd = G.frame.yingxiong_fight.DATA;
                    var hereList = that.getSelectedData();

                    that.ajax("huodong_use", [dd.hdid, 1, hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid("xkfb", hereList);
                            dd.from.DATA.myinfo = data.d.myinfo;
                            data.d.fightres.pvType = "xkfb";
                            data.d.fightres.prize = data.d.prize;
                            G.frame.fight.once("hide", function () {
                                dd.from.setContents(data.d.fightres.winside);
                            }).demo(data.d.fightres);

                            if (data.d.fightres.winside == 0) {
                                dd.from1.remove();
                            } else {
                                dd.from1.setContents();
                            }

                            G.frame.yingxiong_fight.remove();
                            if (G.frame.huodong.isShow) {
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                    dd.from.checkRedPoint();
                                });
                            } else {
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                            }
                        }
                    }, true);
                },
                syzlb: function (that) {
                    var me = G.frame.yingxiong_fight.DATA;
                    //var fight_troops = me.getFightTroops();
                    var hereList = that.getSelectedData();

                    that.ajax("huodong_use", [me.hdid, 2, me.index, hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid('syzlb', hereList);
                            if (data.d.fightres.winside == 0) {
                                data.d.fightres.prize = [{ a: "item", t: "fightjifen", n: me.prizenum }];
                            }
                            data.d.fightres.pvType = 'syzlb';
                            G.frame.fight.once("show", function () {
                                G.frame.yingxiong_fight.remove();
                            }).once("hide", function () {
                                G.frame.huodong._panels.getData(function () {
                                    G.frame.huodong._panels.setContents();
                                });
                                if (G.frame.huodong.isShow) {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                } else {
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }
                            }).demo(data.d.fightres);
                        }
                    });
                },
                pvwjzz: function (that) {
                    var _data = that._data;
                    var hereList = that.getSelectedData();

                    that.ajax("wjzz_fight", [_data.isSj, hereList, _data.camp], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid('pvwjzz', hereList);
                            data.d.fightres.pvType = 'pvwjzz';
                            data.d.fightres.isSj = _data.isSj;
                            G.frame.fight.once("show", function () {
                                G.frame.yingxiong_fight.remove();
                                if (!_data.isSj) {
                                    G.frame.wujunzhizhan_enemy.getData(function () {
                                        G.frame.wujunzhizhan_enemy.setContents();
                                    });
                                }
                                var toDayFightNum = X.cacheByUid("toDayFight_wuzz") || 0;
                                toDayFightNum++;
                                X.cacheByUid("toDayFight_wuzz", toDayFightNum);
                                G.frame.wujunzhizhan_pk.refresh(function () {
                                    G.event.emit("sdkevent", {
                                        event: "GVG_fight",
                                        data: {
                                            comboNum: G.frame.wujunzhizhan.DATA.data.num,
                                            comboRank: G.frame.wujunzhizhan.DATA.data.rank || -1,
                                            FightNum: toDayFightNum
                                        }
                                    });
                                });
                            }).demo(data.d.fightres);
                        } else {
                            if (!_data.isSj) {
                                G.tip_NB.show(L("wjzz_zf_kill"));
                                G.frame.wujunzhizhan_enemy.remove();
                            }
                            G.frame.yingxiong_fight.remove();
                            G.frame.wujunzhizhan_pk.refresh();
                        }
                    });
                },
                wangzhezhaomu: function (that) {
                    var hereList = that.getSelectedData();
                    that.ajax("wangzhezhaomu_fightboss", [hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid("wangzhezhaomu", hereList);
                            data.d.fightres.pvType = "wangzhezhaomu";
                            //获得的英雄积分奖励前端自己算
                            //自己打的伤害,取区间算出奖励
                            var shanghai = data.d.fightres.dpsbyside[0];
                            var prizedata = G.frame.wangzhezhaomu_main.view.DATA.info.data.openinfo.boss.dpsprize;
                            var jifennum = 0;
                            for (var i = 0; i < prizedata.length; i++) {
                                if (shanghai < prizedata[i].val) {
                                    jifennum = prizedata[i].addjifen;
                                    break;
                                }
                            }
                            var prize = [{ a: "item", t: "sjjf", n: jifennum }];
                            data.d.fightres.prize = prize.concat(data.d.prize);
                            G.frame.fight.once("show", function () {
                                G.frame.yingxiong_fight.remove();
                            }).once("willClose", function () {
                                G.frame.wangzhezhaomu_main.view.getData(function () {
                                    G.frame.wangzhezhaomu_main.view.setContents();
                                    G.frame.wangzhezhaomu_main.view.checkRedPoint();
                                    G.hongdian.getData('wangzhezhaomu', 1, function () {
                                        G.frame.wangzhezhaomu_main.checkRedPoint();
                                    })
                                });
                            }).demo(data.d.fightres);
                        }
                    });
                },
                alaxi: function (that) {
                    var _data = that._data;
                    var hereList = that.getSelectedData();

                    that.ajax("gonghuisiege_fight", [_data.index, _data.city, hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid('alaxi', hereList);
                            data.d.fightres.pvType = 'alaxi';
                            data.d.fightres.jifenchange = data.d.jifeninfo;
                            cc.mixin(G.frame.alaxi_city.DATA, data.d, function (d, s) {
                                if (d == undefined) return undefined;
                                else return s;
                            });
                            G.frame.fight.data({
                                pvType: 'alaxi',
                            }).once("show", function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.alaxi_city.setContents();
                                G.frame.alaxi_main.getData(function () {
                                    G.frame.alaxi_main.setContents();
                                });
                            }).demo(data.d.fightres);
                        }
                    });
                },
                niudanFight: function (that) {
                    var hereList = that.getSelectedData();

                    G.ajax.send("niudan_fight", [hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            X.cacheByUid("niudanFight", hereList);
                            d.d.fightres.prize = d.d.prize;
                            d.d.fightres['pvType'] = 'niudanFight';
                            G.frame.fight.demo(d.d.fightres);
                            G.frame.yingxiong_fight.remove();
                            G.frame.niudan.DATA.myinfo.todayfight++;
                            G.frame.niudan.showTenBtnState();
                        }
                    });
                },
                shilianfight: function (that) {
                    var dd = G.frame.yingxiong_fight.DATA;
                    var hereList = that.getSelectedData();

                    G.ajax.send("herotheme_shilianfight", [dd.data, hereList], function (d) {
                        if (!d) return;
                        d = JSON.parse(d);
                        if (d.s == 1) {
                            G.hongdian.getData('herotheme',1,function () {
                                G.frame.yingxiongzhuti.isShow && G.frame.yingxiongzhuti.checkRedPoint();
                            });
                            X.cacheByUid("shilianfight", hereList);
                            var jifen = [{'a':'special','t':"sljf","n":d.d.addjifen}];
                            var _prize = d.d.prize.concat(jifen);
                            var type = dd.data == 5? 'shilianfight5': 'shilianfight';
                            d.d.fightres.prize = _prize;
                            d.d.fightres['pvType'] = type;
                            G.frame.yxzt_blsl.DATA.shilian = d.d.myinfo.shilian;
                            G.frame.yxzt_blsl.DATA.val = d.d.myinfo.val;
                            G.frame.yxzt_blsl.DATA.jifen = d.d.myinfo.jifen;
                            G.frame.yingxiongzhuti.DATA.myinfo.shilian = d.d.myinfo.shilian;
                            G.frame.yingxiongzhuti.DATA.myinfo.val = d.d.myinfo.val;
                            G.frame.yingxiongzhuti.DATA.myinfo.jifen = d.d.myinfo.jifen;
                            G.frame.yingxiongzhuti.DATA.myinfo.task = d.d.myinfo.task;
                            G.frame.fight.once('willClose',function () {
                                if(d.d.fightres.winside == 0){
                                    G.frame.yxzt_blsl.isShow && G.frame.yxzt_blsl.jiesuoAni(dd.data);
                                }
                                G.frame.yxzt_blsl.setContents();
                                G.frame.yxzt_blsl.setphb();
                            }).demo(d.d.fightres);
                            G.frame.yingxiong_fight.remove();

                        }
                    });
                },
                wyhd: function (that) {
                    var hereList = that.getSelectedData();
                    var dd = G.frame.yingxiong_fight.DATA;

                    that.ajax("labour_fightboss", [false, hereList], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid("wyhd", hereList);
                            // dd.from.DATA.myinfo = data.d.myinfo;
                            // dd.from.DATA.rank = data.d.rank;
                            // dd.from.setContents();
                            data.d.fightres.prize = data.d.prize;
                            data.d.fightres.dlzprize = data.d.dlzprize;
                            data.d.fightres.dps2dlz = G.gc.wyhd.dps2dlz;
                            data.d.fightres.pvType = "wyhd";
                            G.frame.fight.demo(data.d.fightres);
                            G.frame.yingxiong_fight.remove();
                            G.frame.wyhd.getData(function () {
                                G.frame.wyhd_sl.onShow();
                            });
                            G.hongdian.getData('labour', 1, function () {
                                G.frame.wyhd.checkRedPoint();
                            });
                        }
                    }, true);
                },
                lht: function (that) {
                    var hereList = that.getSelectedData();
                    var dd = G.frame.yingxiong_fight.DATA;
                    var myObj = {}
                    var borrowObj = {};
                    cc.each(hereList, function (tid, pos) {
                        if (G.DATA.yingxiong.list[tid] || pos == 'sqid') {
                            myObj[pos] = tid;
                        } else {
                            borrowObj[pos] = tid;
                        }
                    });

                    var time = G.time;
                    that.ajax('lianhunta_fight', [dd.id, myObj, borrowObj], function (str, data) {
                        if (data.s == 1) {
                            X.cacheByUid("lht", myObj);
                            data.d.fightres.pvType = "lht";
                            data.d.fightres.prize = data.d.prize;
                            data.d.fightres.id = dd.id;
                            cc.mixin(G.frame.lianhunta.DATA, data.d.myinfo, true);
                            G.frame.fight.once('show', function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.lianhunta.refreshBtn();
                                G.frame.lianhunta_gk.refreshBtn();
                                G.frame.lianhunta_tz.remove();
                                G.frame.fight.pve_start({
                                    stage_id: dd.id,
                                    stage_name: G.gc.lht[dd.id].name,
                                    pve_id: 'lianhunta'
                                });
                            }).once('willClose', function () {
                                G.frame.fight.pve_end({
                                    stage_id: dd.id,
                                    stage_name: G.gc.lht[dd.id].name,
                                    mission_start_time: time,
                                    stage_result: data.d.fightres.winside,
                                    reward_list: X.arrPirze(data.d.fightres.prize),
                                    pve_id: 'lianhunta'
                                });
                                G.frame.fight.hero_go_on(myObj, data.d.fightres.winside);
                            }).demo(data.d.fightres);

                            G.hongdian.getData('lianhunta', 1, function () {
                                G.frame.lianhunta.checkRedPoint();
                            });
                        }
                    });
                }
            },
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._data = G.frame.yingxiong_fight.DATA;
            me._super('zhandou_kaizhan.json');
        },
        refreshPetBtn: function (data) {
            var me = this;
            if (data) me.DATA.crystal.play = data;
            //神宠按钮显示
            if (X.checkIsOpen("pet") && !X.inArray(me.extConf.noShowPet, me.fightData.pvType) &&
                me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") == -1
            ) {
                me.getPetData(function () {
                    me.nodes.btn_shenchong.show();
                    //剩余的槽位，并有可上阵的宠物
                    var petonfightnum = X.keysOfObject(me.DATA.crystal.play).length;//在阵上的宠物数量
                    var slotopen = G.gc.petcom.base.slotopen;//槽位开放的条件
                    var sitnum = 0;//当前开放的槽位数量
                    for (var m in slotopen) {
                        if (me.DATA.crystal.crystal.rank >= slotopen[m]) sitnum++;
                    }

                    //放按钮特效
                    if (sitnum > petonfightnum && me.checkIsAddPet(sitnum)) {
                        if (me.nodes.btn_shenchong.childrenCount == 0) {
                            G.class.ani.show({
                                json: "ani_shenchong_anniu",
                                addTo: me.nodes.btn_shenchong,
                                repeat: true,
                                autoRemove: false,
                            });
                        }
                    } else {
                        me.nodes.btn_shenchong.removeAllChildren();
                    }
                });
            } else {
                me.nodes.btn_shenchong.hide();
            }
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

            //神宠
            me.nodes.btn_shenchong.setVisible(X.checkIsOpen("pet"));
            me.nodes.btn_shenchong.click(function () {
                if (me.DATA.crystal.crystal.rank == 0 || X.keysOfObject(G.DATA.pet).length == 0) {
                    G.tip_NB.show(L("pettip10"));
                } else {
                    G.frame.sc_order.data("yingxiong").show();
                }
            });

            if (G.frame.jingjichang_freepk.isShow) {
                me.nodes.btn_kz.hide();
                me.nodes.btn_bc.show();
                if (G.frame.yingxiong_fight.data().type) {
                    if (G.frame.yingxiong_fight.data().type == "jjckz") {
                        me.nodes.btn_bc.hide();
                        me.nodes.btn_kz.show();
                    }
                }
            }
            if (me._data.save) {
                me.nodes.btn_kz.hide();
                me.nodes.btn_bc.show();
            }
            if (me.nodes.btn_kz.visible) {
                me.nodes.btn_yj_kz.setTitleText(me.nodes.btn_kz.getTitleText());
                me.nodes.btn_yj_kz.click(function () {
                    me.nodes.btn_kz.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }, 1200);
            }
            if (me.nodes.btn_bc.visible) {
                me.nodes.btn_yj_kz.setTitleText(me.nodes.btn_bc.getTitleText());
                me.nodes.btn_yj_kz.click(function () {
                    me.nodes.btn_bc.triggerTouch(ccui.Widget.TOUCH_ENDED);
                });
            }
            if (X.checkIsOpen("yuanjun") && !X.inArray(me.extConf.noShowYJ, me.fightData.pvType)) {
                me.nodes.btn_kz.hide();
                me.nodes.btn_bc.hide();
            }
            if (me.fightData.kztitle) {
                me.nodes.btn_yj_kz.setTitleText(me.fightData.kztitle);

            }
            me.nodes.panel_yuanjun1.setVisible(X.checkIsOpen("yuanjun") && !X.inArray(me.extConf.noShowYJ, me.fightData.pvType));
            if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {
                me.nodes.btn_kz.show();
                me.nodes.panel_yuanjun1.hide();
                me.ui.finds("Panel_3").hide();
            }
            //阵容保存
            me.nodes.btn_bc.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    //空判断
                    if (me._data.callback && me._data.save) return me._data.callback(me.getSelectedData(), G.frame.yingxiong_fight.bottom.selectedData);
                    var sData = G.frame.yingxiong_fight.bottom.selectedData;
                    if (sData.length < 1) {
                        G.tip_NB.show(L('YX_FIGHT_TIP_1'));
                        return;
                    }
                    var pvData = G.frame.yingxiong_fight.data();
                    console.log('pvType======', pvData.pvType);

                    if (pvData && pvData.pvType && me.extConf.fight[pvData.pvType]) {
                        me.extConf.fight[pvData.pvType](me);
                    } else {
                        var callback = G.frame.yingxiong_fight.DATA.callback;
                        callback && callback(me);
                    }
                }
            });

            //开战
            me.nodes.btn_kz.click(function (sender, type) {
                //空判断
                var sData = G.frame.yingxiong_fight.bottom.selectedData;
                if (sData.length < 1) {
                    G.tip_NB.show(L('YX_FIGHT_TIP_1'));
                    return;
                }
                var pvData = G.frame.yingxiong_fight.data();
                console.log('pvType======', pvData.pvType);
                if (pvData.pvType == "wztt_one") {
                    //望着天梯防止连点
                    me.nodes.btn_yj_kz.setTouchEnabled(false);
                }
                if (pvData && pvData.pvType && me.extConf.fight[pvData.pvType]) {
                    me.extConf.fight[pvData.pvType](me);
                } else {
                    var callback = G.frame.yingxiong_fight.DATA.callback;
                    callback && callback(me);
                }
            }, 1200);

            me.nodes.btn_tishi.click(function () {
                G.frame.shenqi_xuanze.data({
                    sqid: me.sqid,
                    callback: function (id) {
                        me.sqid = id;
                        me.setShenQi();
                        me.checkRedPoint();
                        me.addShenQi(id);
                        G.DATA.fbzc_sqid = id;
                    }
                }).show()
            });

            me.nodes.btn_zxxq.click(function () {
                G.frame.fight_zzkezhi.data(me.zzConf).show();
            });
            me.nodes.panel_yuanjun.hide();
            me.nodes.btn_yj_sz.click(function () {
                if (!me.yj) {
                    me.yj = true;
                    me.nodes.panel_zhuli.hide();
                    me.nodes.panel_yuanjun.show();
                    me.nodes.btn_bangzhu.show();
                } else {
                    me.yj = false;
                    me.nodes.panel_zhuli.show();
                    me.nodes.panel_yuanjun.hide();
                    me.nodes.btn_bangzhu.hide();
                }
                me.showYjBtnState();
            });
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr: L('TS69')
                }).show();
            });

            me.nodes.btn_wdyx.setVisible(X.inArray(me.extConf.showHelp, me.fightData.pvType));
            me.nodes.btn_wdyx.loadTextureNormal('img/lianhunta/btn_wdyx2.png', 1);
            me.nodes.btn_wdyx.click(function (sender) {
                if (!me.showHelp) {
                    if (!G.frame.lianhunta.DATA.borrow) {
                        return G.frame.lianhunta_help.show();
                    }
                    me.showHelp = true;
                    sender.loadTextureNormal('img/lianhunta/btn_wdyx.png', 1);
                    G.frame.yingxiong_fight.bottom.fmtItemList();
                } else {
                    me.showHelp = false;
                    sender.loadTextureNormal('img/lianhunta/btn_wdyx2.png', 1);
                    G.frame.yingxiong_fight.bottom.fmtItemList();
                }
            });
        },
        setShenQi: function () {
            var me = this;
            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                if (itemArr[i].data) {
                    itemArr[i].finds("panel_yx$").getChildren()[0].setArtifact(me.sqid, true);
                }
            }
        },
        addShenQi: function (sqid) {
            var me = this;
            var panel = me.ui.finds("Panel_3").finds("ico_zx$");

            panel.removeBackGroundImage();
            if (me.extConf.sqimg[sqid]) {
                panel.setBackGroundImage("img/shenbing/" + me.extConf.sqimg[sqid] + ".png");
                me.nodes.txt_zx.setString(G.gc.shenqicom.shenqi[sqid].name);
            } else {
                me.nodes.txt_zx.setString(L("SQ"));
            }
        },
        checkRedPoint: function () {
            var me = this;
            me.nodes.btn_tishi.removeChildByTag(999);
            if (!me.sqid && P.gud.artifact) {
                G.class.ani.show({
                    json: "shenbingpeidai_dh",
                    addTo: me.nodes.btn_tishi,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setTag(999);
                    }
                });
            }
        },
        onOpen: function () {
            var me = this;
            me.fightData = G.frame.yingxiong_fight.data();
            me.heroList = JSON.parse(JSON.stringify(G.DATA.yingxiong.list));
            if (me.fightData.heroList) me.heroList = me.fightData.heroList;
            me.bindBTN();
            me.zf = "";
        },
        onShow: function () {
            var me = this;


            if (me.fightData.pvType == "pvshizijun") {
                me.status = G.frame.shizijunyuanzheng.DATA.status;
                me.inStatus = X.keysOfObject(me.status);
            }
            if (me.fightData.pvType == "pvmaze") {
                me.status = G.frame.maze.DATA.data.status || {};
                me.inStatus = X.keysOfObject(me.status);
                me.allHero = G.frame.maze.DATA.hero;
            }
            if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {
                me.allHero = G.class.szn.getHeroData(G.frame.yingxiong_fight.xuanze.fightData.data.hero);
            }
            if (me.fightData.pvType == 'pvwjzz') {
                me.status = G.frame.wujunzhizhan.DATA.status || {};
                me.inStatus = X.keysOfObject(me.status);
            }
            me.refreshPanel();
            me.refreshPetBtn();
        },
        getPl: function (tid) {
            if (this.fightData.pvType != 'pvwjzz') return 0;
            var data = G.frame.wujunzhizhan.DATA.pilao;
            return data[tid] || 0;
        },
        checkIsAddPet: function (len) {
            var fightPet = this.DATA.crystal.play || {};
            if (Object.keys(fightPet).length == len) return false;
            var inFight = [];
            for (var pos in fightPet) {
                inFight.push(G.DATA.pet[fightPet[pos]].pid);
            }
            var petIdPet = {};
            for (var tid in G.DATA.pet) {
                var petData = G.DATA.pet[tid];
                if (!X.inArray(inFight, petData.pid)) {
                    if (!petIdPet[petData.pid]) petIdPet[petData.pid] = 1;
                    else petIdPet[petData.pid]++;
                }
            }
            return len > 0 && Object.keys(petIdPet).length > 0;
        },
        getHeroData: function (tid) {
            var me = this;

            if (me.fightData.pvType != "pvmaze" && me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") == -1) return false;
            for (var i = 0; i < me.allHero.length; i++) {
                if (me.allHero[i].tid == tid) return me.allHero[i];
            }

            return false;
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setAttr();
            me.setBuff();
            me.createLayout();
        },
        //创建6个层容器
        createLayout: function () {
            var me = this;

            var layArr = [me.ui.finds("panel_qp"), me.ui.finds("panel_hp")];
            var lay, herInterval;
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }
            var list = me.nodes.list_yx;
            list.hide();
            me.itemArr = [];

            var scale = 0.8;
            var width = scale * list.width;

            var num = 0;
            for (var i = 0; i < me.extConf.maxnum; i++) {
                var item = list.clone();
                X.autoInitUI(item);
                item.idx = i;
                item.setName(i);
                me.setItem(item);
                item.nodes.img_renwu.loadTexture("img/zhandou/img_zdtx" + (i + 1) + ".png", 1);

                //创建背景item
                var itemBg = list.clone();
                itemBg.setName('bg_' + i);

                if (i < 2) {
                    lay = layArr[0];
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = layArr[1];
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                item.setScale(scale);
                item.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                itemBg.setScale(scale);
                itemBg.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                num++;

                itemBg.finds('img_renwu$').hide();

                lay.addChild(itemBg);
                itemBg.setLocalZOrder(-1);
                itemBg.show();

                lay.addChild(item);
                item.setLocalZOrder(1);
                item.show();
                me.itemArr.push(item);
            }
            //援军ITEM
            var item = list.clone();
            X.autoInitUI(item);
            item.idx = 6;
            item.setName(6);
            me.setItem(item);
            var itemBg = list.clone();
            itemBg.setName('bg_' + 6);
            item.setPosition(me.nodes.panel_yuanjun.width / 2, me.nodes.panel_yuanjun.height / 2);
            itemBg.setPosition(me.nodes.panel_yuanjun.width / 2, me.nodes.panel_yuanjun.height / 2);
            itemBg.finds('img_renwu$').hide();
            me.nodes.panel_yuanjun.addChild(itemBg);
            itemBg.setLocalZOrder(-1);
            itemBg.show();
            me.nodes.panel_yuanjun.addChild(item);
            item.setLocalZOrder(1);
            item.show();
            me.itemArr.push(item);

            me.loadCache();
        },
        //加载缓存
        loadCache: function () {
            var me = this;

            var setCache = function (cache) {
                for (var i = 0; i < me.itemArr.length; i++) {
                    var item = me.itemArr[i];
                    if (cache && cache[i + 1] && me.heroList[cache[i + 1]]) {
                        var tid = cache[i + 1];
                        item.data = tid;
                        var layIco = item.nodes.panel_yx;
                        if (!me.heroList[tid]) continue;
                        var wid = G.class.shero(me.heroList[tid]);
                        wid.setAnchorPoint(0.5, 1);
                        wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                        if (me.sqid) {
                            wid.setArtifact(me.sqid);
                        }
                        layIco.addChild(wid);
                    }
                }
                me.setAttr();
                me.setBuff();
            };

            var type = me.fightData.pvType || me.fightData.type;
            if (me.fightData.defhero) {
                if (Object.keys(me.fightData.defhero).length < 1) me.fightData.defhero = X.cacheByUid("fight_tanxian") || {};
                me.sqid = me.fightData.defhero.sqid;
                setCache(me.fightData.defhero);
            } else {
                switch (type) {
                    case "pvshizijun":
                        cache = X.cacheByUid("fight_shizijun");
                        break;
                    case "jjckz":
                        cache = X.cacheByUid("fight_zyjjc");
                        break;
                    case "hypk":
                        cache = X.cacheByUid("fight_hypk");
                        break;
                    case "hybs":
                        cache = X.cacheByUid("fight_hybs");
                        break;
                    case "ghfb":
                        cache = X.cacheByUid("fight_ghfb");
                        break;
                    case "pvdafashita":
                        cache = X.cacheByUid("fight_fashita");
                        break;
                    case "pvguanqia":
                        cache = X.cacheByUid("fight_tanxian");
                        break;
                    case "pvywzbjf":
                        cache = X.cacheByUid("fight_ywzbjf");
                        break;
                    case "pvywzbjfsd":
                        cache = X.cacheByUid("fight_ywzbjf");
                        break;
                    case "pvywzbzb":
                        cache = X.cacheByUid("fight_ywzbzb");
                        break;
                    case "pvghz":
                        cache = X.cacheByUid("fight_pvghz");
                        break;
                    case "pvmw":
                        cache = X.cacheByUid("fight_pvmw");
                        break;
                    case "pvghtf":
                        cache = X.cacheByUid("fight_pvghtf");
                        break;
                    case "sddl":
                        cache = X.cacheByUid("sddl_" + me.fightData.idx);
                        break;
                    case "fbzc":
                        cache = {};
                        me.sqid = G.DATA.fbzc_sqid;
                        break;
                    case "fight_demo":
                        cache = X.cacheByUid("fight_demo");
                        break;
                    case "pvmaze":
                        cache = X.cacheByUid("pvmaze");
                        break;
                    case "lqsl":
                        cache = X.cacheByUid("lqsl");
                        break;
                    case "newyear_xrtz":
                        cache = X.cacheByUid("newyear_xrtz");
                        break;
                    case "xkfb":
                        cache = X.cacheByUid("xkfb");
                        break;
                    case "wjzz_def":
                        cache = me._data.def;
                        break;
                    case "syzlb":
                        cache = X.cacheByUid("syzlb");
                        break;
                    case "pvwjzz":
                        cache = X.cacheByUid("pvwjzz");
                        break;
                    case "wztt_one":
                        cache = X.cacheByUid("wztt_one");
                        break;
                    default:
                        cache = X.cacheByUid('fight_ready');
                        break;
                    case "wangzhezhaomu":
                        cache = X.cacheByUid("wangzhezhaomu");
                        break;
                    case "alaxi":
                        cache = X.cacheByUid("alaxi");
                        break;
                    case "wyhd":
                        cache = X.cacheByUid("wyhd");
                        break;
                    case "lht":
                        cache = X.cacheByUid("lht");
                        break;
                    case "slzt1":
                        cache = X.cacheByUid("slzt1");
                        break;
                    case "slzt2":
                        cache = X.cacheByUid("slzt2");
                        break;
                    case "slzt3":
                        cache = X.cacheByUid("slzt3");
                        break;
                    case "slzt4":
                        cache = X.cacheByUid("slzt4");
                        break;
                    case "slzt5":
                        cache = X.cacheByUid("slzt5");
                        break;
                    case "slzt6":
                        cache = X.cacheByUid("slzt6");
                        break;
                    case "shilianfight":
                        cache = X.cacheByUid("shilianfight");
                        break;
                    case "alaxi_sd":
                        cache = X.cacheByUid("alaxi_sd");
                        break;
                }
                if (cache && cache.sqid) {
                    me.sqid = cache.sqid;
                }
                if (((cache && X.keysOfObject(cache).length < 1) || !cache) &&
                    !X.inArray(["wztt_one", "pvguanqia", "fbzc", "pvshizijun", "sddl", "pvmaze", 'lqsl', 'pvwjzz', 'wyhd',
                        'lht', "slzt1", "slzt2", "slzt3", "slzt4", "slzt5", "slzt6","shilianfight"], type) && type && type.indexOf("sznfight") == -1) {
                    cache = X.cacheByUid("fight_tanxian") || {};
                }
                // if(type && type.indexOf("sznfight") != -1){
                //     cache = X.cacheByUid(type) || {}
                // }
                me.checkRedPoint();
                if (!X.inArray(["pvshizijun", "pvmaze", 'pvwjzz', 'pvwjzz'], me.fightData.pvType) && type && type.indexOf("sznfight") == -1) {
                    setCache(cache);
                } else {
                    var zhanweiCache = (me.fightData.pvType == "pvshizijun" ? X.cacheByUid("fight_shizijun") : X.cacheByUid("pvmaze")) || {};
                    if (me.fightData.pvType == "pvwjzz") {
                        zhanweiCache = X.cacheByUid("pvwjzz") || {};
                    }
                    if(type && type.indexOf("sznfight") != -1){
                        zhanweiCache = X.cacheByUid(type) || {}
                    }
                    for (var i in zhanweiCache) {
                        if (zhanweiCache[i]) {
                            if (X.inArray(me.inStatus, zhanweiCache[i]) && me.status[zhanweiCache[i]].hp <= 0) {
                                zhanweiCache[i] = undefined;
                            }
                            if (me.getPl(zhanweiCache[i]) >= 5) {
                                zhanweiCache[i] = undefined;
                            }
                        }
                    }
                    for (var i = 0; i < me.itemArr.length; i++) {
                        var item = me.itemArr[i];
                        if (zhanweiCache && zhanweiCache[i + 1] &&
                            (me.heroList[zhanweiCache[i + 1]] && (me.heroList[zhanweiCache[i + 1]].lv > 39 || me.fightData.pvType == "pvwjzz"))
                            || (me.getHeroData(zhanweiCache[i + 1]))) {
                            var tid = zhanweiCache[i + 1];
                            item.data = tid;
                            var layIco = item.nodes.panel_yx;
                            layIco.removeAllChildren();
                            var heroData = me.heroList[tid] || me.getHeroData(tid);
                            var wid = G.class.shero(heroData, null, null, me.heroList[tid] ? false : true);
                            if (me.sqid) {
                                wid.setArtifact(me.sqid);
                            }
                            if (X.inArray(me.inStatus, tid)) {
                                if (me.status[tid].hp <= 0) break;
                                var hp = 0;
                                if (me.status[tid].maxhp != undefined) {
                                    hp = me.status[tid].hp / me.status[tid].maxhp * 100;
                                } else {
                                    hp = me.status[tid].hp;
                                }
                                wid.setHP(hp, true);
                            } else if(type && type.indexOf("sznfight") == -1){
                                wid.setHP(100, true);
                            }
                            wid.setAnchorPoint(0.5, 1);
                            wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                            layIco.addChild(wid);
                        }
                    }
                    me.setAttr();
                    me.setBuff();
                }
            }
            me.addShenQi(me.sqid);
        },
        setItem: function (item) {
            var me = this;

            X.autoInitUI(item);

            var layIco = item.nodes.panel_yx;

            if (item.data) {
                delete item.data;
            }
            layIco.setTouchEnabled(false);
            layIco.removeAllChildren();
            //lay.getTouchMovePosition()
            // imgAdd.show();

            item.setTouchEnabled(true);

            var bPos, cloneItem, pos;
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    if (sender.data && sender.idx != 6) {
                        bPos = sender.getTouchBeganPosition();
                        var firstParent = sender.getParent();

                        var firstPos = firstParent.convertToWorldSpace(sender.getPosition());
                        pos = me.ui.convertToNodeSpace(firstPos);
                        cloneItem = me.cloneItem = sender.clone();
                        cloneItem.touch(function (cl, ty) {
                            if (ty == ccui.Widget.TOUCH_NOMOVE) {
                                cl.removeFromParent();
                                item.setTouchEnabled(false);
                                me.removeItem(sender.data);
                                item.show();
                            }
                        });
                        cloneItem.data = sender.data;
                        sender.hide();
                        cloneItem.setPosition(cc.p(pos));
                        me.ui.addChild(cloneItem);
                        // cloneItem.
                        //给clone头像加动画
                        if (!sender.finds('star_1')) {
                            cloneItem.finds('panel_xx').removeAllChildren();
                            G.class.ani.show({
                                json: "ani_10xingsaoguang",
                                addTo: cloneItem.finds('panel_xx'),
                                x: cloneItem.finds('panel_xx').width / 2,
                                y: cloneItem.finds('panel_xx').height / 2,
                                repeat: true,
                                autoRemove: false,
                            });
                            me.yx1 = true;
                        } else {
                            me.yx1 = false;
                        }
                    }
                } else if (type == ccui.Widget.TOUCH_MOVED) {
                    if (sender.data && sender.idx != 6) {
                        var mPos = sender.getTouchMovePosition();
                        var offset = cc.p(mPos.x - bPos.x, mPos.y - bPos.y);

                        cloneItem.setPosition(cc.p(pos.x + offset.x, pos.y + offset.y));

                    }
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (sender.data && sender.idx != 6) {

                        var isCollision = me.checkItemsCollision(cloneItem);
                        if (isCollision && !isCollision.finds('star_1')) {
                            me.yx2 = true;
                        } else {
                            me.yx2 = false;
                        }
                        if (isCollision != null) {
                            me.changeItem(sender, isCollision);
                        }

                        if (me.cloneItem) {
                            me.cloneItem.removeFromParent();
                            delete me.cloneItem;
                        }
                        sender.show();
                    }
                } else if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //卸下英雄
                    if (sender.data) {
                        item.setTouchEnabled(false);
                        me.removeItem(sender.data);
                    }
                }

            });
        },
        removeItem: function (tid, noAni) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item.nodes.panel_yx;
                // var imgAdd = item.nodes.img_add;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.yingxiong_fight.bottom.selectedData, tid);
                    if (idx > -1) {
                        G.frame.yingxiong_fight.bottom.selectedData.splice(idx, 1);
                        G.frame.yingxiong_fight.bottom.removeGou(tid);
                        // me.ui.setTimeout(function () {
                        //
                        // },180);
                    }

                    if (!noAni) {
                        var child = G.frame.yingxiong_fight.bottom.getChildByTid(tid);
                        if (child) {
                            G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                            G.frame.yingxiong_fight.posSelect.x += child.width / 2;
                        }

                        //移动动画所需数据
                        if (cc.isNode(G.frame.yingxiong_fight.item)) {
                            G.frame.yingxiong_fight.item.stopAllActions();
                            G.frame.yingxiong_fight.item.removeFromParent();
                        }
                        G.frame.yingxiong_fight.playAniType = 'remove';
                        G.frame.yingxiong_fight.posSz = G.frame.yingxiong_fight.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                        var itemClone = G.frame.yingxiong_fight.item = layIco.clone();
                        itemClone.setPosition(G.frame.yingxiong_fight.posSz);
                        G.frame.yingxiong_fight.ui.addChild(itemClone);
                        G.frame.yingxiong_fight.playAniMove(itemClone);
                    }

                    delete item.data;
                    layIco.removeAllChildren();
                    // imgAdd.show();
                    me.setAttr();
                    me.setBuff();
                }
            }
        },
        addItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            var start = me.yj ? 6 : 0;
            var end = me.yj ? 7 : 6;
            for (var i = start; i < end; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = tid;
                    item.setTouchEnabled(true);
                    var layIco = item.nodes.panel_yx;
                    // var imgAdd = item.nodes.img_add;
                    if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {

                        var wid = G.class.shero(me.getHeroData(tid), null, null, me.heroList[tid] ? false : true);
                    } else {

                        var wid = G.class.shero(me.fightData.pvType == "pvmaze" ? me.getHeroData(tid) : me.heroList[tid], null, null, me.heroList[tid] ? false : true);
                    }
                    wid.setAnchorPoint(0.5, 1);
                    wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                    if (me.sqid) {
                        wid.setArtifact(me.sqid);
                    }
                    if (X.inArray(["pvshizijun", "pvmaze"], me.fightData.pvType)) {
                        if (X.inArray(me.inStatus, tid)) {
                            var hp = 0;
                            if (me.status[tid].maxhp != undefined) {
                                hp = me.status[tid].hp / me.status[tid].maxhp * 100;
                            } else {
                                hp = me.status[tid].hp;
                            }
                            wid.setHP(hp, true);
                        } else {
                            wid.setHP(100, true);
                        }
                    }
                    layIco.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);
                    me.setWidHelpState(wid);
                    G.frame.yingxiong_fight.playAniType = 'add';
                    G.frame.yingxiong_fight.posSz = G.frame.yingxiong_fight.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    G.frame.yingxiong_fight.posSz.x -= layIco.width / 2;

                    // imgAdd.hide();
                    me.setAttr();
                    me.setBuff();
                    break;
                }
            }
        },
        setWidHelpState: function (wid) {
            var me = this;

            if (G.frame.yingxiong_fight.isHelp && !G.DATA.yingxiong.list[wid.data.tid]) {
                var helpImg = new ccui.ImageView('img/lianhunta/img_zj.png', 1);
                helpImg.setAnchorPoint(0.5, 0.5);
                wid.addChild(helpImg);
                helpImg.setPosition(wid.width - helpImg.width / 2, helpImg.height / 2);
            }
        },
        getSelectedData: function () {
            var me = this;

            var itemArr = me.itemArr;
            var obj = {};
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (item.data) {
                    obj[item.idx + 1] = item.data;
                }
            }

            if (me.sqid) {
                obj.sqid = me.sqid;
            }

            return obj;
        },
        setAttr: function () {
            var me = this;
            if (G.frame.yingxiong_fight.bottom._data.pvType && G.frame.yingxiong_fight.bottom._data.pvType.indexOf("sznfight") != -1) {
                me.ui.finds("panel_djs").hide();
                return
            }
            var sData = G.frame.yingxiong_fight.bottom.selectedData || [];
            var zhanli = 0;
            for (var i = 0; i < sData.length; i++) {
                var tid = sData[i];
                var hData = me.fightData.pvType == "pvmaze" ? me.getHeroData(tid) : me.heroList[tid];
                zhanli += hData.zhanli;
            }

            me.nodes.txt_djs.setString(zhanli);
            me.showYjBtnState();
        },
        showYjBtnState: function () {
            var me = this;

            if (me.yj) {
                me.nodes.btn_yj_sz.setTitleText(L("TZZL"));
            } else {
                if (me.itemArr && me.itemArr[6].data) {
                    me.nodes.btn_yj_sz.setTitleText(L("TZYJ"));
                } else {
                    me.nodes.btn_yj_sz.setTitleText(L("SZYJ"));
                }
            }
        },
        //获得选择数据种族对应的数量
        getZz2Num: function () {
            var me = this;

            var sData = G.frame.yingxiong_fight.bottom.selectedData || [];

            var obj = {};
            for (var i = 0; i < sData.length; i++) {
                var id = sData[i];
                if (me.fightData.pvType == "pvmaze") {

                    var heroData = me.getHeroData(id)
                } else if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {
                    var heroData = me.getHeroData(id)

                } else {
                    var heroData = me.heroList[id];

                }
                obj[heroData.zhongzu] = obj[heroData.zhongzu] || 0;
                obj[heroData.zhongzu]++;
            }

            return obj;
        },
        setBuff: function () {
            var me = this;
            var zzConf = me.zzConf = {};
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);
            var zz2num = me.getZz2Num();

            for (var i = 0; i < keys.length; i++) {
                var data = G.class.zhenfa.getById(keys[i]).data;

                for (var j = 0; j < data.length; j++) {
                    var isOk = true;
                    var cond = data[j].cond;

                    for (var zz in cond) {
                        if (!zz2num[zz] || zz2num[zz] < cond[zz]) {
                            isOk = false;
                            break;
                        }
                    }

                    if (isOk) {
                        zzConf[keys[i]] = j;
                    }
                }
            }
            var zzdata = [];
            for (var i in zzConf) {
                var obj = {};
                obj.zz = i;
                obj.lv = zzConf[i];
                zzdata.push(obj);
            }

            zzdata.sort(function (a, b) {
                if (a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else {
                    return a.zz > b.zz ? -1 : 1;
                }
            });


            me.nodes.list_zf.hide();
            var arr = me.arr = [];
            var zzkeys = X.keysOfObject(zzdata);

            for (var i = 0; i < 3; i++) {
                (function (data) {
                    var list = me.nodes.list_zf.clone();
                    X.autoInitUI(list);
                    list.show();

                    if (data) {
                        if (zzdata[data].zz == 1) {
                            list.nodes.panel_top.hide();
                        } else {
                            list.nodes.panel_top.show();
                            list.nodes.txt_top.setString(zzdata[data].lv + 1);
                        }
                        list.nodes.ico_zx.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(zzdata[data].zz) + '.png', 1);
                    } else {
                        if (i != 0) list.hide();
                        list.nodes.ico_zx.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                    }

                    list.nodes.ico_zx.click(function () {
                        G.frame.fight_zzkezhi.data(zzConf).show();
                    });
                    arr.push(list);
                })(zzkeys[i]);
            }
            me.nodes.zckz = arr[0].nodes.ico_zx;
            X.left(me.nodes.panel_cx, arr, 1, 5, 1);
        },
        // 检测碰撞内容，如果有合适的，返回item
        checkItemsCollision: function (cloneItem) {
            var me = this;

            var itemsArr = me.itemArr;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.data != item.data && item.idx != 6) {
                    var pos = item.getParent().convertToNodeSpace(cloneItem.getParent().convertToWorldSpace(cloneItem.getPosition()));
                    if (cc.rectContainsPoint(item.getBoundingBox(), pos)) {
                        return item;
                    }
                }
            }

            return null;
        },
        //交换头像和数据
        changeItem: function (item1, item2) {
            var me = this;

            if (!item1.data) return;

            var tid1 = item1.data;
            var tid2 = item2.data;

            item1.nodes.panel_yx.removeAllChildren();
            item2.nodes.panel_yx.removeAllChildren();
            item1.setTouchEnabled(true);
            item2.setTouchEnabled(true);
            if (tid2) {
                item2.data = tid1;
                item1.data = tid2;

                var wid = G.class.shero((me.fightData.pvType == "pvmaze" || me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1)? me.getHeroData(tid2) : me.heroList[tid2], null, null, me.heroList[tid2] ? false : true);
                wid.setAnchorPoint(0.5, 1);
                wid.setPosition(cc.p(item1.nodes.panel_yx.width / 2, item1.nodes.panel_yx.height));
                item1.nodes.panel_yx.addChild(wid);
                wid.setArtifact(me.sqid);
                if (X.inArray(["pvshizijun", "pvmaze"], me.fightData.pvType)) {
                    if (me.status[tid2]) {
                        if (me.status[tid2].maxhp != undefined) {
                            wid.setHP(me.status[tid2].hp / me.status[tid2].maxhp * 100, true);
                        } else {
                            wid.setHP(me.status[tid2].hp, true);
                        }
                    } else {
                        wid.setHP(100, true);
                    }
                }
                me.setWidHelpState(wid);

                var wid1 = G.class.shero((me.fightData.pvType == "pvmaze" || me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1)? me.getHeroData(tid1) : me.heroList[tid1], null, null, me.heroList[tid1] ? false : true);
                wid1.setAnchorPoint(0.5, 1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx.width / 2, item2.nodes.panel_yx.height));
                item2.nodes.panel_yx.addChild(wid1);
                wid1.setArtifact(me.sqid);
                if (X.inArray(["pvshizijun", "pvmaze"], me.fightData.pvType)) {
                    if (me.status[tid1]) {
                        if (me.status[tid1].maxhp != undefined) {
                            wid1.setHP(me.status[tid1].hp / me.status[tid1].maxhp * 100, true);
                        } else {
                            wid1.setHP(me.status[tid1].hp, true);
                        }
                    } else {
                        wid1.setHP(100, true);
                    }
                }
                me.setWidHelpState(wid1);

            } else {
                item1.data = undefined;
                item2.data = tid1;

                var wid1 = G.class.shero((me.fightData.pvType == "pvmaze" || me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1)? me.getHeroData(tid1) : me.heroList[tid1], null, null, me.heroList[tid1] ? false : true);
                wid1.setAnchorPoint(0.5, 1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx.width / 2, item2.nodes.panel_yx.height));
                item2.nodes.panel_yx.addChild(wid1);
                wid1.setArtifact(me.sqid);
                if (X.inArray(["pvshizijun", "pvmaze"], me.fightData.pvType)) {
                    if (me.status[tid1]) {
                        if (me.status[tid1].maxhp != undefined) {
                            wid1.setHP(me.status[tid1].hp / me.status[tid1].maxhp * 100, true);
                        } else {
                            wid1.setHP(me.status[tid1].hp, true);
                        }
                    } else {
                        wid1.setHP(100, true);
                    }
                }
                me.setWidHelpState(wid1);
            }
        },
        //拿到宠物数据
        getPetData: function (callback) {
            var me = this;
            me.ajax("pet_open", [0], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.DATA.crystal.play = me.DATA.crystal.play || {};//槽位上的神宠
                    me.DATA.crystal.crystal = me.DATA.crystal.crystal || {};
                    me.DATA.crystal.crystal.lv = me.DATA.crystal.crystal.lv || 0;
                    me.DATA.crystal.crystal.rank = me.DATA.crystal.crystal.rank || 0;
                    callback && callback();
                }
            });
        },
    });

})();