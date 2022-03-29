/**
 * Created by LYF on 2019/2/16.
 */
(function () {
    //公会-任务
    var ID = 'gonghui_ghrw';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {

                me.remove();
            });

            me.nodes.btn_paimingjiangli.click(function () {

                G.frame.gonghui_ghbd.show();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS28')
                }).show();
            });

            me.ui.finds("btn_baoming").click(function (sender) {
                if(sender.boss) {
                    return G.tip_NB.show(L("GHRW_ZTBS"));
                }
                if(sender.no) {
                    return G.tip_NB.show(L("GYKQZT"));
                }
                if(sender.per) {
                    return G.tip_NB.show(L("GHRW_BGBZ"));
                }

                if(me.DATA.v * 1 == X.keysOfObject(G.gc.ghrw.base.boss).length) return G.tip_NB.show(L("ZWKFHXSL"));

                me.ajax("teamtask_condemn", [], function (str, data) {
                    if(data.s == 1) {
                        me.checkShow(function () {
                            G.tip_NB.show(X.STR(L("KQZTSLCG"), me.DATA.v));
                        });
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("teamtask_main", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        checkShow: function(cb) {
            var me = this;

            G.ajax.send("teamtask_main", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    if(cc.isNumber(me.DATA.fightnum)) {
                        if(G.frame.gonghui_tfsl.isShow) {
                            me.fight = false;
                            G.frame.gonghui_tfsl.setFightInfo();
                        } else {
                            if(G.frame.gonghui_ghrw.isShow) G.frame.gonghui_ghrw.remove();
                            G.frame.gonghui_tfsl.show();
                            me.fight = true;
                        }
                    } else {
                        me.fight = false;
                        if(G.frame.fight.isShow){
                            G.frame.fight.once("hide", function () {
                                if(G.frame.gonghui_tfsl.isShow) G.frame.gonghui_tfsl.remove();
                                me.show();
                            });
                        } else {
                            me.show();
                        }
                    }
                    cb && cb();
                }
            })
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setTaskList();
            me.setJD();
        },
        setTaskList: function () {
            var me = this;
            var conf = G.gc.ghrw.base.task;

            for (var i in conf) {
                (function (i) {
                    var con = conf[i];
                    var lay = me.ui.finds("panel_" + i);
                    var list = me.nodes.list_bd.clone();
                    var val = me.DATA.task[i] || 0;

                    X.autoInitUI(list);
                    lay.removeAllChildren();

                    list.nodes.txt_name.setString(con.title);
                    list.nodes.txt_mcz.setString(con.desc);
                    list.nodes.txt_sl.setString(con.num);
                    list.nodes.txt_sz1.setString("(" + val + "/" + con.pval + ")");
                    list.nodes.panel_tp.setBackGroundImage("img/gonghui/img_tp_ghrw" + i + ".png", 1);

                    X.enableOutline(list.nodes.txt_mcz, "#000000", 2);

                    if(val >= con.pval) {
                        list.nodes.img_wdc.hide();
                        list.nodes.btn_wc.show();
                        list.nodes.txt_sz1.setTextColor(cc.color("#9eff1f"));

                        if(P.gud.ghpower > 1) {
                            list.nodes.btn_wc.setBright(false);
                            list.nodes.btn_wc.no = true;
                        }

                        list.nodes.btn_wc.click(function (sender) {

                            if(sender.no) {
                                return G.tip_NB.show(L("GYTJRW"));
                            }

                            me.ajax("teamtask_finish", [i], function (str, data) {
                                if(data.s == 1) {
                                    G.tip_NB.show(L("TJRWCG") + con.num);
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                }
                            })
                        });
                    } else {
                        list.nodes.txt_sz1.setTextColor(cc.color("#ff632c"));
                    }
                    X.enableOutline(list.nodes.txt_sz1, "#3e322c", 2);

                    list.show();
                    list.setPosition(lay.width / 2, lay.height / 2);
                    lay.addChild(list);
                })(i)
            }
        },
        setJD: function () {
            var me = this;
            var conf = G.gc.ghrw.base.boss[me.DATA.v];
            var btn = me.ui.finds("btn_baoming");

            me.nodes.txt_jdtsz.setString(me.DATA.supply + " / " + conf.opencontri);
            me.nodes.img_jdt.setPercent(me.DATA.supply / conf.opencontri * 100);

            if(P.gud.ghpower > 1) {
                btn.setBright(false);
                btn.children[0].setTextColor(cc.color("#6c6c6c"));
                btn.no = true;
            }

            if(me.DATA.supply < conf.opencontri) {
                btn.setBright(false);
                btn.children[0].setTextColor(cc.color("#6c6c6c"));
                btn.per = true;
            } else {
                btn.per = false;
                btn.setBright(true);
                btn.children[0].setTextColor(cc.color("#7b531a"));
            }

            if(me.fight) {
                btn.setBright(false);
                btn.children[0].setTextColor(cc.color("#6c6c6c"));
                btn.boss = true;
            }
        }
    });
    G.frame[ID] = new fun('gonghui_ghrw.json', ID);
})();