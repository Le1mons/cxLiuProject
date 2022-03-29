(function () {
    var _func = {
        getData : function(hid, callback){
            var me = this;

            // G.ajax.send('mfxy_open',[hid],function(d){
            //     var data = JSON.parse(d);
            //     if (data.s === 1) {
            //         G.DATA.zzsys = data.d;
            //         callback && callback();
            //     }
            // },true);
        },
        getNextBuff: function(act, tid, callback){
            var me = this;

            G.ajax.send('hero_getnext',[act, tid],function(d){
                var data = JSON.parse(d);
                if (data.s === 1) {
                    callback && callback(data.d);
                }
            },true);
        },
        updateInfo: function (data, callback) {
            var me = this;

            // if(!data){
            //     G.frame.budui.emit('update_armydetails');
            //     return;
            // }

            if (G.frame.yingxiong_xxxx.isShow) {
                // me.getData(data, function(){
                    G.frame.yingxiong_xxxx.refreshPanel(data);
                    G.frame.yingxiong_xxxx.emit('updateInfo');
                    callback && callback();
                // });
            }
        },
        //需要过滤掉不等于该索引的已选择的tid
        getFilterData: function (data,idx) {
            var arr = [];
            for (var index in data) {
                if (index != idx) {
                    arr = arr.concat(data[index]);
                }
            }

            return arr;
        }
    };
    
    for (var key in _func) {
        G.frame.yingxiong_xxxx[key] = _func[key];
    }
})();