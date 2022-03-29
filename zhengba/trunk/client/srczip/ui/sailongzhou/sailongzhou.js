/**
 * Created by
 */
(function () {
    //
    var ID = 'sailongzhou';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes=["jingjichang.png","jingjichang.plist"];
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_bz.show();
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS91")
                }).show();
            });
            if (G.time >= me.DATA.info.rtime && G.time < me.DATA.info.etime){
                X.timeout(me.nodes.txt_cs, me.DATA.info.etime, function () {
                    G.tip_NB.show(L('HUODONG_HD_OVER'));
                    me.remove();
                    G.view.mainView.getAysncBtnsData(function () {
                        G.view.mainView.allBtns["lefttop"] = [];
                        G.view.mainView.setSvrBtns();
                    }, false, ["longzhou"]);
                });
                me.ui.finds('Text_5').setString('兑换时间：');
            }else {
                var startime = X.timetostr(me.DATA.info.stime,"m.d");
                var rtime = X.timetostr(me.DATA.info.rtime,"m.d");
                me.nodes.txt_cs.setString(startime + '-' + rtime);
                me.ui.finds('Text_5').setString('活动时间：');
            }

        },
        bindBtn: function () {
            var me = this;
            //助威任务
            me.nodes.panel_zwrw.setTouchEnabled(true);
            me.nodes.panel_zwrw.click(function () {
                if (me.islast){
                    return G.tip_NB.show(L('slz_tip9'));
                }
                G.frame.sailongzhou_zwrw.show();
            });
            //助威礼包
            me.nodes.panel_zwlb.setTouchEnabled(true);
            me.nodes.panel_zwlb.click(function () {
                if (me.islast){
                    return G.tip_NB.show(L('slz_tip9'));
                }
                G.frame.sailongzhou_zwlb.show();
            });
            //赛龙舟
            me.nodes.panel_slz.setTouchEnabled(true);
            me.nodes.panel_slz.click(function () {
                if (me.islast){
                    return G.tip_NB.show(L('slz_tip9'));
                }
                G.frame.sailongzhou_slz.show();
            });
            //粽子商店
            me.nodes.panel_zzsd.setTouchEnabled(true);
            me.nodes.panel_zzsd.click(function () {
                G.frame.sailongzhou_zzsd.show();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
        },
        getData: function(callback) {
            var me = this;
            G.ajax.send("longzhou_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    X.cacheByUid('firstLoginLongzhouHd',1);
                    G.hongdian.getData('longzhou',1);
                    callback && callback();
                }
            })
        },
        show: function(){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onHide: function () {
            var me = this;
            me.changeToperAttr();
        },
        onAniShow: function () {
            // this.action.play('wait', true);
        },
        onShow: function () {
            var me = this;
            me.islast = false;
            me.getIsLastDay();
            me.bindBtn();
            me.setContents();
            me.checkRedPoint();
        },
        getIsLastDay:function(){
          var me = this;
          if (G.time >= me.DATA.info.rtime && G.time < me.DATA.info.etime){
              me.islast = true;
          }
        },
        setContents: function () {
            var me = this;
            // me.changeToperAttr({
            //     attr1: {a: "attr", t: "rmbmoney"},
            //     attr2: {a: 'item', t: '5082'}
            // });
            //dongxiao

            G.class.ani.show({
                json: "dw_rk_chuan",
                addTo: me.nodes.panel_slz,
                cache: true,
                x: me.nodes.panel_slz.width / 2,
                y: me.nodes.panel_slz.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play('wait', true);
                }
            });
            G.class.ani.show({
                json: "dw_rk_zzsd",
                addTo: me.nodes.panel_zzsd,
                cache: true,
                x: me.nodes.panel_zzsd.width / 2,
                y: me.nodes.panel_zzsd.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play('wait', true);
                }
            });
        },
        checkRedPoint:function () {
            var me = this;
            var hd = G.DATA.hongdian.longzhou;
            if (!hd) return;
            var tasknode = me.ui.finds('Panel_1').finds('Image_3');
            if (hd.task) {
                G.setNewIcoImg(tasknode);
                tasknode.finds('redPoint').setPosition(128,20);
            }else {
                G.removeNewIco(tasknode);
            }
            var duihuannode = me.ui.finds('Panel_3').finds('Image_3');
            if (hd.duihuan) {
                G.setNewIcoImg(duihuannode);
                duihuannode.finds('redPoint').setPosition(128,20);
            }else {
                G.removeNewIco(duihuannode);
            }
        }
    });
    G.frame[ID] = new fun('duanwu.json', ID);
})();