/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-仪器
    var ID = 'kaogu_mapinfo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
            me.checklcbRedPoint();//里程碑红点
            me.nodes.panel_ft.removeBackGroundImage();
        },
        bindBtn:function(){
            var me = this;
            me.nodes.btn_gb.click(function () {
                me.remove();
            });
            //开始考古
            me.nodes.btn_zdkg.click(function(){
                if(me.ifkaogu == 0){
                    me.ajax('yjkg_start',[me.type.toString(),me.ifAdd,0],function(str,data){
                        if(data.s == 1){
                            G.frame.kaogu_map.DATA.data = data.d;
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                        }
                    })
                }else if(me.ifkaogu == 1){//领奖
                    me.ajax('yjkg_receive',[],function(str,data){
                        if(data.s == 1){
                            me.ui.clearAllTimers();
                            me.ifAdd = false;
                            G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                            G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                            //补给够不够，时间就是走到终点的时间，不够就是补给能支撑的时间
                            if(me.enough){
                                var time = G.gc.yjkg.map[me.type].distance / G.frame.kaogu_map.DATA.data.speed;//本次考古时间
                            }else {
                                var time = me.insisttime;
                            }
                            var road = data.d.distance;//考古路程
                            //更新当前的最大里程
                            if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                G.frame.kaogu_map.DATA.farthest[me.type] = road;
                            }
                            //更新当前地图一共走了多少
                            if(G.frame.kaogu_map.DATA.milage[me.type]){
                                G.frame.kaogu_map.DATA.milage[me.type] += road;
                            }else {
                                G.frame.kaogu_map.DATA.milage[me.type] = road
                            }
                            //考古次数
                            if(G.frame.kaogu_map.DATA.num[me.type]){
                                G.frame.kaogu_map.DATA.num[me.type] += 1;
                            }else {
                                G.frame.kaogu_map.DATA.num[me.type] = 1;
                            }
                            var num  = G.frame.kaogu_map.DATA.num[me.type];
                            G.frame.kaogu_jilu.data({
                                prize:data.d.prize,
                                type:me.type,
                                time:time,
                                road:road,
                                num:num,
                                energe:data.d.energe,
                                exp:data.d.exp
                            }).show();
                            G.frame.kaogu_map.DATA.data = {};
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                            me.checklcbRedPoint();
                            G.frame.kaogu_map.checkmapRedPoint();
                            G.frame.kaogu_map.checkYQredpoint();
                            G.hongdian.getData('yjkg',1);
                        }
                    })
                }else {//中断考古
                    G.frame.alert.data({
                        sizeType:3,
                        cancelCall:null,
                        okCall: function (){
                            me.ajax('yjkg_receive',[],function(str,data){
                                if(data.s == 1){
                                    me.ifAdd = false;
                                    G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                                    G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                                    var time = G.time - G.frame.kaogu_map.DATA.data.ctime;//本次考古时间
                                    var road = data.d.distance;//考古路程
                                    //更新当前的最大里程
                                    if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                        G.frame.kaogu_map.DATA.farthest[me.type] = road;
                                    }
                                    //更新当前地图一共走了多少
                                    if(G.frame.kaogu_map.DATA.milage[me.type]){
                                        G.frame.kaogu_map.DATA.milage[me.type] += road;
                                    }else {
                                        G.frame.kaogu_map.DATA.milage[me.type] = road
                                    }
                                    //考古次数
                                    if(G.frame.kaogu_map.DATA.num[me.type]){
                                        G.frame.kaogu_map.DATA.num[me.type] += 1;
                                    }else {
                                        G.frame.kaogu_map.DATA.num[me.type] = 1;
                                    }
                                    var num  = G.frame.kaogu_map.DATA.num[me.type];
                                    G.frame.kaogu_jilu.data({
                                        prize:data.d.prize,
                                        type:me.type,
                                        time:time,
                                        road:road,
                                        num:num,
                                        energe:data.d.energe,
                                        exp:data.d.exp
                                    }).show();
                                    G.frame.kaogu_map.DATA.data = {};
                                    me.DATA = G.frame.kaogu_map.DATA;
                                    me.setContents();
                                    me.checklcbRedPoint();
                                    G.frame.kaogu_map.checkmapRedPoint();
                                    G.frame.kaogu_map.checkYQredpoint();
                                    G.hongdian.getData('yjkg',1);
                                }
                            })
                        },
                        autoClose:true,
                        richText: X.STR(L("KAOGU17"),G.gc.yjkg.break[0].n,G.class.getItem(G.gc.yjkg.break[0].t,G.gc.yjkg.break[0].a).name)
                    }).show();
                }
            });
            me.nodes.btn_gmtp.click(function(){
                if(me.ifkaogu == 0){
                    me.ajax('yjkg_start',[me.type.toString(),me.ifAdd,0],function(str,data){
                        if(data.s == 1){
                            G.frame.kaogu_map.DATA.data = data.d;
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                        }
                    })
                }else if(me.ifkaogu == 1){//领奖
                    me.ajax('yjkg_receive',[],function(str,data){
                        if(data.s == 1){
                            me.ui.clearAllTimers();
                            me.ifAdd = false;
                            G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                            G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                            //补给够不够，时间就是走到终点的时间，不够就是补给能支撑的时间
                            if(me.enough){
                                var time = G.gc.yjkg.map[me.type].distance / G.frame.kaogu_map.DATA.data.speed;//本次考古时间
                            }else {
                                var time = me.insisttime;
                            }
                            var road = data.d.distance;//考古路程
                            //更新当前的最大里程
                            if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                G.frame.kaogu_map.DATA.farthest[me.type] = road;
                            }
                            //更新当前地图一共走了多少
                            if(G.frame.kaogu_map.DATA.milage[me.type]){
                                G.frame.kaogu_map.DATA.milage[me.type] += road;
                            }else {
                                G.frame.kaogu_map.DATA.milage[me.type] = road
                            }
                            //考古次数
                            if(G.frame.kaogu_map.DATA.num[me.type]){
                                G.frame.kaogu_map.DATA.num[me.type] += 1;
                            }else {
                                G.frame.kaogu_map.DATA.num[me.type] = 1;
                            }
                            var num  = G.frame.kaogu_map.DATA.num[me.type];
                            G.frame.kaogu_jilu.data({
                                prize:data.d.prize,
                                type:me.type,
                                time:time,
                                road:road,
                                num:num,
                                energe:data.d.energe,
                                exp:data.d.exp
                            }).show();
                            G.frame.kaogu_map.DATA.data = {};
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                            me.checklcbRedPoint();
                            G.frame.kaogu_map.checkmapRedPoint();
                            G.frame.kaogu_map.checkYQredpoint();
                            G.hongdian.getData('yjkg',1);
                        }
                    })
                }else {//中断考古
                    G.frame.alert.data({
                        sizeType:3,
                        cancelCall:null,
                        okCall: function (){
                            me.ajax('yjkg_receive',[],function(str,data){
                                if(data.s == 1){
                                    me.ifAdd = false;
                                    G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                                    G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                                    var time = G.time - G.frame.kaogu_map.DATA.data.ctime;//本次考古时间
                                    var road = data.d.distance;//考古路程
                                    //更新当前的最大里程
                                    if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                        G.frame.kaogu_map.DATA.farthest[me.type] = road;
                                    }
                                    //更新当前地图一共走了多少
                                    if(G.frame.kaogu_map.DATA.milage[me.type]){
                                        G.frame.kaogu_map.DATA.milage[me.type] += road;
                                    }else {
                                        G.frame.kaogu_map.DATA.milage[me.type] = road
                                    }
                                    //考古次数
                                    if(G.frame.kaogu_map.DATA.num[me.type]){
                                        G.frame.kaogu_map.DATA.num[me.type] += 1;
                                    }else {
                                        G.frame.kaogu_map.DATA.num[me.type] = 1;
                                    }
                                    var num  = G.frame.kaogu_map.DATA.num[me.type];
                                    G.frame.kaogu_jilu.data({
                                        prize:data.d.prize,
                                        type:me.type,
                                        time:time,
                                        road:road,
                                        num:num,
                                        energe:data.d.energe,
                                        exp:data.d.exp
                                    }).show();
                                    G.frame.kaogu_map.DATA.data = {};
                                    me.DATA = G.frame.kaogu_map.DATA;
                                    me.setContents();
                                    me.checklcbRedPoint();
                                    G.frame.kaogu_map.checkmapRedPoint();
                                    G.frame.kaogu_map.checkYQredpoint();
                                    G.hongdian.getData('yjkg',1);
                                }
                            })
                        },
                        autoClose:true,
                        richText: X.STR(L("KAOGU17"),G.gc.yjkg.break[0].n,G.class.getItem(G.gc.yjkg.break[0].t,G.gc.yjkg.break[0].a).name)
                    }).show();
                }
            });
            me.nodes.btn_sbkg.click(function(){
                if(me.ifkaogu == 0){
                    me.ajax('yjkg_start',[me.type.toString(),me.ifAdd,1],function(str,data){
                        if(data.s == 1){
                            G.frame.kaogu_map.DATA.data = data.d;
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                        }
                    })
                }else if(me.ifkaogu == 1){//领奖
                    me.ajax('yjkg_receive',[],function(str,data){
                        if(data.s == 1){
                            me.ui.clearAllTimers();
                            me.ifAdd = false;
                            G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                            G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                            //补给够不够，时间就是走到终点的时间，不够就是补给能支撑的时间
                            if(me.enough){
                                var time = G.gc.yjkg.map[me.type].distance / G.frame.kaogu_map.DATA.data.speed;//本次考古时间
                            }else {
                                var time = me.insisttime;
                            }
                            var road = data.d.distance;//考古路程
                            //更新当前的最大里程
                            if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                G.frame.kaogu_map.DATA.farthest[me.type] = road;
                            }
                            //更新当前地图一共走了多少
                            if(G.frame.kaogu_map.DATA.milage[me.type]){
                                G.frame.kaogu_map.DATA.milage[me.type] += road;
                            }else {
                                G.frame.kaogu_map.DATA.milage[me.type] = road
                            }
                            //考古次数
                            if(G.frame.kaogu_map.DATA.num[me.type]){
                                G.frame.kaogu_map.DATA.num[me.type] += 1;
                            }else {
                                G.frame.kaogu_map.DATA.num[me.type] = 1;
                            }
                            var num  = G.frame.kaogu_map.DATA.num[me.type];
                            G.frame.kaogu_jilu.data({
                                prize:data.d.prize,
                                type:me.type,
                                time:time,
                                road:road,
                                num:num,
                                energe:data.d.energe,
                                exp:data.d.exp
                            }).show();
                            G.frame.kaogu_map.DATA.data = {};
                            me.DATA = G.frame.kaogu_map.DATA;
                            me.setContents();
                            me.checklcbRedPoint();
                            G.frame.kaogu_map.checkmapRedPoint();
                            G.frame.kaogu_map.checkYQredpoint();
                            G.hongdian.getData('yjkg',1);
                        }
                    })
                }else {//中断考古
                    G.frame.alert.data({
                        sizeType:3,
                        cancelCall:null,
                        okCall: function (){
                            me.ajax('yjkg_receive',[],function(str,data){
                                if(data.s == 1){
                                    me.ifAdd = false;
                                    G.frame.kaogu_map.DATA.energe += data.d.energe;//最新的能源
                                    G.frame.kaogu_map.DATA.exp += data.d.exp;//最新的经验
                                    var time = G.time - G.frame.kaogu_map.DATA.data.ctime;//本次考古时间
                                    var road = data.d.distance;//考古路程
                                    //更新当前的最大里程
                                    if(!G.frame.kaogu_map.DATA.farthest[me.type] || road > G.frame.kaogu_map.DATA.farthest[me.type]){
                                        G.frame.kaogu_map.DATA.farthest[me.type] = road;
                                    }
                                    //更新当前地图一共走了多少
                                    if(G.frame.kaogu_map.DATA.milage[me.type]){
                                        G.frame.kaogu_map.DATA.milage[me.type] += road;
                                    }else {
                                        G.frame.kaogu_map.DATA.milage[me.type] = road
                                    }
                                    //考古次数
                                    if(G.frame.kaogu_map.DATA.num[me.type]){
                                        G.frame.kaogu_map.DATA.num[me.type] += 1;
                                    }else {
                                        G.frame.kaogu_map.DATA.num[me.type] = 1;
                                    }
                                    var num  = G.frame.kaogu_map.DATA.num[me.type];
                                    G.frame.kaogu_jilu.data({
                                        prize:data.d.prize,
                                        type:me.type,
                                        time:time,
                                        road:road,
                                        num:num,
                                        energe:data.d.energe,
                                        exp:data.d.exp
                                    }).show();
                                    G.frame.kaogu_map.DATA.data = {};
                                    me.DATA = G.frame.kaogu_map.DATA;
                                    me.setContents();
                                    me.checklcbRedPoint();
                                    G.frame.kaogu_map.checkmapRedPoint();
                                    G.frame.kaogu_map.checkYQredpoint();
                                    G.hongdian.getData('yjkg',1);
                                }
                            })
                        },
                        autoClose:true,
                        richText: X.STR(L("KAOGU17"),G.gc.yjkg.break[0].n,G.class.getItem(G.gc.yjkg.break[0].t,G.gc.yjkg.break[0].a).name)
                    }).show();
                }
            }),
            //里程碑
            me.nodes.btn_worldmap.click(function(){
                G.frame.kaogu_lcb.data({
                    type:me.type
                }).show();
            });
            //帮助
            me.nodes.btn_ph.click(function(){
                G.frame.help.data({
                    intr:L("TS64")
                }).show();
            });
            me.nodes.btn_1.enabled = true;
            me.nodes.btn_1.setBright(false);
            me.nodes.btn_1.click(function(){
                me.nodes.img_gou1.show();
                me.nodes.img_gou2.hide();
                me.nodes.btn_1.setBright(false);
                me.nodes.btn_2.setBright(true);
                me.nodes.txt_pt.setTextColor(cc.color("#e7ebf4"));
                X.enableOutline(me.nodes.txt_pt,"#0a1021");
                me.nodes.txt_js.setTextColor(cc.color("#a79682"));
                X.enableOutline(me.nodes.txt_js,"#613621");
                me.ifAdd = false;
                me.showSupply();
            });
            me.nodes.btn_2.click(function(){
                me.nodes.img_gou2.show();
                me.nodes.img_gou1.hide();
                me.nodes.btn_1.setBright(true);
                me.nodes.btn_2.setBright(false);
                me.nodes.txt_js.setTextColor(cc.color("#e7ebf4"));
                X.enableOutline(me.nodes.txt_js,"#0a1021");
                me.nodes.txt_pt.setTextColor(cc.color("#a79682"));
                X.enableOutline(me.nodes.txt_pt,"#613621");
                me.ifAdd = true;
                me.showSupply();
            })
        },
        onOpen:function(){
            var me = this;
            me.showToper();
            me.bindBtn();
            me.DATA = me.data().data;
            me.type = me.data().type;
            me.initUi();
            me.nodes.txt_kgdt_name.setString(G.gc.yjkg.map[me.type].name);
            if(me.DATA.data.mapid == me.type){
                me.kaoguData = me.DATA.data;
                me.ifAdd = me.kaoguData.speedup;
            }else {
                me.ifAdd = false;//默认不加速
            }
            me.nodes.panel_yjd.removeBackGroundImage();
            me.nodes.panel_yjd.setBackGroundImage('img/kaogu/img_tanxian_gk3.png',1);
            for(var i = 1; i < 9; i++){
                me.nodes['img_luxian' + i].removeAllChildren();
                me.nodes['img_luxian' + i].setVisible(me.type == i);
            }
            me.nodes.bg_hou.removeBackGroundImage();
            me.nodes.bg_hou.setBackGroundImage('img/bg/img_kaogu_bg' + me.type + ".jpg");
            me.nodes.panel_gqwz.removeBackGroundImage();
        },
        onShow:function(){
            var me = this;
            me.setContents();
            me.setYiji();
            //放起点
            var yj = me.nodes.panel_yjd.clone();
            yj.show();
            me.nodes['img_luxian' + me.type].addChild(yj);
            var route = G.gc.yijiroute[me.type];
            var startpos = route[1];
            if(me.type == 4){
                yj.setPosition(cc.p(startpos.zuobiao[0]+22,startpos.zuobiao[1]-14));
            }else {
                yj.setPosition(cc.p(startpos.zuobiao[0],startpos.zuobiao[1]-14));
            }
        },
        setContents:function(){
            var me = this;
            me.getState();//获取当前考古状态
            me.showSupply();
            me.showStateInfo();
            me.showFlag();//最远距离放旗子
        },
        showFlag:function(){
            var me = this;
            if(G.frame.kaogu_map.DATA.farthest[me.type]){//有最远距离
                var flag = me.nodes.panel_glsz.clone();
                flag.show();
                X.autoInitUI(flag);
                flag.nodes.panel_gqwz.removeBackGroundImage();
                flag.nodes.panel_gqwz.setBackGroundImage('img/kaogu/img_tanxian_qizi.png',1);
                flag.setName('flag');
                var longest = G.frame.kaogu_map.DATA.farthest[me.type];
                flag.nodes.txt_gls.setString(longest > 1000 ? (longest / 1000).toFixed(1) + L("KAOGU16") : longest + L("KAOGU15"));
                flag.nodes.txt_gls.setTextColor(cc.color("#fff71d"));
                X.enableOutline(flag.nodes.txt_gls,"#4f2f1e");
                var conf = G.gc.yijiroute[me.type];
                var key = parseInt(longest / G.gc.yjkg.map[me.type].distance * X.keysOfObject(conf).length);//当前走到了第几个点
                if(key > X.keysOfObject(conf).length) key = X.keysOfObject(conf)[X.keysOfObject(conf).length - 1];
                if(key <= 0) key = 1;
                var endpos = cc.p(conf[key].zuobiao[0], conf[key].zuobiao[1]);//旗子的坐标
                flag.setPosition(endpos);
                flag.zIndex = 99;
                me.flag = flag;
                if(!me.nodes['img_luxian' + me.type].getChildByName('flag')){
                    me.nodes['img_luxian' + me.type].addChild(flag);
                }else {
                    me.flag.setPosition(endpos);
                    me.flag.nodes.txt_gls.setString(longest > 1000 ? (longest / 1000).toFixed(1) + L("KAOGU16") : longest + L("KAOGU15"));
                }
            }
        },
        setYiji:function(){
            var me = this;
            for(var k in G.gc.yjkg.map[me.type].yiji){
                var layout = new ccui.Layout();
                layout.setName('yiji' + k);
                layout.setAnchorPoint(0.5,0);
                me.nodes['img_luxian' + me.type].addChild(layout);
                var yj = me.nodes.panel_yjd.clone();
                yj.setPosition(0,0);
                yj.show();
                //遗迹点位置
                var conf = G.gc.yjkg.map[me.type].yiji[k];
                //var pointnum = X.keysOfObject(G.gc.yijiroute[me.type]).length;//路径点个数
                //var route = G.gc.yijiroute[me.type];
                //var pointindex = parseInt(conf.distance / G.gc.yjkg.map[me.type].distance * pointnum);
                //if(pointindex <= 0) pointindex = 1;
                //var pos = cc.p(route[pointindex].zuobiao[0], route[pointindex].zuobiao[1]);
                var pos = cc.p(conf.position[0],conf.position[1]);
                layout.addChild(yj);
                layout.setPosition(pos);
                yj.id = k;
                yj.setTouchEnabled(true);
                yj.click(function(sender){
                    G.frame.kaogu_place.data({
                        mapid:me.type,
                        yjid:sender.id
                    }).show();
                })
            }
        },
        //考古状态
        getState:function(){
            var me = this;
            //判断考古状态
            if(me.DATA.data.mapid != me.type){
                me.ifkaogu = 0;//没有考古
            }else {
                var minsupply = 1;//每分钟消耗1点补给
                var needtime = G.gc.yjkg.map[me.type].distance / me.DATA.data.speed;//考古需要的时间
                var needsupply = Math.ceil(needtime / 60) * minsupply;//考古需要的补给
                if(me.DATA.data.supply >= needsupply){//补给充足
                    me.enough = true;//补给够不够
                    if(G.time - me.DATA.data.ctime > needtime){
                        me.ifkaogu = 1;//考古结束
                    }else {
                        if(me.DATA.data.double){
                            me.ifkaogu = 3;//双倍考古中
                        }else{
                            me.ifkaogu = 2;//考古中
                        }
                    }
                }else {
                    me.enough = false;
                    var minsupply = 1;//每分钟消耗1点补给
                    var insisttime = me.insisttime = parseInt(me.DATA.data.supply / minsupply * 60);//补给能坚持的时间
                    if(G.time - me.DATA.data.ctime > insisttime){
                        me.ifkaogu = 1;//考古结束
                    }else {
                        if(me.DATA.data.double){
                            me.ifkaogu = 3;//双倍考古中
                        }else{
                            me.ifkaogu = 2;//考古中
                        }
                    }
                }
            }
        },
        showStateInfo:function(){
            var me = this;
            me.nodes.panel_ro.setVisible(me.ifkaogu == 0);
            me.nodes.panel_ro1.setVisible(me.ifkaogu != 0);
            me.nodes.panel_cz_dh.removeAllChildren();
            G.removeNewIco(me.nodes.btn_gmtp);
            G.removeNewIco(me.nodes.btn_sbkg);
            //三种状态 没有考古 考古中 考古结束（时间到了或者补给不足）
            if(me.ifkaogu == 0){//没有考古
                me.removeBoatRun();
                me.nodes.btn_sbkg.setTouchEnabled(true);
                me.nodes.btn_gmtp.setTouchEnabled(true);
                me.nodes.btn_gmtp.setBright(true);
                me.nodes.btn_sbkg.setBright(true);
                me.nodes.btn_sbkg.show();
                me.nodes.btn_gmtp.show();
                me.nodes.img_gou1.show();
                me.nodes.img_gou2.hide();
                me.nodes.btn_zdkg.hide();
                me.nodes.txt_sbsj.x=460;
                me.nodes.btn_sbkg.x=460;
                me.nodes.btn_gmtp.x=190;
                me.nodes.txt_kgjx.x=190;

                me.nodes.txet_gmtp.setString(L("KAOGU12"));
                me.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n13));

                me.nodes.txet_sbkg.setString(L("KAOGU58"));
                me.nodes.txet_sbkg.setTextColor(cc.color(G.gc.COLOR.n13));

                me.nodes.btn_sbkg.loadTextureNormal('img/public/btn/btn2_on.png',1);
                me.nodes.btn_gmtp.loadTextureNormal('img/public/btn/btn1_on.png',1);
                me.nodes.txt_kgjx.hide();
                me.nodes.txt_sbsj.hide();
                me.nodes.panel_xxkgsd.show();
                me.nodes.panel_jsxh.show();
                me.nodes.txt_sbsj.setString(L("KAOGU59"));
                me.removeBoat();
            }else if(me.ifkaogu == 2) {//考古中
                me.nodes.btn_sbkg.setTouchEnabled(false);
                me.nodes.btn_sbkg.setBright(false);
                me.nodes.btn_sbkg.hide();
                me.nodes.btn_gmtp.hide();
                me.nodes.btn_zdkg.show();
                me.nodes.txt_kgjx.x=320;
                me.nodes.btn_gmtp.x=320;

                me.nodes.txt_sbsj.hide();

                me.nodes.txt_ydms.setString(L("KAOGU20"));
                me.nodes.txet_gmtp.setString(L("KAOGU13"));
                me.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n14));


                me.nodes.btn_gmtp.loadTextureNormal('img/public/btn/btn3_on.png',1);
                me.nodes.txt_kgjx.show();
                me.nodes.panel_xxkgsd.hide();
                me.nodes.panel_jsxh.hide();
                var distance = (G.time - me.DATA.data.ctime)*me.DATA.data.speed;
                if(distance < 0) distance = 0;
                me.nodes.txt_kgjx.setString(X.STR(L("KAOGU14"),distance < 1000 ? parseInt(distance) + L("KAOGU15") : (distance/1000).toFixed(1) + L("KAOGU16")));
                me.showBoat();
                me.changeBoatPos(me.boat);
                me.ui.setInterval(function () {//5秒刷新一次
                    me.getState();
                    if(me.ifkaogu == 2){//是否在考古中
                        if(cc.isNode(me.boat)){
                            me.changeBoatPos(me.boat);
                        }
                        var distance = (G.time - me.DATA.data.ctime)*me.DATA.data.speed;
                        if(distance < 0) distance = 0;
                        me.nodes.txt_kgjx.setString(X.STR(L("KAOGU14"),distance < 1000 ? parseInt(distance) + L("KAOGU15") : (distance/1000).toFixed(1) + L("KAOGU16")));
                    }else {
                        me.ui.clearAllTimers();
                        me.removeBoatRun();
                        me.showSupply();
                        me.showStateInfo();
                    }
                },5000);
                G.class.ani.show({
                    addTo:me.nodes.panel_cz_dh,
                    json:"ani_kaogu_chanzi",
                    repeat:true,
                    autoRemove:false,
                })
            }else if(me.ifkaogu == 3) {//双倍考古中
                me.nodes.btn_gmtp.setTouchEnabled(false);
                me.nodes.btn_gmtp.setBright(false);
                me.nodes.btn_gmtp.hide();
                me.nodes.txt_sbsj.x=320;
                me.nodes.btn_sbkg.x=320;
                
                me.nodes.txet_sbkg.setString(L("KAOGU13"));
                me.nodes.txet_sbkg.setTextColor(cc.color(G.gc.COLOR.n14));
                me.nodes.btn_sbkg.loadTextureNormal('img/public/btn/btn3_on.png',1);
                me.nodes.txt_sbsj.show();
                me.nodes.txt_kgjx.hide();
                me.nodes.panel_xxkgsd.hide();
                me.nodes.panel_jsxh.hide();
                var distance = (G.time - me.DATA.data.ctime)*me.DATA.data.speed;
                if(distance < 0) distance = 0;
                me.nodes.txt_sbsj.setString(X.STR(L("KAOGU14"),distance < 1000 ? parseInt(distance) + L("KAOGU15") : (distance/1000).toFixed(1) + L("KAOGU16")));
                me.showBoat();
                me.changeBoatPos(me.boat);
                me.ui.setInterval(function () {//5秒刷新一次
                    me.getState();
                    if(me.ifkaogu == 2){//是否在考古中
                        if(cc.isNode(me.boat)){
                            me.changeBoatPos(me.boat);
                        }
                        var distance = (G.time - me.DATA.data.ctime)*me.DATA.data.speed;
                        if(distance < 0) distance = 0;
                        me.nodes.txt_sbsj.setString(X.STR(L("KAOGU14"),distance < 1000 ? parseInt(distance) + L("KAOGU15") : (distance/1000).toFixed(1) + L("KAOGU16")));
                    }else {
                        me.ui.clearAllTimers();
                        me.removeBoatRun();
                        me.showSupply();
                        me.showStateInfo();
                    }
                },5000);
                G.class.ani.show({
                    addTo:me.nodes.panel_cz_dh,
                    json:"ani_kaogu_chanzi",
                    repeat:true,
                    autoRemove:false,
                })
            }else {//考古结束
                if(me.DATA.data.double){
                    me.nodes.txt_ydms.setString(L("KAOGU21"));
                    me.nodes.txet_sbkg.setString(L("KAOGU18"));
                    me.nodes.txt_sbsj.show();

                    me.nodes.txt_sbsj.x=320;
                    me.nodes.btn_sbkg.x=320;
                    me.nodes.txt_kgjx.hide();
                    me.nodes.btn_gmtp.hide();
                    me.nodes.txt_sbsj.hide();
                    me.nodes.panel_xxkgsd.hide();
                    me.nodes.panel_jsxh.hide();
                    me.nodes.txt_sbsj.setString(L("KAOGU19"));
                    G.setNewIcoImg(me.nodes.btn_sbkg);
                    me.nodes.btn_sbkg.finds('redPoint').setPosition(130,50);
                    //如果补给不足，飞艇要在补给消耗完的位置停下，补给足够 就在终点停下
                    var conf = G.gc.yijiroute[me.type];
                    if(me.enough){
                        var key = X.keysOfObject(conf)[X.keysOfObject(conf).length - 1];
                        var endpos = cc.p(conf[key].zuobiao[0],conf[key].zuobiao[1]);
                    }else {
                        var time = parseInt(G.frame.kaogu_map.DATA.data.supply / 1 * 60);//补给支撑的时间
                        var arrive = time * G.frame.kaogu_map.DATA.data.speed;//飞艇能到达的地方
                        var key = parseInt(arrive / G.gc.yjkg.map[me.type].distance * X.keysOfObject(conf).length);//当前走到了第几个点
                    if(key <= 0) key = 1;
                        var endpos = cc.p(conf[key].zuobiao[0], conf[key].zuobiao[1]);
                    }
                    if(!me.boat || !cc.isNode(me.boat)){
                        me.showBoat();
                    }else {
                        me.boat.nodes.txt_ftsj.setString(L("YJS"));
                    }
                    me.removeBoatRun();
                    me.boat.setPosition(endpos);
                    G.class.ani.show({
                        addTo:me.nodes.panel_cz_dh,
                        json:"ani_kaogu_chanzi",
                        repeat:true,
                        autoRemove:false,
                        onload: function (node, action) {
                            action.gotoFrameAndPause(0);
                        }
                    })
                }else{
                    me.nodes.txt_kgjx.x=320;
                    me.nodes.btn_gmtp.x=320;
                    me.nodes.txt_sbsj.hide();
                    me.nodes.btn_sbkg.hide();
                    me.nodes.btn_gmtp.hide();
                    me.nodes.btn_zdkg.show();
                    me.nodes.txt_sbsj.hide();
                    me.nodes.txt_ydms.setString(L("KAOGU21"));
                    me.nodes.txet_gmtp.setString(L("KAOGU18"));
                    me.nodes.txt_kgjx.show();
                    me.nodes.panel_xxkgsd.hide();
                    me.nodes.panel_jsxh.hide();
                 
                    me.nodes.txt_kgjx.setString(L("KAOGU19"));
                    G.setNewIcoImg(me.nodes.btn_gmtp);
                    me.nodes.btn_gmtp.finds('redPoint').setPosition(130,50);
                    //如果补给不足，飞艇要在补给消耗完的位置停下，补给足够 就在终点停下
                    var conf = G.gc.yijiroute[me.type];
                    if(me.enough){
                        var key = X.keysOfObject(conf)[X.keysOfObject(conf).length - 1];
                        var endpos = cc.p(conf[key].zuobiao[0],conf[key].zuobiao[1]);
                    }else {
                        var time = parseInt(G.frame.kaogu_map.DATA.data.supply / 1 * 60);//补给支撑的时间
                        var arrive = time * G.frame.kaogu_map.DATA.data.speed;//飞艇能到达的地方
                        var key = parseInt(arrive / G.gc.yjkg.map[me.type].distance * X.keysOfObject(conf).length);//当前走到了第几个点
                       if(key <= 0) key = 1;
                        var endpos = cc.p(conf[key].zuobiao[0], conf[key].zuobiao[1]);
                    }
                    if(!me.boat || !cc.isNode(me.boat)){
                        me.showBoat();
                    }else {
                        me.boat.nodes.txt_ftsj.setString(L("YJS"));
                    }
                    me.removeBoatRun();
                    me.boat.setPosition(endpos);
                    G.class.ani.show({
                        addTo:me.nodes.panel_cz_dh,
                        json:"ani_kaogu_chanzi",
                        repeat:true,
                        autoRemove:false,
                        onload: function (node, action) {
                            action.gotoFrameAndPause(0);
                        }
                    })
                }
                
            }
        },
        removeBoatRun : function(){
            var me = this;
            if(cc.isNode(me.boat)){
                me.boat.clearAllTimers();
                me.boat.nodes.panel_ico1.removeBackGroundImage();
                me.boat.nodes.panel_ico2.removeBackGroundImage();
                me.boat.nodes.panel_ico1.stopAllActions();
                me.boat.nodes.panel_ico2.stopAllActions();
            }
        },
        showBoat:function(){
            var me = this;
            //飞艇
            var boat = me.nodes.panel_gq1.clone();
            boat.setName('boat');
            X.autoInitUI(boat);
            boat.show();
            boat.zIndex = 100;
            if(me.ifkaogu == 2 || me.ifkaogu == 3){
                var needtime;
                if(me.enough){
                    needtime = parseInt(G.gc.yjkg.map[me.type].distance / me.DATA.data.speed);//考古需要的时间
                }else {
                    var minsupply = 1;//每分钟消耗1点补给
                    needtime = parseInt(me.DATA.data.supply / minsupply * 60);
                }
                X.timeout(boat.nodes.txt_ftsj,needtime + me.DATA.data.ctime,function(){
                    //me.getState();
                    //me.ui.clearAllTimers();
                    //me.showSupply();
                    //me.showStateInfo();
                    boat.nodes.txt_ftsj.setString(L("YJS"));
                });
            }else {
                boat.nodes.txt_ftsj.setString(L("YJS"));
            }
            boat.nodes.txt_ftsj.setTextColor(cc.color("#86e300"));
            boat.nodes.panel_gqwz.removeAllChildren();
            G.class.ani.show({
                addTo:boat.nodes.panel_gqwz,
                json:"tanxian_feiting_dh",
                repeat:true,
                autoRemove: false
            });
            if(!me.nodes['img_luxian' + me.type].getChildByName('boat')){
                me.nodes['img_luxian' + me.type].addChild(boat);
            }
            me.boat = boat;
            //飘经验能源
            boat.nodes.panel_ico1.removeBackGroundImage();
            boat.nodes.panel_ico2.removeBackGroundImage();
            boat.nodes.panel_ico1.setBackGroundImage('img/public/token/token_kgjy.png',1);
            boat.nodes.panel_ico2.setBackGroundImage('img/public/token/token_kgny.png',1);
            boat.nodes.panel_ico1.hide();
            boat.nodes.panel_ico2.hide();
            boat.setInterval(function(){
                boat.nodes.panel_ico1.runAction(
                    cc.sequence(
                        cc.callFunc(function(){
                            boat.nodes.panel_ico1.show();
                            boat.nodes.panel_ico1.setPosition(48,110);
                        }, this),
                        cc.moveTo(0.8,48,150),
                        cc.callFunc(function(){
                            boat.nodes.panel_ico1.hide();
                            boat.nodes.panel_ico1.setPosition(48,110)
                        }, this)
                    )
                );
                boat.nodes.panel_ico2.runAction(
                    cc.sequence(
                        cc.delayTime(0.7),
                        cc.callFunc(function(){
                            boat.nodes.panel_ico2.show();
                            boat.nodes.panel_ico2.setPosition(48,110);
                        }, this),
                        cc.moveTo(0.8,48,150),
                        cc.callFunc(function(){
                            boat.nodes.panel_ico2.hide();
                            boat.nodes.panel_ico2.setPosition(48,110)
                        }, this)
                    )
                );
            },5000);
        },
        //飞艇前进
        changeBoatPos:function(boat){
            var me = this;
            var route = G.gc.yijiroute[me.type];
            var pointnum = X.keysOfObject(G.gc.yijiroute[me.type]).length;//路径点个数
            //当前飞艇前进了多少
            var road = (G.time - G.frame.kaogu_map.DATA.data.ctime) * G.frame.kaogu_map.DATA.data.speed;
            var allroad = G.gc.yjkg.map[me.type].distance;//这条线路的总长度
            var curpointindex = parseInt(road / allroad * pointnum);//当前走到了哪个点
            if(curpointindex <= 0) curpointindex = 1;
            var curpoint = cc.p(route[curpointindex].zuobiao[0], route[curpointindex].zuobiao[1]);
            //飞艇
            boat.setPosition(curpoint);
        },
        removeBoat:function(){
            var me = this;
            if(me.nodes['img_luxian' + me.type].getChildByName('boat')){
                me.nodes['img_luxian' + me.type].getChildByName('boat').removeFromParent();
            }
        },
        showSupply:function(){
            var me = this;
            //考古速度加成 技能加成+考古仪器加成+考古加速加成
            var skilladd = 0;
            var skillsupply = 0;
            if(me.DATA.skill[me.type]){
                for(var k = 0; k < me.DATA.skill[me.type].length; k++){
                    var skillid =  me.DATA.skill[me.type][k];
                    if(G.gc.yjkgskill[me.type][skillid].type == "5"){
                        skilladd += G.gc.yjkgskill[me.type][skillid].pro / 10;
                    }else if(G.gc.yjkgskill[me.type][skillid].type == "1"){
                        skillsupply += G.gc.yjkgskill[me.type][skillid].num;
                    }
                }
            }
            if(me.ifkaogu == 2 && G.frame.kaogu_map.DATA.data.jiacheng){
                if(me.ifAdd){
                    var speedadd = Math.round(G.frame.kaogu_map.DATA.data.jiacheng * 100) - 20 + "%";
                    //var speedadd =  Math.round((G.frame.kaogu_map.DATA.data.speed / 3 - 1)*10) * 10 - 20 + "%";
                    //var speedadd = parseInt((G.frame.kaogu_map.DATA.data.speed / 3 - 1) * 100) - 20 + "%";
                }else {
                    var speedadd = Math.round(G.frame.kaogu_map.DATA.data.jiacheng * 100) + "%";
                    //var speedadd =  Math.round((G.frame.kaogu_map.DATA.data.speed / 3 - 1)*10) * 10 + "%";
                    //var speedadd = parseInt((G.frame.kaogu_map.DATA.data.speed / 3 - 1) * 100) + "%";
                }
            }else {
                var yqadd = me.DATA.yiqi.speed > 0 ? G.gc.yjkg.yiqi.speed[me.DATA.yiqi.speed].add * 100 : 0;
                var speedadd = Math.round(skilladd + yqadd) + "%";
            }
            var str = me.ifAdd ? speedadd + "+" + "<font color=#558f00>20%</font>" : speedadd;
            var tx = X.setRichText({
                parent:me.nodes.txt_jcsd,
                str:str,
                color:"#cd5f2b",
                pos:{x:0,y:5}
            });
            //考古补给 初始补给+技能补给
            var supply = "+" + (skillsupply + G.gc.yjkg.map[me.type].supply);
            me.supply = skillsupply + G.gc.yjkg.map[me.type].supply;
            //补给的显示
            if(me.ifkaogu == 0){
                me.nodes.panel_jdt.hide();
                me.nodes.txt_bjsd.show();
                var th = X.setRichText({
                    parent:me.nodes.txt_bjsd,
                    str:supply,
                    color:"#cd5f2b",
                    size:20
                });
            }else {
                me.nodes.panel_jdt.show();
                me.nodes.txt_bjsd.hide();
                me.nodes.panel_jsxh.removeAllChildren();
                var leftsupply = me.DATA.data.supply - Math.ceil((G.time - me.DATA.data.ctime)/60);//剩下的补给
                if(leftsupply <= 0) leftsupply = 0;
                me.nodes.img_jdt.setPercent(leftsupply / me.DATA.data.supply * 100);
                me.nodes.txt_wzjdt.setString(leftsupply + "/" + me.DATA.data.supply);
                me.ui.setInterval(function (){
                    me.getState();
                    var leftsupply = me.DATA.data.supply - Math.ceil((G.time - me.DATA.data.ctime)/60);//剩下的补给
                    if(leftsupply <= 0) leftsupply = 0;
                    if(me.ifkaogu == 2 && leftsupply > 0){
                        me.nodes.img_jdt.setPercent(leftsupply / me.DATA.data.supply * 100);
                        me.nodes.txt_wzjdt.setString(leftsupply + "/" + me.DATA.data.supply);
                    }else {
                        me.ui.clearAllTimers();
                        me.showSupply();
                        me.showStateInfo();
                    }
                },60000)
            }
            //消耗
            if(me.ifAdd){
                //加速消耗
                var need;
                if(G.class.getOwnNum(G.gc.yjkg.jiasuneed[0][0].t,G.gc.yjkg.jiasuneed[0][0].a) < G.gc.yjkg.jiasuneed[0][0].n){
                    need = G.gc.yjkg.jiasuneed[1][0];
                }else {
                    need = G.gc.yjkg.jiasuneed[0][0];
                }
                var str = X.STR(L("KAOGU11"),G.class.getOwnNum(need.t,need.a),need.n);
                var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
                img.setScale(0.7);
                var rh = X.setRichText({
                    parent:me.nodes.panel_xxkgsd,
                    str:str,
                    color:"#804326",
                    node:img,
                });

                if(G.class.getOwnNum(G.gc.yjkg.doubleneed[0][0].t,G.gc.yjkg.doubleneed[0][0].a) < G.gc.yjkg.doubleneed[0][0].n){
                    need = G.gc.yjkg.doubleneed[1][0];
                }else {
                    need = G.gc.yjkg.doubleneed[0][0];
                }
                var str = X.STR(L("KAOGU11"),G.class.getOwnNum(need.t,need.a),need.n);
                var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
                img.setScale(0.7);
                var rh = X.setRichText({
                    parent:me.nodes.panel_jsxh,
                    str:str,
                    color:"#804326",
                    node:img,
                });


            }else {
                var rh = X.setRichText({
                    parent:me.nodes.panel_xxkgsd,
                    str:L("KAOGU10"),
                    color:"#804326",
                });

                var rh = X.setRichText({
                    parent:me.nodes.panel_jsxh,
                    str:L("KAOGU59"),
                    color:"#804326",
                });
            }
            rh.setPosition(me.nodes.panel_xxkgsd.width/2 - rh.trueWidth()/2, me.nodes.panel_xxkgsd.height/2 - rh.trueHeight()/2);




        },
        onRemove:function(){
            var me = this;
        },
        checklcbRedPoint:function(){
            var me = this;
            //里程碑按钮红点
            for(var k = 0; k < G.gc.yjkg.milestone[me.type].length; k++){
                var mile = G.gc.yjkg.milestone[me.type][k][0];
                if(G.frame.kaogu_map.DATA.farthest[me.type] >= mile && !X.inArray(G.frame.kaogu_map.DATA.milestone[me.type],k)){
                    G.setNewIcoImg(me.nodes.btn_worldmap);
                    break;
                }
                G.removeNewIco(me.nodes.btn_worldmap);
            }

        }
    });

    G.frame[ID] = new fun('kaogu_tanxian.json', ID);
})();