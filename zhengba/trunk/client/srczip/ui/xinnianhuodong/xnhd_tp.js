/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_tp';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
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

            me.DATA = me.data() || {};
        },
        onShow: function () {
            var me = this;

            var canBuyNum = me.getMaxNum();
            me.curNum = me.DATA.num || 1;
            me.maxNum = me.DATA.maxNum ?  (canBuyNum > me.DATA.maxNum ? me.DATA.maxNum : canBuyNum) : canBuyNum;
            me.setContents();
        },
        getMaxNum: function () {
            var me = this;
            var need = me.DATA.need;
            if (!cc.isObject(need[0])) return me.DATA.maxNum;

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

            me.showBuyNum();
            me.setBaseInfo();
            me.setButtonState();
        },
        showBuyNum: function () {
            this.nodes.textfield_5.setString(this.curNum + '/' + X.fmtValue(this.maxNum));
        },
        setBaseInfo: function () {
            var me = this;
            var txtNum = me.nodes.textfield_5;

            txtNum.setTextHorizontalAlignment(1);
            txtNum.setTextVerticalAlignment(1);
            txtNum.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
            txtNum.setTouchEnabled(false);
            X.addTextFieldEvent(txtNum, {
                in: function () {
                    txtNum.setString('');
                },
                out: function () {
                    var num = parseInt(txtNum.getString().trim());
                    num = cc.isNumber(num) && num != NaN ? num : me.curNum;
                    if (num > me.maxNum) num = me.maxNum;
                    if (num < 1) num = 1;
                    me.curNum = num;
                    me.showBuyNum();
                    me.setButtonState();
                }
            });

            var data = G.frame.xnhd.DATA.myinfo;
            data.heronum[G.frame.xnhd.DATA.state] = data.heronum[G.frame.xnhd.DATA.state] || {};
            me.nodes.text_1.setString(X.STR(L('BLTP'), data.heronum[G.frame.xnhd.DATA.state][data.selecthid] || 0));

            var hero = G.class.shero(G.frame.xnhd.plObj[G.frame.xnhd.DATA.myinfo.selecthid]);
            hero.setPosition(me.nodes.panel_1.width / 2, me.nodes.panel_1.height / 2);
            me.nodes.panel_1.addChild(hero);
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

            me.showBuyNum();
            me.setButtonState();
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_tip_tp.json', ID);
})();