/**
 * Created by wfq on 2018/5/25.
 */
(function () {
  //饰品-详情
  var ID = 'wjtf';

  var fun = X.bUi.extend({
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
      me.nodes.btn_fh.click(function () {
        me.remove();
      })
      me.nodes.btn_bz.click(function () {

        G.frame.help.data({
          intr: L("WJTF_TIP20")
        }).show();
      });
      me.nodes.kuaijin.click(function () {
        if (me.speed == 1) {
          me.speed = 3;
          X.cacheByUid("tafang", 3);
          me.nodes.kuaijin.loadTextureNormal("img/tafang/btn_zhandou_js2.png", 1)

        } else {
          me.speed = 1;
          X.cacheByUid("tafang", 1);
          me.nodes.kuaijin.loadTextureNormal("img/tafang/btn_zhandou_js.png", 1)

        }

      })
      me.nodes.panel_sz.click(function (sender) {
        sender.hide();
        me.chooseData = null;
        me.clickTid = null;
        me.clickNode.showState(false);
        me.nodes.txt_sj2.show();
        me.nodes.txt_djs.show();
      })
      me.nodes.btn_tz.click(function (sender) {
        sender.hide();
        me.overGame = true;
        me.showTime();
      });
      me.nodes.btn_cz.click(function () {
        me.reSetData(true)
      })
      me.nodes.btn_jl.click(function () {
        G.frame.wjtf_rank.show();
      })
      me.nodes.btn_yj_kz.click(function () {
        // me.chooseData = {
        //   obj : {
        //     tid: ui._tid,
        //     lv: 1
        //   },
        //   need:need,
        // }
        if (!me.chooseData) {
          G.tip_NB.show(L("WJTF_TIP24"));
          return
        }
        me.gold -= me.chooseData.need;
        me.nodes.txt_zs.setString(me.gold);

        me.defHero.forEach(function (item) {
          item.checkUp();
        })

        me.mapData[me.chooseData.key] = me.chooseData.obj;
        me.setHeroNum();
        me.clickNode.addHero(me.chooseData.obj);
        me.nodes.panel_sz.hide();
        me.nodes.txt_sj2.show();
        me.nodes.txt_djs.show();
        me.chooseData = null;
        me.clickTid = null;
      })
    },
    createMenu: function () {
      var me = this;
      var view = me;
      me._menus = [];
      var listview = view.nodes.listview_zz;
      cc.enableScrollBar(listview);
      listview.removeAllChildren();
      listview.setSwallowTouches(true);
      listview.zIndex = 999;
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
      // me.nodes.list.hide();
      var data = me.getHeroData();
      // if (!me.table) {
      if (data.length < 1) {
        me.ui.finds("img_zwnr").show()
      } else {
        me.ui.finds("img_zwnr").hide()
      }
      if (!me.table) {
        scrollview.removeAllChildren();
        var table = me.table = new X.TableView(scrollview, me.nodes.list, 5, function (ui, data) {
          me.setItem(ui, data);
        }, null, null, 1, 5);
        table.setData(data);
        table.reloadDataWithScroll(true);
      } else {
        me.table.setData(data);
        me.table && me.table.reloadDataWithScroll(true);
      }
      // } else {
      //   me.table.setData(data);
      //   me.table && me.table.reloadDataWithScroll(true);
      // }
    },
    setItem: function (ui, data) {
      var me = this;
      X.autoInitUI(ui);
      var heroData;
      var heroData = G.DATA.yingxiong.list[data];
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
      ui.widget = widget;
      ui.setSwallowTouches(false);
      // cc.log("1111111111111111111111")
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
          var need = G.gc.wjtf.upneed[1];
          if (me.gold < need) {
            G.tip_NB.show(L("WJTF_TIP4"))
            return
          };
          me.clickTid = ui._tid;
          me.chooseData = {
            obj: {
              tid: ui._tid,
              lv: 1
            },
            need: need,
            key: me.clickNode.key
          }
          me.table && me.table.reloadDataWithScroll(false);
          // sender.widget.setGou(true);
          // var obj = {
          //   tid: ui._tid,
          //   lv: 1
          // };
          // me.gold -= need;
          // me.mapData[me.clickNode.key] = obj;
          // me.setHeroNum();
          // me.clickNode.addHero(obj);
          // me.nodes.panel_sz.hide();
          // me.nodes.txt_sj2.show();
          // me.nodes.txt_djs.show();
        }
      }, null, {
        "touchDelay": G.DATA.touchHeroHeadTimeInterval
      });

      ui.show();
    },
    checkIsUse: function (tid) {
      var me = this;
      for (var key in me.mapData) {
        if (me.mapData[key].tid == tid) {
          return true
        }
      }
      if (me.clickTid == tid) {
        return true;
      }
      return false
    },
    getHeroData: function () {
      var me = this;
      var arr = []
      for (var key in G.DATA.yingxiong.list) {
        var data = G.DATA.yingxiong.list[key];
        if (me.curType && data.zhongzu == me.curType) {
          arr.push(key)
        } else if (!me.curType) {
          arr.push(key)

        }
      }
      arr.sort(function (a, b) {
        var _a = G.DATA.yingxiong.list[a];
        var _b = G.DATA.yingxiong.list[b];
        if (_a.star == _b.star) {
          if (_a.lv == _b.lv) {
            return _b.hid - _a.hid;
          } else {
            return _b.lv - _a.lv
          }
        } else {
          return _b.star - _a.star
        }
      })
      return arr;
    },
    onOpen: function () {
      var me = this;
      me.speed = X.cacheByUid("tafang") || 1;
      if (me.speed == 1) {
        me.nodes.kuaijin.loadTextureNormal("img/tafang/btn_zhandou_js.png", 1)
      } else {
        me.nodes.kuaijin.loadTextureNormal("img/tafang/btn_zhandou_js2.png", 1)

      }
      me.tf=[];
      me.gameOver = false;
      me._fightPanel = me.nodes.panel_gw;
      me.enemyList = [];
      me.enemyIndex = 0;
      me.roleList = {};
      me.fillSize();
      me.createMenu();
      me.getData(function () {

        me.initUi();
        me.setNeed();
        me.bindBtn();

      })
    },

    showTime: function () {
      var me = this;
      me.nodes.txt_sl1.setString(X.STR(L("WJTF_TIP2"), me.DATA.myinfo.layer + 1));
      me.nodes.txt_sl2.show();
      me.nodes.btn_tz.hide();
      me.nodes.btn_cz.hide();
      me.nodes.btn_jl.hide();
      me.nodes.btn_bz.hide();
      me.nodes.panel_zs.show();
      me.nodes.panel_xl.show();
      var num = 5;
      if (!me.friest) {
        me.friest = true;
        if (me.DATA.myinfo.layer > 80) {
          
          num = 60;
        } else if(me.DATA.myinfo.layer <= 80 && me.DATA.myinfo.layer >= 31){
          num = 45;
          
        } else {
          num = 15;
          
        }
      }
      me.nodes.txt_sl2.setString(X.STR(L("WJTF_TIP23"), num))
      me.Timer = me.ui.setInterval(function () {
        num--
        me.nodes.txt_sl2.setString(X.STR(L("WJTF_TIP23"), num))
        if (num == 0 && me.Timer) {
          me.starGame();
          me.ui.clearInterval(me.Timer);
          delete me.Timer;
        }

      }, 1000);
      me.defHero.forEach(function (item) {
        item.checkUp();
      })
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
      me.nodes.guai_sz.setString(me.defHp > 0 ? me.defHp : 0);
    },
    initEnemy: function () {
      var me = this;
      var enemy = new G.class.enemyRole_1(me.enemyData[me.enemyIndex], me);
      me.enemyList.push(enemy);
      me.roleList['rid' + me.enemyIndex] = enemy;
      if (me.enemyData[me.enemyIndex + 1]) {
        me.enemyIndex++;
        me.timer2 = me.ui.setTimeout(function () {
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
      me.enemyNum = 11 + parseInt(me.DATA.myinfo.layer / G.gc.wjtf.enemy.num);
      me.enemyData = [];
      var hpConf = G.gc.wjtf.enemy.hp;
      getHid = function () {
        if (!me.hidArr) {
          me.hidArr = [];
          var hidArr = X.keysOfObject(G.gc.hero);
          for (var i = 0; i < 25; i++) {
            me.hidArr.push(hidArr[i])
          }
        }
        return X.arrayRand(me.hidArr)
      }
      for (var i = 0; i < me.enemyNum; i++) {
        var obj = {
          id: getHid(),
          direction: 0,
          scale: 0.4,
          hp: parseInt(1 * (me.DATA.myinfo.layer + 1) * hpConf[1] / hpConf[0])
        };
        me.enemyData.push(obj);
      }
    },
    initUi: function (bool) {
      var me = this;
      if (!cc.isNode(me.ui)) return;
      me.nodes.txt_sl1.setString(X.STR(L("WJTF_TIP2"), me.DATA.myinfo.layer + 1));
      var starTime = X.getLastMondayZeroTime() + 10 * 3600;
      var endTime = X.getLastMondayZeroTime() + (22 + 24 * 6) * 3600;
      if (G.time > starTime && G.time < endTime) {

        X.timeout(me.nodes.txt_sj2, endTime, function () {
          G.tip_NB.show(L('WJTF_TIP21'));
          me.remove();
        }, null, {
          showDay: true
        });
      }
      me.nodes.txt_zs.setString(me.gold);
      if (!bool) {
        me.defHero = [];
        me.initHero();
      }
      me.showDefHp();
      // me.showTime();
      me.setHeroNum();
    },
    onRemove: function () {
      var me = this;
      // me.reSetData();
    },
    initHero: function () {
      var me = this;
      // return;
      for (var i = 1; i < 17; i++) {
        var node = me.nodes["tc0" + (i > 9 ? i : ("0" + i))];
        // cc.log(node.getPosition())
        node.removeAllChildren();
        node.clnode = null;
        node.lv = null;
        me.initGrid(node);
        node.zIndex = 9999;

        var clnode = me.nodes.zhu_jiaose.clone();
        node.addChild(clnode);
        clnode.setPosition(node.width / 2, node.height / 2 + 30);
        clnode.show();
        X.autoInitUI(clnode);
        clnode.setTouchEnabled(false);
        clnode.nodes.jiaose.setTouchEnabled(false);
        clnode.nodes.img_xz.setTouchEnabled(false);
        clnode.nodes.img_xz.hide();
        X.enableOutline(clnode.nodes.txt_sj, "#000000", 2)
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
    reSetData: function (bool) {
      var me = this;

      me.enemyList.forEach(function name(item) {
        item.die = true;
        item.role.stopAllAni();
        item.removeFromParent();
      })
      me.enemyList = [];
      me.enemyIndex = 0;
      me.roleList = {};
      // me.nodes.txt_sl2.hide();
      // me.nodes.txt_yjs.hide();
      me.nodes.btn_cz.hide();

      if (bool) {
        me.nodes.txt_sl2.hide();
        me.nodes.btn_tz.show();
        me.overGame = false;
        me.nodes.btn_jl.show();
        me.nodes.btn_bz.show();
        me.ajax('wujintafang_layer', [0, {},0], function (d) {
          if (!d) return;
          var d = JSON.parse(d);
          if (d.s == 1) {
            // me.DATA = d.d;
            me.getData(function () {
              X.spine.clearAllCache();
              me.nodes.txt_sl1.setString(X.STR(L("WJTF_TIP2"), me.DATA.myinfo.layer + 1));
              me.initUi();

            })
          }
        }, true);
      } else {
        me.getData(function () {
          me.initUi(true);

        })
      }

    },
    initGrid: function (node) {
      var me = this;
      node.sellHero = function () {
        for (var i = 1; i <= this.lv; i++) {
          me.gold += (G.gc.wjtf.upneed[i] * 1);
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
        if (me.gold < (G.gc.wjtf.upneed[this.lv + 1] * 1)) {
          G.tip_NB.show(L("WJTF_TIP8"))
          return
        }
        this.needUp = true;
        this.lv++;
        me.gold -= (G.gc.wjtf.upneed[this.lv] * 1);
        // me.nodes.txt_zs.setString(me.gold);
        me.mapData[this.key].lv = this.lv * 1;
        me.defHero.forEach(function (item) {
          item.checkUp();
        })
        // this.addHero(me.mapData[this.key])
      };
      node.update = function () {
        if (me.mapData[this.key] == null || !this.needUp) return;
        this.needUp = false;
        me.nodes.txt_zs.setString(me.gold);

        me.defHero.forEach(function (item) {
          item.checkUp();
        })
        this.addHero(me.mapData[this.key])
      };
      node.addHero = function (data) {
        this.clnode.show();
        this.mapdata = data;
        this.clnode.nodes.img_fw.hide();
        var heroData = G.DATA.yingxiong.list[data.tid];
        var confDATA = G.class.hero.getById(heroData.hid)
        var heroList = G.class.hero.getHeroByPinglun(confDATA.pinglunid);
        var lv = data.lv;
        if (heroData.star <= lv) {
          this.isMax = true;
        } else {
          this.isMax = false;
        };
        heroList.sort(function (a, b) {
          return a.star - b.star
        })
        var hero = "";
        for (var i = 0; i < heroList.length; i++) {
          if (heroList[i].star <= lv) {
            hero = heroList[i]
          }
        }
        if (!hero) {
          hero = heroList[0];
        };
        this.lv = data.lv * 1;
        this.setlv();
        this.checkUp();
        this.showState(false);
        var conf = {
          hid: hero.hid,
          model: hero.model,
          skin: {

          },
          zhanli: 99999
        };
        conf.hid = hero.hid;
        var hero = new G.class.defRole_1(conf, {
          atk: parseInt(confDATA.toweratk * Math.sqrt(lv) / 2),
          frequent: hero.rate / 1000,
          atkRange: 185,
          scaleNum: 0.5,
          scaleX: -1
        }, me);
        me.tf.push(hero);
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
        var lv = this.lv ? this.lv + 1 : 1;

        var need = G.gc.wjtf.upneed[lv];
        if (me.gold >= need && this.lv && !this.isMax && me.overGame) {
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
          // if (!sender.canUp && !sender.isMax) {
          //   G.tip_NB.show(L("WJTF_TIP8"));
          //   return;
          // };
          me.clickNode = sender;

          G.frame.wjtf_up.once("close", function () {
            sender.update()
          }).data({
            data: sender.mapdata,
            max: sender.isMax
          }).show();

        } else {
          // cc.log(sender.getPosition());
          me.nodes.txt_sj2.hide();
          me.nodes.txt_djs.hide();
          var max = G.gc.wjtf.maxnum;
          var hav = X.keysOfObject(me.mapData).length;
          if (hav >= max) return G.tip_NB.show(L('WJTF_TIP6'));
          me.table && me.table.reloadDataWithScroll(true);
          me.nodes.panel_sz.show();
          sender.showState(true);
          me.clickNode = sender;
          me.setNeed();

        }
      })
    },
    delEnemy: function (enemy) {
      var me = this;
      var idx = this.enemyList.indexOf(enemy);
      this.enemyList.splice(idx, 1);
      me.gold += G.gc.wjtf.enemy.gold;
      me.nodes.txt_zs.setString(me.gold);
      me.defHero.forEach(function (item) {
        item.checkUp();
      })
      if (this.defHp <= 0) {
        G.tip_NB.show(L('WJTF_TIP22'));
        me.reSetData(true);
        this.checkLose();
        me.ui.clearTimeout(me.timer2);
        delete me.timer2
        return;
      }
      if (this.enemyList.length == 0 && this.enemyNum <= 0) {
        if (this.defHp > 0) this.checkWin(true);

      }
    },
    checkLose: function () {
      var me = this;
      me.nodes.btn_cz.show();
      // me.nodes.txt_yjs.show();
      me.nodes.btn_tz.show();
      me.nodes.panel_xl.hide();
      me.nodes.panel_zs.hide();
    },
    setHeroNum: function () {
      var me = this;
      var max = G.gc.wjtf.maxnum;
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
    checkWin: function (bool) {
      var me = this;
      // return
      // if (me._checkWin) return null;
      // me._checkWin = true;
      me.overGame = true;
      var obj = {
        mapdata: me.mapData,
        hp: me.defHp,
        gold: me.gold,
        layer: me.DATA.myinfo.layer + 1
      }
      cc.log(me.tf);
      var atknum=0;
      var harm=0;
      for(var i=0 ; i <me.tf.length ;i++){
        atknum += me.tf[i].atknum;
        me.tf[i].atknum=0;
        harm += me.tf[i].harm;
        me.tf[i].harm=0;
      }
      
      me.ajax('wujintafang_layer', [me.DATA.myinfo.layer + 1, obj ,Math.floor(harm/atknum)], function (d) {
        if (!d) return;
        var d = JSON.parse(d);
        if (d.s == 1) {
          // me.DATA = d.d;
          me.action.playWithCallback("lujing", false, function () {
            me.action.playWithCallback("lujing", false, function () {
              me.action.play("wait", true)
            });
          })
          X.spine.clearAllCache();
          me.showTime();

          me.reSetData();
        }
      }, true);

    },
    initMyDate: function (data) {
      var me = this;
      var addGold = 0;
      checkdata = function (mapdata) {
          var obj = {};
          for (var key in mapdata) {
            if (!mapdata[key]) continue;
            if (G.DATA.yingxiong.list[mapdata[key].tid]) {
              obj[key] = mapdata[key]
            } else {
              var lv = mapdata[key].lv;
              for (var i = 1; i <= lv; i++) {
                addGold += G.gc.wjtf.upneed[i];
              }
            }
          };
          return obj
        },
        me.mapData = checkdata(data.mapinfo.mapdata) || {};
      me.gold = (data.mapinfo.gold + addGold) || G.gc.wjtf.player.gold;
      me.defHp = data.mapinfo.hp || G.gc.wjtf.player.hp;
      if (me.defHp < 1) {
        me.checkLose();
      }
    },
    getData: function (callback) {
      var me = this;
      me.ajax('wujintafang_open', [], function (d) {
        if (!d) return;
        var d = JSON.parse(d);
        if (d.s == 1) {
          me.DATA = d.d;
          me.initMyDate(d.d);
          callback && callback();
        }
      }, true);
    },
    onAniShow: function () {
      var me = this;
    },
    onShow: function () {
      var me = this;
      me.setBtnSate();
      me.jianHp();
      me.nodes.panel_zs.hide();
      me.nodes.panel_xl.hide();
      me.nodes.panel_zd.zIndex = 9999;
      me.action.play("wait", true);
    },
    setBtnSate: function () {
      var me = this;
      var starTime = X.getLastMondayZeroTime() + 10 * 3600;
      var endTime = X.getLastMondayZeroTime() + (22 + 24 * 6) * 3600;
      if (G.time < starTime || G.time > endTime) {

        me.nodes.txt_yjs.show();
        me.nodes.btn_cz.hide();
        me.nodes.txt_djs.hide();
        me.nodes.txt_sj2.hide();
        me.nodes.btn_tz.hide();
      } else {
        me.nodes.btn_cz.show();

      }
    },
    setNeed: function () {
      var me = this;
      me.nodes.panel_xh.removeAllChildren();
      var rh = X.setRichText({
        str: "<font node=1></font>" + me.gold + "/" + G.gc.wjtf.upneed[1],
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