C.DEBUG = cc.DEBUG = true;
C.USECSB = true;
cc.loader.resPath = "res";

//游戏全局命名
var G = {
    DATA:{},
    win : {},
    frame : {},
    view:{},
    DAO: {}, //(Data Access Object) 数据访问对象
    hotUpdateUrl : "http://v3.legu.cc/hommupdate/?app=hotupdate",
    serverListUrl : "http://v3.legu.cc/hommdata/?app=serverlist",
    gonggaoUrl:'http://gamemana.legu.cc/index.php?g=admin&m=data&a=out_notice&game=zhengba',
    // gonggaoUrl:'http://10.0.0.20/gm/index.php?g=admin&m=data&a=out_notice&game=heros&owner=cz',
    //VERSION : "0.0.1",
    //吴雨寒
    //_API:"http://10.0.0.69:6288/",
    //_SOCKET:"10.0.0.69:6287",
    //唐凯
    //_API:"http://10.0.0.36:7288",
    //_SOCKET:"10.0.0.36:7287",
    //外网
    //_API:"http://v3.legu.cc:11111",
    //_SOCKET:"v3.legu.cc:11110",
    //
    //_API:"http://10.0.0.34:6288",
    //_SOCKET:"10.0.0.34:6287",
    // check_card_url: 'http://legugm.legu.cc/?app=api.chkcard&gameid=heros&uid={1}&uname={2}&cnum={3}',
    check_card_url: 'http://gamemana.legu.cc/index.php?g=admin&m=data&a=card_active&game=36xN78ZyxspPdYR&uid={1}&uname={2}&cnum={3}&owner={4}',
    event : cc.EventEmitter.create(),
    guidevent : cc.EventEmitter.create(),
    defaultFNT:'img/fnt/fzcyj.ttf'
};
G.class={};
G.event.setMaxListeners(50000);
G.guidevent.setMaxListeners(5000);