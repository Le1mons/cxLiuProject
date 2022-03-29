/**
 * Created by
 */
(function () {
    //
    var ID = 'yuanxiao';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.panel_qwdm.setTouchEnabled(true);
            me.nodes.panel_yxdh.setTouchEnabled(true);
            me.nodes.panel_yxlb.setTouchEnabled(true);

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.panel_qwdm.click(function () {
                G.frame.yuanxiao_dm.show();
            });
            me.nodes.panel_yxdh.click(function () {
                G.frame.yuanxiao_dh.show();
            });
            me.nodes.panel_yxlb.click(function () {
                G.frame.yuanxiao_lb.show();
            });
        },
        onShow: function () {
            var me = this;

            var etime = G.DATA.asyncBtnsData.riddles.etime;
            if(etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_sj.setString(X.moment(etime - G.time));
            }else {
                X.timeout(me.nodes.txt_sj, etime, function () {
                    me.eventEnd = true;
                });
            }
            me.checkRedPoint();
            me.action.play('wait', true);
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

            me.ajax('huodong_open', [G.DATA.asyncBtnsData.riddles.hdid], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        eventUse: function (args, callback) {
            var me = this;

            me.ajax('huodong_use', [].concat(G.DATA.asyncBtnsData.riddles.hdid, args), function (str, data) {
                if (data.s == 1) {
                    // me.DATA = data.d;
                    callback && callback(data.d);
                }
            });
        },
        onHide: function () {
            G.hongdian.getData('riddles', 1);
        },
        checkRedPoint: function () {
            var me = this;
            var data = me.DATA.myinfo;
            if (Object.keys(data.gotarr.riddle).length < data.topic.length) {
                G.setNewIcoImg(me.nodes.wz_qwdm);
                me.nodes.wz_qwdm.redPoint.setPosition(63, 181);
            } else {
                G.removeNewIco(me.nodes.wz_qwdm);
            }
        }
    });
    G.frame[ID] = new fun('yuanxiaodenghui.json', ID);
})();