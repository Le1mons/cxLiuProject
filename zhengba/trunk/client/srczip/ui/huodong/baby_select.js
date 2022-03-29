/**
 * Created by  on 2019//.
 */
(function () {
    //挖宝-选择宝藏
    var ID = 'baby_select';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            me.step = me.data().step;
            me.hdid = me.data().hdid;
            me.id = G.frame.huodong_baby.DATA.myinfo.target;
            me.nodes.btn_3.show();
        },
        initUi: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;
            me.ui.finds("mask").setTouchEnabled(true);
            me.ui.finds("mask").click(function () {
                me.remove();
            });

            //预览
            me.nodes.btn_3.click(function () {
                if(me.item){
                    if(me.item.conf.usetype == 9){
                        G.frame.usebox.data(me.item.conf).show();
                    }else if(me.item.conf.usetype == 15){
                        G.frame.usebox_new.data(me.item).show();
                    } else {
                        G.frame.iteminfo.data(me.item).show();
                    }
                }else {
                    G.tip_NB.show(L("QXZYGMBJL"));
                }
            });

            //确定
            me.nodes.btn_2.click(function () {
                me.selectPrize(me.istouch,me.isOver,me.clickstep);
            })
        },
        onShow: function () {
            var me = this;
            me.nodes.listview.removeAllChildren();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var conf = JSON.parse(JSON.stringify(G.gc.wabao.target));
            var canPrize = [];
            var stepPrize = {};

            for (var id in conf) {
                var con = conf[id];
                con.id = id;
                if (con.step <= me.step) {
                    canPrize.push(con);
                } else {
                    if (!stepPrize[con.step]) stepPrize[con.step] = [];
                    stepPrize[con.step].push(con);
                }
            }
            me.addPrize(canPrize, true);
            var arr = Object.keys(stepPrize).sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });
            for (var index = 0; index < arr.length; index ++) {
                var step = arr[index];
                me.addTitle(step);
                me.addPrize(stepPrize[step]);
            }
        },
        addPrize: function (prize, isTouch) {
            var arr = [];
            var allArr = [];

            for (var index = 0; index < prize.length; index ++) {
                if (arr.length == 6) {
                    allArr.push(arr);
                    arr = [];
                }
                arr.push(prize[index]);
            }
            if (arr.length > 0) allArr.push(arr);

            for (var j = 0; j < allArr.length; j ++) {
                var data = allArr[j];
                var list = this.nodes.pan1.clone();
                list.show();
                this.setItem(list, data, isTouch);
                this.nodes.listview.pushBackCustomItem(list);
            }
        },
        addTitle: function (step) {
            var node = this.nodes.panel_diwz.clone();
            node.show();
            node.children[0].setString(step + L("XCKX"));
            node.children[0].setTextColor(cc.color("#f3b949"));
            this.nodes.listview.pushBackCustomItem(node);
        },
        setItem: function (ui, data, isTouch) {
            var me = this;
            X.autoInitUI(ui);
            for (var i = 0; i < data.length; i ++) {
                (function (i) {
                    var lay = ui.nodes["ico" + (i + 1)];
                    var prize = G.class.sitem(data[i].prize);
                    prize.id = data[i].id;
                    prize.setPosition(lay.width / 2, lay.height / 2);
                    lay.addChild(prize);

                    if (me.id == prize.id) {
                        prize.setOk(true);
                        me.item = prize;
                    }
                    var haveNum = data[i].num;
                    var useNum = G.frame.huodong_baby.DATA.myinfo.targetact[data[i].id] || 0;
                    prize.isOver = useNum >= haveNum;
                    prize.hasNum = prize.creatTextNode({x: 0.5, y: 0.5},
                        {x: 50, y: -22}, (haveNum - useNum) + "/" + haveNum, 18);
                    prize.setTouchEnabled(true);
                    prize.isTouch = isTouch;
                    prize.click(function (sender, type) {
                        // if (!isTouch) return G.tip_NB.show(X.STR(L("DDJCCKXZO"), data[i].step));
                        if (me.id == sender.id) return;
                        if (me.item) me.item.setOk(false);
                        // if (sender.isOver) return G.tip_NB.show(L("MBBZSLBZ"));
                        sender.setOk(true);
                        me.item = sender;
                        me.id = sender.id;
                        me.istouch = sender.isTouch;
                        me.isOver = sender.isOver;
                        me.clickstep = data[i].step;
                    });
                })(i);
            }
        },
        selectPrize:function(isTouch,isover,step){
            var me = this;
            if (!me.id) return G.tip_NB.show(L("QXZYGMBJL"));
            if (G.frame.huodong_baby.DATA.myinfo.target == me.id) return G.tip_NB.show(L("BKXZXTD"));
            if (!isTouch) return G.tip_NB.show(X.STR(L("DDJCCKXZO"), step));
            if (isover) return G.tip_NB.show(L("MBBZSLBZ"));
            me.ajax("huodong_use", [me.hdid,1,me.id], function (str, data) {
                if(data.s == 1){
                    me.remove();
                    if (!G.frame.huodong_baby.DATA.myinfo.target) {
                        G.frame.huodong_baby.getData(function () {
                            G.frame.huodong_baby.setAniState();
                            G.frame.huodong_baby.showFlyAni();
                        });
                    }else {
                        G.frame.huodong_baby.getData(function () {
                            G.frame.huodong_baby.setAniState();
                            G.frame.huodong_baby.showGridPrize();
                        });
                    }
                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('tanbao_xzbz.json', ID);
})();