(function(){
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
	G.banhaoText = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'banhao'
        })||"";
	
    G.apiUrl = "http://zhengbaapi.legu.cc/api/";
    var updateUrl = "http://zhengbaapi.legu.cc/update/"
    G.hotUpdateUrl = updateUrl+"?app=hotupdate&tishen="+G.TiShening;
    G.serverListUrl = G.apiUrl+"?app=serverlist&tishen="+G.TiShening;

    G.CHANNEL = jsbHelper.callNative(null,null,{
            act:'getChannel'
	})||"zhengba";
	G.owner = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'owner'
	})||"zhengba";
	G.gameName = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'gamename'
	})||"fangzhi";
    G.gameLogo = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'gamelogo'
        })||"";
   G.sdkName = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'sdkname'
        })||"";
    G.pidPre = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'pidpre'
        })||"";

    G.serverListUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0)+"&sdkname="+G.sdkName;
    G.hotUpdateUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0)+"&sdkname="+G.sdkName;
    //汇报数据
    G.event.on('playerInit',function(){
        var zoneId = (P.gud.svrindex+"");
        //talkindDATA汇报数据
        TD.setAccount({
            uid:P.gud.uid,
            lv:P.gud.lv,
            servername:G._SERVERNAME || ""
        });

        //1sdk上报数据
        if(G.CHANNEL.indexOf('qqyxb')!=-1){
            zoneId = "1";
        }
		
		if(G.CHANNEL=='heiyazi'){
			//heiyazi mast no space
			G._SERVERNAME = G._SERVERNAME.replace(/\s+/g,""); 
		}

        jsbHelper.callNative(null,null,{
            act:'setRoleData',
            roleId : P.gud.binduid||"",//P.gud.uid,
            roleName : P.gud.name,
            roleLevel:(P.gud.lv).toString(),
            zoneId:zoneId.toString(),
            zoneName: G._SERVERNAME || zoneId +"服"
        });
    });

    //等级变化时，上报数据到TD
    G.event.on('playerLvup',function(data){
        //通知TD
        TD.setAccount({
            uid:P.gud.uid,
            lv:data.lv,
            servername:G._SERVERNAME || "",
            binduid :P.gud.binduid||""
        });
    });

    G.event.on('createrole',function(d){
		var binduid = d.binduid;
		console.log(d);
		if(binduid)binduid = binduid+""
        jsbHelper.callNative(null,null,{
            act:'REYUN_reg',
            binduid :P.gud.binduid||"",
			zoneId : P.gud.svrindex,
			roleLevel:P.gud.lv||1,
			roleName:P.gud.name||""
        });
    });

    G.event.on('createrole',function(){
		console.log('createrole2');
        jsbHelper.callNative(null,null,{
            act:'REYUN_create',
            roleName :P.gud.name||"",
            binduid :P.gud.binduid||"",
			roleLevel:P.gud.lv||1,
            zoneId : P.gud.svrindex
        });
    });
    G.event.on('dologin',function(){
		console.log('dologin');
		var binduid = P.gud.binduid;
		if(binduid)binduid = binduid+""
		
        jsbHelper.callNative(null,null,{
            act:'REYUN_login',
            binduid :binduid||"",
            zoneId : P.gud.svrindex,
			roleLevel:P.gud.lv||1,
			roleName:P.gud.name||""
        });
    });
    G.event.on('allFirstPayBtnHide',function(){
        jsbHelper.callNative(null,null,{
            act:'firstpay'
        });
    });

    //登陆相关接口
    G.frame.login.showUI = function(){
        var me = this;
        //me.ui.finds('ver').show();
        //me.ui.finds('btn_dl').show();
       // me.ui.finds('bg_qufu').show();
	   me.ui.nodes.btn_dl.show();
        me.ui.nodes.bg_qufu.show();
		me.ui.nodes.btn_ghzh.hide();
    };

	//===================20160413==========
	/*
	denglu.js中增加 G.event.emit('createrole'); 和 G.event.emit('dologin');
	*/
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
		if(G.CHANNEL=='heiyazi'){
			d.zoneName = d.zoneName.replace(/\s+/g,"");
			d.dataType = "0";
			d.chapter = "0";
		}
        if(G.CHANNEL=='xipumfmglak'){
            d.balance = ""+P.gud.rmbmoney;
        }
        //指点渠道 上传数据必须要区服id
        if(G.CHANNEL=='zhidianztwm6apk'){
            var zoneName = d.zoneName;
            var zoneNameArr = zoneName.replace(/[^0-9]/ig,"");
            d.zoneId = ""+parseInt(zoneNameArr);
        }

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
	


	//if(G.CHANNEL.indexOf('caohua')!=-1 || G.CHANNEL=='heiyazi'){
    //    G.event.on('playerLvup',function(lv){
    //        ucSubmitExtendData('levelup');
    //    });
   // }
    //if(G.CHANNEL.indexOf('xinyou')!=-1){
     //   if(X.cache('__firstSetup')!='1'){

            //jsbHelper.callNative(null,null,{
            //    act:'setData',
            //    key:'active',
           //     val:""
           // });
           // X.cache('__firstSetup','1');
       // }
    //}
    //if(G.CHANNEL.indexOf('tanwan')!=-1 || G.CHANNEL=='twmfmswyyerappstore' || G.CHANNEL=='twmfmccappstore'){
      //  G.event.on('setServerData',function(){
		//	jsbHelper.callNative(null,null,{
		//		act:'setData',
		//		key:'selectServer',
		//		val:""
		//	});
      //  });
       // G.event.on('playerInit',function(){
       //     cc.director.getRunningScene().setTimeout(function(){
       //         ucSubmitExtendData('enterGame');
       //     },300);
       // });
       // G.event.on('playerLvup',function(lv){
       //     ucSubmitExtendData('levelup');
       // });
       // G.event.on('createrole',function(){
       //     ucSubmitExtendData('createrole');
        //});



        //贪玩的退出统计放到java层处理
   // }

    //if(G.CHANNEL && G.CHANNEL=='kymfmcsappstore'){
     //   G.event.on('playerInit',function(){
     //       ucSubmitExtendData('enterGame');
     //   });
    //}

    //安智反馈频繁切换账号会闪退
   // console.log('logout G.CHANNEL-------=='+G.CHANNEL);
   // if(G.CHANNEL=='anzhi' || G.CHANNEL=='guaimao' || G.CHANNEL=='heitao'){

     //   G.restart = function(){
            //G.event.removeAllListeners();

            //X.closeAllFrame();
      //      G.mainMenu.remove();
      //      G.toper.remove();

		//	cc.director.getRunningScene().setTimeout(function(){
		//		G.frame.login.show();
		//	},500);
       // };
   // }

    G.frame.login.onInit = function(){
        var me = this;
		
		TD.event('loginInit',{
			channel:G.CHANNEL,
			owner:G.owner,
			gameName:G.gameName
		});

	
		//if(!cc.sys.isNative){
		//	me._onInit();
		//	return;
		//}

        //me.ui.finds('text_bb').hide();
        //me.ui.finds('text_ghzh').hide();
		G.frame.login.ui.finds('Text_1').show();
		if(G.gameName&&G.gameName!="fangzhi"){
				G.frame.login.ui.finds('Text_1').hide();
			}

		G.frame.login.nodes.btn_ghzh.hide();

        jsbHelper.event.on('cbLogin',function(data){
            //{"app":"{85659E99-04556EC0}","sdk":"{AA41112D-0CCA498D}","uin":"3248620","sess":"07353a57198c447d875fe4535f30cca4"}
            cc.log('cbLogin'+ JSON.stringify(data));

            if(data.state!='1'){
                if(G.CHANNEL!='heiyazi')G.tip_NB.show("登录失败 "+ (data.why || ""));
                return;
            }

            //G.frame.loading.show();
            X.ajax.post(G.apiUrl+"?app=homm.login&channel="+ G.CHANNEL +"&yijie=1&sdkname="+G.sdkName,{
                data:JSON.stringify(data),
                channelId:G.channelId||""
            },function(txt){
                //G.frame.loading.hide();
                cc.log('txt=='+txt);
                var d = JSON.parse(txt);
                if(d.result===0){
					C.log('httpCheckLoginOver');
					
					//if(P.gud){
						//百度会在切换账号时，直接调用cbLogin方法
						//X.closeAllFrame();
						//G.mainMenu.remove();
						//G.toper.remove();

						//G.frame.preload.show('reconn');
						//G.class.loginfun.doLogin(d.u,d.t,d.k,function(){
						//	G.frame.login.remove();
						//	me.remove();
						//});
					//	G.restart();
					//}else{
                    if(cc.GLOBALTISHEN){
                        G.class.loginfun.willLogin({
                            u:'jingqi_1811301205191065',
                            t:X.time(),
                            userStatus:1,
                            specialUser:1,
                            k:'7dd395bfc1c214b9cf64ae50d13bd7ea'
                        },function(){
                            me.remove();
                        });
                    }else{
                        G.class.loginfun.willLogin(d,function(){
                            me.remove();
                        });
                    }
                }else{
                    G.tip_NB.show("登录失败，请重试("+ (d.errcode || "-99") +")");
                }
            });
        });

        G.channelId = jsbHelper.callNative(null,null,{
            act:'getExtra',
            key :'channelId'
        })||"100000";
        if(!G.channelId)G.channelId = ""; //游戏橙子需要的key，读取在1sdk打包时自定义的 channelId 字段
        G.serverListUrl += "&channelId="+G.channelId;
        G.hotUpdateUrl += "&channelId="+G.channelId;

        me.ui.nodes.btn_dl.touch(function(sender,type){
            if(type==ccui.Widget.TOUCH_ENDED){
                me.getLastServer(true);
                if(!G._API){
                    G.tip_NB.show(L('choosesvrfirst'));
                    return;
                }
				
				if(G.channelId=='110001' || !cc.sys.isNative){
					//橙子封测用android
					var name = X.cache('name');
					if(!name){
						name=X.UUID(4);
						X.cache('name',name);
					}
					jsbHelper.event.emit('cbLogin',{"state":1,"app":"","sdk":G.CHANNEL,"uin":name,"sess":"selfserver123456789"});
				}else{
                    cc.log('click login serverid=='+(G._SERVERID ||'0'));
					jsbHelper.callNative(null,null,{
						act: 'login',
                        serverid: G._SERVERID ||'0',
					});
				}
            }
        });


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
            paytype:'yijie',
            role: P.gud.name,
            rolelv : P.gud.lv,
            money : d.money,
            serverid : P.gud.sid,
            channel : G.CHANNEL||'',
            clidata:''
        };
        //G.frame.loading.show();
        X.ajax.post(G.apiUrl+"?app=order&act=create",data,function(txt){
            //G.frame.loading.hide();

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
    //获取易接订单号后上报
    jsbHelper.event.on('cbPayOrder',function(yijieorderid){
        cc.log('cbPayOrder'+ yijieorderid);
        if(!yijieorderid || yijieorderid=='')return;

        X.ajax.post(G.apiUrl+"?app=order&act=setyjorder",{
            orderid : G.ORDERID||"",
            yijieorder : yijieorderid
        },function(txt){

        });
    });

    //监听充值事件
    //监听充值事件
    G.event.on('doSDKPay',function(data){
        var proid = data.pid, //产品id
            money = data.money,//分
            pname = data.pname,
            logicProid = data.logicProid||proid;

        if(G.gameName=='mfmyxgj'){
            if(proid=='zhizunka'){
                logicProid=proid;
                proid="zhizunka2";
            }
        }

        if(G.gameName=='qycsdgj'){
            if(proid=='yueka'){
                logicProid=proid;
                proid="yueka30";
            }
        }

        //add proid 的前缀
        if (G.pidPre != '') {
            proid = G.pidPre+'_'+proid;
        }

        //指点渠道 支付数据必须要区服id
		var _zoneId = "";
        if(G.CHANNEL && G.CHANNEL=='zhidianztwm6apk'){
            var _zoneName = P.gud.ext_servername || G._SERVERNAME ||'无'
            var zoneNameArr = _zoneName.replace(/[^0-9]/ig,"");
            _zoneId = '' + parseInt(zoneNameArr);
        }

        G.createPayOrder({proid:logicProid,money:money},function(){
            jsbHelper.callNative(null,null,{
                act:'pay',
                unitPrice : money,
                itemName : pname || proid,
                count : 1,
                binduid:P.gud.binduid+"",
                proid : proid,
                serverId:P.gud.sid,
                level: P.gud.lv,
                //muzhiyouwanPayCall:"http://hommapi.legu.cc/api/?M=homm.muzhiyouwan",
                callBackInfo : G.ORDERID,
                uid: P.gud.uid,
                userName: P.gud.name,
                zoneName : P.gud.ext_servername || G._SERVERNAME ||'无',
                vip : ""+P.gud.vip,
                zoneId: _zoneId || (''+P.gud.sid),
                rmbMoney: ""+P.gud.rmbmoney,
            });
        });
    });
	
	

    jsbHelper.event.on('iapCallBack',function(d){
        if(d.s=='checkPayments'){
            //G.tip_NB.show("正在检查您的appStore账号是否允许支付");
        }else if(d.s=='RequestProductData'){
            //G.frame.loading.show();
            G.tip_NB.show("正在连接服务器读取商品信息");
        }else if(d.s=='addPayment'){
            //G.frame.loading.show();
            G.tip_NB.show("正在发送购买请求");
        }else if(d.s=='SKPaymentTransactionStateFailed'){
            G.tip_NB.show("购买失败");
        }else if(d.s=='completeTransaction'){
            X.cache('iapData',d.d);
            G.tip_NB.show("购买成功");
            checkIapData();

            jsbHelper.callNative(null,null,{
                act:'REYUN_pay',
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

        //G.frame.loading.show();
        X.ajax.post(G.apiUrl+"?app=homm.iappay&orderid="+ G.ORDERID,{
            data:d
        },function(txt){
            //G.frame.loading.hide();
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
    };

})();