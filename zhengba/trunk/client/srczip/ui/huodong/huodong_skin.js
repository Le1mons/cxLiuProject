/**
 * Created by LYF on 2019/7/15.
 */
(function () {
    //皮肤
    G.class.huodong_skin = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_pifu.json", null, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.panel_pifu_bg.setBackGroundImage("img/pifu/huodong/img_pf_" + me._data.data.skinid + ".jpg");
            me.ui.finds("Image_1").loadTexture("img/pifu/intr/img_pf_" + me._data.data.skinid + ".png");

            if (me._data.data.skinid != "1108001") {
                X.setHeroModel({
                    parent: me.nodes.panel_js,
                    data: {},
                    model: me._data.data.skinid
                });
                me.nodes.img_pfdi2.show();
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L("TS41")
                }).show();
            });

            me.nodes.btn_lzb.click(function () {

                G.frame.skin_target.show();
            });

            me.nodes.btn_pfyl.click(function () {

                G.frame.skin_showmodel.data(me._data.data.skinid).show();
            });

            me.nodes.btn_szq.click(function () {


                G.event.once('paysuccess', function(arg) {
                    try {
                        G.event.emit('sdkevent',{
                            event:'activity',
                            data:{
                                joinActivityType:me._data.stype,
                                consume:[],
                                get:me._data.data.prize
                            }
                        });
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

            X.alignCenter(me.nodes.panel_jl, me._data.data.prize, {
                touch: true
            });

            me.refreshPanel();

            if(me._data.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_sjs.setString(X.moment(me._data.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_sjs, me._data.etime, function () {
                    me.timeout = true;
                })
            }
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

            me.nodes.btn_szq.setEnableState(me.DATA.myinfo.gotarr.length < 1);
            me.nodes.txt_szq.setString(me.DATA.myinfo.gotarr.length < 1 ? me._data.data.money + L("YUAN") : L("YGM"));
            me.nodes.txt_szq.setTextColor(cc.color(me.DATA.myinfo.gotarr.length < 1 ? "#7b531a" : "#6c6c6c"));
        }
    });
})();