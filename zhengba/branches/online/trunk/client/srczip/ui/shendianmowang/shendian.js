/**
 * Created by LYF on 2019/1/9.
 */
(function () {
    //神殿魔王
    var ID = 'shendianmowang';

    var fun = X.bUi.extend({
        time: [12, 14, 16, 18, 20],
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.panel_mw.click(function () {
                if(me.DATA.fight_num < 1) return G.tip_NB.show(L("TZCSBZ"));
                var obj = {
                    pvType:'pvmw',
                };
                G.frame.yingxiong_fight.data(obj).show();
            });

            me.nodes.btn_tz.click(function () {
                if(me.DATA.fight_num < 1) return G.tip_NB.show(L("TZCSBZ"));
                var obj = {
                    pvType:'pvmw',
                };
                G.frame.yingxiong_fight.data(obj).show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.shendian_pmjl.show();
            });

            me.nodes.btn_wh.click(function () {

                G.frame.help.data({
                    intr:L('TS29')
                }).show();
            });
        },
        checkShow: function() {
            var me = this;

            if(G.time > X.getTodayZeroTime() + 10 * 3600 && G.time < X.getTodayZeroTime() + 22 * 3600) {
                me.noFight = false;
                G.ajax.send("devil_open", [], function (d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1){
                        me.DATA = d.d;
                        me.rankData = d.d;
                        me.show();
                    }
                });
            } else {
                me.noFight = true;
                G.frame.shendian_pmjl.show();
            }
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("devil_open", [], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    me.rankData = d.d;
                    callback && callback();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            me.action.play("yu", true);
        },
        onShow: function () {
            var me = this;

            me.setFight();
            me.showToper();
            me.setFightNum();
            me.setBuffInfo();
            me.setContents();
            me.setRankInfo();
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(false);
        },
        onHide: function () {
            var me = this;

            me.fightOrder = [];
            G.hongdian.getData("fashita", 1, function () {
                G.frame.julongshendian.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            var conf = G.class.shendianmowang.get().base;

            var per = (X.getTodayZeroTime() + 22 * 3600 - G.time) / (12 * 3600) * 100;
            me.nodes.img_jdt1.setPercent(per);
            X.timeout(me.nodes.txt_xxm, X.getTodayZeroTime() + conf.time[1], function () {
                if(G.frame.fight.isShow) {
                    G.frame.fight.once("hide", function () {
                        X.uiMana.closeAllFrame();
                    });
                } else {
                    X.uiMana.closeAllFrame();
                }
            }, null, {showStr: L("HTW")});
        },
        setFightNum: function () {
            var me = this;

            if(me.DATA.fight_num < 1) {
                me.nodes.btn_tz.setBright(false);
                me.nodes.btn_tz.children[0].setTextColor(cc.color("#6c6c6c"));
            } else {
                me.nodes.btn_tz.setBright(true);
                me.nodes.btn_tz.children[0].setTextColor(cc.color("#7b531a"));
            }
            me.nodes.text_cs.setString(me.DATA.fight_num + "/" + 3);

            if(me.DATA.fight_num >= 3) {
                me.nodes.img_wb.hide();
            } else {
                if(G.time > X.getTodayZeroTime() + me.time[me.time.length - 1] * 3600) return me.nodes.img_wb.hide();

                var point;
                var zeroTime = X.getTodayZeroTime();
                me.nodes.img_wb.show();

                for (var i = 0; i < me.time.length; i ++) {
                    if(G.time < zeroTime + me.time[i] * 3600) {
                        point = i;
                        break;
                    }else if(me.time[i + 1] && G.time < zeroTime + me.time[i + 1] * 3600) {
                        point = i + 1;
                        break;
                    }
                }

                var toTime = zeroTime + me.time[point] * 3600;
                X.timeout(me.nodes.img_wb.children[0], toTime, function () {
                    me.ui.setTimeout(function () {
                        me.getData(function () {
                            me.setFightNum();
                        });
                    }, 1000);
                });
            }
        },
        setRankInfo: function () {
            var me = this;

            me.nodes.txt_pm.setString(me.rankData.myrank > 0 ? me.rankData.myrank : L("ZW"));
            me.nodes.txt_sh.setString(me.rankData.myval ? X.fmtValue(me.rankData.myval) : 0);

            me.nodes.listview.removeAllChildren();

            for (var i = 0; i < 3; i ++) {
                var list = me.nodes.list.clone();
                (function (list, i) {
                    X.autoInitUI(list);
                    list.show();
                    list.nodes.txt_mc.setString(i + 1);
                    X.enableOutline(list.nodes.txt_mc, "#003585", 2);
                    X.enableOutline(list.nodes.txt_name, "#003585", 2);
                    X.enableOutline(list.nodes.txt_shw, "#003585", 2);
                    list.nodes.txt_mc.setTextColor(cc.color("#FFFF00"));
                    list.nodes.txt_name.setTextColor(cc.color("#CBF6FF"));
                    list.nodes.txt_shw.setTextColor(cc.color("#10DC00"));
                    if(me.rankData.ranklist[i]) {
                        list.nodes.txt_name.setString(me.rankData.ranklist[i].name);
                        list.nodes.txt_shw.setString(X.fmtValue(me.rankData.ranklist[i].v));
                    } else {
                        list.nodes.txt_name.setString(L("XWYD"));
                        list.nodes.txt_shw.setString(0);
                    }
                    me.nodes.listview.pushBackCustomItem(list);
                })(list, i);
            }
        },
        setBuffInfo: function () {
            var me = this;
            var arr = [];
            var data = me.DATA.boss;
            var lay = me.nodes.panel_bf;
            var type = ["name", "job", "zhongzu"];

            for (var i in type) {
                var ico = G.class.bossInfo(type[i], data[type[i]]);
                arr.push(ico);
            }

            X.center(arr, lay, {

            });
        }
    });
    G.frame[ID] = new fun('shendianzhilu_sdsw.json', ID);
})();