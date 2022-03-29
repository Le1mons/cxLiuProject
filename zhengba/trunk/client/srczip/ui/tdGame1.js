/**
 * Created by wfq on 2018/5/25.
 */
(function () {
  //饰品-详情
  var ID = 'tdGame1';

  var fun = X.bUi.extend({
    guideConf: {
      1: {
        intr: "",
        pos: function () {
          return G.frame.tdGame1.nodes.btn_tz;
        },
        p: {
          x: -130,
          y: 20
        }
      },
      2: {
        intr: "点击任意祭坛可建造建筑",
        pos: function () {
          return G.frame.tdGame1.nodes.tc004
        },
        p: {
          x: -130,
          y: 20
        }
      },
      3: {
        intr: "请选择需要出战的英雄",
        pos: function () {
          return G.frame.tdGame1.guide1
        },
        p: {
          x: -130,
          y: 20
        }
      },
      4: {
        intr: "点击祭坛升级英雄",
        pos: function () {
          var key = Object.keys(G.frame.tdGame1.mapData)[0] * 1;
          key = key > 9 ? key : "0" + key;
          return G.frame.tdGame1.nodes["tc0" + key];
        },
        p: {
          x: -130,
          y: 20
        }
      },
      5: {
        intr: "点击升级按钮",
        pos: function () {
          return G.frame.tdGame_up.nodes.btn_l;
        },
        p: {
          x: -130,
          y: 20
        }
      },
      6: {
        intr: "注意，剩余血量为0时失败",
        pos: function () {
          return G.frame.tdGame1.nodes.panel_xl;
        },
        p: {
          x: -100,
          y: 20
        }
      },
    },
    atkRange: 180,
    jsAtkRange: 300,
    gold: 100,
    hp: 20,
    hero: {
      '3111001': {
        atk: 1500,
        model: '3111001',
        hid: '31115',
        zhanli: 999999,
        key: 1,
        skin: {
          sid: '3111001'
        }
      },
      '3111002': {
        atk: 1500,
        model: '3111002',
        hid: '31116',
        zhanli: 999999,
        key: 2,
        skin: {
          sid: '3111002'
        }
      },
      '3111a': {
        atk: 1500,
        key: 3,
        model: '3111a',
        hid: '31115',
        zhanli: 999999
      },
    },
    enemy: {
      "interval": 0.5,
      "speed": [60],
      "power": 1,
      "frequent": 0.4,
      "jianshengatk": 0.1,
      "jianshenhp": 10,
      "gold": 10,
      "need": 90,
      "enemy": [[{
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 596,
        "id": 11011
      }],[{
        "direction": 0,
        "scale": 0.4,
        "hp": 2016,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2016,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }, {
        "direction": 0,
        "scale": 0.4,
        "hp": 2409,
        "id": 11023
      }]]
    },

    path: {
      0: ['1', '2', '3', '4', '5', '6'],
    },
    ctor: function (json, id) {
      var me = this;
      me.singleGroup = "f5";
      this.preLoadRes = ['tafang.plist', 'tafang.png'];
      me._super(json, id, {
        action: true
      });
    },
    bindBtn: function () {
      var me = this;
      me.nodes.btn_fh.hide();
      // me.nodes.btn_fh.click(function () {
      //   me.remove();
      // })
      me.nodes.panel_xl.setTouchEnabled(true);
      me.nodes.panel_xl.click(function () {
        me.removeGuide();
      })
      me.nodes.btn_bz.hide();
      me.nodes.panel_sz.click(function (sender) {
        sender.hide();
        me.removeGuide();
        me.clickNode.showState(false);
      })
      me.nodes.btn_tz.click(function (sender) {
        me.showGuide(2);
        sender.hide();
        me.overGame = true;
        me.showTime();
      });
      me.nodes.btn_cz.hide();
      // me.nodes.btn_cz.click(function () {
      //   me.reSetData()
      // })
      me.nodes.btn_jl.hide();
      // me.nodes.btn_jl.click(function () {
      //   G.frame.wjtf_rank.show();
      // })
    },
    goToTop: function () {
      this.ui.zIndex = 100000 + 10;
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
      for (var i = 0; i < 7; i++) {
        var list_ico = view.nodes.list_ico.clone();
        X.autoInitUI(list_ico);
        list_ico.nodes.panel_zz.setTouchEnabled(false);
        list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
        list_ico.nodes.panel_zz.setScale(0.8);
        list_ico.show();
        list_ico.data = i;
        list_ico.setTouchEnabled(true);
        list_ico.click(function (sender, type) {
          for (var j = 0; j < me._menus.length; j++) {
            var node = me._menus[j];
            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
            if (node.data == sender.data) {
              me.curType = sender.data;
              me.fmtItemList();
              img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
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
              if (node.ani) node.ani.hide();
            }
            node.nodes.panel_zz.setBackGroundImage(img, 1);
          }
        });

        me._menus.push(list_ico);
        listview.pushBackCustomItem(list_ico);
        list_ico.show();
      }
      listview.children[0].triggerTouch(2);
    },
    fmtItemList: function () {
      var me = this;

      var scrollview = me.nodes.scrollview;
      cc.enableScrollBar(scrollview);
      scrollview.removeAllChildren();
      // me.nodes.list.hide();
      var data = me.getHeroData();
      var table = me.table = new X.TableView(scrollview, me.nodes.list, 5, function (ui, data) {
        me.setItem(ui, data);
      }, null, null, 1, 5);
      table.setData(data);
      table.reloadDataWithScroll(true);
    },
    setItem: function (ui, data) {
      var me = this;
      if (!me.guide1) {
        me.guide1 = ui;
      }
      X.autoInitUI(ui);
      var heroData;
      var heroData = G.gc.hero[data.hid];
      ui._tid = data;
      ui.setName(heroData.hid);
      var widget = G.class.shero(heroData, null, null, false);
      widget.setName('widget');
      widget.setAnchorPoint(0.5, 1);
      widget.setPosition(cc.p(ui.nodes.panel_ico.width * 0.5, ui.nodes.panel_ico.height));
      ui.heroData = heroData;
      ui.nodes.panel_ico.removeAllChildren();
      ui.nodes.panel_ico.addChild(widget);
      ui.nodes.panel_ico.setTouchEnabled(false);
      ui.nodes.panel_ico.show();
      var imgRwz = ui.nodes.img_rwz;
      imgRwz.hide();
      ui.setSwallowTouches(false);
      ui.setTouchEnabled(true);
      if (me.checkIsUse(ui._tid)) {
        ui.setTouchEnabled(false);
        widget.setGou(true);
      }
      var imgFsz = ui.nodes.img_fsz;
      if (heroData.fyz) imgFsz.show();
      else imgFsz.hide();
      ui.data = data;
      ui.touch(function (sender, type) {
        if (type == ccui.Widget.TOUCH_NOMOVE) {
          var need = me.enemy.need;
          if (me.gold < need) {
            G.tip_NB.show(L("WJTF_TIP4"))
            return
          };
          var obj = {
            data: ui._tid,
            lv: 1
          };
          me.gold -= need;
          me.setNeed()
          me.mapData[me.clickNode.key] = obj;
          me.setHeroNum();
          me.clickNode.addHero(obj);
          me.nodes.panel_sz.hide();
          me.removeGuide();
        }
      }, null, {
        "touchDelay": G.DATA.touchHeroHeadTimeInterval
      });

      ui.show();
    },
    checkIsUse: function (data) {
      var me = this;
      for (var key in me.mapData) {
        if (me.mapData[key].data.key == data.key) {
          return true
        }
      }
      return false
    },
    getHeroData: function () {
      var me = this;
      var arr = []
      for (var key in me.hero) {
        var data = me.hero[key];
        arr.push(data)
      }
      return arr;
    },
    onOpen: function () {
      var me = this;
      me.gameOver = false;
      me.CONF = me.enemy;
      me._fightPanel = me.nodes.panel_gw;
      me.enemyList = [];
      me.enemyIndex = 0;
      me.roleList = {};
      me.fillSize();
      me.getData(function () {
        me.bindBtn();
        me.initUi();
        me.setNeed();

      })
    },

    showTime: function () {
      var me = this;
      me.nodes.txt_sl1.setString(X.STR(L("WJTF_TIP2"), me.huihe+1));
      me.nodes.txt_sl2.show();
      me.nodes.btn_tz.hide();
      me.nodes.panel_xl.show();

      // me.nodes.btn_cz.hide()
      var num = 5;
      me.nodes.txt_sl2.setString(X.STR(L("WJTF_TIP23"), 5))
      me.Timer = me.ui.setInterval(function () {
        num--
        me.nodes.txt_sl2.setString(X.STR(L("WJTF_TIP23"), num))
        if (num == 0 && me.Timer) {
          me.starGame();
          me.ui.clearInterval(me.Timer);
          delete me.Timer;
        }

      }, 1000);
      // X.timeout(me.nodes.txt_sl2, G.time + 4, function () {
      //   // me.nodes.txt_sl2.hide();
      //   me.starGame();
      // }, null, null);
    },
    starGame: function () {
      var me = this;
      me.createEnamyData();
      me.initEnemy();
      me.showEnemyNum();
      // me.nodes.btn_cz.show();
    },
    showDefHp: function () {
      var me = this;
      me.nodes.guai_sz.setString(me.defHp);
    },
    initEnemy: function () {
      var me = this;
      var enemy = new G.class.enemyRole_1(me.enemyData[me.huihe][me.enemyIndex], me);
      me.enemyList.push(enemy);
      me.roleList['rid' + me.enemyIndex] = enemy;
      if (me.enemyData[me.huihe][me.enemyIndex + 1]) {
        me.enemyIndex++;
        me.ui.setTimeout(function () {
          me.initEnemy();
        }, 1000 * G.gc.wjtf.enemy.time);
      }
    },
    showEnemyNum: function () {
      var me = this;
      me.nodes.txt_sl2.setString(X.STR(L('WJTF_TIP3'), me.enemyNum));
      me.nodes.txt_zs.setString(me.gold);

    },
    createEnamyData: function () {
      var me = this;
      me.enemyNum = me.enemy.enemy[me.huihe].length;
      me.enemyData = me.enemy.enemy;
      // var hpConf = G.gc.wjtf.enemy.hp;
      // var hidArr = X.keysOfObject(G.gc.hero);
      // for (var i = 0; i < me.enemyNum; i++) {
      //   var obj = {
      //     id: X.arrayRand(hidArr),
      //     direction: 0,
      //     scale: 0.4,
      //     hp: parseInt(1 * (me.DATA.myinfo.layer + 1) * hpConf[1] / hpConf[0])
      //   };
      //   me.enemyData.push(obj);
      // }
    },
    initUi: function () {
      var me = this;
      if (!cc.isNode(me.ui)) return;
      me.defHero = [];
      // var endTime = X.getLastMondayZeroTime() + (22 + 24 * 6) * 3600;
      me.nodes.txt_sj2.hide();
      // X.timeout(me.nodes.txt_sj2, endTime, function () {
      //   G.tip_NB.show(L('WJTF_TIP21'));
      //   me.remove();
      // }, null, {
      //   showDay: true
      // });
      me.nodes.txt_zs.setString(me.gold);
      me.initHero();
      me.showDefHp();
      // me.showTime();
      me.setHeroNum();
    },
    onRemove: function () {
      var me = this;
      // me.reSetData();
      G.frame.tdGame_up.remove();
      me.removeGuide();
    },
    initHero: function () {
      var me = this;
      // return;
      for (var i = 1; i < 17; i++) {
        var node = me.nodes["tc0" + (i > 9 ? i : ("0" + i))];
        cc.log(node.getPosition())
        node.removeAllChildren();
        node.clnode = null;
        node.lv = null;
        node.zIndex = 99;
        me.initGrid(node);
        var clnode = me.nodes.zhu_jiaose.clone();
        node.addChild(clnode);
        clnode.setPosition(node.width / 2, node.height / 2 + 30);
        clnode.show();
        X.autoInitUI(clnode);
        clnode.setTouchEnabled(false);
        clnode.nodes.jiaose.setTouchEnabled(false);
        clnode.nodes.img_xz.setTouchEnabled(false);
        clnode.nodes.img_xz.hide();
        node.clnode = clnode;
        node.key = i;
        if (me.mapData[i]) {
          node.addHero(me.mapData[i])
        };

        node.checkUp();
        node.setlv();
        me.defHero.push(node);
      }
    },
    reSetData: function () {
      var me = this;
      me.enemyList.forEach(function name(item) {
        item.die = true;
        item.role.stopAllAni();
        item.removeFromParent();
      })
      me.overGame = false;
      me.enemyList = [];
      me.enemyIndex = 0;
      me.roleList = {};
      me.nodes.btn_tz.show();
      me.nodes.txt_sl2.hide();
      me.getData(function () {
        me.initUi();

      })
    },
    initGrid: function (node) {
      var me = this;
      node.sellHero = function () {
        for (var i = 1; i <= this.lv; i++) {
          me.gold += (me.enemy.need * 1);
        };
        me.mapData[this.key] = null;
        delete me.mapData[this.key];
        me.nodes.txt_zs.setString(me.gold);
        me.defHero.forEach(function (item) {
          item.checkUp();
        })
        this.clnode.nodes.jiaose.removeAllChildren();
        this.mapdata = "",
          this.clnode.hide();
        this.lv = null;
        this.canUp = false;
      };
      node.lvUp = function () {
        if (me.gold < (me.enemy.need)) {
          G.tip_NB.show(L("WJTF_TIP8"))
          return
        }
        this.lv++;
        me.gold -= (me.enemy.need * 1);
        me.setNeed()
        me.nodes.txt_zs.setString(me.gold);
        me.mapData[this.key].lv = this.lv * 1;
        me.defHero.forEach(function (item) {
          item.checkUp();
        })
        this.addHero(me.mapData[this.key])
      };
      node.addHero = function (data) {
        this.clnode.show();
        this.mapdata = data;
        this.clnode.nodes.img_fw.hide();
        var heroData = data.data;
        var conf = JSON.parse(JSON.stringify(G.gc.hero[heroData.hid]))
        // var heroList = G.class.hero.getHeroByPinglun(heroData.pinglunid);
        var lv = data.lv;
        heroData.star = conf.star;
        if (heroData.star <= lv) {
          this.isMax = true;
        } else {
          this.isMax = false;
        }
        // var hero = "";
        // for (var i = 0; i < heroList.length; i++) {
        //   if (heroList[i].star >= lv) {
        //     hero = heroList[i]
        //     break;
        //   }
        // }
        // if (!hero) {
        //   hero = heroList[heroList.length - 1];
        // };
        this.lv = data.lv * 1;
        this.setlv();
        this.checkUp();
        this.showState(false);
        // var conf = {
        //   hid: hero.hid,
        //   model: hero.model,
        //   skin: {

        //   },
        //   zhanli: 99999
        // };
        // conf.hid = hero.hid;
        var hero = new G.class.defRole_1(heroData, {
          atk: parseInt(heroData.atk * me.CONF.power * me.CONF.frequent * data.lv * data.lv / 4),
          frequent: me.CONF.frequent,
          atkRange: me.jsAtkRange,
          scaleNum: 0.5,
          scaleX: -1
        }, me);
        hero.setPosition(this.width / 2, 30);
        hero.starPos = this;
        this.clnode.nodes.jiaose.setScaleX(this.key > 8 ? 1 : -1);
        this.clnode.nodes.jiaose.removeAllChildren();
        this.clnode.nodes.jiaose.addChild(hero);
        G.class.ani.show({
          json: "ani_shenchong_shuaxin_dh",
          addTo: this
        });
      };
      // node.checkUp = function () {
      //   var lv = this.lv || 1;
      //   var need = G.gc.wjtf.upneed[lv];
      //   if (me.gold >= need && !this.isMax) {
      //     this.clnode.nodes.panel_sj.show();
      //     this.canUp = true;
      //   } else {
      //     this.canUp = false;
      //     this.clnode.nodes.panel_sj.hide();

      //   }
      // };
      node.showState = function (bool) {
        this.clnode.nodes.img_fw.setVisible(bool);
        this.clnode.nodes.img_xz.setVisible(bool);
      };
      node.checkUp = function () {
        var lv = this.lv || 1;
        var need = me.enemy.need;
        if (me.gold >= need && this.lv && !this.isMax) {
          this.clnode.nodes.panel_sj.show();
          this.canUp = true;

        } else {
          this.canUp = false;

          this.clnode.nodes.panel_sj.hide();

        }
      };

      node.setlv = function () {
        node.clnode.nodes.txt_dj.setString(X.STR(L("WJTF_TIP7"), this.lv || 0));
        node.clnode.nodes.panel_dj.setVisible(this.lv);
      };
      node.click(function (sender) {
        if (!me.overGame) return;
        if (node.lv) {
          if (!sender.canUp && !sender.isMax) {
            G.tip_NB.show(L("WJTF_TIP8"));
            return;
          };
          me.clickNode = sender;

          G.frame.tdGame_up.data({
            data: sender.mapdata,
            max: sender.isMax
          }).show();

        } else {
          cc.log(sender.getPosition());
          me.showGuide(3);
          var max = X.keysOfObject(me.hero).length;
          var hav = X.keysOfObject(me.mapData).length;
          if (hav >= max) return G.tip_NB.show(L('WJTF_TIP6'));
          me.table.reloadDataWithScroll(true);
          me.nodes.panel_sz.show();
          me.setNeed()
          sender.showState(true);
          me.clickNode = sender;
        }
      })
    },
    delEnemy: function (enemy) {
      var me = this;
      var idx = this.enemyList.indexOf(enemy);
      this.enemyList.splice(idx, 1);
      me.gold += me.enemy.gold;
      me.setNeed();
      me.nodes.txt_zs.setString(me.gold);
      if (this.enemyList.length == 0 && this.enemyNum <= 0) {
        if (this.defHp > 0) this.checkWin(true);
        if (this.defHp <= 0) {
          G.tip_NB.show(L('WJTF_TIP22'));
        }
      }
    },
    setHeroNum: function () {
      var me = this;
      var max = X.keysOfObject(me.hero).length;
      var hav = X.keysOfObject(me.mapData).length;
      var rh = X.setRichText({
        str: X.STR(L("WJTF_TIP5"), hav, max),
        parent: me.nodes.txt_cs,
        color: '#ffffff',
        outline: "#000000",
        size: 18
      });
      rh.x = 0;
    },
    next: function () {
      var me = this;
      me.action.playWithCallback("lujing", false, function () {
        me.action.playWithCallback("lujing", false, function () {
          me.action.play("wait", true)
        });
      })
      me.showGuide(4);
      me.enemyIndex = 0;
      me.initUi();
      me.showTime()
    },
    checkWin: function (bool) {
      var me = this;
      // if (me._checkWin) return null;
      // me._checkWin = true;
      if (me.huihe < me.enemyData.length-1) {
        me.huihe++;
        // me.DATA.myinfo.layer++;
        me.next();
        return
      }
      if (bool) {
        me.ajax("user_initprize", [], function (str, data) {
          if (data.s == 1) {
            me.removeGuide();
            G.frame.jiangli.data({
              prize: data.d.prize,
              addAni: true,
              noclick: true,
              showTxt: L('WJTF_TIP25'),
            }).once("willClose", function () {
              me.remove();
            }).show();
          }
        });
      } else {
        G.frame.tdFail.show();
      }
    },
    initMyDate: function (data) {
      var me = this;
      me.mapData = {};
      me.defHp = me.hp;
    },
    getData: function (callback) {
      var me = this;
      // G.ajax.send('wujintafang_open', [], function (d) {
      //   if (!d) return;
      //   var d = JSON.parse(d);
      //   if (d.s == 1) {
      me.initMyDate();
      callback && callback();
      //   }
      // }, true);
    },
    onAniShow: function () {
      var me = this;
    },
    onShow: function () {
      var me = this;
      // me.createMenu();
      me.huihe = 0;
      me.speed = 2;
      me.nodes.kuaijin.hide();
      me.ui.setTimeout(() => {
        G.frame.tdGame1.showGuide(1)
      }, 100);
      me.jianHp();
      me.fmtItemList();
      me.nodes.txt_djs.hide();
      me.curType = 0;
      me.nodes.panel_zs.show();
      me.action.play("wait", true);
    },
    setNeed: function () {
      var me = this;
      var rh = X.setRichText({
        str: "<font node=1></font>" + me.gold + "/" + me.enemy.need,
        parent: me.nodes.panel_xh,
        node: new ccui.ImageView("img/xintafang/img_zs.png", 1),
        maxWidth: 300,
        color: "#f6ebcd",
        outline: "#000000"
      });
      rh.setPosition(me.nodes.panel_xh.width / 2 - rh.trueWidth() / 2, me.nodes.panel_xh.height / 2 - rh.trueHeight() / 2);
    },
    onHide: function () {
      var me = this;
    },
    showGuide: function (idx) {
      var me = this;
      if (me.checkguide(idx)) return;
      var conf = me.guideConf[idx];
      X.cacheByUid("guideruo" + idx, true);
      me.removeGuide();
      X.guideRuo(conf, me)
      // me.event.once("guideruo", function () {
      //   if (me.guideConf[me.guideIdx]) {
      //     me.showGuide()
      //   }
      // })
    },
    removeGuide: function () {
      var me = this;
      me.aniNode && cc.isNode(me.aniNode) && me.aniNode.removeFromParent();
      me.aniNode = null;
      me._view && cc.isNode(me._view) && me._view.removeFromParent();
      me._view = null;
    },
    checkguide: function (idx) {
      var me = this;
      var bool = X.cacheByUid("guideruo" + idx);
      return bool
    },
    jianHp: function () {
      var me = this;
      me.nodes.panel_gw.jianHp = function (val) {
        var label = new cc.LabelBMFont(val * -1, "img/fnt/sz_zd1.fnt");
        label.y = me.nodes.panel_dw6.y + X.rand(80, 100);
        label.x = me.nodes.panel_dw6.x + X.rand(-30, 30);
        label.zIndex = 999999;
        // if (!cc.isNode(this.getParent())) return;
        this.addChild(label);
        var xfx = 1;
        label.runActions([
          cc.jumpBy(0.3, cc.p(
            X.rand(10, 20) * xfx,
            X.rand(10, 20)
          ), 50, 1),

          cc.jumpBy(0.15, cc.p(
            20 * xfx,
            10
          ), 10, 1),

          cc.fadeOut(0.7),
          cc.removeSelf()
        ]);
      }
    }
  });

  G.frame[ID] = new fun('tafang_1.json', ID);
})();