/**
 * Created by LYF on 2019/8/8.
 */
(function () {
    //神威礼包
    G.class.huodong_thlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_thlb.json", null, {action: true});
        },
        initUi: function () {
            var me = this;

            X.setHeroModel({
                parent: me.nodes.panel_js,
                data: {},
                model: me._data.model || "6501a"
            });

            X.alignCenter(me.nodes.panel_jl, me._data.data.prize, {
                touch: true
            });

            X.timeCountPanel(me.nodes.txt_hfsj, me._data.etime, {
                str: "<font color=#fff8e1>剩余时间：</font>" + (me._data.etime - G.time > 24 * 3600 * 2 ? X.moment(me._data.etime - G.time) : "{1}")
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_szq.click(function () {
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
            G.event.emit('sdkevent',{
                event:'Superlibao',
                data:{
                    Click:1
                }
            });
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
            var maxBuyNum = me.DATA.info.maxnum;

            me.nodes.btn_szq.setEnableState(me.DATA.myinfo.val < maxBuyNum);
            me.nodes.txt_szq.setString(me.DATA.myinfo.val < maxBuyNum ? me._data.data.money + L("YUAN") : L("YGM"));
            me.nodes.txt_szq.setTextColor(cc.color(me.DATA.myinfo.val < maxBuyNum ? "#7b531a" : "#6c6c6c"));
            //剩余次数
            var rh = X.setRichText({
                str:X.STR(L("THLBSYCS"),maxBuyNum - me.DATA.myinfo.val),
                parent: me.nodes.txt_csxs,
                outline:"#000000",
                color:"#fff8e1",
                pos:{x:me.nodes.txt_csxs.width/2, y:me.nodes.txt_csxs.height/2},
                size:20,
            });
            rh.setAnchorPoint(0.5,0.5);
        }
    });
})();