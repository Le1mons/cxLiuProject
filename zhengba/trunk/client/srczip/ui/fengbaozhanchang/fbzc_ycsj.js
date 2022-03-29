/**
 * Created by LYF on 2019/3/30.
 */
(function () {
    //风暴战场-延长时间
    var ID = 'fbzc_ycsj';

    var fun = X.bUi.extend({
        extConf: {
            8: {
                txtColor: "#3b85d9",
                boxImg: "img/fengbaozhanchang/baoxiang_8xiaoshi.png"
            },
            12: {
                txtColor: "#c162e1",
                boxImg: "img/fengbaozhanchang/baoxiang_12xiaoshi.png"
            },
            24: {
                txtColor: "#e78e18",
                boxImg: "img/fengbaozhanchang/baoxiang_12xiaoshi.png"
            }
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn1_on.click(function () {
                var data = G.frame.fbzc_ysxq.DATA;
                me.ajax("storm_shop", ["time", {area: data.area, number: data.number}, me.hour], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "storm_shop",
                        });
                        G.frame.fengbaozhanchang.getData(function () {
                            G.frame.fengbaozhanchang.setMyFortress();
                            G.frame.fengbaozhanchang.showVigor();
                        });
                        G.frame.fengbaozhanchang.getAreaData(function () {
                            G.frame.fbzc_ysxq.setTime();
                        });
                        me.remove();
                    }
                });
            }, 1000);
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

            cc.enableScrollBar(me.nodes.listview);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var time = me.data();
          
            var btn = [];
            me.hour = 0;
            var conf={
                "4":3,
                "8":2,
                "12":1
            }
            var num = conf[time];
            var timehour = [24,12,8];

            for (var i = 0; i < num; i ++) {
                (function (index) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    list.show();
                    var hour = timehour[num-1-i];
                    var conf = G.gc.fbzc.base.timeneed[(hour - time) * 3600];
                    list.hour = (hour - time) * 3600;
                    list.nodes.txt_jn_name.setString(X.STR(L("YCZJXS"), hour));
                    list.nodes.txt_jn_name.setTextColor(cc.color(me.extConf[hour].txtColor));
                    list.nodes.img_bx.setBackGroundImage(me.extConf[hour].boxImg, 1);
                    list.nodes.wz_sz1.setString(conf.energy);
                    list.nodes.wz_sz2.setString(conf.item[0].n);
                    list.nodes.xh_ico1.setBackGroundImage("img/public/token/token_jl.png", 1);
                    list.nodes.xh_ico2.setBackGroundImage(G.class.getItemIco(conf.item[0].t), 1);
                    list.nodes.gou_gou.hide();
                    list.nodes.gou_gou.setTouchEnabled(false);
                    list.finds("Image_7").setTouchEnabled(true);
                    btn.push(list.finds("Image_7"));
                    list.show();
                    me.nodes.listview.pushBackCustomItem(list)
                })(i + 1);
            }

            for (var i in btn) {
                (function (img) {
                    img.click(function (sender) {
                        for (var j in btn) {
                            var img = btn[j];
                            img.getParent().nodes.gou_gou.hide();
                        }
                        sender.getParent().nodes.gou_gou.show();
                        me.hour = sender.parent.hour;
                    });
                })(btn[i]);
            }

            btn[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang_yanchangshijian.json', ID);
})();