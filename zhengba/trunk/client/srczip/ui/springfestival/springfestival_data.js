(function () {
    G.DAO.springfestival = {
        getServerData: function(callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_open",[], function (str, data) {
                if(data.s == 1) {
                    G.DATA.springfestival = data.d;
                    callback && callback(data.d);
                }else {
                    if (G.frame.springfestival.isShow){
                        G.frame.springfestival.remove();
                    }
                }
            });
        },

        // 金蛋积分奖励领奖
        ageReceive: function(idx, callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;
            ui.ajax("newyear3_eiggetprize",[idx], function (str, data) {
                if(data.s == 1) {
                    G.DATA.springfestival.myinfo = data.d.myinfo;
                    callback && callback(data.d);
                }
            });
        },

        // 签到
        qiandao: function(callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_qiandao",[], function (str, data) {
                if(data.s == 1) {
                    G.DATA.springfestival.myinfo = data.d.myinfo;
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },

        // 任务领取
        receive: function(id, callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_receive",[id], function (str, data) {
                if(data.s == 1) {
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        // 战斗
        fight: function(fdata, callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_fightboss",[fdata], function (str, data) {
                if(data.s == 1) {
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        // 购买礼包
        libao: function(id, callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_libao",id, function (str, data) {
                if(data.s == 1) {
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        // 小游戏胜利领奖接口
        xiaoyouxi: function(callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_xiaoyouxi",[1], function (str, data) {
                if(data.s == 1) {
                    G.DATA.springfestival.myinfo = data.d.myinfo;
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        // 砸蛋接口
        breakage: function(id,callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("newyear3_eig",[id], function (str, data) {
                if(data.s == 1) {
                    G.DATA.springfestival.myinfo = data.d.myinfo;
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        getRefreshTime: function(){
            var me = this;
            if (
                X.isHavItem(G.DATA.asyncBtnsData.newyear3) &&
                G.DATA.asyncBtnsData.newyear3.rtime
            ){
                return G.DATA.asyncBtnsData.newyear3.rtime;
            }else{
                return G.time;
            }
        },
        getQiandaoDay:function(){
            var me = this;
            var stime = G.DATA.springfestival.info.stime;
            var offtime = G.time - stime;
            var day = Math.ceil(offtime/(24*3600));
            return day;
        },
    };
})();