(function () {
    var me = G.frame.shendian_sddl;

    var callConfig = {

        startFight: function (fightPanel) {
            var me = this;
            fightPanel.index = 0;

            me.fmtTranLog(fightPanel, function (arr) {
                if(arr==null || arr.length==0)return;
                me.tranSimulateRound(arr, fightPanel);
            });
        },
        getToKey: function(index) {
            if(index) return "role0";
            else return "role1";
        },
        fmtTranLog: function (fightPanel, callback) {
            var logs = [];

            if(!fightPanel.roleList["role" + fightPanel.index]){
                return callback && callback(logs);
            }

            var obj = {
                act: "atk",
                actType: "normalskill",
                skillid: fightPanel.roleList["role" + fightPanel.index].data.normalskill,
                from: "role" + fightPanel.index,
                to: {},
                _isShenDianSimularFight: true
            };
            obj.to[this.getToKey(fightPanel.index)] = {
                atkType: "normalskill",
                dps:100,
                ifBaoJi:false,
                ifJingZhun:false
            };
            logs.push(obj);
            logs.push({r:this.getToKey(fightPanel.index),"v": -1, "nv": 1,"act": "hp"});
            logs.push({from: "role" + fightPanel.index, act: "stopAct"});
            callback && callback(logs);
        },

        tranSimulateRound: function(arr, fightPanel) {
            var me = this;
            var fight = function () {
                if(arr.length < 1) {

                    fightPanel.index == 0 ? fightPanel.index = 1 : fightPanel.index = 0;

                    fightPanel.setTimeout(function () {
                        me.fmtTranLog(fightPanel, function (arr) {
                            if(arr==null || arr.length==0)return;
                            me.tranSimulateRound(arr, fightPanel);
                        });
                    }, X.rand(1000, 3000));
                    return;
                }
                var act = arr.shift();
                var _actFunctionKey = 'act_' + act.act;
                if(fightPanel[_actFunctionKey]) {
                    fightPanel[_actFunctionKey](act, function () {
                        fight();
                    });
                }
            };
            fight();
        },

        setPanelFunc: function (fightPanel) {
            fightPanel.ui = fightPanel;

            fightPanel.act_atk = function (data,callback) {
                return G.frame.fight.act_atk.call(fightPanel,data,callback);
            };

            fightPanel.act_hp = function(data,callback){
                var me = fightPanel;
                var fromID = data.r;
                var from = me.roleList[fromID];
                if(!from)return callback();
                from.byatk();
                callback && callback();
            };

            fightPanel._parseSkillAni = function(data,skillAniconf,callback){
                return G.frame.fight._parseSkillAni.call(fightPanel,data,skillAniconf,callback);
            };

            fightPanel._addSkillAni = function(fromPosition,toPosition,skillAniconf,callback,extData,data){
                return G.frame.fight._addSkillAni.call(fightPanel,fromPosition,toPosition,skillAniconf,callback,extData,data);
            };

            fightPanel.hit_ani = function(from,topos,skillAni){
                return G.frame.fight.hit_ani.call(fightPanel,from,topos,skillAni);
            };

            fightPanel._addAniAt = function(pos,aniFile,callback){
                return G.frame.fight._addAniAt.call(fightPanel,pos,aniFile,callback);
            };

            fightPanel.act_stopAct = function(data,callback){
                fightPanel.setTimeout(function () {
                    var _from = fightPanel.roleList[ data.from ];
                    if (cc.isNode(_from) ){
                        _from.resetPos();
                    }
                    callback && callback();
                }, 600);
            };
            fightPanel._shake = function () {

            }
        }
    };

    for (var i in callConfig) {
        me[i] = callConfig[i];
    }
})();