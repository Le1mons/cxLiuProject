/**
 * Created by  on 2019//.
 */
//监听别人布阵成功的消息
G.event.on('gpjjc_embattle',function (data) {
    if(G.frame.juedoushengdian_fightplan.isShow){
        var me = G.frame.juedoushengdian_fightplan;
        me.theyOk = true;
        var dd = X.toJSON(data);
        me.enemyfightdata = dd.info.fightdata;
        me.showEnemyContent();
    }
});
//监听本轮布阵结束
G.event.on('gongpingjjc_pipei_finish',function (d) {
    G.frame.loadingIn.remove();
    if(G.frame.juedoushengdian_fightplan.isShow){
        var me = G.frame.juedoushengdian_fightplan;
        me.nodes.wz_xuanze.hide();
        me.nodes.panel_yuanjun1.show();
        var data = X.toJSON(d);
        me.DATA.pipeiinfo.stime = data.stime;
        me.DATA.pipeiinfo.fightdata = data.fightdata;
        me.state = data.state - 1;//即将开启第几轮布阵
        if (me.nodes.shizhong_sz.__timeoutTimer) {
            me.nodes.shizhong_sz.clearTimeout(me.nodes.shizhong_sz.__timeoutTimer);
            delete me.nodes.shizhong_sz.__timeoutTimer;
        }
        if (me.ui.times) {
            me.ui.clearTimeout(me.ui.times);
            delete me.ui.times;
        }
        if(me.state == 4){
            //上阵结束，开始战斗
            me.starFight();
        }else {
            me.refreshState();
            //超过40S没收到finish就掉匹配open
            me.ui.times = me.ui.setTimeout(function (){
                me.getData(function () {
                    if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                        me.remove();
                        G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                    }else {
                        me.refreshContent();
                    }
                })
            },40000);
        }
    }
});
//别人帮我自动上阵了
G.event.on('gpjjc_autoembattle',function (d) {
    if(G.frame.juedoushengdian_fightplan.isShow){
        var data = X.toJSON(d);
        var me = G.frame.juedoushengdian_fightplan;
        me.selfOK = true;
        me.DATA.pipeiinfo.fightdata = data.info.fightdata;
        me.showMyfightRole();//刷新英雄阵容
        me.getHeroListata();
        me.showHeroList();
    }
});
(function () {
    //决斗盛典布阵
    var ID = 'juedoushengdian_fightplan';
    var fun = X.bUi.extend({
        sqimg: {
            1: "shenbing_hmzr",
            2: "shenbing_lrsg",
            3: "shenbing_snfz",
            4: "shenbing_zwjj",
            5: "shenbing_slcq",
            6: "shenbing_jdzc"
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
            this.preLoadRes = ['zhenfa.png','zhenfa.plist'];
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                me.getHeroListata();
                _super.apply(me, arg);
            });
        },
        onShow: function () {
            var me = this;
            me.curSqId = me.DATA.pipeiinfo.fightdata.sqid || 1;
            me.addShenQi();
            if(G.frame.juedoushengdian_main.DATA.pipeiinfo && G.frame.juedoushengdian_main.DATA.pipeiinfo.state){
                me.refreshContent();
            }else {
                me.setTimeEvent();
                me.nodes.txt_wzls.setString(X.STR(L('JUEDOUSHENGDIAN32'),(me.DATA.pipeiinfo.state - 1)));
            }
            if(me.DATA.pipeiinfo.state && me.DATA.pipeiinfo.state != 5){
                if (me.ui.times) {
                    me.ui.clearTimeout(me.ui.times);
                    delete me.ui.times;
                }
                me.ui.times = me.ui.setTimeout(function (){
                    me.getData(function () {
                        if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                            me.remove();
                            G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                        }else {
                            me.refreshContent();
                        }
                    })
                },40000);
            }
        },
        onOpen: function () {
            var me = this;
            me.xianzhiArr = [];
            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.nodes.listview_zz);
            me.bindBtn();
            me.initZzBtn();
            me.btnarr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.createLayout();
            me.nodes.text_zdl1.setString("???");
            me.nodes.text_zdl2.setString("???");
            me.ui.finds('Panel_3').hide();
            me.nodes.btn_yj_kz.setTitleText(L('QD'));
            me.showHeadInfo();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.hide();
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_yj_kz.click(function () {//每次只能上阵2位英雄
                var obj = {};
               for(var i = 0; i < me.leftItmeArr.length; i++){
                   var item = me.leftItmeArr[i];
                   if(item.data && item.index){
                       obj[item.pos] = item.data.hid;
                   }
               }
               if(X.keysOfObject(obj).length < 2) return G.tip_NB.show(L('JUEDOUSHENGDIAN21'));
               if(me.state == 3)obj.sqid = me.curSqId.toString();
               me.ajax('gpjjc_embattle',[obj],function (str,data) {
                    if(data.s == 1){
                        me.nodes.wz_xuanze.show();
                        me.nodes.panel_yuanjun1.hide();
                        me.DATA.pipeiinfo = data.d.pipeiinfo;
                        me.selfOK = true;//表示自己已经上阵好了
                        me.showMyfightRole();//刷新英雄阵容
                        me.getHeroListata();
                        me.showHeroList();
                        G.frame.loadingIn.show(30000);
                    }else {
                        me.getData(function () {
                            if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                                me.remove();
                                G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                            }else {
                                me.refreshContent();
                            }
                        })
                    }
               });
            });
            //神器
            me.nodes.btn_tishi.click(function () {
                G.frame.juedoushengdian_sq.show();
            })
        },
        //30s倒计时
        setTimeEvent:function(){
            var me = this;
            if (me.nodes.shizhong_sz.__timeoutTimer) {
                me.nodes.shizhong_sz.clearTimeout(me.nodes.shizhong_sz.__timeoutTimer);
                delete me.nodes.shizhong_sz.__timeoutTimer;
            }
            var endTime = me.DATA.pipeiinfo.stime + 30;
            X.timeout(me.nodes.shizhong_sz,endTime,function () {
                if (me.nodes.shizhong_sz.__timeoutTimer) {
                    me.nodes.shizhong_sz.clearTimeout(me.nodes.shizhong_sz.__timeoutTimer);
                    delete me.nodes.shizhong_sz.__timeoutTimer;
                }
                if(!me.selfOK && !me.theyOk){//自己没上阵，给自己上一下
                    me.auotMyself(function () {
                        me.autoTheyself();
                    })
                }else if(!me.selfOK){
                    me.auotMyself();
                }else if(!me.theyOk){//别人没上阵给别人上一下
                    me.autoTheyself();
                }
            },null,{
                timeLeftStr:"s"
            })

        },
        auotMyself:function(callback){
            var me = this;
            //随机选出两个没上过的英雄上阵
            //先选自己勾选了的
            var obj = {};
            var heroarr = [];
            var hasposarr = [];//已经勾选了的位置
            var posarr = [];//选出没上阵的位置
            for(var i = 0; i < me.leftItmeArr.length; i++){
                var item = me.leftItmeArr[i];
                if(item.data && item.index && X.keysOfObject(obj).length < 2){
                    obj[item.pos] = item.data.hid;
                    hasposarr.push(item.pos);
                }
            }
            var len = X.keysOfObject(obj).length;
            if(len < 2){
                for(var i = 0; i < me.herolistData.length; i++){
                    if(me.herolistData[i].state == 0 && heroarr.length < (2-len)){
                        heroarr.push(me.herolistData[i].hid);
                    }
                }
                for(var i = 1; i < 7; i++){
                    if(!X.inArray(X.keysOfObject(me.DATA.pipeiinfo.fightdata),i) && !X.inArray(hasposarr,i) && posarr.length < (2-len)){
                        posarr.push(i);
                    }
                }
            }

            for(var i = 0; i < heroarr.length; i++){
                obj[posarr[i]] = heroarr[i]
            }
            if(me.state == 3)obj.sqid = me.curSqId.toString();
            me.ajax('gpjjc_embattle',[obj],function (str,data) {
                if(data.s == 1){
                    G.frame.loadingIn.show(30000);
                    me.DATA.pipeiinfo = data.d.pipeiinfo;
                    me.showMyfightRole();
                    me.getHeroListata();
                    me.showHeroList();
                }else {//刷新当前状态
                    me.getData(function () {
                        if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                            me.remove();
                            G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                        }else {
                            me.refreshContent();
                        }
                    })
                }
                callback && callback();
            });
        },
        //进入新一轮的布阵或者开始战斗，状态重置
        refreshState:function(){
            var me = this;
            me.selfOK = false;
            me.theyOk = false;
            me.xianzhiArr = [];
            me.setTimeEvent();
            me.showEnemyContent();
            me.getHeroListata();
            me.showMyfightRole();
            me.showHeroList();
            me.ui.finds('Panel_3').setVisible(me.state == 3);
            me.nodes.txt_wzls.setString(X.STR(L('JUEDOUSHENGDIAN32'),me.state));
            me.nodes.btn_yj_kz.setTitleText(me.state >= 3 ? L('FIGHT') : L('QD'));
        },
        //当出现一些异常或者中途退出游戏再进的时候
        refreshContent:function(){
            var me = this;
            me.selfOK = false;
            me.theyOk = false;
            me.state = me.DATA.pipeiinfo.state - 1;//什么阶段
            me.nodes.txt_wzls.setString(X.STR(L('JUEDOUSHENGDIAN32'),me.state));
            me.ui.finds('Panel_3').setVisible(me.state == 3);
            me.nodes.btn_yj_kz.setTitleText(me.state >= 3 ? L('FIGHT') : L('QD'));
            me.fightData = me.DATA.pipeiinfo.fightdata;//自己阵容
            me.enemyfightdata = me.DATA.rivalpipeiinfo.fightdata;//对方阵容
            if(me.state == 4 && me.DATA.pipeiinfo.isfight == 1){
                me.starFight();
            }else {
                me.getHeroListata();
                me.showHeroList();
                me.showMyfightRole();
                me.showEnemyContent();
                if(G.time - me.DATA.pipeiinfo.stime > 30){//给自己和别人都自动上
                    me.auotMyself(function () {
                        me.autoTheyself();
                    })
                }else {
                    me.setTimeEvent();
                }
            }
        },
        autoTheyself:function(){
            var me = this;
            me.ajax('gpjjc_autoembattle',[me.DATA.pipeiinfo.rivaluid],function (str,data) {
                if(data.s == 1){
                    me.enemyfightdata = data.d.fightdata;
                }else {
                    me.getData(function () {
                        if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                            me.remove();
                            G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                        }else {
                            me.refreshContent();
                        }
                    })
                }
            })
        },
        //显示我自己的阵容
        showMyfightRole:function(){
            var me = this;
            for (var i = 0; i < me.leftItmeArr.length; i ++) {
                var item = me.leftItmeArr[i];
                item.index = null;
                var pos = item.pos;
                if(me.DATA.pipeiinfo.fightdata[pos]){
                    var hid = me.DATA.pipeiinfo.fightdata[pos];
                    if(item.role && item.pos == pos && item.data.hid != hid){
                        item.role.removeFromParent();
                        item.data = G.gc.hero[hid];
                        item.showRole();
                    }else {
                        item.data = G.gc.hero[hid];
                        item.showRole();
                    }
                }else {
                    item.data = undefined;
                    item.showRole();
                }
            }
            me.itemEnable();
        },
        //显示对方阵容
        showEnemyContent:function(){
            var me = this;
            for(var k in me.enemyfightdata){
                var lay = me.rightItmeArr[k-1];
                if(lay && !lay.data){
                    var heroData = G.gc.hero[me.enemyfightdata[k]];
                    if(heroData) {
                        lay.data = heroData;
                        lay.showRole(true);
                    } else {
                        lay.data = undefined;
                        lay.showRole();
                    }
                }
            }
            me.setTheyBuff();
        },
        //英雄禁止点击事件
        itemEnable:function(){
            var me = this;
            for (var i = 0; i < me.leftItmeArr.length; i++){
                var item = me.leftItmeArr[i];
                if(item.data){
                    for (var k in me.DATA.pipeiinfo.fightdata){
                        if(item.pos == k && item.data.hid == me.DATA.pipeiinfo.fightdata[k]){
                            item.setTouchEnabled(false);//已经上阵了的就不能换位置
                        }
                    }
                }
            }
        },
        createLayout: function () {
            var me = this;
            var parent = me.nodes.panel_rwzw;

            me.leftItmeArr = [];
            for (var i = 0; i < 6; i ++) {
                var lay = new G.class.plan_role(null, i + 1, "0", true);
                parent.addChild(lay);
                me.leftItmeArr.push(lay);
                me.addTouchEvent(lay);
            }
            me.rightItmeArr = [];
            for (var i = 0; i < 6; i ++) {
                var lay = new G.class.plan_role(null, i + 1, "1", true);
                parent.addChild(lay);
                me.rightItmeArr.push(lay);
                lay.posImg.hide();
            }
        },
        addItem: function (hid,index) {
            var me = this;
            for (var i = 0; i < me.leftItmeArr.length; i ++) {
                var item = me.leftItmeArr[i];
                if(!item.data && !item.index) {
                    item.data = G.gc.hero[hid];
                    item.index = index;
                    item.showRole();
                    break;
                }
            }
            me.setMyBuff();
        },
        removeItem: function (hid,index) {
            var me = this;
            for (var i = 0; i < me.leftItmeArr.length; i ++) {
                var item = me.leftItmeArr[i];
                if(item.data && item.index == index) {
                    item.data = undefined;
                    item.index = undefined;
                    item.showRole();
                }
            }
            me.setMyBuff();
        },
        //种族按钮
        initZzBtn:function(){
            var me = this;
            me.nodes.listview_zz.removeAllChildren();
            me.nodes.list_ico.hide();
            me.btnarr = [];
            for(var i = 0; i < 7; i++){
                var ico = me.nodes.list_ico.clone();
                X.autoInitUI(ico);
                ico.show();
                ico.nodes.panel_zz.removeBackGroundImage();
                ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i+1) + '.png', 1);
                ico.nodes.panel_zz.setTouchEnabled(false);
                ico.index = i;
                ico.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        for(var j = 0; j < me.btnarr.length; j++){
                            if(me.btnarr[j].index == sender.index){
                                me.btnarr[j].nodes.img_yuan_xz.show();
                            }else {
                                me.curZhongzu = sender.index;
                                me.showHeroList();
                                me.btnarr[j].nodes.img_yuan_xz.hide();
                            }
                        }
                    }
                });
                me.btnarr.push(ico);
                me.nodes.listview_zz.pushBackCustomItem(ico);
            }
        },
        showHeroList:function(){
            var me = this;
            me.filterData();
            me.ui.finds('img_zwnr').setVisible(me.heroarr.length < 1);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 6, function (ui, data) {
                me.setHeroItem(ui, data);
            }, null, null, 10, 3);
            table.setData(me.heroarr);
            table.reloadDataWithScroll(true);
        },
        setHeroItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(false);
            var conf = JSON.parse(JSON.stringify(G.gc.hero[data.hid]));
            conf.star = 14;
            G.frame.juedoushengdian_main.addSkin(conf);
            var widget = G.class.shero(conf);
            if(widget.lv) widget.lv.hide();
            widget.setAnchorPoint(0,0);
            widget.setPosition(0,0);
            ui.nodes.panel_ico.show();
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);
            ui.nodes.panel_ico.setTouchEnabled(false);
            widget.setGou(data.state == 1);
            ui.nodes.img_suo.setVisible(false);
            ui.nodes.img_suo.setVisible(data.state == 2);

            if (conf.zhongzu == 7 && X.inArray(me.xianzhiArr,data.hid) ){
                ui.nodes.img_suo.setVisible(true);
                ui.nodes.img_suo.setTouchEnabled(true);
                ui.nodes.img_suo.heroData = conf;
                ui.nodes.img_suo.touch(function (sender,type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        if (sender.heroData.zhongzu == 7 && X.inArray(me.xianzhiArr,data.hid)){
                            G.tip_NB.show('传说种族同名英雄只可以上阵一个');
                        }
                    }
                });
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if (sender.data.state == 1) {//已经勾选了的就取消勾选
                        widget.setGou(false);
                        sender.data.state = 0;
                        me.xianzhiArr.splice(X.arrayFind(me.xianzhiArr,sender.data.hid),1);
                        me.removeItem(sender.data.hid,sender.data.index);
                    }else {
                        if(sender.data.state == 2) return G.tip_NB.show(L('JUEDOUSHENGDIAN23'));//已经锁定了就不能点
                        var selectnum = 0;
                        for (var i = 0; i < me.herolistData.length; i++){
                            if(me.herolistData[i].state == 1){
                                selectnum++;
                            }
                        }
                        if(selectnum >= 2) return G.tip_NB.show(L('JUEDOUSHENGDIAN20'));
                        widget.setGou(true);
                        sender.data.state = 1;
                        me.addItem(sender.data.hid,sender.data.index);
                        me.xianzhiArr.push(sender.data.hid);
                    }
                    me.table.reloadDataWithScroll(false);
                }
            })
        },
        filterData:function () {
            var me = this;
            me.heroarr = [];
            if(me.curZhongzu == 0){
                me.heroarr = me.herolistData;
            }else {
                for(var i = 0; i < me.herolistData.length; i++){
                    var conf = G.gc.hero[me.herolistData[i].hid];
                    if(conf.zhongzu == me.curZhongzu){
                        me.heroarr.push(me.herolistData[i]);
                    }
                }
            }
            me.heroarr.sort(function (a,b) {
                var orderA = a.state == 2 ? 0 : 1;
                var orderB = b.state == 2 ? 0 : 1;
                if(orderA != orderB){
                    return orderA > orderB ? -1:1;
                }else if(a.hid != b.hid){
                    return a.hid*1 < b.hid*1 ? -1:1;
                }
            });
            return me.heroarr;
        },
        getHeroListata:function () {
            var me = this;
            me.herolistData = [];//hid是英雄id，index表示唯一索引，state表示改英雄是否上阵(state :0没上阵没勾选，1勾选了，2上阵了)
            var arr = me.DATA.pipeiinfo.randhid;
            var fightdata = [];//已经上阵的英雄id
            var data = JSON.parse(JSON.stringify(me.DATA.pipeiinfo.fightdata));
            for(var k in data){
                if(k != 'sqid'){
                    fightdata.push(data[k]);
                }
            }
            var num = 1;
            for(var k in arr){
                if(G.gc.hero[k]){
                    for (var i = 0; i < arr[k]; i++){
                        var hid = k;
                        var obj = {};
                        obj.hid = hid;
                        obj.index = num;
                        if (X.inArray(fightdata,hid)){
                            obj.state = 2;//表示已经上阵
                            fightdata.splice(X.arrayFind(fightdata,hid),1);//删掉一个
                        }else {
                            obj.state = 0;
                        }
                        me.herolistData.push(obj);
                        num++;
                    }
                }
            }
        },
        getData:function (callback) {
            var me = this;
            G.ajax.send('gpjjc_pipeiopen',[],function (data) {
                var data = JSON.parse(data);
                if(data.s == 1){
                    me.DATA = data.d;
                    if(me.DATA.pipeiinfo == {} || !me.DATA.pipeiinfo.state){
                        me.remove();
                        G.frame.juedoushengdian_main.DATA.pipeiinfo = me.DATA.pipeiinfo;
                        return;
                    }
                    callback && callback();
                }else if(data.s == -205){
                    X.uiMana.closeAllFrame();
                    G.frame.juedoushengdian_main.show();
                }
            })
        },
        showHeadInfo:function(){
            var me = this;
            var myhead = G.class.shead(P.gud);
            myhead.setPosition(0,0);
            myhead.setAnchorPoint(0,0);
            me.nodes.panel_head1.removeAllChildren();
            me.nodes.panel_head1.addChild(myhead);
            var theyhead = G.class.shead(me.DATA.rivalpipeiinfo.headdata);
            theyhead.setPosition(0,0);
            theyhead.setAnchorPoint(0,0);
            me.nodes.panel_head2.removeAllChildren();
            me.nodes.panel_head2.addChild(theyhead);
        },
        addShenQi: function() {
            var me = this;
            var panel = me.ui.finds("Panel_3").finds("ico_zx$");
            panel.removeBackGroundImage();
            if(me.sqimg[me.curSqId]) {
                panel.setBackGroundImage("img/shenbing/" + me.sqimg[me.curSqId] + ".png");
                me.nodes.txt_zx.setString(G.gc.shenqicom.shenqi[me.curSqId].name);
            } else {
                me.nodes.txt_zx.setString(L("SQ"));
            }
        },
        //获得选择数据种族对应的数量
        getMyZz2Num: function () {
            var me = this;
            var heroIdArr = [];
            for(var i = 0; i < me.heroarr.length; i++){
                if(me.heroarr[i].state != 0){
                    heroIdArr.push(me.heroarr[i].hid);
                }
            }
            var obj = {};
            for (var i = 0; i < heroIdArr.length; i++) {
                var hid = heroIdArr[i];
                var heroData = G.gc.hero[hid];
                obj[heroData.zhongzu] = obj[heroData.zhongzu] || 0;
                obj[heroData.zhongzu]++;
            }
            return obj;
        },
        setMyBuff: function () {
            var me = this;
            me.nodes.list_zf1.hide();
            me.nodes.list_zf1.setTouchEnabled(false);
            var zzConf = me.zzConf = {};
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);
            var zz2num = me.getMyZz2Num();
            for(var i = 0; i < keys.length; i ++) {
                var data = G.class.zhenfa.getById(keys[i]).data;
                for (var j = 0; j < data.length; j ++) {
                    var isOk = true;
                    var cond = data[j].cond;
                    for (var zz in cond) {
                        if(!zz2num[zz] || zz2num[zz] < cond[zz]) {
                            isOk = false;
                            break;
                        }
                    }
                    if(isOk) {
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
                if(a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else {
                    return a.zz > b.zz ? -1 : 1;
                }
            });
            var arr = [];
            var zzkeys = X.keysOfObject(zzdata);
            for (var i = 0; i < 3; i ++) {
                (function (data) {
                    var list = me.nodes.list_zf1.clone();
                    X.autoInitUI(list);
                    list.show();
                    if (data) {
                        list.nodes.ico_zf1.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(zzdata[data].zz) + '.png', 1);
                    } else {
                        if(i != 0) list.hide();
                        list.nodes.ico_zf1.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                    }
                    list.nodes.ico_zf1.click(function () {
                        G.frame.fight_zzkezhi.data(zzConf).show();
                    });
                    arr.push(list);
                })(zzkeys[i]);
            }
            X.left(me.nodes.panel_xg1, arr, 1, 5, 1);
        },
        //获得选择数据种族对应的数量
        getTheyZz2Num: function () {
            var me = this;
            var heroarr = [];
            for(var k in me.enemyfightdata){
                if(k != 'sqid'){
                    heroarr.push(me.enemyfightdata[k]);
                }
            }
            var obj = {};
            for (var i = 0; i < heroarr.length; i++) {
                var hid = heroarr[i];
                var heroData = G.gc.hero[hid];
                obj[heroData.zhongzu] = obj[heroData.zhongzu] || 0;
                obj[heroData.zhongzu]++;
            }
            return obj;
        },
        setTheyBuff: function () {
            var me = this;
            me.nodes.list_zf2.hide();
            me.nodes.list_zf2.setTouchEnabled(false);
            var zzConf = me.zzConf = {};
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);
            var zz2num = me.getTheyZz2Num();
            for(var i = 0; i < keys.length; i ++) {
                var data = G.class.zhenfa.getById(keys[i]).data;
                for (var j = 0; j < data.length; j ++) {
                    var isOk = true;
                    var cond = data[j].cond;
                    for (var zz in cond) {
                        if(!zz2num[zz] || zz2num[zz] < cond[zz]) {
                            isOk = false;
                            break;
                        }
                    }
                    if(isOk) {
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
                if(a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else {
                    return a.zz > b.zz ? -1 : 1;
                }
            });
            var arr = [];
            var zzkeys = X.keysOfObject(zzdata);
            for (var i = 0; i < 3; i ++) {
                (function (data) {
                    var list = me.nodes.list_zf2.clone();
                    X.autoInitUI(list);
                    list.show();
                    if (data) {
                        list.nodes.ico_zf2.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(zzdata[data].zz) + '.png', 1);
                    } else {
                        if(i != 0) list.hide();
                        list.nodes.ico_zf2.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                    }
                    list.nodes.ico_zf2.click(function () {
                        G.frame.fight_zzkezhi.data(zzConf).show();
                    });
                    arr.push(list);
                })(zzkeys[i]);
            }
            X.left(me.nodes.panel_xg2, arr, 1, 5, 1);
        },
        addTouchEvent: function (item) {
            var me = this;
            var bPos, cloneItem, pos;

            item.setTouchEnabled(true);
            item.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_BEGAN) {
                    if (sender.data) {
                        bPos = sender.getTouchBeganPosition();
                        var firstParent = sender.getParent();

                        var firstPos = firstParent.convertToWorldSpace(sender.getPosition());
                        pos = me.ui.convertToNodeSpace(firstPos);

                        cloneItem = me.cloneItem = new G.class.plan_role(sender.data, sender.pos, sender.side, true, true);
                        sender.role.hide();
                        sender.infoUi.hide();
                        cloneItem.hide();
                        cloneItem.zIndex = 60;
                        cloneItem.setPosition(bPos);
                        me.ui.finds("panel_ui").addChild(cloneItem);
                    }
                } else if(type == ccui.Widget.TOUCH_MOVED) {
                    if(sender.data && cc.isNode(cloneItem)){
                        var mPos = sender.getTouchMovePosition();
                        var offset = cc.p(mPos.x - bPos.x,mPos.y - bPos.y);

                        if (!cloneItem.visible) cloneItem.show();
                        cloneItem.ani_hide();
                        cloneItem.setPosition(cc.p(pos.x + offset.x,pos.y + offset.y));

                        var isCollision = me.checkItemsCollision(cloneItem);
                        if (isCollision) {
                            isCollision.ani_run();
                        } else {
                            for (var i in me.leftItmeArr) {
                                me.leftItmeArr[i].ani_norm();
                            }
                        }
                    }
                } else if(type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (sender.data && cc.isNode(cloneItem)) {

                        var isCollision = me.checkItemsCollision(cloneItem);
                        if (isCollision != null) {
                            me.changeItem(sender, isCollision);
                        } else {
                            sender.role.show();
                            sender.infoUi.show();
                        }
                        if(me.cloneItem) {
                            me.cloneItem.removeFromParent();
                            delete me.cloneItem;
                        }
                    }
                } else if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(sender.data) {
                        sender.data = undefined;
                        for (var i = 0; i < me.heroarr.length; i++){
                            if(me.heroarr[i].index == sender.index){
                                me.heroarr[i].state = 0;
                            }
                        }
                        sender.index = undefined;
                        sender.removeRole();
                        me.showHeroList();
                    }
                }
            });
        },
        changeItem: function (item1, item2) {
            var me = this;

            if(!item1.data) return;

            var tid1 = item1.data;
            var tid2 = item2.data;
            var index1 = item1.index;
            var index2 = item2.index;

            item1.removeRole();
            item2.removeRole();
            if(tid2) {
                item2.data = tid1;
                item1.data = tid2;
                item2.index = index1;
                item1.index = index2;
                item1.showRole();
                item2.showRole();
            }else {
                item1.data = undefined;
                item2.data = tid1;
                item1.index = undefined;
                item2.index = index1;
                item2.showRole();
            }
        },
        checkItemsCollision: function (cloneItem) {
            var me = this;
            var itemsArr = me.leftItmeArr;
            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.pos != item.pos && item.pos != 7) {
                    var pos = item.getParent().convertToNodeSpace(cloneItem.getParent().convertToWorldSpace(cloneItem.getPosition()));
                    if (me.checkRectangleCrash(item.getPosition(), pos, item.getSize())) {
                        for (var k in me.DATA.pipeiinfo.fightdata){
                            if(item.data && item.pos == k && item.data.hid == me.DATA.pipeiinfo.fightdata[k]){
                                return G.tip_NB.show(L('JUEDOUSHENGDIAN27'));
                            }
                        }
                        return item;
                    }
                }
            }
            return null;
        },
        checkRectangleCrash: function (pos, curPos, size) {
            if (curPos.x >= pos.x - size.width / 2
                && curPos.x <= pos.x + size.width / 2
                && curPos.y >= pos.y - size.height / 2
                && curPos.y <= pos.y + size.height / 2) return true;
            else return false;
        },
        starFight:function () {
            var me = this;
            G.ajax.send('gpjjc_fight',[],function (str,data) {
                if(data.s == 1){
                    G.frame.fight.data({
                        pvType:'jdsd',
                        headdata:data.d.fightres.headdata,
                        prize:data.d.prize,
                        jifeninfo:data.d.fightres.jifeninfo,
                        winside:data.d.fightres.winside,
                    }).once('show', function() {
                        if(G.frame.juedoushengdian_fightplan.isShow)G.frame.juedoushengdian_fightplan.remove();
                    }).once('willClose',function () {
                        G.frame.juedoushengdian_main.getData(function () {
                            G.frame.juedoushengdian_main.setMyinfo();
                            G.frame.juedoushengdian_main.showRank();
                            if(G.frame.juedoushengdian_tz.isShow){
                                G.frame.juedoushengdian_tz.DATA = G.frame.juedoushengdian_main.DATA;
                                G.frame.juedoushengdian_tz.setContents();
                            }
                            G.hongdian.getData('gpjjc',1);
                        })
                    }).demo(data.d.fightres);
                }
            });
        }
    });
    G.frame[ID] = new fun('zhandou_bz.json', ID);
})();