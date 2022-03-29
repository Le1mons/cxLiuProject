/**
 * Created by wfq on 2018/5/22.
 */
(function () {
    var _fun = {
        // getData: function (callback) {
        //     var me = this;
        //
        //     G.ajax.send('equip_getlist',[],function(d) {
        //         if(!d) return;
        //         var d = JSON.parse(d);
        //         if(d.s == 1) {
        //             G.DATA.zhuangbei = d.d;
        //             callback && callback();
        //         }
        //     });
        // },
        // 装备信息
        getZhuangebiByTid: function (tid) {
            var me = this;

            return G.frame.beibao.DATA.zhuangbei.list[tid];
        },
        //装备的总数量
        getZhuangbeiNumByTid: function (tid) {
            var me = this;

            return G.frame.beibao.DATA.zhuangbei.list[tid] && G.frame.beibao.DATA.zhuangbei.list[tid].num || 0;
        },
        //获得可以使用的装备数量
        getCanUseNumByTid: function (tid) {
            var me = this;

            var num = 0;
            if (G.frame.beibao.DATA.zhuangbei.list[tid]) {
                num = G.frame.beibao.DATA.zhuangbei.list[tid].num - G.frame.beibao.DATA.zhuangbei.list[tid].usenum;
            }

            return num;
        },
        //通过装备类型获得tid数组
         getZbTidArrByType: function (type) {
             var me = this;

             var data = G.frame.beibao.DATA.zhuangbei.list;
             var arr = [];

             for (var tid in data) {
                 var conf = G.class.equip.getById(data[tid]);
                 if (conf.type == type) {
                     arr.push(tid);
                 }
             }

             return arr;
         },
        //可以使用的装备tid数组
        getCanUseZbTidArrByType: function (type) {
            var me = this;

            var data = G.frame.beibao.DATA.zhuangbei.list;
            var arr = [];

            for (var tid in data) {
                var d = data[tid];
                var conf = G.class.equip.getById(d.eid);
                if (conf.type == type && d.num > d.usenum) {
                    arr.push(tid);
                }
            }

            return arr;
        }
    };
    G.frame.zhuangbei = G.frame.zhuangbei || {};
    for (var key in _fun) {
        G.frame.zhuangbei[key] = _fun[key];
    }
})();