/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-地图
    G.class.kaogu_map = X.bView.extend({
        redpoint:{//地图上的红点位置
            "1":[25,135],
            "2":[37,40],
            "3":[80,80],
            "4":[108,90],
            "5":[30,50],
            "6":[68,63],
            "7":[50,162],
            "8":[29,75]
        },
        ctor: function (data) {
            var me = this;
            G.frame.kaogu_map = me;
            me._data = data;
            me._super("kaogu_ditu.json", null, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            //帮助
            me.nodes.btn_bz.click(function(){
                G.frame.help.data({
                    intr:L("TS63")
                }).show();
            });
            //总览
            me.nodes.btn_zl.click(function(){
                G.frame.kaogu_yulan.show();
            });
            //技能
            me.nodes.btn_jn.click(function(){
                G.frame.kaogu_skill.show();
            });
            //仪器
            me.nodes.btn_yq.click(function(){
                G.frame.kaogu_yq.show();
            });
        },
        onOpen:function(){
            var me = this;
            for(var k in G.gc.yjkg.map){
                me.nodes['btn_' + k].setBright(false);
            }
        },
        onShow:function(){
            var me = this;
            me.getData(function(){
                me.checkdjsrRedPoint();
                me.checkzlgRedPoint();
                me.checkmapRedPoint();
                me.checkYQredpoint();
                me.setContents();
                me.bindBtn();
            });
        },
        setContents:function(){
            var me = this;
            me.showMap();
            me.campAndboat();
        },
        //考古状态
        getState:function(){
            var me = this;
            //判断考古状态
            if(me.DATA.data.mapid){
                var minsupply = 1;//每分钟消耗1点补给
                var needtime = G.gc.yjkg.map[me.DATA.data.mapid].distance / me.DATA.data.speed;//考古需要的时间
                var needsupply = Math.ceil(needtime / 60) * minsupply;//考古需要的补给
                if(me.DATA.data.supply >= needsupply){//补给充足
                    me.enough = true;//补给够不够
                    if(G.time - me.DATA.data.ctime > needtime){
                        me.ifkaogu = 1;//考古结束
                    }else {
                        me.ifkaogu = 2;//考古中
                    }
                }else {
                    me.enough = false;//补给不够
                    var insisttime = parseInt(me.DATA.data.supply / minsupply * 60);//补给能坚持的时间
                    if(G.time - me.DATA.data.ctime > insisttime){
                        me.ifkaogu = 1;//考古结束
                    }else {
                        me.ifkaogu = 2;//考古中
                    }
                }
            }else {
                me.ifkaogu = 0;//没有考古
            }
            return me.ifkaogu;
        },
        //八个地图
        showMap:function(){
            var me = this;
            for(var i = 1; i < 9; i++){
                me.nodes['panel_gq' + i].removeAllChildren();
                me.nodes['btn_' + i].setTouchEnabled(false);
                me.nodes['btn_' + i].index = i;
                me.nodes['panel_' + i].index = i;
                me.nodes['panel_' + i].zIndex = 10;
                if(X.inArray(me.DATA.unlockmap,i)){
                    me.nodes['btn_' + i].setBright(true);
                    me.nodes['panel_' + i].click(function(sender){
                        if(G.frame.kaogu_map.DATA.data.mapid && G.frame.kaogu_map.DATA.data.mapid != sender.index){
                            G.tip_NB.show(X.STR(L("KAOGU5"), G.gc.yjkg.map[G.frame.kaogu_map.DATA.data.mapid].name));
                        }else {
                            G.frame.kaogu_mapinfo.data({
                                data:me.DATA,
                                type:sender.index
                            }).once("willClose",function(){
                                me.setContents();
                            }).show();
                        }
                    });
                }else {
                    me.nodes['btn_' + i].setBright(false);
                    me.nodes['panel_' + i].click(function(){
                        G.tip_NB.show(L("KAOGU1"))
                    });
                }
            }
        },
        //营地和飞船
        campAndboat:function(){
            var me = this;
            me.nodes.panel_ydft.removeBackGroundImage();
            me.nodes.panel_ydft.removeAllChildren();
            if(!me.DATA.data.mapid){//未进行考古
                me.ifkaogu = false;
                me.nodes.txt_ydms.setString(L("KAOGU2"));
                me.nodes.panel_ydft.show();
                G.class.ani.show({
                    addTo:me.nodes.panel_ydft,
                    json:"tanxian_feiting_dh",
                    repeat:true,
                    autoRemove: false
                });
            }else {//正在进行考古
                me.ifkaogu = true;
                me.nodes['panel_' + me.DATA.data.mapid].zIndex = 100;
                me.nodes.panel_ydft.hide();
                me.nodes.txt_ydms.setString(X.STR(L("KAOGU4"), G.gc.yjkg.map[me.DATA.data.mapid].name));
                var boat = me.nodes.panel_gq.clone();
                boat.show();
                boat.setPosition(0,0);
                X.autoInitUI(boat);
                me.nodes['panel_gq' + me.DATA.data.mapid].removeAllChildren();
                me.nodes['panel_gq' + me.DATA.data.mapid].addChild(boat);
                boat.nodes.panel_gqwz.removeAllChildren();
                boat.nodes.panel_gqwz.removeBackGroundImage();
                G.class.ani.show({
                    addTo:boat.nodes.panel_gqwz,
                    json:"tanxian_feiting_dh",
                    repeat:true,
                    autoRemove: false
                });
                //考古倒计时
                if(me.getState() == 1){
                    boat.nodes.txt_ftsj.setString(L("KAOGU6"));
                }else {
                    var needtime;
                    if(me.enough){
                        needtime = parseInt(G.gc.yjkg.map[me.DATA.data.mapid].distance / me.DATA.data.speed);//考古需要的时间
                    }else {
                        var minsupply = 1;//每分钟消耗1点补给
                        needtime = parseInt(me.DATA.data.supply / minsupply * 60);
                    }
                    X.timeout(boat.nodes.txt_ftsj,me.DATA.data.ctime + needtime,function(){
                        boat.nodes.txt_ftsj.setString(L("KAOGU6"));
                    })
                }
                boat.nodes.txt_ftsj.setTextColor(cc.color("#86e300"));
            }
            me.nodes.panel_ydf.setTouchEnabled(true);
            me.nodes.panel_ydf.click(function(){
                if(me.ifkaogu){
                    G.tip_NB.show(X.STR(L("KAOGU5"), G.gc.yjkg.map[me.DATA.data.mapid].name));
                }else {
                    G.tip_NB.show(L("KAOGU3"));
                }
            })
        },
        getData:function(callback){
            var me = this;
            G.ajax.send('yjkg_open', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback(d.d);
                }
            });
        },
        //仪器红点
        checkYQredpoint:function(){
            var me = this;
            //仪器可解锁，或者辅助仪器可升级
            var arr = [];
            for(var i = 0; i < G.frame.kaogu_map.DATA.unlockmap.length; i++){
                arr.push(parseInt(G.frame.kaogu_map.DATA.unlockmap[i]));
            }
            me.yqid = Math.max.apply(Math.max, arr);//第几个仪器
            if(G.frame.kaogu_map.DATA.unlockmap.length == X.keysOfObject(G.gc.yjkg.map).length) me.yqid = G.frame.kaogu_map.DATA.unlockmap.length - 1;
            var skillnum = X.keysOfObject(G.frame.kaogu_map.DATA.skill[me.yqid]).length;//当前已解锁了几个技能
            var conf = G.gc.yjkg.unlock[me.yqid];
            var ifyqunlock = skillnum > conf.skillnum;//仪器是否可解锁
            var maxspeedlv= parseInt(X.keysOfObject(G.gc.yjkg.yiqi.speed)[X.keysOfObject(G.gc.yjkg.yiqi.speed).length - 1]);
            var maxexplv = parseInt(X.keysOfObject(G.gc.yjkg.yiqi.exp)[X.keysOfObject(G.gc.yjkg.yiqi.exp).length - 1]);
            var speedlv = G.frame.kaogu_map.DATA.yiqi.speed;
            var explv = G.frame.kaogu_map.DATA.yiqi.exp;
            var speedcanup = false;
            var expcanup = false;
            if(speedlv < maxspeedlv && G.frame.kaogu_map.DATA.energe >= G.gc.yjkg.yiqi.speed[speedlv+1].need){
                speedcanup = true;
            }
            if(explv < maxexplv && G.frame.kaogu_map.DATA.energe >= G.gc.yjkg.yiqi.speed[explv+1].need){
                expcanup = true;
            }
            if(ifyqunlock || speedcanup || expcanup){
                G.setNewIcoImg(me.nodes.btn_yq);
            }else {
                G.removeNewIco(me.nodes.btn_yq);
            }
        },
        //地精商店是否还有免费次数
        getTime:function(){
            var me = this;
            //判断今天的免费次数有没有用
            //算时间和服务器发的日期去比对
            var date = new Date(G.time*1000);
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var iffree;
            if(month >= 10){
                month = month;
            }else {
                month = "0" + month;
            }
            var day = date.getDate();
            if(day >= 10){
                day = day;
            }else {
                day = "0" + day;
            }
            var time = year + "-" + month + "-" + day;
            if(!G.frame.kaogu_map.DATA.key || time.toString() != G.frame.kaogu_map.DATA.key){
                iffree = true;
            }else {
                iffree = false;
            }
            return iffree;
        },
        //三个切页按钮上的红点
        //地精商人红点
        checkdjsrRedPoint:function(){
            var me = this;
            if(me.DATA.free){
                G.setNewIcoImg(G.frame.kaogu_main.nodes.page3);
                G.frame.kaogu_main.nodes.page3.finds('redPoint').setPosition(136,36);
            }else {
                G.removeNewIco(G.frame.kaogu_main.nodes.page3);
            }
        },
        //考古地图红点
        checkmapRedPoint:function(){
            var me = this;
            //里程碑按钮红点
            me.iflcbprize = false;
            for(var k in G.frame.kaogu_map.DATA.farthest){
                var val = G.frame.kaogu_map.DATA.farthest[k];
                if(G.gc.yjkg.milestone[k]){
                    for(var i = 0; i < G.gc.yjkg.milestone[k].length; i++){
                        var mile = G.gc.yjkg.milestone[k][i][0];
                        if(val >= mile && !X.inArray(G.frame.kaogu_map.DATA.milestone[k],i)){
                            me.iflcbprize = true;
                            break;
                        }
                    }
                }
            }
            if(me.getState() == 1 || me.iflcbprize){
                G.setNewIcoImg(G.frame.kaogu_main.nodes.page1);
                G.frame.kaogu_main.nodes.page1.finds('redPoint').setPosition(14,36);
            }else {
                G.removeNewIco(G.frame.kaogu_main.nodes.page1);
            }
            //八个地图的红点
            for(var k in G.gc.yjkg.map){
                G.removeNewIco(me.nodes['btn_' + k]);
                if(me.getState() == 1 && me.DATA.data.mapid == k){//考古结束,
                    G.setNewIcoImg(me.nodes['btn_' + k]);
                    me.nodes['btn_' + k].finds('redPoint').setPosition(cc.p(me.redpoint[k][0],me.redpoint[k][1]));
                }else {
                    if(G.gc.yjkg.milestone[k]){
                        for(var i = 0; i < G.gc.yjkg.milestone[k].length; i++){//或者有里程碑奖励的时候
                            var mile = G.gc.yjkg.milestone[k][i][0];
                            if(G.frame.kaogu_map.DATA.farthest[k] >= mile && !X.inArray(G.frame.kaogu_map.DATA.milestone[k],i)){
                                G.setNewIcoImg(me.nodes['btn_' + k]);
                                me.nodes['btn_' + k].finds('redPoint').setPosition(cc.p(me.redpoint[k][0],me.redpoint[k][1]));
                                break;
                            }
                        }
                    }
                }
            }
        },
        //展览馆红点
        checkzlgRedPoint:function(){
            var me = this;
            //有可升星文物或者有可解锁文物
            G.removeNewIco(G.frame.kaogu_main.nodes.page2);
            for(var k in G.gc.yjkg.exhibition){
                var teamid = G.gc.yjkg.exhibition[k].data;//文物组id
                var stararr = G.frame.kaogu_main.wwDATA.data[k] || [];//文物星级
                var num = 0;
                for(var i = 0; i < teamid.length; i++){
                    if(stararr[i] > 1){
                        num++;
                    }
                }
                if(num >= 5 && !X.inArray(G.frame.kaogu_main.wwDATA.rec,k)){
                    G.setNewIcoImg(G.frame.kaogu_main.nodes.page2);
                    G.frame.kaogu_main.nodes.page2.finds('redPoint').setPosition(136,36);
                    break;
                }
                //有没有文物可以升级
                for(var j = 0; j < teamid.length; j++){
                    var id = teamid[j];
                    var star = stararr[j];
                    var maxstar = X.keysOfObject(G.gc.wenwu[id])[X.keysOfObject(G.gc.wenwu[id]).length-1];//最大星级
                    if(star < parseInt(maxstar)){
                        var need = G.gc.wenwu[id][star].need;//升级需要消耗
                        var hasnum = G.class.getOwnNum(need[0].t,need[0].a);
                        if(hasnum >= need[0].n){
                            G.setNewIcoImg(G.frame.kaogu_main.nodes.page2);
                            G.frame.kaogu_main.nodes.page2.finds('redPoint').setPosition(136,36);
                            break;
                        }
                    }
                }
            }
        }
    });
})();