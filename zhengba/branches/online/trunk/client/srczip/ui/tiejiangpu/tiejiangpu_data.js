/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    var _fun = {
        // 背包数据
        getData: function (type) {
            var me = this;
            var data = G.frame.beibao.DATA.zhuangbei.list;
            var keys = X.keysOfObject(data);
            var arr = [];
            for(var idx in keys){
                var tid = keys[idx];
                var d = data[tid];
                if (type == d.type) {
                    var useNum = d.usenum || 0;
                    if (d.num > useNum && !d.usetid) {
                        arr.push(d);
                    }
                }
            }
            var obj = {};
            for(var idx in arr){
                obj[arr[idx].eid] = arr[idx];
            }
            return obj;
        },
        getEquipData: function (type) {
            var me = this;
            if(me.EquipArr)return me.EquipArr[type];
            me.EquipArr = {1:[],2:[],3:[],4:[]};
            var data = G.class.equip.get();
            for(var idx in data){
                var _type = data[idx].type;
                if(data[idx].need.length > 0){
                    me.EquipArr[_type].push(data[idx]);
                }
            }
            for(var i in me.EquipArr){
                me.EquipArr[i].sort(function (a,b) {
                    if(a.color == b.color){
                        return a.star > b.star ? 1 : -1;
                    }else {
                        return a.color > b.color ? 1 : -1;
                    }
                });
            }
            return me.EquipArr[type];
        }
    };

    for (var key in _fun) {
        G.frame.tiejiangpu[key] = _fun[key];
    }
})();