(function () {
    leguX.config = {
        DEBUG : true,
        APPID : "e903ab24ad8f4bfca8a3ce7e122cd102",
        APPKEY : "asfsdafasdsf",
        SERVER_URL : 'http://taapi.legu.cc/production/v1/',
        SERVER_URL_TEST : 'http://taapi.legu.cc/v1/',
    };

    /*
    * 使用方法：在对应的关键事件点，使用以下代码广播事件即可：
    try{
        G.event.emit("leguXevent", {
            type:'可选值：user|track',
            event: "user时，可选值：set/setOnce/add/unset/append/del ， track时，这里填写excel里的事件名",
            data: {
                key1:val1
                //这里填写excel里对应事件所需记录的数据
            }
        });
    }catch(e){
        cc.error(e);
    }
    * */

    G.event.on("leguXevent", function (data) {
        if(P.gud){
            TA.superProperties({
                lv: P.gud.lv,
                name: P.gud.name,
                exp : P.gud.exp,
                zhanli: P.gud.zhanli,
                maxmapid: P.gud.maxmapid,
                ghid: P.gud.ghid,
                rmbmoney : P.gud.rmbmoney,
                jinbi : P.gud.jinbi,
                svrindex: P.gud.svrindex + "",
                vip: P.gud.vip,
            });
        }

        if (data.type == "user") {
            TA.user(data.type,data.data);
        } else {
            TA.track(data.event,data.data);
        }
    });

    //监听登陆事件
    G.event.on('dologin',function(){
        TA.login(P.gud.uid);
        TA.resetSuperProperties();
        TA.superProperties({
            last_account_login_time : G.time
        });

        try{
            G.event.emit("leguXevent", {
                type:'track',
                event: "login",
                data: {}
            });
        }catch(e){
            cc.error(e);
        }
    });

    //注册角色事件
    G.event.on('createrole',function(){
        TA.track('create_role',{});
    });

    //自动记录关键属性的变化
    var batchSendTimer = null;
    G.event.on('attrchange', function(d, conf) {
        var needkeys = [
            'lv','name','zhanli','maxmapid','ghid','rmbmoney','jinbi','vip'
        ];
        if (!d) return;
        var d = X.toJSON(d);
        for(var k in d){
            //合批user_set事件
            if(X.arrayFind(needkeys,k)!=-1){
                if(batchSendTimer){
                    clearTimeout(batchSendTimer);
                    batchSendTimer = null;
                }
                batchSendTimer = setTimeout(function(){
                    var _data = {};
                    for(var i=0;i<needkeys.length;i++){
                        _data[ needkeys[i] ] = P.gud[ needkeys[i] ];
                    }
                    TA.user('set',_data);
                },1000);
            }

            if(k=='lv'){
                //如果等级发生变化，上报对应的事件
              G.event.emit("leguXevent", {
                  type:'track',
                  event: "level_up",
                  data: {
                    promotion_level:1,  
                    before_level: d.lv - 1,
                    after_level:d.lv,
                    
                  }
              });
             
            }
        }
    });

    //自动记录充值事件和首冲事件
    G.event.on("pay_event", function (args) {
        //args = "{"orderid": "debugPay752624834", "money": "6", "name": "￥6", "rmbmoney": 60}"
        if(!args)return;
        var data = args;

        //需要数值类型
        data.money *= 1;

        cc.mixin(data,{
            islishishouci: P.gud.payexp > 0 ? 1 : 0,
            isdangrishouci: P.gud.jinrishouchong || 0,
        });

        G.event.emit("leguXevent", {
            type:'track',
            event: "rechargeGame",
            data: data
        });

        //记录首次充值时间和金额
        TA.user('setOnce',{
            'first_charge_amount':data.money,
            'first_charge_proid':data.name
        });
    });
    G.event.on('default_herochange',function(d,_data,formInfo){
        var o = X.toJSON(d);
        var heroList = G.DATA.yingxiong.list;
        for(var i in o){
            var heroData = JSON.parse(JSON.stringify(o[i]));
            var newheroData = cc.mixin(heroList[i] || {},o[i]);
            if(!heroList[i]){
                try{
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "get_hero",
                        data: {
                            hero_id:[heroData.hid],
                            now_level:[heroData.lv],
                            now_quality:[newheroData.star],
                            item_fighting_capacity:[heroData.zhanli],
                            hero_race:heroData.zhongzu,
                            hero_job:heroData.job,
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
            }else{
                for (var key in heroData) {
                    if (key == "star" && heroData[key] > heroList[i][key]) {
                        try{
                            G.event.emit("leguXevent", {
                                type:'track',
                                event: "hero_strengthen",
                                data: {
                                    hero_id:[heroData.hid],
                                    original_quality:heroList[i].star,
                                    now_level:[heroData.lv],
                                    now_quality:[newheroData.star],
                                    item_fighting_capacity:[heroData.zhanli],
                                    hero_race:heroList[i].zhongzu,
                                    hero_job:heroList[i].job,
                                }
                            });
                        }catch(e){
                            cc.error(e);
                        }
                    }else if(key == "lv" && heroData[key] > heroList[i][key]){
                        try{
                            G.event.emit("leguXevent", {
                                type:'track',
                                event: "hero_level_up",
                                data: {
                                    hero_id:[heroData.hid],
                                    original_level:heroList[i].lv,
                                    now_level:[heroData.lv],
                                    now_quality:[newheroData.star],
                                    item_fighting_capacity:[heroData.zhanli],
                                    hero_race:heroList[i].zhongzu,
                                    hero_job:heroList[i].job,
                                }
                            });
                        }catch(e){
                            cc.error(e);
                        }
                    }else if(key == "weardata"){
                        var weardata = heroList[i][key] || {};
                        for(var n in heroData[key]){
                            if(weardata[n] != heroData[key][n]){
                                if (n == 6) {
                                  try {
                                    
                                    var id = X.keysOfObject(weardata[n])[0]
                                    G.event.emit("leguXevent", {
                                      type:'track',
                                      event: "yangcheng_level_up",
                                      data: {
                                          equip_type:"baoshi",
                                          original_level: id-1,
                                          now_level: id,
                                          now_quality:G.gc.baoshi[id].color,
                                          item_fighting_capacity:heroData.zhanli
                                      }
                                    });
                                  } catch(e){
                                    cc.error(e);
                                  }
                                }
                                try{
                                    var equipData = G.class.equip.getById(heroData[key][n]);
                                    if (!equipData) return;
                                    if (n == 5) {
                                        equipData = G.gc.sp[heroData[key][n]];
                                    }
                                    G.event.emit("leguXevent", {
                                        type:'track',
                                        event: "item_equip",
                                        data: {
                                            equip_type:"equip",
                                            item_id:heroData[key][n],
                                            hero_id:[heroList[i].hid],
                                            now_level:[1],
                                            now_quality:[equipData.star],
                                            item_fighting_capacity:[heroList[i].zhanli],
                                        }
                                    });
                                }catch(e){
                                    cc.error(e);
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    G.event.on('default_itemchange',function(d,_data,formInfo){
        var o = X.toJSON(d);
        var itemList = G.frame.beibao.DATA.item.list;
        for(var i in o){
            var itemData = o[i];
            var oldData = itemList[i] ? JSON.parse(JSON.stringify(itemList[i])) : {num:0, itemid:itemData.itemid};
            if(itemData.num > oldData.num){
                try{
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "get_item",
                        data: {
                            get_amount:itemData.num - oldData.num,
                            get_entrance:formInfo ? formInfo[0] : [""],
                            item_id:itemData.itemid,
                            item_name:G.class.getItemConf({t:itemData.itemid,a:"item"}).name,
                            total_num_now:itemData.num
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
                if(X.inArray(["2003","2086","2071"],itemData.itemid)   && G.frame.gonghui_main.isShow){
                    try{
                        var data = G.frame.gonghui_main.DATA;
                        var userData = G.frame.gonghui_main.DTDATA.userlist;
                        var ghinfo = data.ghdata;
                        var zhanli = 0;
                        for(var i = 0;i < userData.length;i++){
                            zhanli += userData[i].maxzhanli;
                        }
                        G.event.emit("leguXevent", {
                            type:'track',
                            event: "play_guild_activity",
                            data: {
                                guild_name: ghinfo.name,
                                guild_id:P.gud.ghid,
                                guild_level:ghinfo.lv,
                                guild_people_num: ghinfo.usernum,
                                guild_fighting_capacity: zhanli,
                                guild_systemid:formInfo ? formInfo[0] : [""],
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }
            }else if(itemData.num < oldData.num){
                try{
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "cost_item",
                        data: {
                            cost_amount:oldData.num - itemData.num,
                            cost_entrance:formInfo ? formInfo[0] : [""],
                            item_id:oldData.itemid,
                            item_name:G.class.getItemConf({t:oldData.itemid,a:"item"}).name,
                            total_num_now:itemData.num
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
            }
        }
    });
    G.event.on('default_attrchange',function(d,_data,formInfo){
        var o = X.toJSON(d);
        var gud = P.gud;
        for(var i in o){
            if(i == "jinbi"){
                if(o[i] > gud[i]){
                    try{
                        G.event.emit("leguXevent", {
                            type:'track',
                            event: "get_coins",
                            data: {
                                get_amount:o[i] - gud[i],
                                get_entrance:formInfo ? formInfo[0] : [""],
                                total_num_now:o[i]
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }else if(o[i] < gud[i]){
                    try{
                        G.event.emit("leguXevent", {
                            type:'track',
                            event: "cost_coins",
                            data: {
                                cost_amount:gud[i] - o[i],
                                cost_entrance:formInfo ? formInfo[0] : [""],
                                total_num_now:o[i]
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }
            }else if(i == "rmbmoney"){
                if(o[i] > gud[i]){
                    try{
                        G.event.emit("leguXevent", {
                            type:'track',
                            event: "get_diamond",
                            data: {
                                get_amount:o[i] - gud[i],
                                get_entrance:formInfo ? formInfo[0] : [""],
                                total_num_now:o[i]
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }else if(o[i] < gud[i]){
                    try{
                        G.event.emit("leguXevent", {
                            type:'track',
                            event: "cost_diamond",
                            data: {
                                cost_amount:gud[i] - o[i],
                                cost_entrance:formInfo ? formInfo[0] : [""],
                                total_num_now:o[i]
                            }
                        });
                    }catch(e){
                        cc.error(e);
                    }
                }
            }else if(i == "title"){
                try{
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "yangcheng_level_up",
                        data: {
                            yangcheng_type:"title",
                            original_level:gud[i],
                            now_level:[o[i]],
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
            }
        }
    });
    G.event.on('default_equipchange',function(d,_data,formInfo){
        var o = X.toJSON(d);
        var equipList = G.frame.beibao.DATA.zhuangbei.list;
        for(var i in o){
            var equipData = o[i];
            var oldData = equipList[i] ? JSON.parse(JSON.stringify(equipList[i])) : {num:0, eid:equipData.eid};
            if(equipData.num && equipData.num > oldData.num){
                try{
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "get_equip",
                        data: {
                            equip_id:equipData.eid,
                            now_level:[equipData.star],
                            get_type:formInfo,
                            now_quality:[equipData.color]
                        }
                    });
                }catch(e){
                    cc.error(e);
                }
            }
        }
    });
    G.event.on('yangcheng_point', function (d, d1) {
        try {
            var data = {
                yangcheng_type: d.data.type,
                original_level: d.data.oldLv,
                now_level: d.data.curLv,
                now_quality: d.data.color || 0
            };
            d1 && cc.mixin(data, d1, true);
            G.event.emit("leguXevent", {
                type:'track',
                event: "yangcheng" + d.type,
                data: data
            });
        } catch (e) {
            cc.error(e);
        }
    });
    G.event.on('default_glyphchange', function (d,_data,formInfo) {
        var o = X.toJSON(d);
        var glyphList = G.frame.beibao.DATA.glyph.list;
        cc.each(o, function (gData, tid) {
            var oldData = glyphList[tid];
            if (oldData && gData.num != 0 && gData.lv ) {
                if (gData.lv != oldData.lv) {
                    if (gData.lv == 0) {
                        var prize = [];
                        for (var lv = 0; lv < oldData.lv; lv ++) {
                            prize = prize.concat(G.gc.glyphcom.base.lvdata[lv].need);
                        }
                        G.event.emit('yangcheng_point', {
                            type: '_reset',
                            data: {
                                type: 'diaowen',
                                oldLv: oldData.lv,
                                curLv: gData.lv,
                                color: gData.color
                            }
                        }, {
                            reward_list: X.arrPirze(X.mergeItem(prize))
                        });
                    } else {
                        // G.event.emit('yangcheng_point', {
                        //     type: '_level_up',
                        //     data: {
                        //         type: 'diaowen',
                        //         oldLv: oldData.lv,
                        //         curLv: gData.lv,
                        //         color: gData.color
                        //     }
                        // });
                        G.event.emit('yangcheng_point', {
                          type: '_level_up',
                          data: {
                            type: 'diaowen',
                            oldLv:oldData.lv,
                            curLv: gData.lv
                          }
                        }, {
                          yangcheng_id: gData.gid,
                          now_quality: gData.color,
                          item_fighting_capacity: gData.isuse ? G.DATA.yingxiong.list[gData.isuse].zhanli : 0,
                          yangcheng_stype:gData.type
                        });
                    }
                } else if (gData.recastskill != oldData.recastskill) {
                    G.event.emit('yangcheng_point', {
                      type: '_chongzhu',
                      data: {
                        type: 'diaowen',
                        oldLv:oldData.lv,
                        curLv: gData.lv
                      }
                    }, {
                      yangcheng_id: gData.gid,
                      now_quality: gData.color,
                      jineng_idqian: oldData.recastskill,
                      jineng_idhou: gData.recastskill,
                      yangcheng_stype: gData.type,
                      reward_list:X.arrPirze(G.class.glyph.getCom().base.need.recast[0])
                    });
                }
            } else if (formInfo[0] == "glyph_scrutiny") {
              var num = 0;
              gData.extbuff.forEach(function (item,idx) {
                if (item == oldData.extbuff[idx]) {
                  num++
                }
              })

              G.event.emit('yangcheng_point', {
                type: '_chongzhu',
                data: {
                  type: 'diaowen',
                  oldLv:oldData.lv,
                  curLv: gData.lv
                }
              }, {
                yangcheng_id: gData.gid,
                now_quality: gData.color,
                xilian_idqian: oldData.extbuff,
                xilian_idhou: gData.extbuff,
                yangcheng_stype: oldData.type,
                reward_list:X.arrPirze(G.class.glyph.getCom().base.need.lock[num])
              });
            }
        });
    });
    G.event.on('default_wuhunchange', function (d,_data,formInfo) {
        var o = X.toJSON(d);
        var wuhunList = G.DATA.wuhun;
        cc.each(o, function (gData, tid) {
            var oldData = wuhunList[tid];
            if (oldData && gData.lv) {
                if (gData.lv != oldData.lv) {
                    var conf = G.gc.wuhun[oldData.id][gData.lv];
                    G.event.emit('yangcheng_point', {
                        type: '_level_up',
                        data: {
                            type: 'wuhun',
                            oldLv: oldData.lv,
                            curLv: gData.lv,
                            now_quality: conf.color,
                            yangcheng_id: oldData.id,
                            item_fighting_capacity:1
                        }
                    });
                }
            } else if (gData.num == 0 && formInfo && formInfo ? formInfo[0] : [""] == "wuhun_recycle") {
                var conf = G.gc.wuhun[oldData.id][oldData.lv];
                G.event.emit('yangcheng_point', {
                    type: '_reset',
                    data: {
                        type: 'wuhun',
                        oldLv: oldData.lv,
                        curLv: oldData.lv,
                        now_quality: conf.color,
                        yangcheng_id:oldData.id
                        
                    }
                }, {
                    reward_list: X.arrPirze(G.frame.wuhun_recycle.getPrize(tid))
                });
            }
        });
    });
})();