(function() {
    G.class.getConf = function(keyPath, tid) {
        var keys = keyPath.split('.');
        keys = keys.concat(tid == undefined ? [] : tid);
        var conf;
        for (var i in keys) {
            if (i == 0) conf = G.gc[keys[i]];
            else conf = conf[keys[i]];
            if (!conf) {
                cc.log(keys[i] + '物品配置不存在');
                return null;
            }
        }
        return conf;
    };

    G.class.fmtBossConfStr = function(str) {
        //格式化boss配置
        //将 1001_2_1#1002_2_1 这样的字符串格式化为json数据
        var res = {
            boss: null,
            enemy: []
        };
        if (str == null || str == '') return res;
        var arr = str.split('#');

        for (var i = 0; i < arr.length; i++) {
            var info = arr[i].split('_');
            var d = {
                'hid': info[0],
                'lv': info[1],
                'attr': info[2]
            }
            if (i == 0) {
                res.boss = d;
            } else {
                res.enemy.push(d);
            }
        }
        return res;
    };

    G.class.formula = {
        /**
         * 公式运算
         * @param formula 公式string
         * @param args  参数{x:v}
         * @returns {Object}
         */
        compute: function(formula, args) {
            var f = formula;
            f = f.replace(/int/g, 'parseInt');
            f = f.replace(/Math\.round/g, 'round');
            f = f.replace(/Math\.pow/g, 'pow');
            f = f.replace(/round/g, 'Math.round');
            f = f.replace(/pow/g, 'Math.pow');
            for (var k in args) {
                var regx = new RegExp(k, 'g');
                f = f.replace(regx, args[k]);
            }
            return eval(f);
        },
        getTanXianTongJi: function(mapid) {
            var jinbiF = 'jinbi*3600',
                expF = 'exp*3600',
                eventF = '100/(100 + eventcd)',
                nvwuF = '100/(100 + nvwucd)';

            if (mapid == 0) {
                return {
                    jinbi: 0,
                    exp: G.class.mapclient.getById(1).exp,
                    event: 0,
                    nvwu: 0
                };
            }

            var con = G.getCurMapType() == 1 ? G.class.mapclient.getById(mapid) : G.class.mappk.getById(mapid),
                eventcd = averageOfArray(con.eventcd),
                args = {
                    jinbi: con.jinbi,
                    exp: con.exp,
                    eventcd: eventcd,
                    nvwucd: con.nvwucd
                };
            return {
                jinbi: this.compute(jinbiF, args),
                exp: this.compute(expF, args),
                event: this.compute(eventF, args),
                nvwu: con.nvwucd == -1 ? 0 : this.compute(nvwuF, args)
            };
        }
    };

    G.class.menu = {
        get: function(id) {
            return G.class.getConf('menu')[id];
        }
    };

    //英雄
    G.class.hero = {
        get: function() {
            return G.class.getConf('hero');
        },
        getById: function(id) {
            if(!id) return false;
            var hid = id.toString();
            if(hid.split("_").length > 1) {
                return this.get()[hid.split("_")[0]];
            } else {
                return this.get()[hid];
            }
        },
        getSkillLv: function(idx, dengjielv) {
            // 0怒气技, 123被动技能
            if (dengjielv < 6) {
                return 1;
            } else if (dengjielv < 10) {
                // 7,8,9 依次被动123变成3
                if (
                    (idx == 1 && dengjielv >= 7) ||
                    (idx == 2 && dengjielv >= 8) ||
                    (idx == 3 && dengjielv >= 9)
                ) {
                    return 3;
                }
                return 2;
            } else {
                return 3
            }
        },
        getSkillOne: function(idx, hid, dengjielv) {
            var conf = this.getById(hid);
            var opendjlv = conf.bdskillopendjlv;
            var skill = G.class.herostarup.getData(hid, dengjielv);
            if (idx == 0) {
                return {
                    idx: idx,
                    lv: this.getSkillLv(0, dengjielv),
                    intr: (skill && skill.xpskillintr !== "") ? skill.xpskillintr : conf.xpskillintr,
                    ico: conf.xpskillico,
                    lock: false,
                    name: (skill && skill.xpskillname !== "") ? skill.xpskillname : conf.xpskillname
                };
            } else {
                var str = dengjielv < opendjlv[idx - 1] ? X.STR(L('WKQ_JIESUO'), opendjlv[idx - 1]) : "";
                var intr = (skill && skill[X.STR('bd{1}skillintr', idx)]) || "";
                var name = (skill && skill[X.STR('bd{1}skillname', idx)]) || "";
                return {
                    idx: idx,
                    lv: this.getSkillLv(idx, dengjielv),
                    intr: intr !== "" ? intr : conf[X.STR('bd{1}skillintr', idx)] + str,
                    ico: conf[X.STR('bd{1}skillico', idx)],
                    lock: dengjielv < opendjlv[idx - 1],
                    name: name !== "" ? name : conf[X.STR('bd{1}skillname', idx)]
                };
            }
        },
        getSkillList: function(hid, dengjielv) {
            var conf = this.getById(hid);
            var opendjlv = conf.bdskillopendjlv;
            var list = [this.getSkillOne(0, hid, dengjielv)];

            for (var i = 0; i < opendjlv.length; i++) {
                var idx = i + 1;
                if (conf[X.STR('bd{1}skillico', idx)]) {
                    list.push(this.getSkillOne(idx, hid, dengjielv));
                }
            }
            return list;
        },
        // 获取可以升级的技能
        getCanUpgradeSkill: function(hid, dengjielv) {
            var conf = this.getById(hid);
            var idx;

            switch (dengjielv) {
                case 6:
                    idx = 1;
                    break;
                case 7:
                    idx = 2;
                    break;
                case 8:
                    idx = 3;
                    break;
                case 9:
                    idx = 0;
                    break;
            }

            return this.getSkillOne(idx, hid, dengjielv);
        },
        //获得某一种族的英雄hid配置
        getHerosByZhongzu: function(zhongzu) {
            var me = this;

            var zzList = [];
            for (var hid in me.get()) {
                var conf = me.get()[hid];
                if (conf.zhongzu == zhongzu) {
                    zzList.push(hid);
                }
            }

            return zzList;
        },
        getModel: function(data) {
            var me = this;

            data = data || {};

            function f(id) {
                var tr;
                var str = id.toString();
                if(str.split("_").length > 1) {
                    tr = str.split("_")[0];
                    // tr[tr.length - 1] = 'a';
                    tr = tr.substring(0, tr.length - 1);
                    tr += 'a';
                } else {
                    tr = str;
                }
                return tr;
            }

            if ((data.dengjielv!=null && data.dengjielv>=10) || (data.star!=null && data.star >= 10)) { // || data.lv > 200
                return me.getById(data.hid  || data.head).tenstarmodel||me.getById(data.hid  || data.head).model;
            }

            if(G.class.hero.getById(data.hid))  return f(data.hid);
            if(G.class.hero.getById(data.model)) return f(data.model);
            if(G.class.hero.getById(data.head)) return f(data.head);

            return me.getById(63025).model;
        },
        //所有可以合成的英雄
        getCanHcHeros: function() {
            var me = this;

            if (me.canHcHeros) {
                return me.canHcHeros;
            }

            var arr = [];
            var heros = G.class.getConf("herohecheng");
            for (var hid in heros) {
                arr.push(hid);
            }

            me.canHcHeros = arr;

            return arr;
        },
        //获得可以合成英雄的数组
        getCanHcHerosByZhongzu: function(zhongzu) {
            var me = this;

            if (me.zz2canHcHeros && me.zz2canHcHeros[zhongzu]) {
                return me.zz2canHcHeros[zhongzu];
            }

            var heros = me.getCanHcHeros();
            var arr = [];
            for (var i = 0; i < heros.length; i++) {
                var hid = heros[i];
                var conf = me.getById(hid);
                if (conf.zhongzu == zhongzu) {
                    arr.push(hid);
                }else if(zhongzu == 0) {
                    arr.push(hid);
                }
            }

            me.zz2canHcHeros = me.zz2canHcHeros || {};
            me.zz2canHcHeros[zhongzu] = arr;

            return arr;
        },
        //获得合成特殊英雄所需
        getHcNeed: function(id) {
            var me = this;

            return G.class.getConf('herohecheng')[id];
        },
        //获得种族图标
        getZhongzuIcoById: function(id) {
            var me = this;

            var conf = me.getById(id);

            return 'img/public/ico/ico_zz' + ((conf.zhongzu * 1) + 1) + '.png';
        },
        //获得职业图标
        getJobIcoById: function(id) {
            var me = this;

            var conf = me.getById(id);

            return 'img/public/ico_zy/zy_' + conf.job + '.png';
        },
        getJobIcoByIdX: function(id) {
            var me = this;

            var conf = me.getById(id);

            return 'img/public/ico_zy/zy_' + conf.job + '_x.png';
        },
        //获得某星级及以下的hid数组
        getHidArrByStar: function(star) {
            var me = this;

            var arr = [];
            var conf = me.get();
            for (var hid in conf) {
                var heroConf = conf[hid];

                if (heroConf.star <= star) {
                    arr.push(hid);
                }
            }

            return arr;
        }
    };

    G.class.herocom = {
        get: function() {
            return G.class.getConf('herocom');
        },
        getHeroLvUp: function(lv) {
            return this.get().herolvup[lv];
        },
        getHeroJinJieUp: function(dengjielv) {
            return this.get().herojinjieup[dengjielv];
        },
        getMaxlv: function(hid, dengjielv) {
            var data = this.get().herojinjieup[dengjielv];
            if (data) {
                return data.maxlv;
            } else {
                return G.class.herostarup.getMaxlv(hid, dengjielv);
            }
        },
        canJinJie: function(dengjielv) {
            return this.get().herojinjieup[dengjielv];
        },
        //获得战力
        getZhanli: function(id, lv) {
            var me = this;

            var conf = G.class.herogrow.getById(id);
            var obj = {
                lv: lv,
                atk: conf.atk,
                def: conf.def,
                hp: conf.hp,
                speed: conf.speed
            };
            if(lv == 1) {
                return parseInt(obj.hp / 6 + obj.atk + obj.def);
            } else {
                var fomula = G.class.formula.compute(me.get().zhanlifomula, obj);

                return fomula;
            }

        },
        //获得所有种族
        getZhongzu: function() {
            var me = this;

            return me.get().zhongzu;
        },
        //获得单个种族配置
        getZhongzuById: function(id) {
            var me = this;

            return me.getZhongzu()[id];
        }
    };

    //跨服战
    G.class.kuafuzhan = {
        get: function () {
            return G.class.getConf('kuafuzhan');
        },
        getDatePrize: function () {
            return G.class.getConf('kuafuzhan').base.jifen.dateprize;
        },
        getRankPrize: function (match) {
            return G.class.getConf('kuafuzhan').base[match].prize;
        },
        getOpenLv: function () {
            return this.get().base['openlv'];
        },
        getByRank: function (id) {
            var myPrize;
            var p = this.get().base['zhengba'].prize;
            for(var j=0;j< p.length;j++) {
                var prize = p[j];
                if (cc.isArray(prize.rank)) {
                    if (id >= prize.rank[0] && id <= prize.rank[1]) {
                        myPrize = prize.p;
                        break;
                    }
                } else {
                    if (prize.rank == id) {
                        myPrize = prize.p;
                        break;
                    }
                }
            }
            return myPrize;
        }

    };
    G.class.herostarup = {
        get: function() {
            return G.class.getConf('herostarup');
        },
        getById: function(id) {
            return this.get()[id];
        },
        getData: function(hid, dengjielv) {
            return this.getById(hid) ? this.getById(hid)[dengjielv] : null;
        },
        getMaxlv: function(hid, dengjielv) {
            var data = this.getData(hid, dengjielv);
            return data ? data.maxlv : 0;
        },
        getSkill: function(hid, dengjielv, idx) {
            var data = this.getById(hid)[dengjielv + 1];
            return data;
        },
        //获得最大等阶
        getMaxDengjieById: function(id) {
            var me = this;

            var arr = X.keysOfObject(me.getById(id));
            arr.sort(function(a, b) {
                return a * 1 > b * 1 ? -1 : 1;
            });

            return arr[0];
        },
        getByIdAndDengjie: function(id, dengjie) {
            var me = this;

            return me.get()[id][dengjie];
        },
        //获得可以升到10星的hid数组
        getTenStarHidsArr: function() {
            var me = this;

            var conf = me.get();
            var list = [];
            for (var hid in conf) {
                var cnf = conf[hid];
                var keys = X.keysOfObject(cnf);
                if (keys.length >= 4) {
                    list.push(hid);
                }
            }

            return list;
        },
        //通过种族获得en10星的hid数组
        getTenHerosByZhongzu: function(zhongzu) {
            var me = this;

            var zzList = [];
            var hidList = me.getTenStarHidsArr();
            for (var i = 0; i < hidList.length; i++) {
                var hid = hidList[i];
                var conf = G.class.hero.getById(hid);
                if (conf.zhongzu == zhongzu) {
                    zzList.push(hid);
                }
            }

            return zzList;
        },
        getExtneedNum: function(id, dengjielv) {
            var me = this;

            var extneed = me.getById(id)[dengjielv].extneed;

            var num = 0;
            for (var i = 0; i < extneed.length; i++) {
                var ext = extneed[i];
                num += ext.num;
            }

            return num;
        }
    };
    //装备
    G.class.equip = {
        get: function() {
            return G.class.getConf('equip');
        },
        getById: function(id) {
            return this.get()[id];
        },
        getIdArrByType: function(type) {
            var arr = [];

            var conf = me.get();
            for (var id in conf) {
                var cnf = conf[id];
                if (cnf.type == type) {
                    arr.push(id);
                }
            }

            return arr;
        },
        //套装
        getTaozhuang: function() {
            return G.class.getConf('equiptz');
        },
        getTaozhuangById: function(id) {
            var me = this;

            return me.getTaozhuang()[id];
        },
        getTaozhuangByZbid: function(zbid) {
            var me = this;

            var tzid = null;
            for (var id in me.getTaozhuang()) {
                var conf = me.getTaozhuangById(id);
                if (X.inArray(conf.tzid, zbid)) {
                    tzid = id;
                }
            }

            return tzid;
        },
        //获得套装buff数组
        getTzBuffArrById: function(id) {
            var me = this;

            var conf = me.getTaozhuangById(id).buff;

            var arr = [];
            for (var num in conf) {
                var buff = conf[num];
                arr.push([num, buff]);
            }

            arr.sort(function(a, b) {
                return a[0] * 1 < b[0] * 1 ? -1 : 1;
            });

            return arr;
        }
    };
    //NPC
    G.class.npc = {
        get: function() {
            return G.class.getConf("npc");
        },
        getById: function(id) {
            var me = this;
            return me.get()[id]
        },
    };
    //宝石
    G.class.baoshi = {
        get: function() {
            return G.class.getConf('baoshi');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
        //获得升级的最大值
        getMaxLen: function() {
            var me = this;

            return X.keysOfObject(me.get()).length;
        }
    };
    //饰品
    G.class.shipin = {
        get: function() {
            return G.class.getConf('shipin');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        }
    };
    //雕文
    G.class.glyph = {
        get: function () {
            return G.class.getConf("glyph");
        },
        getCom: function () {
            return G.class.getConf("glyphcom");
        },
        getExtra: function () {
            return G.class.getConf("glyphextra");
        },
        getById: function (id) {
            return this.get()[id];
        }
    };
    //货币
    G.class.attricon = {
        get: function() {
            return G.class.getConf('attricon');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
        getIcoById: function(id) {
            var me = this;

            return me.getById(id).ico;
        },
        getImgById: function(id) {
            var me = this;

            return me.getById(id).img;
        },
    };
    //探险
    G.class.tanxian = {
        get: function() {
            return G.class.getConf('tanxian');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
        _parse: function() {
            var me = this;

            if (!me.conf) {
                var obj = {};
                var conf = me.get();
                for (var id in conf) {
                    var cnf = conf[id];
                    obj[cnf.nandu] = obj[cnf.nandu] || {};
                    obj[cnf.nandu][cnf.area] = obj[cnf.nandu][cnf.area] || [];
                    obj[cnf.nandu][cnf.area].push(id);
                }

                me.conf = obj;
            }
        },
        getAreaById: function(id) {
            var me = this;

            return me.getById(id).area;
        },
        getNanduById: function(id) {
            var me = this;

            return me.getById(id).nandu;
        },
        // 通过属性获得指定的挂机奖励
        getGjPerValueByAttr: function(id, attr) {
            var me = this;

            var gjPrize = me.getById(id).gjprize;

            return gjPrize[attr];
        },
        //获得id数组
        getIdArrByNanduAndArea: function(nandu, area) {
            var me = this;

            me._parse();
            var conf = me.conf;
            var arr = [].concat(conf[nandu][area]);
            arr.sort(function(a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            return arr;
        },
        //判断关卡是不是章节的最后一关
        checkIsLastByGqid: function(id) {
            var me = this;

            var conf = me.getById(id);
            var idArr = me.getIdArrByNanduAndArea(conf.nandu, conf.area);
            var idx = X.arrayFind(idArr, id);

            return idx == idArr.length - 1;
        },
        //获得关卡的开启条件
        getNeedlvByGqid: function(id) {
            var me = this;

            var conf = me.getById(id);

            return conf.needlv;
        },
        //获得当前允许的最大关卡id
        getCurMaxGqid: function() {
            var me = this;

            return me.getExtConf().base.maxmapid;
        },
        //探险的额外配置
        getExtConf: function() {
            return G.class.getConf('tanxian_com');
        },
        //获得快速购买消耗
        getKstxNeed: function(num) {
            var me = this;

            return me.getExtConf().base.buynumneed[num];
        },
        //通关奖励
        getTgprize: function() {
            var me = this;

            return me.getExtConf().base.passprize;
        },
        //获得积分上限值
        getMax: function() {
            var me = this;

            return me.getExtConf().base.maxjifen;
        },
        getSimulateFight: function() {
            var me = this;

            return me.getExtConf().base.simulatefight;
        },
        //获得vip加成
        getVipAdd: function (id) {
            if(id == "jifen") return 0;

            var obj = {
                jinbi: 103,
                useexp: 105,
                exp: 104
            };
            var conf = G.class.vip.get()[P.gud.vip];
            if(!conf) return 0;

            for(var i in conf.tq) {
                if(conf.tq[i][0] == obj[id]) {
                    return conf.tq[i][1] / 100
                }
            }
            return 0;
        }
    };
    //掉落
    G.class.diaoluo = {
        get: function() {
            return G.class.getConf('diaoluo');
        },
        getById: function(id) {
            var me = this;

            var prize = me.get()[id];
            //需要过滤掉空奖励
            var arr = [];
            for (var i = 0; i < prize.length; i++) {
                var p = prize[i];
                if (p.a == '') continue;
                arr.push(p);
            }
            prize = [].concat(arr);
            return prize;
        }
    };
    //造型
    G.class.zaoxing = {
        get: function() {
            return G.class.getConf('zaoxing');
        },
        getByType: function(type) {
            if (type == 'headborder') return this.getHeadBorder();
            if (type == 'chat') return this.getChat();
            if (type == 'head') return this.getHead();
            if (type == 'xunzhang') return this.getXunZhang();
        },
        getById: function(type, id) {
            return this.getByType(type)[id];
        },
        getHead: function() {
            return this.get().head;
        },
        getHeadById: function(id) {
            return this.getHead()[id];
        },
        getHeadBorder: function() {
            return this.get().headborder;
        },
        getHeadBorderById: function(id) {
            return this.getHeadBorder()[id];
        },
        getChat: function() {
            return this.get().chatborder;
        },
        getChatById: function(id) {
            return this.getChat()[id];
        },
        getXunZhang: function() {
            return this.get().xunzhang;
        },
        getXunZhangById: function(id) {
            return this.getXunZhang()[id];
        }
    };
    // 英雄成长
    G.class.herogrow = {
        get: function() {
            return G.class.getConf('herogrow');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
    };
    //悬赏任务
    G.class.xuanshangrenwu = {
        get: function() {
            return G.class.getConf("xstask");
        },
        getConfById: function(id) {
            var me = this;

            return me.get()[id];
        },
        getConf: function() {
            return G.class.getConf("xscom");
        }
    };
    //大法师塔
    G.class.dafashita = {
        get: function() {
            return G.class.getConf("dafashita");
        },
        getPrize: function() {
            return G.class.getConf("tongguanprize");
        },
        getPrizeTargetArr: function () {
            var me = this;
            var arr = [];
            var conf = me.getPrize().passprize;

            for(var i = 0; i < conf.length; i ++) {
                arr.push(conf[i][0]);
            }

            arr.sort(function (a, b) {
                return a < b ? -1 : 1;
            });

            return arr;
        }
    };
    //许愿池
    G.class.xuyuanchi = {
        get: function() {
            return G.class.getConf("xuyuanchi");
        },
        getMaxByType: function (type) {
            var me = this;

            return me.get()[type].energy[1];
        },
        getBoxConf: function () {
            var me = this;

            return me.get()["common"].passprize;
        }
    };
    //每日试炼
    G.class.meirishilian = {
        get: function() {
            return G.class.getConf("mrsl");
        },
        getCon: function() {
            return G.class.getConf("mrslcon")
        },
        getConfByType: function(type) {
            var me = this;

            return me.get()[type];
        }
    };
    //十字军远征
    G.class.shizijunyuanzheng = {
        getLevel: function() {
            return G.class.getConf("yuanzheng_xx");
        },
        getConf: function() {
            return G.class.getConf("yuanzheng_conf");
        },
        getSupply: function () {
            return G.class.getConf("yuanzheng_conf").base.supply;
        }
    };
    //任务
    G.class.task = {

        getTask: function() {
            return G.class.getConf("task");
        },
        getTaskByTaskId: function(taskId) {
            var me = this;
            return me.getTask()[taskId];
        },
    };
    //外域争霸
    G.class.waiyuzhengba = {
        get: function () {
            return G.class.getConf("yuwaizhengba");
        },
        getOpenTimeByType: function (type) {
            var me = this;
            return me.get().base[type].opentime;
        }
    };
    //跳转配置
    G.class.tiaozhuan = {
        get: function() {
            return G.class.getConf('tiaozhuan');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
        getIdByFrameId: function(frameId) {
            var me = this;

            var id = "";
            var conf = me.get();
            var keys = X.keysOfObject(conf);
            for (var i = 0; i < keys.length; i++) {
                if (conf[keys[i]].frameId == frameId) {
                    id = keys[i];
                    break;
                }
            }
            return id;
        }
    };
    //商店
    G.class.shop = {
        get: function() {
            return G.class.getConf('shop');
        },
        getById: function(id) {
            var me = this;

            return me.get()[id];
        },
        //检测时候否需要确认弹框
        checkIsShowAlert: function(id) {
            var me = this;

            var conf = me.getById(id);

            return conf.ispop;
        },
        //刷新消耗
        getRefreshNeed: function(id) {
            var me = this;

            var conf = me.getById(id);

            return conf.need;
        },
        getShopItems: function() {
            return G.class.getConf('shopitem');
        },
        getShopItemById: function(id) {
            var me = this;

            return me.getShopItems[id];
        }
    };
    //开放条件
    G.class.opencond = {
        get: function() {
            return G.class.getConf('opencond');
        },
        getCondById: function(id) {
            var cond = this.get().base[id];
            return cond != undefined ? cond : {};
        },
        getCondKeyArrById: function(id, isMain) {
            var cond = this.getCondById(id);
            var str = isMain ? 'main' : 'optional';
            if (!cond[str]) return null;

            var arr = [];
            for (var i = 0; i < cond[str].length; i++) {
                var con = cond[str][i];
                arr.push(con[0]);
            }

            return arr;
        },
        getCondValueArrByid: function(id, isMain) {
            var cond = this.getCondById(id);
            var str = isMain ? 'main' : 'optional';
            if (!cond[str]) return null;

            var arr = [];
            for (var i = 0; i < cond[str].length; i++) {
                var con = cond[str][i];
                arr.push(con[1]);
            }

            return arr;
        },
        getCondKeyArr: function() {
            return X.keysOfObject(this.get().base);
        },
        getIsOpenById: function(id, obj) {
            var obj = obj || P.gud;
            var conf = this.getCondById(id);
            if (!X.isHavItem(conf)) {
                return true;
            }

            var canGo = false;
            if (conf['main']) {
                var canMain = true;
                var canOptional = false;
                var cond = conf['main'];
                for (var i = 0; i < cond.length; i++) {
                    var co = cond[i];
                    if (obj[co[0]] < co[1]) {
                        canMain = false;
                        break;
                    }
                }
                if (!canMain) {
                    if (conf['optional']) {
                        var cond = conf['optional'];
                        for (var i = 0; i < cond.length; i++) {
                            var co = cond[i];
                            if (obj[co[0]] >= co[1]) {
                                canOptional = true;
                                break;
                            }
                        }
                    }
                }

                canGo = canMain || canOptional;
            } else {
                var canOptional = false;
                var cond = conf['optional'];
                for (var i = 0; i < cond.length; i++) {
                    var co = cond[i];
                    if (obj[co[0]] >= co[1]) {
                        canOptional = true;
                        break;
                    }
                }

                canGo = canOptional;
            }

            return canGo;
        },
        getTipById: function(id) {
            var str = '';
            var obj = obj || P.gud;

            var conf = this.getCondById(id);
            var canMain = true;
            if (conf['main']) {
                var cond = conf['main'];
                for (var i = 0; i < cond.length; i++) {
                    var co = cond[i];
                    if (obj[co[0]] < co[1]) {
                        // var val = co[0] == 'opencityid' ? G.gc.cityIndex[co[1]] : co[1];
                        // var val = co[0] == 'vip' ? P.gud[co[1]] : co[1];
                        var val = co[1];
                        str += X.STR(L('OPEN_' + co[0]), val) + (cond.length > 1 && i != cond.length - 1 ? L('AND') : '');
                        canMain = false;
                    }
                }
            }

            if (conf['optional']) {
                var cond = conf['optional'];
                var canOptional = false;
                for (var i = 0; i < cond.length; i++) {
                    var co = cond[i];
                    if (obj[co[0]] >= co[1]) {
                        canOptional = true;
                        break;
                    }
                }

                if (!canOptional && !canMain) {
                    str += L('BINGQIE');
                }

                if (!canOptional) {
                    for (var i = 0; i < cond.length; i++) {
                        var co = cond[i];
                        var val = co[0] == 'opencityid' ? G.gc.cityIndex[co[1]] : co[1];
                        str += X.STR(L('OPEN_' + co[0]), val) + (cond.length > 1 && i != cond.length - 1 ? L('OR') : '');
                    }
                }
            }

            return str;
        },
        //获得某功能的开放等级 ，如果不存在返回null
        getLvById: function(id) {
            var me = this;

            var conf = this.getCondById(id);
            var arr = [];
            if (conf.optional) {
                arr = arr.concat(conf.optional);
            }
            if (conf.main) {
                arr = arr.concat(conf.main);
            }

            var lv = null;
            for (var i = 0; i < arr.length; i++) {
                var cond = arr[i];
                if (cond[0] == 'lv') {
                    lv = cond[1];
                    break;
                }
            }

            return lv;
        }
    };
    //世界树配置
    G.class.worldtree = {
        get: function() {
            return G.class.getConf('worldtree');
        },
        getCallNeed: function() {
            var me = this;

            return me.get().base.callneed;
        },
        //星级获取置换的消耗
        getChangeNeedByStar: function(star) {
            var me = this;

            return me.get().base.swapneed[star];
        }
    };
    //阵法
    G.class.zhenfa = {
        get: function() {
            return G.class.getConf('fightcom');
        },
        getById: function(id) {
            var me = this;

            var conf = me.get().zhenfa;
            return conf[id];
        },
        getIcoById: function(id) {
            var me = this;

            return me.getById(id).ico;
        }
    };
    //竞技场
    G.class.jingjichang = {
        get: function() {
            return G.class.getConf('zypkjjccom');
        }
    };
    //冠军试炼
    G.class.championtrial = {
        get: function() {
            return G.class.getConf('championtrial');
        }
    };
    //公会
    G.class.gonghui = {
        get: function() {
            return G.class.getConf('gonghui');
        },
        getMaxNumPerPage: function() {
            var me = this;

            return me.get().base.maxnumperpage;
        },
        // 旗帜图片
        getFlagImgById: function(id) {
            var me = this;

            return 'img/gonghui/' + me.get().base.flags[id].img;
        },
        //获得等级配置
        getLvConf: function() {
            var me = this;

            return me.get().base.lv2conf;
        },
        //获得等级对应的配置
        getConfByLv: function(lv) {
            var me = this;

            return me.getLvConf()[lv];
        },
        // 升级所需要经验值
        getUpNeedExp: function(lv) {
            var me = this;

            var conf = me.get().base.lv2conf[lv];
            var lastConf = me.get().base.lv2conf[lv - 1];

            if (lastConf) {
                return conf.exp - lastConf.exp;
            } else {
                return conf.exp;
            }
        },
        //计算总经验值对应的等级
        getLvByExp: function(exp) {
            var me = this;

            var conf = me.get().base.lv2conf;

            var keys = X.keysOfObject(conf);
            keys.sort(function(a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            for (var i = 0; i < keys.length; i++) {
                var lv = keys[i];
                var lastExp = conf[lv - 1] ? conf[lv - 1].exp : 0;
                var lv2exp = conf[lv].exp;
                if (exp < lv2exp) {
                    return [lv, exp - lastExp];
                }
            }
        },
        //当前等级所需的经验值
        getMaxExpBylv: function(lv) {
            var me = this;

            var conf = me.get().base.lv2conf;
            var lastExp = conf[lv - 1] ? conf[lv - 1].exp : 0;
            var lv2exp = conf[lv].exp;

            return lv2exp - lastExp;

        },
        checkIsMaxLv: function(lv) {
            var me = this;

            var isMax = false;
            var conf = me.get().base.lv2conf;

            var keys = X.keysOfObject(conf);
            if (lv == keys.length) {
                isMax = true;
            }

            return isMax;
        },

        //公会副本
        getFubenConf: function() {
            return G.class.getConf('gonghui_fuben').base;
        },
        getFubenById: function(id) {
            var me = this;

            return me.getFubenConf().fuben[id];
        },
        getFubenPrizeByFbid: function(id) {
            var me = this;

            return me.getFubenConf().fubenprize[me.getFubenById(id).prizeid];
        },
        getPMPrizeByRank: function (fbid,rank) {
            var me = this;

            var pmPrize = me.getFubenPrizeByFbid(fbid).pmprize;

            for (var i = 0; i < pmPrize.length; i++) {
                var pPrize = pmPrize[i];
                if (pPrize[0][0] <= rank && pPrize[0][1] >= rank) {
                    return pPrize[1];
                }
            }

            return [];
        },
        //获得技能配置
        getSkillConfById: function(id) {
            var me = this;

            return me.get().base.skill[id];
        },
        getRizhiConfById: function(id) {
            var me = this;

            return me.get().base.rizhi.types[id];
        }
    };
    //好友
    G.class.friend = {
        get: function() {
            return G.class.getConf('friend');
        },
        getWeekprize: function() {
            return G.class.getConf('friend').base.weekprize;
        },
        getPrizeByLv: function (lv) {
            var me = this;
            var conf = me.get().base.treasure[0].boss;
            var keys = X.keysOfObject(conf);

            for (var i = 0; i < keys.length; i ++) {
                var num = keys[i].split("_");
                if(lv >= num[0] * 1 && lv <= num[1] * 1) {
                    return conf[keys[i]];
                }
            }
        }
    };
    //vip
    G.class.vip = {
        get: function() {
            return G.class.getConf('vip');
        },
        getVipTeQuan: function() {
            return G.class.getConf('vip_tequan');
        }
    };

    //充值活动
    G.class.chongzhihd = {
        get: function() {
            return G.class.getConf('chongzhihd');
        },
        getMeirixiangou: function() {
            return G.class.getConf('chongzhihd').meirixiangou;
        },
        getChaozhilibao: function() {
            return G.class.getConf('chongzhihd').chaozhilibao;
        },
        getAdvertising: function() {
            return G.class.getConf('chongzhihd').advertising;
        },
        getYangchenglibao: function() {
            return G.class.getConf('chongzhihd').yangchenglibao;
        },
        getDengjilibao: function() {
            return G.class.getConf('chongzhihd').dengjilibao;
        },
        getTequan: function() {
            return G.class.getConf('chongzhihd').tequan
        }
    };

    //帮助
    G.class.support = {
        get: function() {
            return G.class.getConf('support');
        },
        getHelp: function() {
            return G.class.getConf('support').help;
        },
        getProblem: function() {
            return G.class.getConf('support').problem;
        }
    };
    //preload加载配置
    G.class.loading = {
        get: function () {
            return G.class.getConf('loading');
        },
        getConfById: function (id) {
            return this.get().base[id];
        },
        getOneConf: function () {
            var keys = X.keysOfObject(this.get().base);

            var k = X.arrayRand(keys);
            if (k == '0') return this.getOneConf();

            return this.getConfById(k);
        }
    };
    //神器
    G.class.shenqi = {
        get: function() {
            return G.class.getConf("shenqicom").shenqi;
        },
        getComById: function(id) {
            return G.class.getConf("shenqicom").shenqi[id];
        },
        getBuffByIdAndLv: function (id, lv) {
            return G.class.getConf("shenqibuff")[id][lv];
        },
        getSkillByIdAndDj: function (id, dj) {
            return G.class.getConf("shenqiskill")[id][dj];
        },
        getUpLvNeedByLv: function (lv) {
            return G.class.getConf("shenqicom").base.lvneed[lv];
        },
        getUpDjNeedByDj: function (denjie) {
            return G.class.getConf("shenqicom").base.dengjieneed[denjie];
        },
        getTaskById: function (id) {
            return G.class.getConf("shenqitask")[id];
        }
    };
    //秘境
    G.class.watchercom = {
        get: function () {
            return G.class.getConf("watchercom");
        },
        getMedicine: function (idx) {
            var me = this;

            if(!idx && idx != 0) return me.get().base.supply;
            else return me.get().base.supply[idx];
        },
        getTitle: function (idx) {
            var me = this;

            return me.get().base.leveltxt[idx];
        },
        getMixtureBuyId: function (id) {
            var me = this;

            if(!id && id != 0) return me.get().base.mixture;
            else return me.get().base.mixture[id];
        },
        getFlopNeedById: function (id) {
            var me = this;

            return me.get().base.flop.need[id][0].n;
        },
        getAllFlopNeed: function () {
            var me = this;
            var num = 0;

            for (var i = 2; i < 6; i ++) {
                num += me.getFlopNeedById(i);
            }

            return num;
        }
    };
    //融魂
    G.class.meltsoul = {
        get: function() {
            return G.class.getConf("meltsoul");
        },
        getById: function(id) {
            return G.class.getConf("meltsoul")[id];
        }
    };
    //融魂消耗
    G.class.meltsoulcom = {
        get: function() {
            return G.class.getConf("meltsoulcom");
        },
        getOpenLv:function(){
            return G.class.getConf("meltsoulcom").base.limitlv;
        },
        getAtkneed:function(dj){
            return G.class.getConf("meltsoulcom").base.atkneed[dj];
        },
        getHpneed:function(dj){
            return G.class.getConf("meltsoulcom").base.hpneed[dj];
        },
        getTPlv:function(dj){
            return G.class.getConf("meltsoulcom").base.tupo[dj];
        }

    };
    //统御
    G.class.tongyu = {
        get: function () {
            return G.class.getConf("tongyu");
        },
        getHerosByID: function (id) {
            var arr = [];
            var conf = G.class.hero.get();

            for (var i in conf) {
                if(conf[i].pinglunid == id && conf[i].star >= 5) {
                    arr.push(conf[i]);
                }
            }
            arr.sort(function (a, b) {
                return a.star < b.star ? -1 : 1;
            });
            return arr;
        },
        getHeroByZhongzu: function (zhongzu) {
            var me = this;
            var arr = [];
            var heroArr = me.get().base.herozu;

            for (var i = 0; i < heroArr.length; i ++) {
                if(me.getHerosByID(heroArr[i])[0].zhongzu == zhongzu) {
                    arr.push(heroArr[i]);
                }
            }

            return arr;
        }
    };
    //王者荣耀
    G.class.wangzherongyao = {
        get: function() {
            return G.class.getConf('wangzherongyao');
        },
        getOpenNum: function() {
            return this.get().base.wangzhe.opennum;
        },
        getStateById: function(id) {
            return this.get().base.state[id];
        },
        getPrizes: function() {
            return this.get().base.jiangli;
        },
        getPrizeByType: function(type) {
            return this.get().base.jiangli[type];
        },
        //自动报名
        getZDBMCond: function() {
            return this.get().base.zdbmcond.vip;
        },
        getOpen:function(){
            return this.get().bmneed;
        }
    };
    G.class.shendianmowang = {
        get: function () {
            return G.class.getConf("shendianmowang");
        },
        getFightPos: function () {
            return this.get().base.fightPos;
        },
        getScale: function (idx) {
            return this.get().base.scale[idx];
        },
        getPrize: function () {
            var arr = [];
            var prize = this.get().base.prize.rank;

            for (var i in prize) {
                arr.push(prize[i]);
            }

            return arr;
        }
    };
    G.class.qyjj = {
        get: function () {
            return G.class.getConf("qyjj").base;
        },
        getDeclareById: function (id) {
            return this.get().intr[id];
        },
        getConfById: function (id) {
            return this.get().group[id];
        }
    }
})();
