(function(){
    //本地模拟充值
    
        //监听充值事件
        G.event.on('doSDKPay',function(data){
            if(G.serverListUrl == "http://v3.legu.cc/hommdata/?app=serverlist" || G.owner && G.owner == 'dev5'){
                cc.log('doSDKPay',data);
                var proid = data.pid, //产品id
                    money = data.money,//分
                    pname = data.pname,
                    logicProid = data.logicProid||proid;

                G.tip_NB.show('开启本地充值调试模式...');

                G.ajax.send('chongzhi_pay',[
                    P.gud.uid,
                    logicProid,
                    'debugPay'+X.rand(100000000,9999999999),
                    money,
                    'hommDebugSecKey123'
                ],function(){
                    G.tip_NB.show('充值成功');
                    
                    cc.director.getRunningScene().setTimeout(function () {
                        G.event.emit('paysuccess');
                    }, 500);
                },true);
            }
        });
})();