/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //部落战旗-购买等级
    var ID = 'buluozhanqi_buylv';

    var fun = X.bUi.extend({
        showNum: 5,
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.panel_di.hide();
            me.nodes.panel_wp.setTouchEnabled(false);

            me.nodes.textfield_5.setTextHorizontalAlignment(1);
            me.nodes.textfield_5.setTextVerticalAlignment(1);

            X.setInput(me.nodes.textfield_5, function (sender) {
                var num = sender.getString();
                if(num <= 0) num = 1;
                if(num > me.maxLv) num = me.maxLv;

                me.buyLv = num;
                me.showBuyNum();
                me.getData();
            });
            
            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_jian.click(function () {
                if(me.buyLv <= 1) return;
                me.buyLv --;
                me.showBuyNum();
                me.getData();
            });

            me.nodes.btn_jia.click(function () {

                me.buyLv ++;
                me.showBuyNum();
                me.getData();
            });

            me.nodes.btn_confirm.click(function () {

                me.ajax("flag_upgrade", [parseInt(me.buyLv)], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "flag_upgrade"
                        });
                        me.remove();
                        G.frame.buluozhanqi.view.getData(function () {
                            G.frame.buluozhanqi.view.setUpLvInfo();
                            G.frame.buluozhanqi.view.setTable();
                        });

                        G.hongdian.getData("flag", 1, function () {
                            G.frame.buluozhanqi.checkRedPoint();
                        });
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;

            me.buyLv = 1;
            me.lv = me.data().lv;
            me.prize = me.data().prize;
            me.maxLv = Object.keys(me.prize).length - me.lv;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.getData();
            me.showBuyNum();
        },
        onHide: function () {
            var me = this;
        },
        getData: function () {
            var me = this;
            var base = [];
            var jinjie = [];
            var baseObj = {};
            var jinjieObj = {};

            for (var i = me.lv + 1; i <= me.lv + parseInt(me.buyLv); i ++) {
                if (me.prize[i]) {
                    for (var j in me.prize[i].base) {
                        base.push(me.prize[i].base[j]);
                    }
                    for (var k in me.prize[i].jinjie) {
                        jinjie.push(me.prize[i].jinjie[k]);
                    }
                } else break;
            }

            me.mergePrize(G.frame.buluozhanqi.DATA.jinjie ? [].concat(base, jinjie) : base, baseObj);
            me.mergePrize(jinjie, jinjieObj);

            me.base = [];
            me.jinjie = [];

            me.dismantlePrize(baseObj, me.base);
            me.dismantlePrize(jinjieObj, me.jinjie);

            me.setTable();
        },
        mergePrize: function (arr, obj) {

            for (var i = 0; i < arr.length; i ++) {
                var atn = arr[i];

                if(obj[atn.t]) obj[atn.t] += atn.n;
                else obj[atn.t] = atn.n;
            }
        },
        dismantlePrize: function (obj, arr) {

            for (var i in obj) {
                var atn = {};
                atn.a = G.gc.attricon[i] ? "attr" : "item";
                atn.t = i;
                atn.n = obj[i];

                arr.push(atn);
            }
        },
        integrationPrize: function(prize, arr) {
            var me = this;
            var data = [];

            for (var i = 0; i < prize.length; i ++) {
                data.push(prize[i]);
                if(data.length == me.showNum) {
                    arr.push(data);
                    data = [];
                }
            }
            if(data.length > 0) arr.push(data);
        },
        setTable: function () {
            var me = this;
            var base = [];
            var jinjie = [];

            me.nodes.listview.removeAllChildren();

            me.integrationPrize(me.base, base);
            me.integrationPrize(me.jinjie, jinjie);

            for (var i = 0; i < base.length; i ++) {
                me.initList(me.nodes.panel_wp.clone(), base[i]);
            }

            if(!G.frame.buluozhanqi.DATA.jinjie && jinjie.length > 0) {
                var txt = me.nodes.panel_di.clone();
                txt.show();
                me.nodes.listview.pushBackCustomItem(txt);

                for (var i = 0; i < jinjie.length; i ++) {
                    me.initList(me.nodes.panel_wp.clone(), jinjie[i]);
                }
            }
        },
        initList: function (list, prize) {
            var me = this;

            X.alignItems(list, prize, "left", {
                touch: true,
                mapItem: function (node) {
                    node.x -= 50;
                }
            });
            me.nodes.listview.pushBackCustomItem(list);
        },
        showBuyNum: function () {
            var me = this;

            me.nodes.txt_tsdjg.setString(X.STR(L("TSDJHDJL"), me.buyLv));
            me.nodes.textfield_5.setString(me.buyLv);
            me.nodes.txt_sl.setString(me.buyLv * G.gc.flag.base.upgrade_need[0].n);

            me.nodes.btn_jian.setEnableState(false);
            me.nodes.btn_jia.setEnableState(false);

            if(me.buyLv > 0) {
                me.nodes.btn_jian.setEnableState(true);
            }

            if(me.maxLv > me.buyLv) {
                me.nodes.btn_jia.setEnableState(true);
            }
        }
    });
    G.frame[ID] = new fun('buluozhanqi_gmdj.json', ID);
})();