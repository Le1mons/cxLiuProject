(function(){

var GAMETOOLSURL = "http://gametools.legu.cc/",
    GAME = 'zhengba';
    X.LOGURL = "http://gamemana.legu.cc/index.php?g=admin&m=data&a=tongji";

    X.LOGURL = "";


G.event.on('setServerData',function(data){
    //选择了区服时，读取区服状态，弹出维护提示
    var url = GAMETOOLSURL+"?app=api&act=getRunning&game="+GAME+"&sid="+data.sid;
    X.ajax.get(url,{},function(v){
        if(v==null || (v+"").length==0)return;
        if(!cc.sys.isObjectValid(G.frame.login.ui))return;
        if(v*1 === 0){
            //维护中
            // G.frame.login.ui.finds('wh').setString(  X.STR(L('NOTRUNNING'),data.name));
            // G.frame.login.ui.finds('mask_gg').show();
            var qqqun = G.gameconfig.get('qqqun');
            if(qqqun){
                var str =  L("WHGG") + X.STR(L("JRQQ"),qqqun.v);
            }else{
                var str =  L("WHGG");
            }
            if(!G.frame.tishi_fwq.isShow){
                G.frame.tishi_fwq.data({
                    title: L("WHGG_NAME"),
                    intr: str,
                }).show();
            }
        }else{
            //去掉维护中的提示...
            // G.frame.login.ui.finds('mask_gg').hide();
            G.frame.help.remove();
        }
    });
});

    X.tiShenLog = function(sender,pos){
        X.ajax.post('http://gametools.legu.cc/?app=tmp_log&act=addlog',{
            game:GAME,
            uid : (P&& P.gud) ? P.gud.uid :'',
            t : sender.getName(),
            pos : JSON.stringify(sender.convertToWorldSpace(pos))
        });
    };
/*
* log为字典，以下为常规统计
* click  //表示点击次数
* money  //表示消耗代币
* rmbmoney  //表示消耗充值币
*
* other... //其他任意KV数据
* */

X.LOG = {
    _tmlLogDic:{},
    _addCount:0,
    _timer : null,

    add : function(act,data){
        //合并数据
        if(X.LOGURL==null || X.LOGURL=="")return;

        data.act = act;
        data.ctime = G.time;

        if(!this._tmlLogDic[act]){
            this._tmlLogDic[act] = data;
        }else{
            for(var k in data){
                if(isNaN(data[k]))continue;

                if(this._tmlLogDic[act][k]==null)this._tmlLogDic[act][k]=0;
                this._tmlLogDic[act][k] += (data[k]*1);
                this._tmlLogDic[act].ctime = G.time;
            }
        }
        this._addCount++;
        if(this._addCount>=10){
            this._addCount=0;
            this.send();
        }
    },
    send : function(){
        if(X.LOGURL==null || X.LOGURL==""){
            this._tmlLogDic = {};
            return;
        }

        if(this._timer!=null){
            cc.director.getRunningScene().clearTimeout(this._timer);
            delete this._timer;
        }

        if(P.gud){
            var keys = Object.keys(this._tmlLogDic),
                sendLog = [],
                reqData = {
                    "sid": P.gud.svrindex,
                    "uid": P.gud.uid,
                    "requnid": X.time() + X.UUID(2),
                    "game":"hkskswks"
                };
            reqData.sign = X.MD5(reqData.game + reqData.sid + reqData.uid + reqData.requnid + "ajsdklasjdkjakl123f");

            if(keys.length>0){
                for(var k in this._tmlLogDic){
                    this._tmlLogDic[k].act = k;
                    sendLog.push(this._tmlLogDic[k]);
                }
                reqData.log = JSON.stringify(sendLog);
                this._tmlLogDic = {};//清空缓存
                X.ajax.post(X.LOGURL,reqData);
            }
        }

        this._timer = cc.director.getRunningScene().setTimeout(function(){
            X.LOG.send();
        },60000);
    }
};
/*G.win.start.on('ready',function(){
    X.LOG.send();
});*/

    //自动记录
G.event.on('pay',function(d){
    d = JSON.parse(d);
    //{"rmbmoney": 30, "act": "qijiqifu"}
    X.LOG.add("pay_"+ d.act,{
        "rmbmoney":d.rmbmoney
    });
});


})();