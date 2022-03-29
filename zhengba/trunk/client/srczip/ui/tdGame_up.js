/**
 * Created by wfq on 2018/6/8.
 */
(function () {
  //世界树
  var ID = 'tdGame_up';

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
      me.nodes.mask.click(function () {
        me.remove();
      })
      me.nodes.btn_h.click(function () {
        G.frame.tdGame1.clickNode && G.frame.tdGame1.clickNode.sellHero();
        me.remove();
      });
      me.nodes.btn_l.click(function () {
        if (me.DATA.data.lv >= me.heroData.star) {
          G.tip_NB.show(L("WJTF_TIP15"));
          return
        }
        G.frame.tdGame1.clickNode && G.frame.tdGame1.clickNode.lvUp();
        G.frame.tdGame1.removeGuide();
        if (me.DATA.data.lv >= me.heroData.star) {
          me.DATA.max = true;
        }
        // me.DATA.data.lv++;
        me.initUi();

      })
    },
    onOpen: function () {
      var me = this;
      me.DATA = me.data();
      me.setHero();
      me.initUi();
      me.bindBtn();
      me.ui.setTimeout(() => {
        G.frame.tdGame1.showGuide(5)
      }, 100);
    },
    onRemove: function () {
      G.frame.tdGame1.showGuide(6);
    },
    setHero: function () {
      var me = this;
      me.heroData = me.DATA.data;
      me.conf = G.class.hero.getById(me.heroData.data.hid);
      var widget = G.class.shero(me.conf, null, null, false);
      widget.setName('widget');
      widget.setAnchorPoint(0.5, 1);
      widget.setPosition(cc.p(me.nodes.panel_1.width * 0.5, me.nodes.panel_1.height));
      me.nodes.panel_1.addChild(widget);
    },
    initUi: function () {

      var me = this;
      me.nodes.btn_h.show();
      me.nodes.panel_xh.removeAllChildren();
      var keyArr = ["lv", "atk"];
      var getValue = function (key, val) {
        if (key == "lv") {
          return val
        } else {
          var value = parseInt(me.heroData.data.atk * G.frame.tdGame1.CONF.power * G.frame.tdGame1.CONF.frequent * val * val / 4)
          return value
        }
      };
      if (me.DATA.max) {
        me.ui.finds("Text_48").setString(L("WJTF_TIP9"));
        me.nodes.panel_sp_mz.setString(L("WJTF_TIP11"));
        me.nodes.zhuangtai2.show();
        me.nodes.zhuangtai1.hide();
        me.nodes.btn_l.hide();
        me.nodes.btn_h.x = 290;
        var nodeArr = ["txt_sx5", "txt_sx6"];

        for (var i = 0; i < 2; i++) {
          var rh1 = X.setRichText({
            str: X.STR(L("WJTF_TIP13"), L(keyArr[i]), getValue(keyArr[i], me.DATA.data.lv)),
            parent: me.nodes[nodeArr[i]],
            color: '#cfc2a8',
            size: 20
          });
          rh1.x = 0;
        }
      } else {
        me.nodes.btn_l.x = 400;
        me.nodes.btn_h.x = 157;
        me.nodes.btn_l.show();
        me.nodes.zhuangtai1.show();
        me.nodes.panel_sp_mz.setString(L("WJTF_TIP12"));
        me.ui.finds("Text_48").setString(L("WJTF_TIP10"));
        var nodeArr = ["txt_sx1", "txt_sx2"];
        var nodeArr1 = ["txt_sx3", "txt_sx4"];
        me.setNeed();
        for (var i = 0; i < 2; i++) {
          var rh1 = X.setRichText({
            str: X.STR(L("WJTF_TIP13"), L(keyArr[i]), getValue(keyArr[i], me.DATA.data.lv)),
            parent: me.nodes[nodeArr[i]],
            color: '#cfc2a8',
            size: 20
          });
          rh1.x = 0;
          var rh2 = X.setRichText({
            str: X.STR(L("WJTF_TIP14"), L(keyArr[i]), getValue(keyArr[i], me.DATA.data.lv + 1)),
            parent: me.nodes[nodeArr1[i]],
            color: '#cfc2a8',
            size: 20
          });
          rh2.x = 0;
        }
      };

    },
    setNeed: function () {
      var me = this;
      var rh = X.setRichText({
        str: "<font node=1></font>" +G.frame.tdGame1.gold  + "/" + G.frame.tdGame1.CONF.need,
        parent: me.nodes.panel_xh,
        node: new ccui.ImageView("img/xintafang/img_zs.png", 1),
        maxWidth: 300,
        color: "#f6ebcd",
        outline: "#000000"
      });
      rh.setPosition(me.nodes.panel_xh.width / 2 - rh.trueWidth() / 2, me.nodes.panel_xh.height / 2 - rh.trueHeight() / 2);
    },
  });

  G.frame[ID] = new fun('tafang_tk1.json', ID);
})();