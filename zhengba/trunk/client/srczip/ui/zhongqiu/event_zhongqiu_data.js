(function () {
    G.DAO.zhongqiu = {
        getServerData: function(callback, ui){
            var me = this;
            ui = ui || G.frame.event_zhongqiu;

            ui.ajax("midautumn_open",[], function (str, data) {
                if(data.s == 1) {
                    G.DATA.zhongqiu = data.d;
                    callback && callback(data.d);
                }
            });
        },

        // 中秋商市 购买
        store: function(idx, num, callback, ui){
            var me = this;
            ui = ui || G.frame.event_zhongqiu;

            ui.ajax("midautumn_store",[idx, num], function (str, data) {
                if(data.s == 1) {
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    callback && callback(data.d);
                }
            });
        },

        // 月饼工坊 兑换
        workshop: function(idx, num, callback, ui){
            var me = this;
            ui = ui || G.frame.event_zhongqiu;

            ui.ajax("midautumn_workshop",[idx, num], function (str, data) {
                if(data.s == 1) {
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    callback && callback(data.d);
                }
            });
        },

        // 月兔嬉戏 步数
        xixi: function(num, callback, ui){
            var me = this;
            ui = ui || G.frame.event_zhongqiu;

            ui.ajax("midautumn_xixi",[num], function (str, data) {
                if(data.s == 1) {
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    G.hongdian.getData('midautumn',1);
                    callback && callback(data.d);
                }
            });
        },

        // 任务领取
        receive: function(id, callback, ui){
            var me = this;
            ui = ui || G.frame.event_zhongqiu;

            ui.ajax("midautumn_receive",[id], function (str, data) {
                if(data.s == 1) {
                    // changeData(data.d, G.DATA.shishihuilang, false);
                    G.hongdian.getData('midautumn',1);
                    callback && callback(data.d);
                }
            });
        },

        getRefreshTime: function(){
            var me = this;
            if (
                X.isHavItem(G.DATA.asyncBtnsData.midautumn) &&
                G.DATA.asyncBtnsData.midautumn.rtime
            ){
                return G.DATA.asyncBtnsData.midautumn.rtime;
            }else{
                return G.time;
            }
        },

        getMoonStep: function(){
            var me = this;
            var step = -1;

            var moonConf = G.gc.midautumn.toTheMoon.moon;
            for(var i=0;i<moonConf.length;i++){
                if(G.DATA.zhongqiu.moon >= moonConf[i][0]){
                    step = i;
                }
            }
            return step;
        },
    };
})();