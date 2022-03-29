/**
 * Created by
 */
(function () {
    //
    var ID = 'td_fight';
    var fun = X.bUi.extend({
        atkRange: 180,
        jsAtkRange: 300,
        path: {
            0: ['1', '2', '3', '5', '6', '7'],
            1: ['4', '3', '5', '6', '7']
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.kuaijin.setVisible(me.DATA.showJump);
            me.nodes.kuaijin.click(function () {
                me.stopGame();
                me.checkWin(true);
            });
            me.nodes.kaishi.setTouchEnabled(false);
        },
        stopGame: function () {
            var me = this;
            me.gameOver = true;
            cc.each(me.enemyList, function (role) {
                role.stopAllActions();
            });
        },
        initUi: function () {
            var me = this;

            me.nodes.guanka_mingzi.setString({
                hero: L("WUWEI"),
                jinbi: L("FENGSHOU"),
                exp: L("JY"),
            }[me.DATA.type] + L("JIANGE") + '-' + G.gc.mrslcon.title[Number(me.DATA.idx) - 1]);

            me.nodes.ta1.zIndex = 1400 - me.nodes.ta1.y;
            me.nodes.ta2.zIndex = 1400 - me.nodes.ta2.y;
            me.nodes.ta3.zIndex = 1400 - me.nodes.ta3.y;
            me.nodes.zhu_jiaose.zIndex = 1400 - me.nodes.zhu_jiaose.y;
            me.nodes.guankaming.zIndex = 1400;

            G.class.ani.show({
                addTo: me.ui.finds("bg"),
                json: 'tafang_bg_tx' + {
                    "jinbi": "1",
                    "exp": "2",
                    "hero": "3"
                }[me.DATA.type],
                repeat: true,
                autoRemove: false
            });
        },
        onOpen: function () {
            var me = this;

            me.DATA = me.data();
            me.CONF = G.gc.jgsw[me.DATA.type][me.DATA.idx][0];
            //me.CONF.speed = 50;
            me.enemyNum = me.CONF.enemy.length;
            me.defHp = me.CONF.jianshenhp;
            me.enemyList = [];
            me.enemyIndex = 0;
            me.roleList = {};
            me.bindBtn();
            me.initUi();
            me._fightPanel = me.nodes.panel_gw;
        },
        onShow: function () {
            var me = this;

            me.showDefHp();
            me.showEnemyNum();
            me.initDefRole();
            me.initEnemy();
        },
        showEnemyNum: function () {
            this.nodes.guai_sz.setString(this.enemyNum);
        },
        showDefHp: function () {
            this.ui.finds('Text_3').setString(this.defHp);
            this.nodes.xuetiao.setPercent(this.defHp / this.CONF.jianshenhp * 100);
            if (this.defHp == 0) {
                this.stopGame();
                this.checkWin(false);
            }
        },
        initDefRole: function () {
            var me = this;

            for (var index = 0; index < me.DATA.hero.length; index ++) {
                var parent = me.nodes['ta' + (index + 1)];
                var heroData = G.DATA.yingxiong.list[me.DATA.hero[index]]
                var defRole = new G.class.defRole(heroData, {
                    atk: heroData.atk * me.CONF.power * me.CONF.frequent,
                    frequent: me.CONF.frequent,
                    scaleX: -1
                });
                defRole.setPosition(parent.width / 2, 20);
                parent.addChild(defRole);
                G.class.ani.show({
                    json: "ani_shenchong_shuaxin_dh",
                    addTo: parent
                });
            }
            var defRole = new G.class.defRole(G.gc.hero[31116], {
                frequent: me.CONF.frequent,
                atkRange: me.jsAtkRange,
                scaleNum: .7
            });
            var parent = me.nodes.zhu_jiaose;
            defRole.setPosition(parent.width / 2, 50);
            parent.addChild(defRole);
            G.class.ani.show({
                json: "ani_shenchong_shuaxin_dh",
                addTo: parent
            });
            defRole.zIndex = -1;
        },
        initEnemy: function () {
            var me = this;
            var conf = me.CONF.enemy[me.enemyIndex];

            var enemy = new G.class.enemyRole(conf);
            me.enemyList.push(enemy);
            me.roleList['rid' + me.enemyIndex] = enemy;
            if (me.CONF.enemy[me.enemyIndex + 1]) {
                me.enemyIndex ++;
                me.ui.setTimeout(function () {
                    me.initEnemy();
                }, 1000 * me.CONF.interval);
            }
        },
        delEnemy: function (enemy) {
            var idx = this.enemyList.indexOf(enemy);
            this.enemyList.splice(idx, 1);

            if (this.enemyList.length == 0 && this.enemyNum <= 0) {
                if (this.defHp > 0) this.checkWin(true);
            }
        },
        checkWin: function (bool) {
            var me = this;
            if (me._checkWin) return null;
            me._checkWin = true;
            me.ajax('mrsl_fight', [me.DATA.type, me.DATA.idx, bool], function (str, data) {
                if (data.s == 1) {
                    if (bool) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).once('willClose', function () {
                            me.remove();
                        }).show();
                    } else {
                        G.frame.tdFail.data('jgsw').once('willClose', function () {
                            me.remove();
                        }).show();
                    }
                    G.hongdian.getData("mrsl", 1, function () {
                        G.frame.meirishilian.checkRedPoint();
                    });
                    G.frame.meirishilian.nodes.text_sycs.setString(data.d.lessnum);
                }
            });
        }
    });
    G.frame[ID] = new fun('tafang.json', ID);

    G.class.defRole = ccui.Layout.extend({
        ctor: function (data, conf, other) {
            this.other = other || G.frame.td_fight;
            this.data = data;
            this.conf = conf;
            this.aniState = '';
            this.atkRange = conf.atkRange || this.other.atkRange;
            this.scaleNum = conf.scaleNum || .5;
            this._super.apply(this, arguments);
            this.showRole();
            return this;
        },
        showRole: function () {
            var me = this;

            me.setScaleX(this.conf.scaleX || 1);
            var model = me.data.model || G.class.hero.getModel(me.data);
            if (me.data.skin && G.gc.skin[me.data.skin.sid]) {
                model = me.data.skin.sid;
            }
            X.spine.show({
                json:'spine/' + model + '.json',
                addTo: me,
                x:0,y:0,z:0,
                autoRemove:false,
                onload : function(node){
                    node.setScale(me.scaleNum);
                    me.role = node;
                    node.runAni(0, 'wait', true);
                    me.curAni = 'wait';
                    me.aniState = 'wait';
                    me.setTimeout(function () {
                      me.showAtk();
                    },500)
                }
            });

        },
        showAtk: function () {   
            if (this.other.gameOver) return;
            var me = this;
            var arr = [];
            for (var role of me.other.enemyList) {
                if (cc.pDistance(role.getPosition(), me.getParent().getPosition()) <= me.atkRange && !role.dead && role.checkHp > 0) {
                    arr.push(role);
                }
            }
            if (arr.length > 0) {
                arr.sort(function (a, b) {
                    return a.y < b.y ? -1 : 1;
                });
                var enemyRole = arr.shift();
                if (enemyRole.checkHp > 0) {
                    if (me.role._curAniName != 'atk') {
                        me.role.stopAllAni();
                        me.role.runAni(0, 'atk', true);
                        // me.curAni = 'atk';
                        // me.aniSate = 'atk';
                    }
                    var dpsVal = me.conf.atk ? me.conf.atk : enemyRole.data.hp * me.other.CONF.jianshengatk;
                    dpsVal = parseInt(dpsVal);
                    enemyRole.checkHp -= dpsVal;
                    G.frame.fight._addSkillAni.call(me.other,
                        me.getParent().getPosition(),
                        enemyRole.getPosition(),
                        {
                            releaseAni: me.conf.atk ? 'skillani/skilljson_huiqiu1' : 'xinshou_tafang/teshuwanfa_td_gj_dh',
                            animovetype: 'bullet'
                        },
                        function () {
                            enemyRole.byAtk(dpsVal, me.conf.atk ? 'skillani/skilljson_huiqiu0' : 'xinshou_tafang/teshuwanfa_td_bd_dh');
                        }, null, {from: me});
                } else {
                    if (me.role._curAniName != 'wait') {
                        me.role.stopAllAni();
                        me.role.runAni(0, 'wait', true);
                    }
                }
            } else {
                if (me.role._curAniName != 'wait') {
                    me.role.stopAllAni();
                    me.role.runAni(0, 'wait', true);
                }
            }
            me.setTimeout(function () {
                me.showAtk();
            }, 1000 * me.conf.frequent);
        }
    });
    G.class.defRole_1 = G.class.defRole.extend({
      ctor : function(data,other){
          this.other = other || G.frame.wjtf;
          this.data = data;
          this.hp = data.hp;
          this.checkHp = data.hp;
          this.pathIndex = 0;
          this._super.apply(this, arguments);
          this.atknum=0;
          this.harm=0;
          // this.initShow();
          // this.run();
          // this.showRole();
          // this.f5Bar();
          return this;
      },
      showAtk: function () {
        if (this.other.gameOver) return;
        var me = this;
        var arr = [];
        for (var role of me.other.enemyList) {
            if (cc.pDistance(role.getPosition(), me.starPos.getPosition()) <= me.atkRange && !role.dead && role.checkHp > 0) {
                arr.push(role);
            }
        }
        if (arr.length > 0) {
            arr.sort(function (a, b) {
                return a.y < b.y ? -1 : 1;
            });
            var enemyRole = arr.shift();
            if (enemyRole.checkHp > 0) {
                if (me.role._curAniName != 'atk') {
                    me.role.stopAllAni();
                    me.role.runAni(0, 'atk', true);
                    // me.curAni = 'atk';
                    // me.aniSate = 'atk';
                }
                var dpsVal = me.conf.atk ? me.conf.atk : enemyRole.data.hp * 0.1;
                this.atknum++;
                this.harm += dpsVal;
                dpsVal = parseInt(dpsVal);
                enemyRole.checkHp -= dpsVal;
                
                G.frame.fight._addSkillAni.call(me.other,
                    me.starPos.getPosition(),
                    enemyRole.getPosition(),
                    {
                        releaseAni: me.conf.atk ? 'skillani/skilljson_huiqiu1' : 'xinshou_tafang/teshuwanfa_td_gj_dh',
                        animovetype: 'bullet1'
                    },
                    function () {
                        enemyRole.byAtk(dpsVal, me.conf.atk ? 'skillani/skilljson_huiqiu0' : 'xinshou_tafang/teshuwanfa_td_bd_dh');
                    }, null, {from: me.other});
            } else {
                if (me.role._curAniName != 'wait') {
                    me.role.stopAllAni();
                    me.role.runAni(0, 'wait', true);
                }
            }
        } else {
            if (me.role._curAniName != 'wait') {
                me.role.stopAllAni();
                me.role.runAni(0, 'wait', true);
            }
        }
        me.setTimeout(function () {
            me.showAtk();
        }, 1000 * me.conf.frequent/me.other.speed);
    }
    })
    G.class.enemyRole = ccui.Layout.extend({
        ctor: function (data, other) {
            this.other = other || G.frame.td_fight;
            this.data = data;
            this.hp = data.hp;
            this.checkHp = data.hp;
            this.pathIndex = 0;
            this._super.apply(this, arguments);
        
            this.initShow();
            this.run();
            this.showRole();
            this.f5Bar();
            return this;
        },
        showRole: function () {
            var me = this;

            X.spine.show({
                json:'spine/' + G.class.hero.getModel(G.gc.npc[me.data.npcid][0]) + '.json',
                addTo: me,
                x:0,y:0,z:0,
                autoRemove:false,
                onload : function(node){
                    node.setScale(me.data.scale);
                    me.role = node;
                    node.runAni(0, 'wait', true);
                }
            });
            me.upZ();
        },
        upZ: function () {
            var me = this;

            // if (me.dead || me.other.gameOver) return;
            // me.zIndex = 1400 - me.y;
            // if (me.lastX) {
            //     if (me.lastX < me.x && me.scaleX != 1)  me.scaleX = 1;
            //     if (me.lastX > me.x && me.scaleX != -1) me.scaleX = -1;
            // }
            // me.lastX = me.x;
            // me.setTimeout(function () {
            //     me.upZ();
            // }, 100);
        },
        getNextNode: function (index) {
            return this.other.nodes['tc00' + this.other.path[this.data.direction][index || this.pathIndex]];
        },
        initShow: function () {
            this.other.enemyNum --;
            this.other.showEnemyNum();

            var me = this;
            var addTo = me.getNextNode();
            this.other.nodes.panel_gw.addChild(me);
            me.setPosition(addTo.x, addTo.y);
            me.pathIndex ++;
        },
        run: function () {
            var me = this;
            if (me.dead || this.other.gameOver) return;

            var toNode = me.getNextNode();
            var moveTime = cc.pDistance(me.getPosition(), toNode.getPosition()) / this.other.CONF.speed;
            me.runActions([
                cc.moveTo(moveTime, toNode.getPosition()),
                cc.callFunc(function () {
                    if (me.getNextNode(me.pathIndex + 1)) {
                        me.pathIndex ++;
                        me.run();
                    } else {
                        me.hide();
                        me.dead = true;
                        me.other.defHp --;
                        me.other.showDefHp();
                        me.other.delEnemy(me);
                    }
                })
            ]);
        },
        f5Bar: function () {
            if (!this.hbBar) {
                this.hbBar = new ccui.ImageView("img/tafang/bg_zhandou_jdt.png", 1);
                this.hbBar.setAnchorPoint(0.5, 0.5);
                this.hbBar.setPosition(0, 190 * this.data.scale);
                this.addChild(this.hbBar);
                this.hbBar.zIndex = 1000;

                this.hbBar.bar = new ccui.LoadingBar();
                this.hbBar.bar.setAnchorPoint(0.5, 0.5);
                this.hbBar.bar.setPosition(this.hbBar.width / 2, this.hbBar.height / 2);
                this.hbBar.bar.loadTexture("img/tafang/img_zhandou_jdt1.png", 1);
                this.hbBar.addChild(this.hbBar.bar);
            }
            this.hbBar.bar.setPercent(this.hp / this.data.hp  * 100);
            if (this.hp <= 0) {
                this.hbBar.hide();
            }
        },
        hmpChange: function (val) {
            var label = new cc.LabelBMFont(val * -1, "img/fnt/sz_zd1.fnt");
            label.y = this.y  + X.rand(80,100);
            label.x = this.x + X.rand(-30,30);
            label.zIndex = 999999;
            if (!cc.isNode(this.getParent())) return;
            this.getParent().addChild(label);
            var xfx=1;
            if(this.data.direction==0){
                xfx = -1;
            }
            label.runActions([
                cc.jumpBy(0.3,cc.p(
                    X.rand(30,50) * xfx,
                    X.rand(20,60)
                ), 50, 1),

                cc.jumpBy(0.15,cc.p(
                    20 * xfx,
                    10
                ), 10, 1),

                cc.fadeOut(0.7),
                cc.removeSelf()
            ]);
        },
        byAtk: function (val, hitAni) {
            var me = this;
            if (me.die) return;
            G.class.ani.show({
                json: hitAni,
                addTo: me,
                y: 50
            });
            me.hp -= val;
            me.f5Bar();
            me.hmpChange(val);
            me.role.runAni(0, "byatk", false);
            me.role.addAni(0, "wait", true, 0);
            if (me.hp <= 0) {
                me.dead = true;
                me.stopAllActions();
                me.other.delEnemy(me);
                me.role.runAni(0, 'die', false);
                me.role.runActions([
                    cc.fadeOut(1)
                ]);
                me.setTimeout(function () {
                    me.removeFromParent()
                    
                }, 3000);
            }
        }
    });
  G.class.enemyRole_1 = G.class.enemyRole.extend({
    ctor : function(data,other){
        this.other = other || G.frame.wjtf;
        this.data = data;
        this.hp = data.hp;
        this.checkHp = data.hp;
        this.pathIndex = 0;
        this._super.apply(this, arguments);
        // this.initShow();
        // this.run();
        // this.showRole();
        // this.f5Bar();
        return this;
    },
    initShow: function () {
      this.other.enemyNum --;
      this.other.showEnemyNum();

      var me = this;
      var addTo = me.getNextNode();
      this.other.nodes.panel_gw.addChild(me);
      me.setPosition(addTo.x, addTo.y);
      me.pathIndex ++;
    },
    getNextNode: function (index) {
        return this.other.nodes['panel_dw' + this.other.path[this.data.direction][index || this.pathIndex]];
    },
    showRole: function () {
      var me = this;

        X.spine.show({
            json:'spine/' + G.class.hero.getModel(G.class.hero.getById(me.data.id)) + '.json',
            addTo: me,
            x:0,y:0,z:0,
            autoRemove:false,
            onload : function(node){
                node.setScale(me.data.scale);
                me.role = node;
                node.runAni(0, 'wait', true);
            }
        });
        me.upZ();
    },
    run: function () {
      var me = this;
      if (me.dead || this.other.gameOver) return;

      var toNode = me.getNextNode();
      var moveTime = cc.pDistance(me.getPosition(), toNode.getPosition()) /  G.gc.wjtf.enemy.speed / me.other.speed;
      me.runActions([
          cc.moveTo(moveTime, toNode.getPosition()),
          cc.callFunc(function () {
              if (me.getNextNode(me.pathIndex + 1)) {
                  me.pathIndex ++;
                  me.run();
              } else {
                  me.hide();
                  me.dead = true;
                  me.other.defHp--;
                  me.other.nodes.panel_gw.jianHp(1);
                  me.other.showDefHp();
                  me.other.delEnemy(me);
                  me.removeFromParent();
              }
          })
      ]);
  },
    })
})();