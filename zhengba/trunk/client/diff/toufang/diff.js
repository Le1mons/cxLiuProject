(function(){
	var GAMENAME = "zhengba";

    G.TiShening = jsbHelper.callNative(null,null,{
        act:'getExtra',
        key :'tishen'
    })||"";
    G.hotUpdateUrl = "http://gametools.legu.cc/?m=publicapi&act=hotupdate&tishen="+G.TiShening;
    G.serverListUrl = "http://gametools.legu.cc/?m=publicapi&act=serverlist&game="+ GAMENAME +"&app=serverlist&tishen="+G.TiShening;

    G.CHANNEL = jsbHelper.callNative(null,null,{
            act:'getChannel'
	})||"";

	G.owner = jsbHelper.callNative(null,null,{
		act:'getExtra',
		key :'owner'
	})||"dev5";

	G.owner = "dev5";
	G.banhaoText = jsbHelper.callNative(null,null,{
        act:'getExtra',
        key :'banhao'
    })||"";
	G.gameLogo = jsbHelper.callNative(null,null,{
        act:'getExtra',
        key :'gamelogo'
    })||"";
    //获取设备唯一标识
    G.nativeId = jsbHelper.callNative(null,null,{
        act:'getNativeId'
    })||"";
    //获取ip
    G.nativeIp = jsbHelper.callNative(null,null,{
        act:'getNativeIp'
    })||"";
    //获取定位
    G.nativePos = jsbHelper.callNative(null,null,{
        act:'getNativePos'
    })||"";
    //获取设备厂商
    G.nativeManufacturer = jsbHelper.callNative(null, null, {
        act:'getManufacturer'
    })||"";
    //获取设备型号
    G.nativeModel = jsbHelper.callNative(null, null, {
        act:'getModel'
    })||"";
    //获取运营商
    G.nativeCarrier = jsbHelper.callNative(null, null, {
        act:'getCarrier'
    })||"";
    //获取网络类型
    G.nativeNetwork = jsbHelper.callNative(null, null, {
        act:'getNetwork'
    })||"";
    //获取系统版本
    G.nativeOSVersion = jsbHelper.callNative(null, null, {
        act:'getOSVersion'
    })||"";
    //获取App版本
    G.nativeAppVersion = jsbHelper.callNative(null, null, {
        act:'getAppVersion'
    })||"";
    //获取App名称
    G.nativeAppName = jsbHelper.callNative(null, null, {
        act:'getAppName'
    })||"";

    G.serverListUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);
    G.hotUpdateUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);

    // G.frame.login.onInit = function(){
    //     var me = this;
      
    //     TD.event('loginInit',{
    //         channel:G.CHANNEL,
    //         owner:G.owner,
    //         gameName:G.gameName
    //     });
    //     G.frame.login.ui.finds('Text_1').show();
    //     if(G.gameName&&G.gameName!="fangzhi"){
    //             G.frame.login.ui.finds('Text_1').hide();
    //         }
      
    //     G.frame.login.nodes.btn_ghzh.hide();
        
    //     jsbHelper.event.removeAllListeners('cbLogin');
    //     jsbHelper.event.on('cbLogin',function(data){
      
    //         cc.log('cbLogin'+ JSON.stringify(data));
      
    //         if(data.state!='1'){
    //             if(G.CHANNEL!='heiyazi')G.tip_NB.show("登录失败 "+ (data.why || ""));
    //             return;
    //         }
      
      
    //         X.ajax.post(G.apiUrl+"?app=homm.login&channel="+ G.CHANNEL +"&yijie=1&sdkname="+G.sdkName+"&bundleId="+G.bundleId+"&bundleVersion="+G.bundleVersion,{
    //             data:JSON.stringify(data),
    //             channelId:G.channelId||""
    //         },function(txt){
              
    //             cc.log('txt=='+txt);
    //             var d = JSON.parse(txt);
    //             if(d.result===0){
    //                 C.log('httpCheckLoginOver');
      
    //                 if(cc.GLOBALTISHEN){
    //                     G.class.loginfun.willLogin({
    //                         u:'jingqi_1811301201449313',
    //                         t:X.time(),
    //                         userStatus:1,
    //                         specialUser:1,
    //                         k:'7dd395bfc1c214b9cf64ae50d13bd7ea'
    //                     },function(){
    //                         me.remove();
    //                     });
    //                 }else{
    //                     G.class.loginfun.willLogin(d,function(){
    //                         me.remove();
    //                     });
    //                 }
    //             }else{
    //                 G.tip_NB.show("登录失败，请重试("+ (d.errcode || "-99") +")");
    //             }
    //         });
    //     });
      
    //     G.channelId = jsbHelper.callNative(null,null,{
    //         act:'getExtra',
    //         key :'channelId'
    //     })||"100000";
    //     if(!G.channelId)G.channelId = "";
    //     G.serverListUrl += "&channelId="+G.channelId;
    //     G.hotUpdateUrl += "&channelId="+G.channelId;
    //     me.ui.nodes.panel_yszc.setVisible(/*cc.sys.os == cc.sys.OS_ANDROID &&*/ (G.owner == 'blyinghe' || G.owner == 'qilin' || G.owner == 'qlbl' || G.owner == 'jundao' || G.owner == 'jundao6' || G.owner == 'whblzh'));
    //     me.ui.nodes.btn_dl.touch(function(sender,type){
    //         if(type==ccui.Widget.TOUCH_ENDED){
    //             if(/*cc.sys.os == cc.sys.OS_ANDROID &&*/ (G.owner == 'blyinghe' || G.owner == 'qilin' || G.owner == 'qlbl' || G.owner == 'jundao' || G.owner == 'jundao6' || G.owner == 'whblzh')){
    //                 if(X.cache('ystishi') == 0) return G.tip_NB.show(L("YUEDUGOUXUAN"));
    //             }
    //             me.getLastServer(true);
    //             if(!G._API){
    //                 G.tip_NB.show(L('choosesvrfirst'));
    //                 return;
    //             }
                
    //             if(G.channelId=='110001' || !cc.sys.isNative){
                  
    //                 var name = X.cache('name');
    //                 if(!name){
    //                     name=X.UUID(4);
    //                     X.cache('name',name);
    //                 }
    //                 jsbHelper.event.emit('cbLogin',{"state":1,"app":"","sdk":G.CHANNEL,"uin":name,"sess":"selfserver123456789","bundleId":G.bundleId,"bundleVersion":G.bundleVersion}); 
    //             }else{
    //                 cc.log('click login serverid=='+(G._SERVERID ||'0'));
    //                 jsbHelper.callNative(null,null,{
    //                     act: 'login',
    //                     serverid: G._SERVERID ||'0',
    //                 });
    //             }
    //         }
    //     });
      
    //     me.ui.nodes.txt_2.touch(function () {
    //         G.frame.login_tishi.show();
    //     });
    //   };
})();