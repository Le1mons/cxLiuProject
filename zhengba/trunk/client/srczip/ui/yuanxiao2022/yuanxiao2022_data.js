(function () {
    G.DAO.yuanxiao2022 = {
        getServerData: function(callback, ui){
            var me = this;
            ui = ui || G.frame.yuanxiao2022;

            ui.ajax("yuanxiao3_open",[], function (str, data) {
                if(data.s == 1) {
                    G.DATA.yuanxiao2022 = data.d;
                    callback && callback(data.d);
                }
            });
        },

        // 抽奖
        lotty: function(num, callback, ui){
            var me = this;
            ui = ui || G.frame.yuanxiao2022;
            ui.ajax("yuanxiao3_lottery",[num], function (str, data) {
                if(data.s == 1) {
                    callback && callback(data.d);
                }
            });
        },

        // 签到
        qiandao: function(day,callback, ui){
            var me = this;
            ui = ui || G.frame.yuanxiao2022;

            ui.ajax("yuanxiao3_qiandao",[day], function (str, data) {
                if(data.s == 1) {
                    G.DATA.yuanxiao2022.myinfo = data.d.myinfo;
                    G.hongdian.getData('yuanxiao3',1);
                    callback && callback(data.d);
                }
            });
        },

        // 任务领取
        receive: function(id, callback, ui){
            var me = this;
            ui = ui || G.frame.yuanxiao2022;

            ui.ajax("yuanxiao3_receive",[id], function (str, data) {
                if(data.s == 1) {
                    G.DATA.yuanxiao2022.myinfo = data.d.myinfo;
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        // 物品兑换
        duihuan: function(id, callback, ui){
            var me = this;
            ui = ui || G.frame.springfestival;

            ui.ajax("yuanxiao3_duihuan",id, function (str, data) {
                if(data.s == 1) {
                    G.hongdian.getData('newyear3',1);
                    callback && callback(data.d);
                }
            });
        },
        getRefreshTime: function(){
            var me = this;
            if (
                X.isHavItem(G.DATA.asyncBtnsData.yuanxiao3) &&
                G.DATA.asyncBtnsData.yuanxiao3.rtime
            ){
                return G.DATA.asyncBtnsData.yuanxiao3.rtime;
            }else{
                return G.time;
            }
        },
        getQiandaoDay:function(){
            var me = this;
            var stime = G.DATA.yuanxiao2022.info.stime;
            var offtime = G.time - stime;
            var day = Math.ceil(offtime/(24*3600));
            return day;
        },
    };
})();