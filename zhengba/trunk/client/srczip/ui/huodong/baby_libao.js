/**
 * Created by wlx on 2019/12/17.
 */
(function () {
    //挖宝-礼包
    var ID = 'baby_libao';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = me.data();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var arr = [];
            var data = me.DATA;

            for (var pid in data.info.arr) {
                data.info.arr[pid].pid = pid;
                arr.push(data.info.arr[pid]);
            }
            arr.sort(function (a, b) {
                return a.unitPrice < b.unitPrice ? -1 : 1;
            });

            for (var i = 0; i < arr.length; i ++) {
                (function (index) {
                    var dd = arr[index];
                    var buyNum = data.myinfo.buynum[dd.pid] || 0;
                    me.nodes["txt_xgsl" + (index + 1)].setString(dd.num - buyNum);
                    X.alignItems(me.nodes["ico" + (index + 1)], dd.prize, "left", {
                        touch: true
                    });
                    me.nodes["txt_js" + (index + 1)].setString(dd.unitPrice / 100 + L("YUAN"));
                    me.nodes["btn_ys" + (index + 1)].setEnableState(dd.num - buyNum > 0);
                    me.nodes["btn_ys" + (index + 1)].show();
                    me.nodes["btn_ys" + (index + 1)].click(function () {
                        G.event.once('paysuccess', function (arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: dd.prize
                            }).show();
                            G.frame.huodong_baby.getData(function () {
                                me.DATA = G.frame.huodong_baby.DATA;
                                me.setContents();
                                G.frame.huodong_baby.showNeedNum();
                                G.hongdian.getData('xldx',1);
                            });
                        });
                        G.event.emit('doSDKPay', {
                            pid: dd.pid,
                            logicProid: dd.pid,
                            money: dd.unitPrice,
                        });
                    }, 1000);
                })(i);
            }
        }
    });
    G.frame[ID] = new fun('tanbao_xllb.json', ID);
})();