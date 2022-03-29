/**
 * Created by  on 2019//.
 */
(function () {
    //王者招募
    G.class.wangzhezhaomu_zhaomu = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.preLoadRes = ["task.png", "task.plist"];
            me._data = data;
            me._super("event_chuanqizhaomu.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.miaoshu.setTouchEnabled(false);
            me.nodes.btn_bangzhu.click(function(){
                G.frame.help.data({
                    intr:(L("TS71"))
                }).show();
            });

            me.nodes.btn_yici.click(function () {
                me.chouka(1,1);
            });
            me.nodes.btn_shici.click(function () {
                me.chouka(10,2);
            });
            //英雄预览
            me.nodes.btn_yxyl.click(function () {
                var heroarr = [];
                if(me.showheroid) heroarr.push(me.showheroid);
                G.frame.wangzhezhaomu_wjyl.data({
                    data:heroarr.concat(me.DATA.info.data.openinfo.zhaomu.showhid),
                    type:'show'
                }).show();
            });
            //选择英雄
            me.nodes.btn_ghyx.click(function () {
                G.frame.wangzhezhaomu_wjyl.data({
                    data:me.DATA.info.data.openinfo.zhaomu.mainhero,
                    type:'change'
                }).show();
            });

        },
        chouka:function(num,type,bool){
            var me = this;
            me.ajax("wangzhezhaomu_zhaomu", [num], function (str, data) {
                if(data.s == 1) {
                    //刷新界面
                    var info = JSON.parse(JSON.stringify(data));
                    info.need = me.DATA.info.data.openinfo.zhaomu.need;
                    if(G.frame.chouka_hdyx.isShow){
                        G.frame.chouka_hdyx.nodes.ico_yx.removeAllChildren();
                        for(var i = 0; i < 10; i ++){
                            G.frame.chouka_hdyx.nodes["ico_" + (i + 1)].removeAllChildren();
                        }
                    } else {
                        X.audio.playEffect("sound/zhaohuan.mp3");
                    }
                    try {
                        G.event.emit("leguXevent", {
                            type: 'track',
                            event: 'summon',
                            data: {
                                summon_genre: '王者招募',
                                summon_type: num,
                                summon_cost_num: num,
                                summon_cost_type: 'item',
                                item_list: X.arrPirze(data.d.prize),
                            }
                        });
                    } catch (e) {
                        cc.error(e);
                    }
                    G.frame.chouka_hdyx.data({
                        hero: data.d.prize,
                        data: info,
                        type: type,
                        bool: bool,
                        choukatype: "zhaomu",
                        num:num
                    }).once('willClose',function () {
                        me.getData(function () {
                            me.showBox();
                            me.showJfPrize();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            });
                        });
                    }).show();
                }
            });
        },
        onShow: function () {
            var me = this;
            me.getData(function(){
                me.nodes.btn_ghyx.setVisible(me.DATA.info.data.openinfo.zhaomu.mainhero.length > 1);
                me.setContents();
                me.showJfPrize();
                // me.showSome();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            //倒计时
            me.nodes.txt_count.setString(L("SYSJ"));
            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_time.setString(X.moment(me.DATA.info.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_time,me.DATA.info.etime,function () {
                    me.nodes.txt_time.setString(L("YJS"));
                })
            }
            //时间
            var startime = X.timetostr(me.DATA.info.stime,"m-d");
            var endtime = X.timetostr(me.DATA.info.etime,"m-d");
            var arr1 = startime.split("-");
            var str1 = arr1[0] + L("YUE") + arr1[1] + L("RI");
            var arr2 = endtime.split("-");
            var str2 = arr2[0] + L("YUE") + arr2[1] + L("RI");
            var timestr = str1 + "-" + str2;
            //抽武将
            //根据评论id找英雄
            var txt = "";
            var showheroarr = [];
            for(var i = 0; i < me.DATA.info.data.openinfo.zhaomu.showhid.length; i++){
                // var arr = [];
                // var pinlunid = me.DATA.info.data.openinfo.zhaomu.showhid[i];
                // for (var k in G.gc.hero) {
                //     if (G.gc.hero[k].pinglunid == pinlunid) {
                //         arr.push(G.gc.hero[k].hid*1)
                //     }
                // }
                // var heroid = X.maxOf(arr).toString();//找到相同评论id中最大的英雄
                // showheroarr.push(heroid);
                var heroid = me.DATA.info.data.openinfo.zhaomu.showhid[i];
                if(i < me.DATA.info.data.openinfo.zhaomu.showhid.length-1){
                    var name = G.gc.hero[heroid].name + ",";
                }else {
                    var name = G.gc.hero[heroid].name;
                }
                txt += name;
            }
            // me.showheroarr = showheroarr;
            //根据服务器发的武将的评论id去找，可能有多个武将有相同的评论id
            // var heroidarr = [];
            // for(var k in G.gc.hero){
            //     if(G.gc.hero[k].pinglunid == me.DATA.info.data.plid){
            //         heroidarr.push(G.gc.hero[k].hid * 1);
            //     }
            // }
            // me.showheroid = X.maxOf(heroidarr).toString();
            me.showheroid = me.DATA.zhaomu.hid;
            X.setHeroModel({
                parent: me.nodes.rw,
                data: G.gc.hero[me.showheroid],
                direction: -1
            });
            var str =X.STR(L("WANZGHEZHAOMU18"),timestr) + X.STR(L("WANZGHEZHAOMU9"),G.gc.hero[me.showheroid].name || "", txt);
            var rh = X.setRichText({
                parent:me.nodes.wz_sm,
                str:str,
                color:"#fff8e1",
                size:18,
                outline:"#543b09"
            });
            var need = me.DATA.info.data.openinfo.zhaomu.need[0];
            me.ui.finds('zuanshi').loadTexture(G.class.getItemIco(need.t),1);
            me.ui.finds('zuanshi_0').loadTexture(G.class.getItemIco(need.t),1);
            me.nodes.zs_sz.setString(need.n);
            me.nodes.zs_sz2.setString(need.n*10);
            me.showBox();
        },
        showBox:function(){
            var me = this;
            //拥有道具
            var need = me.DATA.info.data.openinfo.zhaomu.need[0];
            var str = X.STR(L("WANZGHEZHAOMU23"), X.fmtValue(G.class.getOwnNum(need.t,need.a)));
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            var rh = X.setRichText({
                parent:me.nodes.wenzi_shuoming2,
                str:str,
                node:img,
                color:"#fff0d8",
                outline:"#000000"
            });
            rh.setPosition((me.nodes.wenzi_shuoming2.width - rh.trueWidth()) / 2, 0);
            rh.setAnchorPoint(0,0.5);
            var value = me.DATA.zhaomu.num * me.DATA.info.data.openinfo.zhaomu.addjifen;
            //积分
            me.nodes.jifen_sz.setString(value);
            for(var i = 0; i < 4; i++){
                var box = me.nodes.ico_list.clone();
                box.show();
                X.autoInitUI(box);
                box.setPosition(0,0);
                box.setAnchorPoint(0,0);
                me.setBoxState(box,me.DATA.zhaomu.boxprize[i],i);
                me.nodes['ico' + (i+1)].removeAllChildren();
                me.nodes['ico' + (i+1)].addChild(box);
                //进度条
                if(value >= me.DATA.info.data.openinfo.zhaomu.boxprize[i].val){
                    me.nodes['jindutiao' + (i+1)].setPercent(100);
                }else {
                    if(i > 0){
                        me.nodes['jindutiao' + (i+1)].setPercent((value-me.DATA.zhaomu.boxprize[i-1].val)/(me.DATA.zhaomu.boxprize[i].val - me.DATA.zhaomu.boxprize[i-1].val) * 100);
                    }else {
                        me.nodes['jindutiao' + (i+1)].setPercent(value/me.DATA.zhaomu.boxprize[i].val * 100);
                    }
                    // if(i > 0){
                    //     me.nodes['jindutiao' + (i+1)].setPercent((value-me.DATA.info.data.openinfo.zhaomu.boxprize[i-1].val)/(me.DATA.info.data.openinfo.zhaomu.boxprize[i].val - me.DATA.info.data.openinfo.zhaomu.boxprize[i-1].val) * 100);
                    // }else {
                    //     me.nodes['jindutiao' + (i+1)].setPercent(value/me.DATA.info.data.openinfo.zhaomu.boxprize[i].val * 100);
                    // }
                }
            }
        },
        setBoxState:function(ui,data,index){
            var me = this;
            var img = index == 3 ? "img_task_bx1" : "img_task_bx2";
            var value = me.DATA.zhaomu.num * me.DATA.info.data.openinfo.zhaomu.addjifen;
            ui.finds('Text_1').setString(data.val);
            ui.finds('Text_1').setTextColor(cc.color(G.gc.COLOR.n5));
            X.enableOutline(ui.finds('Text_1'),'#4A1D09',2);
            //宝箱状态
            ui.removeBackGroundImage();
            // ui.removeAllChildren();
            if(X.inArray(me.DATA.zhaomu.reclist,index)){//已领
                ui.setTouchEnabled(false);
                ui.setBackGroundImage("img/task/" + img + "_d.png", 1);
            }else {
                ui.setTouchEnabled(value >= data.val);
                ui.setTouchEnabled(true);
                if(value >= data.val){
                    X.addBoxAni({
                        parent: ui,
                        boximg: "img/task/" + img + ".png"
                    });
                    G.setNewIcoImg(ui);
                }else {
                    ui.setBackGroundImage("img/task/" + img + ".png", 1);
                }
            }
            ui.index = index;
            ui.data = data;
            ui.click(function(sender){
                if(value >= sender.data.val){
                    me.ajax('wangzhezhaomu_zhaomuboxprize',[sender.index],function(str,data){
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.DATA.zhaomu.reclist.push(sender.index);
                            me.showBox();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            });
                        }
                    })
                }else {
                    G.frame.jiangliyulan.data({
                        prize:sender.data.prize
                    }).show();
                }
            })
        },
        showJfPrize:function(){
            var me = this;
            var val = me.DATA.zhaomu.num * me.DATA.info.data.openinfo.zhaomu.addjifen;
            var jifenprizearr =  me.DATA.info.data.openinfo.zhaomu.jifenprize;
            if(jifenprizearr.length == 0) return me.nodes.panel_jfhl.hide();
            me.nodes.panel_jfhl.show();
            for(var i = 0; i < jifenprizearr.length; i++){
                if(!X.inArray(me.DATA.zhaomu.jifenreclist,i)){
                    var showprizeidx = i;
                    break;
                }
            }
            if(me.DATA.zhaomu.jifenreclist.length == jifenprizearr.length) showprizeidx = jifenprizearr.length-1;//都领完了 显示最后一个奖励
            var prize = jifenprizearr[showprizeidx].prize;
            var item = G.class.sitem(prize[0]);
            item.setPosition(0,0);
            item.setAnchorPoint(0,0);
            me.nodes.ico_wp.removeAllChildren();
            me.nodes.ico_wp.addChild(item);
            me.nodes.ico_wp.setTouchEnabled(false);
            me.nodes.panel_jfhl.setTouchEnabled(true);
            G.removeNewIco(me.nodes.panel_jfhl);
            if(val >= jifenprizearr[showprizeidx].val && !X.inArray(me.DATA.zhaomu.jifenreclist,showprizeidx)){//可领取
                me.nodes.txt_jf.setString(L("KLQ"));
                G.setNewIcoImg(me.nodes.panel_jfhl);
                me.nodes.panel_jfhl.finds('redPoint').setPosition(95,90);
                me.nodes.panel_jfhl.click(function () {
                    me.ajax('wangzhezhaomu_zhaomujifenprize',[],function (str,data) {
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.DATA.zhaomu = data.d.zhaomu;
                            me.showJfPrize();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            });
                        }
                    })
                })
            }else {
                if(me.DATA.zhaomu.jifenreclist.length == jifenprizearr.length){//领完了
                    me.nodes.txt_jf.setString(L("YLQ"));
                }else {
                    me.nodes.txt_jf.setString(X.STR(L("WANZGHEZHAOMU25"),jifenprizearr[showprizeidx].val));
                }
                me.nodes.panel_jfhl.click(function () {
                    G.frame.zhaomu_jifenprize.data({
                        prize:jifenprizearr[showprizeidx].prize,
                        jifenprizearr:jifenprizearr,
                        jifenreclist:me.DATA.zhaomu.jifenreclist,
                        showindex:showprizeidx
                    }).show();
                });
            }

        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open', ['zhaomu'], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        }
    });
})();