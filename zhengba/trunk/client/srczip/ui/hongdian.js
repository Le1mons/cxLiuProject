/**
 * Created by zhangming on 2018-04-13
 */
(function(){
// 主城创建完毕异步按钮加载完毕拉取红点
    G.event.on('loginOver', function (d) {
        cc.director.getRunningScene().setTimeout(function () {
            G.hongdian.getHongdian(1, function () {
                if (G.DATA.hongdian.chat) {
                    if (!G.frame.chat.redConf[7]) G.frame.chat.redConf[7] = 0;
                    G.frame.chat.redConf[7] ++;
                    G.frame.chat.checkRedPoint();
                }
            });
        }, 100);
    });

// 日期更迭时重新拉取红点数据
    G.event.on('dayChange', function (d) {
        if(G.view.mainView) {
            G.hongdian.getHongdian(1);
        }
    });

// 服务器端的推送
    G.event.on('changehongdian', function (d) {
        var d = X.toJSON(d);
        if(!G.DATA.hongdian) return;
        cc.mixin(G.DATA.hongdian, d, true);
        G.hongdian.check();
        G.hongdian.emitChange(d);
    });

    G.event.on("task_redpoint", function () {
        G.hongdian.getData(["succtask", "dailytask", "qwcj"], 1);
        if(G.frame.renwu.isShow) {
            G.frame.renwu.getData(function () {
                G.frame.renwu.setContents();
            });
        }
    });

    G.event.on("kfkh_redpoint", function () {
        G.hongdian.getData("kfkh", 1);
    });
    //龙舟任务推送
    G.event.on("longzhou_redpoint", function () {
        G.hongdian.getData("longzhou", 1);
    });

    G.event.on("midautumn_redpoint", function () {
        G.hongdian.getData("midautumn", 1);
    });
    
    G.event.on('hdchange', function (d) {
        if(G.view.mainView) {
            G.hongdian.hdchange(d);
        }
    });

    G.event.on("zchd_redpoint", function () {
        G.hongdian.getData("zhouchanghuodong", 1);
    });

    G.event.on("guild_redpoint", function () {
        G.hongdian.getData("gonghui", 1, function () {
            if(G.frame.gonghui_main.isShow) {
                G.frame.gonghui_main.checkRedPoint();
                if(G.frame.gonghui_dating.zy) {
                    G.frame.gonghui_dating.zy.checkRedPoint();
                }
            }
        });
    });

    G.event.on("activity_redpoint", function (d) {
        G.setNewIcoImg(G.view.mainView.nodes.btn_xshd);
    });

    G.event.on("artifact_redpoint", function (d) {
        G.hongdian.getData("artifact", 1);
    });

    G.event.on("mrsc_redpoint", function (d) {
        G.view.mainView.getAysncBtnsData(function(){
            G.view.mainView.allBtns["lefttop"] = [];
            G.view.mainView.setSvrBtns();

            G.hongdian.getData("meirishouchong", 1, function () {
                G.hongdian.checkMRSC();
            });
        }, false, ["meirishouchong"]);
    });

    G.event.on("herorecruit_redpoint", function (d) {
        G.hongdian.getData("herorecruit", 1);
    });

    G.event.on("flag_redpoint", function (d) {
        G.hongdian.getData("flag", 1);
    });

    G.event.on("jrkh_redpoint", function (d) {
        G.hongdian.getData("jrkh", 1);
    });

    G.event.on("trial_redpoint", function () {
        G.hongdian.getData("trial", 1);
    });

    G.event.on("title_redpoint", function () {
        G.hongdian.getData("title", 1, function () {
            if (G.frame.juewei.isShow) {
                G.frame.juewei.checkRedPoint();
            }
        });
    });

    G.event.on("pet_redpoint", function () {
        G.hongdian.getData("pet", 1);
    });

    G.event.on('mjhj_redPoint', function () {
        G.hongdian.getData("mjhj", 1, function () {
            if (G.frame.chouka.isShow) {
                G.frame.chouka.checkRedPoint();
            }
        });
    });
    G.event.on('double11_redPoint', function () {
        G.hongdian.getData('double11', 1, function () {
            G.frame.Double11.isShow && G.frame.Double11.checkRedPoint();
        });
    });
    G.event.on('herohot_redpoint', function () {
        G.hongdian.getData('herohot', 1);
    });
    G.event.on('planttrees_redpoint', function () {
        G.hongdian.getData('planttrees', 1);
    });
    G.event.on('niudan_redpoint', function () {
        G.hongdian.getData('niudan', 1);
    });
    G.event.on('labour_redpoint', function () {
        G.hongdian.getData('labour', 1);
    });
    G.event.on('xiaoyouxi_redpoint', function () {
        G.hongdian.getData('xiaoyouxi', 1);
    });

    G.hongdian = {
        hdchange: function(d){
            var me = this;
            if (!d || !d.tag) return;

            if (d.type > 0) {
                me._addHongdian(d);
            }else{
                me._removeHongdian(d);
            }
        },
        // 拉取全部红点数据
        getHongdian: function(type, callback){
            if(G.tiShenIng) return;
            var me = this;
            if(!G.ajax) return;
            type = type || 0;
            // 0 缓存 1 最新
            G.ajax.send('hongdian_get', [type], function (data) {
                if (!data || !P)  return;
                var data = X.toJSON(data);

                if (data.s === 1) {
                    G.DATA.hongdian = data.d || {};
                    me.check();
                    callback && callback();
                }
            });
        },
        // 拉取指定key的红点数据
        getData: function(val, type, callback){
            if(G.tiShenIng) return;
            var me = this;
            if(typeof(val) != 'string' && !Array.isArray(val) && val.length == 0) return;
            type = type || 0;
            //0 缓存 1 最新
            G.ajax.send('hongdian_get', [type, [].concat(val)], function (data) {
                var data = X.toJSON(data);
                if (data.s === 1) {
					if(!G.DATA.hongdian)G.DATA.hongdian={};
                    cc.mixin(G.DATA.hongdian, data.d, true);
                    switch (val){
                        case "chongzhiandlibao":
                            me.checkCZ();
                            break;
                        case "shouchonghaoli":
                            me.checkSC();
                            break;
                        case "kfkh":
                            me.checkKFKH();
                            break;
                        case "gonghui":
                            me.checkGH();
                            break;
                        case "mrsl":
                            me.checkFST();
                            break;
                        case "shizijun":
                            me.checkFST();
                            break;
                        case "worship":
                            me.checkRank();
                            break;
                        case "artifact":
                            me.checkSQ();
                            break;
                        case "monthfund":
                            me.checkYJJ();
                            break;
                        case "crosszbjifen":
                            me.checkJJC();
                            break;
                        case "huodong":
                            me.checkXSHD();
                            break;
                        case "meirishouchong":
                            me.checkMRSC();
                            break;
                        case "watcher":
                            me.checkFST();
                            break;
                        case "herorecruit":
                            me.checkYXZM();
                            break;
                        case "fashita":
                            me.checkFST();
                            break;
                        case "email":
                            me.checkEmail();
                            break;
                        case "destiny":
                            me.checkYx();
                            break;
                        case "friend":
                            me.checkFriend();
                            break;
                        case "flag":
                            me.checkBLZQ();
                            break;
                        case "xstask":
                            me.checkXSRW();
                            break;
                        case "jrkh":
                            me.checkJRKH();
                            break;
                        case "glyph":
                            me.checkGlyph();
                            break;
                        case "trial":
                            me.checkSLHD();
                            break;
                        case "title":
                            me.checkJW();
                            break;
                        case "return":
                            me.checkBack();
                            break;
                        case "pet":
                            me.checkPet();
                            break;
                        case "jiban":
                            me.checkJiban();
                            break;
                        case "yjkg":
                            me.checkKaoGu();
                            break;
                        case "anniversary":
                        case "qingdian":
                            me.checkZhouNian();
                            break;
                        case "wangzhezhaomu":
                            me.checkwzzm();
                            break;
                        case "xldx":
                            me.checkXldx();
                            break;
                        case "midautumn":
                        case 'double11':
                            me.checkZhongQiu();
                            me.checkYuanDan();
                            break;
                        case 'newyear3':
                            me.checkNewyear3();
                            break;
                        case 'yuanxiao3':
                            me.checkyuanxiao3();
                            break;
                        case "xiariqingdian":
                            me.checkXiaRiqingdian();
                        case 'herojitan':
                        case 'mjhj':
                            me.checkYXJT();
                            break;
                        case 'gpjjc':
                            me.checkJdsdHd();
                            break;
                        case 'riddles':
                            me.checkYuanXiao();
                            break;
                        case 'herohot':
                            me.checkXNHD();
                            break;
                        case 'planttrees':
                            me.checkZSJ();
                            break;
                        case "niudan":
                            me.checkNiuDan();
                            break;
                        case 'labour':
                            me.checkWuYi();
                            break;
                        case 'longzhou':
                            me.checkDuanwu();
                            break;
                        case 'christmas':
                            me.checkChristmas();
                            break;
                        case 'heropreheat'://英雄预热活动
                            me.checkHeroreheat();
                            break;
                        case 'herotheme'://英雄主题活动
                            me.checkHerotheme();
                            break;
                        case "lianhunta":
                            me.checkLHT();
                            break;
                        case "syzc":
                            me.checkLHT();
                            break;
                        case "stagefund":
                            me.checkLHT();
                            break;
                        case "xiaoyouxi":
                            me.checkXYX();
                            break;
                        case "qixi":
                            me.checkQixi();
                        case "zhounian3":
                            me.checkzn3();
                        case "midautumn2":
                            me.checkJQ();
                        default:
                            me.check();
                            break;
                    }
                    callback && callback();
                }
            });
        },
        check: function(){
            var me = this;
            me._each();
            me.checkYXJT();
            me.checkXSRW();
            me.checkBLZQ();
            me.checkYXZM();
            me.checkXSHD();
            me.checkJCHD();
            me.checkMRSL();
            me.checkCZ();
            me.checkSC();
            me.checkGH();
            me.checkFriend();
            me.checkKFKH();
            me.checkTX();
            me.checkHeCheng();
            me.checkRongHe();
            me.checkRank();
            me.checkTask();
            me.checkSQ();
            me.checkYJJ();
            me.checkMRSC();
            me.checkDMJ();
            me.checkFST();
            me.checkEmail();
            me.checkJJC();
            me.checkYx();
            me.checkJRKH();
            me.checkGlyph();
            me.checkUseItem();
            me.checkSLHD();
            me.checkJW();
            me.checkBack();
            me.checkPet();
            me.checkJiban();
            me.checkKaoGu();
            me.checkwzzm();
            me.checkXldx();
            me.checkZhouNian();
            me.checkZhongQiu();
            me.checkXiaRiqingdian();
            me.checkYuanDan();
            me.checkNewyear3();
            me.checkyuanxiao3();
            me.checkJdsdHd();
            me.checkYuanXiao();
            me.checkXNHD();
            me.checkZSJ();
            me.checkNiuDan();
            me.checkWuYi();
            me.checkDuanwu();
            me.checkChristmas();
            me.checkHeroreheat();
            me.checkHerotheme();
            me.checkLHT();
            me.checkXYX();
            me.checkQixi();
            me.checkzn3();
            me.checkJQ();
            G.event.emit('hdchange_over');
        },
        checkQixi:function(){
            if(G.DATA.hongdian.qixi){
                if(G.DATA.hongdian.qixi.commonprize || G.DATA.hongdian.qixi.task || G.DATA.hongdian.qixi.help){
                    G.setNewIcoImg(G.view.mainView.nodes.panel_qixi);
                    G.view.mainView.nodes.panel_qixi.finds('redPoint').setPosition(67,67);
                }else{
                    G.removeNewIco(G.view.mainView.nodes.panel_qixi);
                }
                
               
            }
        },
        checkzn3:function(){
            if(G.DATA.hongdian && G.DATA.hongdian.zhounian3){
                G.setNewIcoImg(G.view.mainView.nodes.panel_znq);
                // G.view.mainView.nodes.panel_znq.finds('redPoint').setPosition(67,67);
            }else{
                G.removeNewIco(G.view.mainView.nodes.panel_znq);

            }
        },
        checkYXJT: function () {
            var data = G.DATA.hongdian;
            if(!data)return
            if (data.herojitan || data.mjhj || (data.slzt && (data.slzt.forevertask || data.slzt.task))) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_yxjt.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_yxjt.finds("panel_wz"));
            }
        },
        checkPet: function () {
            var isHave = false;
            var data = G.DATA.hongdian.pet;

            for (var i in data) {
                if (data[i]) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_scsj.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_scsj.finds("panel_wz"));
            }
        },
        checkSLHD: function () {
            var data = G.DATA.hongdian.trial;

            if (data) {
                G.setNewIcoImg(G.view.mainView.nodes.img_shilian_bg, .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.img_shilian_bg);
            }
        },
        checkJW: function () {
            var isHave = false;
            var data = G.DATA.hongdian.title;

            for (var i in data) {
                if (data[i] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_jsfz.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_jsfz.finds("panel_wz"));
            }
        },
        checkGlyph: function () {
            var data = G.DATA.hongdian.glyph;

            if(data) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_tjp.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_tjp.finds("panel_wz"));
            }
        },
        checkJRKH: function () {
            var data = G.DATA.hongdian.jrkh;
            var btn = G.DATA.asyncBtns && G.DATA.asyncBtns.jrkh;

            if (!btn || !cc.isNode(btn) || !data) return;

            if (data.length > 0) {
                G.setNewIcoImg(btn);
            } else {
                G.removeNewIco(btn);
            }
        },
        checkXSRW: function () {
            var data = G.DATA.hongdian.xstask;

            if(data) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_xsrw.finds("panel_wz"), .85);
                if(G.frame.tanxian.isShow) {
                    G.setNewIcoImg(G.frame.tanxian.nodes.btn_xsrw, .8);
                }
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_xsrw.finds("panel_wz"));
                if(G.frame.tanxian.isShow) {
                    G.removeNewIco(G.frame.tanxian.nodes.btn_xsrw);
                }
            }
        },
        checkBLZQ: function() {
            var data = G.DATA.hongdian.flag || [];

            if(data.length > 0) {
                G.setNewIcoImg(G.view.mainView.nodes.btn_xszm);
            } else {
                G.removeNewIco(G.view.mainView.nodes.btn_xszm);
            }
        },
        checkJJC: function() {
            var isHave = false;
            var data = G.DATA.hongdian;
            var arr = ["crosswz", "storm", "crosszbjifen", "wjzz", "ladder"];

            for (var i in arr) {
                var keyData = data[arr[i]];
                if(cc.isObject(keyData)){
                    if (this.objMeet(keyData)) {
                        isHave = true;
                        break;
                    }
                } else {
                    if (keyData) {
                        isHave = true;
                        break;
                    }
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_jjc.finds("panel_wz"));
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_jjc.finds("panel_wz"));
            }
        },
        checkEmail: function() {
            var isHave = false;
            var data = G.DATA.hongdian.email;

            for (var i in data) {
                if (data[i] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.btn_yj);
                if(G.frame.gonghui_main.isShow) {
                    G.setNewIcoImg(G.frame.gonghui_main.nodes.btn_yj);
                }
            } else {
                G.removeNewIco(G.view.mainView.nodes.btn_yj);
                if(G.frame.gonghui_main.isShow) {
                    G.removeNewIco(G.frame.gonghui_main.nodes.btn_yj);
                }
            }
        },
        checkFST: function() {
            var isHave = false;
            var data = G.DATA.hongdian.fashita;

            for (var i in data) {
                if (data[i] && data[i] < 10) {
                    isHave = true;
                    break;
                }
            }
            var isShow = false;
            if (isHave || this.objMeet(G.DATA.hongdian.mrsl) || G.DATA.hongdian.shizijun || this.objMeet(G.DATA.hongdian.watcher)) {
                isShow = true;
            }

            if(isShow) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_fst.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_fst.finds("panel_wz"));
            }
        },
        checkYXZM: function() {
            var me = this;
            if(G.DATA.hongdian.herorecruit > 0) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_ciridenglu);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_ciridenglu);
            }
        },
        checkYWZB: function() {},
        checkYJJ: function() {
            var isHave = false;
            var data = G.DATA.hongdian.monthfund;

            if(X.keysOfObject(data).length > 0) {
                for(var i in data) {
                    for (var j in data[i]) {
                        if(data[i][j] > 0) {
                            isHave = true;
                            break;
                        }
                    }
                }

                if(isHave) {
                    G.setNewIcoImg(G.view.mainView.ui.finds("yuejijin"));
                }else {
                    G.removeNewIco(G.view.mainView.ui.finds("yuejijin"));
                }
            }
        },
        checkSQ: function() {
            if(G.DATA.hongdian.artifact > 0) {
                G.setNewIcoImg(G.view.mainView.ui.finds("btn_sq"));
                if(G.frame.tanxian.isShow) {
                    G.setNewIcoImg(G.frame.tanxian.nodes.btn_sq);
                    G.setNewIcoImg(G.frame.tanxian.nodes.img_jdt, .95);
                    G.frame.tanxian.setSQ();
                }
            }else {
                G.removeNewIco(G.view.mainView.ui.finds("btn_sq"));
                if(G.frame.tanxian.isShow) {
                    G.removeNewIco(G.frame.tanxian.nodes.btn_sq);
                    G.removeNewIco(G.frame.tanxian.nodes.img_jdt);
                    G.frame.tanxian.setSQ();
                }
            }
        },
        checkTask: function() {
            var isHave = false;
            var arr = ["succtask", "dailytask", "qwcj"];
            var data = G.DATA.hongdian;

            for(var i in arr) {
                if(data[arr[i]] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                if(G.frame.tanxian.isShow) {
                    G.setNewIcoImg(G.frame.tanxian.nodes.btn_mrrw);
                }
                G.setNewIcoImg(G.view.mainView.nodes.btn_mrrw);
            }else {
                G.removeNewIco(G.view.mainView.nodes.btn_mrrw);
                if(G.frame.tanxian.isShow) {
                    G.removeNewIco(G.frame.tanxian.nodes.btn_mrrw);
                }
            }
        },
        delayHongdian: function(key, time){
            var me = this;
            var scene = cc.director.getRunningScene();

            me._timers = me._timers || {};
            if(me._timers[key]){
                scene.clearTimeout(me._timers[key]);
                delete me._timers[key];
            }

            me._timers[key] = scene.setTimeout(function(){
                me.getData(key, function(){
                    // 指定key红点数据已更新
                    var d = G.DATA.hongdian[key];
                    if(me.hasTimestamp(d)){
                        me.delayHongdian(k, d[1]);
                    }
                });
            },(time-G.time)*1000 );
        },
        checkRank: function() {
            var data = G.DATA.hongdian.worship;

            if(data.length < 5) {
                G.setNewIcoImg(G.view.mainView.nodes.btn_ph);
            }else {
                G.removeNewIco(G.view.mainView.nodes.btn_ph);
            }
        },
        checkJQ: function () {
            if(G.DATA.hongdian.midautumn2) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_jinqiu);
                G.view.mainView.nodes.panel_jinqiu.finds('redPoint').setPosition(68,66);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_jinqiu);
            }
        },
        checkMRSL: function() {},
        checkDMJ: function() {},
        checkYx: function () {
            if(G.DATA.hongdian.destiny || G.frame.yingxiong.getHeroRed() || this.checkSuiPian('hero')) {
                G.setNewIcoImg(G.view.mainMenu.nodes.btn_yingxiong);
                G.view.mainMenu.nodes.btn_yingxiong.getChildByName("redPoint").y -= 5;
            } else {
                G.removeNewIco(G.view.mainMenu.nodes.btn_yingxiong);
            }
        },
        checkGH: function() {
            var isHave = false;
            var data = G.DATA.hongdian.gonghui;

            for(var i in data) {
                if(data[i] > 0) {
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                if(!G.frame.gonghui_main.isShow){
                    if(!cc.isNode(G.view.mainMenu)) return;
                    G.setNewIcoImg(G.view.mainMenu.nodes.btn_gonghui);
                    G.view.mainMenu.nodes.btn_gonghui.getChildByName("redPoint").y -= 5;
                }
            }else{
                G.removeNewIco(G.view.mainMenu.nodes.btn_gonghui);
            }
        },
        checkTX: function(){
            var isHave = false;
            var arr = ["tanxian", "guajitime"];
            var data = G.DATA.hongdian;
            for (var i in arr){
                if(data[arr[i]] > 0){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                if(!G.frame.tanxian.isShow){
                    G.setNewIcoImg(G.view.mainMenu.nodes.btn_tanxian);
                    G.view.mainMenu.nodes.btn_tanxian.getChildByName("redPoint").y -= 5;
                }
            }else{
                G.removeNewIco(G.view.mainMenu.nodes.btn_tanxian);
            }
        },
        checkFriend: function(){
            var isHave = false;
            var arr = ["apply", "yinji"];
            var data = G.DATA.hongdian.friend;
            for(var i in arr){
                if(data[arr[i]] > 0){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                G.setNewIcoImg(G.view.mainView.nodes.btn_hy);
            }else{
                G.removeNewIco(G.view.mainView.nodes.btn_hy)
            }
        },
        checkKFKH: function(){
            var me = this;
            var isHave = false;
            var data = G.DATA.hongdian.kfkh;
            for(var i in data){
                if(data[i] > 0){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                G.setNewIcoImg(G.view.mainView.ui.finds("kaifukuanghuan"));
            }else{
                G.removeNewIco(G.view.mainView.ui.finds("kaifukuanghuan"));
            }
        },
        checkSC: function(){
            //首充
            var isHave = false;
            var data = G.DATA.hongdian.shouchonghaoli;
            for(var i in data){
                if(data[i] > 0){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                G.setNewIcoImg(G.view.mainView.ui.finds("shouchong"));
            }else{
                G.removeNewIco(G.view.mainView.ui.finds("shouchong"));
            }

        },
        checkCZ: function(){
            //充值
            var isHave = false;
            var data = G.DATA.hongdian.chongzhiandlibao;
            for(var i in data){
                if(data[i] > 0){
                    isHave = true;
                    break;
                }
            }

            if(isHave || this.checkTqlb()){
                G.setNewIcoImg(G.view.mainView.ui.finds("btn_cz"));
            }else{
                G.removeNewIco(G.view.mainView.ui.finds("btn_cz"))
            }
        },
        checkTqlb: function () {
            var tqlb = false;
            var dd = G.DATA.hongdian.tqlb;
            for(var i in dd){
                if(dd[i] > 0){
                    tqlb = true;
                    break;
                }
            }
            return !X.cacheByUid("tqlb_login_redPoint") && tqlb;
        },
        checkXSHD: function(){
            //限时活动
            var data = G.DATA.hongdian;
            var isHave = false;
			if(!data || data.huodong==null)return;

            if(data.huodong.length > 0) {
                isHave = true;
            }
            if(isHave){
                G.setNewIcoImg(G.view.mainView.nodes.btn_xshd);
            }else{
                G.removeNewIco(G.view.mainView.nodes.btn_xshd);
            }
        },
        checkMRSC: function() {
            if(G.DATA.hongdian.meirishouchong) {
                G.setNewIcoImg(G.view.mainView.ui.finds("meirishouchong"));
            }else {
                G.removeNewIco(G.view.mainView.ui.finds("meirishouchong"));
            }
        },
        checkJCHD: function(){
            //精彩活动
            var data = G.DATA.hongdian;
            var arr = ["dengjiprize", "yueka_da", "yueka_xiao", "sign", "monthfund_170","monthfund_180","zhengtao","todaylibao","weekmonthlibao","thlb","xslb","zzlb","yzlb","cyht","sdjj",'lifetimecard','yueka'];
            var is = false;
            for(var i = 0; i < arr.length; i ++){
                if(data[arr[i]] && data[arr[i]] > 0){
                    is = true;
                    break;
                }
                if(arr[i] == "weekmonthlibao" || arr[i] == 'sdjj'){
                    for(var k in data[arr[i]]){
                        if(data[arr[i]][k] > 0){
                            is = true;
                            break;
                        }
                    }
                }
            }
            if(is){
                G.setNewIcoImg(G.view.mainView.nodes.btn_jchd);
            }else{
                G.removeNewIco(G.view.mainView.nodes.btn_jchd);
            }
        },
        checkBack: function(){
            //玩家回归
            var data = G.DATA.hongdian.return;
            var arr = ["login", "return", "daily", "recharge"];
            var is = false;
            for(var i = 0; i < arr.length; i ++){
                if(data[arr[i]] && data[arr[i]] > 0){
                    is = true;
                    break;
                }
            }
            if(is){
                G.setNewIcoImg(G.view.mainView.ui.finds("kingsreturn"));
            }else{
                G.removeNewIco(G.view.mainView.ui.finds("kingsreturn"));
            }
        },
        //武将羁绊
        checkJiban: function(){
            if(G.DATA.hongdian.jiban && G.DATA.hongdian.jiban.hd == 1){
                G.setNewIcoImg(G.view.mainView.nodes.panel_rhjt.finds("panel_wz"), .85);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_rhjt.finds("panel_wz"), .85);
            }
        },
        //考古
        checkKaoGu:function(){
            if (G.DATA.hongdian.yjkg){
                G.setNewIcoImg(G.view.mainView.nodes.panel_kaogu);
                G.view.mainView.nodes.panel_kaogu.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_kaogu);
            }
        },
        //周年活动
        checkZhouNian:function(){
            if (G.DATA.hongdian.anniversary || (G.DATA.hongdian.qingdian && G.DATA.hongdian.qingdian.length > 0)){
                G.setNewIcoImg(G.view.mainView.nodes.panel_2zhounian);
                G.view.mainView.nodes.panel_2zhounian.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_2zhounian);
            }
        },
        //中秋活动
        checkZhongQiu:function(){
            if ((G.DATA.hongdian.midautumn && G.frame.event_zhongqiu.getWorkShopHD()) || G.DATA.hongdian.double11){
                G.setNewIcoImg(G.view.mainView.nodes.panel_zhongqiu);
                G.view.mainView.nodes.panel_zhongqiu.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_zhongqiu);
            }
        },
        //夏日庆典
        checkXiaRiqingdian:function(){
            if (G.DATA.hongdian.xiariqingdian){
                G.setNewIcoImg(G.view.mainView.nodes.panel_qingdian);
                G.view.mainView.nodes.panel_qingdian.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_qingdian);
            }
        },

        checkYuanDan:function(){
            if (G.DATA.hongdian.midautumn){
                G.setNewIcoImg(G.view.mainView.nodes.panel_yuandan);
                G.view.mainView.nodes.panel_yuandan.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_yuandan);
            }
        },
        checkNewyear3:function(){
            if (G.DATA.hongdian.newyear3){
                G.setNewIcoImg(G.view.mainView.nodes.panel_cjhd);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_cjhd);
            }
        },
        checkyuanxiao3:function(){
            if (G.DATA.hongdian.yuanxiao3){
                G.setNewIcoImg(G.view.mainView.nodes.panel_xnyx);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_xnyx);
            }
        },
        checkYuanXiao: function () {
            if (G.DATA.hongdian.riddles){
                G.setNewIcoImg(G.view.mainView.nodes.panel_yuanxiao);
                G.view.mainView.nodes.panel_yuanxiao.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_yuanxiao);
            }
        },
        checkXNHD: function () {
            if (G.DATA.hongdian.herohot){
                G.setNewIcoImg(G.view.mainView.nodes.panel_xinnian);
                G.view.mainView.nodes.panel_xinnian.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_xinnian);
            }
        },
        checkZSJ: function () {
            var data = G.DATA.hongdian.planttrees;
            var isHave = false;
            for (var key in data) {
                if (data[key]) {
                    isHave = true;
                    break;
                }
            }
            if (isHave){
                G.setNewIcoImg(G.view.mainView.nodes.panel_zhishu);
                G.view.mainView.nodes.panel_zhishu.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_zhishu);
            }
        },
        checkNiuDan: function () {
            var data = G.DATA.hongdian.niudan;
            var isHave = false;
            for (var key in data) {
                if (data[key]) {
                    isHave = true;
                    break;
                }
            }
            var need = G.gc.niudan.niudanneed[0];
            var haveNum = G.class.getOwnNum(need.t, need.a);
            if (isHave || (!G.view.mainView.nodes.panel_niudan.firstCheckNumRed && haveNum > 0
                && G.time < G.DATA.asyncBtnsData.niudan.rtime)){
                G.setNewIcoImg(G.view.mainView.nodes.panel_niudan);
                G.view.mainView.nodes.panel_niudan.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_niudan);
            }
        },
        checkWuYi: function () {
            var data = G.DATA.hongdian.labour;
            var isHave = false;
            for (var key in data) {
                if (data[key]) {
                    isHave = true;
                    break;
                }
            }
            var need = G.gc.wyhd.lotteryneed[0];
            if (isHave || (!G.view.mainView.nodes.panel_wuyi.firstDuiHuanRed && G.class.getOwnNum(need.t, need.a) > 0)){
                G.setNewIcoImg(G.view.mainView.nodes.panel_wuyi);
                G.view.mainView.nodes.panel_wuyi.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_wuyi);
            }
        },
        checkDuanwu: function () {
            var data = G.DATA.hongdian.longzhou;
            var isHave = false;
            for (var key in data) {
                if (data[key]) {
                    isHave = true;
                    break;
                }
            };
            var own = G.class.getOwnNum('5082','item');
            if (own>0 && !X.cacheByUid('firstLoginLongzhouHd')){
                isHave = true;
            }
            if (isHave){
                G.setNewIcoImg(G.view.mainView.nodes.panel_duanwu);
                G.view.mainView.nodes.panel_duanwu.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_duanwu);
            }
        },
        checkChristmas: function () {
            var data = G.DATA.hongdian.christmas;
            // G.removeNewIco(G.view.mainView.nodes.panel_sdqx);
            // for(var k in data){
            if (data && data.tree){
                G.setNewIcoImg(G.view.mainView.nodes.panel_sdqx);
                G.view.mainView.nodes.panel_sdqx.finds('redPoint').setPosition(68,66);
                // break;
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_sdqx);
            }
            // }
        },
        //英雄预热活动
        checkHeroreheat: function () {
            var data = G.DATA.hongdian.heropreheat;
            if (data){
                G.setNewIcoImg(G.view.mainView.nodes.panel_yxyr);
                G.view.mainView.nodes.panel_yxyr.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_yxyr);
            }
        },
        //英雄主题活动
        checkHerotheme: function () {
            var data = G.DATA.hongdian.herotheme;
            if (data){
                G.setNewIcoImg(G.view.mainView.nodes.panel_blsl);
                G.view.mainView.nodes.panel_blsl.finds('redPoint').setPosition(68,66);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_blsl);
            }
        },
        checkLHT: function () {
            if (G.DATA.hongdian.lianhunta || !X.cacheByUid('showThtRed') || G.DATA.hongdian.syzc || X.inArray(G.DATA.hongdian.stagefund,'syzc')) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_yjxw.finds("panel_wz"), .85);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_yjxw.finds("panel_wz"));
            }
        },
        checkXYX: function () {
            if (G.DATA.hongdian.xiaoyouxi) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_js_rw);
                G.view.mainView.nodes.panel_js_rw.redPoint.setPosition(119, 69);
            } else {
                G.removeNewIco(G.view.mainView.nodes.panel_js_rw);
            }
        },
        _each: function(){
            var me = this;
            var data = G.DATA.hongdian;

            for (var k in data) {
                var d = data[k];

                if(me.hasTimestamp(d)){
                    me.delayHongdian(k, d[1]);
                    continue;
                }
                switch (k) {
                    case "dianjin":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "dianjin"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "dianjin"});
                        }
                        break;
                    case "tanxian":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "tanxian"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "tanxian"});
                        }
                        break;
                    case "kingstatue":
                        if(d > 0) {
                            G.event.emit("hdchange", {type: 1, tag: "kingstatue"});
                        } else {
                            G.event.emit("hdchange", {type: 0, tag: "kingstatue"});
                        }
                        break;
                    // case "herojitan":
                    //     if(d > 0) {
                    //         G.event.emit("hdchange", {type: 1, tag: "herojitan"});
                    //     } else {
                    //         G.event.emit("hdchange", {type: 0, tag: "herojitan"});
                    //     }
                    //     break;
                    default :
                        break;
                }
            }
        },
        _addHongdian: function(d){
            var me = this;

            switch (d.tag){
                case "richangrenwu":
                    G.setNewIcoImg(G.view.mainView.nodes.btn_mrrw);
                    break;
                case "dianjin":
                    G.setNewIcoImg(G.view.toper.nodes.btn_jia1, .7);
                    if (G.frame.juewei.isShow) {
                        G.view.toper.nodes.btn_jia1.redPoint.hide();
                    }
                    break;
                case "email":
                    G.setNewIcoImg(G.view.mainView.nodes.btn_yj);
                    if(G.frame.gonghui_main.isShow) {
                        G.setNewIcoImg(G.frame.gonghui_main.nodes.btn_yj);
                    }
                    break;
                case "fashita":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_fst.finds("panel_wz"), .85);
                    break;
                case "xstask":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_xsrw.finds("panel_wz"), .85);
                    break;
                case "hecheng":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_rhjt.finds("panel_wz"), .85);
                    break;
                case "herojitan":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_yxjt.finds("panel_wz"), .85);
                    break;
                case "shizijun":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_szjyz.finds("panel_wz"), .85);
                    break;
                case "succtask":
                    G.setNewIcoImg(G.view.mainView.nodes.btn_cjrw);
                    break;
                case "jjc":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_jjc.finds("panel_wz"));
                    break;
                case "kingstatue":
                    G.setNewIcoImg(G.view.mainView.nodes.panel_wzds.finds("panel_wz"), .85);
                    break;
                default:
                    break;
            }
        },
        _removeHongdian: function(d){
            var me = this;

            switch (d.tag){
                case "chongzhi":
                    G.removeNewIco(G.view.toper.nodes.btn_jia2);
                    break;
                case "richangrenwu":
                    G.removeNewIco(G.view.mainView.nodes.btn_mrrw);
                    break;
                case "dianjin":
                    G.removeNewIco(G.view.toper.nodes.btn_jia1);
                    break;
                case "email":
                    G.removeNewIco(G.view.mainView.nodes.btn_yj);
                    if(G.frame.gonghui_main.isShow) {
                        G.removeNewIco(G.frame.gonghui_main.nodes.btn_yj);
                    }
                    break;
                case "equip":
                    G.removeNewIco(G.view.mainMenu.nodes.btn_yingxiong);
                    break;
                case "fashita":
                    G.removeNewIco(G.view.mainView.nodes.panel_fst.finds("panel_wz"));
                    break;
                case "xstask":
                    G.removeNewIco(G.view.mainView.nodes.panel_xsrw.finds("panel_wz"));
                    break;
                case "friend":
                    G.removeNewIco(G.view.mainView.nodes.btn_hy);
                    break;
                case "hecheng":
                    G.removeNewIco(G.view.mainView.nodes.panel_rhjt.finds("panel_wz"));
                    break;
                case "herojinjie":
                    G.removeNewIco(G.view.mainMenu.nodes.btn_yingxiong);
                    break;
                case "herojitan":
                    G.removeNewIco(G.view.mainView.nodes.panel_yxjt.finds("panel_wz"));
                    break;
                case "mrsl":
                    G.removeNewIco(G.view.mainView.nodes.panel_mrsl.finds("panel_wz"));
                    break;
                case "shizijun":
                    G.removeNewIco(G.view.mainView.nodes.panel_szjyz.finds("panel_wz"));
                    break;
                case "shouchonghaoli":
                    G.removeNewIco(G.view.mainView.nodes.btn_sc);
                    break;
                case "sign":
                    G.removeNewIco(G.view.mainView.nodes.btn_jchd);
                    break;
                case "succtask":
                    G.removeNewIco(G.view.mainView.nodes.btn_cjrw);
                    break;
                case "tiejianpu":
                    G.removeNewIco(G.view.mainView.nodes.panel_tjp.finds("panel_wz"));
                    break;
                case "yueka_da":
                    G.removeNewIco(G.view.mainView.nodes.btn_jchd);
                    break;
                case "yueka_xiao":
                    G.removeNewIco(G.view.mainView.nodes.btn_jchd);
                    break;
                case "jitianfanli":
                    G.removeNewIco(G.view.mainView.nodes.btn_xshd);
                    break;
                case "leijichongzhi":
                    G.removeNewIco(G.view.mainView.nodes.btn_xshd);
                    break;
                case "jjc":
                    G.removeNewIco(G.view.mainView.nodes.panel_jjc.finds("panel_wz"));
                    break;
                case "kingstatue":
                    G.removeNewIco(G.view.mainView.nodes.panel_wzds.finds("panel_wz"));
                    break;
                default:
                    break;
            }

        },
        emitChange: function(d){
            var me = this;

        },
        hasTimestamp: function(d){
            var me = this;
            return Array.isArray(d) && cc.isTimestamp(d[1]) && d[1] > G.time;
        },
        //碎片红点
        checkSuiPian: function (type) {
            var itemArr = [];
            var isHave = false;
            var itemData = G.frame.beibao.DATA.item.list;

            if (type) {
                // hero
                for(var i in itemData) {
                    var conf = G.gc.item[itemData[i].itemid];
                    if (conf && conf.bagtype == '3' && conf.usetype == '12') {
                        itemArr.push(itemData[i]);
                    }
                }
            } else {
                for(var i in itemData) {
                    var conf = G.gc.item[itemData[i].itemid];
                    if (conf && conf.bagtype == '4') { //  && conf.usetype != '12'
                        itemArr.push(itemData[i]);
                    }
                }
            }

            for(var i in itemArr) {
                if(X.checkSuiPian(itemArr[i].itemid)) {
                    isHave = true;
                    break;
                }
            }
            return isHave;
        },
        checkUseItem: function () {
            var isHave = false;
            var checkArr = [1, 6, 11, 9, 13, 14];
            var itemData = G.frame.beibao.DATA.item.list;

            for (var tid in itemData) {
                if (X.inArray(checkArr, itemData[tid].usetype)) {
                    isHave = true;
                    break;
                }
            }

            if (X.cacheByUid("showToDayUseItemRedPoint")) isHave = false;

            if (isHave || this.checkSuiPian()) {
                G.setNewIcoImg(G.view.mainMenu.nodes.btn_beibao);
                G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint").y -= 5;
            } else {
                G.removeNewIco(G.view.mainMenu.nodes.btn_beibao);
            }

            return isHave;
        },
        //装备合成红点
        checkHeCheng: function () {
            var redPointArr = [false, false, false, false];
            var equipArr = {1:[], 2:[], 3:[], 4:[]};

            for(var i in equipArr){
                var data = G.class.equip.get();
                for(var idx in data) {
                    if(data[idx].need.length > 1 && data[idx].type == i) {
                        equipArr[i].push(data[idx]);
                    }
                }
            }

            for(var i = 0; i < redPointArr.length; i ++) {
                var data = equipArr[i + 1];
                (function (data) {
                    for(var j in data) {
                        if(X.checkHeCheng(data[j].need)) {
                            redPointArr[i] = true;
                            break;
                        }
                    }
                })(data)
            }

            return redPointArr;
        },
        //英雄合成红点
        checkRongHe: function () {
            var redPointArr = [false, false, false, false, false, false];
            for(var i = 0; i < redPointArr.length; i ++){
                var heroData = G.class.hero.getCanHcHerosByZhongzu(i + 1);
                (function (heroData) {
                    for(var j in heroData){
                        if(X.checkRongHe(heroData[j])) {
                            redPointArr[i] = true;
                            break;
                        }
                    }
                })(heroData)
            }

            return redPointArr;
        },
        //王者招募
        checkwzzm:function () {
            if(!G.DATA.asyncBtns) return;
            if(G.DATA.hongdian && G.DATA.hongdian.wangzhezhaomu && G.DATA.hongdian.wangzhezhaomu.length > 0){
                G.setNewIcoImg(G.DATA.asyncBtns.wangzhezhaomu);
            } else G.removeNewIco(G.DATA.asyncBtns.wangzhezhaomu);
        },
        checkXldx:function(){
            if(G.DATA.hongdian.xldx){
                G.setNewIcoImg(G.DATA.asyncBtns.xldx);
            } else G.removeNewIco(G.DATA.asyncBtns.xldx);
        },
        checkJdsdHd:function(){
            if(!G.DATA.asyncBtnsData) return;
            if(G.DATA.asyncBtnsData.gpjjc && (!X.cacheByUid('jdsdhd') || G.DATA.hongdian.gpjjc)){
                G.setNewIcoImg(G.view.mainView.nodes.panel_juedou.finds('panel_wz'),.85);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_juedou.finds('panel_wz'));
            }
        },
        objMeet: function (obj) {
            for (var key in obj) if (obj[key]) return true;

            return false;
        }
    }
})();
