(function(){
	
	testRole=null;
	G.class.testRole = function(id,ifChangeNewSpine){
		if(ifChangeNewSpine){
			G.gc.ifChangeModels = function(){return true};
		}else{
			G.gc.ifChangeModels = function(){return false};
		}
		cc.isNode(testRole) && testRole.removeFromParent();
		var spine = testRole = new G.class.Role({
			spinejson:id,
			rid:id
		});
		spine.x = 320;
		spine.y = 500;
		spine.zIndex = 999999;
		spine.role.setTimeScale(3);
		spine.wait();

		function _play(){
			spine.wait();
			spine.setTimeout(function(){
				spine.atk();
			},1000);
			spine.setTimeout(function(){
				spine.byatk();
			},2000);
			spine.setTimeout(function(){
				spine.die();
			},3000);
			spine.setTimeout(function(){
				spine.shihua();
			},4000);
			spine.setTimeout(function(){
				_play();
			},5000);
		}
		_play();		
		cc.director.getRunningScene().addChild(spine);
	};
	
	
	G.class.Role = ccui.Layout.extend({
		ctor : function(data){
			this.data = data;
			this._super.apply(this,arguments);
			this.setName(data.rid);
			this.showRole();
			return this;
		},
		onExit : function(){
			if(cc.isNode(this.role)){
				//cc.log('重置角色动画到wait...');
				this.role.stopAllAni();
        		this.role.runAni(0,'wait',true);
			}
			this._super.apply(this,arguments);
		},
		showRole : function(){
			var me = this;
			var data = this.data;

            var model = data.fakemodel ? data.fakemodel : (data.model ? data.model : G.class.hero.getModel(data));

            if (data.skin && G.gc.skin[data.skin.sid]) {

            	this.skin = data.skin.sid;
            	model = data.skin.sid;
			}
            var roleLayout = me.roleLayout = new ccui.Layout();
            me.addChild(roleLayout);

			X.spine.show({
                json:'spine/'+ (data.spinejson||model) +'.json',
        		addTo : roleLayout,
        		cache:true,x:0,y:0,z:0,
        		autoRemove:false,
        		rid : data.rid,
        		onload : function(node){
					node.setVisible(false);
        			me.role = node;
					me.role.stopAllAni();
					node.setTimeScale(this.__speedVal || 1);
					node.opacity = 255;
					node.setScale(1);
        			node.setEndListener(null);
        			node.setCompleteListener(null);
        			node.setEventListener(null);
        			
        			node.setName(node.conf.rid);
        			me.wait();

					cc.callLater(function(){
						if(cc.isNode(node)){
							node.setVisible(true);
							me.data.loadRoleOver && me.data.loadRoleOver(node);
							me.loadRoleOver && me.loadRoleOver(node);
						}
					});
        		}
        	});
        	me.willLoadRole && me.willLoadRole();
        	return this;
		},
		speed : function(v){
			this.__speedVal = v;
			this.role && this.role.setTimeScale(v);
		},
		// 显示掉血的动画文本 飘字
        hmpChange : function(data){
        	//{"dps": -361, "jz": false, "act": "hp", "bj": false, "r": "role_1", "at": "xp", "v": -361, "nv": 14949}
			//暴击和格挡做在FNT字里面  b是暴击 g是格挡 f是反击
			if(!cc.isNode(this))return;
			if(!this.getParent()) return;
            var that = this;
            var label;
            var aniType=1; //1=常规伤害 2=暴击 3=加血
            var num = parseInt(data.v);

            if(num>0){
            	if(data.bj) {
					label = new cc.LabelBMFont("+"+ num + "b", "img/fnt/sz_zd5.fnt"); //加血
					aniType=3;
				} else {
					label = new cc.LabelBMFont("+"+ num, "img/fnt/sz_zd5.fnt"); //加血
					aniType=3;
				}
            }else{
				var showNum = Math.abs(num) >= 1000000 ? parseInt(num /10000) + "w" : num;

				if(data.jz === false) {
					showNum += 'g';
				} else {
					if(data.bj) showNum += 'b';
					if(data.fs) showNum += 'f';
				}

            	if(data.at==null || data.at=='nm'){
            		if(data.bj){
            			label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd2.fnt"); //普通攻击暴击
            			aniType=2;
            		}else{
            			label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd1.fnt"); //普通攻击
            			aniType=1;
            		}
            		
            	}else if(data.at=='xp'){
            		if(data.bj){
            			label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd2.fnt"); //技能攻击暴击
            			aniType=2;
            		}else{
            			label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd1.fnt"); //技能攻击
            			aniType=1;
            		}
            	}else if(data.at=='realinjury' || data.at == "petAtk"){
					label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd3.fnt"); //神器宠物攻击掉血
					aniType=2;
				}
            }
            
            
            label.y = this.y  + X.rand(80,100);
            label.x = this.x + X.rand(-30,30);
            label.zIndex = 1400;
			that.getParent().addChild(label);
            
            var xfx=1;
            if(this.data.side==0){
            	xfx = -1; 	
            }
            
            if(aniType==1){
            	label.runActions([
	            	cc.jumpBy(0.3,cc.p(
	            		X.rand(30,50) * xfx,
	            		X.rand(20,60)
	            	), 50, 1),
	            	
	            	cc.jumpBy(0.15,cc.p(
	            		20 * xfx,
	            		10
	            	), 10, 1),
	            	
	            	cc.fadeOut(0.7),
	            	cc.removeSelf()
	            ]);
            }else if(aniType==2){
            	//暴击冒血设置
            	label.setScale(1.2); //初始值大小
            	label.runActions([
	            	[
	                    cc.scaleTo(0.1,1.4,1.4), //用0.07秒，缩放到2倍
	                    cc.moveBy(0.05,cc.p(0,20)) //上移30px
	                ],
	                cc.delayTime(0.2), //暂停0.2
	                cc.scaleTo(0.2,1,1), //用0.05缩放到1
	            	cc.fadeOut(0.5), //0.7s秒渐隐
	            	cc.removeSelf()
	            ]);
            }else if(aniType==3){
            	label.x = this.x + X.rand(-60,60);
            	label.y = this.y  + X.rand(80,150);
	            label.opacity = 0;
	            label.setScale(0.1);
	            label.runActions([
	                [
	                    cc.fadeIn(0.2),
	                    cc.scaleTo(0.2,1,1),
	                    cc.moveBy(.2,cc.p(that.data.side==1?40:-40,40))
	                ],
	                cc.moveBy(.4,cc.p(0,10)),
	                cc.callFunc(function(){
	                    label.runActions([
	                        [
	                            cc.fadeOut(0.2),
	                            cc.scaleTo(0.2,0.1,0.1),
	                            cc.moveBy(.2,cc.p(0,40))
	                        ],
	                        cc.removeSelf()
	                    ]);
	                })
	            ]);
            }
        },
        ifShiHua : function(){
        	if(this.data.buff && this.data.buff['shihua'] && this.data.buff['shihua'].length>0){
				return true;
			}else{
				return false;
			}
        },
        ifBingDong : function(){
        	if(this.data.buff && this.data.buff['bingdong'] && this.data.buff['bingdong'].length>0){
				return true;
			}else{
				return false;
			}
        },
		ifBianXing : function(){
			if(this.data.buff && this.data.buff['bianxing'] && this.data.buff['bianxing'].length>0){
				return true;
			}else{
				return false;
			}
		},
        wait : function(){
        	var me = this;
        	// if(me.ifBingDong()){
        	// 	return me.role.stopAllAni();
        	// }
        	me.role.stopAllAni();
        	me.role.runAni(0,'wait',true);
        },
		stopAni : function(){
			var me = this;
			me.role.stopAllAni();
		},
        shihua : function(){
        	var me = this;
        	if (me.ifBianXing() && cc.isNode(me.yangRole)){
				me.yangRole.stopAllAni();
				me.yangRole.runAni(0,'shihua',true);
			} else {
				me.role.stopAllAni();
				me.role.runAni(0,'shihua',true);
			}
        },
		bianxing:function(){
			var me = this;
			me.role.stopAllAni();
			me.role.hide();
			if (!cc.isNode(me.yangRole)){
				X.spine.show({
					json: 'spine/skillani_22085_yang.json',
					addTo: me.roleLayout,
					x:me.role.x,
					y:me.role.y,
					repeat:true,
					autoRemove: false,
					onload: function (node) {
						me.yangRole = node;
						node.scaleX *= (me.data.side==1?-1:1);
						node.runAni(0, 'wait', true);
					}
				});
			}
		},
        byatk : function(callback){
            var me = this;
            if(this.ifShiHua())return;
            if(me.ifBingDong()){
        		return me.role.stopAllAni();
        	}
			if (me._currAct == "atk" || me._currAct == "skill") return;
            if (me.ifBianXing() && cc.isNode(me.yangRole)){
            	me.setYangAct('byatk',false,function(){
					cc.isNode(me.yangRole) && me.yangRole.runAni(0,'wait',true);
					callback && callback();
				})
			}
            me.setAct('byatk',false,function(){
            	me.role.runAni(0,'wait',true);
                callback && callback();
            });
        },
        die : function(callback){
			if (this.ifBianXing()){
				this.role.show();
				this.yangRole.removeFromParent();
				delete this.yangRole;
			}
        	this.role.stopAllAni();
            this.setAct('die',false,callback);
        },
        atk : function(conf){
            var me = this;
            // if(this.ifShiHua())return;
            conf = conf || {};
            
            var _actName = "atk";
			if (conf.actname && conf.actname != _actName) _actName = conf.actname;
            if (conf.atkType && conf.atkType != "normalskill" && G.gc.hero[me.data.hid] && G.gc.hero[me.data.hid].indieskillani) _actName = "skill";
            if (conf.atkType && conf.atkType != "normalskill" && me.skin) _actName = "skill";
			if (conf.atkType && conf.atkType != "normalskill" && me.data.isSkill) _actName = "skill";

			var _hitIndex = 0;
			me.role.stopAllAni();
			me.role.setEventListener(null);
			me.role.setEventListener(function(traceIndex, event){
				cc.log(event.data.name);
				if(event.data.name == 'hit'){
					conf.hitCallback && conf.hitCallback(_hitIndex);
					_hitIndex++;
				}
				if (event.data.name == "move") {
					conf.moveCallback && conf.moveCallback();
				}
	        });
			
            me.setAct(_actName,false,function(){
                me.role.runAni(0,'wait',true);
                conf.endCallback && conf.endCallback();
            });
        },
        setAct : function(actName,repeat,callback){
            var me = this;

			me.role.stopAllAni();
            me._currAct = actName;
            
        	me.role.setEndListener(function(traceIndex){
        		delete me._currAct;
				cc.callLater(function(){
					me.role.stopAllAni();
					callback && callback.call(me);
				});
			});
			
            me.role.runAni(0,actName,repeat);
            return true;
        },
		setYangAct : function(actName,repeat,callback){
			var me = this;

			me.yangRole.stopAllAni();

			me.yangRole.setEndListener(function(traceIndex){
				cc.callLater(function(){
					me.yangRole.stopAllAni();
					callback && callback.call(me);
				});
			});

			me.yangRole.runAni(0,actName,repeat);
			return true;
		},
	});

	//神器处理类
	G.class.fightShenQi = G.class.Role.extend({
		ctor : function(data){
			if(data.sqid!=null && data.spinejson==null){
				var _conf = G.gc.shenqicom.shenqi[ data.sqid ];
				data.spinejson = _conf.fightshow; //'shengbinga_1';//
			}
			var pos = {
				"0": cc.p(36, -76),
				"1": cc.p(36, -76)
			};
			this._super.apply(this,arguments);
			this.fight = G.DATA.curFight;
			this.info = this.fight["sb" + (data.side * 1 + 1)];
			// this.setPosition( _sqpos[ data.side ] );
			this.info.nodes.panel_sb.addChild(this);
			this.setPosition(pos[data.side]);
			return this;
		},
		loadRoleOver : function(node){
			var me = this;
			var data = me.data;
			node.scale = 1;//0.65;
			node.scaleX *= (data.side==1?1:1);
			this.fight.emit('fightRole_showed',me);
		},
		f5Bar : function(ani){
			var that = this;
			var bar = this.info.bar;
			var per = parseInt((that.data.nuqi / that.data.maxnuqi * 100) / 2);
			var action = cc.progressFromTo(0.5, this.lastPer || 0, per);
			bar.runAction(action);
			this.lastPer = per;
		},
		resetPos : function(ani) {

		}
	});

	G.class.fightRole = G.class.Role.extend({
		ctor : function(data){
			this._super.apply(this,arguments);
			this.data.buff = {};
			this.data.buffAni = {};
			this.data.buffTxt = [];
			this.fight = G.DATA.curFight;
			this.resetPos();
			this.f5Bar(false);
			this.showInfo();
			return this;
		},
		addBuff : function(data){
			//data = {"f": "role_0", "bid": "baojipro", "bt": "baojipro", "r": 15, "t": "role_0", "act": "buff", "_id": "buff_0"}
			var me = this;
			var _buffType = data.bt;
			if(G.gc.buff[data.bid].isshow == "0") {
				return;
			}

			if(!me.data.buff[ _buffType ] ){
				me.data.buff[ _buffType ] = [];
			}
			me.data.buff[ _buffType ].push( data );
			
			if(!cc.isNode(this.info))return;
			if(this.data.dead)return;
			
			if( !this.info.finds('buff_'+ _buffType) ){
				//新增1个图标，设定为1层
				var bico = this.fight.nodes.buff_ico.clone();
				X.enableOutline(bico.finds('txt_number$'),cc.color('#000000'),1);
				bico.setName( 'buff_'+ _buffType );
				bico.finds('txt_number$').setString('1');
				bico.finds('img_buff').loadTexture('img/buff/'+ G.gc.buff[data.bid].icon,1);
				bico.show();
				this.info.finds('buff_panel$').addChild( bico );
				me._reOrderBuffICON();
				me.addBuffANI(data.bid, null, data);

				if (me.ifBianXing()){
					me.bianxing();
				}

				if(me.ifShiHua()){
					me.shihua();
				}
				if(me.ifBingDong()){
					if (!me.ifShiHua()) {
						me.role.runAni(0,'wait',true);
						me.role.stopAllAni();
					}
				}
			}else{
				//只修改buff层数
				if (_buffType == 'bind') {
					//缠绕buff有两段效果 故套叠加多个显示
					me.addBuffANI(data.bid, null, data);
				}
				this.info.finds('buff_'+ _buffType).finds('txt_number$').setString(''+ me.data.buff[ _buffType ].length);
			}

			//增加BUFF飘字
			var buffConf = G.gc.buff[data.bid];
			if (buffConf.buffani) me.data.buffTxt.push(data.bid);
			me.addBuffTxt();
		},
		addBuffTxt: function() {
			var me = this;

			if(!me.isBuffTxtAni) {
				var bid = me.data.buffTxt.shift();
				if(bid) {
					me.isBuffTxtAni = true;
					G.class.ani.show({
						json: "ani_buff_piaozi",
						addTo: me,
						y: 70,
						cache: true,
						onload: function (node) {
							X.autoInitUI(node);
							node.nodes.buff_piaozi.setBackGroundImage("img/buffpiaozi/" + G.gc.buff[bid].buffani, 1);

							me.setTimeout(function () {
								me.isBuffTxtAni = false;
								me.addBuffTxt();
							}, 250);
						}
					});
				}
			}
		},
		addBuffANI : function(buffid,callback,data){
			var me = this;
			if(!G.gc.skillani[buffid])return;
			if(!cc.isNode(this))return;
			if(cc.isNode(this.data.buffAni[buffid + data._id]))return;
			if(this.data.dead)return;
			
			var skillAni = G.gc.skillani[buffid];
			G.class.ani.show({
		        json : "skillani/" + skillAni.ani,
		        x: 0,
		        y: 0,
		        z:5 + (skillAni.buffLayer || 0),
		        addTo:me,
		        cache:true,
		        autoRemove:false,
		        repeat:true,
		        onload : function(node,action){
		        	me.data.buffAni[buffid + data._id] = node;
		        	
		        	if(me.data.side==0){
		        		node.setScaleX(1);
		        	}else{
		        		node.setScaleX(-1);
		        	}
		        	callback && callback(node,action);
					if (buffid == 'bind') {
						if (!data.delay) {
							action.play('out', false);
						} else {
							action.play('wait', true);
							var activeRound = G.frame.fight.roundNum + data.delay;
							G.frame.fight.once('round_' + activeRound, function () {
								if (cc.isNode(node)) {
									action.play('out', false);
								}
							});
						}
					}

		        },
				onkey:function (node, action, event) {
					if (event == 'hit' && buffid == 'bianxing'){
							node.hide();
					}
				}
		    });
		},
		delBuff : function(data){
			//{"bid": "pojiapro", "bt": "pojiapro", "r": 0, "t": "role_0", "act": "buffdel", "_id": "buff_9"}
			var me = this;
			if(!cc.isNode(this.info))return;
			var _buffType = data.bt;
			if(!me.data.buff[ _buffType ] )return;
			for(var i=0;i<me.data.buff[ _buffType ].length;i++){
				if( me.data.buff[ _buffType ][i]._id == data._id){
					me.data.buff[ _buffType ].splice(i,1);
					break;
				}
			}
			if(me.data.buff[ _buffType ].length==0){
				//如果此type的buff已全部失效，则删除图标
				delete me.data.buff[ _buffType ];
				var _bufficon = this.info.finds('buff_'+ _buffType);
				cc.isNode(_bufficon) && _bufficon.removeFromParent();
				me._reOrderBuffICON();
				var id = '';
				for (var buffKey in me.data.buffAni) {
					if (buffKey.indexOf(_buffType) != -1) {
						id = buffKey;
						break;
					}
				}
				if (_buffType == 'bind') id = _buffType + data._id;
				me.delBuffANI(id);
				if(_buffType=='shihua' || _buffType=='bingdong'){
					me.wait();
				}
				if (_buffType == 'bianxing'){
					this.role.show();
					if(this.yangRole)this.yangRole.removeFromParent();
					delete this.yangRole;
				}
			}else{
				//只修改数字
				if (data.bid == 'bind') {
					me.delBuffANI(data.bid + data._id);
				}
				if(!cc.isNode(this.info))return;
				if(!cc.isNode(this.info.finds('buff_'+ _buffType)))return;
				if(!cc.isNode(this.info.finds('buff_'+ _buffType).finds('txt_number$')))return;
				this.info.finds('buff_'+ _buffType).finds('txt_number$').setString(''+ me.data.buff[ _buffType ].length);
			}
		},
		delBuffANI : function(buffid){
			if(!cc.isNode(this))return;
			if(!cc.isNode(this.data.buffAni[buffid]))return;
			this.data.buffAni[buffid].removeFromParent();
			delete this.data.buffAni[buffid];
		},
		delAllBuffANI : function(){
			for(var buffid in this.data.buffAni){
				this.delBuffANI(buffid);
			}
		},
		_reOrderBuffICON : function(){
			//重新排序bufficon图标
			var me = this;
			if(!cc.isNode(this.info))return;
			
			var children = this.info.finds('buff_panel$').getChildren();
			for(var i=0;i<children.length;i++){
				children[i].x = i*18;
				children[i].y = 0;
			}
		},
		resetPos : function(ani){
			var data = this.data;
			if(!this.fight._posInfo)return;
			this.zIndex = this.fight._posInfo[data.rid].z;
			if(ani){
				this.runActions([
					cc.moveTo(0.1,cc.p(this.fight._posInfo[data.rid].x,this.fight._posInfo[data.rid].y))
				]);
			}else{
				this.x = this.fight._posInfo[data.rid].x;
				this.y = this.fight._posInfo[data.rid].y;
			}
		},
		showInfo : function(){
			this.info.show();
			if(this.data.enlargepro!=null && this.data.enlargepro!="1"){
				this.info.y = 190; //BOSS血条位置
				if(this.data.mowangtype == 1) this.info.y = 260;
			}else{
				this.info.y = 150;//普通怪血条位置
			}			
			this.info.x = -10;
			this.info.zIndex = 10;
		},
		hideInfo : function(){
			cc.isNode( this.info ) && this.info.hide();
		},
		willLoadRole : function(){
			var me = this;
			this.info = G.DATA.curFight.nodes.list_gw.clone();
			this.addChild(this.info);
			X.autoInitUI(this);

			me.nodes.txt_dj.setString(me.data.lv);
			X.enableOutline(me.nodes.txt_dj,cc.color('#000000'),1);
            me.nodes.txt_dj.setFontName(G.defaultFNT);
            if (me.data.zhongzu==7){
				me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11_s.png', 1);
			} else {
				me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (me.data.zhongzu + 1) + '_s.png', 1);
			}

		},
		loadRoleOver : function(node){
			var me = this;
			var data = me.data;
			node.scale = 0.65; //先缩小，再按照透视缩一次
			if(G.DATA.curFight._posInfo){
				node.scale *= G.DATA.curFight._posInfo[node.conf.rid].s;
			}
			// npc中的boss需要有一定的放大倍数
            if (this.data.enlargepro) {
                node.scaleX *= data.enlargepro;
                node.scaleY *= data.enlargepro;
            }
			node.scaleX *= (data.side==1?-1:1);
			this.fight.emit('fightRole_showed',me);
		},
        showHPBar : function(allways){
            var that = this;
        },
        f5Bar : function(ani){
            var that = this;
            if(ani==null)ani=true;
            
            if (!cc.isNode(that.nodes.jdt_hp)) {
                return;
            }

            var per=0;
            //刷新血条
            if(that.data.hp != null){
                per = parseInt(that.data.hp/that.data.maxhp*100);
            }
            if(ani){
            	that.nodes.jdt_hp_d.setPercentAni(per);
            	that.nodes.jdt_hp.setPercent(per);
            }else{
            	that.nodes.jdt_hp_d.setPercent(per);
            	that.nodes.jdt_hp.setPercent(per);
            }
          	
          	
            if (!cc.isNode(that.nodes.jdt_sp)) {
                return;
            }
          	//刷新怒气条
          	var per=0;
            if(that.data.nuqi != null){
            	if (that.data.maxnuqi == undefined) that.data.maxnuqi = 100;//如果是不锁血的魔王 锁怒气
                per = parseInt(that.data.nuqi/that.data.maxnuqi*100);
            }
            
            if(per>=100)G.guidevent.emit('sp_is_full');
            
            //满怒气动画
            if(per>=100){
            	if(!cc.isNode(that.data.maxNuQiAni)){
            		G.class.ani.show({
		                json: per == 100 ? "ani_xuetiaobaoqi" : "ani_nuqi_xin",
		                addTo: that.info,
		                x: 45,
		                y: 10,
		                repeat: true,
		                autoRemove: false,
		                cache:true,
		                zIndex:1000,
						onload : function (node, action) {
		                	node.setScaleX(1.25);
		                    that.data.maxNuQiAni = node;
		                }
					});
            	}
            	if (that.skin == '5502002' && !that.isChangeSkin) {
            		that.setAct('bianshen', false, function () {
						G.class.bossRole.prototype.changeModel.call(that, that.skin + '_1');
					});
					that.isChangeSkin = true;
				}
            }else{
            	if(cc.isNode(that.data.maxNuQiAni)){
            		that.data.maxNuQiAni.removeFromParent();
            		delete that.data.maxNuQiAni;
            	}
            }
           
            if(ani){
            	that.nodes.jdt_sp.setPercentAni(per);
            }else{
            	that.nodes.jdt_sp.setPercent(per);
            }
        }
	});
})();
