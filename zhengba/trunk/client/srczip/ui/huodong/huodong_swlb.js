/**
 * Created by LYF on 2019/8/8.
 */
(function () {
    //神威礼包
    G.class.huodong_swlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_swlb.json", null, {action: true});
        },
        initUi: function () {
            var me = this;

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: me._data.model || "6501a"
            });

            X.alignCenter(me.nodes.panel_jl, me._data.data.prize, {
                touch: true
            });

            if(me._data.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_cs.setString(X.moment(me._data.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_cs, me._data.etime, function () {
                    me.timeout = true;
                });
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_zzlbbtn.click(function () {
                G.event.once('paysuccess', function(arg) {
                    try {
                        arg && arg.success && G.frame.jiangli.data({
                            prize: me._data.data.prize
                        }).show();
                        me.refreshPanel();
                    } catch (e) {}
                });
                G.event.emit('doSDKPay', {
                    pid: me._data.data.proid,
                    logicProid: me._data.data.proid,
                    money: me._data.data.money * 100,
                });
            }, 3000);
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        setContents: function () {
            var me = this;
            var maxBuyNum = 1;

            me.nodes.btn_zzlbbtn.setEnableState(me.DATA.myinfo.val < maxBuyNum);
            me.nodes.txt_yuanshul.setString(me.DATA.myinfo.val < maxBuyNum ? me._data.data.money + L("YUAN") : L("YGM"));
            me.nodes.txt_yuanshul.setTextColor(cc.color(me.DATA.myinfo.val < maxBuyNum ? "#7b531a" : "#6c6c6c"));
        }
    });
})();