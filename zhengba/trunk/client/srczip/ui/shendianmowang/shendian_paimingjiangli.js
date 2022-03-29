/**
 * Created by LYF on 2019/1/9.
 */
(function () {
    //神殿魔王-排名奖励
    var ID = 'shendian_pmjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
            
            X.radio([me.nodes.btn_wzpm, me.nodes.btn_sjjl], function (sender) {

                var type = {
                    btn_wzpm$: 1,
                    btn_sjjl$: 2,
                };

                me.changeType(type[sender.getName()]);
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS29')
                }).show();
            });
        },
        changeType: function(type) {
            var me = this;
            var view = {
                "1": G.class.shendianpaiming,
                "2": G.class.shendianjiangli
            };

            var newView = new view[type];
            me.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
            }else{
                me._panels = newView;
            }
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
            me.fillSize();
        },
        onAniShow: function () {
            var me = this;
        },
        getRankData: function(callback) {
            var me = this;

            G.ajax.send("rank_open", [20], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.rankData = d.d;
                    callback && callback();
                }
            })
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getRankData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            if(G.frame.shendianmowang.noFight) {
                me.showToper();
                me.nodes.img_mwbg.show();
                me.nodes.panel_ditiao.show();

                var time;
                var to;
                if(G.time > X.getTodayZeroTime() + 10 * 3600) {
                    time = X.getTodayZeroTime() + 24 * 3600 + 10 * 3600;
                    to = 2 * 3600 + 10 * 3600;
                } else {
                    time = X.getTodayZeroTime() + 10 * 3600;
                    to = 3600 + 10 * 3600;
                }

                X.timeout(me.nodes.txt_xxm, time, function () {
                    me.remove();
                }, null, {showStr: L("HJL")});

                me.nodes.img_jdt1.setPercent((time - G.time) / to * 100);
                me.nodes.btn_bz.show();
            }

            me.nodes.btn_wzpm.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianzhilu_tip_bg.json', ID);
})();

(function () {
    G.class.shendianpaiming = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("shendianzhilu_pmzs.json");
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            me.setContents();
        },
        setContents: function() {
            var me = this;
            var data = G.frame.shendian_pmjl.rankData;

            me.nodes.txt_dw.setString(data.myval ? X.fmtValue(data.myval) : 0);
            me.ui.finds("txt_level_0").setString((data.myrank <= 100 &&  data.myrank > 0) ?
                data.myrank : (data.ranklist.length > 100 ? 100 + "+" : L("WSB")));

            if(data.ranklist.length < 1) {
                return me.nodes.img_zwnr.show();
            }

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.sz_phb.setString(data.rank);
            ui.nodes.txt_name.setString(data.headdata.name);
            ui.nodes.txt_number.setString(X.fmtValue(data.val));
            ui.nodes.text_zdl2.setString(X.fmtValue(data.headdata.maxzhanli));

            ui.nodes.panel_tx.removeAllChildren();
            var head = G.class.shead(data.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.addChild(head);

            ui.nodes.btn_lx.click(function () {

                me.ajax("devil_recording", [data.headdata.uid], function (str, data) {
                    if(data.s == 1) {
                        data.d.pvType = "mwvideo";
                        G.frame.fight.demo(data.d);
                    }
                });
            });
        }
    });
})();

(function () {
    G.class.shendianjiangli = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("shendianzhilu_jlyl.json");
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            me.setContents();
        },
        setContents: function() {
            var me = this;
            var xinyu = X.clone(G.class.shendianmowang.get().base.prize.lucky);
            var data = G.class.shendianmowang.getPrize();

            data.unshift(xinyu);

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.img_rank.hide();
            ui.nodes.sz_phb.hide();
            ui.nodes.img_xy.hide();

            if(data[0].length < 2) {
                ui.nodes.img_xy.show();
            } else {
                if(data[0][0] == data[0][1]) {
                    ui.nodes.sz_phb.setString(data[0][0]);
                    ui.nodes.sz_phb.show();
                } else {
                    if(data[0][0] > 200) {
                        ui.nodes.img_rank.show();
                        ui.nodes.img_rank.setBackGroundImage("img/public/ph_200yihou.png", 1);
                    } else {
                        ui.nodes.sz_phb.setString(data[0][0] + "-" + data[0][1]);
                        ui.nodes.sz_phb.show();
                    }

                }
            }

            X.alignItems(ui.nodes.img_wp, data[1], "left", {
                touch: true
            });
        }
    });
})();