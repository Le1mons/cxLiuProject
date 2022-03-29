/**
 * Created by LYF on 2019/9/23.
 */
(function () {
    //爵位-特权礼包
    var ID = 'juewei_tqlb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_1.click(function () {
                me.ajax("title_getprize", [], function (str, data) {
                    if (data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'title_libao',
                            data:{
                                get:data.d.prize
                            }
                        });

                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();

                        G.frame.juewei.getBuyNum(function () {
                            me.setContents();
                        });
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("title", 1, function () {
                G.frame.juewei.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.chongzhihd.jueweilibao;

            for (var id in conf) {
                me.setItem(id, conf[id], id.split("_")[1]);
            }
            var conf1 = G.gc.jueweicom.libao;
            for (var id in conf1) {
                me.setItem1(id, conf1[id], id);
            }

            var isLq = G.frame.juewei.DATA.isprize == 1;
            me.nodes.btn_1.setEnableState(isLq);
            me.ui.finds("txt_sx2").setTextColor(cc.color(isLq ? "#2f5719" : "#6c6c6c"));
            me.ui.finds("txt_sx2").setString(isLq ? L("LQ") : L("YLQ"));
            me.nodes.img_bax.loadTexture("img/juewei/img_juewei_box" + (isLq ? '' : "_k") + ".png", 1);

            // me.nodes.panel_jmxg.setVisible(G.frame.juewei.DATA.jueweilibao_3 != 0);
            // me.nodes.txt_sz.setString(G.frame.juewei.DATA.jueweilibao_3 + L("tian"));
        },
        setItem: function (id, conf, index) {
            var me = this;

            X.alignItems(me.nodes["pb" + index], conf.prize, "left", {
                touch: true
            });

            me.nodes["vip" + index].setString(conf.intr);
            me.nodes["txt_zk" + index].setString((conf.ctype == "day" ? L("DAYBUY") : L("MONTHBUY")));
            me.nodes["txt_cis" + index].setString(G.frame.juewei.DATA[id] == 0 ? conf.btnshow : L("YGM"));
            me.nodes["but_jc" + index].click(function () {
                G.event.once('paysuccess', function(arg) {
                    arg && arg.success && G.frame.jiangli.data({
                        prize: conf.prize
                    }).show();

                    G.frame.juewei.getBuyNum(function () {
                        me.setContents();
                    });
                });

                G.event.emit('doSDKPay', {
                    pid: conf.chkkey,
                    logicProid: conf.chkkey,
                    money: conf.money,
                }, 5000);
            });

            me.nodes["but_jc" + index].setEnableState(G.frame.juewei.DATA[id] == 0);
            me.nodes["txt_cis" + index].setTextColor(cc.color(G.frame.juewei.DATA[id] == 0 ? "#7b531a" : "#6c6c6c"));
        },
        setItem1: function (id, conf, index) {
            var me = this;

            X.alignItems(me.nodes["pb" + index], conf.prize, "left", {
                touch: true
            });

            var d = G.frame.juewei.DATA.gift[id];
            me.nodes["vip" + index].setString(X.STR(conf.intr, conf.val, d == -1 ? conf.val : d, conf.val));
            me.nodes["but_jc" + index].setEnableState(d != -1 && d >= conf.val);
            me.nodes["txt_cis" + index].setTextColor(cc.color(d != -1 && d >= conf.val ? "#2f5719" : "#6c6c6c"));
            me.nodes["txt_cis" + index].setString(d == -1 ? L("YLQ") : L("LQ"));

            me.nodes["but_jc" + index].click(function () {
                me.ajax("title_libao", [id], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: conf.prize
                        }).show();

                        G.frame.juewei.getBuyNum(function () {
                            me.setContents();
                        });
                    }
                });
            }, 500);

            me.nodes["txt_zk" + index].setString(X.STR(conf.title, conf.num));
        }
    });
    G.frame[ID] = new fun('juewei_tqlb.json', ID);
})();