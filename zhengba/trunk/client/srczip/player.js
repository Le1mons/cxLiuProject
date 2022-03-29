var P = {};
(function(){
    G.class.player = {};
    //初始化值
    G.class.player.init = function(d){
        P = {};
        G.DATA.P = {};
		G.DATA.heroPoint = {};

        if(typeof(d)=='string'){
            d = X.toJSON(d);    
        }
        cc.log('init',d);
        G.oldGud = d.gud;
        if(d.ntime)G.time=d.ntime;
        for(var k in d){
            if(k=='api')continue;
            P[k] = d[k];
        }
        G.oldGud = P.gud;
        G.event.emit('playerInit',d);
    };
    //更新
    //G.class.player.update = function(o){
    //  if(!P.gud)return;
    //  for(var k in o){
    //      if(k=='lv'){
    //          //等级变化时广播事件
    //          G.event.emit('playerLvup',{
    //              'olv':P.gud[k],
    //              'lv':o[k]
    //          });
    //      }
    //      P.gud[k] = o[k];
    //  }
    //};



    G.event.on('attrchange',function(d,conf,formInfo) {
        if (!d) return;
        G.event.emit("default_attrchange",d,conf,formInfo);
        var d = X.toJSON(d);
        var tips = [];
        var oldGud = G.oldGud = JSON.parse(JSON.stringify(P.gud));
        G.DATA.islvChange = false;
        for(var k in d) {
            if(k=='api')continue;
            P.gud[k] = d[k];
            G.event.emit(k + '_change',{o:oldGud[k],n:d[k]});
            G.DATA.P["old_" + k] = oldGud[k];
            G.DATA.P["new_" + k] = d[k];
            switch (k) {
                case 'rmbmoney':
                case 'jinbi':
                case 'useexp':
                // case 'gangtie':
                // case 'shuijing':
                // case 'dianneng':
                // case 'mohun':
                // case 'rongyu':
                // case 'gongxian':
                // case 'jinghua':
                // case 'jinglian':
                // case 'zuier':
                // case 'jingti':
                    if (!d.noshow && d[k] - oldGud[k] < 0) {
                        //tips.push(G.gc.COLOR[5] + '|' + G.class.attricon.getById(k).name + ' ' + '-' + Math.abs(d[k] - oldGud[k]));
                    }
                    G.event.emit('currencyChange');
                    break;
                case 'nexp'://经验变化时
                    G.event.emit('playerNexpChange',{
                        'onexp':oldGud[k],
                        'nexp':d[k]
                    });
                    break;
                case 'lv'://等级变化时
                    //tips.push(G.gc.COLOR[1] + '|' + X.STR(L('LV_UP'),d[k]));
                    G.DATA.islvChange = true;

                    G.event.emit('playerLvup',{
                        code:d.api,
                        'olv':oldGud[k],
                        'lv':d[k]
                    });
                    G.event.on('lvup_redpoint',function (expsource) {
                        G.event.emit('sdkevent',{
                            event:'lvup',
                            data:{
                                oldLv:oldGud[k],
                                expSource:expsource,
                            }
                        });
                    });
                    var oldLv = oldGud.lv;
                    var curLv = d.lv;
                    if (oldLv < 23 && curLv >= 23) {
                        G.view.mainView.getAysncBtnsData(null, false, ['ciridenglu']);
                    }
                    break;
                case 'zhanli'://战力
                    G.event.emit('playerZhanliChange',{
                        code:d.api,
                        'ov':oldGud[k],
                        'nv':d[k]
                    });
                    break;
                case 'maxzhanli'://最大战力变化
                    if (P.gud.maxzhanli > G.oldGud.maxzhanli && (G.frame.kaogu_main.isShow)) {//目前只说在考古里提示最强战力的变化,武魂战力变化提示
                        G.frame.kaogu_main.showzhanlichange(P.gud.maxzhanli - G.oldGud.maxzhanli, P.gud.maxzhanli);
                    }
                    break;
                case 'vip'://vip变化时
                    G.event.emit('vipChange',{
                        'olv':oldGud[k],
                        'lv':d[k]
                    });
                    break;
                case 'cclv':
                    G.DATA.buildData['1'].lv = d[k];
                    G.event.emit('cclvChange');
                    break;
                case 'jxlv'://军衔变化时
                    // 当军衔等级发生变化的时候，检测是否有新军衔激活
                    var oldJx = G.class.junxiao.getJunxianById(oldGud[k]);
                    var newJx = G.class.junxiao.getJunxianById(d[k]);
                    if(oldJx.id != newJx.id){
                        X.cacheByUid('junxianjihuo', newJx.id);
                        G.checkJunXianJiHuo();
                    }
                    
                    // 当军衔等级发生变化的时候，检测是否有名将可激活
                    var oldMj = G.class.junxiao.getMingjiangByJx(oldGud[k]);
                    var newMj = G.class.junxiao.getMingjiangByJx(d[k]);
                    if(oldMj != newMj){
                        X.cacheByUid('mingjiangjihuo', newMj.id);
                        G.checkMingjiangJiHuo();
                    }
                    break;
                case 'gpjjclv'://决斗等级升级
                    if(oldGud[k] < d[k]){
                        if(G.frame.juedoushengdian_tz.isShow || G.frame.juedoushengdian_main.isShow){
                            G.frame.fight.once('willClose',function(){
                                G.frame.juedoushengdian_tz.aniLvUp();
                            })
                        }
                    }
                    break;
                case "maxmapid":
                    if (P.gud.maxmapid > 10) G.hongdian.getData('xiaoyouxi', 1);
                    G.view.mainView.checkYJXW()
                    break;
                default :
                    break;
            }
        }
        G.event.emit('attrchange_over');

        if(G.frame.yingxiong_xxxx.isShow && G.frame.yingxiong_xxxx.isShow == true) {

        }else{
            if(tips.length < 1) return;
            G.tip_NB.show(tips);
        }
    });

    G.event.on('baowuchange',function(d){
        var o = X.toJSON(d);
        var tips = [];
        var oldWp = {};
        console.log('baowuchange-data',o);
        // for(var k in o){
        //     G.frame.beibao.DATA.baowu[k] = G.frame.beibao.DATA.baowu[k] || {num:1,bid:o[k].bid};
        //     oldWp[k] = JSON.parse(JSON.stringify(G.frame.beibao.DATA.baowu[k]));
        //     for(var aaa in o[k]) {
        //         G.frame.beibao.DATA.baowu[k][aaa] = o[k][aaa]
        //     }
        //     //G.frame.beibao.DATA.baowu[k].num = o[k].num*1 || 1;
        //
        //     if (G.frame.beibao.DATA.baowu[k].num == 0){
        //         delete G.frame.beibao.DATA.baowu[k];
        //     }
        // }

        for(var j=0;j< G.DATA.budui.armylist.plist.length;j++) {
            G.DAO.zhuangbei.checkNewBw(j);
        }
        G.event.emit('baowuchange_over');
    });

    G.event.on('TOUCH_EVENT_TRIGGER', function (sender, type,fromwhere,extData) {
        if (fromwhere!='fromcode' &&  cc.sys.isObjectValid(sender) && type == ccui.Widget.TOUCH_ENDED){
            if(sender.name == 'btn_fh'){
                X.audio.playEffect('sound/close.mp3',false);
            }else{
                if(extData == null || !extData.noSound){
                    G.class.touchsound();
                }
            }
        }
    });

    G.event.on('herochange',function(d,conf,formInfo) {
        G.event.emit("default_herochange",d,conf,formInfo);
        var o = X.toJSON(d);
        console.log('herochange-data',o);
        for(var k in o){
            var heroData = o[k];
            if (heroData.num == 0) {
                if (G.DATA.yingxiong.list[k]) {
                    G.DATA.yingxiong.list[k] = {};
                    delete G.DATA.yingxiong.list[k];
                    console.log('该英雄已被删除======', k);
                } else {
                    console.log('不存在该英雄======', k);
                }
            } else {
                if (G.DATA.yingxiong.list[k]) {
                    for (var key in heroData) {
                        G.DATA.yingxiong.list[k][key] = heroData[key];
                    }
                } else {
                    G.DATA.yingxiong.list[k] = heroData;
                    G.DATA.yingxiong.list[k].tid = k;
                    console.log('新增英雄======', k);
                }

            }
        }
        G.frame.yingxiong.checkHeroNum();
        G.event.emit('herochange_over');
    });

    G.event.on('skinchange',function(d) {
        var o = X.toJSON(d);
        console.log('skinchange-data',o);

        for(var k in o){
            var skinData = o[k];
            if (skinData.num == 0) {
                if (G.DATA.skin.list[k]) {
                    G.DATA.skin.list[k] = {};
                    delete G.DATA.skin.list[k];
                    console.log('该皮肤已被删除======', k);
                } else {
                    console.log('不存在该皮肤======', k);
                }
            } else {
                if (G.DATA.skin.list[k]) {
                    for (var key in skinData) {
                        G.DATA.skin.list[k][key] = skinData[key];
                    }
                } else {
                    G.DATA.skin.list[k] = skinData;
                    G.DATA.skin.list[k].tid = k;
                    console.log('新增皮肤======', k);
                }

            }
        }
        G.event.emit('skinchange_over');
        X.checkSkinDueTime();
    });
    
    G.event.on("petchange", function (d) {
        var o = X.toJSON(d);
        console.log('petchange-data',o);

        for(var k in o){
            var petData = o[k];
            if (petData.num == 0) {
                if (G.DATA.pet[k]) {
                    G.DATA.pet[k] = {};
                    delete G.DATA.pet[k];
                    console.log('该宠物已被删除======', k);
                } else {
                    console.log('不存在该皮肤======', k);
                }
            } else {
                if (G.DATA.pet[k]) {
                    for (var key in petData) {
                        G.DATA.pet[k][key] = petData[key];
                    }
                } else {
                    G.DATA.pet[k] = petData;
                    G.DATA.pet[k].tid = k;
                    console.log('新增宠物======', k);
                }

            }
        }
    });

    G.event.on('wenwuchange',function(d){
        var o = X.toJSON(d);
        console.log('wenwuchange-data',o);
        for(var k in o){
            var wenwuData = o[k];
            if (wenwuData.num == 0) {
                if (G.DATA.wenwu[k]) {
                    //删除文物
                    G.DATA.wenwu[k] = {};
                    delete G.DATA.wenwu[k];
                    console.log('该文物已被删除======', k);
                } else {
                    console.log('不存在该文物======', k);
                }
            }else {
                if(!G.DATA.wenwu[k]){//没有这个文物
                    G.DATA.wenwu[k] = o[k];
                }else {//替换原有文物数据
                    for(var i in o[k]){
                        G.DATA.wenwu[k][i] = o[k][i];
                    }
                }
            }
        }
        G.event.emit('wenwuchange_over');
    });
    G.event.on('wuhunchange',function(d,_data,formInfo){
        G.event.emit("default_wuhunchange",d,_data,formInfo);
        var o = X.toJSON(d);
        console.log('wuhunchange-data',o);
        for(var k in o){
            var wuhunData = o[k];
            if (wuhunData.num == 0) {
                if (G.DATA.wuhun[k]) {
                    //删除武魂
                    G.DATA.wuhun[k] = {};
                    delete G.DATA.wuhun[k];
                    console.log('该武魂已被删除======', k);
                } else {
                    console.log('不存在该武魂======', k);
                }
            }else {
                if(!G.DATA.wuhun[k]){//没有这个武魂
                    G.DATA.wuhun[k] = o[k];
                }else {//替换原有武魂数据
                    for(var i in o[k]){
                        G.DATA.wuhun[k][i] = o[k][i];
                    }
                }
            }
        }
        G.event.emit('wuhunchange_over');
    });
})();