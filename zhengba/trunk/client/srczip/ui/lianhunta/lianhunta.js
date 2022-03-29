/**
 * Created by
 */
(function () {
    //
    var ID = 'lianhunta';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_lhsj.click(function () {
                G.frame.lianhunta_sj.show();
            });

            me.nodes.btn_zjyx.click(function () {
                G.frame.lianhunta_help.show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L("TS89")
                }).show();
            });

            me.tNodes = {};
            for (var key in G.gc.lhtcom.guanka) {
                (function (id) {
                    var btn = me.tNodes[id] = me.nodes['panel_ta' + id];
                    X.autoInitUI(btn);
                    btn.id = id;
                    btn.conf = G.gc.lhtcom.guanka[id];
                    btn.nodes['txt_ta' + id].setString(btn.conf.name);
                    btn.setTouchEnabled(true);
                    btn.noMove(function (sender) {
                        if (sender.openCond) {
                            return G.tip_NB.show(btn.nodes['txt_tj' + id].getString());
                        }
                        G.frame.lianhunta_gk.data({
                            id: id
                        }).show();
                    });
                })(key);
            }
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
            me.nodes.scrollview.getInnerContainer().height = 2100;
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax('lianhunta_open', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d.myinfo;
                    me.DATA.fashita = data.d.fashita;
                    callback && callback();
                }
            });
        },
        onShow: function () {
            var me = this;

            me.refreshBtn();
            me.checkRedPoint();

            X.timeout(me.nodes.txt_cs, X.getMonthEndTimeByDay(15), function () {

            }, null, {
                showDay: true
            });

            me.bindMove();
        },
        checkRedPoint: function () {
            if (G.DATA.hongdian.lianhunta) {
                G.setNewIcoImg(this.nodes.btn_lhsj);
            } else {
                G.removeNewIco(this.nodes.btn_lhsj);
            }
        },
        refreshBtn: function () {
            var me = this;

            cc.each(me.tNodes, function (node) {
                var openCond = me.getOpenCondById(node.id);
                node.nodes['txt_xx' + node.id].setString(me.getStar(node.id) + '/' + 3 * node.conf.layerinfo.length);
                node.nodes['panel_xx' + node.id].setVisible(openCond == null);
                node.nodes['panel_tj' + node.id].setVisible(openCond != null);
                node.openCond = openCond;
                if (openCond) {
                    var txt = node.nodes['txt_tj' + node.id];
                    if(txt.__timeoutTimer){
                        txt.clearTimeout(txt.__timeoutTimer);
                        delete txt.__timeoutTimer;
                    }
                    if (!openCond.day) {
                        var time = X.getMonthEndTimeByDay(node.conf.openday - 1);
                        X.timeout(txt, time, function () {
                            me.refreshBtn();
                        }, null, {
                            showDay: true,
                            showStr: L('lht_timeLock')
                        });
                    } else {
                        txt.setString(X.STR(L('lht_levelLock'), G.gc.lhtcom.guanka[Number(node.id) - 1].name));
                    }
                }
            });
        },
        getStar: function (id) {
            var me = this;
            var starNum = 0;

            cc.each(G.gc.lhtcom.guanka[id].layerinfo, function (layer) {
                var arr = me.DATA.layerstar[layer] || [];
                starNum += arr.length;
            });

            return starNum;
        },
        getOpenCondById: function (id) {
            var me = this;
            var curConf = G.gc.lhtcom.guanka[id];
            id = Number(id) - 1;
            var conf = G.gc.lhtcom.guanka[id];
            if (!conf) return null;

            var dayBool = G.time >= X.getMonthEndTimeByDay(curConf.openday - 1);
            var lastLevelOverBool = true;
            for (var layer of conf.layerinfo) {
                if (!me.DATA.layerstar[layer]) {
                    lastLevelOverBool = false;
                    break;
                }
            }
            if (dayBool && lastLevelOverBool) return null;
            return {
                day: dayBool,
                level: lastLevelOverBool
            };
        },
        bindMove: function () {
            var me = this;
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();
            var bg = me.ui.finds('Image_1');

            innerContent.update = function(dt){
                // [0,-1350]
                //var myy = this.y-200;
                // img0_1.x = myx*0.58;
                // img0_2.x = myx*0.9;
                // img0_3.x = myx*0.7;
                // img1.x = myx*0.90;
                // img1_0.x = myx*0.9;
                //
                //
                // // img2_0.x = (this.x + img2_0_x);
                // // img2_1.x = (this.x + img2_1_x);
                // img3.x = myx*1.6;
                // img4 = myx*1.4;
                bg.y = C.WS.height / 2 + this.y * 0.1;
            };
            innerContent.scheduleUpdate();
        }
    });
    G.frame[ID] = new fun('lianhunta.json', ID);
})();