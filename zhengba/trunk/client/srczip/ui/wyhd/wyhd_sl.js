/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd_sl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.needShowToper = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            var conf = G.gc.wyhd.mowang;

            X.alignCenter(me.nodes.panel_jl, G.gc.wyhd.fightprize, {
                touch: true
            });

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: conf.boss[conf.boss.length - 1]
            });

            var skillArr = [];
            for (var i = 0; i < conf.intr.length; i ++) {
                var skillIco = G.class.bossInfo(null, null, conf.intr[i]);
                skillArr.push(skillIco);
            }
            X.center(skillArr, me.nodes.panel_jineng);
            cc.enableScrollBar(me.nodes.listview);

            me.ui.finds('txt_sx').setString(L("TIAOZHAN"));
            me.ui.finds('txt_sx3').setString(L("UI_TITLE_SD"));

            me.txtPanel = new ccui.Layout();
            me.txtPanel.setContentSize(me.nodes.panel.width, me.nodes.panel.y + 85);
            me.txtPanel.setAnchorPoint(0.5, 0.5);
            me.ui.finds('panel_ui').addChild(me.txtPanel);
            me.txtPanel.setPosition(me.nodes.panel.x, 150);
        },
        bindBtn: function () {
            var me = this;

            me._defTzBtnX = me.nodes.btn_1.x;
            me.curListViewHeight = me.nodes.paihangxinxi.height;
            me.nodes.btn_dianjigengduo.setTouchEnabled(true);
            me.nodes.btn_dianjigengduo.click(function (sender) {

                if(!me.zk) {
                    me.zk = true;
                    me.nodes.paihangxinxi.height += 7 * me.nodes.list.height + 8;
                    sender.loadTexture("img/xianshizhaomu/btn_fanhui.png", 1);
                } else {
                    me.zk = false;
                    me.nodes.paihangxinxi.height = me.curListViewHeight;
                    sender.loadTexture("img/xianshizhaomu/btn_xianshizhaomu.png", 1);
                }
                ccui.helper.doLayout(me.nodes.paihangxinxi);
            });

            me.nodes.panle1.setTouchEnabled(false);

            var need = G.gc.wyhd.fightneed[0];
            me.nodes.panel_token1.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.panel_token2.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.text_sl1.setString(need.n);


            me.nodes.btn_1.click(function () {
                if (G.frame.wyhd.DATA.myinfo.fightnum >= 2 && G.class.getOwnNum(need.t, need.a) < need.n) {
                    return G.tip_NB.show(G.class.getItem(need.t, need.a).name + L("BUZU"));
                }
                G.frame.yingxiong_fight.data({
                    pvType: 'wyhd',
                }).show();
            });
            me.nodes.btn_2.click(function () {
                if (G.frame.wyhd.DATA.myinfo.fightnum >= 2 && G.class.getOwnNum(need.t, need.a) < need.n) {
                    return G.tip_NB.show(G.class.getItem(need.t, need.a).name + L("BUZU"));
                }
                me.ajax('labour_fightboss', [true], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        G.frame.wyhd.DATA.myinfo.fightnum ++;
                        me.setBtnState();
                        G.hongdian.getData('labour', 1, function () {
                            G.frame.wyhd.checkRedPoint();
                        });
                    }
                });
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        onShow: function () {
            var me = this;

            me.setRank();
            me.setBtnState();
        },
        showAttr: function () {
            var me = this;
            var need = G.gc.wyhd.fightneed[0];

            var node = new ccui.ImageView(G.class.getItemIco(need.t), 1);
            node.scale = .8;
            X.setRichText({
                str: X.STR(L("YYXG"), "<font node=1></font><font color=#2bdf02>" + X.fmtValue(G.class.getOwnNum(need.t, need.a)) + "</font>"),
                parent: me.txtPanel,
                node: node,
                color: '#fff8e1',
                outline: '#000000'
            });
        },
        setRank: function () {
            var me = this;

            me.nodes.txt_wdsh.setString(X.fmtValue(G.frame.wyhd.DATA.myinfo.topdps));
            me.nodes.listview.removeAllChildren();
            for (var i = 0; i < 10; i ++) {
                var data = G.frame.wyhd.DATA.ranklist[i];
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                X.render({
                    txt_mc: i + 1,
                    txt_name: function (node) {
                        node.setString(data ? data.headdata.name : L("XWYD"));
                        node.setTextColor(cc.color(data ? "#ffffff" : "#A2938C"));
                    },
                    txt_jf: X.fmtValue(data ? data.topdps : 0)
                }, list.nodes);
                list.show();
                me.nodes.listview.pushBackCustomItem(list);
            }

            me.ui.setTimeout(function () {
                me.nodes.listview.jumpToTop();
            }, 200);
        },
        setBtnState: function () {
            var me = this;
            var topDps = G.frame.wyhd.DATA.myinfo.topdps;
            var fightNum = G.frame.wyhd.DATA.myinfo.fightnum;
            var need = G.gc.wyhd.fightneed[0];

            me.nodes.btn_2.setVisible(topDps > 0);
            me.nodes.btn_1.x = topDps > 0 ? me._defTzBtnX : me.nodes.btn_1.getParent().width / 2;

            var hasNum = G.class.getOwnNum(need.t, need.a);

            me.nodes.text_sl2.setString(hasNum < 10 ? hasNum : 10);
            me.ui.finds('txt_sx3').setString(hasNum < 10 ? L("UI_TITLE_SD") : L("UI_TITLE_SD") + 10 + L("CI"));
            me.ui.finds('txt_sx3').fontSize = hasNum < 10 ? 24 : 18;

            me.nodes.panle1.setVisible(fightNum >= 2);
            me.nodes.panel_token2.setVisible(fightNum >= 2);
            me.nodes.text_sl2.setVisible(fightNum >= 2);
            me.nodes.panel_token2.setVisible(fightNum >= 2);
            me.ui.finds('txt_sx3').setVisible(fightNum >= 2);
            me.ui.finds('txt_sx2').setVisible(fightNum < 2);
            me.ui.finds('txt_sx4').setVisible(fightNum < 2);
            me.showAttr();
        }
    });
    G.frame[ID] = new fun('wuyipaidui_sl.json', ID);
})();