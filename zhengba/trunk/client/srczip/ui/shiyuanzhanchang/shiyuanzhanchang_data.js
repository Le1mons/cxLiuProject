(function () {
    G.DAO.shiyuanzhanchang = {
        getServerData: function (callback, ui) {
            var me = this;
            ui.ajax("syzc_open", [], function (str, data) {
                if (data.s == 1) {
                    G.DATA.shiyuanzhanchang = data.d.mydata;
                    callback && callback(data.d);
                }else if (data.s == -2){
                    //说明是需要布阵
                    G.DATA.shiyuanzhanchang = data.d;
                    callback && callback(data.d);
                }
            });
        },
        start:function(troop,layer,callback, ui){
            ui = ui || G.frame.shiyuanzhanchang_floor;
            ui.ajax("syzc_start", [troop,layer], function (str, data) {
                if (data.s == 1) {
                    G.DATA.shiyuanzhanchang = data.d.mydata;
                    callback && callback(data.d);
                }
            });
        },
        join: function (id, callback, ui) {
            var me = this;

            ui.ajax("sshl_join", [id], function (str, data) {
                if (data.s == 1) {
                    changeData(data.d, G.DATA.shiyuanzhanchang, false);
                    callback && callback(data.d);
                }
            });
        },
        walk: function (standIdx,callback, errorback, ui) {
            var me = this;
            ui = ui || G.frame.shiyuanzhanchang_floor;
            // 1当前站的格子, 2点击的事件格子, 3足迹
            var footMark = G.frame.shiyuanzhanchang_map.myRole.getFootMark();
            var param = [standIdx,footMark];
            ui.ajax("syzc_chess", param, function (str, data) {
                if (data.s == 1) {
                    G.DATA.shiyuanzhanchang = data.d.mydata;
                    G.frame.shiyuanzhanchang_map.myRole._footmark = {};
                    if (G.frame.shiyuanzhanchang_map.myRole.eventFootArr.length>0 && standIdx != G.frame.shiyuanzhanchang_map.getYbhZDID()){
                        if (!X.inArray(G.frame.shiyuanzhanchang_map.getYbhGzid(),standIdx)){
                            G.tip_NB.show(L('syzc_21'));
                            G.frame.shiyuanzhanchang_map.clearAllYbhInfo();
                            G.frame.shiyuanzhanchang_map.myRole.moveTofuhuodian();
                            delete G.frame.shiyuanzhanchang_map.myRole.data.moveTargetGrid;
                        }else if (X.inArray(G.frame.shiyuanzhanchang_map.myRole.eventFootArr,standIdx)) {
                                //说明这个格子已经走过了； 传送回出生点
                            G.tip_NB.show(L('syzc_21'));
                            G.frame.shiyuanzhanchang_map.clearAllYbhInfo();
                            G.frame.shiyuanzhanchang_map.myRole.moveTofuhuodian();
                            delete G.frame.shiyuanzhanchang_map.myRole.data.moveTargetGrid;
                        }else {
                            callback && callback(data.d.mydata);
                        }
                    }else {
                        callback && callback(data.d.mydata);
                    }
                } else {
                    errorback && errorback(data.s);
                }
            });
        },
        event: function (standIdx,isfq,event,callback, errorback, ui) {
            var me = this;
            ui = ui || G.frame.shiyuanzhanchang_floor;
            // 1点击的事件格子, 2是否放弃, 3事件
            var param = [standIdx,isfq,event];
            ui.ajax("syzc_event", param, function (str, data) {
                if (data.s == 1) {
                    G.DATA.shiyuanzhanchang = data.d.mydata;
                    callback && callback(data.d);
                } else {
                    errorback && errorback(data.s);
                }
            });
        },
        pass: function (code,callback, errorback,ui) {
            var me = this;
            ui = ui || G.frame.shiyuanzhanchang_floor;

            ui.ajax("syzc_pass", [code], function (str, data) {
                if (data.s == 1) {
                    G.DATA.shiyuanzhanchang = data.d.mydata;
                    callback && callback(data.d);
                }else {
                    errorback && errorback(data.s);
                }
            });
        },
        fog: function (flg, callback, ui) {
            var me = this;
            ui = ui || G.frame.shiyuanzhanchang_floor;

            ui.ajax("sshl_fog", [flg], function (str, data) {
                if (data.s == 1) {
                    callback && callback(data.d);
                }
            });
        },



        chapterIsOver: function (mapid) {
            var me = this;
            var prize1 = G.DAO.shiyuanzhanchang.getPrizeNum(mapid, 1);
            var prize2 = G.DAO.shiyuanzhanchang.getPrizeNum(mapid, 2);

            return prize1.nval == prize1.pval && prize2.nval == prize2.pval;
        },
        getPrizeNum: function (mapid, type) {
            var me = this;
            var conf = G.gc['jqmap' + mapid];
            var mapdata = G.DATA.shiyuanzhanchang.info.mapdata || {};
            var get = 0;
            var sum = 0;

            X.forEachObject(conf, function (k, v) {
                if (v.jdtj == type) {
                    sum += 1;
                    if (mapdata[v.id]) {
                        get += 1;
                    }
                }
            });
            return {
                nval: get,
                pval: sum
            };
        },
        getMapData: function (id) {
            var mapdata = {};
            if (G.DATA.shiyuanzhanchang.info && G.DATA.shiyuanzhanchang.info.mapdata) {
                mapdata = G.DATA.shiyuanzhanchang.info.mapdata;
            }
            return mapdata[id];
        },
        isHelper: function (tid) {
            if (G.DATA.shiyuanzhanchang.heros) {
                return X.arrayFind(G.DATA.shiyuanzhanchang.heros, tid, 'tid') > -1;
            }
            return false;
        },
        getHeroData: function (tid) {
            var me = this;

            var heroData;
            if (me.isHelper(tid)) {
                var hireHeros = G.DATA.shiyuanzhanchang.heros ? G.DATA.shiyuanzhanchang.heros : [];

                for (var i = 0; i < hireHeros.length; i++) {
                    if (hireHeros[i].tid == tid) {
                        heroData = hireHeros[i];
                        break;
                    }
                }
                heroData = JSON.parse(JSON.stringify(heroData));
                var conf = G.class.hero.getById(heroData.hid);
                cc.mixin(heroData, conf, true);
            } else {
                heroData = G.frame.yingxiong.getHeroDataByTid(tid);
            }
            if (!X.isHavItem(heroData)) return null;
            var data = G.DATA.shiyuanzhanchang.fightdata ? G.DATA.shiyuanzhanchang.fightdata[tid] : null;
            if (data) {
                heroData.hp = data.hp * 100; // 百分比
                heroData.nuqi = data.nuqi * 100; // 百分比
            } else {
                heroData.hp = 100; // 百分比
                heroData.nuqi = 0; // 百分比
            }
            return heroData;
        },
        getHelperArr: function (helper, zhongzu) {
            var me = this;
            if (!cc.isArray(helper) || helper.length == 0) return [];

            if (!zhongzu || zhongzu == '0') {
                return helper;
            }

            var result = [];
            for (var i = 0; i < helper.length; i++) {
                if (helper[i].race == zhongzu) {
                    result.push(helper[i]);
                }
            }
            return result;
        },
        getHeros: function () {
            var result = [];

            var my = G.DATA.yingxiong.list;
            var myKeys = X.keysOfObject(my);

            for (var i = 0; i < myKeys.length; i++) {
                result.push(my[myKeys[i]]);
            }
            result = result.concat(G.DATA.shiyuanzhanchang.heros);
            result.sort(function (a, b) {
                if (a.star != b.star) { //星级
                    return a.star > b.star ? -1 : 1;
                } else if (a.lv != b.lv) { //等级
                    return a.lv > b.lv ? -1 : 1;
                } else if (a.zhanli != b.zhanli) { //战力
                    return a.zhanli > b.zhanli ? -1 : 1;
                } else if (a.hid != b.hid) { //hid
                    return a.hid * 1 > b.hid ? -1 : 1;
                }
            });

            return result;
        },

        getCache: function () {
            var me = this;
            var cache = X.cacheByUid('plotCache');

            if (!X.isHavItem(cache)) {
                cache = {};
                X.cacheByUid('plotCache', cache);
            }
            return cache;
        },

        setChapterCache: function (chapter, val) {
            var me = this;
            var chapterCache = me.getChapterCache(chapter);
            var cache = me.getCache();
            chapterCache[val] = 1;
            cache[chapter] = chapterCache;

            X.cacheByUid('plotCache', cache);
        },

        getChapterCache: function (chapter) {
            var me = this;
            var cache = me.getCache();

            if (!X.isHavItem(cache[chapter])) {
                cache[chapter] = {};
                X.cacheByUid('plotCache', cache);
            }
            return cache[chapter];
        },

        clearCache: function (chapter) {
            var me = this;
            var cache = me.getCache();
            cache[chapter] = {};
            X.cacheByUid('plotCache', cache);
        },
    };
})();