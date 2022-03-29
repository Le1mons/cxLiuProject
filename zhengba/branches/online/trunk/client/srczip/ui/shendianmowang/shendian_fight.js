/**
 * Created by LYF on 2019/1/9.
 */
(function () {
    var me = G.frame.shendianmowang;
    me.fightOrder = [];

    var _fun = {
        getPos: function() {
            return G.class.shendianmowang.getFightPos();
        },
        getScaleByIdx: function(idx) {
            return G.class.shendianmowang.getScale(idx);
        },
        getNpcArr: function(num) {
            var arr = [];
            var checkAlike = [];
            var npcArr = G.class.shendianmowang.get().base.npc;

            for (var i in me.roleList) {
                if(me.roleList[i] && me.roleList[i].isNpc) checkAlike.push(me.roleList[i].data.hid);
            }

            while (arr.length != num) {
                var hid = X.arrayRand(npcArr);
                if(!X.inArray(checkAlike, hid)) arr.push(hid);
            }

            return arr;
        },
        getBossInfo: function() {
            var me = this;


            var res = {};
            var posObj = me.getPos();
            var boss = G.class.shendianmowang.get().base[me.DATA.boss.name].boss[0];

            res['boss'] = boss;
            res['boss'].pos = posObj["boss"];
            res['boss'].zIndex = 1400 - posObj["boss"].y;
            res['boss'].rid = 'boss';
            res['boss'].idx = 5;
            res["boss"].side = 1;
            res['boss'].scale = me.getScaleByIdx("boss");

            return res;
        },
        setRoleData: function(data, idx, obj, index) {
            var posObj = me.getPos();
            data.isFight = 1;
            if(!data.isNpc) {
                obj[idx] = X.clone(G.class.hero.getById(data.headdata) ? G.class.hero.getById(data.headdata) : G.class.hero.getById(me.getNpcArr(1)[0]));
                obj[idx].rid = "player" + idx;
                obj[idx].zIndex = 1400 - posObj[idx].y;
                obj[idx].idx = index;
                obj[idx].pos = posObj[idx];
                obj[idx].scale = me.getScaleByIdx(idx);
                obj[idx].hp = 5;
                obj[idx].name = data.name;
                obj[idx].dps = data.v;
            } else {
                obj[idx] = X.clone(G.class.hero.getById(data.hid));
                obj[idx].isNpc = true;
                obj[idx].rid = "npc_" + idx;
                obj[idx].zIndex = 1400 - posObj[idx].y;
                obj[idx].idx = index;
                obj[idx].pos = posObj[idx];
                obj[idx].scale = me.getScaleByIdx(idx);
                obj[idx].hp = 5;
                obj[idx].name = G.class.shendianmowang.get().base.npcname;
            }
        },
        setHeroList: function() {
            var data = me.rankData.ranklist;
            var npc = data.length >= 50 ? me.getNpcArr(10) : (50 - data.length > 10 ? me.getNpcArr(10) : me.getNpcArr(50 - data.length));

            me.list = [];

            for (var i in data) {
                data[i].dead = 0;
                data[i].isFight = 0;
                me.list.push(data[i]);
            }

            for (var i in npc) {
                var obj = {
                    hid: npc[i],
                    dead: 0,
                    isFight: 0,
                    isNpc: true
                };
                me.list.push(obj);
            }
        },
        setFight: function () {
            var me = this;
            var roles = {};

            me.timeSpeed = G.gc.shendianmowang.base.anispeed;
            me.roleSpeed = G.gc.shendianmowang.base.rolespeed;
            me.deadRound = 1;
            me.roleList = {};
            me._fightPanel = me.nodes.panel_rq;
            me.setHeroList();

            for (var i = 0; i < 5; i ++) {
                me.setRoleData(me.list[i], i, roles, i);
            }

            cc.mixin(roles, me.getBossInfo(), true);

            var loadLen = X.keysOfObject(roles).length;
            for (var rid in roles) {
                me.initRole(roles, rid, function () {
                    loadLen --;
                    if(loadLen == 0) {
                        cc.callLater(function () {
                            me.fmtTranLog();
                        });
                    }
                });
            }
        },
        initRole: function (data, rid, callback, isAni) {
            var roleData = data[rid];

            var role = rid == "boss" ? new G.class.Role(roleData) : new G.class.shendianRole(roleData);
            role.data._defaultPos = roleData.pos;
            role.data._defaultZindex = roleData.zIndex;

            role.data.side = rid == 'boss' ? 1 : 0;
            role.setPosition( roleData.pos );
            role.zIndex = roleData.zIndex;
            role.setScale(rid == "boss" ? roleData.scale * -1 : roleData.scale, roleData.scale);

            role.speed(me.roleSpeed);
            me.roleList[rid] = role;
            if(isAni) {
                G.class.ani.show({
                    json: "ani_shijieshushuaxin",
                    addTo: me.nodes.panel_rq,
                    x: roleData.pos.x,
                    y: roleData.pos.y,
                    repeat: false,
                    autoRemove: true,
                    onload: function (node, action) {
                        node.zIndex = 9999;
                        me.nodes.panel_rq.addChild( me.roleList[ rid ] );
                        callback && callback();
                    },
                });
            } else {
                me.nodes.panel_rq.addChild( me.roleList[ rid ] );
                callback && callback();
            }
        },
        fmtTranLog: function () {
            var logs = [];
            var keys = X.keysOfObject(me.roleList);

            keys.splice(X.arrayFind(keys, "boss"), 1);

            keys.sort(function (a, b) {
                return parseInt(a) > parseInt(b);
            });

            if(me.fightOrder.length != 5) {
                var curRole;
                var curRoleIdx;
                var npcDps = G.class.shendianmowang.get().base.npcdps;

                for (var i = 0; i < keys.length; i ++) {
                    if(!X.inArray(me.fightOrder, keys[i])) {
                        curRoleIdx = keys[i];
                        break;
                    }
                }

                curRole = me.roleList[curRoleIdx];

                if(!curRole) return;

                logs.push({
                    from: curRoleIdx,
                    act: "atk",
                    atkType: "xpskill",
                    skillid: curRole.data.xpskill,
                    to: {
                        boss:{
                            atkType: "xpskill",
                            dps:-1,
                            ifBaoJi:false,
                            ifJingZhun:false
                        }
                    }
                });
                logs.push({r:"boss","v": curRole.data.isNpc ?
                        -1 * X.rand(npcDps[0], npcDps[1]) : -1 * curRole.data.dps, "nv": 1,"act": "hp"});
                logs.push({from: curRoleIdx , act: "stopAct"});
                me.fightOrder.push(curRoleIdx);
            } else {
                var boss = me.roleList["boss"];
                var data = {
                    act:'atk',
                    actType: "xpskill",
                    from:'boss',
                    skillid: boss.data.mowangskillani || boss.data.xpskill,
                    to:{}
                };

                var num = X.rand(boss.data.jcdmubiao[0], boss.data.jcdmubiao[1]);
                var target;
                if(num >= 5) {
                    target = keys;
                    for (var i in keys) {
                        data.to[keys[i]] = {
                            atkType: "xpskill",
                            dps: -1,
                            ifBaoJi:false,
                            ifJingZhun:false
                        };
                    }
                } else {
                    target = X.arrayRand(keys);
                    data.to[target] = {
                        atkType: "xpskill",
                        dps:-1,
                        ifBaoJi:false,
                        ifJingZhun:false
                    };
                }

                logs.push(data);

                if(cc.isArray(target)) {
                    for (var i in target) {
                        logs.push({r:target[i],"v": -1 * X.rand(boss.data.jzddps[0], boss.data.jzddps[1]), "nv": 1,"act": "hp"});
                    }
                } else {
                    logs.push({r:target,"v": -1 * X.rand(boss.data.jzddps[0], boss.data.jzddps[1]), "nv": 1,"act": "hp"});
                }
                logs.push({from: "boss" , act: "stopAct"});
                me.fightOrder = [];
            }

            me.tranSimulateRound( logs );
        },
        tranSimulateRound: function (data) {
            var me = this;

            data = [].concat(data);

            var fight = function () {
                if(data.length < 1) {
                    return;
                }
                var act = data.shift();
                var _actFunctionKey = 'act_' + act.act;
                if (me[_actFunctionKey]) {
                    me[_actFunctionKey](act, function () {
                        fight();
                    });
                }
            };
            fight();
        },
        act_atk : function(data,callback){
            //普通攻击
            return G.frame.fight.act_atk.call(this,data,callback);
        },
        act_hp : function(data,callback){
            var me = this;

            if(data.r == "boss") {
                var fromID = data.r;
                var from = me.roleList[fromID];
                if(!from) return callback();
                from.byatk();
                callback && callback();
                var pos = me.getPos()["boss"];
                var label = new cc.LabelBMFont(data.v, "img/fnt/sz_zd2.fnt");
                label.setPosition(pos.x + X.rand(0, 70), pos.y + X.rand(150, 300));
                label.zIndex = 1400;
                me._fightPanel.addChild(label);
                label.runActions([
                    cc.jumpBy(0.3,cc.p(
                        X.rand(30,50),
                        X.rand(20,60)
                    ), 50, 1),

                    cc.jumpBy(0.3,cc.p(
                        20,
                        10
                    ), 10, 1),

                    cc.fadeOut(0.3),
                    cc.removeSelf()
                ]);
            } else {
                var fromID = data.r;
                var from = me.roleList[fromID];
                if(!from) return callback();
                from.byatk();
                from.data.hp += data.v;
                from.hpBar(from.data.hp, function () {
                    from.data.dead = true;
                    me.list[from.data.idx].isFight = 0;
                    me.list[from.data.idx].dead ++;

                    from.removeFromParent(true);
                });
                callback && callback();
            }
        },
        addRole: function() {
            var deadArr = [];

            for (var i in me.roleList) {
                if(me.roleList[i].data.dead) deadArr.push(i);
            }

            if(deadArr.length < 1) {
                me.fmtTranLog();
            } else {
                var add = [];
                var roles = {};

                for (var i = 0; i < me.list.length; i ++) {
                    if(!me.list[i].isFight && me.list[i].dead < me.deadRound) {
                        add.push(i);
                        if(add.length == deadArr.length) break;
                    }
                }

                if(add.length != deadArr.length) {
                    me.deadRound ++;
                    for (var i = 0; i < me.list.length; i ++) {
                        if(!me.list[i].isFight) {
                            add.push(i);
                            if(add.length == deadArr.length) break;
                        }
                    }
                }

                for (var i = 0; i < deadArr.length; i ++) {
                    me.list[add[i]].isFight = 1;
                    me.setRoleData(me.list[add[i]], deadArr[i], roles, add[i]);
                }

                var loadLen = X.keysOfObject(roles).length;
                for (var rid in roles) {
                    me.initRole(roles, rid, function () {
                        loadLen --;
                        if(loadLen == 0) {
                            cc.callLater(function () {
                                me.fmtTranLog();
                            });
                        }
                    }, true);
                }
            }
        },
        _parseSkillAni : function(data,skillAniconf,callback){
            data._isTanXianSimularFight = true;
            return G.frame.fight._parseSkillAni.call(this,data,skillAniconf,callback);
        },
        _addSkillAni : function(fromPosition,toPosition,skillAniconf,callback,extData){
            return G.frame.fight._addSkillAni.call(this,fromPosition,toPosition,skillAniconf,callback,extData);
        },
        hit_ani: function(from,topos,skillAni){
            return G.frame.fight.hit_ani.call(this,from,topos,skillAni);
        },
        _addAniAt : function(pos,aniFile,callback){
            return G.frame.fight._addAniAt.call(this,pos,aniFile,callback);
        },
        act_stopAct : function(data,callback){
            var me = this;
            me.ui.setTimeout(function(){
                var _from = me.roleList[ data.from ];
                if (cc.isNode(_from) ){
                    _from.zIndex = _from.data._defaultZindex;
                    _from.runActions([
                        cc.moveTo(0.2,_from.data._defaultPos)
                    ]);
                }
                me.ui.setTimeout(function(){
                    if(data.from == "boss") {
                        me.addRole();
                    } else {
                        me.fmtTranLog();
                    }
                    callback && callback();
                },300);
            },600)
        },
        _shake: function () {

        }
    };

    for (var i in _fun) {
        me[i] = _fun[i];
    }
})();

