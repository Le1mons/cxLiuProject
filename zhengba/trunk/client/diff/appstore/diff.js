(function(){
	//乐谷、魔法门英雄传、泰坦与黑龙   appstore
	//var TiShening = "1013";//拇指游玩 英雄挂机 正版ios
    //var TiShening = "1014";//要玩    死亡阴影 正版ios
    //var TiShening = "";//易接安卓、越狱ios

	G.event.once('paysuccess', function (txt) {
		try{
			var j = JSON.parse(txt);
			jsbHelper.callNative(null,null,{
				act:'TDCPA_tdpay',
				uid :P.gud.uid,
				rmbmoney : j.rmbmoney
			});
		}catch(e){}
	});

    G.TiShening = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'tishen'
        })||"";
	
    G.apiUrl = "http://zhengbaapi.legu.cc/api/";
    var updateUrl = "http://zhengbaapi.legu.cc/update/"
    G.hotUpdateUrl = updateUrl+"?app=hotupdate&tishen="+G.TiShening;
    G.serverListUrl = G.apiUrl+"?app=serverlist&tishen="+G.TiShening;

    G.CHANNEL = jsbHelper.callNative(null,null,{
            act:'getChannel'
	})||"";
	G.owner = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'owner'
	})||"zhengbaios";
	G.gameName = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'gamename'
	})||"";
	G.gameLogo = jsbHelper.callNative(null,null,{
			act:'getExtra',
			key :'gamelogo'
		})||"";
  G.sdkName = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'sdkname'
        })||"";
	G.pingxxAppid = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'pingxxappid'
	})||"";
	G.pidPre = jsbHelper.callNative(null,null,{
			act:'getExtra',
			key :'pidpre'
		})||"";

    G.serverListUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);
    G.hotUpdateUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);
    //汇报数据
    G.event.on('playerInit',function(){
        var zoneId = (P.gud.svrindex+"");
        //talkindDATA汇报数据
        TD.setAccount({
            uid:P.gud.uid,
            lv:P.gud.lv,
            servername:G._SERVERNAME || ""
        });
		checkIapData();
    });

    //等级变化时，上报数据到TD
    G.event.on('playerLvup',function(data){
        //通知TD
        TD.setAccount({
            uid:P.gud.uid,
            lv:data.lv,
            servername:G._SERVERNAME || ""
        });
    });
	G.event.on('regover',function(d){
		jsbHelper.callNative(null,null,{
            act:'TDCPA_reg',
            binduid :d.binduid||""
        });
	});

	G.event.on('createrole',function(){
		jsbHelper.callNative(null,null,{
            act:'TDCPA_create',
            name :P.gud.name||""
        });
	});
	G.event.on('dologin',function(){
		jsbHelper.callNative(null,null,{
            act:'TDCPA_login',
            binduid :P.gud.binduid||""
        });
	});

	function ucSubmitExtendData(k){
		var d = {
			roleId : ""+P.gud.binduid,
			roleName : ""+P.gud.name,
			roleLevel : ""+(P.gud.lv||1),
			zoneId : ""+(P.gud.svrindex),
			zoneName : P.gud.ext_servername || G._SERVERNAME ||'无',
			balance : ""+P.gud.jinbi,
			vip : ""+P.gud.vip,
			partyName : (P.gud.ghid && P.gud.ghid!=''?  '帮会'+P.gud.ghid : "无帮派"),
			roleCTime : ""+P.gud.ctime,
			roleLevelMTime : ""+G.time,
			rmbMoney: ""+P.gud.rmbmoney,
			serverId:""+(P.gud.svrindex),
		};

		console.log('ucSubmitExtendData='+ JSON.stringify(d));
		jsbHelper.callNative(null,null,{
			act:'setData',
			key:k,
			val:JSON.stringify(d)
		});
	}

	console.log('G.CHANNEL=='+G.CHANNEL);

	G.event.on('playerInit',function(){
		ucSubmitExtendData('loginGameRole');
	});
	G.event.on('playerLvup',function(lv){
		ucSubmitExtendData('levelup');
	});
	G.event.on('createrole',function(){
		ucSubmitExtendData('createrole');
	});
	G.event.on('dologin',function(){
		ucSubmitExtendData('enterServer');
	});

    G.frame.login.onInit = function(){
        var me = this;
        G.channelId = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'channelId'
        });
        if(!G.channelId)G.channelId = ""; //游戏橙子需要的key，读取在1sdk打包时自定义的 channelId 字段
        G.serverListUrl += "&channelId="+G.channelId;
        G.hotUpdateUrl += "&channelId="+G.channelId;
		
		me._onInit();

		//me.ui.finds('mask_dl').finds('ykdl').hide();

		var _cacheUser = X.cache('name'),
			_cachePwd = X.cache('password');

		if (_cacheUser && _cachePwd){
			me.ui.finds('zhanghao').setString(_cacheUser);
			me.ui.finds('mima').setString(_cachePwd);
		}
		
    //     me.ui.nodes.btn_dl.touch(function(sender,type){
    //         if(type==ccui.Widget.TOUCH_ENDED){
    //             me.getLastServer();
    //             if(!G._API){
    //                 G.tip_NB.show(L('choosesvrfirst'));
    //                 return;
    //             }
				// //me.ui.finds('mask_dl').show();
				// //me.ui.finds('mask_dl').finds('ykdl').hide();
    //         }
    //     });
    };
	//登陆逻辑
	G.frame.login._loginLogic = function(user,pwd){
		G.frame.loading.show();
		X.ajax.post(G.apiUrl+"?app=homm.login&channel="+ G.CHANNEL +"&channelId="+G.channelId+"&sdkname="+G.sdkName,{
			user:user,
			pwd:pwd
		},function(txt){
			G.frame.loading.hide();
			var d = JSON.parse(txt);
			if(d.result*1===0){
				X.cache('name',user);
				X.cache('password',pwd);
				
				G.class.loginfun.willLogin(d,function(){
					G.frame.login.remove();
				});
				
				jsbHelper.callNative(null,null,{
								 act:'fupeilogin',
								 useID : user,
							 });
			}else{
				G.tip_NB.show("登陆失败 "+ d.errcode );
			}
		});
	};
	//游戏登陆模式
	G.frame.login._guestLoginLogic = function(){
		var _cacheUser = X.cache('name'),
			_cachePwd = X.cache('password');
		
		if (_cacheUser && _cachePwd){
			return G.frame.login._loginLogic(_cacheUser,_cachePwd);
		}
		
		var _randUser = 'mfm'+X.rand(1111111,9999999),
			_randPwd = X.rand(111111,999999);

		return doReg(_randUser,_randPwd);
	};
	
	function doReg(user,pwd){
		G.frame.loading.show();
		X.ajax.post(G.apiUrl+"?app=homm.login&channel="+ G.CHANNEL +"&channelId="+G.channelId+"&sdkname="+G.sdkName,{
			user:user, 
			pwd:pwd
		},function(txt){
			G.frame.loading.hide();
			var d = JSON.parse(txt);
			if(d.result*1===0){
				X.cache('name',user);
				X.cache('password',pwd);
				//{"result":0,"u":"93158","t":1466480524,"k":"fe58919c7b00c3b5aee2bc2e88b9df35","myu":"_","userStatus":1,"specialUser":0}
				
				G.event.emit('regover',{binduid:d.u});
				G.class.loginfun.willLogin(d,function(){
					G.frame.login.remove();
				});
				
				jsbHelper.callNative(null,null,{
								 act:'fupeilogin',
								 useID : user,
							 });
			}else{
				G.tip_NB.show("注册失败 "+ d.errcode );
			}
		});
	}

	G.frame.login._regLogic = function(user,pwd){
		if(user.length<6 || pwd.length<6){
			G.tip_NB.show('用户名和密码都必须大于6位');
			return;
		}
		if(user.length>18){
			G.tip_NB.show('用户名需小于18位');
			return;
		}
		if(/^[0-9a-zA-Z]+$/.test(user) == false){
			G.tip_NB.show('用户名只能包含字母和数字');
			return;
		}
		doReg(user,pwd);
	};

    //登出
    jsbHelper.event.on('cbLogout',function(){
        G.restart();
    });

    //支付相关接口
    //创建订单
    G.createPayOrder = function(d,callback){
        var data = {
            gameid:201601,
            owner:'chengzi',
            uid : P.gud.uid,
            proid : d.proid,
            binduid : P.gud.binduid,
            paytype:'appstore',
            role: P.gud.name,
            rolelv : P.gud.lv,
            money : d.money,
            serverid : P.gud.svrindex,
            channel : G.CHANNEL||'',
            clidata:''
        };
        G.frame.loading.show();
        X.ajax.post(G.apiUrl+"?app=order&act=create",data,function(txt){
            G.frame.loading.hide();

            cc.log('txt=='+txt);
            var json = JSON.parse(txt);
            if(json.s!=1){
                G.tip_NB.show("订单创建失败，请重试");
            }else{
                G.ORDERID = json.d;
				G.ORDERMONEY = data.money;

                callback && callback();
            }
        });
    };
	
	jsbHelper.event.on('iapCallBack',function(d){
        if(d.s=='checkPayments'){
			//G.tip_NB.show("正在检查您的appStore账号是否允许支付");
		}else if(d.s=='RequestProductData'){
			G.frame.loading.show();
			G.tip_NB.show("正在连接服务器读取商品信息");
		}else if(d.s=='addPayment'){
			G.frame.loading.show();
			G.tip_NB.show("正在发送购买请求");
		}else if(d.s=='SKPaymentTransactionStateFailed'){
			G.tip_NB.show("购买失败");
		}else if(d.s=='completeTransaction'){
			X.cache('iapData',d.d);
			G.tip_NB.show("购买成功");
			checkIapData();

			jsbHelper.callNative(null,null,{
				act:'TDCPA_pay',
				binduid:P.gud.binduid||"",
				orderid :G.ORDERID||"",
				amount:G.ORDERMONEY||"0",
				currencyType:"CNY",
				payType:"appStore"
			});
			
		}
    });
	
	function checkIapData(){
		var d = X.cache('iapData');
		if(!d || d=="")return;
		G.tip_NB.show("正在发放物品 请勿关闭游戏");

		G.frame.loading.show();
		X.ajax.post(G.apiUrl+"?app=homm.iappay&orderid="+ G.ORDERID,{
			data:d
		},function(txt){
			G.frame.loading.hide();
			var j = JSON.parse(txt);
			if(j.s!=1){
				G.tip_NB.show(j.d+"");
				if(j.retry){
					G.tip_NB.show("5秒后自动重试 请稍等");
					cc.director.getRunningScene().setTimeout(function(){
						checkIapData();
					},5000);
				}else{
					X.cache('iapData',''); //无需重试，清空缓存
				}
			}else{
				G.tip_NB.show(j.d+"");
				X.cache('iapData',''); //无需重试，清空缓存
			}
		});
	}

    //监听充值事件

    G.event.on('doSDKPay',function(data){
        var proid = data.pid, //产品id
            money = data.money,//分
            pname = data.pname,
			logicProid = data.logicProid||proid;

		if(G.gameName=='mfmhero'){
			if(proid=='zhizunka'){
				logicProid=proid;
				proid="zhizunka2";
			}
		}

		//add proid 的前缀
		if (G.pidPre != '') {
			proid = G.pidPre+'_'+proid;
		}

		G.frame.loading.show();
        G.createPayOrder({proid:logicProid,money:money},function(){
			G.frame.loading.hide();
			var _proName = pname || proid;
			function _iap(){
				jsbHelper.callNative(null,null,{
					act:'pay',
					unitPrice : money,
					itemName : _proName,
					count : 1,
					proid : proid,
					callBackInfo : G.ORDERID,
					uid: P.gud.uid,
					userName: P.gud.name,
					level: P.gud.lv,
				});
			}

			if(G.pingxxAppid!="" && G.serverconfig.DATA['tishen']!='1' && P.gud.vip >= 1){
				//选择支付方式
				 G.event.removeAllListeners('btn_iap');
				 G.event.removeAllListeners('pay_other');

				 G.event.once('pay_iap',function(){
				 	_iap();
				 });

				 G.event.once('pay_other',function(paytype){
					 G.frame.loading.show();
					 X.ajax.post(G.apiUrl+"?app=pingxx&act=create",{
						 order:G.ORDERID,
						 paytype:paytype,
						 proname:_proName,
						 money:money,
						 appid:G.pingxxAppid
					 },function(txt){
						 G.frame.loading.hide();
						 if(txt==""){
							 G.tip_NB.show("调起该支付方式失败 请选择其他支付方式或稍后再试");
							 return;
						 }
						 try{
							 var j = JSON.parse(txt);
						 }catch(e){
							 G.tip_NB.show("支付数据解析失败="+txt);
							return;
						 }

						 if(j.s!=1){
							 G.tip_NB.show(j.d+"");
						 }else{
							 var ds = JSON.stringify(j.d);
							 jsbHelper.callNative(null,null,{
								 act:'pingxxpay',
								 data : ds
							 });
						 }
					 });
				 });

				 G.frame.zhifufangshi.show();
			}else{
				_iap();
			}


        });
    });

	//月卡修改为30元礼包
	/*
	LNG['YK_SM']=LNG['YK_SM_APPSTORE'];
	LNG['ZZK_SM']=LNG['ZZK_SM_APPSTORE'];
	G.frame.chongzhi.on('aniShow',function(){
		var me = G.frame.chongzhi;
		me.ui.finds('btn_3').setTitleText('30元礼包');
		me.ui.finds('panel_zhizunka').finds('sy').setString('物超所值');

		var ktykBtn = me.ui.finds('brn_ktyk'),
			wz = ktykBtn.find('wz');
		wz.loadTexture('img/wz_gm30yuan.png')
	});
	*/
	//主界面的月卡按钮，修改为30元礼包
	/*
	G.frame.main.once('aniShow',function(){
		var me = G.frame.main;
		var yuekaBtn = me.ui.finds('Button_yueka'),
			sprite = yuekaBtn.find('FileNode_1.Node_1.shouchong04_4');
		sprite.initWithFile('img/wz_gm30yuan1.png');
	});
  */
  
	//针对个别渠道，以gamename 字段为判断，把至尊卡修改为98元礼包
	if(G.gameName=='mfmyx'){
		LNG['ZZK_SM']=LNG['ZZK_SM_APPSTORE1'];

		G.frame.chongzhi.on('aniShow',function(){
			var me = G.frame.chongzhi;
			me.ui.finds('btn_4').setTitleText('98元礼包');

			var ktykBtn = me.ui.finds('panel_zhizunka').finds('brn_ktyk'),
				wz = ktykBtn.find('wz');
			wz.loadTexture('img/wz_gm98yuan.png');
		});

		//主界面的至尊卡按钮，修改为98元礼包
		/*
		G.frame.main.once('aniShow',function(){
			var me = G.frame.main;
			var zhizunkaBtn = me.ui.finds('Button_yjzs'),
				sprite = zhizunkaBtn.find('FileNode_1.Node_1.shouchong04_4');
			sprite.initWithFile('img/wz_gm98yuan1.png');
		});
		*/
	};

})();