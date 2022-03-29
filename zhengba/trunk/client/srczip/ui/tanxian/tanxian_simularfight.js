/**
 * Created by wfq on 2018/7/4.
 */
(function () {
    var me = G.frame.tanxian;
	
	var posObj;
    var rolesObj = {};
    
    
    var _fun = {
    	//模拟战斗
        setSimulateFight:function() {
        	//填充背景图相关
        	if(me.ssFightStarted)return;
        	
        	me.ssFightStarted = true;
        	if(me._nextBossTimer){
        		me.ui.clearTimeout(me._nextBossTimer);
        		delete me._nextBossTimer;
        	}
        	
        	posObj = G.class.tanxian.getSimulateFight().pos;
    		me._fightPanel = me.nodes.panel_battle;
    		me.timeSpeed = 2;

    		var area = me.curArea;
    		if(G.tiShenIng) {
    		    area = X.rand(2, 8);
            }

            var conf = G.class.tanxian.getExtConf().base.area[area];
            var imgArr = conf.fightimg.split('.');
            imgArr[0] = imgArr[0] + '_1';
            var img2 = imgArr.join('.');
            me.ui.finds('bg_battle1').setBackGroundImage('img/bg/' + conf.fightimg,0);
            me.ui.finds('bg_battle2').setBackGroundImage('img/bg/' + img2,0);

            me.nodes.panel_battle.removeAllChildren();
            me.nodes.panel_battle.show();

            //todo?前12随机3个？前12？
            var heros = G.DATA.yingxiong.list;
            var herosArr = X.keysOfObject(heros);
            var fightHeroTidArr = herosArr.splice(0,3);
            
            var posNum = 1;
            //添加位置
            rolesObj = {};
            for (var i = 0; i < fightHeroTidArr.length; i++) {
                var tid = fightHeroTidArr[i];
                rolesObj[tid] = JSON.parse(JSON.stringify(heros[tid]));
                rolesObj[tid].skin = undefined;
                rolesObj[tid].pos = posObj[posNum];
                rolesObj[tid].zIndex = 1400-posObj[posNum].y;
                rolesObj[tid].rid = tid;
                rolesObj[tid].idx = posNum;
                posNum++;
            }
			
			var _boss = me.getBossInfo();
            cc.mixin(rolesObj,_boss,true);
            
            me.roleList = {};
            var needLoad = Object.keys(rolesObj).length;
            for (var rid in rolesObj) {
                me.initRole(rolesObj, rid , function(){
                	needLoad--;
                    if (needLoad == 0) {
                        cc.callLater(function(){
                        	me.fmtTranLog();
                        });
                    }
                });
            }
            me.setPrizeBox();
            me.setPrizeJinBi();
        },
        
        _nextBoss : function(){
        	if(me.roleList['boss'])return;
        	
        	var _boss = me.getBossInfo();
        	cc.mixin(rolesObj,_boss,true);
        	
        	me.initRole(rolesObj, 'boss' , function(){
                cc.callLater(function(){
                	me.fmtTranLog();
                });
            });
        },
        
        getBossInfo : function () {
            //添加boss
            var bossArr = G.gc.npc[G.class.tanxian.getById(P.gud.mapid).boss];
            var boss = X.arrayRand(bossArr);
            var res = {};
            res['boss'] = boss;
            res['boss'].pos = posObj[4];
            res['boss'].zIndex = 1400-posObj[4].y;
            res['boss'].rid = 'boss';
            res['boss'].idx = 4;
            return res;
        },
        initRole : function (data,rid,callback) {
        	var roleData = data[rid];
        	
        	roleData.loadRoleOver = function(node){
        		//加载完毕后逐渐显示
                node.opacity = 0;
                if(rid == "boss") {
                    G.class.ani.show({
                        json: "ani_tanxian_guaiwushuaxin",
                        addTo: me.nodes.panel_battle,
                        x: roleData.pos.x,
                        y: roleData.pos.y + 100,
                        repeat: false,
                        autoRemove: true,
                        onload:function(node, action){
                            action.setTimeSpeed(1.2);
                        },
                        onkey: function (aaa,action,event) {
                            if (event == 'chuxian') {
                                node.opacity = 255;
                                callback && callback();
                            }
                        },
                    })
                }else {
                    node.runActions([
                        cc.fadeIn(0.5)
                    ]);
                    callback && callback();
                }

        	};
            var role = new G.class.Role(roleData);
            role.data._defaultPos = roleData.pos;
            role.data._defaultZindex = roleData.zIndex;
            
            role.data.side = rid == 'boss' ? 1 : 0;   
            role.setPosition( roleData.pos );
            role.zIndex = roleData.zIndex;
            
            var value = G.class.tanxian.getSimulateFight().scale[roleData.idx];
			role.setScale(value * (rid == 'boss' ? -1 : 1),value);
                        
            //role.scaleX = rid == 'boss' ? -1 : 1;   
            role.speed(2);
            me.roleList[rid] = role;
            me.nodes.panel_battle.addChild( me.roleList[ rid ] );
        },
        setPrizeBox:function(){
            var me = this;
            X.spine.show({
                json: 'spine/' + 'xiangzi' + '.json',
                // json:'spine/'+ 41066 +'.json',
                addTo: me.nodes.panel_battle,
                cache: true,
                x: 285,
                y: 340,
                z: 0,
                autoRemove: false,
                onload: function(node) {
                    node.stopAllAni();
                    node.setTimeScale(1);
                    node.opacity = 255;
                    node.setScale(1);
                    node.runAni(0, "baoxiang_daiji", true);
                    node.setZOrder(1102);
                    var lay = me.boxLay = new ccui.Layout();
                    lay.setContentSize(cc.size(200,100));
                    lay.setTouchEnabled(true);
                    G.frame.tanxian.nodes.box = lay;
                    node.addChild(lay);
                    node.setCompleteListener(function(trackIndex, loopCount) {
                        node.runAni(0, "baoxiang_daiji", true);
                    });
                    me.prizeBox = node;
                    lay.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (!me.isPrize) {
                                G.tip_NB.show(L('tanxian_gj_error'));
                                return;
                            }
                            node.runAni(0, "baoxiang_taoyue", false);
                            me.btnLq.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        }
                    });
                },
            })
        },
        setPrizeJinBi:function(){
            var me = this;
            var panel = me.nodes.panel_battle;
            var jbtouch = me.nodes.baozangdianji;
            var h = me.DATA.gjtime / 3600;
            var m = me.DATA.gjtime / 60;
            var num = 0;
            var time = 0;
            if(m >= 11 && h < 2){
                num = 1;
                time = 2 * 3600 - me.DATA.gjtime;
            }else if(h >= 2 && h < 4){
                num = 2;
                time = 4 * 3600 - me.DATA.gjtime;
            }else if(h >= 4){
                num = 3;
            }
            panel.getChildByTag(7777) && panel.getChildByTag(7777).removeFromParent();
            me.jingBiAni && delete me.jingBiAni;
            if(num > 0){
                G.class.ani.show({
                    json: "ani_jingbi" + num,
                    addTo: panel,
                    x: panel.width / 2,
                    y: panel.height / 2 + num *  20,
                    repeat: false,
                    autoRemove: false,
                    onload: function(node, action) {
                        action.play('daiji',true);
                        node.setZOrder(1101);
                        node.setTag(7777);
                        me.jingBiAni = action;
                        me.nodes.baozangdianji.click(function(){
                            me.boxLay.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        });
                    }
                });
            }
            // me.timeEvent && me.clearTimeout(me.timeEvent);
            me.timeEvent && delete me.timeEvent;
            if(time){
                var t = time * 1000;
                me.timeEvent = me.ui.setTimeout(function(){
                    me.setPrizeJinBi();
                },t);  
            }
        },
        bossDeadPrize:function(){
            var me = this;
            var boss = me.nodes.panel_battle.finds('boss');
            if(!cc.isNode(boss))return;

            boss.getChildByTag(7456) && boss.getChildByTag(7456).removeFromParent();

            G.class.ani.show({
                json: "ani_tanxian_siwang",
                addTo: me.nodes.panel_battle,
                x: boss.x,
                y: boss.y,
                repeat: false,
                autoRemove: false,
                onload: function(node, action) {
                    node.setTag(7456);
                },
                onend: function () {
                    me.movePrize(me.nodes.panel_battle, G.class.tanxian.getSimulateFight().pos[4], cc.p(me.prizeBox.x + 50,me.prizeBox.y + 40))
                }
            });
        },
        movePrize: function(parent, target, end) {
            var me = this;
            // var end = me.prizeBox.getPosition();
            var end = end;
            // end = cc.p(end.x / 2, end.y / 2);
            parent.prize = [];
            var num = parseInt(Math.random() * 6 + 15);
            var prize = ['useexp', 'jinbi', 'exp', 'jifen'];
            var icons = [];
            var action = [
                function(node) {
                    node.runActions([
                        cc.moveTo(1, end),
                        cc.callFunc(function() {
                            node.removeFromParent();
                        })
                    ]);
                },
                function(node) {
                    var start = node.getPosition();
                    node.runActions([
                        cc.bezierTo(1, [
                            start,
                            cc.p(start.x - start.x / 3, start.y - start.y / 3),
                            end
                        ]),
                        cc.callFunc(function() {
                            node.removeFromParent();
                        })
                    ]);

                },
                function(node) {
                    node.runActions([
                        cc.jumpTo(1, end, 50, 1),
                        cc.callFunc(function() {
                            node.removeFromParent();
                        })
                    ]);
                },
            ];
            for (var i = 0; i < num; i++) {
                var icon = new ccui.ImageView(G.class.getItemIco(prize[i % 4]), 1);
                var x = parseInt(Math.random() * 30 + target.x);
                var y = parseInt(Math.random() * 60 + target.y);
                icon.setPosition(cc.p(x,y));
                parent.addChild(icon,1103);
                parent.prize.push(icon);
                icons.push(icon);
            }
            for (var k = 0; k < icons.length; k++) {
                var icon = icons[k];
                (function(icon, k) {
                    me.ui.setTimeout(function() {
                        var sun = parseInt(Math.random() * 6 + 1);
                        action[sun % 3](icon);
                    }, k * 20);
                })(icon, k);
            }
        },
        fmtTranLog : function(){
        	var me = this;
        	var logs = [];
        	
        	var rolekeys = [];
        	for(var rid in me.roleList){
        		if(rid != 'boss')rolekeys.push(rid);
        	}
        	
        	for(var round=0;round < X.rand(1,3);round++){
        		for(var rid in me.roleList){
        			
	        		if(rid != 'boss'){
	        			var heroConf = G.class.hero.getById(me.roleList[rid].data.hid);
	        			var ifXP = X.rand(1,100)<30;
	        			logs.push({
	                        act:'atk',
	                        actType: ifXP?"xpskill":"normalskill",
	                        from:rid,
	                        skillid: ifXP ? heroConf.xpskill : heroConf.normalskill,
	                        to:{
	                            boss:{
	                                atkType: ifXP?"xpskill":"normalskill",
	                                dps:-1,
	                                ifBaoJi:false,
	                                ifJingZhun:false
	                            }
	                        }
	                    });
	                    logs.push({r:"boss","v": -1, "nv": 1,"act": "hp"});
	                    logs.push({from: rid , act: "stopAct"});
	        		}else{
	        			var heroConf = G.class.hero.getById(me.roleList[rid].data.hid);
	        			var ifXP = X.rand(1,100)<30;
			            var data = {
			                act:'atk',
			                actType: ifXP?"xpskill":"normalskill",
			                from:'boss',
			                skillid: ifXP ? heroConf.xpskill : heroConf.normalskill,
			                to:{}
			            };
			            var atkTid = X.arrayRand(rolekeys);
			            data.to[atkTid] = {
			                atkType:ifXP?"xpskill":"normalskill",
			                dps:-1,
			                ifBaoJi:false,
			                ifJingZhun:false
			            };
			            logs.push(data);
			            logs.push({r:atkTid,"v": -1, "nv": 1,"act": "hp"});
			            logs.push({from: rid , act: "stopAct"});
	        		}
	        	}
        	}
        	
        	//确保最后是由我方英雄出手，boss死亡
        	var rid = rolekeys[0];
        	var heroConf = G.class.hero.getById(me.roleList[rid].data.hid);
			var ifXP = X.rand(1,100)<30;
			logs.push({
                act:'atk',
                actType: ifXP?"xpskill":"normalskill",
                from:rid,
                skillid: ifXP ? heroConf.xpskill : heroConf.normalskill,
                to:{
                    boss:{
                        atkType: ifXP?"xpskill":"normalskill",
                        dps:-1,
                        ifBaoJi:false,
                        ifJingZhun:false
                    }
                }
            });
            logs.push({r:"boss","v": -1, "nv": 1,"act": "hp"});
            logs.push({"to": "boss", "canFuHuo": false, "act": "dead"});
            logs.push({from: rid , act: "stopAct"});
	                    
        	me.tranSimulateRound( logs );
        },
        
        tranSimulateRound: function (data,callback) {
            var me = this;

            data = [].concat(data);

            var fight = function () {
            	me.timeSpeed = 2;
                if (data.length < 1) {
                    me.bossDeadPrize();
                    me._nextBossTimer = me.ui.setTimeout(function(){
                    	me._nextBoss();
                    },1000);
                    return;
                }
                var act = data.shift();
                var _actFunctionKey = 'act_' + act.act;
                if (me[_actFunctionKey]) {
                    me[_actFunctionKey](act, function () {
                        fight();
                    });
                }
            };
            fight();
        },
        
        act_atk : function(data,callback){
            //普通攻击
            return G.frame.fight.act_atk.call(this,data,callback);
        },
        act_hp : function(data,callback){
            var me = this;
            var fromID = data.r;
            var from = me.roleList[fromID];
            if(!from)return callback();
			from.byatk();
            callback && callback();
        },
        _parseSkillAni : function(data,skillAniconf,callback){
        	data._isTanXianSimularFight = true;
        	return G.frame.fight._parseSkillAni.call(this,data,skillAniconf,callback);
        },
        _addSkillAni : function(fromPosition,toPosition,skillAniconf,callback,extData,data){
        	return G.frame.fight._addSkillAni.call(this,fromPosition,toPosition,skillAniconf,callback,extData,data);
        	//me.nodes.panel_zd.addChild(view);
        	//return view;
        },
        hit_ani: function(from,topos,skillAni){
        	return G.frame.fight.hit_ani.call(this,from,topos,skillAni);
        },
        _addAniAt : function(pos,aniFile,callback){
            return G.frame.fight._addAniAt.call(this,pos,aniFile,callback);
        },
        _shake : function(shakeLevel){
        	
        },
        act_dead : function(data,callback){
        	G.frame.fight.act_dead.call(this,data,callback);
        	delete me.roleList['boss'];
        },
        act_stopAct : function(data,callback){
            var me = this;
            me.ui.setTimeout(function(){
            	var _from = me.roleList[ data.from ];
                if (cc.isNode(_from) ){
                	_from.zIndex = _from.data._defaultZindex;
                	_from.runActions([
                		cc.moveTo(0.2,_from.data._defaultPos)
                	]);	
                }
                me.ui.setTimeout(function(){
                	callback && callback();
                },300);
            },600)
        }
    };
    cc.mixin(me,_fun,true);
})();