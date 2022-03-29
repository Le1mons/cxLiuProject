/**
 * Created by wfq on 2018/6/8.
 */
(function () {
  //世界树
  var ID = 'wjtf_rank';

  var fun = X.bUi.extend({
    ctor: function (json, id) {
      var me = this;
      me.singleGroup = "f2";
      me._super(json, id, {
        action: true
      });
    },
    bindBtn: function () {
      var me = this;

    },
    onOpen: function () {
      var me = this;
      cc.enableScrollBar(me.nodes.scrollview);
      me.getData(function () {
        me.initUI()
      })
    },
    initUI: function () {
      var me = this;
      me.nodes.mask.click(function () {
        me.remove();
      })
      me.nodes.btn_phb.click(function (sender) {
        if (me.tyep == 1) {
          return
        }
        sender.setBright(false);
        me.nodes.btn_phjl.setBright(true);
        me.type = 1;
        me.setContents();
        var val = me.DATA.ranklist[1].myrank > 50 ? ((me.DATA.ranklist[1].myrank / me.DATA.ranklist[1].ranknum*100).toFixed(2) + "%") : me.DATA.ranklist[1].myrank;
        var str = me.DATA.ranklist[1].myrank > -1 ? val : L('WSB');
        me.nodes.wodepaiming.setString(X.STR(L("WJTF_TIP18"), str));
        me.nodes.jifen.setString(X.STR(L("WJTF_TIP19"), me.DATA.ranklist[1].myval) );
        me.nodes.wz_xx3.hide();
        me.nodes.jifen.show();
        me.nodes.wodepaiming.show();
      })
      me.nodes.btn_phjl.click(function (sender) {
        if (me.type == 0) {
          return
        }
        sender.setBright(false);
        me.nodes.btn_phb.setBright(true);
        me.type = 0;
        me.setContents()
        me.nodes.wz_xx3.setString(L("WJTF_TIP17"))
        me.nodes.jifen.hide();
        me.nodes.wodepaiming.hide();
        me.nodes.wz_xx3.show();
      
      })
      me.nodes.btn_phjl.triggerTouch(2);
    },
    setContents: function () {
      var me = this;
      me.nodes.scrollview.removeAllChildren();
      if (me.type == 0) {
        var list = me.nodes.list1;
        var data = [].concat(G.gc.wjtf.rankprize.prize);
        var dataArr = [];
        for (var i = 0; i < data.length; i++) {
          data[i].key = i + 1;
          data[i].dangqian = false;
          if (data[i].percentum ) {
            var val = Math.ceil(me.DATA.ranklist[1].myrank / me.DATA.ranklist[1].ranknum * 100);
            if (me.DATA.ranklist[1].myrank > 10 &&  val >= data[i].valkey[0] && val <= data[i].valkey[1]) {
              data[i].dangqian = true;
            }
          } else {
            if (  me.DATA.ranklist[1].myrank  >= data[i].valkey[0] && me.DATA.ranklist[1].myrank  <= data[i].valkey[1]) {
              data[i].dangqian = true;
            }
          }
          dataArr.push(data[i]);
        }
      } else {
        var list = me.nodes.list2;
        if (me.DATA.ranklist[0].length < 1) {
          return
        };
        var dataArr = [];
        for (var i = 0; i < me.DATA.ranklist[0].length; i++) {
          me.DATA.ranklist[0][i].key = i + 1;
          dataArr.push(me.DATA.ranklist[0][i]);
        }
      }
      me.table = new X.TableView(me.nodes.scrollview, list, 1, function (ui, data, pos) {
        if (me.type == 0) {

          me.setItem1(ui, data, pos[0]);
        } else {
          me.setItem2(ui, data, pos[0]);

        }
      });
      me.table.setData(dataArr);
      me.table.reloadDataWithScroll(true);
    },
    setItem2: function (ui, data) {
      var me = this;
      X.autoInitUI(ui);
      ui.show();
      ui.setTouchEnabled(false);
      if (data.key < 4) {
        ui.nodes.panel_pm2.show();
        ui.nodes.panel_pm2.setBackGroundImage("img/public/img_paihangbang_" + data.key +".png", 1);
        ui.nodes.sz_phb2.hide();
      } else {
        ui.nodes.panel_pm2.hide();
        ui.nodes.sz_phb2.show();
        ui.nodes.sz_phb2.setString(data.key);
      }
      ui.nodes.text_mz.setString(data.headdata.name);
      ui.nodes.text_qf.setString(data.headdata.guildname);
      ui.nodes.text_jf.setString(data.val || 0);


      var layIco = ui.nodes.panel_tx;
      layIco.removeAllChildren();
      var wid = G.class.shead(data.headdata);
      wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
      layIco.addChild(wid);

      layIco.setTouchEnabled(true);
      layIco.setSwallowTouches(false);
      layIco.data = data.headdata.uid;
      layIco.touch(function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
          G.frame.wanjiaxinxi.data({
            pvType: G.frame.jingjichang_freepk.isShow ? 'zypkjjc' : 'championtrial',
            uid: sender.data,
            isHideTwo: G.time >= X.getLastMondayZeroTime() + 6 * 24 * 3600 + 21 * 3600 + 1800
          }).checkShow();
        }
      });
    },
    setItem1: function (ui, data) {
      var me = this;
      X.autoInitUI(ui);
      ui.show();
      ui.nodes.sz_phb.hide();
      ui.nodes.text_pm.hide();
      ui.nodes.img_dqjl.setVisible(data.dangqian);
      if (data.key == 1) {
        ui.nodes.panel_pm.show();
        ui.nodes.panel_pm.setBackGroundImage("img/public/img_paihangbang_1.png", 1);
      } else {
        ui.nodes.panel_pm.hide();
        ui.nodes.text_pm.show();
        if (data.show) {
          ui.nodes.text_pm.setString(data.show)
        } else{
          ui.nodes.text_pm.setString(X.STR(L("WJTF_TIP16"), data.val))
        }
      };
      ui.setTouchEnabled(false);
      ui.nodes.tubiao_neirong.setTouchEnabled(false);
      X.enableOutline(ui.nodes.text_pm, "#804326", 1);
      cc.log(data.p)
      X.alignItems(ui.nodes.tubiao_neirong, data.p, 'left', {
        touch: true,
        interval:1
      });
    },
    getData: function (callback) {
      var me = this;
      G.ajax.send('wujintafang_rank', [], function (d) {
        if (!d) return;
        var d = JSON.parse(d);
        if (d.s == 1) {
          me.DATA = d.d;
          callback && callback()
        }
      }, true);
    }



  });

  G.frame[ID] = new fun('tafang_tk2.json', ID);
})();