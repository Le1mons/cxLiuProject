(function () {
    
    var _fun = {
        getData : function(callback){
            var me = this;

            G.ajax.send('hero_getlist',[],function(d){
                var data = JSON.parse(d);
                if (data.s === 1) {
                    G.DATA.yingxiong = data.d;
                    G.DATA.skin = {};
                    G.DATA.skin.list = data.d.skin;
                    for (var tid in G.DATA.skin.list) {
                        G.DATA.skin.list[tid].tid = tid;
                    }
                    me.checkHeroNum();
                    X.checkSkinDueTime();
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
        getSkin: function (callback) {
            var me = this;

            callback && callback();
        },
        getSkinActiveNum: function (skinId) {
            var soleSkin = {};
            var perpetualSkin = {};
            var data = G.DATA.skin.list;

            for (var i in data) {
                if (!soleSkin[data[i].id]) soleSkin[data[i].id] = 1;
                else soleSkin[data[i].id] ++;

                if (!perpetualSkin[data[i].id] && data[i].expire < 0) perpetualSkin[data[i].id] = 1;
                else if (data[i].expire < 0) perpetualSkin[data[i].id] ++;
            }

            if (skinId) {
                if (cc.isArray(skinId)) {
                    for (var index = 0; index < skinId.length; index ++) {
                        if (soleSkin[skinId[index]]) return soleSkin[skinId[index]];
                    }
                    return 0;
                } else {
                    return soleSkin[skinId] || 0;
                }
            }
            else return Object.keys(perpetualSkin).length;
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

            G.DATA.maxPowerHero = [];
            G.DATA.maxPowerHeroZZ = [];
            G.DATA.maxPowerHeroHid = [];
            G.DATA.heroHidNum = {};
            G.DATA.heroRaceStarNum = {};
            var data = G.DATA.yingxiong.list;
            var obj = {},
                zzObj = {},
                zzStarObj = {},
                starObj = {};
                arr = [];
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
                arr.push(heroData);

                var heroConf = G.gc.hero[heroData.hid];
                if (!G.DATA.heroHidNum[heroConf.hid]) G.DATA.heroHidNum[heroConf.hid] = [];
                G.DATA.heroHidNum[heroConf.hid].push(tid);
                if (!G.DATA.heroRaceStarNum[heroConf.zhongzu + "_" + heroConf.star]) {
                    G.DATA.heroRaceStarNum[heroConf.zhongzu + "_" + heroConf.star] = [];
                }
                G.DATA.heroRaceStarNum[heroConf.zhongzu + "_" + heroConf.star].push(tid);
                arr.push(heroData);
            }
            arr.sort(function (a, b) {
                return a.zhanli > b.zhanli ? -1 : 1;
            });
            for (var index = 0; index < 6; index ++) {
                arr[index] && G.DATA.maxPowerHero.push(arr[index].tid);
                arr[index] && G.DATA.maxPowerHeroZZ.push(arr[index].zhongzu);
                arr[index] && G.DATA.maxPowerHeroHid.push(arr[index].hid);
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
            if (cc.isArray(zz)) {
                var num = 0;
                cc.each(zz, function (race) {
                    num += data[race] ? (data[race][star] || 0) : 0;
                });
                return num;
            } else {
                return data[zz] ? (data[zz][star] || 0) : 0;
            }
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
        },
        getHeroRed: function () {
            var me = this;

            if(P.gud.lv >= 40) G.DATA.heroPoint = {};

            for (var i in G.DATA.heroPoint) {
                G.DATA.heroPoint[i] = me.countRed(i);
            }

            var isHave = false;
            for (var i in G.DATA.heroPoint) {
                if(G.DATA.heroPoint[i]) {
                    isHave = true;
                    break;
                }
            }

            return isHave;
        },
        countRed: function (tid) {
            var me = this;

            if(me.countUpLv(tid) || me.countEquip(tid)) return 1;
            else return 0;
        },
        countUpLv: function (tid) {
            var isHave = false;
            var data = G.frame.yingxiong.getHeroDataByTid(tid);
            if(!data) return false;

            if(data.lv == G.class.herocom.getMaxlv(data.hid, data.dengjielv)) {
                if(data.dengjielv < data.star) {
                    var need = G.class.herocom.getHeroJinJieUp(data.dengjielv) && G.class.herocom.getHeroJinJieUp(data.dengjielv).need;
                    if(need) {
                        if(G.class.getOwnNum(need[0].t, need[0].a) >= need[0].n && G.class.getOwnNum(need[1].t, need[1].a) >= need[1].n) {
                            isHave = true;
                        }
                    }
                }
            } else {
                var need = G.class.herocom.getHeroLvUp(data.lv);
                if(need) {
                    if(P.gud.useexp >= need.maxexp && P.gud.jinbi >= need.need[0].n) isHave = true;
                }
            }

            return isHave;
        },
        countEquip: function (tid) {
            var isHave = false;
            var heroData = G.frame.yingxiong.getHeroDataByTid(tid);
            if(!heroData) return false;

            for(var i = 1; i < 6; i ++) {
                var comData = [];
                var data = i == 5 ? G.frame.beibao.DATA.shipin.list : G.frame.zhuangbei.getCanUseZbTidArrByType(i);
                if(!cc.isArray(data)){
                    var keys = X.keysOfObject(data);
                    for(var j = 0; j < keys.length; j ++){
                        comData.push(data[keys[j]]);
                    }
                }else{
                    for(var k = 0; k < data.length; k ++){
                        comData.push(G.frame.beibao.DATA.zhuangbei.list[data[k]]);
                    }
                }
                if(heroData.weardata && heroData.weardata[i]){
                    var myConf = i == "5" ? G.class.shipin.getById(heroData.weardata[i]) : G.class.equip.getById(heroData.weardata[i]);
                    for(var l = 0; l < comData.length; l ++){
                        if(comData[l].color > myConf.color || (comData[l].color == myConf.color && comData[l].star > myConf.star)){
                            isHave = true;
                            break;
                        }
                    }
                }
                if(isHave == false && (!heroData.weardata || !heroData.weardata[i])) {
                    if(comData.length > 0 ) {
                        isHave = true;
                        break;
                    }
                }
            }

            return isHave;
        },
        getStar2Num: function (star) {
            return G.DATA.asyncBtnsData.herotask ? G.DATA.asyncBtnsData.herotask[star] || 0 : 0;
        }
    };
    
    for (var key in _fun) {
        G.frame.yingxiong[key] = _fun[key];
    }
})();