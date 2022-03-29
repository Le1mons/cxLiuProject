/**
 * Created by LYF on 2019/7/26.
 */
(function () {
    //批量购买
    var ID = 'buying';

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
            var btnAdd = me.nodes.btn_2;
            var btnSub = me.nodes.btn_1;
            var btnAdds = me.nodes.btn_jia10;
            var btnSubs = me.nodes.btn_jian10;

            me.nodes.mask.click(function () {

                me.remove();
            });

            btnAdd.click(function () {

                me.countNum(1);
            });

            btnSub.click(function () {
                me.countNum(-1);
            });

            btnAdds.click(function () {
                me.countNum(10);
            });

            btnSubs.click(function () {
                me.countNum(-10);
            });

            me.nodes.btn_3.click(function () {

                me.DATA.callback && me.DATA.callback(me.curNum);
                me.remove();
            });

            me.nodes.panel_bg.setTouchEnabled(true);
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

            me.DATA = me.data() || {};
            var canBuyNum = me.getMaxNum();
            me.curNum = me.DATA.num || 1;
            me.maxNum = me.DATA.maxNum ?  (canBuyNum > me.DATA.maxNum ? me.DATA.maxNum : canBuyNum) : canBuyNum;
            me.setContents();
            if (me.DATA.btnTxt) me.nodes.btn_3.setTitleText(me.DATA.btnTxt);
        },
        onHide: function () {
            var me = this;
        },
        getMaxNum: function () {
            var me = this;
            var need = me.DATA.need;
            if (!cc.isObject(need[0])) return me.DATA.maxNum;

            // while (meet) {
            //     var isAllMeet = true;
            //     for (var i = 0; i < need.length; i ++) {
            //         if (G.class.getOwnNum(need[i].t, need[i].a) < need[i].n * maxNum) {
            //             isAllMeet = false;
            //             break;
            //         }
            //     }
            //     if (!isAllMeet) {
            //         meet = false;
            //     } else {
            //         maxNum ++;
            //     }
            // }
            var arr = [];
            cc.each(need, function (atn) {
                arr.push(parseInt(G.class.getOwnNum(atn.t, atn.a) / atn.n));
            });
            arr.sort(function (a, b) {
                return a < b ? -1 : 1;
            });
            return arr[0];
        },
        setContents: function () {
            var me = this;

            me.showNeed();
            me.showBuyNum();
            me.showBuyItem();
            me.setBaseInfo();
            me.setButtonState();

            me.ui.setTimeout(function(){
                G.guidevent.emit('alert_open_over');
            },500);
        },
        showBuyNum: function () {
            this.nodes.textfield_5.setString(this.curNum);
        },
        showBuyItem: function () {
            var me = this;

            X.alignCenter(me.nodes.panel_1, me.DATA.item, {
                touch: true
            });
        },
        showNeed: function () {
            var me = this;
            var nodeArr = [];
            var need = me.DATA.need;

            if (me.DATA.hideNeedNode) return;
            for (var i = 0; i < need.length; i ++) {

                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                list.show();
                X.render({
                    ico_tb1: function (node) {
                        if (need[i].t) {
                            node.loadTexture(G.class.getItemIco(need[i].t), 1);
                        } else {
                            node.hide();
                        }
                    },
                    text_1: function (node) {
                        node.setString('');
                        var color;
                        var num;
                        var curNum;
                        if (need[i].t) {
                            color = G.class.getOwnNum(need[i].t, need[i].a) < me.curNum * need[i].n ? "#ff4e4e" : "#ffffff";
                            num = X.fmtValue(G.class.getOwnNum(need[i].t, need[i].a));
                            curNum = X.fmtValue(me.curNum * need[i].n);
                        } else {
                            color = "#ffffff";
                            num = me.DATA.maxNum;
                            curNum = me.curNum;
                        }
                        var str = "<font color=" + color + ">" + num + "</font>/" + curNum;
                        var rh = X.setRichText({
                            parent: node,
                            str: str,
                            color: "#ffffff"
                        });
                        rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                    }
                }, list.nodes);
                nodeArr.push(list);
            }

            X.center(nodeArr, me.nodes.panel_hbrq);
        },
        setBaseInfo: function () {
            var me = this;
            var txtNum = me.nodes.textfield_5;

            txtNum.setTextHorizontalAlignment(1);
            txtNum.setTextVerticalAlignment(1);
            txtNum.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));

            X.setInput(txtNum, function () {
                var num = parseInt(txtNum.getString().trim());
                if (num > me.maxNum) num = me.maxNum;
                if (num < 1) num = 1;
                me.curNum = num;
                me.showNeed();
                me.showBuyNum();
                me.showBuyItem();
                me.setButtonState();
            });
        },
        setButtonState: function () {
            var me = this;
            var btnAdd = me.nodes.btn_2;
            var btnSub = me.nodes.btn_1;
            var btnAdds = me.nodes.btn_jia10;
            var btnSubs = me.nodes.btn_jian10;

            btnAdd.setEnableState(false);
            btnSub.setEnableState(false);
            btnAdds.setEnableState(false);
            btnSubs.setEnableState(false);

            if (me.curNum > 1) {
                btnSub.setEnableState(true);
                btnSubs.setEnableState(true);
            }

            if (me.curNum < me.maxNum) {
                btnAdd.setEnableState(true);
                btnAdds.setEnableState(true);
            }
        },
        countNum: function (num) {
            var me = this;

            if (num > 0) {
                if (me.curNum + num > me.maxNum) me.curNum += me.maxNum - me.curNum;
                else me.curNum += num;
            } else {
                if (me.curNum + num < 1) me.curNum -= me.curNum - 1;
                else me.curNum += num;
            }

            me.showNeed();
            me.showBuyNum();
            me.showBuyItem();
            me.setButtonState();
        }
    });
    G.frame[ID] = new fun('zhuangbei_tip6.json', ID);
})();