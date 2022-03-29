(function () {
    var me = G.frame.fight;

    // G.class.fight_skill = {
    //     "skill_6501a012": function (data, skillAniConf, callback) {
    //         var retard = 0.1;
    //         var fromID = data.from,
    //             toIDS = Object.keys(data.to);
    //
    //         var from = me.roleList[fromID],
    //             to = me.roleList[ toIDS[0] ];
    //
    //         if(!from || !to){
    //             return callback && callback();
    //         }
    //
    //         var _hits=0;
    //         var allLen = toIDS.length;
    //
    //         skillAniConf.sound && X.audio.playEffect('skillsound/'+skillAniConf.sound+'.mp3',false);
    //
    //         function f() {
    //             if(allLen == 0) return callback && callback();
    //
    //             to = me.roleList[ toIDS[_hits] ];
    //             var _topos = to.getPosition();
    //
    //             me._addSkillAni( from.getPosition() , _topos , skillAniConf , function(){
    //                 me.hit_ani(from,_topos,skillAniConf);
    //             }, { from: from, to: to});
    //
    //             _hits ++;
    //             allLen --;
    //
    //             me.ui.setTimeout(function () {
    //                 f();
    //             }, 1000 * retard);
    //         }
    //
    //         from.setTimeout(function(){
    //             from.atk({
    //                 actname:'atk',
    //                 hitCallback : function(){
    //                     f();
    //                 }
    //             });
    //         },100);
    //     },
    //     "skill_65016012": function (data, skillAniConf, callback) {
    //         return this["skill_6501a012"](data, skillAniConf, callback);
    //     },
    //     "skill_65015012": function (data, skillAniConf, callback) {
    //         return this["skill_6501a012"](data, skillAniConf, callback);
    //     }
    // };

    var skillConf = {
        "skill_6501a012": function (data, skillAniConf, callback) {
            var retard = 0.1;
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
                }, { from: from, to: to});

                _hits ++;
                allLen --;

                me.ui.setTimeout(function () {
                    f();
                }, 1000 * retard);
            }

            from.setTimeout(function(){
                from.atk({
                    actname:'atk',
                    hitCallback : function(){
                        f();
                    }
                });
            },100);
        },
        "skill_65016012": function (data, skillAniConf, callback) {
            return me["skill_6501a012"](data, skillAniConf, callback);
        },
        "skill_65015012": function (data, skillAniConf, callback) {
            return me["skill_6501a012"](data, skillAniConf, callback);
        }
    };

    for (var i in skillConf) {
        me[i] = skillConf[i];
    }
})();