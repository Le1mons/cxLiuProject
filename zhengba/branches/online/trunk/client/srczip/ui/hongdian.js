/**
 * Created by zhangming on 2018-04-13
 */
(function(){
// 主城创建完毕拉取红点
    G.event.on('loginOver', function (d) {
        G.hongdian.getHongdian(1);
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
        G.hongdian.getData(["succtask", "dailytask"], 1);
        if(G.frame.renwu.isShow) {
            G.frame.renwu.getData(function () {
                G.frame.renwu.setContents();
            });
        }
    });

    G.event.on("kfkh_redpoint", function () {
        G.hongdian.getData("kfkh", 1);
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
        })
    });

    G.event.on("activity_redpoint", function (d) {
        G.setNewIcoImg(G.view.mainView.nodes.btn_xshd);
    });

    G.event.on("artifact_redpoint", function (d) {
        G.hongdian.getData("artifact", 1);
    });

    G.event.on("mrsc_redpoint", function (d) {
        G.setNewIcoImg(G.view.mainView.ui.finds("meirishouchong"));
    });

    G.event.on("herorecruit_redpoint", function (d) {
        G.hongdian.getData("herorecruit", 1);
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
                            me.checkMRSL();
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
                            me.checkYWZB();
                            break;
                        case "huodong":
                            me.checkXSHD();
                            break;
                        case "meirishouchong":
                            me.checkMRSC();
                            break;
                        case "watcher":
                            me.checkDMJ();
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
            me.checkSuiPian();
            me.checkHeCheng();
            me.checkRongHe();
            me.checkRank();
            me.checkTask();
            me.checkSQ();
            me.checkYJJ();
            me.checkYWZB();
            me.checkMRSC();
            me.checkDMJ();
            me.checkFST();
            me.checkEmail();

            G.event.emit('hdchange_over');
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
                if (data[i] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
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
        checkYWZB: function() {
            var me = this;

            if(G.DATA.hongdian.crosszbjifen > 0) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_zbs.finds("panel_wz"), .85);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_zbs.finds("panel_wz"));
            }
        },
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
                }
            }else {
                G.removeNewIco(G.view.mainView.ui.finds("btn_sq"));
                if(G.frame.tanxian.isShow) {
                    G.removeNewIco(G.frame.tanxian.nodes.btn_sq);
                }
            }
        },
        checkTask: function() {
            var isHave = false;
            var arr = ["succtask", "dailytask"];
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
        checkMRSL: function() {
            var isHave = false;
            var data = G.DATA.hongdian.mrsl;

            for(var i in data) {
                if(data[i] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_mrsl.finds("panel_wz"), .85);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_mrsl.finds("panel_wz"));
            }

        },
        checkDMJ: function() {
            var isHave = false;
            var data = G.DATA.hongdian.watcher;

            for(var i in data) {
                if(i == "trader") continue;
                if(data[i] > 0) {
                    isHave = true;
                    break;
                }
            }

            if(isHave) {
                G.setNewIcoImg(G.view.mainView.nodes.panel_dmj.finds("panel_wz"), .85);
            }else {
                G.removeNewIco(G.view.mainView.nodes.panel_dmj.finds("panel_wz"));
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
            var arr = ["friend", "treature"];
            var data = G.DATA.hongdian;
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
            if(isHave){
                G.setNewIcoImg(G.view.mainView.ui.finds("btn_cz"));
            }else{
                G.removeNewIco(G.view.mainView.ui.finds("btn_cz"))
            }
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
                G.setNewIcoImg(G.view.mainView.nodes.btn_mrsc);
            }else {
                G.removeNewIco(G.view.mainView.nodes.btn_mrsc);
            }
        },
        checkJCHD: function(){
            //精彩活动
            var data = G.DATA.hongdian;
            var arr = ["dengjiprize", "yueka_da", "yueka_xiao", "sign"];
            var is = false;
            for(var i = 0; i < arr.length; i ++){
                if(data[arr[i]] && data[arr[i]] > 0){
                    is = true;
                    break;
                }
            }
            if(is){
                G.setNewIcoImg(G.view.mainView.nodes.btn_jchd);
            }else{
                G.removeNewIco(G.view.mainView.nodes.btn_jchd);
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
                    // case "email":
                    //     if(d > 0){
                    //         G.event.emit("hdchange", {type: 1, tag: "email"});
                    //     }else{
                    //         G.event.emit("hdchange", {type: 0, tag: "email"});
                    //     }
                    //     break;
                    case "hecheng":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "hecheng"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "hecheng"});
                        }
                        break;
                    case "herojitan":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "herojitan"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "herojitan"});
                        }
                        break;
                    case "shizijun":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "shizijun"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "shizijun"});
                        }
                        break;
                    case "tanxian":
                        if(d > 0){
                            G.event.emit("hdchange", {type: 1, tag: "tanxian"});
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "tanxian"});
                        }
                        break;
                    case "crosswz":
                        if(d > 0){
                            if(G.loginAllData.opentime + 24 * 3600 * 7 < G.time) {
                                G.event.emit("hdchange", {type: 1, tag: "jjc"});
                            }
                        }else{
                            G.event.emit("hdchange", {type: 0, tag: "jjc"});
                        }
                        break;
                    case "kingstatue":
                        if(d > 0) {
                            G.event.emit("hdchange", {type: 1, tag: "kingstatue"});
                        } else {
                            G.event.emit("hdchange", {type: 0, tag: "kingstatue"});
                        }
                        break;
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
        checkSuiPian: function () {
            var itemArr = [];
            var isHave = false;
            var itemData = G.frame.beibao.DATA.item.list;
            for(var i in itemData) {
                // if(itemData[i].usetype == "3" || itemData[i].usetype == "4")
                    itemArr.push(itemData[i]);
            }
            for(var i in itemArr) {
                if(X.checkSuiPian(itemArr[i].itemid)) {
                    isHave = true;
                    break;
                }
            }
            if(isHave) {
                G.setNewIcoImg(G.view.mainMenu.nodes.btn_beibao);
                G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint").y -= 5;
            }
            else G.removeNewIco(G.view.mainMenu.nodes.btn_beibao);

            return isHave;
        },
        //装备合成红点
        checkHeCheng: function () {
            var redPointArr = [false, false, false, false];
            var equipArr = {1:[], 2:[], 3:[], 4:[]}

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
        }
    }
})();
