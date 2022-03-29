(function () {
    var me = G.frame.wujunzhizhan_pk;
    var fun = {

        initDemo: function (log) {
            var me = this;
            me.allLog = log;
            me.logIndex = 0;
            me.roles = {};
            me.roleList = {};
            me.timeSpeed = 2;
            me.myRid = [];
            me.enemyRid = [];
            me._fightPanel = me.nodes.panel_zhandou;
            var posObj = {
                side0pos1: {x: me._fightPanel.width / 2 - 250, y: me._fightPanel.height / 2 + 240, s: .44},
                side0pos2: {x: me._fightPanel.width / 2 - 125, y: me._fightPanel.height / 2 + 180, s: .46},
                side0pos3: {x: me._fightPanel.width / 2 - 250, y: me._fightPanel.height / 2 + 120, s: .48},
                side0pos4: {x: me._fightPanel.width / 2 - 125, y: me._fightPanel.height / 2 + 60, s: .50},
                side0pos5: {x: me._fightPanel.width / 2 - 250, y: me._fightPanel.height / 2, s: .52},
                side0pos6: {x: me._fightPanel.width / 2 - 125, y: me._fightPanel.height / 2 - 60, s: .54},
                side0pos7: {x: me._fightPanel.width / 2 - 250, y: me._fightPanel.height / 2 - 120, s: .56},
                side0pos8: {x: me._fightPanel.width / 2 - 125, y: me._fightPanel.height / 2 - 180, s: .58},
                side0pos9: {x: me._fightPanel.width / 2 - 250, y: me._fightPanel.height / 2 - 240, s: .60},

                side1pos1: {x: me._fightPanel.width / 2 + 250, y: me._fightPanel.height / 2 + 240, s: .44},
                side1pos2: {x: me._fightPanel.width / 2 + 125, y: me._fightPanel.height / 2 + 180, s: .46},
                side1pos3: {x: me._fightPanel.width / 2 + 250, y: me._fightPanel.height / 2 + 120, s: .48},
                side1pos4: {x: me._fightPanel.width / 2 + 125, y: me._fightPanel.height / 2 + 60, s: .50},
                side1pos5: {x: me._fightPanel.width / 2 + 250, y: me._fightPanel.height / 2, s: .52},
                side1pos6: {x: me._fightPanel.width / 2 + 125, y: me._fightPanel.height / 2 - 60, s: .54},
                side1pos7: {x: me._fightPanel.width / 2 + 250, y: me._fightPanel.height / 2 - 120, s: .56},
                side1pos8: {x: me._fightPanel.width / 2 + 125, y: me._fightPanel.height / 2 - 180, s: .58},
                side1pos9: {x: me._fightPanel.width / 2 + 250, y: me._fightPanel.height / 2 - 240, s: .60},
            };
            var hidArr = [];
            var allHeroHid = Object.keys(G.gc.hero);
            while (hidArr.length < 18) {
                var hid = X.arrayRand(allHeroHid);
                !X.inArray([hidArr], hid) && hidArr.push(hid);
            }
            var pos = 1;
            var side = 0;
            for (var index = 0; index < hidArr.length; index ++) {
                if (index == 9) {
                    pos = 1;
                    side = 1;
                }
                var posConf = posObj["side" + side + "pos" + pos];
                var heroData = JSON.parse(JSON.stringify(G.gc.hero[hidArr[index]]));
                heroData.side = side;
                heroData.pos = posConf;
                heroData.zIndex = 1400 - posConf.y;
                heroData.rid = "role" + index;
                me.roles["role" + index] = heroData;
                side == 0 && me.myRid.push("role" + index);
                side == 1 && me.enemyRid.push("role" + index);
                pos ++;
            }

            var needLoad = Object.keys(me.roles).length;
            for (var rid in me.roles) {
                me.initRole(me.roles, rid , function(){
                    needLoad--;
                    if (needLoad == 0) {
                        cc.callLater(function(){
                            me.fightStart();
                            me.fightStart();
                            me.fightStart();
                            me.fightStart();
                            me.fightStart();                          
                        });
                    }
                });
            }
        },
        initRole: function (data, rid, callback) {
            var roleData = data[rid];
            roleData.loadRoleOver = function(){
                callback && callback();
            };
            var role = new G.class.Role(roleData);
            role.setPosition( roleData.pos );
            role.zIndex = roleData.zIndex;
            role.setScale(roleData.pos.s);
            role.scaleX *= roleData.side == 0 ? 1 : -1;
            role.setName(roleData.rid);
            me.roleList[rid] = role;
            me._fightPanel.addChild( me.roleList[ rid ] );
        },
        fightStart: function () {
            var me = this;
            if (me.allLog.length == 0) return false;

            if (!me.allLog[me.logIndex]) me.logIndex = 0;
            var oneLog = me.allLog[me.logIndex];
            me.logIndex ++;
            me.playLog([].concat(me.initLog(oneLog.dps[0], 0), me.initLog(oneLog.dps[1], 1)));
        },
        initLog: function (dps, side) {
            var me = this;
            var log = [];
            var from = me.getAtkRid(side);
            var toRid = side == 0 ? X.arrayRand(me.enemyRid) : X.arrayRand(me.myRid);

            var role = me.roleList[from];
            role.isAtk = true;
            log.push({
                act:'atk',
                actType: "normalskill",
                from: from,
                skillid: role.data.normalskill,
                to: {}
            });
            log[0].to[toRid] = {
                atkType: "normalskill",
                dps: dps * -1,
                ifBaoJi:false,
                ifJingZhun:false
            };
            log.push({r: toRid, v: dps * -1, nv: 1, act: "hp", at: 'nm'});
            log.push({from: from , act: "stopAct"});
            return log;
        },
        getAtkRid: function (side) {
            var me = this;
            var ridArr = side == 0 ? me.myRid : me.enemyRid;

            for (var index = 0; index < ridArr.length; index ++) {
                var rid = ridArr[index];
                if (!me.roleList[rid].isAtk) return rid;
            }

            for (var index = 0; index < ridArr.length; index ++) {
                var rid = ridArr[index];
                me.roleList[rid].isAtk = false;
            }
            return me.getAtkRid(side);
        },
        playLog: function (arr) {
            if (arr.length == 0) return me.fightStart();

            var log = arr.shift();
            var _actFunctionKey = 'act_' + log.act;
            if (me[_actFunctionKey]) {
                me[_actFunctionKey](log, function () {
                    me.playLog(arr);
                });
            } else {
                me.playLog(arr);
            }
        },
        act_atk : function(data,callback){
            return G.frame.fight.act_atk.call(this,data,callback);
        },
        act_hp : function(data,callback){
            var me = this;
            var fromID = data.r;
            var from = me.roleList[fromID];
            if(!from)return callback();
            from.byatk();
            from.hmpChange(data);
            callback && callback();
        },
        _parseSkillAni : function(data,skillAniconf,callback){
            data._isTanXianSimularFight = true;
            return G.frame.fight._parseSkillAni.call(this,data,skillAniconf,callback);
        },
        _addSkillAni : function(fromPosition,toPosition,skillAniconf,callback,extData,data){
            return G.frame.fight._addSkillAni.call(this,fromPosition,toPosition,skillAniconf,callback,extData,data);
        },
        hit_ani: function(from,topos,skillAni){
            return G.frame.fight.hit_ani.call(this,from,topos,skillAni);
        },
        _addAniAt : function(pos,aniFile,callback){
            return G.frame.fight._addAniAt.call(this,pos,aniFile,callback);
        },
        _shake : function(shakeLevel){},
        act_dead : function(data,callback){
            G.frame.fight.act_dead.call(this,data,callback);
        },
        act_stopAct : function(data,callback){
            var me = this;
            me.ui.setTimeout(function(){
                var _from = me.roleList[ data.from ];
                if (cc.isNode(_from) ){
                    _from.zIndex = _from.data.zIndex;
                    _from.runActions([
                        cc.moveTo(0.2,_from.data.pos)
                    ]);
                }
                me.ui.setTimeout(function(){
                    callback && callback();
                },300);
            },600)
        }
    };

    cc.mixin(G.frame.wujunzhizhan_pk, fun);
})();