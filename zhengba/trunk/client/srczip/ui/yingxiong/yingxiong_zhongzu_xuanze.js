/**
 * Created by wfq on 2018/6/5.
 */
(function () {
    //英雄-种族-选择
    G.class.yingxiong_zhongzu_xuanze = X.bView.extend({
        extConf: {
            fight: {
                data: function (type) {
                    if (G.frame.yingxiong_fight.xuanze.fightData.pvType && G.frame.yingxiong_fight.xuanze.fightData.pvType.indexOf("sznfight") != -1) {
                        var allHero = G.frame.yingxiong_fight.xuanze.allHero;
                        var _arr = [];
                        if (type == 0) {
                            allHero.forEach(function name(item, idx) {
                                _arr.push(item.tid)
                            })

                        } else {
                            allHero.forEach(function name(item, idx) {
                                if (G.gc.hero[item.hid].zhongzu == type) {
                                    _arr.push(item.tid)
                                }
                            })
                        }
                        return _arr

                    }
                    var data = G.frame.yingxiong_fight.xuanze.heroList;
                    var keys = X.keysOfObject(data);
                    if (X.inArray(G.class.yingxiong_kaizhan.prototype.extConf.showHelp, G.frame.yingxiong_fight.DATA.pvType)) {
                        var _tids = [];
                        if (G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp) {
                            cc.each(keys, function (tid) {
                                if (!G.DATA.yingxiong.list[tid]) {
                                    _tids.push(tid);
                                }
                            });
                        } else {
                            cc.each(keys, function (tid) {
                                if (G.DATA.yingxiong.list[tid]) {
                                    _tids.push(tid);
                                }
                            });
                        }
                        keys = _tids;
                    }

                    var arr = [];
                    if (type == 0) {
                        arr = keys;
                        if (G.frame.yingxiong_fight.data().pvType == "pvshizijun") {
                            var arr1 = [];
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.lv > 39) {
                                    arr1.push(tid);
                                }
                            }
                            arr = arr1;
                        }
                        if (G.frame.yingxiong_fight.data().pvType == "fbzc") {
                            var arr2 = [];
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.lv >= 60) {
                                    arr2.push(tid);
                                }
                            }
                            arr = arr2;
                        }
                        if (G.frame.yingxiong_fight.data().pvType == "pvmaze") {
                            var arr2 = [];
                            var allHero = G.frame.maze.DATA.hero;
                            for (var i in allHero) {
                                arr2.push(allHero[i].tid);
                            }
                            arr = arr2;
                        }
                        if (X.inArray(['wjzz_def', 'pvwjzz'], G.frame.yingxiong_fight.DATA.pvType)) {
                            var arr2 = [];
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.star >= 8) {
                                    arr2.push(tid);
                                }
                            }
                            arr = arr2;
                        }
                    } else {
                        if (G.frame.yingxiong_fight.data().pvType == "pvshizijun") {
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type && heroData.lv > 39) {
                                    arr.push(tid);
                                }
                            }
                        } else if (G.frame.yingxiong_fight.data().pvType == "fbzc") {
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type && heroData.lv >= 60) {
                                    arr.push(tid);
                                }
                            }
                        } else if (G.frame.yingxiong_fight.data().pvType == "pvmaze") {
                            var arr2 = [];
                            var allHero = G.frame.maze.DATA.hero;
                            for (var i in allHero) {
                                if (G.gc.hero[allHero[i].hid].zhongzu == type) arr2.push(allHero[i].tid);
                            }
                            arr = arr2;
                        } else if (X.inArray(['wjzz_def', 'pvwjzz'], G.frame.yingxiong_fight.DATA.pvType)) {
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type && heroData.star >= 8) {
                                    arr.push(tid);
                                }
                            }
                        } else {
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type) {
                                    arr.push(tid);
                                }
                            }
                        }

                    }

                    if (G.frame.yingxiong_fight.data().zz) {
                        var zzArr = [];
                        for (var i in arr) {
                            if (X.inArray(G.frame.yingxiong_fight.data().zz, G.frame.yingxiong_fight.xuanze.heroList[arr[i]].zhongzu)) {
                                zzArr.push(arr[i]);
                            }
                        }
                        arr = zzArr;
                    }

                    return arr;
                },
                getSort: function (arr) {
                    var heroData = [];
                    var hidData = [];
                    var type = G.frame.yingxiong_fight.data().pvType;
                    if (type && type.indexOf("sznfight") != -1) return arr
                    var zz = {
                        5: 1, //神圣
                        6: 0, //暗影
                        4: 2, //自然
                        3: 4, //邪能
                        2: 5, //奥术
                        1: 6, //亡灵
                        7: 7 //亡灵
                    };
                    for (var i = 0; i < arr.length; i++) {
                        heroData.push(G.frame.yingxiong_fight.xuanze.heroList[arr[i]]);
                    }

                    if (type == "fbzc") {
                        var data = G.frame.fengbaozhanchang.DATA.fightdata;
                        for (var i in heroData) {
                            heroData[i].fyz = X.inArray(data, heroData[i].tid);
                        }
                        heroData.sort(function (a, b) {
                            if (a.fyz != b.fyz) {
                                return a.fyz < b.fyz ? -1 : 1;
                            } else if (a.star != b.star) {
                                return a.star > b.star ? -1 : 1;
                            } else if (a.lv != b.lv) {
                                return a.lv > b.lv ? -1 : 1;
                            } else if (a.zhongzu != b.zhongzu) {
                                return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                            } else if (a.hid != b.hid) {
                                return a.hid * 1 > b.hid ? -1 : 1;
                            } else {
                                return a.zhanli > b.zhanli ? -1 : 1;
                            }
                        });
                    } else if (type == "pvmaze") {
                        heroData = [];
                        var allHero = G.frame.maze.DATA.hero;
                        var status = G.frame.maze.DATA.data.status || {};

                        for (var i = 0; i < arr.length; i++) {
                            var tid = arr[i];
                            for (var j = 0; j < allHero.length; j++) {
                                if (allHero[j].tid == tid) {
                                    allHero[j].yzw = (status[tid] && status[tid].hp != undefined && status[tid].hp <= 0) ? 1 : 0;
                                    heroData.push(allHero[j]);
                                    break;
                                }
                            }
                        }

                        heroData.sort(function (a, b) {
                            if (a.yzw != b.yzw) {
                                return a.yzw < b.yzw ? -1 : 1;
                            } else if (a.star != b.star) {
                                return a.star > b.star ? -1 : 1;
                            } else if (a.lv != b.lv) {
                                return a.lv > b.lv ? -1 : 1;
                            } else if (G.gc.hero[a.hid].zhongzu != G.gc.hero[b.hid].zhongzu) {
                                return zz[G.gc.hero[a.hid].zhongzu] < zz[G.gc.hero[b.hid].zhongzu] ? -1 : 1;
                            } else {
                                return a.hid * 1 > b.hid ? -1 : 1;
                            }
                        });

                    } else if (type == "wjzz_def") {
                        var that = G.frame.yingxiong_fight.bottom;
                        for (var i in heroData) {
                            heroData[i].fyz = false;
                        }
                        heroData.sort(function (a, b) {
                            var isOtherA = that.getIsOther(a.tid);
                            var isOtherB = that.getIsOther(b.tid);
                            if (isOtherA != isOtherB) {
                                return isOtherA < isOtherB ? -1 : 1;
                            } else if (a.star != b.star) {
                                return a.star > b.star ? -1 : 1;
                            } else if (a.lv != b.lv) {
                                return a.lv > b.lv ? -1 : 1;
                            } else if (a.zhongzu != b.zhongzu) {
                                return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                            } else if (a.hid != b.hid) {
                                return a.hid * 1 > b.hid ? -1 : 1;
                            } else {
                                return a.zhanli > b.zhanli ? -1 : 1;
                            }
                        });
                    } else if (type == "pvwjzz") {
                        for (var i in heroData) {
                            heroData[i].fyz = false;
                        }
                        var status = G.frame.wujunzhizhan.DATA.status;
                        var pilao = G.frame.wujunzhizhan.DATA.pilao;
                        heroData.sort(function (a, b) {
                            var isDieA = status[a.tid] && status[a.tid].hp <= 0 ? true : false;
                            var isDieB = status[b.tid] && status[b.tid].hp <= 0 ? true : false;
                            var isPlA = pilao[a.tid] && pilao[a.tid] >= 5 ? true : false;
                            var isPlB = pilao[b.tid] && pilao[b.tid] >= 5 ? true : false;
                            if (isDieA != isDieB) {
                                return isDieA < isDieB ? -1 : 1;
                            } else if (isPlA != isPlB) {
                                return isPlA < isPlB ? -1 : 1;
                            } else if (a.star != b.star) {
                                return a.star > b.star ? -1 : 1;
                            } else if (a.lv != b.lv) {
                                return a.lv > b.lv ? -1 : 1;
                            } else if (a.zhongzu != b.zhongzu) {
                                return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                            } else if (a.hid != b.hid) {
                                return a.hid * 1 > b.hid ? -1 : 1;
                            } else {
                                return a.zhanli > b.zhanli ? -1 : 1;
                            }
                        });
                    } else {
                        for (var i in heroData) {
                            heroData[i].fyz = false;
                        }
                        heroData.sort(function (a, b) {
                            if (a.star != b.star) {
                                return a.star > b.star ? -1 : 1;
                            } else if (a.lv != b.lv) {
                                return a.lv > b.lv ? -1 : 1;
                            } else if (a.zhongzu != b.zhongzu) {
                                return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                            } else if (a.hid != b.hid) {
                                return a.hid * 1 > b.hid ? -1 : 1;
                            } else {
                                return a.zhanli > b.zhanli ? -1 : 1;
                            }
                        });
                    }

                    for (var i = 0; i < heroData.length; i++) {
                        hidData.push(heroData[i].tid);
                    }
                    if (type && type.indexOf("slzt") > -1) {
                        var arr = G.frame.yingxiong_fight.data().norepeat;
                        hidData.sort(function (a, b) {
                            return X.inArray(arr, a) - X.inArray(arr, b)
                        })
                    }
                    return hidData;
                }
            }
        },

        ctor: function (type) {
            var me = this;
            me._type = type;
            me._data = G.frame.yingxiong_fight.DATA;
            G.frame.yingxiong_fight.xuanze = me;
            me._super('ui_tip3_shang.json');
        },
        getIsOther: function (tid) {
            var me = this;
            var curIndex = me._data.index;
            var curQueue = me.getQueue(tid);

            return curQueue == null ? false : curQueue != curIndex;
        },
        getQueue: function (tid) {
            var me = this;
            var allDef = me._data.allDef;

            for (var index = 0; index < allDef.length; index++) {
                var obj = allDef[index];
                var idArr = [];
                for (var key in obj) idArr.push(obj[key]);
                if (X.inArray(idArr, tid)) return index;
            }
            return null;
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.fightData = G.frame.yingxiong_fight.data();
            me.heroList = JSON.parse(JSON.stringify(G.DATA.yingxiong.list));
            if (me.fightData.heroList) me.heroList = me.fightData.heroList;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;


            if (me.fightData.pvType == "pvshizijun") {
                me.status = G.frame.shizijunyuanzheng.DATA.status;
                me.inStatus = X.keysOfObject(me.status);
            }
            if (me.fightData.pvType == "pvmaze") {
                me.status = G.frame.maze.DATA.data.status || {};
                me.inStatus = X.keysOfObject(me.status);
                me.allHero = G.frame.maze.DATA.hero;
            }
            if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {
                me.allHero = G.class.szn.getHeroData(G.frame.yingxiong_fight.xuanze.fightData.data.hero);
            }
            if (me.fightData.pvType == 'pvwjzz') {
                me.status = G.frame.wujunzhizhan.DATA.status || {};
                me.inStatus = X.keysOfObject(me.status);
            }
            me.createMenu();
            me.refreshPanel();
            if (me.fightData.zz) {
                me.nodes.listview_zz.hide();
            }
        },
        getPl: function (tid) {
            if (this.fightData.pvType != 'pvwjzz') return 0;
            var data = G.frame.wujunzhizhan.DATA.pilao;
            return data[tid] || 0;
        },
        getHeroData: function (tid) {
            var me = this;

            for (var i = 0; i < me.allHero.length; i++) {
                if (me.allHero[i].tid == tid) return me.allHero[i];
            }

            return false;
        },
        getHeroData2: function (tid) {
            var me = this;

            for (var i = 0; i < me.allHero.length; i++) {
                if (me.allHero[i].tid == tid) return me.allHero[i];
            }

            return false;
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var cacheArr = [];
            var cache = {};
            var type = me.fightData.pvType || me.fightData.type;
            if (me.fightData.defhero) {
                cache = me.fightData.defhero;
            } else {
                //战斗站位缓存
                switch (type) {
                    case "pvshizijun":
                        cache = X.cacheByUid("fight_shizijun");
                        break;
                    case "jjckz":
                        cache = X.cacheByUid("fight_zyjjc");
                        break;
                    case "hypk":
                        cache = X.cacheByUid("fight_hypk");
                        break;
                    case "hybs":
                        cache = X.cacheByUid("fight_hybs");
                        break;
                    case "ghfb":
                        cache = X.cacheByUid("fight_ghfb");
                        break;
                    case "pvdafashita":
                        cache = X.cacheByUid("fight_fashita");
                        break;
                    case "pvguanqia":
                        cache = X.cacheByUid("fight_tanxian");
                        break;
                    case "pvywzbjf":
                        cache = X.cacheByUid("fight_ywzbjf");
                        break;
                    case "pvywzbjfsd":
                        cache = X.cacheByUid("fight_ywzbjf");
                        break;
                    case "pvywzbzb":
                        cache = X.cacheByUid("fight_ywzbzb");
                        break;
                    case "pvghz":
                        cache = X.cacheByUid("fight_pvghz");
                        break;
                    case "pvmw":
                        cache = X.cacheByUid("fight_pvmw");
                        break;
                    case "pvghtf":
                        cache = X.cacheByUid("fight_pvghtf");
                        break;
                    case "sddl":
                        cache = X.cacheByUid("sddl_" + me.fightData.idx);
                        break;
                    case "fbzc":
                        cache = {};
                        break;
                    case "fight_demo":
                        cache = X.cacheByUid("fight_demo");
                        break;
                    case "pvmaze":
                        cache = X.cacheByUid("pvmaze");
                        break;
                    case "lqsl":
                        cache = X.cacheByUid("lqsl");
                        break;
                    case "xkfb":
                        cache = X.cacheByUid("xkfb");
                        break;
                    case "wjzz_def":
                        cache = me._data.def;
                        break;
                    case "syzlb":
                        cache = X.cacheByUid("syzlb");
                        break;
                    case "pvwjzz":
                        cache = X.cacheByUid("pvwjzz");
                        break;
                    case "wztt_one":
                        cache = X.cacheByUid("wztt_one");
                        break;
                    default:
                        cache = X.cacheByUid('fight_ready');
                        break;
                    case "wangzhezhaomu":
                        cache = X.cacheByUid("wangzhezhaomu");
                        break;
                    case "alaxi":
                        cache = X.cacheByUid("alaxi");
                        break;
                    case "alaxi_sd":
                        cache = X.cacheByUid("alaxi_sd");
                        break;
                    case "newyear_xrtz":
                        cache = X.cacheByUid("newyear_xrtz");
                        break;
                    case "wyhd":
                        cache = X.cacheByUid("wyhd");
                        break;
                    case "lht":
                        cache = X.cacheByUid("lht");
                        break;

                    case "slzt1":
                        cache = X.cacheByUid("slzt1");
                        break;
                    case "slzt2":
                        cache = X.cacheByUid("slzt2");
                        break;
                    case "slzt3":
                        cache = X.cacheByUid("slzt3");
                        break;
                    case "slzt4":
                        cache = X.cacheByUid("slzt4");
                        break;
                    case "slzt5":
                        cache = X.cacheByUid("slzt5");
                        break;
                    case "slzt6":
                        cache = X.cacheByUid("slzt6");
                        break;
                    case "shilianfight":
                        cache = X.cacheByUid("shilianfight");
                        break;
                }
            }
            if (((cache && X.keysOfObject(cache).length < 1) || !cache) &&
                !X.inArray(["shilianfight","pvguanqia", "fbzc", "pvshizijun", "sddl", "pvmaze", 'lqsl', 'pvwjzz', "wztt_one", 'wyhd',
                    'lht', "slzt1", "slzt2", "slzt3", "slzt4", "slzt5", "slzt6", "zsnfight"], type) && type && type.indexOf("sznfight") == -1) {
                cache = X.cacheByUid("fight_tanxian") || {};
            }
            if (type && type.indexOf("sznfight") != -1) {
                cache = X.cacheByUid(type) || {}
            }
            if (cache) {
                if (me.fightData.pvType == "pvshizijun") {
                    for (var id in cache) {
                        var tid = cache[id];
                        if (((me.status[tid] && me.status[tid].hp > 0) || !me.status[tid]) && me.heroList[tid] && me.heroList[tid].lv >= 40) {
                            cacheArr.push(tid);
                        }
                    }
                } else if (me.fightData.pvType == "pvmaze") {
                    for (var id in cache) {
                        var tid = cache[id];
                        if (me.status[tid] && me.status[tid].hp <= 0) {

                        } else {
                            if (me.getHeroData(tid)) cacheArr.push(tid);
                        }
                    }
                } else if (type && type.indexOf("sznfight") != -1) {
                    for (var id in cache) {

                        if (me.getHeroData2(cache[id])) cacheArr.push(cache[id]);

                    }
                } else if (me.fightData.pvType == "pvwjzz") {
                    for (var id in cache) {
                        var tid = cache[id];
                        if (((me.status[tid] && me.status[tid].hp > 0) || !me.status[tid]) && me.heroList[tid] && me.getPl(tid) < 5) {
                            cacheArr.push(tid);
                        }
                    }
                } else {
                    for (var id in cache) {
                        var tid = cache[id];
                        if (me.heroList[tid]) {
                            cacheArr.push(tid);
                        }
                    }
                }

            }
            me._cache = cache;
            me.selectedData = cacheArr;

            var index = me.curType || 0;
            me._menus[index].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        createMenu: function () {
            var me = this;

            var view = me;
            me._menus = [];
            var listview = view.nodes.listview_zz;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            view.nodes.list_ico.hide();

            //图标中，1指的是全部
            for (var i = 0; i < 8; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                if (i==7){
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                }

                list_ico.nodes.panel_zz.setScale(0.8);
                list_ico.show();

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function (sender, type) {
                    for (var j = 0; j < me._menus.length; j++) {
                        var node = me._menus[j];
                        if (node.data == 7){
                           var img = 'img/public/ico/ico_zz11.png';
                        } else {
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        }
                        if (node.data == sender.data) {
                            if (me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            if (node.data == 7){
                                img = 'img/public/ico/ico_zz11_g.png';
                            } else {
                                img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            }

                            if (sender.ani) {
                                sender.ani.show();
                            } else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;

                                    }
                                })
                            }
                        } else {
                            //node.nodes.img_yuan_xz.hide();
                            if (node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img, 1);
                    }
                    //sender.nodes.img_yuan_xz.show();
                });

                me._menus.push(list_ico);
                listview.pushBackCustomItem(list_ico);
                list_ico.show();
            }
        },
        fmtItemList: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            me.nodes.list.hide();

            var d = me.extConf[me._type].data(me.curType);

            if (d.length < 1) {
                me.ui.finds('img_zwnr').show();
                return;
            } else {
                me.ui.finds('img_zwnr').hide();
            }
            me._headUI = [];
            var listItemHeight = 1;
            if (X.inArray(["pvshizijun", "pvmaze", 'pvwjzz'], me.fightData.pvType)) {
                listItemHeight = 15;
            }
            if (G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp) {
                listItemHeight = 15;
            }
            var data = me.extConf[me._type].getSort(d, "star", "lv", "zhanli", "zhongzu", "hid");

            var table = me.table = new X.TableView(scrollview, me.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, listItemHeight, 5);
            table.setData(data);
            table.reloadDataWithScroll(true);
            //scrollview.getChildren()[0].getChildren()[0].setPositionX(1);
        },
        setItem: function (ui, data) {
            var me = this;

            //记录第一个头像，便于新手指导中直接指向
            if (me._headUI.length < 6) {
                me._headUI.push(ui);
            }

            X.autoInitUI(ui);
            var heroData;
            if (me.fightData.pvType == "pvmaze") {

                heroData = me.getHeroData(data);
            } else if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {

                heroData = me.getHeroData2(data);
            } else heroData = me.heroList[data];
            ui._tid = data;
            ui.setName(heroData.hid);

            var widget = G.class.shero(heroData, G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp, null, me.heroList[data] ? false : true);
            var hp = 100;
            var pl = false;
            if (G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp) {
                widget.title.setFontSize(20);
                widget.title.y = -18;
                widget.title.setString(me.getHelpNam(data));
                widget.title.setTextColor(cc.color('#ffffff'));
            }
            widget.setName('widget');
            widget.setAnchorPoint(0.5, 1);
            widget.setPosition(cc.p(ui.nodes.panel_ico.width * 0.5, ui.nodes.panel_ico.height));
            if (X.inArray(["pvshizijun", "pvmaze", 'pvwjzz'], me.fightData.pvType)) {
                widget.setScale(0.9);
                if (X.inArray(me.inStatus, data)) {
                    if (me.status[data].maxhp != undefined) {
                        hp = me.status[data].hp <= 0 ? 0 : me.status[data].hp / me.status[data].maxhp * 100;
                    } else {
                        hp = me.status[data].hp;
                    }
                    widget.setHP(hp, true);
                } else {
                    widget.setHP(hp, true);
                }
            } else {
                widget.setScale(0.9);
            }
            if (me.fightData.pvType == "pvwjzz") {
                pl = me.getPl(data) >= 5;
                widget.setNQ((5 - me.getPl(data)) / 5 * 100, true);
            }
            if (me.fightData.pvType == "wjzz_def") {
                var isOther = me.getIsOther(data);
                widget.setEnabled(!isOther);
                ui.isOther = isOther;
                ui.queue = me.getQueue(data);
                ui.nodes.img_suo.setVisible(isOther);
            }
            if (me.fightData.norepeat) {
                ui.nodes.img_suo.setVisible(X.inArray(me.fightData.norepeat, data) && !X.inArray(me.selectedData, ui._tid));
                ui.nodes.img_suo.setTouchEnabled(true);
            }
            ui.heroData = heroData;
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

            ui.nodes.panel_ico.setTouchEnabled(false);
            ui.nodes.panel_ico.show();

            // 任务中
            var imgRwz = ui.nodes.img_rwz;
            imgRwz.hide();

            var imgFsz = ui.nodes.img_fsz;
            if (heroData.fyz) imgFsz.show();
            else imgFsz.hide();

            ui.setTimeout(function () {
                if (X.inArray(me.selectedData, ui._tid)) {
                    var yuanjunImg = G.frame.yingxiong_fight.top.itemArr[6].data == ui._tid;
                    widget.setGou(true, yuanjunImg ? "img_yuan" : "");
                }
            }, 100);


            if (hp <= 0) {
                ui.nodes.img_yzw.show();
                ui.nodes.img_yzw.setScale(.9);
                ui.nodes.img_yzw.y += 4;
                widget.setEnabled(false);
            } else {
                if (pl) {
                    widget.setEnabled(false);
                }
                ui.nodes.img_yzw.hide();
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (G.frame.yingxiong_fight.isHelp && G.frame.yingxiong_fight.top.showHelp && G.frame.yingxiong_fight.DATA.borrownum <= 0) {
                        return G.tip_NB.show(L('lht_zjmax'));
                    }
                    G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition()));
                    if (sender.isOther) {
                        return G.tip_NB.show(X.STR(L("SZYXD"), sender.queue + 1));
                    }
                    if (sender.heroData.fyz) return G.tip_NB.show(L("YXFSZ"));

                    var plidarr = [];
                    for (var k=0;k<me.selectedData.length;k++){
                        if (G.DATA.yingxiong.list[me.selectedData[k]] && G.DATA.yingxiong.list[me.selectedData[k]].zhongzu==7){
                            plidarr.push(G.DATA.yingxiong.list[me.selectedData[k]].pinglunid);
                        }
                    }
                    var plid = G.DATA.yingxiong.list[sender.data]?G.DATA.yingxiong.list[sender.data].pinglunid:0;
                    if (X.inArray(plidarr,plid) && !X.inArray(me.selectedData, sender.data)){
                        return  G.tip_NB.show('传说种族同名英雄只可以上阵一个');
                    }
                    if (X.inArray(me.selectedData, sender.data)) {
                        G.frame.yingxiong_fight.posSelect.x += sender.width / 2;
                        sender.finds('widget').setGou(false);
                        me.selectedData.splice(X.arrayFind(me.selectedData, sender.data), 1);
                        G.frame.yingxiong_fight.top.removeItem(sender.data);
                    } else {
                        if (G.frame.yingxiong_fight.isHelp && G.frame.yingxiong_fight.top.showHelp) {
                            var helpTid;
                            for (var tid of me.selectedData) {
                                if (!G.DATA.yingxiong.list[tid]) {
                                    helpTid = tid;
                                    break;
                                }
                            }
                            if (helpTid) {
                                //me.selectedData.splice(X.arrayFind(me.selectedData,helpTid),1);
                                G.frame.yingxiong_fight.top.removeItem(helpTid, true);
                            }
                        }
                        if (hp <= 0) {
                            G.tip_NB.show(L("YX_YZW"));
                            return;
                        }
                        if (pl) return G.tip_NB.show(L("hero_pl"));
                        var num = 0;
                        var item = G.frame.yingxiong_fight.top.itemArr;
                        for (var index = 0; index < 6; index++) {
                            if (item[index].data) num++;
                        }
                        if (num >= G.frame.yingxiong_fight.top.extConf.maxnum && !G.frame.yingxiong_fight.top.yj) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }
                        if (G.frame.yingxiong_fight.top.yj && item[6].data) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }


                        me.selectedData.push(sender.data);
                        sender.finds('widget').setGou(true, G.frame.yingxiong_fight.top.yj ? "img_yuan" : "");
                        G.frame.yingxiong_fight.top.addItem(sender.data);

                        //移动动画所需数据
                        if (cc.isNode(G.frame.yingxiong_fight.item)) {
                            G.frame.yingxiong_fight.item.stopAllActions();
                            G.frame.yingxiong_fight.item.removeFromParent();
                        }
                        var itemClone = G.frame.yingxiong_fight.item = sender.clone();
                        itemClone.finds('gou') && itemClone.finds('gou').hide();
                        itemClone.setPosition(G.frame.yingxiong_fight.posSelect);
                        G.frame.yingxiong_fight.ui.addChild(itemClone);
                        G.frame.yingxiong_fight.playAniMove(itemClone);
                    }
                }
            }, null, { "touchDelay": G.DATA.touchHeroHeadTimeInterval });

            ui.show();
        },
        getHelpNam: function (tid) {
            var me = this;
            // cc.each(me.fightData.helpList, function (data) {
            //
            // });
            for (var data of me.fightData.helpList) {
                if (data.v[0].tid == tid) return data.name;
            }
        },
        removeGou: function (tid) {
            var me = this;

            var child = me.getChildByTid(tid);
            if (child) {
                me.ui.setTimeout(function () {
                    child.finds('widget').setGou(false);
                    child.finds('widget').setHighLight(true);
                }, 180);
            }
        },
        getChildByTid: function (tid) {
            var me = this;
            var cd = null;
            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.data == tid) {
                    cd = child;
                    break;
                }
            }
            return cd;
        }
    });

})();
