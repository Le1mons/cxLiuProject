(function () {
    var ID = 'szn_qdzk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.class.szn.getzouka();
            me.DATA = G.DATA.szn.zhouka;
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var day = me.getToday();
            X.alignItems(me.nodes.panel_wp, me.conf.arr[day], "center", {
                touch: true,
                scale: .8
            });
            if (me.DATA.buy) {
                me.nodes.zs_wz.setString(L("LQ"));
                me.nodes.zs_wz.setTextColor(cc.color(X.inArray(me.DATA.rec, me.DATA.getidx) ? "#6c6c6c" :"#2f5719" ))
                me.nodes.btn_lq.setTouchEnabled(!X.inArray(me.DATA.rec, me.DATA.getidx))
                me.nodes.btn_lq.setBright(!X.inArray(me.DATA.rec, me.DATA.getidx));
                me.nodes.btn_lq.click(function (sender) {
                    G.ajax.send('zhounian3_zhouka', [], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            me.DATA = d.d.myinfo.zhouka;
                            G.DATA.szn.zhouka = me.DATA;
                            G.frame.jiangli.data({
                                prize: d.d.prize
                            }).show();
                            me.setContents();
                        }
                    }, true);
                })
            } else {
                me.nodes.zs_wz.setString(X.STR(L('DOUBLE9'), me.conf.money / 100))
                me.nodes.btn_lq.click(function (sender) {
                    G.event.once('paysuccess', function (arg) {

                        G.frame.szn_main.getData(function () {
                            me.DATA =   G.DATA.szn.zhouka ;
                            me.setContents();
                        })
                    });
                    G.event.emit('doSDKPay', {
                        pid: me.conf.proid,
                        logicProid: me.conf.proid,
                        money: me.conf.money,
                    });
                })

            }
        },
        getToday: function () {
            var me = this;
            var stime = G.DATA.asyncBtnsData.zhounian3.stime;
            var day = parseInt((G.time - stime) / 3600 / 24);
            return day;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            });
            me.nodes.btn_yl.click(function (sender) {
                G.frame.szn_qdzk_jlyl.data(me.conf.arr).show();
            });
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_bjk.json', ID);
})();