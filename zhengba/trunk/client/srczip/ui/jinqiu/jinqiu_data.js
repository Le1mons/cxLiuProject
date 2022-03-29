(function () {
    G.DAO.jinqiu = {
        getServerData: function(callback, ui){
            var me = this;
            ui = ui || G.frame.jinqiu_main;
            ui.ajax("midautumn2_open",[], function (str, data) {
                if(data.s == 1) {
                    G.DATA.jinqiu = data.d;
                    callback && callback(data.d);
                }
            });
        },


        // 小游戏 步数
        xixi: function(num, callback, ui){
            var me = this;
            ui.ajax("midautumn2_gameprize",[num], function (str, data) {
                if(data.s == 1) {
                    G.DATA.jinqiu.myinfo = data.d.myinfo;
                    G.DATA.jinqiu.rank = data.d.rank;
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    //G.hongdian.getData('midautumn',1);
                    callback && callback(data.d);
                }
            });
        },

        // 任务领取
        receive: function(id, callback, ui){
            var me = this;
            ui.ajax("midautumn2_receive",[id], function (str, data) {
                if(data.s == 1) {
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    //G.hongdian.getData('midautumn',1);
                    callback && callback(data.d);
                }
            });
        },

    };
})();