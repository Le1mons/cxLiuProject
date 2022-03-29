;(function(){

var localPush = {
    setConf : function(conf){
        /*
        设置本地本地通知
        showIfOnTop = 1 || 0 APP在前端时是否显示
        title = 标题，空为APP名
        content = 内容
        delay = 多少秒后提示
        id = 推送ID
        repeat = 重复频率 秒，可选key
        randCont = 1 可选key 表示content是一个数组格式，从中随机一句
        */
        conf.act = "setNotify";
        conf.title = conf.title||"";
        if(conf.showIfOnTop==null)conf.showIfOnTop="1";
        conf.showIfOnTop = conf.showIfOnTop.toString();
        conf.id = conf.id || X.rand(11111111,99999999);

        console.log('setPush='+JSON.stringify(conf));
        try{
            jsbHelper.callNative(null,null,conf);
        }catch(e){}
    },
    remove : function(id){
        //移除本地通知
    }
};


function getDay(day,fromDay){
    var today = fromDay || new Date();
    var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
    today.setTime(targetday_milliseconds);
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = doHandleMonth(tMonth + 1);
    tDate = doHandleMonth(tDate);
    return tYear+"-"+tMonth+"-"+tDate;
}
function doHandleMonth(month){
    var m = month;
    if(month.toString().length == 1){
        m = "0" + month;
    }
    return m;
}
function str2Date(str){
    return new Date(Date.parse(str.replace(/-/g,"/")));
}

    var msg = [
        '恭喜领主大人获得了极品装备，快上线领取吧',
        '探险小屋的女巫暴动了，领主大人快上线暴打她们吧',
        '矿洞又被打劫了，领主大人快来保卫你的资源',
        '捡到好多宝箱，领主快来看看都装了些什么',
        '恭喜领主大人在挂机期间又获得了大波奖励',
        '今天的每日任务还没完成，领主大人不要奖励了吗',
        '采矿的队伍回来了，领主大人来看看他们的收获吧'
    ];

G.push = {
    regInit : function(){
        this.h12();
        this.h18();
    },
    h12 : function(){
        var day = str2Date(getDay(1)+" 12:00:00");
        console.log('h10 day='+ day);
        var daySec = day.getTime()/1000;
        localPush.setConf({
            id:12,
            content : JSON.stringify(msg),
            randCont : 1,
            showIfOnTop : '0',
            delay : daySec - (G.time||X.time()),
            repeat : 24*60*60
        });
    },
    h18 : function(){
        var day = str2Date(getDay(1)+" 18:00:00");
        console.log('h18 day='+ day);
        var daySec = day.getTime()/1000;
        localPush.setConf({
            id:18,
            content : JSON.stringify(msg),
            randCont : 1,
            showIfOnTop : '0',
            delay : daySec - (G.time||X.time()),
            repeat : 24*60*60
        });
    },
    svr7 : function(){
        //if(!P.gud)return;
        //var openTime = str2Date( (P.gud.opentime.split(' ')[0])+' 00:00:00' );
        //
        //var day = str2Date(getDay(6,openTime));
        //var daySec = day.getTime()/1000;
        //
        //if(daySec<=G.time)return;
        //localPush.set({
        //  content : "开区活动结束啦，赶快来领取属于你的丰厚大礼吧！",
        //  delay : daySec-G.time
        //});
    }
};

})();