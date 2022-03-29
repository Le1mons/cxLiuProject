/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            var stime = G.DATA.asyncBtnsData.planttrees.stime;
            me.endTime = stime + X.getOpenTimeToNight(stime) + 6 * 24 * 3600;

            me.addAni('zhishujie_zsdh_tx', me.nodes.panel_zsdh);
            me.nodes.panel_zsdh.setTouchEnabled(true);
            me.nodes.panel_zsdh.click(function () {
                G.frame.zhishujie_duihuan.show();
            });

            X.setHeroModel({
                data: {},
                model: 'zhishujie_ruanni',
                parent: me.nodes.panel_zslb,
                noParentRemove: true,
                z: -1
            });
            me.nodes.panel_zslb.setTouchEnabled(true);
            me.nodes.panel_zslb.click(function () {
                if (G.time > me.endTime) {
                    return G.tip_NB.show(L("HDYJS"));
                }
                G.frame.zhishujie_libao.show();
            });

            me.addAni('zhishujie_zsyq_tx', me.nodes.panel_zsyq);
            me.nodes.panel_zsyq.setTouchEnabled(true);
            me.nodes.panel_zsyq.click(function () {
                G.frame.zhishujie_zsyq.show();
            });

            me.addAni('zhishujie_bzyq_tx', me.nodes.panel_bzyq);
            me.nodes.panel_bzyq.setTouchEnabled(true);
            me.nodes.panel_bzyq.click(function () {
                G.frame.zhishujie_bzyq.show();
            });

            me.addAni('zhishujie_lhzq_tx', me.nodes.panel_lhzq);
            me.nodes.panel_lhzq.setTouchEnabled(true);
            me.nodes.panel_lhzq.click(function () {
                G.frame.zhishujie_lhzq.show();
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            X.timeout(me.nodes.txt_cs, G.DATA.asyncBtnsData.planttrees.rtime, function () {
                me.nodes.txt_cs.setString(L("YJS"));
            }, null, {
                showDay: true
            });
        },
        addAni: function (json, node) {
            G.class.ani.show({
                z: -1,
                json: json,
                addTo: node,
                repeat: true,
                autoRemove: false
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.DATA = undefined;
            delete me.DATA;
            me.getData(function () {
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;

            G.frame.zhishujie_haoyou.DATA = undefined;
            delete G.frame.zhishujie_haoyou.DATA;
            me.action.play('wait', true);

            me.checkRedPoint();
        },
        getData: function (callback) {
            var me = this;

            if (me.DATA) {
                me.oldDATA = JSON.parse(JSON.stringify(me.DATA));
            }
            me.ajax('planttrees_open', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onHide: function () {
            G.hongdian.getData('planttrees', 1);
        },
        checkRedPoint: function () {
            var me = this;
            var redData = G.DATA.hongdian.planttrees;

            if (redData.accept || redData.gift || redData.fuli || redData.task) {
                G.setNewIcoImg(me.nodes.panel_zsyq.finds('Image_37_0'));
                me.nodes.panel_zsyq.finds('Image_37_0').redPoint.setPosition(128, 38);
            } else {
                G.removeNewIco(me.nodes.panel_zsyq.finds('Image_37_0'));
            }

            if (redData.commonprize) {
                G.setNewIcoImg(me.nodes.panel_lhzq.finds('Image_37'));
                me.nodes.panel_lhzq.finds('Image_37').redPoint.setPosition(128, 38);
            } else {
                G.removeNewIco(me.nodes.panel_lhzq.finds('Image_37'));
            }
        }
    });
    G.frame[ID] = new fun('zhishujie.json', ID);
})();