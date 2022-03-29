/**
 * Created by wfq on 2018/6/15.
 */
(function () {
    //游戏中的全局监听事件

    //日期更迭时刷新主界面UI
    G.event.on('dayChange', function (d) {
        if (!d) return;

        // G.mainMenu.ui.setTimeout(function () {
        //     G.mainMenu.getBtnsListFromSer();
        // },1000);
        if(!G.view.mainView) return;
        cc.director.getRunningScene().setTimeout(function () {
            G.view.mainView.getAysncBtnsData(function(){
                G.view.mainView.allBtns["lefttop"] = [];
                G.view.mainView.setSvrBtns();
            }, false);

            G.event.emit("dayChangeOver");
        }, 5000);
        X.cacheByUid("dmj_bj", 0);
        X.cacheByUid("dmj_jumpFight", 0);
        X.cacheByUid("ghtanhe",0);
        X.cacheByUid("todayTipRed", 0);
        X.cacheByUid("chouka_hint", 0);
        X.cacheByUid("chouka1_hint", 0);
        X.cacheByUid("rmbbuy", 0);
        X.cacheByUid("diaowenHint", 0);
        X.cacheByUid("showToDayUseItemRedPoint", 0);
        X.cacheByUid("zbjfsd", 0);
        X.cacheByUid("petAddSpeed", 0);
        X.cacheByUid("toDayFight_wuzz", 0);
        X.cacheByUid("wztt_hint", 0);
        X.cacheByUid("zhongqiuWorkshop", 0);
        X.cacheByUid("yuandanWorkshop", 0);
        X.cacheByUid("lookGameVideo", 0);
        X.cacheByUid('duihuan_byday',0);
        X.cacheByUid('openteheGz',0);
        G.hongdian.getHongdian(1);


    });

    G.event.on('newDay', function () {

        X.cacheByUid("dmj_bj", 0);
        X.cacheByUid("dmj_jumpFight", 0);
        X.cacheByUid("ghtanhe",0);
        X.cacheByUid("todayTipRed", 0);
        X.cacheByUid("chouka_hint", 0);
        X.cacheByUid("chouka1_hint", 0);
        X.cacheByUid("rmbbuy", 0);
        X.cacheByUid("diaowenHint", 0);
        X.cacheByUid("showToDayUseItemRedPoint", 0);
        X.cacheByUid("zbjfsd", 0);
        X.cacheByUid("petAddSpeed", 0);
        X.cacheByUid("toDayFight_wuzz", 0);
        X.cacheByUid("wztt_hint", 0);
        X.cacheByUid("alaxi_fresh", 0);
        X.cacheByUid("zhongqiuWorkshop", 0);
        X.cacheByUid("yuandanWorkshop", 0);
        X.cacheByUid("lookGameVideo", 0);
    });

    //特定小时时更新主界面ui
    G.event.on('hourChange', function (d) {
        if (!d) return;

        var newDay = d.n;
        var hour = newDay.getHours();

        if (cc.isNode(G.view.mainView) && hour % 2 == 0) {//刷新主城事件动画
            G.view.mainView.getMainCityEvent();
        }
        if (cc.isNode(G.view.mainView)) {
            G.view.mainView.checkYJXW();
        }
    });
    //特定分钟时更新主界面ui
    G.event.on('minuteChange', function (d) {
        if (!d) return;
        // var newDay = d.n;
        if(G.view.mainView){
            G.hongdian.getData("guajitime", 1, function () {
                G.hongdian.getData("tanxian", 1, function () {
                    G.hongdian.checkTX();
                });
                if(G.frame.tanxian.isShow){
                    if(G.DATA.hongdian.guajitime > 0){
                        G.setNewIcoImg(G.frame.tanxian.nodes.btn1_on, .8);
                    }
                    G.removeNewIco(G.view.mainMenu.nodes.btn_tanxian);
                }
            });
            if (P.gud && X.checkIsOpen("pet") && P.gud.lv >= 5) {
                G.hongdian.getData("pet", 1);
            }
        }
    });

    //登录完成后的事件处理
    G.event.on('loginOver', function () {
        X.cacheByUid('jdsdhd',0);
        G.view.mainView.getAysncBtnsData(function () {
            G.view.mainView.setSvrBtns();
            G.view.mainView.nodes.panel_kfkh.hide();
            G.view.mainView.nodes.panel_sc.hide();
            G.view.mainView.updateLeftBtnPos();
        });
    });

    G.event.on("dayChangeOver", function () {

        if (G.frame.juewei.isShow) {
            G.frame.juewei.getBuyNum(function () {
                G.frame.juewei.checkRedPoint();
                if (G.frame.juewei_tqlb.isShow) G.frame.juewei_tqlb.remove();
            });
        }
        //如果在阿拉希战场界面，就直接退出回到主城
        if(G.frame.alaxi_main.isShow && G.time >= X.getLastMondayZeroTime() && G.time <= X.getLastMondayZeroTime()+10){//避免有几秒钟的延迟
            G.tip_NB.show(L('GONGHUIFIGHT34'));
            X.uiMana.closeAllFrame();
        }
    });

    G.event.on('sendApi', function (data) {
        //cc.log(data);

        switch (data.api) {
            case 'huodong_open':
                var hdid = data.args[0];
                if (G.DATA.hdObj[hdid]) {
                    try{
                        G.event.emit("leguXevent", {
                            type: 'track',
                            event: 'join_activity',
                            data: {
                                activity_id: hdid.toString(),
                                activity_name: G.DATA.hdObj[hdid].name,
                                activity_type: G.DATA.hdObj[hdid].stype
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }
                break;
            case 'wenwu_upgrade':
                var oldData = G.frame.kaogu_main.wwDATA.data[data.args[0]][data.args[1]];
                  try{
                    G.event.emit("leguXevent", {
                        type: 'track',
                        event: 'yangcheng_level_up',
                        data: {
                            yangcheng_type: "kaogu",
                            yangcheng_id: data.args,
                            original_level: oldData,
                            now_level:oldData + 1
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
                break;
            case 'huodong_use':
                var hdid = data.args[0];
                if (G.DATA.hdObj[hdid] && data.d.d.prize) {
                    try{
                        G.event.emit("leguXevent", {
                            type: 'track',
                            event: 'complete_activity',
                            data: {
                                activity_id: hdid.toString(),
                                activity_name: G.DATA.hdObj[hdid].name,
                                reward_list: X.arrPirze(data.d.d.prize),
                                activity_type: G.DATA.hdObj[hdid].stype
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }
                break;
            case 'task_receive':
                try{
                    var taskId = data.args[1];
                    var taskType = data.args[0];
                    var taskConf = G.gc.task[taskId];
                    G.event.emit("leguXevent", {
                        type: 'track',
                        event: 'mission_complete',
                        data: {
                            mission_id: taskId,
                            mission_name: X.STR(taskConf.title, taskConf.pval),
                            mission_type: taskType,
                            reward_list: X.arrPirze(data.d.d.prize)
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
                break;
            case 'jitan_chouka':
                try {
                    var conf = G.gc.chouka[data.args[0]];
                    G.event.emit("leguXevent", {
                        type: 'track',
                        event: 'summon',
                        data: {
                            summon_genre: conf.name,
                            summon_type: conf.number,
                            summon_cost_num: conf.need[0].n,
                            summon_cost_type: conf.need[0].a,
                            item_list: X.arrPirze(data.d.d.prize),
                        }
                    });
                } catch (e) {
                    cc.error(e);
                }
                break;
            case 'artifact_lvup':
                var sqid = data.args[0];
                var type = data.args[1];
                var curLv = data.d.d.lv;
                var curJxLv = data.d.d.jxlv;
                if (type == 'lv') {
                    G.event.emit('yangcheng_point', {
                        type: '_level_up',
                        data: {
                            type: 'shenqi',
                            oldLv: curLv - 1,
                            curLv: curLv
                        }
                    }, {
                        yangcheng_id: sqid
                    });
                } else if (type == 'jxlv') {
                    G.event.emit('yangcheng_point', {
                        type: 'wake_up',
                        data: {
                            type: 'shenqi',
                            oldLv: curJxLv - 1,
                            curLv: curJxLv
                        }
                    }, {
                        yangcheng_id: sqid
                    });
                }
                break;
            case 'artifact_recast':
                var sqid = data.args[0];
                G.event.emit('yangcheng_point', {
                    type: '_reset',
                    data: {
                        type: 'shenqi',
                        oldLv: G.DATA.shenqi.artifact[sqid].lv,
                        curLv: 1
                    }
                }, {
                    reward_list: X.arrPirze(data.d.d.prize),
                    yangcheng_id: sqid
                });
                break;
            case 'ghkeji_lvup':
                var job = data.args[0];
                var pos = data.args[1];
                var addLv = data.args[2] == true ? 5 : 1;
                var curLv = data.d.d;
                G.event.emit('yangcheng_point', {
                    type: '_level_up',
                    data: {
                        type: 'gonghuikeji',
                        oldLv: curLv - addLv,
                        curLv: curLv
                    }
                }, {
                    yangcheng_id: job + '_' + pos
                });
                break;
            case 'ghkeji_clear':
                G.event.emit('yangcheng_point', {
                    type: '_reset',
                    data: {
                        type: 'gonghuikeji'
                    }
                }, {
                    reward_list: X.arrPirze(data.d.d.prize),
                    yangcheng_id: data.args[0]
                });
                break;
            case 'hero_tyupgrade':
                var curLv = data.d.d.data.mylv;
                G.event.emit('yangcheng_point', {
                    type: '_level_up',
                    data: {
                        type: 'tongyu',
                        oldLv: curLv - 1,
                        curLv: curLv
                    }
                }, {
                    yangcheng_id: data.args[0]
                });
                break;
            case 'title_lvup':
                var curLv = P.gud.title;
                G.event.emit('yangcheng_point', {
                    type: '_level_up',
                    data: {
                        type: 'juewei',
                        oldLv: curLv - 1,
                        curLv: curLv
                    }
                });
                break;
            case 'mjhj_up':
                var curLv = data.d.d.lv;
                G.event.emit('yangcheng_point', {
                    type: '_level_up',
                    data: {
                        type: 'huijuan',
                        oldLv: data.d.d.info[data.args[0]].lv - 1,
                        curLv: data.d.d.info[data.args[0]].lv 
                    },
                    
                }, {
                  yangcheng_id:data.args[0],
                  
                });
            break;
            case "shipin_awake":
              var info = data.d.d.awake;
              var keys = X.keysOfObject(info)[0];
              G.event.emit('yangcheng_point', {
                  type: 'xilian',
                  data: {
                    type: 'shipin',
                    oldLv: 0,
                    curLv: 0
                  },
                  
              }, {
                yangcheng_id:keys.split("_")[0],
                jineng_idqian: keys.split("_")[1],
                jineng_idhou: info[keys].id,
                reward_list:X.arrPirze(G.gc.shipincom.awake.need[0])
              });
            case "shipin_back":
              G.event.emit('yangcheng_point', {
                  type: 'chongzhi',
                  data: {
                    type: 'shipin',
                    oldLv: 0,
                    curLv: 0
                  },
                  
              }, {
                yangcheng_id: data.args[0].split("_")[0],
                now_quality:G.gc.shipin[data.args[0].split("_")[0]].color,
                reward_list:X.arrPirze(data.d.d.prize)
              });
            case "shipin_fenjie":
              G.event.emit('yangcheng_point', {
                  type: 'fenjie',
                  data: {
                    type: 'shipin',
                    oldLv: 0,
                    curLv: 0
                  },
                  
              }, {
                yangcheng_id: data.args[0],
                now_quality:G.gc.shipin[data.args[0]].color,
                reward_list:X.arrPirze(G.gc.shipin[data.args[0]].fjprize)
              });
            case 'pet_crystal':
                if (data.args[0] == 'lv') {
                    var curLv = data.d.d.lv;
                    G.event.emit('yangcheng_point', {
                        type: '_level_up',
                        data: {
                            type: 'chongwushuijing',
                            oldLv: curLv - 1,
                            curLv: curLv
                        }
                    });
                }
                break;
            case 'pet_breakdown':
                var tidArr = data.args;
                tidArr.forEach(function (tid) {
                  var _data = G.DATA.oldPet[tid];
                  if (_data) {
                    G.event.emit('yangcheng_point', {
                      type: '_level_fenjie',
                      data: {
                          type: 'chongwu',
                          xilian_id: _data.lv,
                          reward_list:X.arrPirze(data.d.d.prize)
                      }
                    }, {
                      yangcheng_id: _data.pid
                    });
                  }
                })
                break;
            case 'pet_upgrade':
                var tid = data.args[0];
                var petData = G.DATA.pet[tid];
                var conf = G.gc.pet[petData.pid];
                G.event.emit('yangcheng_point', {
                    type: '_level_up',
                    data: {
                        type: 'chongwu',
                        oldLv: petData.lv - 1,
                        curLv: petData.lv,
                        color: conf.color
                    }
                }, {
                    yangcheng_id: tid
                });
                break;
        }
    });
})();