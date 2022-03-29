(function () {
    var ID ='guide';

    //新手引导中的用到的方法
    G.class.guideFun = {
    	"open_set_player_name" : function(conf){
    		//打开改名界面
    		G.guide.remove();
    		G.frame.login_zc.show();
    	},
    	"scrollToBuild" : function(conf){
    		//滚动到指定建筑
    		G.view.mainView.scrollToBuild( conf.stype );
    	},
    	"openframe" : function(conf){
    		//通用打开指定窗口
    		if(G.frame[ conf.stype ]){
    			G.frame[ conf.stype ].show();
    		}else{
    			cc.log('openframe时找不到frame',conf.stype);
    		}
    	},
    	"pauseFight" : function(conf){
    		//暂停战斗
    		if(G.frame.fight.DATA)G.frame.fight.DATA.isPause = true;
    		cc.callLater(function(){
    			G.guidevent.emit('pauseFightOver');
    		});

    	},
    	"resumeFight" : function(){
    		//继续战斗
    		if(G.frame.fight.DATA)G.frame.fight.DATA.isPause = false;
    		G.frame.fight.tranRound && G.frame.fight.tranRound();

    		cc.callLater(function(){
    			G.guidevent.emit('resumeFightOver');
    		});
    	},
    	"closeFightWithWin" : function(){
    		//关闭战斗
    		G.frame.fight_win.remove();
    		G.frame.fight.remove();
    		cc.callLater(function(){
    			G.guidevent.emit('closeFightOver');
    		},50);
    	},
        "resumeshenqi": function () {
    	    //神器动画引导
    	    G.frame.tanxian.showSqAni();
        },
    	"moveHeroPos" : function(conf){
    		//交换英雄位置
    		var fingerAni = G.guide.view.fingerAni;
         var qianpai = G.frame.yingxiong_fight.ui.finds('panel_qp');

         var pos = qianpai.convertToWorldSpace();
         pos.x += 230;
         pos.y += 50;

         var aniNode;
         G.class.ani.show({
            json:'ani_xinshou_zhiyin',
            x:pos.x,
            y:pos.y,
            repeat:true,
            autoRemove:false,
            onload : function(node,action){
               aniNode = node;
               action.playWithCallback('in',false,function(){
                  action.play('wait',true);
              });
           }
       });

//			fingerAni.setPosition(pos);
//			
//			var action = cc.fmtActions([
//				cc.callFunc(function(){
//					fingerAni.show();
//					fingerAni.setPosition(pos);
//				}),
//				cc.moveBy(0.7,cc.p(-200,0)),
//				cc.delayTime(0.2),
//				cc.callFunc(function(){
//					fingerAni.hide();
//				}),
//				cc.delayTime(0.3)
//			]);
//			action = action.repeatForever();
//			action.setTag(41254488);
//			fingerAni.runAction(action);

G.guide.view.setTimeout(function(){
    G.guide.view.lockClick = function(sender,type){
       G.frame.yingxiong_fight.top.changeItem(
          G.frame.yingxiong_fight.ui.finds('ico_qianpai_yx$').finds('0'),
          G.frame.yingxiong_fight.ui.finds('ico_houpai_yx$').finds('2')
          );
       cc.isNode(aniNode) && aniNode.removeFromParent();
					//fingerAni.stopActionByTag(41254488);
					G.guidevent.emit('moveHeroPosOver');
				};
			},1000);
}
}


G.view.GuideView = X.bView.extend({
    ctor: function () {
        var me = this;
        me._super('xinshouyindao.json',null,{action:true});
    },
    onOpen: function () {
        var me = this;
            //me.ui.finds('bg').setTouchEnabled(false);
        },
        onShow: function () {
            var me = this;
            me.ui.finds('skip').hide();
            me.nodes.mask.setContentSize(cc.director.getWinSize().width, cc.director.getWinSize().height);
            me.nodes.lock.setContentSize(cc.director.getWinSize().width, cc.director.getWinSize().height);
            ccui.helper.doLayout(me.nodes.mask);
            ccui.helper.doLayout(me.nodes.lock);
            me.nodes.lock.show();
            me.nodes.lock.click(function(sender,type){
            	me.lockClick && me.lockClick(sender,type);
            });
        },
        onRemove: function () {
            var me = this;
            G.guide.view = null;
        },

        _hideAllType : function(){
        	var me = this;
        	me.nodes.duibai.hide();
        	me.nodes.qipao_zuo.hide();
        	me.nodes.qipao_you.hide();
        	me.nodes.mask.hide();
        	me.finds('ui').setTouchEnabled(false);
        	me.lockClick = function(){cc.log('lockClick...');};
        	if(cc.isNode(me.fingerAni)){
        		me.fingerAni.hide();
        	}
        	cc.log('_hideAllType');
        },

        parseSingleGuideConf : function(conf){
        	//预解析单条配置
        	var me = this;
        	if(!me.ui){
        		//兼容web逻辑
        		me.setTimeout(function(){
        			me.parseSingleGuideConf(conf);
        		},100);
        		return;
        	}
            me.ui.finds('skip').hide();
        	this.DATA = conf;
        	this._parseBeforeGuide(conf);
        	this._parseNeedCondition(conf);

        	if(conf.sound) {
        	    //是否有配音
                X.audio.stopAllEffects();
                X.audio.playEffect("guidesound/" + conf.sound, false);
            }

        	if(conf.type=='1'){
        		//对白类
        		if(!me.nodes.duibai.isVisible()){
        			this.action.play('in1',false);
        		}

        		if(me.nodes.duibai.finds('renwu').getChildrenCount() == 0 ){
        			//加动画
        			X.spine.show({
                        json:'spine/xinshourenwu.json',
                        addTo : me.nodes.duibai.finds('renwu'),
                        x:180,
                        y:-50,
                        z:0,
                        autoRemove:false,
                        rid : 1,
                        onload : function(node){
                            node.runAni(0, "wait", true);
                        }
                    });
        		}

        		this.showDuiHua( conf );
                if(conf.skip)me.ui.finds('skip').show();
                me.ui.finds('skip').click(function(){
                    G.guide.skip();
                });

        	}else if(conf.type=='3'){
        		//自定义方法
        		this._hideAllType();
        		this._parseMask(conf);
        		if(G.class.guideFun[ conf.substance ]){
        			G.class.guideFun[ conf.substance ]( conf );
        		}else{
        			cc.log('以下substance在guideFun中未实现',conf.substance,conf);
        		}
        	}else if(conf.type=='2'){
        		//文字气泡
        		if(!me.nodes.qipao_zuo.isVisible()){
        			this.action.play('in',false);
        		}
        		if(me.nodes.qipao_zuo.finds('renwu').getChildrenCount() == 0 ){
        			//加动画
        			X.spine.show({
                        json:'spine/xinshourenwu.json',
                        addTo : me.nodes.qipao_zuo.finds('renwu'),
                        x:180,
                        y:-120,
                        z:0,
                        autoRemove:false,
                        rid : 1,
                        onload : function(node){
                            node.runAni(0, "wait", true);
                        }
                    });
        		}
        		this.showQiPao( conf );
        		this._parseFinger(conf);
        	}else if(conf.type=='4'){
        		//解析手指
        		this._hideAllType();
        		this._parseMask(conf);
        		this._parseFinger(conf);
        	}


        },

        //通过字符串变量获取一个节点，找不到返回null
        //str = G.view.mainView.btn_yxjt
        getNode : function(str){
        	var strArr = str.split('.');
         var _node;
         for(var i=0;i<strArr.length;i++){
            if(_node==null){
               if(strArr[i]=='G'){
                  _node = G;
              }else{
                  var fun = new Function("","return "+strArr[i]);
                  _node = fun();
              }
          }else{
           _node = _node[strArr[i]];
       }
       if(!_node){
           cc.log('getNodeError_can_not_find：',str);
           return null;
       }
   }
   return _node;
},

        /*
         conf {
         	substance : 内容
         	width
         	height
         	x
         	y
         }
         * */
//      showTips : function(conf){
//      	var me = this;
//      	me.nodes.qipao_jiugong.show();
//      	
//      	var target = me.nodes.qipao_jiugong.finds('cont');
//      	target.removeAllChildren();
//      	
//      	var rt = new X.bRichText({
//	            size: 20,
//	            lineHeight: 24,
//	            color: cc.color('#ffffff'),
//	            maxWidth: target.width,
//	            family: G.defaultFNT,
//	        });
//	        var cont = conf.substance;
//	        rt.text( cont );
//	        rt.setAnchorPoint(0,1);
//	        
//	        me.nodes.qipao_jiugong.setContentSize( conf.width , conf.height );
//	        ccui.helper.doLayout(me.nodes.qipao_jiugong);
//	        
//	        rt.setPosition( cc.p((target.width - rt.trueWidth())*0.5, target.height) );
//	        target.addChild(rt);
//	        
//	        me.nodes.qipao_jiugong.x = conf.x;
//	        me.nodes.qipao_jiugong.y = conf.y;
//      },

_parseMask : function(conf){
        	//解析是否显示遮罩
        	var me = this;
        	if(conf.iszhezhao=='1'){
        		me.nodes.mask.show();
        	}else{
        		me.nodes.mask.hide();
        	}
        },
        _parseBeforeGuide : function(conf){
        	//解析引导前
        	var me = this;
        	if(conf.beforeguide && conf.beforeguide){
        		//how??
//      		if(G.class.guideFun[ conf.beforeguide ]){
//      			G.class.guideFun[ conf.beforeguide ]( conf );
//      		}else{
//      			cc.log('以下BeforeGuide在guideFun中未实现',conf.beforeguide,conf);
//      		}
}
},
_parseNeedCondition : function(conf){
        	//如果设定步进条件
        	var me = this;
        	if(conf.needcondition && conf.needcondition!=""){
        		G.guidevent.once(conf.needcondition, function(){
        			me._donext( conf );
        		})
        	}
        },

        _parseFinger : function(conf){
        	//解析是否需要加手指
        	var me = this;
        	if(conf.fingerclicks && conf.fingerclicks!=""){
        		if(!cc.isNode(me.fingerAni)){
                    G.class.ani.show({
                       json:'ani_xinshou_arrow',
                       cache:true,
                       autoRemove:false,
                       addTo:me.finds('ui'),
                       repeat:true,
                       onload : function(node,action){
                          node.zIndex = 10;
                          me.fingerAni = node;
                          if(conf.fingerFilter){
                             conf.fingerFilter(conf,me.fingerAni);
                         }else{
                             me._setFingerInfo(conf,me.fingerAni);
                         }
                         me.fingerAni.show();
                     }
                 });
                }else{
                    if(conf.fingerFilter){
                      conf.fingerFilter(conf,me.fingerAni);
                  }else{
                      me._setFingerInfo(conf,me.fingerAni);
                  }
                  me.fingerAni.show();
              }
          }else{
              cc.isNode(me.fingerAni) && me.fingerAni.hide();
          }
      },

      _setFingerInfo : function(conf){
           var me = this;
           var node = me.getNode( conf.fingerclicks );
           if(node){

               if(me.__skipTimer){
                   me.clearTimeout(me.__skipTimer);
                   me.__skipTimer = null;
               }

               //10秒后允许跳过
               me.__skipTimer = me.setTimeout(function(){
                   me.ui.finds('skip').show();
                   me.ui.finds('skip').click(function(){
                       X.delCacheByUid('guideStepInfo');
                       G.guide.remove();
                   });
               },10000);

                 var _rect = cc.getRect(node);
                 var pos = cc.p( _rect.x + _rect.width/2, _rect.y + _rect.height/2 );
                 me.lockClick = function(sender,type){
    				//cc.log( 'click',_rect,sender.getTouchEndPosition() );
    				if(!cc.sys.isNative || cc.rectContainsPoint(_rect, sender.getTouchEndPosition())){
    					//在区域内
    					node.triggerTouch && node.triggerTouch(ccui.Widget.TOUCH_ENDED);

    					if(!conf.needcondition){
    						me._donext(conf);
    					}else{
                           me._hideAllType();
                       }
                   }else{
                       cc.log('不在区域内，todo提示效果....',sender.getTouchEndPosition());
    					//不在区域内


                        if(X.inArray(["btn_qr2$", "txt_djgb$", "btn_fh$", "btn_guanbi$"], node.getName())) {
                            //特殊界面点击任意位置生效
                            node.triggerTouch && node.triggerTouch(ccui.Widget.TOUCH_ENDED);

                            if(!conf.needcondition){
                                me._donext(conf);
                            }else{
                                me._hideAllType();
                            }
                        }else{
                            if(!me.xinshou_cuowu){
                                G.class.ani.show({
                                    json: "ani_xinshou_cuowu",
                                    addTo: me.finds('ui'),
                                    x: pos.x,
                                    y: pos.y,
                                    repeat: false,
                                    autoRemove: true,
                                    onload:function(node, action){
                                        me.xinshou_cuowu = node;
                                    },
                                    onend :function(node, action){
                                        me.xinshou_cuowu = null;
                                    }
                                })
                            }
						}
                    }
                };
    			//var pos = node.convertToWorldSpaceAR();
    			me.fingerAni.setPosition(pos);
           }else{
    			cc.log('_setFingerInfo时，找不到节点',conf.fingerclicks);
    			//找不到目标节点，如何处理？
    		}
        },

        _donext : function(conf){
        	//步进到下一步
        	var me = this;

            if(me.__skipTimer){
                me.clearTimeout(me.__skipTimer);
                me.__skipTimer = null;
            }

        	if(conf.afterguide){
        		var _arr = conf.afterguide.split('_'); // groupid_stepid
        		G.guide.show( _arr[0] , _arr[1] );
        	}else{
        		//没有下一步了，直接结束
        		G.guide.remove();
        		X.delCacheByUid('guideStepInfo');
        	}
        },

        showDuiHua : function(conf){
        	//解析一段对话
        	//设计原则：确保在任何时候调用该方法能正常的解析，无上下文依赖
        	var me = this;
        	this._hideAllType();

        	this._parseMask(conf);
        	var target = me.nodes.duibai.finds('cont');
        	target.removeAllChildren();

        	var rt = new X.bRichText({
               size: 20,
               lineHeight: 24,
               color: cc.color('#ffffff'),
               maxWidth: target.width,
               family: G.defaultFNT,
           });
           var cont = conf.substance;
           if(P.gud)cont = cont.replace('<玩家名字>',P.gud.name);
           rt.text( cont );
           rt.setAnchorPoint(0,1);
           rt.setPosition( cc.p((target.width - rt.trueWidth())*0.5, target.height) );
           target.addChild(rt);

           me.nodes.duibai.show();
           me.nodes.duibai.setTouchEnabled(false);
           me.finds('ui').setTouchEnabled(true);
           me.finds('ui').click(function(){
              if(!conf.needcondition){
	        		//如果没有设定步进条件的话，则点击时候下一步
	        		me._donext( conf );
	        	}else{
	        		me._hideAllType();
	        	}
	        });
       },

       showQiPao : function(conf){
        	//解析一段气泡
         var me = this;
         this._hideAllType();
         this._parseMask(conf);
         var qipao;
         if(conf.stype=='1'){
        		//左侧气泡
        		qipao = me.nodes.qipao_zuo;
        	}else{
        		//右侧气泡
        		qipao = me.nodes.qipao_you;
        	}

        	var target = qipao.finds('cont');
        	target.removeAllChildren();

        	var rt = new X.bRichText({
               size: 20,
               lineHeight: 24,
               color: cc.color('#84311a'),
               maxWidth: target.width,
               family: G.defaultFNT,
           });
           rt.text( conf.substance );
           rt.setAnchorPoint(0,1);
           rt.setPosition( cc.p((target.width - rt.trueWidth())*0.5, target.height) );
           target.addChild(rt);

           qipao.show();
       },
   });

G.guide = {
   view : null,
    	//stepid可以为空，表示执行group中，id最小的
    	show: function( groupid,stepid ){
    		groupid = groupid.toString();
    		var guideGroup = G.gc.guide[groupid];
    		if(stepid==null){
    			var keys = Object.keys(guideGroup);
    			keys.sort(function(a,b){
    				return a*1<b*1?-1:1;
    			});
    			stepid = (keys[0]).toString();
    		}
    		var conf = guideGroup[stepid];
    		conf.groupid = groupid;

    		//当前正在进行的指导步骤
    		X.cacheByUid('guideStepInfo',{
    			groupid:groupid,
    			stepid:stepid
    		});

    		this._parseConf(conf);
    	},
    	_parseConf : function(conf){
    		if(!cc.isNode( this.view )){
    			this.view = new G.view.GuideView();
    			this.view.zIndex = 100000+1;//比alert框高1
    			cc.director.getRunningScene().addChild( this.view );
    		}
    		this.view.parseSingleGuideConf(conf);
    	},
    	continueGuide : function(){
    		var me = this;
            if(G.tiShenIng)return;

    		//根据缓存的任务进度，计算引导的进度并还原依赖窗口
    		var guideStepInfo = X.cacheByUid('guideStepInfo');
    		if(!guideStepInfo)return;

    		var guideGroup = G.gc.guide[guideStepInfo.groupid];
    		var keys = Object.keys(guideGroup);
            keys.sort(function(a,b){
                return a*1<b*1?-1:1;
            });

            var _breakStep,lastNextGuide;
            for(var i=0;i<keys.length;i++){
                var _stepid = keys[i];
                if(guideGroup[_stepid]['break']=='1'){
                   _breakStep = _stepid*1;
                }
               lastNextGuide = guideGroup[_stepid].afterguide;
            }

            var continueGuide = {"groupid":guideStepInfo.groupid,"stepid":keys[0]};
            if(_breakStep!=null && guideStepInfo.stepid*1>=_breakStep){
				//满足跳组条件
				if(!lastNextGuide){
					//但是没有下一组了
					X.delCacheByUid('guideStepInfo');
					return;
				}
				var _nextGuide = lastNextGuide.split('_');
				continueGuide = {"groupid":_nextGuide[0],"stepid":_nextGuide[1]};
			}
			cc.log('continueGuide',continueGuide);
			this._openNeedUI(continueGuide.groupid,continueGuide.stepid,function(){
				G.guide.show(continueGuide.groupid,continueGuide.stepid);
			});
       },
       _openNeedUI : function(groupid,stepid,callback){
          var guide = G.gc.guide[groupid][stepid];
          if(!guide['relyui']){
             callback && callback();
         }
         var nui = guide['relyui'].split(':');

         var act=nui[0],
         arg=nui[1];

         if(act=='frame'){
    			//打开窗口
    			G.frame[ arg ].once('aniShow',function(){
    				callback && callback();
    			}).show();
    		}else if(act=='fun'){
    			if(arg=='mainview'){
    				//主城
    				X.uiMana.closeAllFrame();
    				cc.callLater(function(){
    					callback && callback();
    				});
    			}else if(arg=='yingxiong_xxxx_panel1'){
    				//第一个英雄的培养界面
    				G.frame.yingxiong.once('aniShow',function(){
    					G.frame.yingxiong_xxxx.once('aniShow',function(){
    						cc.callLater(function(){
                             callback && callback();
                         });
    					});
    					G.frame.yingxiong._firstItem.triggerTouch(ccui.Widget.TOUCH_ENDED);
    				}).show();
    			}else if(arg=='yingxiong_xxxx_panel2'){
    				//第一个英雄的装备界面
    				G.frame.yingxiong.once('aniShow',function(){
    					G.frame.yingxiong_xxxx.once('aniShow',function(){
    						G.guidevent.once('yingxiong_xxxxChangeTypeOver',function(){
    							cc.callLater(function(){
                                    callback && callback();
                                });
    						})
    						G.frame.yingxiong_xxxx.topMenu.btns.menuBtn2.triggerTouch(ccui.Widget.TOUCH_ENDED);

    					});
    					G.frame.yingxiong._firstItem.triggerTouch(ccui.Widget.TOUCH_ENDED);
    				}).show();
    			}
    		}
    	},
        skip : function(){
            //跳过当前引导的节点
            var guideStepInfo = X.cacheByUid('guideStepInfo');
            if(!guideStepInfo){
                //如果没有缓存信息直接关闭
                G.guide.remove();
                return;
            }
            //排序后找到最后一个step的后续
            var guideGroup = G.gc.guide[guideStepInfo.groupid];
            var keys = Object.keys(guideGroup);
            keys.sort(function(a,b){
                return a*1<b*1?-1:1;
            });
            var lastNextGuide;
            for(var i=0;i<keys.length;i++){
                var _stepid = keys[i];
                lastNextGuide = guideGroup[_stepid].afterguide;
            }

            if(!lastNextGuide){
                //没有后续则直接关闭
                X.delCacheByUid('guideStepInfo');
                G.guide.remove();
                return;
            }
            //开始跳组
            var _nextGuide = lastNextGuide.split('_');
            var nextGuideConf = {"groupid":_nextGuide[0],"stepid":_nextGuide[1]};
            cc.log('skip to',nextGuideConf);
            this._openNeedUI(nextGuideConf.groupid,nextGuideConf.stepid,function(){
                G.guide.show(nextGuideConf.groupid,nextGuideConf.stepid);
            });
        },
    	remove : function(){
    		if(cc.isNode( this.view )){
    			this.view.removeFromParent();
    		}
    		this.view = null;
    	}
    };


    function checkGuide(){
    	G.guide.remove();
    	if(!cc.isNode(G.view.mainView))return;

    	var guideStepInfo = X.cacheByUid('guideStepInfo');
    	if(guideStepInfo){
    		if(cc.sys.isNative){
    			G.guide.continueGuide();
    		}else{
    			//网页测试的时，需要等界面都加载完毕
    			setTimeout(function(){
    				G.guide.continueGuide();
    			},500);
    		}

    	}else{
    		if(P.gud && P.gud.lv==1 && P.gud.exp==0){
             G.guide.show(1);
         }
     }
 }
 G.event.on('mainViewShow',function(){

	 //if (G.serverconfig.DATA['tishen'] == 1){
	//	G.gc.guide ={
		//  "1": {
		//	"10": {
		//	  "beforeguide": "", 
	//		  "substance": "open_set_player_name", 
		//	  "afterguide": "", 
		//	  "needcondition": "", 
		//	  "fingerclicks": "", 
		//	  "emitcond": "", 
			//  "break": 1, 
			  //"iszhezhao": 0, 
			  //"intr": "", 
			  //"relyui": "fun:mainview", 
			  //"type": "3", 
			  //"id": "10", 
			  //"stype": ""
			//}
		//  }
		//}
//	}

     if(G.tiShenIng){
		G.gc.guide ={
		  "1": {
			"10": {
			  "beforeguide": "", 
			  "substance": "open_set_player_name", 
			  "afterguide": "", 
			  "needcondition": "", 
			  "fingerclicks": "", 
			  "emitcond": "", 
			  "break": 1, 
			  "iszhezhao": 0, 
			  "intr": "", 
			  "relyui": "fun:mainview", 
			  "type": "3", 
			  "id": "10", 
			  "stype": ""
			}
		  }
		}
	}
	

   checkGuide();
});
 var _needCheckGuide=false;
 var ani_node;
 G.event.on('socketClose',function(){
   if(cc.isNode(G.view.mainView)){
     if(cc.isNode(G.guide.view)){
        if(cc.isNode(ani_node)){
            ani_node.show();
        }else{
            G.class.ani.show({
                json:'ani_duanxianchonglian',
                repeat:true,
                autoRemove:false,
                onload : function(node,action){
                    ani_node = node;
                    ani_node.zIndex = 10000000;
                }
            });
        }
    }
    _needCheckGuide = true;
    		//在主场景时socket被断开了，应该是客户端断线了
    		G.event.once('socketSucc',function(){
    			if(_needCheckGuide){
    				cc.isNode(ani_node) && ani_node.hide();
    				checkGuide();
    			}
    			_needCheckGuide = false;
    		});
    	}
    });

 function eachStep(filter){
   var emit = false;
   for(var gpid in G.gc.guide){
      for(var stepid in G.gc.guide[gpid]){
         if(G.gc.guide[gpid][stepid].emitcond && G.gc.guide[gpid][stepid].emitcond!=""){
            var emitCond =G.gc.guide[gpid][stepid].emitcond;
            if(emitCond !=null && emitCond!="" && filter && filter(emitCond,gpid,stepid)===true){
               emit=true;
               break;
           }
       }
   }
   if(emit)break;
}
}

G.event.on("playerLvup", function (d) {
    	//等级变化时检测
        cc.director.getRunningScene().setTimeout(function(){
        	eachStep(function(emitCond,gpid,stepid){
        		var emitCondArr = emitCond.split(':');
        		if( emitCondArr[0] == 'lv' && d.olv < emitCondArr[1]*1 && d.lv >= emitCondArr[1]*1 ){
        			G.frame.playerlvup.once('close',function(){
        				G.guide.show(gpid,stepid);

        				//玩家在探险处于地图最后一关时 世界地图按钮会有一个手指引导 若此时触发新手 两个手指一样
        				if(G.frame.tanxian.isShow) {
        				    if(cc.isNode(G.frame.tanxian.arrow)) {
                                G.frame.tanxian.arrow.removeFromParent();
                            }
                        }

        				if(G.frame.playerlvup.isShow) G.frame.playerlvup.remove();
        			});
        			return true;
        		}
        	});
        },200);
    });
G.event.once("needOpenWoYaoBianQiang", function () {
        //玩家第一次在第10关战斗失败
        G.guide.show(110)
    })
})();