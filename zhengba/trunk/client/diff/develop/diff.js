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
	})||"dev";

	G.owner = "dev";
	
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
})();