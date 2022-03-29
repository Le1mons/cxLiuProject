(function () {
    var ID ='fight';
    var fun = X.bUi.extend({
        extConf:{
            //可跳过的战斗类型  有竞技场、好友boss、好友pk、每日试炼
            showSkip:['fightplay','shilianfight5','shilianfight','lht', 'pvwjzz', "xkfb", "fight_demo", 'niudanFight', 'sddl','pvjjc','pvshilian','pvfb','pvfriend','pvgjjjc',
                'pvfuben', "hybs", "pvywzbjf","pvywzbzb", "video", "damijing", "pvghz", "pvwz",
                "pvwzvide", "pvwzdld", "pvmw", "mwvideo", "pvshizijun", "pvghtf", "pvdafashita","fbzc",'wztt_one','wztt_three','wangzhezhaomu','demo','alaxi',
            "slzt"],
            // unshowSkip:[],
            showBattleType:['pvjjc','pvgjjjc','pvwz',"pvwzdld",'wztt_three','alaxi'],
            showFriendBoss:['pvfb', "hybs"],
            showDps: ["pvmw", "mwvideo", "pvghtf", "fight_demo",'wangzhezhaomu'], //显示伤害累计
            showYwBtn: [],
            showSkipByRound: {
                "lqsl":3,
                'wyhd':3,
                'newyear_xrtz':3
            },
            showDpsBox: ['lqsl', 'wyhd'],
            showJw: ["pvjjc", "pvgjjjc", "pvwz", "pvwzdld", "pvywzbjf", "pvywzbzb", "pvwzvide", "fbzc", "pvghz", 'pvfriend','wztt_one','wztt_three'],
            showBtnFunc: {
                // "pvmaze": function () {
                //     var data = G.frame.maze.DATA.data.total;
                //     return data[3] && data[3] >= 30;
                // }
            },
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
                },
                sddl: function () {

                    return G.frame.fight.DATA.map;
                },
                alaxi:function () {
                    return "zhandou_02.jpg"
                }
            }
        },
        ctor: function (json,id, conf) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['buff.png', 'buff.plist', 'zhenfa.png', 'zhenfa.plist'];
            me.needshowMainMenu = conf.needshowMainMenu;
            conf.releaseRes = false;

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
                me.DATA = d

                if (me.DATA.pvType == 'pvmaze') {
                    var idx = X.arrayFind(me.extConf.showSkip, 'pvmaze');
                    idx != -1 && me.extConf.showSkip.splice(idx, 1);
                    var data = G.frame.maze.DATA.data.total;
                    if (!me.DATA.isBoss && data[3] && data[3] >= 10) {
                        me.extConf.showSkip.push('pvmaze');
                    }
                }
                if(me.DATA.pvType == 'fightplay'){
                    me.ui.finds('panel_wjxx1').hide();
                    me.ui.finds('panel_wjxx2').hide();
                }
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
            data = data || {};
            G.frame.yingxiong_fight.data({
                data:data,
                type: type || "jjckz",
                callback: callback,
                pvType: data.pvType || ""
            }).show();
        },
        onShow: function () {
            var me = this;
            me.myDps = 0;
            me.roundShowSkip = [];
            me.boxNode = [];
            X.audio.playMusic("sound/fight_" + Math.floor(Math.random() * 3 + 1) + ".mp3", true);

            G.DATA.curFight = G.frame[me._id];
            me.sb1.sbUiVisible(false);
            me.sb2.sbUiVisible(false);
            me.sb1.checkPetIsOpen();
            me.sb2.checkPetIsOpen();
            me.sb1.addBar();
            me.sb2.addBar();
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();

            me.onnp('hide', function () {
                cc.director.getScheduler().setTimeScale(1);
            });
            me.initAuxiliaryUi();
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
                'side0pos7':{x:210,y:568-220,z:5,s:1.05},

        		'side1pos1':{x:640-210,y:568-220,z:5,s:1.05},
        		'side1pos2':{x:640-210,y:568+40,z:2,s:1.05},
        		'side1pos3':{x:640-125,y:568-370,z:6,s:1.1},
        		'side1pos4':{x:640-75,y:568-160,z:4,s:1.05},
        		'side1pos5':{x:640-75,y:568+10,z:3,s:1},
        		'side1pos6':{x:640-125,y:568+170,z:1,s:0.95},
                'side1pos7':{x:640-210,y:568-220,z:5,s:1.05}//龙骑试炼单独处理加个pos
        	};

        	//统计双方前后排人数
        	var nums = {side0:{front:0,back:0,frontRoles:[],backRoles:[]},side1:{front:0,back:0,frontRoles:[],backRoles:[]}};
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
            me._posInfo = me.getRoleDefaultPos();
            for(var rid in me._posInfo){
            	me._posInfo[rid].z = 1400-me._posInfo[rid].y;
            }
            me._initFight();
        },
        initAuxiliaryUi: function () {
            var me = this;

            function setFun(node) {
                node.sbUiVisible = function (bool) {
                    this.nodes.panel_sb.setVisible(bool);
                    this.nodes.panel_sbjdt1.setVisible(bool);
                };
                node.addBar = function () {
                    var father = this.nodes.panel_sbjdt1;
                    father.removeAllChildren();
                    var barBg = new ccui.ImageView("img/zhandou/img_zdjdtdi1.png", 1);
                    barBg.setAnchorPoint(0.5, 0.5);
                    barBg.setPosition(father.width / 2, father.height / 2);
                    father.addChild(barBg);

                    var bar = this.bar = new cc.ProgressTimer(new cc.Sprite("#img/zhandou/img_zdjdt1.png"));
                    bar.type = cc.ProgressTimer.TYPE_RADIAL;
                    bar.setAnchorPoint(0.5, 0.5);
                    bar.setPosition(barBg.width / 2, barBg.height / 2);
                    barBg.addChild(bar);

                    if (this.type == 1) {
                        father.setAnchorPoint(0.5, 0.5);
                        father.setRotation(-212);
                        father.setScale(.8);
                        father.setPosition(79, -14);
                    } else {
                        father.setAnchorPoint(0.5, 0.5);
                        father.setRotation(-212);
                        father.setScale(.8);
                        father.setPosition(78, -16);
                    }
                };
                node.checkPetIsOpen = function () {
                    if (!X.checkIsOpen("pet")) this.hideAllPet();
                };
                node.hideAllPet = function () {
                    for (var i = 1; i <= 4; i ++) {
                        this.nodes["panel_sb_jn" + i].hide();
                    }
                };
                node.setPet = function (allPetData) {
                    if (!X.checkIsOpen("pet")) return this.pet = {};
                    if (Object.keys(allPetData).length < 1) return this.hideAllPet();
                    this.pet = {};
                    for (var pos in allPetData) {
                        var ico = this.pet[allPetData[pos].rid] = this.nodes["panel_sb_jn" + pos];
                        this.pet[allPetData[pos].rid].cd = 0;
                        ico.children[2].hide();
                        ico.children[1].setBackGroundImage("ico/petico/pet_" + allPetData[pos].pid + ".png");
                    }
                };
                node.upCd = function () {
                    if (!this.pet || Object.keys(this.pet).length < 1) return;
                    var pet = this.pet;

                    for (var rid in pet) {
                        if (pet[rid].cd) pet[rid].cd --;
                    }
                    this.checkCd();
                };
                node.checkCd = function () {
                    for (var rid in this.pet) {
                        var pet = this.pet[rid];
                        if (pet.cd) {
                            pet.children[3].show();
                            pet.children[3].children[0].setString(pet.cd);
                        } else {
                            pet.children[3].hide();
                        }
                    }
                }
            }

            me.sb1 = me.ui.finds("sb1");
            me.sb2 = me.ui.finds("sb2");
            me.sb1.type = 1;
            me.sb2.type = 2;
            X.autoInitUI(me.sb1);
            X.autoInitUI(me.sb2);
            setFun(me.sb1);
            setFun(me.sb2);
        },
        _initFight : function(){
            var me = this;
            G.event.emit('inFight');
            me.sb1.sbUiVisible(false);
            me.sb2.sbUiVisible(false);
            me.sb1.nodes.panel_sb.removeAllChildren();
            me.sb2.nodes.panel_sb.removeAllChildren();
            me.sb1.bar.setPercentage(0);
            me.sb2.bar.setPercentage(0);
            me.fighting = true;
            me.timeSpeed = X.cacheByUid('fight_timeSpeed') || 1;
            me.ui.nodes.panel_gw.removeAllChildren();
            G.class.removeFightCache(me._id);
            me.changeFightBg();
            me.initRoles();

            me.setPlayer();
            me.nodes.l1.hide();
            me.nodes.l2.hide();
            me.nodes.h1.hide();
            me.nodes.h2.hide();

            this.setFightSpeed(me.timeSpeed);
            me.setMyDpsNum();
            me.setZhenfa();
            me.setSkipState(0);
            me.battleScore(me.mscore,me.escore);
            me.setButtonState();
            if((P.gud.vip >= 5 || P.gud.lv >= 70) && !X.cacheByUid('speedqipao')){//三倍速气泡
                me.nodes.panel_qp.show();
                me.nodes.panel_qp.x = me.nodes.btn_js.x + me.nodes.btn_js.width/2;
            }

        },
        setButtonState: function() {
            var me = this;

            if (X.inArray(me.extConf.showYwBtn, me.DATA.pvType)) {
                me.nodes.btn_yw.show();
            } else {
                me.nodes.btn_yw.hide();
            }

            if (X.inArray(me.extConf.showDpsBox, me.DATA.pvType)) {
                me.nodes.panel_box_tiao.show();
            } else {
                me.nodes.panel_box_tiao.hide();
            }
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
                        me.playTitleVs(function () {
                            me.tranLog();
                        });
                    },200/me.timeSpeed);
                    me.setFightSpeed( me.timeSpeed );
                }
            },'fight_fightRole_showed');

            var isKuiLei = false;
            for (var i in roles) if (roles[i].mowangtype == 99 || roles[i].mowangtype == 97)  {
                isKuiLei = true;
                break;
            }

            for(var rid in roles){
                if(roles[rid]['hid'] != null){
                    if(me.setRoleScaleByFightType()!=null){
                        roles[rid].enlargepro = me.setRoleScaleByFightType();
                    }
                    roles[rid].dead = false;
                    me.roleList[ rid ] = new G.class.fightRole(roles[rid]);
                    if (isKuiLei && roles[rid].side == 1) {//龙骑试炼傀儡初始隐藏
                        me.roleList[ rid ].hide();
                    }
                }
                if(roles[rid]['sqid'] != null){
                    me.roleList[ rid ] = new G.class.fightShenQi(roles[rid]);
                    me['sb'+ (roles[rid].side*1+1)].sbUiVisible(true);
                }
                if(roles[rid]["mowangtype"] != null) {
                    var isLockHp = roles[rid].lockHP == undefined ? true : false;
                    me.roleList[ rid ] = !isLockHp ? new G.class.bossRoleHp(roles[rid]) : new G.class.bossRole(roles[rid]);
                }
                if(roles[rid]['sqid'] == null) {
                    if (me.roleList[rid].data.pos == 7) {
                        me.roleList[rid].hide();
                    }
                    me.nodes.panel_gw.addChild(me.roleList[rid]);
                }
            }

            var allPet = {
                0: {},
                1: {}
            };
            for (var rid in me.DATA.fightres) {
                var ridData = me.DATA.fightres[rid];
                if (ridData.pid) {
                    allPet[ridData.side][ridData.pos] = ridData;
                }
            }
            me.sb1.setPet(allPet[0]);
            me.sb2.setPet(allPet[1]);
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

            if (X.inArray(me.extConf.showDpsBox, me.DATA.pvType)) {
                var conf = me.DATA.dps2dlz || G.gc.longqishilian[me.DATA.key].dps2dlz;
                var curIndex;
                for (var i = 1; i < conf.length; i ++) {
                    if (me.myDps < conf[i][0]) {
                        curIndex = i;
                        break;
                    }
                }
                if (curIndex == undefined) curIndex = conf.length - 1;
                if (me.lastIndex != undefined && curIndex > me.lastIndex) {
                    me.addBox(conf[me.lastIndex], me.DATA.dlzprize.shift());
                }
                if (!me.lastIndex && curIndex != 1) {
                    for (var i = 1; i < curIndex; i ++) {
                        me.addBox(conf[i], me.DATA.dlzprize.shift());
                    }
                }
                var curConf = conf[curIndex];
                me.nodes.img_jdt_zd.setPercent(me.myDps / curConf[0] * 100);
                me.nodes.txt_box_wz.setString(X.fmtValue(me.myDps) + "/" + X.fmtValue(curConf[0]));
                me.lastIndex = curIndex;
            }
        },
        addBox: function (conf, prize) {
            var me = this;
            var boxNode = me.ui.finds("Image_6");
            var start = boxNode.convertToWorldSpace();
            var pos = cc.p(start.x + boxNode.width / 2, start.y + boxNode.height / 2);

            G.class.ani.show({
                json: "ani_yongzhedoumolong_baoxiangguang",
                addTo: me.ui,
                x: pos.x,
                y: pos.y,
                cache: true,
                onload: function (node) {
                    node.setScale(.5);
                },
                onend: function () {
                    X.addBoxAni({
                        parent: me.ui,
                        pos: pos,
                        boximg: "ico/itemico/" + conf[1].ico + ".png",
                        imgType: 0,
                        callback: function (node) {
                            me.boxNode.push(node);
                            node.box = node.finds("baoxiang");
                            node.box.father = node;
                            node.box.prize = prize || {};
                            node.runActions([
                                cc.moveBy(0.5, cc.p(X.rand(-200, 50), X.rand(-600, -850))),
                                cc.callFunc(function () {
                                    node.box.setTouchEnabled(true);
                                })
                            ]);
                            node.box.click(function (sender) {
                                me.boxNode.splice(X.arrayFind(me.boxNode, sender.father), 1);
                                var sP = sender.convertToWorldSpace();
                                var sPos = cc.p(sP.x + sender.father.width / 2, sP.y + sender.father.height / 2);
                                var eP = me.nodes.panel_head1.convertToWorldSpace();
                                var ePos = cc.p(eP.x + me.nodes.panel_head1.width / 2, eP.y + me.nodes.panel_head1.height / 2);
                                var item = G.class.sitem(sender.prize);
                                item.setPosition(sPos);
                                me.ui.addChild(item);
                                G.class.ani.show({
                                    json: "ani_yongzhedoumolong_baoxiangguang",
                                    addTo: me.ui,
                                    x: sPos.x,
                                    y: sPos.y,
                                    cache: true,
                                });
                                sender.father.removeFromParent();
                                item.runActions([
                                    cc.moveTo(0.5, ePos),
                                    cc.removeSelf()
                                ]);
                            });
                        }
                    });
                }
            });
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
        act_qusan: function (data, callback) {
            var me = this;
            var from = me.roleList[data.to];
            if (!from) return callback();
            G.class.ani.show({
                json: "skillani/buff_qusan",
                addTo: from,
                x: 0,
                y: 0
            });
            callback && callback();
        },
        act_jinghua: function (data, callback) {
            var me = this;
            var from = me.roleList[data.to];
            if (!from) return callback();
            G.class.ani.show({
                json: "skillani/buff_jinhua",
                addTo: from,
                x: 0,
                y: 0
            });
            callback && callback();
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

            me.fightEnd = true;
            me.event.emit('willShowRes');
			// return;
            me.myDps = me.DATA.dpsbyside[0];
            me.setMyDpsNum();

            var data = me.data();
            if(data && data.hideRes){
                me.ui.setTimeout(function() {
                    me.doFightEnd();
                },600);
                return;
            }

            if (me.boxNode.length > 0) {
                for (var i = 0; i < me.boxNode.length; i ++) {
                    me.boxNode[i].box.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
            }

            if(me.data() && me.data().pvType == "jdsd"){
                if(me.DATA.winuid == P.gud.uid){
                    G.frame.fight_win.show();
                }else {
                    G.frame.fight_fail.show();
                }
            }else {
                if(me.DATA.winside == '0'){
                    if(me.data() && me.data().pvType == "pvguanqia") return G.frame.fight_tanxian_win.show();

                    if (me.data() && me.data().pvType && X.inArray(me.extConf.showBattleType, me.data().pvType)) {
                        if(me.data().isVideo && (me.DATA.headdata[1].uid && P.gud.uid == me.DATA.headdata[1].uid)){
                            G.frame.fight_fail_battle.show();
                        }else{
                            G.frame.fight_win_battle.show();
                        }
                    } else if((me.data() && me.data().pvType && X.inArray(me.extConf.showFriendBoss, me.data().pvType))){
                        G.frame.fight_win_friendboss.show();
                    }else{
                        if(me.data() && me.data().type1 == "pvshilian"){//每日试炼
                            G.event.emit("sdkevent", {
                                event: "mrsl_tiaozhan",
                                data:{
                                    mrslType:me.data().type,
                                    get:me.data().prize,
                                }
                            });
                        }else if(me.data() && me.data().ptype == 'pvshizijun'){//十字军
                            G.event.emit("sdkevent", {
                                event: "szj_tiaozhan",
                                data:{
                                    szj_difficulty:me.data().difficulty,
                                    szj_maxsection:me.data().pvid,
                                    get:me.data().prize,
                                }
                            });
                        }
                        G.frame.fight_win.show();
                    }
                    me.battleScore(me.mscore += 1,me.escore);
                }else{
                    if(me.data() && me.data().pvType == "pvguanqia") return G.frame.fight_tanxian_fail.show();
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
            X.audio.playMusic("sound/" + (G.DATA.music || "city")  + ".mp3", true);
            me.mscore && delete me.mscore;
            me.escore && delete me.escore;
            me.emit("hide");

            if (G.frame.relic.isShow) G.frame.relic.remove();
            if (G.frame.relic_xq.isShow) G.frame.relic_xq.remove();

            if((me._id == "fight" && !G.frame.tanxianFight.isShow) || me._id == "tanxianFight") me.ui.autoReleaseRes();
            G.class.removeFightCache(me._id);
        },
        bindBTN : function(){
            var me = this;

            //跳过
            me.nodes.btn_tg.click(function (sender, type) {
                if(sender.tip){
                    return G.tip_NB.show(L(sender.tip))
                };
                var obj = G.gc.skipFight[me.DATA.pvType];
                var canSkip = false;
                if(!obj) {
                    canSkip = true;
                } else {
                    for (var i in obj) {
                        if(P.gud[i] >= obj[i]) {
                            canSkip = true;
                            break;
                        }
                    }
                }

                if(canSkip) {
                    me.skipEnd();
                } else {
                    G.tip_NB.show(L("XUYAO") + X.getNeedToStr(obj) + L("KTGZD"));
                }

            });
            // 快进   加速
            me.nodes.btn_js.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.timeSpeed == 1) {
                        var obj = {
                            lv:10,
                            speed:2
                        };

                        if (P.gud && P.gud.lv < obj.lv) {
                            G.tip_NB.show(X.STR(L('FIGHT_JS_TIP'),obj.lv,obj.speed));
                            return;
                        }
                    }else if(me.timeSpeed == 2){
                        var obj = {
                            vip:5,
                            lv:70,
                            speed:3
                        };
                        if (P.gud && P.gud.vip < obj.vip && P.gud.lv < obj.lv) {
                            me.timeSpeed --;
                            me.setFightSpeed(me.timeSpeed);
                            X.cacheByUid('fight_timeSpeed',me.timeSpeed);
                            G.tip_NB.show(X.STR(L('FIGHT_JS_TIP1'),obj.vip,obj.lv,obj.speed));
                            return;
                        }
                        X.cacheByUid('speedqipao',1);
                        me.nodes.panel_qp.hide();
                    }
                    me.timeSpeed++;
                    if (me.timeSpeed > 3) {
                        me.timeSpeed = 1;
                    }
                    me.setFightSpeed(me.timeSpeed);
                    X.cacheByUid('fight_timeSpeed',me.timeSpeed);
                }
            });

            me.nodes.btn_buff.click(function () {

                G.frame.fight_buff.show();
            });

            me.nodes.btn_yw.click(function () {

                G.frame.relic.show();
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
        ,_addSkillAni : function(fromPosition,toPosition,skillAniconf,callback,extData,data){
            //解析skillani的配置，决定动画的展现形式
            var me = this;
            var _class;

            data = data || {};

            var _cacheID = skillAniconf.ani;
            if(extData && _cacheID.indexOf('{side}')!=-1){
                _cacheID = _cacheID.replace('{side}', extData.from.data.side == '1' ? 'z' : 'f');
            }

//          if(skillAniconf.ani.endsWith('.png')){
//              //如果是以png结束
//               _class = G.class.skillAniPNG;
//          }else{
                //默认cocos csb动画
               // _class = G.class.skillAniCSB;
//          }

            cc.log('skillAniconf',_cacheID,skillAniconf);

            var _view = new G.class.skillAniCSB(skillAniconf,function(){

                //开始处理技能位置
                var _that = this;
                if (skillAniconf.ani == 'sk_xkzs_jndd'){
                    this.action.setTimeSpeed(0);
                } else {
                    if(me.timeSpeed==1){
                        //1倍速时，动画为实际速度的2倍
                        this.action.setTimeSpeed(2);
                    }else if(me.timeSpeed==2){
                        //2倍速时，动画为实际速度的3倍
                        this.action.setTimeSpeed(6);
                    }else if(me.timeSpeed==3){
                        //3倍速时，动画为实际速度的3倍
                        this.action.setTimeSpeed(7);
                    }
                }
                //技能倍速控制

                this.startMove( fromPosition,toPosition ,function(){
                    callback && callback();
                }, data, me.roleList[data.from]);
            });

            _view.zIndex = 1400 + 10;
            if(skillAniconf.pos == 1) _view.zIndex = 1400 + 10; //群攻技能
            //注意：此方法会在tanxian的模拟战斗中被复用
            me._fightPanel.addChild( _view );
            return _view;
        }
		,hit_ani: function(from,topos,skillAni){
			var me = this;
			me._shake(skillAni.shake);
		    if(!skillAni.hitani || skillAni.hitani=="")return;
            if (skillAni.moveto == '4'){
                //背刺
                from.role.hide();
                me._addAniAtSpine(topos,skillAni.hitani,function(node){
                },from);
            } else {
                me._addAniAt(topos,skillAni.hitani,function(node,action){
                    if(from.data.side == 1){
                        node.scaleX = -1;
                    }else{
                        node.scaleX = 1;
                    }
                });
            }
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
        ,_addAniAtSpine : function(pos,aniFile,callback,from){
            var me = this;
            X.spine.show({
                json:'spine/' + aniFile + '.json',
                addTo:me._fightPanel,
                x: pos.x,
                y: pos.y,
                z:1400-pos.y,
                autoRemove:true,
                cache:true,
                onload : function(node){
                    node.setScale(.6);
                    node.runAni(0, 'animation', false);
                    callback && callback(node);
                },
                onend:function () {
                    from.role.show();
                }
            });
        }
        ,_parseSkillAni : function(data,skillAniconf,callback){
            var me = this;
            //{"to":{"role_1":-373415},"atkType":"realinjury","skillid":62402,"from":"artifact_0","act":"atk"}
            // if(!skillAniconf.ani)debugger
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            //攻击和受击方显示血条
            if (data.atkType == "petAtk") {
                from = {};
                from.getPosition = function () {
                    return cc.p(0, 0);
                };
                from.data = me.DATA.fightres[data.from];
            }
            from.showHPBar && from.showHPBar();

            for(var i=0;i<toIDS.length;i++){
                me.roleList[ toIDS[i] ] && me.roleList[ toIDS[i] ].showHPBar && me.roleList[ toIDS[i] ].showHPBar();
            }
            var _playSound = true;
            if(data._isTanXianSimularFight && !G.frame.tanxian.isTop){
            	//如果是探险里调用的本方法，则判断探险是否处于顶端，否则不播放音乐
            	_playSound=false;
            }
            if((data._isShenDianSimularFight && !G.frame.shendian_sddl.isTop) || (data._isShenDianSimularFight && !G.frame.shendianmowang.isTop)) {
                _playSound=false;
            }
            if(me.ui.zIndex < 0) _playSound = false;

            if(skillAniconf.shifaani) {
                G.class.ani.show({
                    json: "skillani/" + skillAniconf.shifaani,
                    y: 65,
                    cache: true,
                    addTo: from,
                })
            }

            if(me[ "skill_" + data.skinId ]) {//特殊技能解析
                cc.log("fight_skill has logic", "skill_" + data.skinId);
                return me[ "skill_" + data.skinId ](data, skillAniconf, callback);
            }
            if(me[ "skill_" + data.skillid ] && !skillAniconf.nots) {//特殊技能解析
                cc.log("fight_skill has logic","skill_" + data.skillid);
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

                        if (!skillAniconf.ani) return ifEmitCallback && callback && callback();

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

                                        //如果是多段伤害的话，不需要播放受击动画，这里得处理
                                        if(skillAniconf.frequent==null || skillAniconf.frequent=='1'){
                                            me.hit_ani(from,_topos,skillAniconf);
                                        }

                                        if(_hits==allLen){
                                            me.ui.setTimeout(function () {
                                                ifEmitCallback && callback && callback();
                                            }, 50);
                                        }
                                    }, { from: from, to: to}, data);

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
                }else if(skillAniconf.pos=='5'){
                    //没有ani但是有爆点
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

                            _hits++;
                            //所有子弹已命中
                            //如果是多段伤害的话，不需要播放受击动画，这里得处理
                            me.hit_ani(from,_topos,skillAniconf);

                            if(_hits==allLen){
                                me.ui.setTimeout(function () {
                                    ifEmitCallback && callback && callback();
                                }, 50);
                            }
                        })(i);
                    }
                } else if (skillAniconf.pos== 'full') {
                    _playSound && skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);
                    G.class.ani.show({
                        json: 'skillani/' + skillAniconf.ani,
                        addTo: me._fightPanel,
                        x: me._fightPanel.width / 2,
                        y: me._fightPanel.height / 2,
                        z: 1400,
                        cache: true,
                        onload: function (node, action) {
                            node.scaleX = from.data.side == 1 ? -1 : 1
                        },
                        onkey: function (node, action, event) {
                            if (event == 'hit') {
                                for (var rid in data.to) {
                                    me._act_showHPChangeWithoutModifyData({
                                        r: rid,
                                        v: parseInt(data.to[rid] / skillAniconf.frequent),
                                        at:'xp',
                                        bj: data.extData[rid].bj
                                    });
                                    var to = me.roleList[ rid ];
                                    if(to){
                                        var _topos = to.getPosition();
                                        me.hit_ani( me.roleList[data.from],_topos,skillAniconf);
                                    }
                                }
                            }
                        },
                        onend: function () {
                            ifEmitCallback && callback && callback();
                        }
                    });
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
            }else if (data.atkType == 'petAtk') {
                me.showPetShowAni(data, function () {
                    me._showPetAtk(data, skillAniconf, function(){
                        //宠物如果攻击了A，按原来的逻辑会即刻回调，如果下一回合刚好是A出手的话，可能会导致byatk和atk动作覆盖
                        //导致战斗卡死，正常的角色有stopAct延迟，宠物则手动延迟
                        me.ui.setTimeout(function(){
                            callback && callback();
                        },800/me.timeSpeed)
                    }, function () {
                        _showSkillANIFun();
                    });
                });
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
            		cc.moveTo(0.2,movetoPos),
                    cc.callFunc(function () {
                        from.role.stopAllAni();
                        from.atk({
                            actname:'atk',
                            atkType: data.atkType,
                            hitCallback : function(hitIndex){
                                if(hitIndex==0)_showSkillANIFun();
                            }
                        });
                    })
            	]);
            }else{
                var hid = (from.data && from.data.hid) || '';
            	from.setTimeout(function(){
	                from.atk({
	                    actname:'atk',
                        atkType: data.atkType,
	                    hitCallback : function(hitIndex){
                            if(hitIndex==0)_showSkillANIFun();
	                    },
                        moveCallback: function () {
	                        from.setPosition(me._fightPanel.width / 2, me._fightPanel.height / 2 - 100);
                        }
	                });
                },X.inArray(['21066', '21065'], hid) ? 300 : 100);
            }
        }
        ,act_buff : function(data,callback){
            //普通攻击
            var me = this;
            var toid = data.t,
                to = me.roleList[toid];
            if(!to)return callback();

            if (data.bid == 'suoxiao') {
                G.class.ani.show({
                    json: "skillani/skilljson_kalinnayanwu",
                    addTo: me._fightPanel,
                    x: to.x,
                    y: to.y,
                    z: 1400,
                    onkey: function (n, a, k) {
                        if (k == 'hit') {
                            to.roleLayout.scale = 0.5;
                        }
                    }
                });
            }
            to.addBuff(data);
            callback && callback();
        }
        ,act_yuanjunshow: function (data, callback) {
            var me = this;
            var to = me.roleList[data.to];
            var role;
            if (to) {
                for (var rid in me.roleList) {
                    if (me.roleList[rid].data.side == to.data.side && me.roleList[rid].data.pos == data.pos) {
                        role = me.roleList[rid];
                        break;
                    }
                }
                if (role) to.data.rid = role.data.rid;
                to.resetPos();
            }
            if (to) {
                me.addKLS(to, function () {
                    callback && callback();
                });
            } else {
                callback && callback();
            }

        }
        ,act_buffdel : function(data,callback){
            //普通攻击
            var me = this;
            var toid = data.t,
                to = me.roleList[toid];
            if(!to)return callback();
            if (data.bid == 'suoxiao') {
                G.class.ani.show({
                    json: "skillani/skilljson_kalinnayanwu",
                    addTo: me._fightPanel,
                    x: to.x,
                    y: to.y,
                    z: 1400,
                    onkey: function (n, a, k) {
                        if (k == 'hit') {
                            if (to._roleScale = undefined) to._roleScale = to.role.scale;
                            to.roleLayout.scale = 1;
                        }
                    }
                });
            }
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
            if(data.atkType != "petAtk" && (!from || toIDS.length==0))return callback();
            // if(X.inArray(["61035404","61036404","61035022"],data.skillid))debugger
            var skillani;
            if (from && from.skin) {
                cc.log('skillid =',data.skillid + "_" + from.skin);
                skillani = G.gc.skillani[ data.skillid + "_" + from.skin]; //
                data.skinId = data.skillid + "_" + from.skin;
            } else {
                cc.log('skillid =',data.skillid );
                skillani = G.gc.skillani[ data.skillid ]; //
            }

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
        showPetShowAni: function (data, callback) {
            if (X.cacheByUid("setJumpFightAni")) return callback();
            var me = this;
            var petData = me.DATA.fightres[data.from];
            var petConf = G.gc.pet[petData.pid];

            G.class.ani.show({
                json: "ani_shenchong_jn",
                addTo: me.ui,
                onload: function (node) {
                    X.autoInitUI(node);

                    if (petConf.color >= 4) {
                        node.nodes.jn_nd2.show();
                    }
                    if (petConf.color >= 5) {
                        node.nodes.jn_nd3.show();
                    }
                    X.setHeroModel({
                        parent: node.nodes.panel_cw,
                        data: {},
                        model: petConf.model,
                        direction: petData.side == 0 ? -1 : 1,
                        callback: function (node) {
                            node.runAni(0, "skill", false);
                        }
                    });
                },
                onend: function () {
                    callback && callback();
                }
            });
        },
        _showPetAtk: function (data, skillAniConf, callback) {//宠物技能解析
            var me = this;
            var petData = me.DATA.fightres[data.from];
            var toS = Object.keys(data.to);
            var from = {
                data: petData,
                getPosition: function () {
                    return cc.p(0, 0);
                }
            };
            var coutLen = 0;
            var needLen = toS.length * skillAniConf.frequent;
            //给宠物添加回合CD
            var petParent = me["sb" + (from.data.side + 1)];
            if (petParent.pet[data.from]) {
                petParent.pet[data.from].cd = 4;
                petParent.checkCd();
            }

            
            function skill() {
                for (var rid in data.to) {
                    (function (rid) {
                        var to = me.roleList[rid];
                        var _view = me._addSkillAni( from.getPosition() , to.getPosition() , skillAniConf , function(){
                            if (skillAniConf.frequent != null && skillAniConf.frequent != 1) {
                                me._act_showHPChangeWithoutModifyData({
                                    r: rid,
                                    v: parseInt(data.to[rid] / skillAniConf.frequent),
                                    at:'petAtk'
                                });
                            }
                            me.hit_ani(from, to.getPosition(), skillAniConf);
                            coutLen ++;
                            if (coutLen == needLen) {
                                callback && callback();
                            }
                        }, { from: from, to: to}, data);

                        if(skillAniConf.animovetype!='shape' && skillAniConf.animovetype!='bullet'){
                            if( from.data.side == 1 ){
                                _view.scaleX = -1;
                            }else{
                                _view.scaleX = 1;
                            }
                        }
                    })(rid);
                }
            }
            
            function allSkill() {
                G.class.ani.show({
                    json: "skillani/" + skillAniConf.ani,
                    addTo: me._fightPanel,
                    z:999,
                    repeat:false,
                    autoRemove:true,
                    onload : function(node, action){
                        action.setTimeSpeed(1);
                        node.scaleX *= (petData.side==1?-1:1);
                    },
                    onkey : function(node, action, event){
                        if(event=='hit'){
                            if(skillAniConf.frequent && skillAniConf.frequent*1>1){
                                for(var _rid in data.to){
                                    me._act_showHPChangeWithoutModifyData({
                                        r:_rid,
                                        v: parseInt(data.to[_rid] / skillAniConf.frequent),
                                        at:'petAtk'
                                    });
                                    var to = me.roleList[ _rid ];
                                    if(to){
                                        var _topos = to.getPosition();
                                        me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                                    }
                                    coutLen ++;
                                    if (coutLen == needLen) {
                                        callback && callback();
                                    }
                                }
                            } else {
                                for(var _rid in data.to){
                                    var to = me.roleList[ _rid ];
                                    if(to){
                                        var _topos = to.getPosition();
                                        me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                                    }
                                    coutLen ++;
                                    if (coutLen == needLen) {
                                        callback && callback();
                                    }
                                }
                            }
                        }
                    }
                });
            }
            skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
            switch (petData.pid) {
                case "2001":
                case "2002":
                case "3001":
                case "3002":
                case "3003":
                case "4004":
                case "4002":
                case "4005":
                case "5001":
                case "5003":
                    skill();
                    break;
                case "4001":
                case "4003":
                case "5002":
                    allSkill();
                    break;
                default:
                    callback();
                    break;
            }
        },
        _showShenQiInFightAni : function(data,fromdata,hitcallback,endcallback){
            var me = this;
            //播放神器开始攻击前的入场动画
            var _conf = G.gc.shenqicom.shenqi[ fromdata.sqid ];
            var skillani = G.gc.skillani[ data.skillid ];

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
                    }else if(event=='skill'){
                        //神器攻击多段伤害掉血事件
                        if(skillani.frequent && skillani.frequent*1>1){
                            for(var _rid in data.to){
                                me._act_showHPChangeWithoutModifyData({
                                    r:_rid,
                                    v: parseInt(data.to[_rid] / skillani.frequent),
                                    at:'realinjury'
                                });
                                var to = me.roleList[ _rid ];
                                if(to){
                                    var _topos = to.getPosition();
                                    me.hit_ani( me.roleList[data.from],_topos,skillani);
                                }
                            }
                        }
                        //console.log( 'shenqi onkey=====',event );
                    }
                },
                onend : function(node, action){
                    endcallback && endcallback();
                }
            });
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
                },1000);
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

    		if (me.DATA.pvType != 'lqsl' || me.DATA.pvType != 'wyhd' || me.DATA.pvType != 'newyear_xrtz') to.data.dead = true;
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
        		//某些战斗存在特殊逻辑 不做死亡后删除逻辑
	        	// me.ui.setTimeout(function(){
				// 	cc.isNode(to) && to.removeFromParent();
	    		// },1500);
    		}else{
    			to.addBuffANI('mubei', null, {_id: ''}); //加墓碑
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
        ,act_heianzhihun : function(data,callback){
            var me = this;
            var to = me.roleList[data.to];
            if(!cc.isNode(to)){
                return callback && callback();
            }
            G.class.ani.show({
                json: "skillani/sk_hayx_buff",
                addTo: to,
                x: 0,
                y: 0,
                autoRemove:false,
                repeat:true,
                onload:function (node,action) {
                    to.heianzhihun = node;
                }
            });
            me._addAniAt(to.getPosition(),"sk_hayx_fh"); //复活动画
            to.stopAni();
            callback && callback();
        }
        ,act_fuhuoheianzhihun : function(data,callback){
            var me = this;
            var to = me.roleList[data.to];
            if(!cc.isNode(to)){
                return callback && callback();
            }
            me._addAniAt(to.getPosition(),"sk_hayx_fh"); //复活动画
            if(to.heianzhihun){
                to.heianzhihun.removeFromParent();
                delete to.heianzhihun;
            }
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
            if(!from.isHpANI && data.skillid && data.skillid == '33045304'){
                G.class.ani.show({
                    json : "skillani/atk_lxmr_zl",
                    x: 0,
                    y: 40,
                    z:5,
                    addTo:from,
                    cache:true,
                    autoRemove:true,
                    repeat:false,
                    onload : function(node,action){
                        from.isHpANI = true;
                    },
                    onend:function(){
                        from.isHpANI = false;
                    }
                });
            }

            //如果是多段伤害引起的掉血，则不再冒血，只修改值
            var frequent = 1;
            var skillani;
            if(data.skillid!=null && !data.isrealinjury){
                skillani = G.gc.skillani[ data.skillid ];
                frequent = skillani.frequent*1;
            }
            var f = me.roleList[data.f];
            if (f && f.skin) {
                skillani = G.gc.skillani[ data.skillid + "_" + f.skin ];
                frequent = skillani.frequent*1;
            }

            from.data.hp = data.nv*1;
            from.f5Bar();
            if(data.isrealinjury){
                var skillani = G.gc.skillani[ data.skillid ];
                me.showBeiDongAni(data,skillani);
            }
            //from.hmpChange(num,'hp');

            if(frequent==1){
                if (!data.noShow){
                    var _hpdata = me.splitHPdata(data);
                    _hpdata.forEach(function name(item,idx) {

                        from.hmpChange(item);
                        from.showHPBar();
                    })
                }
                if(num<0 && data.at){
                    from.byatk();
                }
            }

            if(from.data.side == 1) {
                if(data.v && data.v < 0) {
                    me.myDps += Math.abs(data.v);
                    if (me.myDps > me.DATA.dpsbyside[0]) me.myDps = me.DATA.dpsbyside[0];
                    me.setMyDpsNum(true);
                }
            }
            //me.f5Top();
            callback && callback();
        },
        splitHPdata: function (data) {
            var me = this;
            if(data.atknum && data.atknum == 1){
                return [data]
            } else if(data.atknum &&  data.atknum > 1){
                var arr = [];
                for(var i = 0; i < data.atknum;i++){
                    var obj =   JSON.parse(JSON.stringify(data)) ;
                    obj.dps =parseInt(data.dps/data.atknum)
                    arr.push(obj)
                }
                return arr
            }else{
                return [data]
            }
        },
        //某些英雄被动攻击时加一个动效
        showBeiDongAni: function (data,skillAniconf,from) {
            var me = this;
            data.to = {};
            data.from ={};
            data.to[data.r] = data.v;
            // return data;
            var _showSkillANIFun = function(ifEmitCallback){
                if(ifEmitCallback==null)ifEmitCallback=true;
                    if(skillAniconf.pos=='2')debugger;
                if(skillAniconf.pos=='2'){
                    cc.log("暂未支持");
                    return;
                    //放置在to身上加动画
                    // if(toIDS.length==0){
                    //     //目标数组为空，兼容异常
                    //     from.ui.setTimeout(function(){
                    //         ifEmitCallback && callback && callback();
                    //     },500);
                    // }else{
                        //在目标身上叠加技能效果
                      skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);

                        if (!skillAniconf.ani) return;

                        // for(var i=0;i<allLen;i++){
                        //     (function(index){
                                var to = me.roleList[ data.r ];
                                if(!to){
                                	return;
                                }
                                var _topos = to.getPosition();

                                if (skillAniconf.ani) {
                                    var _view = me._addSkillAni( from.getPosition() , _topos , skillAniconf , function(){

                                        //所有子弹已命中

                                        //如果是多段伤害的话，不需要播放受击动画，这里得处理
                                        if(skillAniconf.frequent==null || skillAniconf.frequent=='1'){
                                            me.hit_ani(from,_topos,skillAniconf);
                                        }

                                    }, { from: from, to: to}, data);

									if(skillAniconf.animovetype!='shape' && skillAniconf.animovetype!='bullet'){
										//此模式不用翻转，startMove里会控制缩放和角度
										if( from.data.side == 1 ){
	                                        _view.scaleX = -1;
	                                    }else{
	                                        _view.scaleX = 1;
	                                    }
									}
                                }
                        //     })(i);
                        // }
                    // }
                }else if(skillAniconf.pos=='3'){
                    cc.log("暂未支持")
                    return
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
                    cc.log("暂未支持")
                    return
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
                } else if (skillAniconf.pos== 'full') {
                    // _playSound && skillAniconf.sound && X.audio.playEffect('skillsound/'+skillAniconf.sound+'.mp3',false);
                    G.class.ani.show({
                        json: 'skillani/' + skillAniconf.ani,
                        addTo: me._fightPanel,
                        x: me._fightPanel.width / 2,
                        y: me._fightPanel.height / 2,
                        z: 1400,
                        useHight:true,
                        cache: true,
                        onload: function (node, action) {
                            node.scaleX = me.roleList[data.r].data.side == 1 ? 1 : -1
                        },
                        onkey: function (node, action, event) {
                            if (event == 'hit') {
                                // for (var rid in data.to) {
                                //     // me._act_showHPChangeWithoutModifyData({
                                //     //     r: rid,
                                //     //     v: parseInt(data.to[rid] / skillAniconf.frequent),
                                //     //     at:'xp',
                                //     //     bj: data.extData[rid].bj
                                //     // });
                                //     // var to = me.roleList[ rid ];
                                //     // if(to){
                                //     //     var _topos = to.getPosition();
                                //     //     me.hit_ani( me.roleList[data.from],_topos,skillAniconf);
                                //     // }
                                // }
                            }
                        },
                        onend: function () {
                            // ifEmitCallback && callback && callback();
                        }
                    });
                } else {
                    cc.log('未被支持的pos字段，请确认配置' , skillAniconf);
                }
            };
            _showSkillANIFun()
        }
        //只显示掉血节点，不实际修改数值
        ,_act_showHPChangeWithoutModifyData : function(data,callback){
            var me = this;
            var fromID = data.r,
                num = data.v*1;
            var from = me.roleList[fromID];
            if(!from)return callback();
            from.hmpChange(data);
            from.showHPBar();
            from.byatk();
        }
        ,act_nuqi : function(data,callback){
            var me = this;
            var fromID = data.r,
                num = data.v*1;
            var from = me.roleList[fromID];
            if(!from)return callback();

            if (from.data.nuqi < data.nv * 1 && from.data.hid && data.show) {
                from.data.buffTxt.push("nuqihuifu");
                from.addBuffTxt();
            }
          	from.data.nuqi = data.nv*1;
            if (from.skin == '5502002' && from.data.nuqi >= 100 && !from.isChangeSkin) {
                me.onnp("fightRole_showed", function () {
                    callback && callback();
                });
                from.f5Bar(false);
            } else {
                from.f5Bar();
                callback && callback();
            }
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
        act_mowangshow: function (data, callback) {//显示魔王 隐藏傀儡
            var me = this;

            var mwRole;
            for (var rid in me.roleList) {
                var role = me.roleList[rid];
                if (role.data.side == 1) {
                    if (role.data.mowangtype != null) {
                        mwRole = role;
                    } else {
                        role.hide();
                    }
                }
            }

            if (mwRole.visible) return callback && callback();
            me.addMWS(mwRole, function () {
                mwRole.show();
                callback && callback();
            });
        },
        addMWS: function(role, callback) {
            var me = this;

            G.class.ani.show({
                json: "ani_yongzhedoumolong_bossshuaxin",
                addTo: me._fightPanel,
                x: role.x,
                y: role.y,
                z: 1400 + 10,
                cache: true,
                onkey: function (node, action, event) {
                    if (event == 'hit') {
                        callback && callback();
                    }
                },
            });
        },
        addKLS: function(role, callback) {
            var me = this;
            var emit = false;
            G.class.ani.show({
                json: "ani_yongzhedoumolong_shuaxin",
                addTo: me._fightPanel,
                x: role.x,
                y: role.y,
                z: role.zIndex + 10,
                cache: true,
                onkey: function (node, action, event) {
                    if (event == 'hit' && !emit) {
                        emit = true;
                        role.show();
                        callback && callback();
                    }
                },
            });
        },
        act_kuileishow: function (data, callback) {//显示傀儡 隐藏魔王
            var me = this;

            var mwRole;
            var showRole = data.showrole || [];
            var roles = [];
            for (var rid in me.roleList) {
                var role = me.roleList[rid];
                if (role.data.side == 1) {
                    if (role.data.mowangtype != null) {
                        mwRole = role;
                    } else {
                        if (X.inArray(showRole, rid)) {
                            roles.push(role);
                        }
                    }
                }
            }

            if (mwRole.data.mowangtype == 97) {
                for (var i = 0; i < roles.length; i ++) {
                    var kl = roles[i];
                    kl.wait();
                    kl.role.opacity = 255;
                    kl.showInfo && kl.showInfo();
                    me.addKLS(kl);
                }
                me.ui.setTimeout(function () {
                    callback && callback();
                }, 300);
            } else {
                me.addMWS(mwRole, function () {
                    mwRole.hide();
                    for (var i = 0; i < roles.length; i ++) {
                        var kl = roles[i];
                        kl.wait();
                        kl.role.opacity = 255;
                        kl.showInfo && kl.showInfo();
                        me.addKLS(kl);
                    }
                    me.ui.setTimeout(function () {
                        callback && callback();
                    }, 300);
                });
            }
        },
        act_lanlongskill: function (data, callback) {
            var me = this;
            var from = me.roleList[data.from];

            cc.log("蓝龙 +++++++++++++++++");
            G.class.ani.show({
                json: "skillani/skilljson_lanlong_shihua",
                addTo: me._fightPanel,
                y: from.y,
                x: from.x,
                z: from.zIndex + 10,
                onkey: function (node, action, key) {
                    if (key == "hit") {
                        from.role.stopAllAni();
                        from.role.runAni(0, 'wait', true);
                        from.atk({
                            hitCallback: function () {
                                G.class.ani.show({
                                    json: "skillani/skilljson_lanlong_boss",
                                    addTo: me._fightPanel,
                                    z: 1400 + 10
                                });
                            },
                            endCallback: function () {
                                return me.showRes(me.DATA.winside);
                            }
                        });
                    }
                }
            });
        },
        //玩家信息
        playTitleVs: function (callback) {
            if (X.cacheByUid("setJumpFightAni")) return callback();
            var data = this.DATA.headdata || [];
            var pvType = this.DATA.pvType || (this.data() && this.data().pvType);
            if (!X.inArray(this.extConf.showJw, pvType) || this.isPlayJw || data.length < 2 || !X.checkIsOpen("juewei")) return callback ();

            var conf = G.gc.juewei;
            var com = G.gc.jueweicom;
            var zLv = data[0].title || 0;
            var yLv = data[1].title || 0;
            this.isPlayJw = true;

            new X.bView("juewei_vs.json", function (node) {
                cc.director.getRunningScene().addChild(node);
                if (cc.sys.isNative) node.fillSize(cc.director.getWinSize());
                node.zIndex = 100000 + 0.5;
                node.action.playWithCallback("in", false, function () {
                    node.action.play("wait", true);
                });

                node.action.setLastFrameCallFunc(function () {
                    node.removeFromParent();
                    callback && callback();
                });
                node.action.gotoFrameAndPlay(0, false);

                X.autoInitUI(node);
                X.render({
                    panel_tx1: function (node) {
                        var head = G.class.shead(data[0]);
                        head.setAnchorPoint(0.5, 0.5);
                        head.setPosition(node.width / 2, node.height / 2);
                        node.addChild(head);
                        node.setCascadeOpacityEnabled(true);
                    },
                    panel_tx2: function (node) {
                        var head = G.class.shead(data[1]);
                        head.setAnchorPoint(0.5, 0.5);
                        head.setPosition(node.width / 2, node.height / 2);
                        node.addChild(head);
                        node.setCascadeOpacityEnabled(true);
                    },
                    panel_ico2: function (node) {
                        node.setBackGroundImage("img/juewei/" + conf[zLv].ico + ".png", 1);
                    },
                    panel_ico1: function (node) {
                        node.setBackGroundImage("img/juewei/" + conf[yLv].ico + ".png", 1);
                    },
                    txt_juewei_name1: function (node) {
                        node.setString(conf[zLv].name + (conf[zLv].rank ? "+" + conf[zLv].rank : ""));
                        node.setTextColor(cc.color(com.fontcolor[conf[zLv].type] || "#ffffff"));
                        X.enableOutline(node, com.fontoulit[conf[zLv].type] || "#ffffff", 1);
                    },
                    txt_juewei_name2: function (node) {
                        node.setString(conf[yLv].name + (conf[yLv].rank ? "+" + conf[yLv].rank : ""));
                        node.setTextColor(cc.color(com.fontcolor[conf[yLv].type] || "#ffffff"));
                        X.enableOutline(node, com.fontoulit[conf[yLv].type] || "#ffffff", 1);
                    }
                }, node.nodes);
            }, {action: true});
        },
        setPlayer: function () {
            var me = this;

            var data = me.DATA.headdata || [];

            for (var i = 0; i < data.length; i++) {
                var pData = data[i];
                var txtName = me.nodes['txt_name' + (i + 1)];
                var txtLv = me.nodes['txt_dj' + (i + 1)];
                var layIco = me.nodes['panel_head' + (i + 1)];

                txtName.setString(pData.name);
                if(me.DATA.pvType == 'jdsd' && !pData.lv){
                    txtLv.setString(80);
                }else {
                    txtLv.setString(pData.lv);
                }
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
                    txtLv.x = 13;
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
            }else if(speed == 2){
                me.nodes.btn_js.loadTextureNormal("img/zhandou/btn_zhandou_js2.png", 1);
            }else {
                me.nodes.btn_js.loadTextureNormal("img/zhandou/btn_zhandou_js3.png", 1);
            }

            for(var rid in me.roleList) {
                if(speed == 3){
                    me.roleList[rid].speed(4);
                }else if(speed==2){
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

            var leftData = zfData[0];
            var rightData = zfData[1];

            var leftArr = [];
            var leftKeys = X.keysOfObject(leftData);
            for (var i = 0; i < 3; i ++) {
                var list = me.nodes.list_zf1.clone();
                X.autoInitUI(list);
                list.show();
                if(leftKeys[i]) {
                    list.nodes.ico_zf1.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(leftKeys[i]) + '.png',1);
                } else {
                    if(i != 0) list.hide();
                    list.nodes.ico_zf1.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                }
                list.nodes.ico_zf1.click(function () {
                    G.frame.fight_zzkezhi.data(leftData).show();
                });
                leftArr.push(list);
            }
            X.left(me.nodes.panel_xg1, leftArr, 1, 2);

            var rightArr = [];
            var rightKeys = X.keysOfObject(rightData);
            for (var j = 0; j < 3; j ++) {
                var list = me.nodes.list_zf2.clone();
                X.autoInitUI(list);
                list.show();
                var key = rightKeys[j];
                if(key) {
                    list.nodes.ico_zf2.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(key) + '.png',1);
                } else {
                    if(j != 0) list.hide();
                    list.nodes.ico_zf2.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                }
                list.nodes.ico_zf2.click(function () {
                    G.frame.fight_zzkezhi.data(rightData).show();
                });
                rightArr.push(list);
            }
            X.right(me.nodes.panel_xg2, rightArr, 1, 2, 35);
        },
        //设置回合数
        setRoundNum: function (round) {
            var me = this;
            me.roundNum = Number(round);
            me.emit('round_' + me.roundNum);
            if(!me.nodes.btn_tg.visible && me.extConf.showSkipByRound[me.DATA.pvType]) {
                //没有跳过战斗功能的战斗 在若干回合后显示跳过战斗按钮
                if(round == me.extConf.showSkipByRound[me.DATA.pvType]) {
                    me.roundShowSkip.push(me.DATA.pvType);
                    me.setSkipState(round);
                }
            }
            if(!me.nodes.btn_tg.bright && me.extConf.showSkipByRound[me.DATA.pvType]){
                if(round == me.extConf.showSkipByRound[me.DATA.pvType]) {
                    me.setSkipState(round);
                }
            }
            me.sb1.upCd();
            me.sb2.upCd();

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
            var m1 = me.nodes.l2;
            var m2 = me.nodes.l1;
            var e1 = me.nodes.h2;
            var e2 = me.nodes.h1;
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
                }else if(escore == 1){
                    e1.show();
                    e2.hide();
                }else if(escore == 2){
                    e1.show();
                    e2.show();
                }
            }
        },
        //
        setSkipState: function (roundNum) {
            var me = this;

            //如果是录像，允许跳过
            if (me.data() && me.data().isVideo) {
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                me.nodes.btn_tg.setPositionX(502.45 - 70);
                return;
            }

            if (!X.inArray(me.extConf.showSkip, me.DATA.pvType) && !X.inArray(me.roundShowSkip, me.DATA.pvType)) {
                if (me.extConf.showBtnFunc[me.DATA.pvType] && me.extConf.showBtnFunc[me.DATA.pvType]()) {
                    me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                    me.nodes.btn_tg.setPositionX(502.45 - 70);
                    me.nodes.btn_tg.show();
                } else {
                    me.nodes.btn_tg.hide();
                    me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 2);
                }
            }else {
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                me.nodes.btn_tg.setPositionX(502.45 - 70);
                me.nodes.btn_tg.show();
            }

            if(me.DATA.pvType == "pvguanqia" && P.gud.maxmapid <= 4) {
                me.nodes.btn_js.hide();
            };
            if(me.DATA.pvType == "lqsl" || me.DATA.pvType == "wyhd"){
                if(roundNum){
                    me.nodes.btn_tg.setBright(true);
                    me.nodes.btn_tg.tip = false;
                    me.nodes.btn_tg.show();
                    me.nodes.wenzitishi.hide();
                }else{
                    me.nodes.btn_tg.show();
                    me.nodes.btn_tg.setBright(false);
                    me.nodes.btn_tg.tip = "FIGHT_TG_FST1";
                    me.nodes.wenzitishi.show();
                }
                me.nodes.btn_js.setPositionX(cc.director.getWinSize().width / 4 + 70);
                me.nodes.btn_tg.setPositionX(502.45 - 70);
                me.nodes.wenzitishi.setPositionX(502.45 - 70);
                me.nodes.btn_tg.show();
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
                bg.loadTexture('img/bg/zhandou_01.jpg',0);
            }

        }

        ,test : function(){
        	var me = this;
        	X.loadJSON('__js.json',function(err,json){
        		me.demo( json );
        	})
        },
        
        addSpecialSkill: function (from, toPos, skillAni, loadCall, hitCall, endCall) {
            var me = this;

            G.class.ani.show({
                json: "skillani/" + skillAni,
                addTo: me._fightPanel,
                // x: from.getPositionX(),
                // y: from.getPositionY() + 50,
                cache: true,
                onload: function (node, action) {
                    node.zIndex = 99999;
                    loadCall && loadCall(node, action);
                },
                onkey: function (node, action, key) {
                    if (key == "hit") {
                        hitCall && hitCall();
                    }
                },
                onend: function () {
                    endCall && endCall();
                }
            });
        },
        pve_start: function (data) {

            G.event.emit("leguXevent", {
                type:'track',
                event: "enter_stage",
                data: data
            });
        },
        pve_end: function (data) {

            try {
                data.stage_result = data.stage_result == 0 ? 'win' : 'lose';
                G.event.emit("leguXevent", {
                    type:'track',
                    event: "end_stage",
                    data: data
                });
            } catch (e) {
                cc.error(e);
            }
        },
        pvp_start: function (d) {
            var data = {};
            cc.mixin(data, d);
            G.event.emit("leguXevent", {
                type:'track',
                event: "pvp_start",
                data: {
                    enemy_id: data.id || '',
                    enemy_fighting_capacity: data.zhanli || 0,
                    enemy_hero_list: data.rList || [],
                    our_hero_list: data.lList || [],
                    pvp_id: data.type || ''
                }
            });
        },
        pvp_end: function (d) {
            var data = {};
            cc.mixin(data, d);
            G.event.emit("leguXevent", {
                type:'track',
                event: "pvp_end",
                data: {
                    enemy_id: data.id || '',
                    enemy_fighting_capacity: data.zhanli || 0,
                    enemy_hero_list: data.rList || [],
                    our_hero_list: data.lList || [],
                    stage_result: data.result == 0 ? 'win' : 'lose',
                    pvp_id: data.type || '',
                    hero_position:data.data.hero_position,
                    now_level:data.data.now_level,
                    now_quality:data.data.now_quality
                }
            });
        },
        getHeroData: function (data) {
          var me = this;
          var hero_position = [0, 0, 0, 0, 0, 0,];
          var now_level = [0, 0, 0, 0, 0, 0,];
          var now_quality = [0, 0, 0, 0, 0, 0,];
          cc.each(data.roles, function (role) {
              if (role.side == 1 && role.hid) {
                hero_position[role.pos - 1] = role.hid;
                now_level[role.pos - 1] = role.lv;
                now_quality[role.pos - 1] =G.gc.hero[role.hid].color*1 || 0;
              }
          });
          return {
            hero_position: hero_position,
            now_level: now_level,
            now_quality: now_quality,
          }
        },
        getHidBySide: function (fightres, side, isArr) {
            side = side || 0;
            var hidArr = [];
            var me = this;
            if (isArr) {
                cc.each(fightres, function (_fightres) {
                    if (fightres.length == 1) {
                        hidArr = hidArr.concat(me.getHidBySide(_fightres, side));
                    } else {
                        hidArr.push(me.getHidBySide(_fightres, side));
                    }

                });
            } else {
                cc.each(fightres.roles, function (role) {
                    if (role.side == side && role.hid) {
                        hidArr.push(role.hid);
                    }
                });
            }
            return hidArr;
        },
        getMyHidArr: function (obj) {
            var hidArr = [];
            cc.each(obj, function (d) {
                if (G.DATA.yingxiong.list[d]) hidArr.push(G.DATA.yingxiong.list[d].hid);
            });
            return hidArr;
        },
        getHeroHidArr: function (obj) {
            var hidArr = [];
            cc.each(obj, function (d) {
                if (d.hid) hidArr.push(d.hid);
            });
            return hidArr;
        },
        hero_go_on: function (heroList, winside) {
            cc.each(heroList, function (id, pos) {
                var heroData = G.DATA.yingxiong.list[id];
                if (heroData) {
                    G.event.emit("leguXevent", {
                        type:'track',
                        event: "hero_go_on_battle",
                        data: {
                            hero_id: heroData.hid,
                            hero_position: Number(pos),
                            now_level: heroData.lv,
                            now_quality: heroData.star,
                            stage_result: winside == 0 ? 'win' : 'lose',
                            item_fighting_capacity: heroData.zhanli,
                        }
                    });
                }
            });
        }
    });

    X.addPetToFight = function (arr) {
        var obj = {};
        for (var i = 0; i < arr.length; i ++) {
            obj[i + 1] = arr[i];
        }
        
        function f(pid) {
            for (var tid in G.DATA.pet) {
                if (G.DATA.pet[tid].pid == pid) return tid;
            }
        }

        for (var pos in obj) {
            obj[pos] = f(obj[pos]);
        }


        connectApi("pet_play", [obj]);
    };
    G.frame[ID] = new fun('zhandou.json', ID, {});
    G.frame.tanxianFight = new fun('zhandou.json', "tanxianFight", {needshowMainMenu: true});
})();
