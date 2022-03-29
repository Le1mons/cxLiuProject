(function () {

    var skillConf = {
        "skill_6501a012": function (data, skillAniConf, callback) {
            var me = this;
            var retard = 0.2;
            var fromID = data.from,
                toIDS = Object.keys(data.to);

            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];

            if(!from || !to){
                return callback && callback();
            }

            var _hits=0;
            var allLen = toIDS.length;

            skillAniConf.sound && X.audio.playEffect('skillsound/'+skillAniConf.sound+'.mp3',false);

            function f() {
                if(allLen == 0) return callback && callback();

                to = me.roleList[ toIDS[_hits] ];
                var _topos = to.getPosition();

                me._addSkillAni( from.getPosition() , _topos , skillAniConf , function(){
                    me.hit_ani(from,_topos,skillAniConf);
                }, { from: from, to: to}, data);

                _hits ++;
                allLen --;

                me.ui.setTimeout(function () {
                    f();
                }, 1000 * retard);
            }

            from.atk({
                actname:'atk',
                hitCallback : function(){
                    f();
                }
            });
        },
        "skill_65016012": function (data, skillAniConf, callback) {
            return this["skill_6501a012"](data, skillAniConf, callback);
        },
        "skill_65015012": function (data, skillAniConf, callback) {
            return this["skill_6501a012"](data, skillAniConf, callback);
        },
        
        "skill_14055012": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);

            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];

            if(!from || !to){
                return callback && callback();
            }

            var posAni = {
                1: 1,
                2: 2,
                3: 6,
                4: 5,
                5: 4,
                6: 3
            };

            skillAniConf.sound && X.audio.playEffect('skillsound/'+skillAniConf.sound+'.mp3',false);

            from.setTimeout(function(){
                from.atk({
                    actname:'skill',
                    hitCallback : function(){
                        me.addSpecialSkill(from, to.getPosition(), skillAniConf.ani, function (node, action) {
                            node.scaleX = from.data.side == 1 ? -1 : 1;
                            action.play("0" + posAni[from.data.pos], false);
                        }, function () {
                            for (var rid in data.to) {
                                me._act_showHPChangeWithoutModifyData({
                                    r: rid,
                                    v: parseInt(data.to[rid] / skillAniConf.frequent),
                                    at:'xp',
                                    bj: data.extData[rid].bj
                                });
                                var to = me.roleList[ rid ];
                                if(to){
                                    var _topos = to.getPosition();
                                    me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                                }
                            }
                        }, function () {
                            callback && callback();
                        });
                    }
                });
            },100);
        },
        "skill_14056012": function (data, skillAniConf, callback) {
            return this["skill_14055012"](data, skillAniConf, callback);
        },
        "skill_1405a012": function (data, skillAniConf, callback) {
            return this["skill_14055012"](data, skillAniConf, callback);
        },
        "skill_4_1108001": function (data, skillAniConf, callback) {

            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }

            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);

            from.zIndex = 1400-movetoPos.y + 10;
            from.runActions([
                cc.moveTo(0.1,movetoPos)
            ]);
            var needNum = skillAniConf.frequent;
            var num = 0;
            from.setTimeout(function(){
                from.atk({
                    actname:'atk',
                    atkType: data.atkType,
                    hitCallback : function(){
                        skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
                        for(var i=0;i<toIDS.length;i++){
                            (function(index){

                                for (var rid in data.to) {
                                    me._act_showHPChangeWithoutModifyData({
                                        r: rid,
                                        v: parseInt(data.to[rid] / skillAniConf.frequent),
                                        at:'xp',
                                        bj: data.extData[rid].bj
                                    });
                                    var to = me.roleList[ rid ];
                                    if(to){
                                        var _topos = to.getPosition();
                                        me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                                    }
                                }
                            })(i);
                        }

                        num ++;
                        if (num == needNum) {
                            callback && callback();
                        }
                    }
                });
            },200);
        },
        "skill_11086312_1108001": function(data, skillAniConf, callback){
            return this["skill_4_1108001"](data, skillAniConf, callback);
        },
        "skill_11085312_1108001": function(data, skillAniConf, callback){
            return this["skill_4_1108001"](data, skillAniConf, callback);
        },
        "skill_1108a312_1108001": function(data, skillAniConf, callback){
            return this["skill_4_1108001"](data, skillAniConf, callback);
        },
        "skill_33035012": function (data, skillAniConf, callback) {
            return this["skill_6501a012"](data, skillAniConf, callback);
        },
        "skill_33036012": function(data, skillAniConf, callback){
            return this["skill_33035012"](data, skillAniConf, callback);
        },
        "skill_3303a012": function(data, skillAniConf, callback){
            return this["skill_33035012"](data, skillAniConf, callback);
        },
        //森林狼
        "skill_44065002": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?1:-1) , _topos.y);

            from.zIndex = 1400-movetoPos.y;
            var scale = from.role.getScaleX();
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.role.setScaleX(-scale);
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                from.role.setScaleX(scale);
                                callback && callback();
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_44066002": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?1:-1) , _topos.y);

            from.zIndex = 1400-movetoPos.y;
            var scale = from.role.getScale();
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.role.setScaleX(-scale);
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                                from.role.setScaleX(scale);
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_44065022": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?1:-1) , _topos.y);

            from.zIndex = 1400-movetoPos.y;
            var scale = from.role.getScale();
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.role.setScaleX(-scale);
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                                from.role.setScaleX(scale);
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_44066022": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?1:-1) , _topos.y);

            from.zIndex = 1400-movetoPos.y;
            var scale = from.role.getScale();
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.role.setScaleX(-scale);
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                                from.role.setScaleX(scale);
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_4406a022": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?1:-1) , _topos.y);

            from.zIndex = 1400-movetoPos.y;
            var scale = from.role.getScale();
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.role.setScaleX(-scale);
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                                from.role.setScaleX(scale);
                            }, 500);

                        })
                    ]);
                }
            });
        },
        //森铃朗大招
        "skill_44065012": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);
            from.zIndex = 1400-movetoPos.y;
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_44066012": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);
            from.zIndex = 1400-movetoPos.y;
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                            }, 500);

                        })
                    ]);
                }
            });
        },
        "skill_4406a012": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);
            from.zIndex = 1400-movetoPos.y;
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    from.runActions([
                        cc.moveTo(0.2,movetoPos),
                        cc.callFunc(function () {
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                            return me.ui.setTimeout(function () {
                                callback && callback();
                            }, 500);

                        })
                    ]);
                }
            });
        },

        //传奇骑士大招
        "skill_7101a012": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _topos = to.getPosition();
            var movetoPos = cc.p(_topos.x + 150 * (from.data.side==0?-1:1) , _topos.y);
            var _hits = 0;
            var allLen = toIDS.length;
            var normalAtk = function (_callback) {
                _hits = 0;
                allLen = toIDS.length;
                from.runActions([
                    cc.moveTo(0.2,movetoPos),
                    cc.callFunc(function () {
                        from.role.stopAllAni();
                        from.atk({
                            actname:'atk',
                            atkType: data.atkType,
                            hitCallback : function(hitIndex){
                                if(hitIndex==0){
                                    for(var i=0;i<allLen;i++){
                                        (function(index){
                                            var _to = me.roleList[ toIDS[index] ];
                                            if(!_to){
                                                allLen--;
                                                return;
                                            }
                                            var _topos = _to.getPosition();
                                            me.hit_ani(from,_topos,G.gc.skillani['7101a002']);
                                            _hits++;
                                            if(_hits==allLen){
                                                me.ui.setTimeout(function () {
                                                    _callback && _callback();
                                                }, 50);
                                            }
                                        })(i);
                                    }
                                }
                            }
                        });
                    })
                ]);
            };
            for(var i=0;i<allLen;i++){
                (function(index){
                    var _to = me.roleList[ toIDS[index] ];
                    if(!_to){
                        allLen--;
                        return;
                    }
                    var _topos = _to.getPosition();

                    var _view = me._addSkillAni( cc.p(from.getPosition().x,_topos.y) , _topos , skillAniConf , function(){
                        _hits++;
                        //所有子弹已命中

                        //如果是多段伤害的话，不需要播放受击动画，这里得处理
                        if(skillAniConf.frequent==null || skillAniConf.frequent=='1'){
                            me.hit_ani(from,_topos,skillAniConf);
                        }

                        if(_hits==allLen){
                            me.ui.setTimeout(function () {
                                normalAtk(function () {
                                    callback && callback();
                                });
                            }, 200);
                        }
                    }, { from: from, to: _to}, data);

                })(i);
            }
        },
        //机械战警皮肤普工
        "skill_61035002_6103001": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var _hits = 0;
            var allLen = toIDS.length;
            from.role.stopAllAni();
            from.atk({
                actname:'atk',
                atkType: data.atkType,
                hitCallback : function(hitIndex){
                    if(hitIndex==0){
                        for(var i=0;i<allLen;i++){
                            (function(index){
                                var _to = me.roleList[ toIDS[index] ];
                                if(!_to){
                                    allLen--;
                                    return;
                                }
                                var _topos = _to.getPosition();
                                me.hit_ani(from,_topos,skillAniConf);
                                _hits++;
                                if(_hits==allLen){
                                    me.ui.setTimeout(function () {
                                        callback && callback();
                                    }, 500);
                                }
                            })(i);
                        }
                    }
                }
            });
        },
        "skill_61036002_6103001": function (data, skillAniConf, callback) {
            return this["skill_61035002_6103001"](data, skillAniConf, callback);
        },
        "skill_61035022_6103001": function (data, skillAniConf, callback) {
            return this["skill_61035002_6103001"](data, skillAniConf, callback);
        },
        "skill_61036022_6103001": function (data, skillAniConf, callback) {
            return this["skill_61035002_6103001"](data, skillAniConf, callback);
        },
        "skill_6103a022_6103001": function (data, skillAniConf, callback) {
            return this["skill_61035002_6103001"](data, skillAniConf, callback);
        },
        "skill_3111a012": function (data, skillAniConf, callback) {
            var me = this;
            var from = me.roleList[data.from];
            var toIds = Object.keys(data.to);
            var firstTo = me.roleList[toIds[0]];
            var toPos = cc.p(firstTo.data.pos <= 2 ?
                (from.data.side == 0 ? me._fightPanel.width / 2 + 65 : me._fightPanel.width / 2 - 65) :
                (from.data.side == 0 ? me._fightPanel.width / 2 + 150 : me._fightPanel.width / 2 - 150),
                me._fightPanel.height / 2 - 100);
            var needLen = toIds.length * skillAniConf.frequent;
            var count = 0;
            skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
            from.setPosition(toPos);
            from.atk({
                actname:'skill',
                hitCallback : function(){
                    for (var rid in data.to) {
                        me._act_showHPChangeWithoutModifyData({
                            r: rid,
                            v: parseInt(data.to[rid] / skillAniConf.frequent),
                            at:'xp',
                            bj: data.extData[rid].bj
                        });
                        var to = me.roleList[ rid ];
                        if(to){
                            var _topos = to.getPosition();
                            me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                        }
                        count ++;
                        if (count == needLen) {
                            return me.ui.setTimeout(function () {
                                callback && callback();
                            }, 500);
                        }
                    }
                }
            });
        },
        "skill_31116012": function (data, skillAniConf, callback) {
            return this["skill_3111a012"](data, skillAniConf, callback);
        },
        "skill_31115012": function (data, skillAniConf, callback) {
            return this["skill_3111a012"](data, skillAniConf, callback);
        },
        "skill_65015012_6501001": function (data, skillAniConf, callback) {
            var me = this;
            var from = me.roleList[data.from];
            var toIds = Object.keys(data.to);
            var lastRid;

            function skill (arr) {
                if (arr.length < 1) return me.ui.setTimeout(function () {
                    callback();
                }, 300);
                var rid = arr.shift();
                var to = me.roleList[rid];
                lastRid = lastRid || data.from;
                var formRole = me.roleList[lastRid];
                skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
                me._addSkillAni( formRole.getPosition() , to.getPosition() , skillAniConf , function(){
                    me._act_showHPChangeWithoutModifyData({
                        r: rid,
                        v: data.to[rid],
                        at:'xp',
                        bj: data.extData[rid].bj
                    });
                    me.hit_ani(from, to.getPosition(), skillAniConf);
                    lastRid = rid;
                    skill(arr);
                }, { from: formRole, to: to}, data);
            }
            from.atk({
                actname:'skill',
                hitCallback : function(){
                    skill(toIds);
                }
            });
        },
        "skill_65015012_6501002": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_65016012_6501002": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_6501a012_6501002": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_65016012_6501001": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_6501a012_6501001": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_22075012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_22076012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_2207a012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_32065012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_32066012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_3206a012": function (data, skillAniConf, callback) {
            return this["skill_65015012_6501001"](data, skillAniConf, callback);
        },
        "skill_14055012_1405001": function (data, skillAniConf, callback) {
            var me = this;
            var fromID = data.from,
                toIDS = Object.keys(data.to);
            var from = me.roleList[fromID],
                to = me.roleList[ toIDS[0] ];
            if(!from || !to){
                return callback && callback();
            }
            var needNum = skillAniConf.frequent;
            var num = 0;
            from.atk({
                actname:'skill',
                atkType: data.atkType,
                hitCallback : function(){
                    skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
                    for(var i=0;i<toIDS.length;i++){
                        (function(index){

                            for (var rid in data.to) {
                                me._act_showHPChangeWithoutModifyData({
                                    r: rid,
                                    v: parseInt(data.to[rid] / skillAniConf.frequent),
                                    at:'xp',
                                    bj: data.extData[rid].bj
                                });
                                var to = me.roleList[ rid ];
                                if(to){
                                    var _topos = to.getPosition();
                                    me.hit_ani( me.roleList[data.from],_topos,skillAniConf);
                                }
                            }
                        })(i);
                    }

                    num ++;
                    if (num == needNum) {
                        callback && callback();
                    }
                }
            });
        },
        "skill_14056012_1405001": function (data, skillAniConf, callback) {
            return this["skill_14055012_1405001"](data, skillAniConf, callback);
        },
        "skill_1405a012_1405001": function (data, skillAniConf, callback) {
            return this["skill_14055012_1405001"](data, skillAniConf, callback);
        },
        "skill_7_5101001": function (data, skillAniConf, callback) {
            return this["skill_4_1108001"](data, skillAniConf, callback);
        },
        amendStarPos: function (from, data, pos) {

            if (X.inArray(["31095012_3109001", "31096012_3109001", "3109a012_3109001"], data.skinId)) {//抬高邪龙霸主技能y值
                return cc.p(pos.x + (from.data.side == 0 ? 50 : -50), pos.y + 410);
            }
            if (X.inArray(["33035002","33036002","33035102","33036102","3303a102","33035012", "33036012", "3303a012"], data.skillid)) {//抬高地精技能位置
                return cc.p(pos.x + (from.data.side == 0 ? 25 : -25), pos.y + 150);
            }
            if (X.inArray(["44055012","44056012","4405a012"], data.skillid)) {//抬高观心技能位置
                return cc.p(pos.x + (from.data.side == 0 ? 25 : -25), pos.y + 350);
            }
            if (X.inArray(["19_4307001","43075212_4307001","43076212_4307001","4307a212_4307001"], data.skinId)) {//抬高艾琳皮肤普攻位置
                return cc.p(pos.x + (from.data.side == 0 ? 25 : -25), pos.y + 200);
            }
            if (X.inArray(["51025002_5102001","51026002_5102001","51025202_5102001","51026202_5102001",,"5102a202_5102001"], data.skinId)) {//抬高黑龙皮肤普攻位置
                return cc.p(pos.x + (from.data.side == 0 ? 25 : 0), pos.y + 150);
            }
			if (X.inArray(["25085012_2508001","25086012_2508001","2508a012_2508001"], data.skinId)) {//抬高侏儒大师皮肤技能位置
                return cc.p(pos.x + (from.data.side == 0 ? 25 : 25), pos.y +50);
            }
			if (X.inArray(["25085002_2508001","25086002_2508001","25085202_2508001","25086202_2508001","2508a202_2508001"], data.skinId)) {//抬高侏儒大师皮肤普攻位置
                return cc.p(pos.x + (from.data.side == 0 ? 50 : 50), pos.y + 100);
            }
            return false;
        }
    };
    
    var skillPublic = {
        "multi_skill": function (data, skillAniConf, callback) {
            var me = this;
            var toS = Object.keys(data.to);
            var from = me.roleList[data.from];
            var coutLen = 0;
            var needLen = toS.length * skillAniConf.frequent;

            skillAniConf.sound && X.audio.playEffect('skillsound/'+ skillAniConf.sound + '.mp3',false);
            from.atk({
                actname:'skill',
                hitCallback: function () {
                    for (var rid in data.to) {
                        (function (rid) {
                            var to = me.roleList[rid];
                            var _view = me._addSkillAni( from.getPosition() , to.getPosition() , skillAniConf , function(){
                                if (skillAniConf.frequent != null && skillAniConf.frequent != 1) {
                                    me._act_showHPChangeWithoutModifyData({
                                        r: rid,
                                        v: parseInt(data.to[rid] / skillAniConf.frequent),
                                        at:'xp',
                                        bj: data.extData[rid].bj
                                    });
                                }
                                me.hit_ani(from, to.getPosition(), skillAniConf);
                                coutLen ++;
                                if (coutLen == needLen) {
                                    callback && callback();
                                }
                            }, { from: from, to: to}, data);

                            if(skillAniConf.animovetype!='shape' && skillAniConf.animovetype!='bullet'){
                                if( from.data.side == 1 ){
                                    _view.scaleX = -1;
                                }else{
                                    _view.scaleX = 1;
                                }
                            }
                        })(rid);
                    }
                }
            });
        },
        "skill_43075012_4307001": function (data, skillAniConf, callback) {
            return this["multi_skill"](data, skillAniConf, callback);
        },
        "skill_43076012_4307001": function (data, skillAniConf, callback) {
            return this["multi_skill"](data, skillAniConf, callback);
        },
        "skill_4307a012_4307001": function (data, skillAniConf, callback) {
            return this["multi_skill"](data, skillAniConf, callback);
        }
    };

    for (var i in skillPublic) {
        G.frame.fight[i] = skillPublic[i];
        G.frame.tanxianFight[i] = skillPublic[i];
    }
    for (var i in skillConf) {
        G.frame.fight[i] = skillConf[i];
        G.frame.tanxianFight[i] = skillConf[i];
    }
})();