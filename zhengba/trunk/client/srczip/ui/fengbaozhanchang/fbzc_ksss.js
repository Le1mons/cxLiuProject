/**
 * Created by  on 2019/3/29.
 */
(function () {
    //风暴战场-快速搜索
    var ID = 'fbzc_ksss';

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
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send("storm_search", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        show : function(){
            var me = this;
            var _super = this._super;
            me.area = 1;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var colorConf = {
                1: "#E43333",
                2: "#FF6100",
                3: "#C428C4",
                4: "#1E90FF",
                5: "#008B00",
                6: "#585858",
                7: "#585858"
            };

            for (var i = 0; i < 7; i ++) {
                (function (index, type) {
                    var lay = me.nodes["p" + index];
                    var list = me.nodes.list_nr.clone();
                    X.autoInitUI(list);
                    list.type = type;
                    list.nodes.tubiao.loadTexture("img/fengbao/xiaofangzi_" + type + ".png");
                    list.nodes.wz_biaoti.setString(L("YS_" + type));
                    list.nodes.wz_biaoti.setTextColor(cc.color(colorConf[type]));
                    list.num = me.getFortressNum(type);
                    list.nodes.wz_gsz.setString(list.num + L("GE"));
                    if(type == 7 && list.num == 0) {
                        list.nodes.wz_gsz.hide();
                        list.finds("wz_sy").setString(L("YZL"));
                    }

                    list.setTouchEnabled(true);
                    list.click(function (sender) {
                        if(sender.num == 0) return;
                        me.jumpToFortress(sender.type);
                    });
                    list.show();
                    list.setPosition(lay.width / 2, lay.height / 2);
                    lay.addChild(list);
                })(i, i + 1);
            }
        },
        getFortressNum: function (type) {
            var me = this;
            var num = 0;
            var data = me.DATA.last;

            for (var i in data) {
                for (var j in data[i]) {
                    if(data[i][j] == type) num ++;
                }
            }

            return num;
        },
        jumpToFortress: function (type) {
            var me = this;
            var index = 0;
            var data = me.getArea(type);

            if(G.frame.fengbaozhanchang.area == data.area) {
                var fortressArr = G.frame.fengbaozhanchang.fortress;
                for (var i in fortressArr) {
                    if(fortressArr[i].type == type && !fortressArr[i].data) {
                        index = i * 1;
                        break;
                    }
                }
                me.ui.setTimeout(function () {
                    G.frame.fengbaozhanchang.fortress[index].nodes.tower.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    me.remove();
                }, 300);
            } else {
                G.frame.fengbaozhanchang.area = data.area * 1;
                G.frame.fengbaozhanchang.setBtnState();
                G.frame.fengbaozhanchang.getAreaData(function () {
                    G.frame.fengbaozhanchang.setFortress();
                    me.ui.setTimeout(function () {
                        var fortressArr = G.frame.fengbaozhanchang.fortress;
                        for (var i in fortressArr) {
                            if(fortressArr[i].type == type && !fortressArr[i].data) {
                                index = i * 1;
                                break;
                            }
                        }
                        G.frame.fengbaozhanchang.fortress[index].nodes.tower.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        me.remove();
                    }, 300);
                });
            }
        },
        getArea: function (type) {
            var obj = {};
            var me = this;
            var data = me.DATA.last;
            for (var i in data) {
                for (var j in data[i]) {
                    if(data[i][j] == type) {
                        obj.area = i;
                        obj.type = type;
                        return obj;
                    }
                }
            }
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang_kuaisusousuo.json', ID);
})();