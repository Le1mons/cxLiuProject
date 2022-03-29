(function(){
    var ID = 'double_cj';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_3.click(function () {
                me.ajax('double11_lottery', [G.frame.double_jiangchi.selectIndex, me.addNum], function (str, data) {
                    if (data.s == 1) {
                        G.frame.double_jiangchi.getData(function () {
                            G.frame.double_jiangchi.selectPrize(G.frame.double_jiangchi.selectIndex);
                            G.frame.double_jiangchi.showPrizeNum();
                        });
                        G.frame.double_jiangchi.showNeedNum();
                        G.hongdian.getData('double11', 1, function () {
                            G.frame.Double11.checkRedPoint();
                        });
                        me.remove();
                    }
                });
            });
            me.nodes.btn_1.click(function () {
                me.changeNum(-1);
            });
            me.nodes.btn_jian10.click(function () {
                me.changeNum(-10);
            });
            me.nodes.btn_2.click(function () {
                me.changeNum(1);
            });
            me.nodes.btn_jia10.click(function () {
                me.changeNum(10);
            });
            me.nodes.panel_bg.setTouchEnabled(true);
        },
        onShow: function () {
            var me = this;
            var num = G.frame.double_jiangchi.DATA.sum[G.frame.double_jiangchi.selectIndex] || 0;
            var conf = G.gc.double11.prizepool[G.frame.double_jiangchi.selectIndex];
            var cjNum = (parseInt(num / conf.jindu) + 1) * conf.jindu * (conf.modulus / 100);
            var pool = G.frame.double_jiangchi.DATA.v[G.frame.double_jiangchi.selectIndex] || {};

            X.render({
                text_1: X.STR(L('double_cjtitle'), conf.name || 'xx'),
                text_2: X.STR(L('double_jojoinNum'), pool[P.gud.uid] || 0, cjNum - (pool[P.gud.uid] || 0)),
                panel_1: function (node) {
                    X.alignCenter(node, [].concat(conf.prize[0], conf.prize[1]), {
                        touch: true
                    });
                }
            }, me.nodes);


            var hasNum = G.class.getOwnNum(G.gc.double11.poolneed[0].t, G.gc.double11.poolneed[0].a);
            me.addNum = 1;
            me.maxNum = cjNum - (pool[P.gud.uid] || 0);
            if (hasNum < me.maxNum) {
                me.maxNum = hasNum || 1;
            }
            me.showBuyNum();
            me.nodes.textfield_5.setTouchEnabled(false);
            me.setButtonState();
            me.nodes.textfield_5.setTextHorizontalAlignment(1);
            me.nodes.textfield_5.setTextVerticalAlignment(1);
        },
        changeNum: function (num) {
            if (num + this.addNum < 1) {
                this.addNum = 1;
            } else if (num + this.addNum > this.maxNum) {
                this.addNum = this.maxNum;
            } else {
                this.addNum += num;
            }
            this.showBuyNum();
            this.setButtonState();
        },
        setButtonState: function () {
            var me = this;

            me.nodes.btn_1.setEnableState(me.addNum > 1);
            me.nodes.btn_jian10.setEnableState(me.addNum > 1);
            me.nodes.btn_2.setEnableState(me.addNum < me.maxNum);
            me.nodes.btn_jia10.setEnableState(me.addNum < me.maxNum);
        },
        showBuyNum: function () {
            var me = this;
            var need = G.gc.double11.poolneed[0];
            me.nodes.ico_tb1.loadTexture(G.class.getItemIco(need.t), 1);
            me.nodes.textfield_5.setString(me.addNum);
            me.nodes.text_sz.setString(X.fmtValue(G.class.getOwnNum(need.t, need.a)) + '/' + X.fmtValue(me.addNum * need.n));
        }
    });
    G.frame[ID] = new fun("event_double11_xyjc_tip.json", ID);
})();