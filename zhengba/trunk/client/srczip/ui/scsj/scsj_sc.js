/**
 * Created by LYF on 2019/10/26.
 */
 (function () {
    //神宠水晶-神宠
    G.class.scsj_sc = X.bView.extend({
        maxRoom: 3,
        colorConf: {
            2: "#37bbff",
            3: "#ee5bec",
            4: "#ff8a00",
            5: "#fa2f25"
        },
        ctor: function () {
            this._super('scsj_sc.json', null, {action: true});
            G.frame.scsj.sc = this;
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_zuo.click(function () {
                me.room --;
                me.moveAni("right", function () {
                    me.setRoomState();
                });
            }, 500);
            me.nodes.btn_you.click(function () {
                me.room ++;
                me.moveAni("left", function () {
                    me.setRoomState();
                });
            }, 500);
            me.nodes.btn_gs.zIndex = 9999;


            
            me.nodes.btn_gs.click(function () {
                var conf = {
                    1:[1,2,3],
                    2:[4,5,6],
                    3:[7,8,9],
                }
                var cont=-1;
                var datatime=G.frame.scsj.DATA.crystal.data;
                for(var i=0;i<3;i++){
                    if(!datatime[conf[me.room][i]]){
                        cont=i;
                        break;
                    }else if((datatime[conf[me.room][i]] && cont==-1) ||( datatime[conf[me.room][i]] && (datatime[conf[me.room][i]].time<=datatime[conf[me.room][cont]].time))){
                        cont=i;
                    }
                }
                
                me.nodes["panel_dan"+(cont+1)].triggerTouch(ccui.Widget.TOUCH_ENDED);
            });

            for(var i=1;i<=3;i++){
                
                me.nodes["panel_dan"+i].state=i-1;
                me.nodes["panel_dan"+i].click(function (sender) {
                    me.cilckFun(me.state[me.room][sender.state],sender.state)
                });
            }
           
            

            me.nodes.btn_fj.click(function () {
                if (G.frame.scsj_fj.getData().length < 1) return G.tip_NB.show(L("ZWKFJCW"));
                G.frame.scsj_fj.show();
            });
        },
        cilckFun:function(state,id){
            var me=this;
            var conf = {
                1:[1,2,3],
                2:[4,5,6],
                3:[7,8,9],
            }
            switch (state) {
                case "none":
                    G.frame.scsj_selectAge.data(id).show();
                    break;
                case "noOver":
                    var datatime=G.frame.scsj.DATA.crystal.data;
                    var cont=-1;
                    for(var i=0;i<3;i++){
                        if((datatime[conf[me.room][i]] && cont==-1) ||( datatime[conf[me.room][i]] && (datatime[conf[me.room][i]].time<=datatime[conf[me.room][cont]].time))){
                            cont=i;
                        }
                    }
                    var data = datatime[conf[me.room][cont]];

                    var time = data.time;
                    me.consume = G.gc.petcom.base.speedup.need[0];
                    me.consumenum = Math.ceil((time - G.time) / 3600) * G.gc.petcom.base.speedup.need[0].n;
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            if (P.gud.rmbmoney < Math.ceil((time - G.time) / 3600) * G.gc.petcom.base.speedup.need[0].n){
                                G.frame.alert.once("willClose", function () {
                                    cc.callLater(function () {
                                        return G.tip_NB.show(L("ZSBZ"));
                                    });
                                });
                            }
                            me.hatch(conf[me.room][cont],cont);
                        },
                        richText: X.STR(L("JSFH"), X.timeLeft(time - G.time),
                            Math.ceil((time - G.time) / 3600) * G.gc.petcom.base.speedup.need[0].n),
                        sizeType: 3
                    }).show();
                    break;
                case "over":
                    me.hatch(id + (me.room-1)*3+1,id);
                    break;
                case "needBuy":
                    G.frame.scsj.nodes.btn_sctq.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    break;
            }
        },
        moveAni: function (type, callback) {
            var me = this;
            for(var i = 1;i<=3 ;i++){
                (function(i){
                    var pos = me.nodes["panel_dan"+i].getPosition();
                    me.nodes["panel_dan"+i].runActions([
                        cc.moveBy(0.2, type == "left" ? -600 : 600, 0),
                        cc.callFunc(function () {
                            me.nodes["panel_dan"+i].setPosition(pos);
                            if(i == 3){
                                callback && callback();

                            }
                        })
                    ]);
                })(i)
               
            }
            
        },
        hatch: function (id,idx) {
            var me = this;

            me.ajax("pet_birth", [id], function (str, data) {
                if (data.s == 1) {

                    // G.event.emit('sdkevent',{
                    //     event:'pet_birth',
                    //     data:{
                    //         consume:[{a:me.consume.a, t:me.consume.t, n:me.consumenum}],
                    //         get:data.d.prize
                    //     }
                    // });

                    G.hongdian.getData('pet',1,function () {
                        G.frame.scsj.checkRedPoint();
                    });
                    G.DATA.noClick = true;
                    if (me.state[me.room][idx] == 'over') {
                        me["ageAni"+idx].ani.playWithCallback("out" + (me.room == 1 ? 1 : 2), false, function () {
                            G.DATA.noClick = false;
                            G.frame.scsj_fhcg.data(data.d.prize).show();
                            me.setTable();
                            G.frame.scsj.getData(0, function () {
                                me.setRoomState();
                            });
                        });
                    } else {
                        me["ageAni"+idx].ani.playWithCallback("out" + (me.room == 1 ? 1 : 2), false, function () {
                            G.DATA.noClick = false;
                            G.frame.scsj_fhcg.data(data.d.prize).show();
                            me.setTable();
                            G.frame.scsj.getData(0, function () {
                                me.setRoomState();
                            });
                        });
                    }
                }
            });
        },
        initUI: function () {
            var me = this;
            me.addAniCount = 0;
            me.nodes.list.hide();
            cc.enableScrollBar(me.nodes.scrollview_1);
            for(var k = 0 ; k < 3 ;k++){
                (function(i){
                    G.class.ani.show({
                        json: "ani_shenchong_fuhua_dh",
                        addTo: me.nodes["panel_dan"+(k+1)],
                        autoRemove: false,
                        onload: function (node, action) {
                            X.autoInitUI(node);
                            node.ani = action;
                            node.nodes.cwd.setTouchEnabled(false);
                            me["fhAni"+i]= node;
                            
                            G.class.ani.show({
                                json: "ani_shenchong_dan",
                                addTo: node.nodes.cwd,
                                autoRemove: false,
                                onload: function (node1, action1) {
                                    action1.gotoFrameAndPause(0);
                                    X.autoInitUI(node1);
                                    node1.hide();
                                    node1.ani = action1;
                                    me["ageAni"+i] = node1;
                                    if(i==2){
                                        me.checkAddAniOver();
                                    }
                                }
                            });
                        }
                    });
                })(k)
            }
           

            G.class.ani.show({
                json: "ani_shenchong_bg2",
                addTo: me.ui.finds("bg_sjs").finds("Image_1"),
                autoRemove: false,
                repeat: true,
                onload: function (node, action) {
                    me.bgAni1 = node;
                    me.checkAddAniOver();
                }
            });
            G.class.ani.show({
                json: "ani_shenchong_bg1",
                addTo: me.ui.finds("bg_sjs").finds("Image_1"),
                autoRemove: false,
                repeat: true,
                onload: function (node, action) {
                    node.hide();
                    me.bgAni2 = node;
                    me.checkAddAniOver();
                }
            });
        },
        checkAddAniOver: function () {
            var me = this;
            me.addAniCount ++;
            if (me.addAniCount == 3) {
                me.setRoomState();
            }
        },
        onOpen: function () {
            var me = this;
            me.room = 1;
            me.state={

            };
            me.initUI();
            me.bindBTN();
        },
        getWaitAniName: function (time) {
            var me = this;

            if (time < 60 * 60) {
                return "wait1";
            } else if (time < 180 * 60) {
                return "wait6";
            } else if (time < 360 * 60) {
                return "wait7";
            } else {
                return "wait8";
            }
        },
        setRoomState: function () {
            var me = this;
         
            var arr=[1,4,7];
            var datatime=G.frame.scsj.DATA.crystal.data;
            var conf = {
                1:[1,2,3],
                2:[4,5,6],
                3:[7,8,9],
            }
            var cont=-1;
            for(var i=0;i<3;i++){
                if(!datatime[conf[me.room][i]]){
                    cont=i;
                    break;
                }else if((datatime[conf[me.room][i]] && cont==-1) ||( datatime[conf[me.room][i]] && (datatime[conf[me.room][i]].time<=datatime[conf[me.room][cont]].time))){
                    cont=i;
                }
            }
            var data = datatime[conf[me.room][cont]];
            
            if(!data){
                me.nodes.txt_sjfhs.setString(L("FH"));
            }else if (G.time < data.time){
                me.nodes.txt_sjfhs.setString(L("JS"));
            }else{
                me.nodes.txt_sjfhs.setString(L("PK"));
            }

            for(var i=0;i<3;i++){
                me["ageAni"+i].hide();
                me["fhAni"+i].show();
            }
            me.bgAni1.setVisible(me.room == 1);
            me.bgAni2.setVisible(me.room != 1);
            me.nodes.btn_zuo.setVisible(me.room != 1);
            me.nodes.btn_you.setVisible(me.room != me.maxRoom);
            me.state[me.room] = [];
            if(me.room == 1){
                var sroom = 1;
                var eroom = 3;
            }else if(me.room == 2){
                var sroom = 4;
                var eroom = 6;
            }else if(me.room == 3){
                var sroom = 7;
                var eroom = 9;
            }
            var dqtime=0;
            for(var i =sroom ,j=0;i<=eroom ;i++,j++){
               
                if (cc.isNode(me["lockAni"+j])) me["lockAni"+j].removeFromParent();
                
                var data = G.frame.scsj.DATA.crystal.data[i] || {};
                if (data.id) {
                    var conf = G.gc.item[data.id];
                    me.nodes.txt_pys.setTextColor(cc.color("#ffffff"));
                    me.nodes.txt_pys.setString(L((me.room == 1 ? 0 : 1) + "PYS"));
                    me["ageAni"+j].nodes.dandan00.setBackGroundImage("ico/petico/dan_" + conf.color + ".png");
                  //  me.nodes.txt_pys.setTextColor(cc.color(me.colorConf[conf.color]));
    
                    var imgPath = {
                        2: "lan",
                        3: "zi",
                        4: "jin",
                        5: "hong"
                    };
                    var curAgeConf = G.gc.item[data.id];
                    var type = imgPath[curAgeConf.color];
                    for (var k = 1; k <= 6; k ++) {
                        me["ageAni"+j].nodes["dandan0" + k] && me["ageAni"+j].nodes["dandan0" + k].setBackGroundImage(
                            "img/shenchong/shenchongdan/" + type + "/" + type + "_0" + k + ".png", 1);
                    }
                    me["ageAni"+j].show();
                } else {
                    me.nodes.txt_pys.setTextColor(cc.color("#ffffff"));
                    me.nodes.txt_pys.setString(L((me.room == 1 ? 0 : 1) + "PYS"));
                }
    
                if (data.id) {
                    (function(k){
                        if (G.time >= data.time) {
                            if (me.nodes.txt_scsj_sz.__timeoutTimer) {
                                me.nodes.txt_scsj_sz.clearTimeout(me.nodes.txt_scsj_sz.__timeoutTimer);
                                delete me.nodes.txt_scsj_sz.__timeoutTimer;
                            }
                            me.state[me.room].push("over");
                      //      me.nodes.txt_sjfhs.setString(L("PK"));
                            X.timeout(me.nodes.txt_scsj_sz, dqtime)
                            var time = G.time - (dqtime - G.gc.petcom.base.cd);
                            me.nodes.img_jdt.setPercent(time / G.gc.petcom.base.cd * 100);
                            me["ageAni"+ k].ani.play("wait8", true);
                            me["fhAni" + k].ani.play(me.room == 1 ? "wait2" : "wait4", true);
                        } else {
                            me["fhAni" + k].ani.play(me.room == 1 ? "wait2" : "wait4", true);
                            me.nodes.img_jdt.setPercent(0);
                            me.state[me.room].push("noOver");
                            
                       //     me.nodes.txt_sjfhs.setString(L("JS"));
                            
                            var time = G.time - (data.time - G.gc.petcom.base.cd);
                            me.nodes.img_jdt.setPercent(time / G.gc.petcom.base.cd * 100);
        
                            var actionName = me.getWaitAniName(time);
                            me["ageAni"+k].ani.play(actionName, true);
                            if(dqtime<data.time){
                                dqtime=data.time;
                                X.timeout(me.nodes.txt_scsj_sz, data.time, function () {
                                    me.setRoomState();
                                    G.hongdian.getData('pet',1,function () {
                                        G.frame.scsj.checkRedPoint();
                                    });
                                }, null, null, function () {
                                    var time = G.time - (data.time - G.gc.petcom.base.cd);
                                    me.nodes.img_jdt.setPercent(time / G.gc.petcom.base.cd * 100);
                                });
                            }
                            
                        }
                    })(j)
                    
                } else {
                    (function(k){
                        var isNeeBuy = !G.frame.scsj.isBuy && me.room != 1;
                        if (isNeeBuy) {
                            me.state[me.room].push("needBuy");
                            G.DATA.noClick = true;
                            G.class.ani.show({
                                json: "ani_shenchong_gaojijiesuo_dh",
                                addTo: me.nodes["panel_dan"+(k+1)],
                                autoRemove: false,
                                onload: function (node, action) {
                                    me["lockAni"+k] = node;
                                    node.ani = action;
                                    action.gotoFrameAndPause(0);
                                    G.DATA.noClick = false;
                                },
                                onend: function () {
                                    me.setRoomState();
                                }
                            });
                            me["fhAni" + k].hide();
                        } else {
                            me.state[me.room].push("none");
                            me["fhAni" + k ].ani.play(me.room == 1 ? "wait1" : "wait3", true);
                        }
                        if (me.nodes.txt_scsj_sz.__timeoutTimer) {
                            me.nodes.txt_scsj_sz.clearTimeout(me.nodes.txt_scsj_sz.__timeoutTimer);
                            delete me.nodes.txt_scsj_sz.__timeoutTimer;
                        }
                   //     me.nodes.txt_sjfhs.setString(L("FH"));
                        var time = G.time - (dqtime - G.gc.petcom.base.cd);
                        me.nodes.img_jdt.setPercent(time / G.gc.petcom.base.cd * 100);
                        X.timeout(me.nodes.txt_scsj_sz, dqtime)
                    })(j)
                }
            }
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
        
            // me.setFhsInfo();
            me.setContents();
        },
        setFhsInfo: function () {
            var me = this;
            var lv = G.frame.scsj.DATA.crystal.lv;
            var conf = G.gc.petcom.base.petridish[lv];
            var isMax = G.gc.petcom.base.petridish[lv + 1] ? false : true;

            me.nodes.txt_fhnl_m.setString(X.STR(L("fhnl"), 1 + "/" + conf.cd));
            me.nodes.txt_fhnl_dj.setString(X.STR(L("fhsdj"), lv));
            me.nodes.btn_gs.setEnableState(!isMax);
            if (isMax) {
                me.nodes.txt_sjfhs.setString(L("FHSYMJ"));
                me.nodes.txt_sjfhs.setTextColor(cc.color(G.gc.COLOR.n15));
            }
        },
        setContents: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.pet;
            var allPet = G.DATA.pet;
            var tidKeys = Object.keys(allPet);

            tidKeys.sort(function (a, b) {
                var dataA = allPet[a];
                var dataB = allPet[b];
                var confA = conf[dataA.pid];
                var confB = conf[dataB.pid];

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else if (dataA.lv != dataB.lv) {
                    return dataA.lv > dataB.lv ? -1 : 1;
                } else {
                    return dataA.pid * 1 > dataB.pid * 1 ? -1 : 1;
                }
            });
            me.inFightPet = [];
            for (var pos in G.frame.scsj.DATA.crystal.play) {
                me.inFightPet.push(G.frame.scsj.DATA.crystal.play[pos]);
            }

            me.nodes.img_zwnr.setVisible(tidKeys == 0);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview_1, me.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8, 5);
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me=this;
            var petData = G.DATA.pet[data];
            var pet = G.class.pet(petData); 
            var suo=me.nodes.img_suo.clone();
            pet.addChild(suo);
            petData.isSuo=true;
            if(petData.lock){
                suo.show();
            }else{
                suo.hide();
            }
            pet.setPosition(ui.width / 2, ui.height / 2);
            pet.setGou(X.inArray(this.inFightPet, data), "bq_ysz", cc.p(33, 66));
            ui.removeAllChildren();
            ui.addChild(pet);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.sc_xq.once('close',function(){
                        me.table.reloadDataWithScroll(false);
                    }).data(petData).show();
                }
            });
        }
    });
    
    X.addAni = function (target) {
        var img = new ccui.ImageView("img/public/img_pub_jia.png", 1);
        img.setAnchorPoint(0.5, 0.5);
        img.setPosition(target.width / 2, target.height / 2);
        target.addChild(img);
        target.addAni = img;
        img.zIndex = 999;

        img.runAction(
            cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.3, 1)).repeatForever()
        );
    }
})();