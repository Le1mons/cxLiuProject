/**
 * Created by on 2020-xx-xx.
 */
(function () {

    //
    var ID = 'tdGame';
    var fun = X.bUi.extend({
        atkRange: 180,
        jsAtkRange: 300,
        path: {
            0: ['1', '2', '3', '5', '6', '7'],
            1: ['4', '3', '5', '6', '7']
        },
        hero: {
            '3111001': {atk: 1500, model: '3111001', hid: '31115', zhanli: 999999, skin: {sid: '3111001'}},
            '3111002': {atk: 1500, model: '3111002', hid: '31116', zhanli: 999999, skin: {sid: '3111002'}},
            '3111a': {atk: 1500, model: '3111a', hid: '31115', zhanli: 999999},
        },
        enemy:[{"interval": 0.5,"speed": 60,"power":1,"frequent":0.4,"jianshengatk":0.1,"jianshenhp":10,"enemy": [{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.4, "hp": 2716, "npcid": 18},{"direction": 1, "scale": 0.4, "hp": 2716, "npcid": 19},{"direction": 0, "scale": 0.8, "hp": 4074, "npcid": 18},{"direction": 1, "scale": 0.8, "hp": 4074, "npcid": 19}]}],
        goToTop: function () {
            this.ui.zIndex = 100000 + 10;
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.bg_kaishi.show();
            me.nodes.kuaijin.setVisible(true);
            me.nodes.kuaijin.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.remove();
                        X.cacheByUid("jumXYX", 1);
                    },
                    zIndex: 100000 + 20,
                    richText: L("TDTS")
                }).show();
            });
            me.nodes.kaishi.setTouchEnabled(false);

            me.nodes.btn_kszd.click(function (sender) {
                if(me.ui.__timeoutTimer){
                    me.ui.clearTimeout(me.ui.__timeoutTimer);
                    delete me.ui.__timeoutTimer;
                }
                sender.removeAllChildren();
                G.frame.xstd_fightRead.show();
            });

            me.ui.__timeoutTimer = me.ui.setTimeout(function () {
                G.class.ani.show({
                    json: 'ani_xinshou_arrow',
                    cache: true,
                    autoRemove: false,
                    addTo: me.nodes.btn_kszd,
                    onload: function (_node, action) {
                        action.play("wait", true);
                    }
                });
            }, 3000);
            X.timeout()
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

            me.ui.finds('Image_1').hide();
            me.nodes.guanka_mingzi.setString('');

            me.nodes.ta1.zIndex = 1400 - me.nodes.ta1.y;
            me.nodes.ta2.zIndex = 1400 - me.nodes.ta2.y;
            me.nodes.ta3.zIndex = 1400 - me.nodes.ta3.y;
            me.nodes.zhu_jiaose.zIndex = 1400 - me.nodes.zhu_jiaose.y;
            me.nodes.guankaming.zIndex = 1400;

            G.class.ani.show({
                addTo: me.ui.finds("bg"),
                json: 'tafang_bg_tx1',
                repeat: true,
                autoRemove: false
            });
        },
        onOpen: function () {
            var me = this;

            me.DATA = me.data();
            me.CONF = me.enemy[0];
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

        },
        gameStart: function () {
            var me = this;
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
                var heroData = me.hero[me.DATA.hero[index]]
                var defRole = new G.class.defRole(heroData, {
                    atk: heroData.atk * me.CONF.power * me.CONF.frequent,
                    frequent: me.CONF.frequent,
                    scaleX: -1
                }, me);
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
            }, me);
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

            var enemy = new G.class.enemyRole(conf, me);
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

            if (bool) {
                me.ajax("user_initprize", [], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize,
                            addAni:true,
                            noclick:true,
                            showTxt: L('swjg_open'),
                        }).once("willClose", function () {
                            me.remove();
                        }).show();
                    }
                });
            } else {
                G.frame.tdFail.show();
            }
        }
    });
    G.frame[ID] = new fun('tafang.json', ID);

    // G.class.tdRole = ccui.Layout.extend({
    //     ctor: function (data, conf, rid) {
    //         this.pathIndex = 0;
    //         this.data = JSON.parse(JSON.stringify(data));
    //         this.conf = conf;
    //         this.rid = rid;
    //         this.maxHp = this.data.hp;
    //         this.path = G.frame.tdGame.path[data.direction]
    //         this._super.apply(this, arguments);
    //         this.showRole();
    //         this.init();
    //         this.f5Bar();
    //         return this;
    //     },
    //     showRole: function () {
    //         var me = this;
    //
    //         me.setScaleX(me.data.direction == 0 ? 1 : -1);
    //         X.spine.show({
    //             json:'xinshou_tafang/spine/tf_guaiwu'+ me.data.id +'.json',
    //             addTo : me,
    //             x:0,y:0,z:0,
    //             autoRemove:false,
    //             onload : function(node){
    //                 me.role = node;
    //                 node.setScale(me.data.scale);
    //                 node.runAni(0, 'run', true);
    //             }
    //         });
    //     },
    //     init: function () {
    //         var me = this;
    //         var from = G.frame.tdGame;
    //         var pos = from.ui.finds("tc" + me.path[me.pathIndex]).getPosition();
    //         me.setPosition(pos);
    //         me.pathIndex ++;
    //         me.run();
    //         me.upZ();
    //     },
    //     upZ: function () {
    //         var me = this;
    //
    //         if (!cc.isNode(me)) return;
    //         me.zIndex = 2000 - me.y;
    //         me.setTimeout(function () {
    //             me.upZ();
    //         }, 300);
    //     },
    //     run: function () {
    //         var me = this;
    //         var from = G.frame.tdGame;
    //         var node = from.ui.finds("tc" + me.path[me.pathIndex]);
    //         if (me.die) return false;
    //         if (!node) {
    //             G.frame.tdGame.hp --;
    //             G.frame.tdGame.showHp();
    //             G.frame.tdGame.enemyList[me.rid] = undefined;
    //             delete G.frame.tdGame.enemyList[me.rid];
    //             me.hide();
    //             return me.setTimeout(function () {
    //                 me.removeFromParent();
    //             }, 3000);
    //         }
    //         me.runActions([
    //             cc.moveTo(me.conf.speed, node.getPosition()),
    //             cc.callFunc(function () {
    //                 me.pathIndex ++;
    //                 me.run();
    //             })
    //         ]);
    //     },
    //     f5Bar: function () {
    //         if (!this.hbBar) {
    //             this.hbBar = new ccui.ImageView("img/xiaoyouxi/bg_zhandou_jdt.png", 1);
    //             this.hbBar.setAnchorPoint(0.5, 0.5);
    //             this.hbBar.setPosition(0, 140);
    //             this.addChild(this.hbBar);
    //
    //             this.hbBar.bar = new ccui.LoadingBar();
    //             this.hbBar.bar.setAnchorPoint(0.5, 0.5);
    //             this.hbBar.bar.setPosition(this.hbBar.width / 2, this.hbBar.height / 2);
    //             this.hbBar.bar.loadTexture("img/xiaoyouxi/img_zhandou_jdt1.png", 1);
    //             this.hbBar.addChild(this.hbBar.bar);
    //         }
    //         this.hbBar.bar.setPercent(this.data.hp / this.maxHp  * 100);
    //         if (this.data.hp <= 0) {
    //             this.hbBar.hide();
    //         }
    //     },
    //     hmpChange: function () {
    //         var dps = G.frame.tdGame.dps[G.frame.tdGame.lv];
    //         var label = new cc.LabelBMFont(X.rand(dps[0], dps[1]) * -1, "img/fnt/sz_zd1.fnt");
    //         label.y = this.y  + X.rand(80,100);
    //         label.x = this.x + X.rand(-30,30);
    //         label.zIndex = 999999;
    //         this.getParent().addChild(label);
    //         var xfx=1;
    //         if(this.data.direction==0){
    //             xfx = -1;
    //         }
    //         label.runActions([
    //             cc.jumpBy(0.3,cc.p(
    //                 X.rand(30,50) * xfx,
    //                 X.rand(20,60)
    //             ), 50, 1),
    //
    //             cc.jumpBy(0.15,cc.p(
    //                 20 * xfx,
    //                 10
    //             ), 10, 1),
    //
    //             cc.fadeOut(0.7),
    //             cc.removeSelf()
    //         ]);
    //     },
    //     byAtk: function (val) {
    //         var me = this;
    //         if (me.die) return null;
    //         G.class.ani.show({
    //             json: 'xinshou_tafang/teshuwanfa_td_bd_dh',
    //             addTo: me,
    //             y: 50
    //         });
    //         me.hmpChange();
    //         me.data.hp -= val;
    //         me.f5Bar();
    //         if (me.data.hp <= 0) {
    //             me.die = true;
    //             me.stopAllActions();
    //             G.frame.tdGame.enemyList[me.rid] = undefined;
    //             delete G.frame.tdGame.enemyList[me.rid];
    //             me.role.runAni(0, 'die', false);
    //             G.frame.tdGame.money += me.data.money;
    //             G.frame.tdGame.showMoney();
    //             me.role.runActions([
    //                 cc.fadeOut(1)
    //             ]);
    //             me.setTimeout(function () {
    //                 me.removeFromParent();
    //             }, 3000);
    //         }
    //     }
    // });
})();