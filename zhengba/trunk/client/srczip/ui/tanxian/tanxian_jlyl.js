/**
 * Created by LYF on 2019/4/24.
 */
(function () {
    //探险-奖励预览
    var ID = 'tanxian_jlyl';

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

            me.nodes.txt_djgb.setTouchEnabled(true);
            me.nodes.txt_djgb.click(function () {

                me.remove();
            });

            me.nodes.btn_lq1.show();
            me.nodes.btn_lq1.click(function () {
                G.ajax.send('tanxian_recpassprize',[me.DATA.idx],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        G.frame.jiangli.once("hide", function () {
                            me.setContents();
                            me.ui.setTimeout(function () {
                                G.guidevent.emit("prizeViewHideOver");
                            }, 300);
                        }).data({
                            prize:[].concat(d.d.prize)
                        }).show();
                        G.frame.tanxian.getData(function () {
                            G.frame.tanxian.setPrizeShow();
                            G.frame.tanxian.checkRedPoint();
                        });
                    }
                },true);
            });

            me.nodes.btn_lq2.click(function () {
                G.ajax.send('tanxian_recpassprize',[me.DATA.hhCon.idx],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        G.frame.jiangli.once("hide", function () {
                            me.setContents();
                        }).data({
                            prize:[].concat(d.d.prize)
                        }).show();
                        G.frame.tanxian.getData(function () {
                            G.frame.tanxian.setPrizeShow();
                            G.frame.tanxian.checkRedPoint();
                        });
                    }
                },true);
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            G.guidevent.emit('tanxianjiangliopenover');
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            X.alignItems(me.nodes.panel_wp1, me.DATA.prize[1], "left", {
                scale: .6,
                touch: true
            });

            X.alignItems(me.ui.finds("panel_wp2"), me.DATA.hhCon.con[1], "left", {
                scale: .6,
                touch: true
            });

            me.nodes.txt_gk1.setString(me.DATA.curMapId + "/" + me.DATA.prize[0] + L("GUAN"));
            me.nodes.txt_gk2.setString(me.DATA.curMapId + "/" + me.DATA.hhCon.con[0] + L("GUAN"));
            me.nodes.txt_gks2.setString(X.STR(L("TGXGKLQ"), me.DATA.hhCon.con[0]));

            if (me.DATA.curMapId >= me.DATA.prize[0] && me.DATA.state != "ok") {
                me.nodes.btn_lq1.setEnableState(true);
                me.nodes.btn_lq1.children[0].setTextColor(cc.color(G.gc.COLOR.n13));
            } else {
                if(me.DATA.state == "ok") {
                    me.nodes.img_ylq1.show();
                    me.nodes.btn_lq1.hide();
                }
                me.nodes.btn_lq1.setEnableState(false);
                me.nodes.btn_lq1.children[0].setTextColor(cc.color(G.gc.COLOR.n15));
            }

            if(me.DATA.curMapId >= me.DATA.hhCon.con[0] && !me.DATA.hhCon.lw) {
                me.nodes.txt_gks2.hide();
                me.nodes.img_ylq2.hide();
                me.nodes.btn_lq2.show();
                me.nodes.btn_lq2.setEnableState(true);
                me.nodes.btn_lq2.children[0].setTextColor(cc.color(G.gc.COLOR.n13));
            } else {
                me.nodes.txt_gks2.hide();
                me.nodes.btn_lq2.show();
                if(me.DATA.hhCon.lw) {
                    me.nodes.btn_lq2.hide();
                    me.nodes.img_ylq2.show();
                }
                me.nodes.btn_lq2.setEnableState(false);
                me.nodes.btn_lq2.children[0].setTextColor(cc.color(G.gc.COLOR.n15));
            }
        }
    });
    G.frame[ID] = new fun('tanxian_jlyl.json', ID);
})();