/**
 * Created by LYF on 2019/8/27.
 */
(function () {
    //周年挑战
    G.class.huodong_zntz = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_zntz.json", null, {action: true});
        },
        initUi: function () {
            var me = this;
            var txt = me.ui.finds("txt_sz");
            var key = me._data.data.key || 1;
            var conf = G.gc.longqishilian[key].boss;

            if(me._data.etime - G.time > 24 * 3600 * 2) {
                txt.setString(X.moment(me._data.etime - G.time));
            }else {
                X.timeout(txt, me._data.etime, function () {
                    me.timeout = true;
                });
            }

            me.nodes.panle1.setTouchEnabled(false);

            X.alignCenter(me.nodes.panel_jl, conf.prize, {
                touch: true
            });

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: conf.boss[0]
            });

            var skillArr = [];
            for (var i = 0; i < conf.intr.length; i ++) {
                var skillIco = G.class.bossInfo(null, null, conf.intr[i]);
                skillArr.push(skillIco);
            }
            X.center(skillArr, me.nodes.panel_jineng);

            var need = me.need = me._data.data.pkneed[0];
            me.nodes.text_sl1.setString(need.n);
            me.nodes.text_sl2.setString(need.n);
            me.nodes.panel_token1.setBackGroundImage(G.class.getItemIco(need.t), 1);
            me.nodes.panel_token2.setBackGroundImage(G.class.getItemIco(need.t), 1);

            cc.enableScrollBar(me.nodes.listview);

            // G.class.ani.show({
            //     json: "ani_longqishilian_feng",
            //     addTo: me.nodes.panel_dh,
            //     repeat: true,
            //     autoRemove: false
            // });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_1.click(function () {
                if (me.DATA.myinfo.val < 1) {
                    if (G.class.getOwnNum(me.need.t, me.need.a) < me.need.n) {
                        return G.tip_NB.show(G.class.getItem(me.need.t, me.need.a).name + L("BUZU"));
                    }
                }
                G.frame.yingxiong_fight.data({
                    pvType: 'lqsl',
                    title: L("QCZXGYX"),
                    hdid: me._data.hdid,
                    key:"2",
                    from: me
                }).show();
            });
            me.nodes.btn_2.click(function () {
                if (me.DATA.myinfo.val < 1) {
                    if (G.class.getOwnNum(me.need.t, me.need.a) < me.need.n) {
                        return G.tip_NB.show(G.class.getItem(me.need.t, me.need.a).name + L("BUZU"));
                    }
                };
                me.ajax("huodong_use", [me._data.hdid, 1, [],true], function (str, data) {
                    if (data.s == 1) {
                        me.DATA.myinfo = data.d.myinfo;
                        me.DATA.rank = data.d.rank;
                        me.setContents();
                        G.frame.jiangli.data({
                            prize: data.d.dlzprize
                        }).show();
                        if(me._data.isqingdian){
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }
                    }
                }, true);
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS76")
                }).show();
            });

            me.nodes.btn_pmjl.click(function () {
                if (!me.DATA.rank.topdps && !me.DATA.rank.name) return G.tip_NB.show(L("TZZNTZ"));

                G.frame.lqsl_dps.data({data:me.DATA,type:(me._data.data.key || 1)}).show();
            });

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
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.action.play("wait", true);
            me.curListViewHeight = me.nodes.paihangxinxi.height;
            me.getData(function(){
                me.initUi();
                me.setContents();
            });
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.DATA.rank = me.DATA.rank || {};
                    me.DATA.rank.ranklist = me.DATA.rank.ranklist || [];
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     me.DATA.rank = me.DATA.rank || {};
            //     me.DATA.rank.ranklist = me.DATA.rank.ranklist || [];
            //     callback && callback();
            // });
        },
        setContents: function () {
            var me = this;

            me.setRank();
            me.setBtnState();
        },
        setBtnState: function () {
            var me = this;
            var num = me.DATA.myinfo.val;

            if (num > 0) {
                me.nodes.panle1.hide();
                me.nodes.panel_token2.hide();
                me.nodes.text_sl2.hide();
                me.ui.finds("txt_sx2").show();
                me.ui.finds("txt_sx4").show();
                me.ui.finds("txt_sx3").hide();
                me.ui.finds("txt_sx4").setString(L("UI_TITLE_SDMF"));
            } else {
                me.nodes.panel_token2.show();
                me.nodes.text_sl2.show();
                me.ui.finds("txt_sx4").hide();
                me.ui.finds("txt_sx3").show();
                me.ui.finds("txt_sx3").setString(L("UI_TITLE_SD"));
                me.nodes.panle1.show();
                me.ui.finds("txt_sx2").hide();
            };

            if(me.DATA.myinfo.dailydps){
                me.nodes.btn_1.setPositionX(85);
                me.nodes.btn_2.show();
                me.nodes.btn_1.show();
            }else{
                me.nodes.btn_1.show();
                me.nodes.btn_2.hide();
                me.nodes.btn_1.setPositionX(me.nodes.panel.width/2);
            }
        },
        setRank: function () {
            var me = this;

            me.nodes.txt_wdsh.setString(X.fmtValue(me.DATA.myinfo.dps));
            me.nodes.listview.removeAllChildren();
            for (var i = 0; i < 10; i ++) {
                var data = me.DATA.rank.ranklist[i];
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                X.render({
                    txt_mc: i + 1,
                    txt_name: function (node) {
                        node.setString(data ? data.headdata.name : L("XWYD"));
                        node.setTextColor(cc.color(data ? "#ffffff" : "#A2938C"));
                    },
                    txt_jf: X.fmtValue(data ? data.val : 0)
                }, list.nodes);
                list.show();
                me.nodes.listview.pushBackCustomItem(list);
            }

            me.ui.setTimeout(function () {
                me.nodes.listview.jumpToTop();
            }, 200);
        }
    });
})();