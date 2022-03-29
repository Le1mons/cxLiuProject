(function () {
    
    var _fun = {
        getData : function(callback){
            var me = this;

            G.ajax.send('hero_getlist',[],function(d){
                var data = JSON.parse(d);
                if (data.s === 1) {
                    G.DATA.yingxiong = data.d;
                    me.checkHeroNum();
                    callback && callback();
                }
            },true);
        },
        //获得英雄格子数量
        getHeroCellData: function (callback) {
            var me = this;

            G.ajax.send('user_getgezinum',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    G.DATA.heroCell = d.d;
                    callback && callback();
                }
            });
        },
        //获取小兵tidarr
        getTidArr:function(zhongzu) {
            var me = this;
            var heros = (G.DATA.yingxiong && G.DATA.yingxiong.list) || {};
            var arr = X.keysOfObject(heros);

            if(zhongzu){
                for(var i=arr.length-1;i>-1;i--){
                    if(heros[arr[i]].zhongzu != zhongzu){
                        arr.splice(i, 1);
                    }
                }
            }

            // list.sort(function (a, b) {
            //     var abnum = list[a],
            //         bbnum = list[b];
            //     if (abnum > 0 && bbnum > 0){
            //         return a - b;
            //     }else if (abnum > bbnum){
            //         return a - b;
            //     }else{
            //         return b - a;
            //     }
            // });

            return arr;
        },
        getFilterHeros: function(need, tid){
            var heros = G.DATA.yingxiong.list;
            var armyInfo = heros[tid];
            var keys = X.keysOfObject(heros);
            var result = [];

            for(var i=0;i<keys.length;i++){
                if(keys[i] == tid) continue; // 排除自己
                var d = heros[keys[i]];

                // 同种族
                if(need.samezhongzu && d.zhongzu != armyInfo.zhongzu){
                    continue;
                }

                // 同星级
                if(need.star && d.star != armyInfo.star){
                    continue;
                }

                // 同hid
                if(need.xshero && d.hid != armyInfo.hid){
                    continue;
                }

                result.push(keys[i]);
            }
            return result;
        },
        updateInfo: function (data, callback) {
            var me = this;

            // if(!data){
            //     G.frame.budui.emit('update_armydetails');
            //     return;
            // }

            if (G.frame.yingxiong.isShow) {
                me.getData(data, function(){
                    callback && callback();
                    G.frame.yingxiong.refreshPanel();
                    G.frame.yingxiong.emit('updateInfo');
                });
            }
        },
        //获得英雄数据，forceConf=true时整合配置数据
        getHeroDataByTid: function (tid, forceConf) {
            var me = this;

            var data = G.DATA.yingxiong.list[tid];
            if (forceConf) {
                var conf = G.class.hero.getById(data.hid);
                cc.mixin(data,conf,true);
            }

            return data;
        },
        //获得锁定的英雄信息
        getLockHeros: function () {
            var me = this;


            return G.DATA.yingxiong.jjchero || [];
        },
        // 英雄数量
        checkHeroNum: function () {
            var me = this;

            var data = G.DATA.yingxiong.list;
            var obj = {},
                zzObj = {},
                zzStarObj = {},
                starObj = {};
            for (var tid in data) {
                var heroData = data[tid];
                //hid对应数量
                obj[heroData.hid] = obj[heroData.hid] || 0;
                obj[heroData.hid]++;
                //种族对应数量
                zzObj[heroData.zhongzu] = zzObj[heroData.zhongzu] || 0;
                zzObj[heroData.zhongzu]++;
                //种族星级对应的数量
                zzStarObj[heroData.zhongzu] = zzStarObj[heroData.zhongzu] || {};
                zzStarObj[heroData.zhongzu][heroData.star] = zzStarObj[heroData.zhongzu][heroData.star] || 0;
                zzStarObj[heroData.zhongzu][heroData.star]++;
                //星级对应的数量
                starObj[heroData.star] = starObj[heroData.star] || 0;
                starObj[heroData.star]++;
            }

            G.DATA.yingxiong.hid2num = obj;
            G.DATA.yingxiong.zz2num = zzObj;
            G.DATA.yingxiong.zzStar2num = zzStarObj;
            G.DATA.yingxiong.star2num = starObj;
        },
        //hid对应的英雄数量
        getHeroNumByHid: function (hid) {
            var me = this;

            var data = G.DATA.yingxiong.hid2num;

            return data[hid] || 0;
        },
        //种族对应的英雄数量
        getHeroNumByZhongzu: function (zz) {
            var me = this;

            var data = G.DATA.yingxiong.zz2num;

            return data[zz] || 0;
        },
        //种族和星级对应的英雄数量
        getHeroNumByZzAndStar: function (zz, star) {
            var me = this;

            var data = G.DATA.yingxiong.zzStar2num;

            return data[zz] ? (data[zz][star] || 0) : 0;
        },
        //星级对应的英雄数量
        getHeroNumByStar: function (star, need) {
            var me = this;

            var data = X.clone(G.DATA.yingxiong.star2num);

            if(need){
                for(var i in data){
                    if(i == need.star){
                        data[i] -= 1;
                        break;
                    }
                }
            }

            return data[star] || 0;
        }

    };
    
    for (var key in _fun) {
        G.frame.yingxiong[key] = _fun[key];
    }
})();