/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //财源广进
    G.class.huodong_cygj = X.bView.extend({
        interval: 40, //毫秒单位 数字发生变化的时间间隔 repeat * interval(毫秒)后轮到下一个文本数字
        repeat: 9, //数字变化次数
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_caiyuanguangjin.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_chb.click(function () {

                me.ajax("huodong_use", [me._data.hdid, 1, 0], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'activity',
                            data:{
                                joinActivityType:me._data.stype,
                                consume:[],
                                get:data.d.prize
                            }
                        });
                        me.getData(function () {
                            me.showRmbNum(true);
                        });
                        G.class.ani.show({
                            json: "ani_huodong_caiyuanguangjin",
                            addTo: G.frame.huodong.ui,
                            x: G.frame.huodong.ui.width / 2,
                            y: G.frame.huodong.ui.height / 2,
                            onend: function () {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                if(me._data.isqingdian){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                                me.showRmbMoney();
                                me.setButtonState();
                                me.showLog();
                            }
                        });
                    } else {
                        if(me._data.isqingdian){
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }
                    }
                });
            }, 2000);

            me.nodes.btn_qwcz.click(function () {
                G.frame.chongzhi.once("hide", function () {
                    me.refreshView();
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            me.refreshPanel();
            me.setBanner();
        },
        onRemove: function () {
            var me = this;
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
        refreshView: function() {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel:function (bool) {
            var me = this;
            me.getData(function(){
                me.setContents(bool);
            });
        },
        setContents: function (bool) {
            var me = this;

            me.showRmbNum();
            me.showRmbMoney(bool);
            me.setButtonState();
            me.showLog();
        },
        showRmbMoney: function () {
            var me = this;

            me.nodes.txt_zssl.setString(me.DATA.info.lessmoney);
            me.nodes.txt_czyuan.setString(me.DATA.myinfo.val);
        },
        setButtonState: function () {
            var me = this;

            if(me.DATA.myinfo.val >= me._data.data.price) {
                me.nodes.btn_qwcz.hide();
                me.nodes.btn_chb.show();

                if(me.DATA.myinfo.gotarr.length > 0) {
                    me.nodes.btn_chb.setEnableState(false);
                } else {
                    me.nodes.btn_chb.setEnableState(true);
                }
            } else {
                me.nodes.btn_qwcz.show();
                me.nodes.btn_chb.hide();
            }

            if(me.DATA.info.lessmoney <= 0) {
                me.nodes.btn_qwcz.setEnableState(false);
                me.nodes.btn_chb.setEnableState(false);
            }
        },
        showRmbNum: function (isAni) {
            var me = this;
            var arr = [];
            var txtNodes = [me.nodes.fnt_hb5, me.nodes.fnt_hb4, me.nodes.fnt_hb3, me.nodes.fnt_hb2, me.nodes.fnt_hb1];
            var num = me.DATA.myinfo.randmoney || 0;

            arr.push(num % 10);
            arr.push(num >= 10 ? parseInt(num / 10) % 10 : 0);
            arr.push(num >= 100 ? parseInt(num / 100) % 10 : 0);
            arr.push(num >= 1000 ? parseInt(num / 1000) % 10 : 0);
            arr.push(num >= 10000 ? parseInt(num / 10000) % 10 : 0);

            if(isAni) {
                for (var i = 0; i < arr.length; i ++) {
                    (function (val, txt, index) {
                        var start = 0;
                        var count = 0;
                        txt.setTimeout(function () {
                            txt.setString(start);
                            start ++;
                            count ++;
                            if(start > 9) start = 0;
                            if(count >= me.repeat + index * 6) {
                                txt.clearAllTimers();
                                txt.setString(val);
                            }
                        }, me.interval, me.repeat + index * 6);

                    })(arr[i], txtNodes[i], i);
                }
            } else {
                for (var i = 0; i < txtNodes.length; i ++) {
                    txtNodes[i].setString(arr[i] != undefined ? arr[i] : 0);
                }
            }
        },
        showLog: function () {
            var me = this;
            var log = me.DATA.info.log || [];

            me.nodes.listview.removeAllChildren();

            for (var i = 0; i < log.length; i ++) {
                var lay = me.nodes.zt1.clone();
                X.setRichText({
                    str: "<font color=#ff9a00>" + log[i].name + "</font>" +
                        "<font color=#ffc037>[" + log[i].svr_name + "]</font> " +
                        L("DKJRHB") + "<font color=#2fdc00>" + log[i].val + L("Z") + "</font>" +
                        L("JZSRPD"),
                    parent: lay,
                    anchor: {x: 0, y: 0.5},
                    pos: {x: 0, y: lay.height / 2},
                    color: "#ffffff"
                });
                me.nodes.listview.pushBackCustomItem(lay);
            }

            me.movePrize(log, me.nodes.listview);
        },
        movePrize: function (data, scrollView) {
            var me = this;
            if(data.length > 3) {
                scrollView.scrollToBottom(data.length - 3, false);
                me.ui.setTimeout(function () {
                    scrollView.jumpToTop();
                    me.movePrize(data, scrollView)
                }, (data.length - 3) * 1000);
            }
        },
        setBanner: function () {
            var me = this;

            me.ui.finds("wz1").show();
            me.ui.finds("wz1").setString(me._data.intr);
            X.render({
                txt_sj: function (node) {
                    if(me._data.etime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me._data.etime - G.time));
                    }else {
                        X.timeout(node, me._data.etime, function () {
                            me.timeout = true;
                        });
                    }
                },
            },me.nodes);
        }
    });
})();