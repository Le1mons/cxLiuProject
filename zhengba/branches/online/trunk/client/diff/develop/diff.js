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

    G.serverListUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);
    G.hotUpdateUrl += "&channel="+G.CHANNEL+"&owner="+G.owner+"&versincode="+(G.VERSIONCODE||0);
})();