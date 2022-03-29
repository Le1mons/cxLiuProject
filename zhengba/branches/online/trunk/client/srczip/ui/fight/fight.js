(function () {
    var ID ='fight';
    var fun = X.bUi.extend({
        extConf:{
            //可跳过的战斗类型  有竞技场、好友boss、好友pk、每日试炼
            showSkip:['pvjjc','pvshilian','pvfb','pvfriend','pvgjjjc', 'pvfuben', "hybs", "pvywzbjf","pvywzbzb", "video", "damijing", "pvghz", "pvwz", "pvwzvide", "pvwzdld", "pvmw", "mwvideo", "pvshizijun", "pvghtf"],
            // unshowSkip:[],
            showBattleType:['pvjjc','pvgjjjc','pvwz',"pvwzdld"],
            showFriendBoss:['pvfb', "hybs"],
            showDps: ["pvmw", "mwvideo", "pvghtf"], //显示伤害累计
            changebg:{
                pvguanqia: function () {
                    var maxGqid = G.class.tanxian.getCurMaxGqid();
                    var areaid = G.class.tanxian.getAreaById(P.gud.maxmapid > maxGqid ? maxGqid : P.gud.maxmapid);
                    var fightBg = G.class.tanxian.getExtConf().base.area[areaid].fightbg;
                    return fightBg;
                },
                pvdafashita: function (obj) {
                    return G.class.dafashita.get()[obj.pvid].fightmap;
                },
                pvfriend: function (obj) {
                    return 'zhandou_09.jpg';
                },
                pvjjc: function (obj) {
                    return 'zhandou_09.jpg';
                },
                pvfb: function (obj) {
                    return obj.pvid;
                    // return 'zhandou_09';
                },
                pvshilian: function (obj) {
                    return G.class.meirishilian.get()[obj.type][obj.nandu].fightmap;
                },
                pvfuben: function (obj) {
                    return G.class.gonghui.getFubenConf().fuben[obj.pvid].fightmap;
                },
                pvshizijun: function (obj) {
                    return G.class.shizijunyuanzheng.getLevel().level[obj.pvid + 1].fightmap;
                },
                pvmw: function () {
                    return "bg_zhandou2.jpg"
                },
                pvghtf: function (obj) {

                    return G.gc.ghrw.base.boss[obj.mapIdx].fightmap;
                }
            }
        },
        ctor: function (json,id, conf) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['buff.png','buff.plist'];
            me._super(json,id, conf);
        },
        getData:function(ftype,fdata,callback) {
            var me = this;
            G.ajax.send(ftype,fdata||[],function(txt,data) {
                if (data.s == 1 && data.d && data.d.eventres && data.d.eventres.roles) {
                    me.DATA = data.d.eventres;
                    callback && callback();
                }else{
                    //异常数据
                    me.DATA = {"winside":1};
                    me.doFightEnd();
                    callback && callback();
                }
            },false,{"why":"fight"});
            return this;
        },
        demo : function(d){
            var me = this;
            me.once('show',function(){
                me.DATA = d;
                if (me.data()) {
                    for (var key in me.data()) {
                        me.DATA[key] = me.data()[key];
                    }
                }
                me.initFight();
            });
            me.show();
        },
        setRoleScaleByFightType : function(){
            var me = this;
            if(me.DATA && me.DATA.pvType=='damijing'){
                return 1.4;
            }
        },
        startFight: function (data, callback, type) {
            var me = this;

            G.frame.yingxiong_fight.data({
                data:data,
                type: type || "jjckz",
                callback: callback
            }).show();
        },
//         startFight : function(fightData_or_requestFightType,requestFightData){ // , test
//             var me = this;
//
// //          X.loadPlist(['skillani/zhandoutongyong.png','skillani/zhandoutongyong.plist'],function(){
// //              if(typeof(fightData_or_requestFightType)=='object'){
// //                  me.DATA = fightData_or_requestFightType;
// //                  me.show();
// //              }else{
// //                  me.requestFightType = fightData_or_requestFightType;
// //                  me.requestFightData = requestFightData;
// //                  me.DATA = null;
// //                  me.show();
// //              }
// //          });
//             return me;
//         },
//      initRoles : function(callback){
//      	var me = this;
//      	var _pos = me.getRoleDefaultPos();
//
//      	for(var rid in me.DATA.roles){
//      		X.spine.show({
//	        		json:'spine/'+ X.arrayRand(['41066','15036']) +'.json',
//	        		addTo : this.nodes.panel_gw,
//	        		cache:true,
//	        		autoRemove:false,
//	        		rid : rid,
//	        		onload : function(node){
//	        			node.setName(node.conf.rid);
//	        			node.runAni(0,X.arrayRand(['wait','atk','byatk','die']),true);
//	        			node.scale = 0.65;
//
//	        			node.x = _pos[node.conf.rid].x;
//	        			node.y = _pos[node.conf.rid].y;
//	        			node.zIndex = _pos[node.conf.rid].z;
//	        			node.scale *= _pos[node.conf.rid].s;
//	        			node.scaleX *= (me.DATA.roles[node.conf.rid].side==1?-1:1);
//
//	        		}
//	        	});
//      	}
//      },
        onShow: function () {
            var me = this;

            me.myDps = 0;
            X.audio.playMusic("sound/fight_" + Math.floor(Math.random() * 3 + 1) + ".mp3", true);
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();

            me.onnp('hide', function () {
                cc.director.getScheduler().setTimeScale(1);
            });
            me.nodes.l1.hide();
            me.nodes.l2.hide();
            me.nodes.h1.hide();
            me.nodes.h2.hide();
            me.mscore = 0;
            me.escore = 0;
            me._fightPanel = me.ui.nodes.panel_gw; //战斗角色主panel，单独提出方便tanxian中的假战斗改写
        },

        //获取role站位
        getRoleDefaultPos : function(){
        	var me = this;
        	var posConf= {
        		//Z配置作废，交由程序自动根据y值控制
        		'side0pos1':{x:210,y:568-220,z:5,s:1.05},
        		'side0pos2':{x:210,y:568+40,z:2,s:1.05},
        		'side0pos3':{x:125,y:568-370,z:6,s:1.1},
        		'side0pos4':{x:75,y:568-160,z:4,s:1.05},
        		'side0pos5':{x:75,y:568+10,z:3,s:1},
        		'side0pos6':{x:125,y:568+170,z:1,s:0.95},

        		'side1pos1':{x:640-210,y:568-220,z:5,s:1.05},
        		'side1pos2':{x:640-210,y:568+40,z:2,s:1.05},
        		'side1pos3':{x:640-125,y:568-370,z:6,s:1.1},
        		'side1pos4':{x:640-75,y:568-160,z:4,s:1.05},
        		'side1pos5':{x:640-75,y:568+10,z:3,s:1},
        		'side1pos6':{x:640-125,y:568+170,z:1,s:0.95},
        	};

        	//统计双方前后排人数
        	var nums = {side0:{front:0,back:0,frontRoles:[],backRoles:[]},side1:{front:0,back:0,frontRoles:[],backRoles:[]}}
        	for(var rid in me.DATA.roles){
        		var _info = me.DATA.roles[rid];
                if(_info['sqid']!=null)continue;
        		var _sideKey = 'side' + me.DATA.roles[rid].side;

        		if(_info.pos == '1' || _info.pos == '2'){
        			nums[ _sideKey ].front ++;
        			nums[ _sideKey ].frontRoles.push(_info);
        		}else{
        			nums[ _sideKey ].back ++;
        			nums[ _sideKey ].backRoles.push(_info);
        		}
        	}

        	//按POS排序
        	nums['side0'].frontRoles.sort(function(a,b){
        		return a.pos - b.pos;
        	});
        	nums['side0'].backRoles.sort(function(a,b){
        		return a.pos - b.pos;
        	});

        	nums['side1'].frontRoles.sort(function(a,b){
        		return a.pos - b.pos;
        	});
        	nums['side1'].backRoles.sort(function(a,b){
        		return a.pos - b.pos;
        	});

        	//根据前后排人数数量，重排队伍位置
        	var pos = {};
        	for(var s=0;s<=1;s++){
        		cc.each(nums['side'+s].frontRoles,function(v,index){
        			var _posKey = 'side'+ s +'pos'+ v.pos;
        			pos[v.rid] = posConf[_posKey];

        			if(nums['side'+s].front == 1){
        				//如果前排只有1个人，站在中间
        				pos[v.rid].y = posConf['side'+s+"pos1"].y + (posConf['side'+s+"pos2"].y - posConf['side'+s+"pos1"].y)/2;
        				//pos[v.rid].z = posConf['side'+s+"pos2"].z;
                        if(v.mowangtype && nums['side'+s].back == 0) {
                            //只有一个魔王不带爪牙站位往后调
                            pos[v.rid].x += 100;
                        }

        			}
        		});

        		cc.each(nums['side'+s].backRoles,function(v,index){
        			var _posKey = 'side'+ s +'pos'+ v.pos;
        			pos[v.rid] = posConf[_posKey];

        			if(nums['side'+s].back == 1){
        				pos[v.rid] = posConf['side'+s+"pos4"];
        				//pos[v.rid].y = posConf['side'+s+"pos4"].y + (posConf['side'+s+"pos5"].y - posConf['side'+s+"pos4"].y)/2;
        			}else if(nums['side'+s].back == 2){
        				if(index==0){
        					pos[v.rid] = posConf['side'+s+'pos3'];
        				}else if(index==1){
        					pos[v.rid] = posConf['side'+s+'pos6'];
        				}
        				pos[v.rid].x = posConf['side'+s+"pos3"].x;

        			}else if(nums['side'+s].back == 3){
        				if(index==0){
        					pos[v.rid] = posConf['side'+s+'pos3'];
        				}else if(index==1){
        					pos[v.rid] = posConf['side'+s+'pos4'];
        					pos[v.rid].y = posConf['side'+s+"pos4"].y + (posConf['side'+s+"pos5"].y - posConf['side'+s+"pos4"].y)/2;
        				}else if(index==2){
        					pos[v.rid] = posConf['side'+s+'pos6'];
        				}
        			}
        		});
        	}
        	return pos;
        },

        initFight : function(){
            var me = this;
            //me.leftRolesSumHp = me._getSumHP(me.DATA.roles[0]);
            //me.rightRolesSumHp = me._getSumHP(me.DATA.roles[1]);
            me._posInfo = me.getRoleDefaultPos();
            for(var rid in me._posInfo){
            	me._posInfo[rid].z = 1400-me._posInfo[rid].y;
            }
            me._initFight();
        },
        _initFight : function(){
            var me = this;
            G.event.emit('inFight');
            me.fighting = true;
            me.timeSpeed = X.cacheByUid('fight_timeSpeed') || 1;
            me.ui.nodes.panel_gw.removeAllChildren();
            //me.initTop();
            me.changeFightBg();
            me.initRoles();

            me.setPlayer();

            this.setFightSpeed(me.timeSpeed);
            me.setMyDpsNum();
            me.setZhenfa();
            me.setSkipState();
            me.battleScore(me.mscore,me.escore);
        },
        initRoles : function(callback){
            var me = this;

            me.roleList = {};
            var roles = me.DATA.roles;
            var needLoad = Object.keys(me.DATA.roles).length;

            me.onnp('fightRole_showed',function(){
                //每个role加载完毕时，会广播该事件
                needLoad--;
                if(needLoad==0){
                    //所有参战单位已加载完毕
                    me.ui.setTimeout(function(){
                        //role有入场动画，等待所有单位走进战场完毕后
                    	me.tranLog();
                    },200/me.timeSpeed);
                    me.setFightSpeed( me.timeSpeed );
                }
            },'fight_fightRole_showed');

            for(var rid in roles){
                if(roles[rid]['hid'] != null){
                    if(me.setRoleScaleByFightType()!=null){
                        roles[rid].enlargepro = me.setRoleScaleByFightType();
                    }
                    me.roleList[ rid ] = new G.class.fightRole(roles[rid]);
                }
                if(roles[rid]['sqid'] != null){
                    me.roleList[ rid ] = new G.class.fightShenQi(roles[rid]);
                    me.ui.finds('sb'+ (roles[rid].side*1+1)).show();
                }
                if(roles[rid]["mowangtype"] != null) {
                    me.roleList[ rid ] = new G.class.bossRole(roles[rid]);
                }
                // me.roleList[rid].setVisible(false);
                me.nodes.panel_gw.addChild(me.roleList[rid]);
                // me.showRoles(me.roleList[rid]);
            }
        },
        setMyDpsNum: function(isAni) {
            var me = this;

            if(X.inArray(me.extConf.showDps, me.DATA.pvType)) {
                me.nodes.panel_dps.show();
                me.nodes.txt_sh.setString(X.fmtValue(me.myDps));

                if(isAni) {
                    me.nodes.txt_sh.runActions([
                        cc.scaleTo(0.1, 1.2, 1.2),
                        cc.scaleTo(0.1, 1, 1)
                    ]);
                }
            }
        },
        showRoles: function(role) {
            var me = this;

            G.class.ani.show({
                json: "ani_guaiwushuaxin",
                addTo: me.nodes.panel_gw,
                x: role.x,
                y: role.y,
                cache: true,
                repeat: false,
                autoRemove: true,
                onend: function () {
                    role.setVisible(true);
                }
            });
        },
        tranLog : function(){
            var me = this;
            me.DATA.fightPlayLog = me.DATA.fightlog;

            me.DATA.actIndex = 0;
            me.DATA._skip = false;
            //console.log(me.DATA.fightPlayLog);
            me.tranRound();
        },
        tranRound : function(){
            var me = this,
                flog = me.DATA.fightPlayLog,
                len = flog ? flog.length : 0,
                act;

            //战斗已经解析完毕
            //if(me.DATA.actIndex + 1 >= len){
                //me.showRes(me.DATA.winside);
                //return;
            //}

            if(me.DATA.isPause){
            	//新手指导中需要
            	return;
            }

            for(var i=me.DATA.actIndex;i<len;i++){
                act = flog[i];
                if (act.act && act.act == 'turn') {
                    me.setRoundNum(act.v); //设置回合数
                }

                var _actFunctionKey = me.DATA._skip ? 'act_skip_'+ act.act : 'act_'+ act.act; //判断是否点击了跳过
                //if(!cc.sys.isNative){
                	cc.log('==',me.DATA.actIndex,_actFunctionKey,JSON.stringify(act));
                //}
                if(me[ _actFunctionKey ]){
                    //找到一个需要处理的节点
                    //console.log('act index',i, _actFunctionKey );
                    if(me.DATA._skip){
                        //点击了跳过，则一次循环处理完所有节点，不回调
                        me[_actFunctionKey]( act );
                        if (act.act && act.act == 'turn') {
                            me.setRoundNum(act.v); //设置回合数
                        }
                        me.showRes(me.DATA.winside);
                    }else{
                        //否则，只处理一个节点，然后回调循环处理
                        me.DATA.actIndex=i+1;
                        me[_actFunctionKey]( act , function(){
                            	me.tranRound();
                        });
                        break;
                    }
                }
                else {
                    if (me.DATA._skip) {
                        me.showRes(me.DATA.winside);
                        break;
                    }
                }
            }

            if(me.DATA._skip){
//              me.DATA.actIndex = len;
//              me.setRoundNum(me.DATA.flog.length); //设置回合数
//              me.act_f5AllHP();
//              me.tranRound();
            }
        },
        skipEnd : function(){
            //跳过
            var me = this;
            me.DATA._skip = true;
        },
        act_fightres : function(){
        	var me = this;
        	me.showRes(me.DATA.winside);
        },
        showRes:function(win) {
            var me = this;


            me.event.emit('willShowRes');
			// return;

            var data = me.data();
            if(data && data.hideRes){
                me.ui.setTimeout(function() {
                    me.doFightEnd();
                },600);
                return;
            }

            if(me.DATA.winside == '0'){
                // var _res = X.viewCache.getViewByClass(G.class.fight_win,[me.DATA]);
                if (me.data() && me.data().pvType && X.inArray(me.extConf.showBattleType, me.data().pvType)) {
                    if(me.data().isVideo && (me.DATA.headdata[1].uid && P.gud.uid == me.DATA.headdata[1].uid)){
                        G.frame.fight_fail_battle.show();
                    }else{
                        G.frame.fight_win_battle.show();
                    }
                } else if((me.data() && me.data().pvType && X.inArray(me.extConf.showFriendBoss, me.data().pvType))){
                    G.frame.fight_win_friendboss.show();
                }else{
                    G.frame.fight_win.show();
                }
                me.battleScore(me.mscore += 1,me.escore);
            }else{
                // var _res = X.viewCache.getViewByClass(G.class.fight_res_shibai,[me.DATA]);
                if (me.data() && me.data().pvType && X.inArray(me.extConf.showBattleType, me.data().pvType)) {
                    if(me.data().isVideo && (me.DATA.headdata[1].uid && P.gud.uid == me.DATA.headdata[1].uid)){
                        G.frame.fight_win_battle.show();
                    }else{
                        G.frame.fight_fail_battle.show();
                    }
                } else if((me.data() && me.data().pvType && X.inArray(me.extConf.showFriendBoss, me.data().pvType))){
                    G.frame.fight_fail_friendboss.show();
                }else{
                    G.frame.fight_fail.show();
                }
                me.battleScore(me.mscore,me.escore += 1);
            }

            me.event.emit('loadedShowRes');
            // me.ui.addChild(_res);
        },
        doFightEnd : function(node){
            var me = this;
            me.fighting = false;
            me.emit('fightEnd',me.DATA);
            me.remove();
        },
        onRemove: function () {
            var me = this;
        	//this.ui.nodes.panel_gw.removeAllChildren();
            X.audio.playMusic("sound/city.mp3", true);
            me.mscore && delete me.mscore;
            me.escore && delete me.escore;
            me.emit("hide");
        },
        bindBTN : function(){
            var me = this;

            //跳过
            me.nodes.btn_tg.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var obj = {
                        lv: 50,
                        vip: 2
                    };
                    if((P.gud.lv >= obj.lv || P.gud.vip >= obj.vip) || me.DATA.pvType == "video" || me.DATA.pvType == "pvwz"){
                        me.skipEnd();
                    }else{
                        G.tip_NB.show(X.STR(L("FIGHT_TG"), obj.lv, obj.vip));
                    }
                }
            });
            // 快进   加速
            me.nodes.btn_js.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.timeSpeed == 1) {
                        var obj = {
                            vip:1,
                            lv:30,
                            speed:2
                        };

                        if (P.gud && P.gud.vip < obj.vip && P.gud.lv < obj.lv) {
                            G.tip_NB.show(X.STR(L('FIGHT_JS_TIP'),obj.vip,obj.lv,obj.speed));
                            return;
                        }
                    }
                    me.timeSpeed++;
                    if (me.timeSpeed > 2) {
                        me.timeSpeed = 1;
                    }
                    me.setFightSpeed(me.timeSpeed);
                    X.cacheByUid('fight_timeSpeed',me.timeSpeed);
                }
            });
        }


        ,_shake : function(shakeLevel){
            //场景震动
            var me = this;
            if(!shakeLevel || shakeLevel=="" || shakeLevel*1 == 0)return;

            //记录初始位置
            if(!me.ui.nodes.ground.__initPos){
                me.ui.nodes.ground.__initPos = me.ui.nodes.ground.getPosition();
            }
            //防止动作重复执行
            me.ui.nodes.ground.setPosition( me.ui.nodes.ground.__initPos );
            me.ui.nodes.ground.stopActionByTag(65421747);

            shakeLevel = shakeLevel*1;

            var acts = [];
            for(var i=0; i < shakeLevel*2; i++){
                acts.push( cc.moveBy(0.03, 0, shakeLevel*5 ) );
                acts.push( cc.moveBy(0.03, 0, shakeLevel*-5 ) );
            }
            acts.push(cc.callFunc(function(){
                me.ui.nodes.ground.setPosition( me.ui.nodes.ground.__initPos );
            },me));

            me.ui.nodes.ground.runActions(acts,65421747);
        }

        ,_addSkillAni : function(fromPosition,toPosition,skillAniconf,callback,extData){
            //解析skillani的配置，决定动画的展现形式
            var me = this;
            var _class;

            var _cacheID = skillAniconf.ani;
            if(extData && _cacheID.indexOf('{side}')!=-1){
                _cacheID = _cacheID.replace('{side}', extData.from.data.side == '1' ? 'z' : 'f');
            }

//          if(skillAniconf.ani.endsWith('.png')){
//              //如果是以png结束
//               _class = G.class.skillAniPNG;
//          }else{
                //默认cocos csb动画
                _class = G.class.skillAniCSB;
//          }

            cc.log('skillAniconf',_cacheID,skillAniconf);

            var _view = X.viewCache.getViewByClass(_class, [skillAniconf,function(){

                //技能音效
//              if(skillAniconf.sound && skillAniconf.sound!=""){
//                  var _sound = 'skillsound/'+ skillAniconf.sound +'.mp3';
//                  cc.log('_sound',_sound);
//                  X.audio.playEffect(_sound,false);
//              }
//                 this.setSpeed(me.timeSpeed || 1);
                //开始处理技能位置
                var _that = this;

                //技能倍速控制
                if(me.timeSpeed==1){
                	//1倍速时，动画为实际速度的2倍
                	this.action.setTimeSpeed(2);
                }else if(me.timeSpeed==2){
                	//2倍速时，动画为实际速度的3倍
                	this.action.setTimeSpeed(6);
                }


                this.startMove( fromPosition,toPosition ,function(){
                    callback && callback();
                });
            }] , _cacheID );

            _view.zIndex = 1400-toPosition.y+10;
            if(skillAniconf.pos == 1) _view.zIndex = 1400 + 10; //群攻技能
            //注意：此方法会在tanxian的模拟战斗中被复用
            me._fightPanel.addChild( _view );
            return _view;
        }

         //击中动画
		,hit_ani: function(from,topos,skillAni){
			var me = this;
			me._shake(skillAni.shake);
		    if(!skillAni.hitani || skillAni.hitani=="")return;

		    me._addAniAt(topos,skillAni.hitani,function(node,action){
		    	if(from.data.side == 1){
	        		node.scaleX = -1;
	        	}else{
	        		node.scaleX = 1;
	        	}
		    });
		}

		,_addAniAt : function(pos,aniFile,callback){
			var me = this;
			G.class.ani.show({
		        json : "skillani/" + aniFile,
		        x: pos.x,
		        y: pos.y,
		        z:1400-pos.y,
		        addTo:me._fightPanel,
		        cache:true,
		        onload : function(node,action){
		        	callback && callback(node,action);
		        }
		    });
		}

        ,_parseSkillAni : function(data,skillAniconf,callback){
            var me = this;

            var fromID = data.from,
                toIDS = Object.keys(data.to);

            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                //兼容错误
                me.ui.setTimeout(function(){
                    callback && callback();
                },500);
                return;
            }
            var toPos;
            //攻击和受击方显示血条
            from.showHPBar && from.showHPBar();

            for(var i=0;i<toIDS.length;i++){
                me.roleList[ toIDS[i] ] && me.roleList[ toIDS[i] ].showHPBar && me.roleList[ toIDS[i] ].showHPBar();
            }
            var _playSound = true;
            if(data._isTanXianSimularFight && !G.frame.tanxian.isTop){
            	//如果是探险里调用的本方法，则判断探险是否处于顶端，否则不播放音乐
            	_playSound=false;
            }

            if(skillAniconf.shifaani) {
                G.class.ani.show({
                    json: "skillani/" + skillAniconf.shifaani,
                    y: 65,
                    cache: true,
                    addTo: from,
                })
            }

            if(me[ "skill_" + data.skillid ]) {//特殊技能解析
                return me[ "skill_" + data.skillid ](data, skillAniconf, callback);
            }

            var _showSkillANIFun = function(ifEmitCallback){
                if(ifEmitCallback==null)ifEmitCallback=true;

                if(skillAniconf.pos=='2'){
                    //放置在to身上加动画
                    if(toIDS.length==0){
                        //目标数组为空，兼容异常
                        from.ui.setTimeout(function(){
                            ifEmitCallback && callback && callback();
                        },500);
                    }else{
                        //在所有目标身上叠加技能效果
                        var _hits=0;
                        var allLen = toIDS.length;
                        _playSound && skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);

                        for(var i=0;i<allLen;i++){
                            (function(index){
                                to = me.roleList[ toIDS[index] ];
                                if(!to){
                                	allLen--;
                                	return;
                                }
                                var _topos = to.getPosition();

                                if (skillAniconf.ani) {
                                    var _view = me._addSkillAni( from.getPosition() , _topos , skillAniconf , function(){
                                        _hits++;
                                        //所有子弹已命中
                                        me.hit_ani(from,_topos,skillAniconf);
                                        if(_hits==allLen){
                                            ifEmitCallback && callback && callback();
                                        }
                                    }, { from: from, to: to});

									if(skillAniconf.animovetype!='shape' && skillAniconf.animovetype!='bullet'){
										//此模式不用翻转，startMove里会控制缩放和角度
										if( from.data.side == 1 ){
	                                        _view.scaleX = -1;
	                                    }else{
	                                        _view.scaleX = 1;
	                                    }
									}
                                } else {
                                    ifEmitCallback && callback && callback();
                                }
                            })(i);
                        }
                    }
                }else if(skillAniconf.pos=='3'){
                	//放置在from身上
                    if (skillAniconf.ani) {
                    	_playSound && skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);
                        var _view = me._addSkillAni( from.getPosition() , from.getPosition() , skillAniconf , function(){
                            //增加受击动画
                            for(var i=0;i<toIDS.length;i++){
                                (function(index){
                                    var to = me.roleList[ toIDS[index] ];
                                    if(to){
                                    	var _topos = to.getPosition();
                                    	me.hit_ani(from,_topos,skillAniconf);
                                    }
                                })(i);
                            }

                            ifEmitCallback && callback && callback();
                        },{from:from,to:from});

                        if( from.data.side == 1 ){
                            _view.scaleX = -1;
                        }else{
                            _view.scaleX = 1;
                        }
                    } else {
                        ifEmitCallback && callback && callback();
                    }

                } else if(skillAniconf.pos=='1'){
                    //放置在对面中央
                    if(skillAniconf.ani) {
                        _playSound && skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);
                        var parent = from.getParent();
                        var toPosition = {x: from.data.side == 1 ? parent.width / 2 - 120 : parent.width / 2 + 120, y: parent.height / 2};
                        var _view = me._addSkillAni( from.getPosition() , toPosition , skillAniconf , function(){
                            //增加受击动画
                            for(var i=0;i<toIDS.length;i++){
                                (function(index){
                                    var to = me.roleList[ toIDS[index] ];
                                    if(to){
                                        var _topos = to.getPosition();
                                        me.hit_ani(from,_topos,skillAniconf);
                                    }
                                })(i);
                            }

                            ifEmitCallback && callback && callback();
                        },{from:from,to:from});

                        if( from.data.side == 1 ){
                            _view.scaleX = -1;
                        }else{
                            _view.scaleX = 1;
                        }
                    } else {
                        ifEmitCallback && callback && callback();
                    }
                } else {
                    cc.log('未被支持的pos字段，请确认配置' , skillAniconf);
                }
            };

            if(data.atkType == 'realinjury'){
                //神器攻击特殊处理，需要先播放一个入场效果
                from.setTimeout(function(){
                    from.atk({
                        actname:'atk',
                        hitCallback : function(){
                            from.hide();
                            me._showShenQiInFightAni(data,from.data,function(){
                                _showSkillANIFun();
                                //callback && callback();
                            },function(){
                                from.show();
                            });
                        }
                    });
                },100);
            }else if(skillAniconf.moveto=='99'){
                //99特殊值，不移动&无攻击动作
                _showSkillANIFun();
            }else if(skillAniconf.moveto=='3'){
            	//移动到目标的前方
            	var _topos = to.getPosition();
            	var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);

            	//if(me.ID()=='fight'){
            	//	from.zIndex = 1400; //探险界面假战斗会复用该方法
            	//}else{
            		from.zIndex = 1400-movetoPos.y;
            	//}

            	//from.setPosition( movetoPos );
            	from.runActions([
            		cc.moveTo(0.1,movetoPos)
            	]);
            	from.setTimeout(function(){
            		from.atk({
	                    actname:'atk',
	                    hitCallback : function(){
                            _showSkillANIFun();
	                    }
	                });
            	},200);
            }else{
            	from.setTimeout(function(){
	                from.atk({
	                    actname:'atk',
	                    hitCallback : function(){
	                        _showSkillANIFun();
	                    }
	                });
                },100);
            }
        }
        ,act_buff : function(data,callback){
            //普通攻击
            var me = this;
            var toid = data.t,
                to = me.roleList[toid];
            if(!to)return callback();

            to.addBuff(data);
            callback && callback();
        }
        ,act_buffdel : function(data,callback){
            //普通攻击
            var me = this;
            var toid = data.t,
                to = me.roleList[toid];
            if(!to)return callback();

            to.delBuff(data);
            callback && callback();
        }
        ,act_afatk : function(data,callback){
            callback && callback();
        }
        ,act_atk : function(data,callback){
            //普通攻击
            var me = this;
            var fromID = data.from,
                from = me.roleList[fromID],
                toIDS = Object.keys(data.to);
            if(!from || toIDS.length==0)return callback();

            var skillani = G.gc.skillani[ data.skillid ]; //

            if(skillani == null){
                cc.log('act_atk时，json/skillani.json中缺少配置' + data.skillid );
                return callback();
            }

            G.class.wordBubble(skillani.bubble, from, function () { //解析技能配置是否有文字泡
                return me._parseSkillAni(data,skillani,function(){
                    callback && callback();
                });
            });
        },
        _showShenQiInFightAni : function(data,fromdata,hitcallback,endcallback){
            var me = this;
            //播放神器开始攻击前的入场动画
            var _conf = G.gc.shenqicom.shenqi[ fromdata.sqid ];
            me._showBlackMatrix(data);

            _conf.skillsound && X.audio.playEffect('skillsound/'+ _conf.skillsound + '.mp3',false);
            G.class.ani.show({
                json:_conf.skillshow,
                addTo:me._fightPanel,
                z:999,
                repeat:false,
                autoRemove:true,
                onload : function(node, action){
                    action.setTimeSpeed(1);
                    node.scaleX *= (fromdata.side==1?-1:1);
                },
                onkey : function(node, action, event){
                    if(event=='hit'){
                        hitcallback && hitcallback();
                        me._hideBlackMatrix(data);
                    }
                },
                onend : function(node, action){
                    endcallback && endcallback();
                }
            });


            //G.class.ani.show({
            //    json:'ani_shenbing_tongyong',
            //    addTo:me.nodes.ground,
            //    onload : function(node,action){
            //        action.setTimeSpeed(2);
            //
            //        //增加神器动画
            //        var _shenQiLayer = node.finds('shenqi');
            //        _shenQiLayer.removeAllChildren();
            //        var _conf = G.gc.shenqicom.shenqi[ data.sqid ];
            //        G.class.ani.show({
            //            json:_conf.skillshow,
            //            addTo:_shenQiLayer,
            //            repeat:true,
            //            autoRemove:false,
            //            onload : function(_node, _action){
            //                _action.setTimeSpeed(2);
            //                node.scaleX *= (data.side==1?-1:1);
            //            }
            //        });
            //    },
            //    onend : function(){
            //
            //    },
            //    onkey: function(node, action, event) {
            //        if(event == "gongji"){
            //            callback && callback();
            //        }
            //    },
            //    autoRemove:true,
            //    repeat:false
            //});
        }
        ,_showBlackMatrix : function(data){
            var me = this;
            var layer = me._fightPanel.finds('blackmatrix');
            if(!cc.isNode(layer)){
                layer = new ccui.Layout();
                layer.setBackGroundColor( cc.color('#000000') );
                layer.setBackGroundColorOpacity(180);
                layer.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
                layer.setContentSize( me._fightPanel.getContentSize() );
                layer.setName('blackmatrix');
                layer.zIndex = 5;
                layer.setAnchorPoint(0,0);
                layer.setPosition(cc.p(0,0));
                me._fightPanel.addChild(layer);
            }
            layer.show();

            //把和本次节点无关的角色zindex降低
            for(var rid in me.roleList){
                if(rid == data.from || data.to[rid] )continue;
                if(!cc.isNode(me.roleList[rid]))continue;
                me.roleList[rid]._bbzIndex = me.roleList[rid].zIndex;
                me.roleList[rid].zIndex = 1;
            }
        }

        ,_hideBlackMatrix : function(data){
            var me = this;
            var _node = me._fightPanel.finds('blackmatrix');
            if(cc.isNode(_node)){
                _node.hide();
            }
            //还原无关的角色zindex
            for(var rid in me.roleList){
                if(rid == data.from || data.to[rid] )continue;
                if(!cc.isNode(me.roleList[rid]))continue;
                if(me.roleList[rid]._bbzIndex==null)continue;
                me.roleList[rid].zIndex = me.roleList[rid]._bbzIndex;
                delete me.roleList[rid]._bbzIndex;
            }
        }
        ,act_fanji : function(data,callback){
            //反击
            var me = this;
            var from = me.roleList[data.from];
            if(!from){
            	//cc.log('0000');
            	me.ui.setTimeout(function(){
            		callback && callback();
            	},100);
            	return;
            }
            me.ui.setTimeout(function(){
            	//cc.log('1111');
            	from && from.resetPos(false);
            	from.role.stopAllAni();

            	me.act_atk(data,function(){
            		//cc.log('2222');
	                var from = me.roleList[data.from];
	                from && from.resetPos(true);
	            	me.ui.setTimeout(function(){
	            		callback && callback();
	            	},100);
	            });
            },200/me.timeSpeed);
        }
        ,act_stopAct : function(data,callback){
        	var me = this;
            if(data.from.indexOf('artifact')!=-1){
                me.ui.setTimeout(function(){
                    callback && callback();
                },1000)
                return;
            }
        	me.ui.setTimeout(function(){
        		me.roleList[ data.from ] && me.roleList[ data.from ].resetPos(true);
        		me.ui.setTimeout(function(){
        			callback && callback();
        		},200/me.timeSpeed);
        	},500/me.timeSpeed)
        }
        ,act_dead : function(data,callback){
        	var me = this;
        	var to = me.roleList[data.to];

        	if(!cc.isNode(to)){
        		return callback && callback();
        	}

    		to.data.dead = true;
    		to.hideInfo && to.hideInfo();
    		to.delAllBuffANI && to.delAllBuffANI();
    		to.die();

        	me.ui.setTimeout(function(){
        		callback && callback();
        	},0);

        	if (!data.canFuHuo) {
        		to.role.runActions([
        			cc.fadeOut(1.5)
        		]);
	        	me.ui.setTimeout(function(){
					cc.isNode(to) && to.removeFromParent();
	    		},1500);
    		}else{
    			to.addBuffANI('mubei'); //加墓碑
    		}
        }
        ,act_fuhuo : function(data,callback){
        	var me = this;
        	//{"to": "role_5", "v": 101159, "nv": 101159, "act": "fuhuo"}
        	var to = me.roleList[data.to];
        	if(!cc.isNode(to)){
        		return callback && callback();
        	}
        	to.showInfo && to.showInfo();
        	to.delBuffANI('mubei'); //删墓碑
        	to.data.dead = false;
        	me._addAniAt(to.getPosition(),G.gc.skillani['fuhuo'].ani); //复活动画
        	to.wait();
        	callback && callback();
        }
        ,act_hp : function(data,callback){
        	//{"dps": -361, "jz": false, "act": "hp", "bj": false, "r": "role_1", "at": "xp", "v": -361, "nv": 14949}  //被人攻击
        	//{"r": "role_0", "v": -2745, "nv": 13079, "act": "hp"} buff等其他导致掉血
            var me = this;
            var fromID = data.r,
                num = data.v*1;
            var from = me.roleList[fromID];
            if(!from)return callback();

          	from.data.hp = data.nv*1;
            from.f5Bar();

            //from.hmpChange(num,'hp');
            from.hmpChange(data);
            from.showHPBar();
            if(num<0 && data.at){
            	from.byatk();
            }
            if(from.data.side == 1) {
                if(data.v && data.v < 0) {
                    me.myDps += Math.abs(data.v);
                    me.setMyDpsNum(true);
                }
            }
            //me.f5Top();
            callback && callback();
        }
        ,act_nuqi : function(data,callback){
            var me = this;
            var fromID = data.r,
                num = data.v*1;
            var from = me.roleList[fromID];
            if(!from)return callback();

          	from.data.nuqi = data.nv*1;
            from.f5Bar();
            callback && callback();
        }
        ,act_changeskin: function(data, callback) {
            var me = this;
            var from = me.roleList[data.to];
            if(!from) return callback();

            if(data.skillid && G.gc.skillani[data.skillid]) {
                if(!data.from) data.from = data.to;
                var to = {};
                to[data.to] = 0;
                data.to = to;
                G.class.wordBubble(G.gc.skillani[data.skillid].bubble, from, function () { //解析技能配置是否有文字泡
                    from.role.runActions([
                        cc.fadeTo(0.75, 0)
                    ]);
                    me._parseSkillAni(data, G.gc.skillani[data.skillid], function () {
                        from.changeModel && from.changeModel(data.skin);
                        me.onnp("fightRole_showed", function () {
                            callback && callback();
                        });
                    })
                });
            } else {
                from.changeModel && from.changeModel(data.skin);
                me.onnp("fightRole_showed", function () {
                    callback && callback();
                });
            }



        },
        //玩家信息
        setPlayer: function () {
            var me = this;

            var data = me.DATA.headdata || [];

            for (var i = 0; i < data.length; i++) {
                var pData = data[i];
                var txtName = me.nodes['txt_name' + (i + 1)];
                var txtLv = me.nodes['txt_dj' + (i + 1)];
                var layIco = me.nodes['panel_head' + (i + 1)];

                txtName.setString(pData.name);
                txtLv.setString(pData.lv);
                var conf = G.class.zaoxing.getHeadById(pData.head);
                if(conf) {
                    ico = conf.img;
                } else {
                    if(pData.head.split("_").length > 1) {
                        var str = pData.head.split("_")[0];
                        str = str.substring(0, str.length - 1);
                        str += 'a.png';
                        ico = str;
                    } else {
                        ico = pData.head + ".png";
                    }
                }
                layIco.setBackGroundImage('ico/itemico/' + G.class.fmtItemICON(ico),0);


                if(i == 1) {
                    txtLv.x += 5;
                    layIco.setAnchorPoint(1,0);
                    layIco.setFlippedX(true);
                }
            }
        },
        // 角色速度信息
        setFightSpeed: function (speed) {
            var me = this;
            me.nodes.txt_js.setString('x' + speed);

            if(speed == 1) {
                me.nodes.btn_js.loadTextureNormal("img/zhandou/btn_zhandou_js.png", 1);
            }else {
                me.nodes.btn_js.loadTextureNormal("img/zhandou/btn_zhandou_js2.png", 1);
            }

            for(var rid in me.roleList) {
                if(speed==2){
                    me.roleList[rid].speed(3); //加速后的速度
                }else{
                    me.roleList[rid].speed(2); //默认速度
                }

            }

            //角色倍速控制
            //for(var rid in me.roleList){
            //	var spineSpeed = 2; //默认为实际速度的2倍
            //	if(speed==3){
            //		//点击了2倍速后，速度为实际速度的3倍
            //		spineSpeed = 4;
            //	}
            //	me.roleList[rid].speed(spineSpeed);
            //}
        },
        // 阵法信息
        setZhenfa: function () {
            var me = this;

            var zfData = me.DATA.zhenfa || [];

            for (var i = 0; i < zfData.length; i++) {
                var zData = zfData[i];
                var layZf = me.nodes['panel_xg' + (i + 1)];
                layZf.removeBackGroundImage();
                layZf.removeAllChildren();
                if (zData && zData != '') {
                    var ico = G.class.zhenfa.getIcoById(zData);
                    layZf.setBackGroundImage('img/zhenfa/' + ico + '.png',1);

                    layZf.data = {
                        id:zData
                    };
                    G.class.ani.show({
                        json: "ani_zhenyingbuff16",
                        addTo: me.nodes['panel_xg' + (i + 1)],
                        x: me.nodes['panel_xg' + (i + 1)].width/2,
                        y: me.nodes['panel_xg' + (i + 1)].height/2,
                        repeat: true,
                        autoRemove: false,
                    });
                } else {
                    layZf.setBackGroundImage('img/zhenfa/zhenfa_1_h.png', 1);
                }
                layZf.setTouchEnabled(true);
                layZf.click(function (sender, type) {
                    G.frame.fight_zzkezhi.data((sender.data && sender.data.id) || "").show();
                });

            }
        },
        //设置回合数
        setRoundNum: function (round) {
            var me = this;

            if(round >15){
                me.showRes(1);
                return;
            }

            X.render({
                txt_hhs: function (node) {
                    var str = X.STR(L('X_ROUND'), round);
                    var rh = new X.bRichText({
                        size:20,
                        maxWidth:node.width,
                        lineHeight:32,
                        color:G.gc.COLOR.n5,
                        family:G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(node.width / 2 - rh.trueWidth() / 2,node.height - rh.trueHeight()));
                    node.removeAllChildren();
                    node.addChild(rh);
                }
            },me.nodes);
        },
        //冠军竞技场-设置比分
        battleScore:function(mscore,escore){
            var me = this;
            var m1 = me.nodes.l1;
            var m2 = me.nodes.l2;
            var e1 = me.nodes.h1;
            var e2 = me.nodes.h2;
            if(me.DATA.pvType == 'pvgjjjc' || me.DATA.pvType == 'pvwz' || me.DATA.pvType == 'pvwzdld'){
                me.nodes.p1.show();
                me.nodes.p2.show();
                if(mscore == 0){
                    m1.hide();
                    m2.hide();
                }else if(mscore == 1){
                    m1.show();
                    m2.hide();
                }else if(mscore == 2){
                    m1.show();
                    m2.show();
                }
                if(escore == 0){
                    e1.hide();
                    e2.hide();
                }else if(mscore == 1){
                    e1.show();
                    e2.hide();
                }else if(mscore == 2){
                    e1.show();
                    e2.show();
                }
            }
        },
        //
        setSkipState: function () {
            var me = this;

            //如果是录像，允许跳过
            if (me.data() && me.data().isVideo) {
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                me.nodes.btn_tg.setPositionX(502.45 - 70);
                return;
            }

            if (!X.inArray(me.extConf.showSkip, me.DATA.pvType)) {
                me.nodes.btn_tg.hide();
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 2);
            }else {
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                me.nodes.btn_tg.setPositionX(502.45 - 70);
            }

            if(me.DATA.pvType == "pvguanqia" && P.gud.maxmapid <= 4) {
                me.nodes.btn_js.hide();
            }
            // if (X.inArray(me.extConf.unshowSkip, me.DATA.pvType)) {
            //     me.nodes.btn_tg.hide();
            //     me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 2);
            // }
        },
        //修改战斗背景
        changeFightBg: function () {
            var me = this;

            var bg = me.ui.finds('bg');
            var pvtype2bg = me.extConf.changebg;

            if (me.DATA) {
                if (pvtype2bg[me.DATA.pvType]) {
                    var img = pvtype2bg[me.DATA.pvType](me.DATA) || 'zhandou_01.jpg';
                    bg.loadTexture('img/bg/' + img,0);
                }
            } else {
                bg.loadTexture('img/bg/zhandou_01.png',0);
            }

        }

        ,test : function(){
        	var me = this;
        	X.loadJSON('__js.json',function(err,json){
        		me.demo( json );
        	})
        }
    });

    G.frame[ID] = new fun('zhandou.json', ID);
})();
